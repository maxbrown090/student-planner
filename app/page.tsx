'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { format } from 'date-fns'
import {
  cn, getDueDateLabel, formatTime, CATEGORY_COLORS,
  getMotivationMessage, PRIORITY_CONFIG
} from '@/lib/utils'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { PlanMyDayModal } from '@/components/ai/PlanMyDayModal'
import { AddAssignmentModal } from '@/components/assignments/AddAssignmentModal'
import { EventModal } from '@/components/calendar/EventModal'
import { AssignmentCard } from '@/components/assignments/AssignmentCard'
import { FocusMode } from '@/components/dashboard/FocusMode'
import { MoodSelector, MoodLevel } from '@/components/dashboard/MoodSelector'
import { EmptyState } from '@/components/ui/EmptyState'
import { Assignment } from '@/store/types'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 5)  return 'Burning the midnight oil'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

export default function DashboardPage() {
  const { assignments, events, generatedSchedules, settings, checkAndUpdateStreak } = useAppStore()
  const [showPlan, setShowPlan]         = useState(false)
  const [showAddTask, setShowAddTask]   = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [focusTask, setFocusTask]       = useState<Assignment | null>(null)
  const [mood, setMood]                 = useState<MoodLevel>(3)
  const [showMood, setShowMood]         = useState(false)

  useEffect(() => { checkAndUpdateStreak() }, [])

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayEvents = events.filter((e) => e.date === todayStr).sort((a, b) => a.startTime.localeCompare(b.startTime))
  const todaySchedule = generatedSchedules.find((s) => s.date === todayStr)

  // Normalize any stored dueDate to plain YYYY-MM-DD (handles ISO strings with time/timezone suffixes)
  const normDate = (d: string) => {
    if (!d) return ''
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d
    try { return format(new Date(d), 'yyyy-MM-dd') } catch { return d }
  }

  // Debug: log to console in development so we can see what's stored
  if (typeof window !== 'undefined') {
    console.log('[Tempo debug] todayStr:', todayStr)
    console.log('[Tempo debug] assignments:', assignments.map(a => ({
      title: a.title,
      dueDate: a.dueDate,
      normalized: normDate(a.dueDate),
      completed: a.completed,
      matchesToday: normDate(a.dueDate) === todayStr,
    })))
  }

  const overdue  = assignments.filter((a) => !a.completed && normDate(a.dueDate) < todayStr)
  const dueToday = assignments.filter((a) => !a.completed && normDate(a.dueDate) === todayStr)
  const dueSoon  = assignments.filter((a) => {
    if (a.completed) return false
    const nd = normDate(a.dueDate)
    if (nd <= todayStr) return false
    const days = Math.ceil((new Date(nd + 'T12:00:00').getTime() - Date.now()) / 86400000)
    return days > 0 && days <= 3
  })

  const urgent = [...overdue, ...dueToday].sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 }
    return p[a.priority] - p[b.priority]
  })

  const completedAll  = assignments.filter((a) => a.completed).length
  const completedPct  = assignments.length === 0 ? 0 : Math.round((completedAll / assignments.length) * 100)
  const nextTask      = urgent[0] ?? dueSoon[0]

  // "Fix My Day" — auto-reschedule overdue items to today
  const handleFixDay = () => {
    overdue.forEach((a) => {
      useAppStore.getState().updateAssignment(a.id, { dueDate: todayStr })
    })
  }

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <motion.div variants={item} className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-faint">{format(new Date(), 'EEEE, MMMM d')}</p>
            <h1
              className="text-3xl font-black text-main mt-0.5"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {getGreeting()}, {settings.name.split(' ')[0]} ✦
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {overdue.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFixDay}
                className="btn-secondary text-sm"
                style={{ color: '#FF4757', borderColor: 'rgba(255,71,87,0.3)' }}
              >
                🔧 Fix My Day
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 8px 28px rgba(124,59,255,0.5)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowPlan(true)}
              className="btn-primary text-sm"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <polygon points="9 2 2 9 8 9 7 14 14 7 8 7 9 2" />
              </svg>
              Plan My Day
            </motion.button>
          </div>
        </motion.div>

        {/* ── Stats Strip ──────────────────────────────────────────── */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label:   urgent.length === 0 ? 'All clear!' : overdue.length > 0 ? `${overdue.length} overdue` : 'Due today',
              value:   urgent.length,
              emoji:   urgent.length === 0 ? '✅' : overdue.length > 0 ? '⚠️' : '📅',
              sublabel: "Today's Focus",
              danger:  overdue.length > 0 && urgent.length > 0,
            },
            {
              label:   'Due soon',
              value:   dueSoon.length,
              emoji:   '⏰',
              sublabel: 'Next 3 days',
              danger:  false,
            },
            {
              label:   'Streak',
              value:   settings.streakCount,
              emoji:   settings.streakCount > 0 ? '🔥' : '💤',
              sublabel: 'Day streak',
              danger:  false,
            },
            {
              label:   'Done',
              value:   `${completedPct}%`,
              emoji:   '🎯',
              sublabel: 'Completed',
              danger:  false,
            },
          ].map((s) => (
            <motion.div
              key={s.sublabel}
              whileHover={{ y: -2, boxShadow: '0 8px 24px var(--primary-glow, rgba(124,59,255,0.1))' }}
              className="card p-4 flex items-center gap-3 cursor-default"
              style={s.danger ? { borderColor: 'rgba(255,71,87,0.25)', background: 'rgba(255,71,87,0.04)' } : {}}
            >
              <span className="text-2xl">{s.emoji}</span>
              <div>
                <p className="text-xl font-black text-main" style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: s.danger ? '#FF4757' : undefined,
                }}>
                  {s.value}
                </p>
                <p className="text-xs font-bold text-faint">{s.sublabel}</p>
                <p className="text-2xs text-faint">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Motivation + Mood ────────────────────────────────────── */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Motivation */}
          <div
            className="card p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, rgba(124,59,255,0.06) 0%, rgba(13,217,184,0.04) 100%)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'rgba(124,59,255,0.12)' }}
            >
              💬
            </div>
            <p className="text-sm font-semibold text-main">
              {getMotivationMessage(completedAll, urgent.length + completedAll)}
            </p>
          </div>

          {/* Mood */}
          <motion.div
            className="card p-4 cursor-pointer"
            onClick={() => setShowMood(!showMood)}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-faint uppercase tracking-wider">Today's Energy</p>
              <motion.svg
                animate={{ rotate: showMood ? 180 : 0 }}
                viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-faint"
              >
                <polyline points="4 6 8 10 12 6" />
              </motion.svg>
            </div>
            <MoodSelector value={mood} onChange={setMood} compact />
            <AnimatePresence>
              {showMood && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden mt-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoodSelector value={mood} onChange={(m) => { setMood(m); setShowMood(false) }} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* ── Main content ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Next task hero */}
            {nextTask && (
              <motion.div
                variants={item}
                className="card p-5 relative overflow-hidden"
                style={{ borderLeft: `4px solid ${CATEGORY_COLORS[nextTask.category]}` }}
                whileHover={{ y: -2 }}
              >
                {/* Subtle glow bg */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 0% 50%, ${CATEGORY_COLORS[nextTask.category]}08 0%, transparent 60%)` }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="section-title">⚡ Next Up</span>
                    <span className={cn('badge border text-2xs', PRIORITY_CONFIG[nextTask.priority].bg, PRIORITY_CONFIG[nextTask.priority].color)}>
                      {PRIORITY_CONFIG[nextTask.priority].label} priority
                    </span>
                  </div>
                  <p className="text-xl font-black text-main mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {nextTask.title}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-faint">{nextTask.subject}</span>
                    <span className="text-faint">·</span>
                    <span className={cn('text-sm font-bold', getDueDateLabel(nextTask.dueDate).color)}>
                      {getDueDateLabel(nextTask.dueDate).label}
                    </span>
                    <span className="text-faint">·</span>
                    <span className="text-sm text-faint">{formatTime(nextTask.estimatedMinutes)}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setFocusTask(nextTask)}
                      className="btn-primary text-sm"
                    >
                      ⚡ Enter Focus Mode
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => useAppStore.getState().toggleAssignment(nextTask.id)}
                      className="btn-secondary text-sm"
                    >
                      Mark Done
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Urgent tasks */}
            <motion.div variants={item}>
              <div className="flex items-center justify-between mb-3">
                <p className="section-title">
                  {urgent.length === 0
                    ? '📋 Today'
                    : overdue.length > 0 && dueToday.length > 0
                      ? `📋 Today — ${dueToday.length} due today, ${overdue.length} overdue`
                      : overdue.length > 0
                        ? `⚠️ Overdue (${overdue.length})`
                        : `📋 Due Today (${dueToday.length})`}
                </p>
                <button onClick={() => setShowAddTask(true)} className="btn-ghost text-xs px-2 py-1">
                  + Add task
                </button>
              </div>

              {urgent.length === 0 ? (
                <EmptyState
                  emoji={assignments.filter(a => !a.completed).length > 0 ? '📅' : '🎉'}
                  title={
                    assignments.filter(a => !a.completed).length > 0
                      ? `${assignments.filter(a => !a.completed).length} pending — none due today`
                      : "You're all caught up!"
                  }
                  description={
                    assignments.filter(a => !a.completed).length > 0
                      ? `Next up: ${normDate(assignments.filter(a => !a.completed).sort((a,b) => normDate(a.dueDate).localeCompare(normDate(b.dueDate)))[0]?.dueDate) || '—'}`
                      : 'No urgent tasks. Enjoy some free time or get ahead.'
                  }
                />
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {urgent.slice(0, 4).map((a) => (
                      <AssignmentCard key={a.id} assignment={a} compact onFocus={setFocusTask} />
                    ))}
                  </AnimatePresence>
                  {urgent.length > 4 && (
                    <p className="text-xs text-faint text-center pt-1">
                      +{urgent.length - 4} more · <a href="/assignments" className="text-primary font-semibold hover:underline">View all</a>
                    </p>
                  )}
                </div>
              )}
            </motion.div>

            {/* AI-generated schedule */}
            {todaySchedule && todaySchedule.scheduledBlocks.length > 0 && (
              <motion.div variants={item}>
                <p className="section-title mb-3">✨ AI Schedule — Today</p>
                <div className="card overflow-hidden">
                  {todaySchedule.scheduledBlocks.map((block, i) => (
                    <div
                      key={block.id}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: i < todaySchedule.scheduledBlocks.length - 1 ? '1px solid var(--border)' : 'none' }}
                    >
                      <span className="text-xs text-faint w-24 flex-shrink-0 font-mono">
                        {block.startTime}–{block.endTime}
                      </span>
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: CATEGORY_COLORS[block.category] }}
                      />
                      <span className="text-sm font-medium text-main flex-1">{block.title}</span>
                      <span className="text-2xs text-faint capitalize badge" style={{ background: 'var(--surface-2)' }}>
                        {block.type}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Right sidebar ──────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Progress */}
            <motion.div variants={item} className="card p-4 flex items-center gap-4">
              <ProgressRing progress={completedPct} size={64} strokeWidth={6} color="var(--primary)" bgColor="var(--surface-2)">
                <span className="text-xs font-black text-primary">{completedPct}%</span>
              </ProgressRing>
              <div>
                <p className="font-bold text-main" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {completedAll}/{assignments.length}
                </p>
                <p className="text-xs text-faint">tasks complete</p>
                {settings.streakCount > 0 && (
                  <p className="text-xs font-semibold mt-1" style={{ color: '#FFA040' }}>
                    🔥 {settings.streakCount} day streak
                  </p>
                )}
              </div>
            </motion.div>

            {/* Today's events */}
            <motion.div variants={item}>
              <div className="flex items-center justify-between mb-2">
                <p className="section-title">Today's Events</p>
                <button onClick={() => setShowAddEvent(true)} className="btn-ghost text-xs px-2 py-1">+ Add</button>
              </div>
              {todayEvents.length === 0 ? (
                <div className="card p-4 text-center">
                  <p className="text-xs text-faint">No events today</p>
                  <button onClick={() => setShowAddEvent(true)} className="text-xs font-semibold mt-1 text-primary hover:underline">
                    Add one
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayEvents.map((e) => (
                    <motion.div
                      key={e.id}
                      whileHover={{ x: 2 }}
                      className="card p-3 flex items-start gap-2.5"
                      style={{ borderLeft: `3px solid ${CATEGORY_COLORS[e.category]}` }}
                    >
                      <div>
                        <p className="text-sm font-semibold text-main">{e.title}</p>
                        <p className="text-xs text-faint mt-0.5">{e.startTime} – {e.endTime}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Coming up */}
            {dueSoon.length > 0 && (
              <motion.div variants={item}>
                <p className="section-title mb-2">Coming Up</p>
                <div className="space-y-2">
                  {dueSoon.slice(0, 3).map((a) => (
                    <motion.div
                      key={a.id}
                      whileHover={{ x: 2 }}
                      className="card p-3"
                    >
                      <p className="text-sm font-semibold text-main truncate">{a.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn('text-xs font-semibold', getDueDateLabel(a.dueDate).color)}>
                          {getDueDateLabel(a.dueDate).label}
                        </span>
                        <span className="text-faint text-xs">·</span>
                        <span className="text-xs text-faint">{formatTime(a.estimatedMinutes)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Floating add button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 20 }}
        whileHover={{ scale: 1.1, boxShadow: '0 8px 32px rgba(124,59,255,0.5)' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddTask(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl text-white text-2xl flex items-center justify-center z-30 shadow-lift"
        style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark, #5B21B6))' }}
        aria-label="Add task"
      >
        +
      </motion.button>

      {/* Modals */}
      <PlanMyDayModal open={showPlan} onClose={() => setShowPlan(false)} />
      <AddAssignmentModal open={showAddTask} onClose={() => setShowAddTask(false)} />
      <EventModal open={showAddEvent} onClose={() => setShowAddEvent(false)} defaultDate={todayStr} />

      {/* Focus Mode */}
      <AnimatePresence>
        {focusTask && (
          <FocusMode
            task={focusTask}
            onClose={() => setFocusTask(null)}
            onComplete={() => setFocusTask(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
