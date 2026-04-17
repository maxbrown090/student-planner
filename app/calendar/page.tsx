'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { format, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns'
import { WeekView } from '@/components/calendar/WeekView'
import { MonthView } from '@/components/calendar/MonthView'
import { EventModal } from '@/components/calendar/EventModal'
import { PlanMyDayModal } from '@/components/ai/PlanMyDayModal'
import { cn } from '@/lib/utils'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }

const LEGEND = [
  { label: 'School',    color: '#7C3BFF' },
  { label: 'Personal',  color: '#0DD9B8' },
  { label: 'Work',      color: '#3B82F6' },
  { label: 'Health',    color: '#22C55E' },
  { label: 'Social',    color: '#EC4899' },
  { label: 'Free Time', color: '#FFA040' },
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView]               = useState<'week' | 'month'>('week')
  const [showAdd, setShowAdd]         = useState(false)
  const [showPlan, setShowPlan]       = useState(false)

  const goBack    = () => setCurrentDate((d) => view === 'week' ? subWeeks(d, 1) : subMonths(d, 1))
  const goForward = () => setCurrentDate((d) => view === 'week' ? addWeeks(d, 1) : addMonths(d, 1))
  const goToday   = () => setCurrentDate(new Date())

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="text-sm text-faint mt-0.5">
            {view === 'week'
              ? `Week of ${format(currentDate, 'MMM d, yyyy')}`
              : format(currentDate, 'MMMM yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowPlan(true)} className="btn-primary text-sm">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <polygon points="9 2 2 9 8 9 7 14 14 7 8 7 9 2" />
            </svg>
            Plan Week
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowAdd(true)} className="btn-secondary text-sm">
            + Event
          </motion.button>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[goBack, undefined, goForward].map((fn, i) =>
            fn ? (
              <motion.button key={i} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                onClick={fn} className="btn-icon">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <polyline points={i === 0 ? '10 4 6 8 10 12' : '6 4 10 8 6 12'} />
                </svg>
              </motion.button>
            ) : (
              <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={goToday} className="btn-secondary text-sm px-3 py-1.5">
                Today
              </motion.button>
            )
          )}
        </div>

        <div className="flex items-center rounded-xl p-1 gap-0.5" style={{ background: 'var(--surface-2)' }}>
          {(['week', 'month'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all"
              style={view === v
                ? { background: 'var(--surface)', color: 'var(--text)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                : { color: 'var(--text-3)' }}
            >
              {v}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item}>
        {view === 'week' ? <WeekView currentDate={currentDate} /> : <MonthView currentDate={currentDate} />}
      </motion.div>

      {/* Legend */}
      <motion.div variants={item} className="flex flex-wrap gap-3">
        {LEGEND.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
            <span className="text-xs text-faint font-medium">{c.label}</span>
          </div>
        ))}
      </motion.div>

      <EventModal open={showAdd} onClose={() => setShowAdd(false)} />
      <PlanMyDayModal open={showPlan} onClose={() => setShowPlan(false)} />
    </motion.div>
  )
}
