'use client'
import { motion } from 'framer-motion'

interface Props {
  emoji: string
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ emoji, title, description, action }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-5xl mb-4"
      >
        {emoji}
      </motion.div>
      <p className="text-base font-bold text-main mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {title}
      </p>
      {description && (
        <p className="text-sm text-faint max-w-xs">{description}</p>
      )}
      {action && (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={action.onClick}
          className="btn-primary mt-5"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}
