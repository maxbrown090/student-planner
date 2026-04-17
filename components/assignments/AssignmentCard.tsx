'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Assignment } from '@/store/types'
import { useAppStore } from '@/store/useAppStore'
import { cn, getDueDateLabel, formatTime, CATEGORY_COLORS, PRIORITY_CONFIG } from '@/lib/utils'
import { generateTaskBreakdownMock } from '@/lib/ai-scheduler'
import { AddAssignmentModal } from './AddAssignmentModal'
import { AnimatedCheckbox } from '@/components/ui/AnimatedCheckbox'
import { useToast } from '@/components/ui/ToastProvider'
import { celebrateTask, celebrateAllDone } from '@/lib/confetti'
import { differenceInDays, parseISO } from 'date-fns'

interface Props {
  assignment: Assignment
  compact?: boolean
  onFocus?: (a: Assignment) => void
}

export function AssignmentCard({ assignment, compact, onFocus }: Props) {
  const { toggleAssignment, deleteAssignment, addSubtask, toggleSubtask, deleteSubtask, consumeAIUse, settings, assignments } = useAppStore()
  const toast = useToast()
  const [expanded, setExpanded] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [newSubtask, setNewSubtask] = useState('')
  const [generatingSubtasks, setGeneratingSubtasks] = useState(false)

  const due = getDueDateLabel(assignment.dueDate)
  const completedSubtasks = assignment.subtasks.filter((s) => s.completed).length
  const totalSubtasks = assignment.subtasks.length
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : assignment.completed ? 100 : 0
  const daysLeft = differenceInDays(parseISO(assignment.dueDate), new Date())
  const priorityConf = PRIORITY_CONFIG[assignment.priority]
  const catColor = CATEGORY_COLORS[assignment.category]

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newSubtask.trim()) {
      addSubtask(assignment.id, newSubtask.trim())
      setNewSubtask('')
    }
  }

  const handleToggle = () => {
    const willComplete = !assignment.completed
    toggleAssignment(assignment.id)
    if (willComplete) {
      celebrateTask()
      const remaining = assignments.filter(a => !a.completed && a.id !== assignment.id).length
      if (remaining === 0) {
        setTimeout(celebrateAllDone, 400)
        toast.success('All done! 🎉 Crushing it today.')
      } else {
        toast.success(`"${assignment.title}" complete! ${remaining} left.`)
      }
    }
  }

  const handleAIBreakdown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!consumeAIUse()) {
      toast.error('No AI credits left today. Upgrade to Pro for unlimited.')
      return
    }
    setGeneratingSubtasks(true)
    setTimeout(() => {
      const result = generateTaskBreakdownMock(assignment)
      result.subtasks.forEach((st) => addSubtask(assignment.id, st.title))
      setGeneratingSubtasks(false)
      setExpanded(true)
    }, 1200)
  }

  // ── Compact mode (dashboard) ──────────────────────────────────────────
  if (compact) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20, scale: 0.95 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className={cn(
          'flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer group',
          assignment.completed ? 'opacity-50' : ''
        )}
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          borderLeft: `3px solid ${catColor}`,
        }}
        whileHover={{ scale: 1.008 }}
        onClick={() => onFocus?.(assignment)}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <AnimatedCheckbox
            checked={assignment.completed}
            onChange={handleToggle}
            size={20}
            color={catColor}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-semibold truncate text-main', assignment.completed && 'line-through text-faint')}>
            {assignment.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn('text-xs font-semibold', due.color)}>{due.label}</span>
            <span className="text-faint text-xs">·</span>
            <span className="text-xs text-faint">{formatTime(assignment.estimatedMinutes)}</span>
          </div>
        </div>
        {onFocus && (
          <button
            onClick={(e) => { e.stopPropagation(); onFocus(assignment) }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold px-2 py-1 rounded-lg"
            style={{ background: 'rgba(124,59,255,0.1)', color: 'var(--primary)' }}
          >
            Focus
          </button>
        )}
      </motion.div>
    )
  }

  // ── Full card ─────────────────────────────────────────────────────────
  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: assignment.completed ? 0.55 : 1, y: 0 }}
        exit={{ opacity: 0, x: -24, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="rounded-2xl overflow-hidden"
        style={{ border: `1px solid var(--border)`, background: 'var(--surface)' }}
        whileHover={!assignment.completed ? { y: -2, boxShadow: '0 8px 28px rgba(124,59,255,0.1)' } : {}}
      >
        {/* Priority stripe */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${catColor}, ${catColor}80)` }} />

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <AnimatedCheckbox
                checked={assignment.completed}
                onChange={handleToggle}
                size={22}
                color={catColor}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={cn('font-bold text-main leading-tight', assignment.completed && 'line-through text-faint')}
                   style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {assignment.title}
                </p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {onFocus && !assignment.completed && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onFocus(assignment)}
                      className="px-2 py-1 rounded-lg text-xs font-bold"
                      style={{ background: 'rgba(124,59,255,0.1)', color: 'var(--primary)' }}
                    >
                      Focus
                    </motion.button>
                  )}
                  <button
                    onClick={() => setShowEdit(true)}
                    className="btn-icon w-7 h-7 text-faint"
                    style={{ background: 'transparent' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
                      <path d="M11.5 2.5a1.414 1.414 0 012 2L5 13l-3 1 1-3 8.5-8.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteAssignment(assignment.id)}
                    className="btn-icon w-7 h-7 text-faint"
                    style={{ background: 'transparent' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,71,87,0.08)'; e.currentTarget.style.color = '#FF4757' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '' }}
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
                      <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M13 4l-.867 9.143A2 2 0 0110.138 15H5.862a2 2 0 01-1.995-1.857L3 4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Meta chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="badge text-white text-2xs" style={{ background: catColor }}>
                  {assignment.subject}
                </span>
                <span className={cn('badge border text-2xs', priorityConf.bg, priorityConf.color)}>
                  {priorityConf.label}
                </span>
                <span className={cn('text-xs font-semibold', due.color)}>{due.label}</span>
                <span className="text-faint text-xs">·</span>
                <span className="text-xs text-faint">{formatTime(assignment.estimatedMinutes)}</span>
              </div>

              {/* Deadline countdown */}
              {!assignment.completed && daysLeft >= 0 && daysLeft <= 7 && (
                <div className="mt-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xs font-semibold text-faint uppercase tracking-wide">Deadline</span>
                    <span className="text-2xs font-bold" style={{ color: daysLeft <= 1 ? '#FF4757' : daysLeft <= 3 ? '#FFA040' : 'var(--primary)' }}>
                      {daysLeft === 0 ? 'Due today!' : `${daysLeft}d left`}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(4, ((7 - daysLeft) / 7) * 100)}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                      className="h-full rounded-full"
                      style={{ background: daysLeft <= 1 ? '#FF4757' : daysLeft <= 3 ? '#FFA040' : catColor }}
                    />
                  </div>
                </div>
              )}

              {/* Subtask progress */}
              {totalSubtasks > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                    <motion.div
                      animate={{ width: `${progress}%` }}
                      className="h-full rounded-full"
                      style={{ background: 'var(--primary)' }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                  <span className="text-2xs text-faint font-semibold">{completedSubtasks}/{totalSubtasks}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expand handle */}
        <div
          className="px-4 pb-3 flex items-center gap-2 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <motion.svg
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-faint"
          >
            <polyline points="4 6 8 10 12 6" />
          </motion.svg>
          <span className="text-xs text-faint font-medium">
            {totalSubtasks > 0 ? `${totalSubtasks} subtask${totalSubtasks > 1 ? 's' : ''}` : 'Subtasks'}
          </span>
          {!assignment.completed && totalSubtasks === 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAIBreakdown}
              className="ml-auto flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg"
              style={{ background: 'rgba(124,59,255,0.1)', color: 'var(--primary)' }}
            >
              {generatingSubtasks ? (
                <span className="animate-pulse">Generating…</span>
              ) : (
                <>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                    <polygon points="9 2 2 9 8 9 7 14 14 7 8 7 9 2" />
                  </svg>
                  AI Breakdown
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Subtasks expanded */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-1.5" style={{ borderTop: '1px solid var(--surface-2)' }}>
                <div className="pt-3 space-y-1.5">
                  <AnimatePresence>
                    {assignment.subtasks.map((st, i) => (
                      <motion.div
                        key={st.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-2.5 group"
                      >
                        <AnimatedCheckbox
                          checked={st.completed}
                          onChange={() => toggleSubtask(assignment.id, st.id)}
                          size={18}
                          color="#0DD9B8"
                        />
                        <span className={cn('text-sm flex-1 text-main', st.completed && 'line-through text-faint')}>
                          {st.title}
                        </span>
                        <button
                          onClick={() => deleteSubtask(assignment.id, st.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded text-faint hover:text-coral-500"
                        >
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                            <line x1="12" y1="4" x2="4" y2="12" /><line x1="4" y1="4" x2="12" y2="12" />
                          </svg>
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <form onSubmit={handleAddSubtask} className="flex gap-2 mt-2">
                  <input
                    className="input text-xs py-1.5 flex-1"
                    placeholder="Add subtask…"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                  />
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    className="btn-primary py-1.5 px-3 text-xs"
                  >
                    Add
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AddAssignmentModal open={showEdit} onClose={() => setShowEdit(false)} editAssignment={assignment} />
    </>
  )
}
