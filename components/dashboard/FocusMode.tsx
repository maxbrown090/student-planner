'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Assignment } from '@/store/types'
import { useAppStore } from '@/store/useAppStore'
import { formatTime } from '@/lib/utils'

interface Props {
  task: Assignment
  onClose: () => void
  onComplete: () => void
}

export function FocusMode({ task, onClose, onComplete }: Props) {
  const { toggleAssignment } = useAppStore()
  const [seconds, setSeconds] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<'work' | 'break'>('work')
  const WORK_SECS = 25 * 60
  const BREAK_SECS = 5 * 60

  const tick = useCallback(() => {
    setSeconds((s) => {
      if (s <= 1) {
        if (phase === 'work') {
          setPhase('break')
          return BREAK_SECS
        } else {
          setPhase('work')
          return WORK_SECS
        }
      }
      return s - 1
    })
  }, [phase])

  useEffect(() => {
    if (!running) return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [running, tick])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const total = phase === 'work' ? WORK_SECS : BREAK_SECS
  const progress = 1 - seconds / total
  const r = 90
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - progress)

  const handleComplete = () => {
    toggleAssignment(task.id)
    onComplete()
  }

  return (
    <AnimatePresence>
      <motion.div
        key="focus-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="focus-overlay"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative w-full max-w-sm mx-4 rounded-3xl p-8 text-center"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl transition-colors text-faint"
            style={{ background: 'var(--surface-2)' }}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <line x1="12" y1="4" x2="4" y2="12" />
              <line x1="4" y1="4" x2="12" y2="12" />
            </svg>
          </button>

          {/* Phase badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-5"
            style={
              phase === 'work'
                ? { background: 'rgba(124,59,255,0.12)', color: 'var(--primary)' }
                : { background: 'rgba(13,217,184,0.12)', color: '#0DD9B8' }
            }
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: phase === 'work' ? 'var(--primary)' : '#0DD9B8' }} />
            {phase === 'work' ? '🧠 Deep Work' : '☕ Short Break'}
          </div>

          {/* Task name */}
          <p className="font-bold text-xl text-main mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {task.title}
          </p>
          <p className="text-sm text-faint mb-8">{task.subject} · {formatTime(task.estimatedMinutes)}</p>

          {/* Timer ring */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <svg width={220} height={220}>
              <circle cx={110} cy={110} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={10} />
              <motion.circle
                cx={110} cy={110} r={r}
                fill="none"
                stroke={phase === 'work' ? 'var(--primary)' : 'var(--accent)'}
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                transform="rotate(-90 110 110)"
                transition={{ duration: 0.5, ease: 'linear' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span
                className="text-5xl font-black tabular-nums text-main"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
              <span className="text-xs text-faint mt-1 font-semibold uppercase tracking-wider">
                {phase === 'work' ? 'focus time' : 'break time'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setRunning(!running)}
              className="flex-1 py-3 rounded-2xl font-bold text-white text-base"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark, #5B21B6))', boxShadow: '0 4px 16px var(--primary-shadow, rgba(124,59,255,0.35))' }}
            >
              {running ? '⏸ Pause' : '▶ Start'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleComplete}
              className="flex-1 py-3 rounded-2xl font-bold text-ink-900"
              style={{ background: 'linear-gradient(135deg, #0DD9B8, #06C5A6)', boxShadow: '0 4px 14px rgba(13,217,184,0.3)' }}
            >
              ✓ Done!
            </motion.button>
          </div>

          <p className="text-xs text-faint mt-4">
            Press Start, put your phone away, and focus.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
