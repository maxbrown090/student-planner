'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type MoodLevel = 1 | 2 | 3 | 4 | 5

export const MOODS: Record<MoodLevel, { emoji: string; label: string; color: string; tip: string }> = {
  1: { emoji: '😴', label: 'Exhausted', color: '#5E5896', tip: 'Light tasks only. 3 short sessions, early evening off.' },
  2: { emoji: '😔', label: 'Low Energy', color: '#857FC4', tip: 'Easy wins first. Avoid anything requiring deep focus.' },
  3: { emoji: '😐', label: 'Okay',       color: '#FFA040', tip: 'Balanced day. Mix focused work with regular breaks.' },
  4: { emoji: '😊', label: 'Good',       color: '#0DD9B8', tip: 'Tackle medium-hard tasks. Good focus window today.' },
  5: { emoji: '🔥', label: 'On Fire',    color: 'var(--primary)', tip: 'This is your day. Hit the hardest tasks first.' },
}

interface Props {
  value: MoodLevel
  onChange: (m: MoodLevel) => void
  compact?: boolean
}

export function MoodSelector({ value, onChange, compact }: Props) {
  const current = MOODS[value]

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {([1, 2, 3, 4, 5] as MoodLevel[]).map((m) => (
          <motion.button
            key={m}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(m)}
            className="text-xl transition-all"
            style={{ opacity: value === m ? 1 : 0.35, filter: value === m ? 'none' : 'grayscale(60%)' }}
            title={MOODS[m].label}
          >
            {MOODS[m].emoji}
          </motion.button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {([1, 2, 3, 4, 5] as MoodLevel[]).map((m) => (
          <motion.button
            key={m}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(m)}
            className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all"
            style={
              value === m
                ? { background: `${MOODS[m].color}15`, borderColor: MOODS[m].color }
                : { background: 'var(--surface-2)', borderColor: 'transparent' }
            }
          >
            <span className="text-2xl">{MOODS[m].emoji}</span>
            <span className="text-2xs font-bold" style={{ color: value === m ? MOODS[m].color : 'var(--text-3)' }}>
              {MOODS[m].label}
            </span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs font-medium"
          style={{ background: `${current.color}12`, color: current.color }}
        >
          <span>💡</span>
          <span>{current.tip}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
