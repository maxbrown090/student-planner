'use client'
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Modal({ open, onClose, title, children, size = 'md', className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const sizeClasses = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(8,7,26,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
        >
          <motion.div
            key="panel"
            initial={{ scale: 0.93, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className={cn('w-full rounded-2xl overflow-hidden', sizeClasses[size], className)}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
            }}
          >
            {title && (
              <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <h2 className="text-base font-bold text-main" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-faint transition-colors"
                  style={{ background: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <line x1="12" y1="4" x2="4" y2="12" />
                    <line x1="4" y1="4" x2="12" y2="12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="overflow-y-auto max-h-[82vh]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
