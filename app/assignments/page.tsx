'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { AssignmentCard } from '@/components/assignments/AssignmentCard'
import { AddAssignmentModal } from '@/components/assignments/AddAssignmentModal'
import { PlanMyDayModal } from '@/components/ai/PlanMyDayModal'
import { FocusMode } from '@/components/dashboard/FocusMode'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn, formatTime } from '@/lib/utils'
import { Assignment } from '@/store/types'
import { format } from 'date-fns'

type Filter = 'all' | 'pending' | 'completed' | 'overdue'
type SortBy  = 'dueDate' | 'priority' | 'estimatedTime'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } }

export default function AssignmentsPage() {
  const { assignments } = useAppStore()
  const [showAdd, setShowAdd]   = useState(false)
  const [showPlan, setShowPlan] = useState(false)
  const [focusTask, setFocusTask] = useState<Assignment | null>(null)
  const [filter, setFilter]     = useState<Filter>('pending')
  const [sortBy, setSortBy]     = useState<SortBy>('dueDate')
  const [search, setSearch]     = useState('')

  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const filtered = useMemo(() => {
    let list = [...assignments]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.subject.toLowerCase().includes(q))
    }
    switch (filter) {
      case 'pending':   list = list.filter((a) => !a.completed); break
      case 'completed': list = list.filter((a) => a.completed); break
      case 'overdue':   list = list.filter((a) => !a.completed && a.dueDate < todayStr); break
    }
    list.sort((a, b) => {
      if (sortBy === 'dueDate') return a.dueDate.localeCompare(b.dueDate)
      if (sortBy === 'priority') { const o = { high: 0, medium: 1, low: 2 }; return o[a.priority] - o[b.priority] }
      return a.estimatedMinutes - b.estimatedMinutes
    })
    return list
  }, [assignments, filter, sortBy, search])

  const pending   = assignments.filter((a) => !a.completed)
  const completed = assignments.filter((a) => a.completed)
  const overdue   = assignments.filter((a) => !a.completed && a.dueDate < todayStr)
  const totalWork = pending.reduce((s, a) => s + a.estimatedMinutes, 0)
  const pct       = assignments.length === 0 ? 0 : Math.round((completed.length / assignments.length) * 100)

  const FILTERS = [
    { value: 'all' as Filter,       label: 'All',      count: assignments.length },
    { value: 'pending' as Filter,   label: 'Pending',  count: pending.length },
    { value: 'completed' as Filter, label: 'Done',     count: completed.length },
    { value: 'overdue' as Filter,   label: 'Overdue',  count: overdue.length },
  ]

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Header */}
        <motion.div variants={item} className="flex items-start justify-between">
          <div>
            <h1 className="page-title">Assignments</h1>
            <p className="text-sm text-faint mt-0.5">
              {pending.length} pending
              {totalWork > 0 && ` · ~${formatTime(totalWork)} of work remaining`}
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowPlan(true)} className="btn-secondary text-sm">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <polygon points="9 2 2 9 8 9 7 14 14 7 8 7 9 2" />
              </svg>
              AI Plan
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowAdd(true)} className="btn-primary text-sm">
              + New
            </motion.button>
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div variants={item} className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-main">Overall Progress</span>
            <span className="text-sm font-black" style={{ color: 'var(--primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {pct}%
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-faint">
            <span>{completed.length} completed</span>
            {overdue.length > 0 && <span className="font-bold" style={{ color: '#FF4757' }}>{overdue.length} overdue</span>}
            <span>{pending.length} remaining</span>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center rounded-xl p-1 gap-0.5" style={{ background: 'var(--surface-2)' }}>
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5')}
                style={filter === f.value
                  ? { background: 'var(--surface)', color: 'var(--text)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                  : { color: 'var(--text-3)' }}
              >
                {f.label}
                {f.count > 0 && (
                  <span
                    className="w-4 h-4 rounded-full text-2xs flex items-center justify-center font-black"
                    style={f.value === 'overdue' && f.count > 0
                      ? { background: '#FF4757', color: 'white' }
                      : { background: 'var(--surface-3)', color: 'var(--text-2)' }}
                  >
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" />
              </svg>
              <input className="input pl-9" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="input w-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
              <option value="dueDate">Due date</option>
              <option value="priority">Priority</option>
              <option value="estimatedTime">Time</option>
            </select>
          </div>
        </motion.div>

        {/* List */}
        {filtered.length === 0 ? (
          <EmptyState
            emoji={filter === 'completed' ? '🎉' : filter === 'overdue' ? '🎊' : '📚'}
            title={
              filter === 'completed' ? 'Nothing completed yet' :
              filter === 'overdue'   ? 'No overdue work!' :
              search                 ? 'No results' :
              'No assignments yet'
            }
            description={!search && filter === 'pending' ? 'Add your first assignment to get started' : undefined}
            action={filter === 'pending' && !search ? { label: '+ Add Assignment', onClick: () => setShowAdd(true) } : undefined}
          />
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            <AnimatePresence>
              {filtered.map((a) => (
                <motion.div key={a.id} variants={item} layout>
                  <AssignmentCard assignment={a} onFocus={setFocusTask} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      <AddAssignmentModal open={showAdd} onClose={() => setShowAdd(false)} />
      <PlanMyDayModal open={showPlan} onClose={() => setShowPlan(false)} />
      <AnimatePresence>
        {focusTask && <FocusMode task={focusTask} onClose={() => setFocusTask(null)} onComplete={() => setFocusTask(null)} />}
      </AnimatePresence>
    </>
  )
}
