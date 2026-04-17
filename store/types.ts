export type Priority = 'low' | 'medium' | 'high'
export type EventCategory = 'school' | 'personal' | 'work' | 'health' | 'social' | 'free'
export type Plan = 'free' | 'pro'

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Assignment {
  id: string
  title: string
  subject: string
  dueDate: string          // ISO date string
  estimatedMinutes: number
  priority: Priority
  completed: boolean
  subtasks: Subtask[]
  notes: string
  category: EventCategory
}

export interface CalendarEvent {
  id: string
  title: string
  date: string             // ISO date string (YYYY-MM-DD)
  startTime: string        // "HH:MM"
  endTime: string          // "HH:MM"
  category: EventCategory
  color?: string
  isAIGenerated?: boolean
  assignmentId?: string    // links back to assignment if applicable
  notes?: string
}

export interface BucketItem {
  id: string
  title: string
  description: string
  category: 'travel' | 'experience' | 'skill' | 'social' | 'health' | 'career' | 'other'
  completed: boolean
  completedDate?: string
  scheduledDate?: string
  priority: 'dream' | 'soon' | 'someday'
  imageEmoji: string
}

export interface FreeTimeBlock {
  id: string
  label: string            // "Relax", "Gym", "Hang out"
  dayOfWeek: number        // 0 = Sun, 6 = Sat
  startTime: string
  endTime: string
  color: string
}

export interface UserSettings {
  name: string
  wakeTime: string         // "HH:MM"
  sleepTime: string        // "HH:MM"
  freeTimePerDayMinutes: number
  preferredFreeTimeSlots: string[]
  plan: Plan
  aiUsesRemaining: number  // resets daily; 3 for free, unlimited for pro
  aiUsesResetDate: string  // ISO date
  theme: 'default' | 'ocean' | 'forest' | 'sunset'
  notifications: boolean
  streakCount: number
  lastActiveDate: string
}

export interface DaySchedule {
  date: string
  scheduledBlocks: ScheduledBlock[]
}

export interface ScheduledBlock {
  id: string
  title: string
  startTime: string
  endTime: string
  type: 'assignment' | 'event' | 'free' | 'break'
  category: EventCategory
  assignmentId?: string
  priority?: Priority
}
