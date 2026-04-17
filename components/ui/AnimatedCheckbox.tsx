'use client'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  checked: boolean
  onChange: () => void
  size?: number
  color?: string
}

export function AnimatedCheckbox({ checked, onChange, size = 22, color }: Props) {
  // Read the CSS variable at render time so theme changes apply immediately
  const resolvedColor = color ?? (typeof window !== 'undefined'
    ? getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#7C3BFF'
    : '#7C3BFF')
  return (
    <button
      onClick={onChange}
      className="relative flex-shrink-0 focus:outline-none"
      style={{ width: size, height: size }}
      aria-checked={checked}
      role="checkbox"
    >
      {/* Expanding ring burst on check */}
      <AnimatePresence>
        {checked && (
          <motion.span
            key="ring"
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: 2.4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: `${resolvedColor}22`, border: `2px solid ${resolvedColor}44` }}
          />
        )}
      </AnimatePresence>

      {/* Circle */}
      <motion.div
        animate={checked
          ? { scale: [1, 1.18, 0.94, 1], backgroundColor: resolvedColor, borderColor: resolvedColor }
          : { scale: 1, backgroundColor: 'transparent', borderColor: '#C4BFEE' }
        }
        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        className="absolute inset-0 rounded-full border-2 flex items-center justify-center"
      >
        <AnimatePresence>
          {checked && (
            <motion.svg
              key="check"
              viewBox="0 0 12 10"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut', delay: 0.05 }}
              style={{ width: size * 0.52, height: size * 0.52 }}
            >
              <motion.path
                d="M1 5L4.5 8.5L11 1"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut', delay: 0.05 }}
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  )
}
