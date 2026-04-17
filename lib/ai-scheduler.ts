/**
 * AI Scheduler — generates optimized daily/weekly schedules.
 *
 * Architecture: The `buildSchedulePrompt` function creates a structured prompt
 * for Claude/GPT. The `parseAISchedule` function parses the JSON response.
 * In production, wire `generateSchedule` to your AI API endpoint.
 * In MVP mode, `generateScheduleMock` runs client-side logic.
 */

import {
  Assignment, CalendarEvent, FreeTimeBlock,
  DaySchedule, ScheduledBlock, UserSettings
} from '@/store/types'
import {
  addDays, format, parseISO, differenceInDays,
  startOfWeek, isBefore
} from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import { timeToMinutes, minutesToTime } from './utils'

// ─── Prompt Builder (for real AI API) ────────────────────────────────────────

export function buildSchedulePrompt(params: {
  assignments: Assignment[]
  events: CalendarEvent[]
  settings: UserSettings
  startDate: string
  days: number
}): string {
  const { assignments, events, settings, startDate, days } = params

  const pendingAssignments = assignments
    .filter((a) => !a.completed)
    .sort((a, b) => differenceInDays(parseISO(a.dueDate), parseISO(b.dueDate)))

  return `
You are a smart student scheduler. Generate an optimized ${days}-day schedule starting ${startDate}.

USER CONTEXT:
- Wake time: ${settings.wakeTime}
- Sleep time: ${settings.sleepTime}
- Desired free time per day: ${settings.freeTimePerDayMinutes} minutes
- Name: ${settings.name}

ASSIGNMENTS TO SCHEDULE (sorted by due date):
${pendingAssignments.map((a) => `
- "${a.title}" (${a.subject})
  Due: ${a.dueDate}
  Estimated: ${a.estimatedMinutes} minutes
  Priority: ${a.priority}
  Subtasks: ${a.subtasks.filter((s) => !s.completed).length} remaining
`).join('')}

EXISTING EVENTS (do not overlap):
${events.map((e) => `- ${e.date} ${e.startTime}-${e.endTime}: "${e.title}"`).join('\n')}

RULES:
1. Spread work over multiple days — don't cram everything near the deadline
2. Schedule high-priority items earlier in the day
3. Always include at least ${settings.freeTimePerDayMinutes} minutes of free time
4. Include 10-15 min breaks between study blocks
5. Don't schedule past sleep time or before wake time
6. For assignments due in 1 day, schedule today. For assignments due in 7+ days, spread across days.
7. Keep individual study blocks to 25-90 minutes (Pomodoro-friendly)

OUTPUT: Return ONLY valid JSON in this exact structure:
{
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "blocks": [
        {
          "title": "string",
          "startTime": "HH:MM",
          "endTime": "HH:MM",
          "type": "assignment|event|free|break",
          "category": "school|personal|work|health|social|free",
          "assignmentId": "string or null",
          "priority": "high|medium|low or null"
        }
      ]
    }
  ],
  "insights": {
    "totalStudyMinutes": number,
    "totalFreeMinutes": number,
    "busiestDay": "YYYY-MM-DD",
    "lightestDay": "YYYY-MM-DD",
    "tip": "One personalized scheduling tip"
  }
}
`.trim()
}

// ─── Mock Scheduler (MVP — no API needed) ────────────────────────────────────

interface AIScheduleResult {
  schedules: DaySchedule[]
  insights: {
    totalStudyMinutes: number
    totalFreeMinutes: number
    busiestDay: string
    lightestDay: string
    tip: string
  }
}

export function generateScheduleMock(params: {
  assignments: Assignment[]
  events: CalendarEvent[]
  freeTimeBlocks: FreeTimeBlock[]
  settings: UserSettings
  startDate: string
  days: number
}): AIScheduleResult {
  const { assignments, events, settings, startDate, days } = params

  const pending = assignments
    .filter((a) => !a.completed)
    .sort((a, b) => {
      const urgency = differenceInDays(parseISO(a.dueDate), parseISO(b.dueDate))
      if (urgency !== 0) return urgency
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

  const wakeMinutes = timeToMinutes(settings.wakeTime)
  const sleepMinutes = timeToMinutes(settings.sleepTime)
  const schedules: DaySchedule[] = []
  let totalStudy = 0
  let totalFree = 0
  let minBlocks = Infinity, maxBlocks = 0
  let busiestDay = startDate, lightestDay = startDate

  // Distribute assignment minutes across days
  const workloadMap: Record<string, number> = {}
  for (let i = 0; i < days; i++) {
    const d = format(addDays(parseISO(startDate), i), 'yyyy-MM-dd')
    workloadMap[d] = 0
  }

  // Assign each pending task to a day before its due date
  const taskQueue: Array<{ assignment: Assignment; minutesLeft: number }> = pending.map((a) => ({
    assignment: a,
    minutesLeft: a.estimatedMinutes,
  }))

  for (let i = 0; i < days; i++) {
    const date = format(addDays(parseISO(startDate), i), 'yyyy-MM-dd')
    const dayEvents = events.filter((e) => e.date === date)
    const blocks: ScheduledBlock[] = []

    // Add existing events first
    dayEvents.forEach((e) => {
      blocks.push({
        id: e.id,
        title: e.title,
        startTime: e.startTime,
        endTime: e.endTime,
        type: 'event',
        category: e.category,
      })
    })

    // Build occupied time ranges
    let cursor = wakeMinutes + 30 // Start 30 min after wake (morning buffer)
    const busySlots = dayEvents.map((e) => ({
      start: timeToMinutes(e.startTime),
      end: timeToMinutes(e.endTime),
    }))

    const skipToNextFree = (from: number, duration: number): number => {
      let start = from
      let limit = 0
      while (limit++ < 20) {
        const conflict = busySlots.find(
          (s) => start < s.end && start + duration > s.start
        )
        if (!conflict) return start
        start = conflict.end + 5
      }
      return -1 // No free slot found
    }

    // Schedule study blocks (max 3h study per day, 90min blocks)
    let studyMinutesToday = 0
    const MAX_STUDY = Math.min(240, (sleepMinutes - wakeMinutes) * 0.6)
    const BREAK = 10

    for (const task of taskQueue) {
      if (studyMinutesToday >= MAX_STUDY) break
      if (isBefore(parseISO(date), parseISO(startDate))) continue

      const daysUntilDue = differenceInDays(parseISO(task.assignment.dueDate), parseISO(date))
      if (daysUntilDue < 0) continue // past due

      // Only schedule if due soon or we have capacity
      const shouldScheduleToday =
        daysUntilDue <= 2 ||
        (daysUntilDue <= 5 && studyMinutesToday < MAX_STUDY / 2) ||
        (daysUntilDue <= days && studyMinutesToday < MAX_STUDY / 4)

      if (!shouldScheduleToday) continue

      const blockSize = Math.min(task.minutesLeft, 90, MAX_STUDY - studyMinutesToday)
      if (blockSize < 20) continue

      const slotStart = skipToNextFree(cursor, blockSize)
      if (slotStart === -1 || slotStart + blockSize > sleepMinutes - 30) continue

      blocks.push({
        id: uuidv4(),
        title: task.assignment.title,
        startTime: minutesToTime(slotStart),
        endTime: minutesToTime(slotStart + blockSize),
        type: 'assignment',
        category: task.assignment.category,
        assignmentId: task.assignment.id,
        priority: task.assignment.priority,
      })

      busySlots.push({ start: slotStart, end: slotStart + blockSize + BREAK })
      cursor = slotStart + blockSize + BREAK
      studyMinutesToday += blockSize
      task.minutesLeft -= blockSize
      totalStudy += blockSize

      if (task.minutesLeft <= 0) {
        taskQueue.splice(taskQueue.indexOf(task), 1)
      }
    }

    // Schedule free time block in the evening
    const freeStart = Math.max(cursor, sleepMinutes - 90)
    const freeSlot = skipToNextFree(freeStart, 60)
    if (freeSlot !== -1 && freeSlot + 60 <= sleepMinutes) {
      blocks.push({
        id: uuidv4(),
        title: 'Free Time',
        startTime: minutesToTime(freeSlot),
        endTime: minutesToTime(freeSlot + 60),
        type: 'free',
        category: 'free',
      })
      totalFree += 60
    }

    // Track busiest/lightest days
    const studyCount = blocks.filter((b) => b.type === 'assignment').length
    if (studyCount > maxBlocks) { maxBlocks = studyCount; busiestDay = date }
    if (studyCount < minBlocks) { minBlocks = studyCount; lightestDay = date }

    blocks.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
    schedules.push({ date, scheduledBlocks: blocks })
  }

  const tips = [
    "Start tomorrow's hardest task first thing — your focus is highest in the morning.",
    "Break large assignments into 25-min Pomodoro sessions for better focus.",
    "Keep your phone in another room during study blocks — it increases productivity by 26%.",
    "Schedule your free time deliberately — you'll actually enjoy it more.",
    "The two-minute rule: if it takes less than 2 minutes, do it now.",
  ]

  return {
    schedules,
    insights: {
      totalStudyMinutes: totalStudy,
      totalFreeMinutes: totalFree,
      busiestDay,
      lightestDay,
      tip: tips[Math.floor(Math.random() * tips.length)],
    },
  }
}

// ─── AI Task Breakdown (Pro feature) ─────────────────────────────────────────

export function buildTaskBreakdownPrompt(assignment: Assignment): string {
  return `
Break down this student assignment into 4-7 concrete subtasks:

Assignment: "${assignment.title}"
Subject: ${assignment.subject}
Due: ${assignment.dueDate}
Estimated total time: ${assignment.estimatedMinutes} minutes
Priority: ${assignment.priority}

Return ONLY valid JSON:
{
  "subtasks": [
    { "title": "string", "estimatedMinutes": number }
  ],
  "firstStep": "The single most important thing to start with"
}
`.trim()
}

export function generateTaskBreakdownMock(assignment: Assignment): {
  subtasks: { title: string; estimatedMinutes: number }[]
  firstStep: string
} {
  const totalMinutes = assignment.estimatedMinutes
  const subject = assignment.subject.toLowerCase()

  // Generate contextual subtasks based on subject type
  let steps: { title: string; fraction: number }[] = []

  if (subject.includes('essay') || subject.includes('english') || subject.includes('writing')) {
    steps = [
      { title: 'Brainstorm ideas and thesis statement', fraction: 0.1 },
      { title: 'Create outline with main points', fraction: 0.1 },
      { title: 'Write introduction', fraction: 0.1 },
      { title: 'Write body paragraphs', fraction: 0.45 },
      { title: 'Write conclusion', fraction: 0.1 },
      { title: 'Proofread and revise', fraction: 0.15 },
    ]
  } else if (subject.includes('math') || subject.includes('calc') || subject.includes('stat')) {
    steps = [
      { title: 'Review relevant formulas and concepts', fraction: 0.15 },
      { title: 'Work through example problems', fraction: 0.25 },
      { title: 'Complete first half of problems', fraction: 0.3 },
      { title: 'Complete second half of problems', fraction: 0.2 },
      { title: 'Check work and correct mistakes', fraction: 0.1 },
    ]
  } else if (subject.includes('lab') || subject.includes('science') || subject.includes('report')) {
    steps = [
      { title: 'Review lab data and notes', fraction: 0.15 },
      { title: 'Write introduction and background', fraction: 0.15 },
      { title: 'Document methods and materials', fraction: 0.15 },
      { title: 'Analyze results and create figures', fraction: 0.25 },
      { title: 'Write discussion and conclusion', fraction: 0.2 },
      { title: 'Format references and citations', fraction: 0.1 },
    ]
  } else {
    steps = [
      { title: 'Research and gather resources', fraction: 0.2 },
      { title: 'Create a plan and outline', fraction: 0.1 },
      { title: 'Complete first section', fraction: 0.25 },
      { title: 'Complete second section', fraction: 0.25 },
      { title: 'Review and finalize', fraction: 0.2 },
    ]
  }

  return {
    subtasks: steps.map((s) => ({
      title: s.title,
      estimatedMinutes: Math.round(totalMinutes * s.fraction),
    })),
    firstStep: steps[0].title,
  }
}
