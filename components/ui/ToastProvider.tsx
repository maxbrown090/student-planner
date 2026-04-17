'use client'
import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration: number
}

interface ToastCtx {
  toast:   (msg: string, type?: ToastType, duration?: number) => void
  success: (msg: string) => void
  error:   (msg: string) => void
  info:    (msg: string) => void
  warning: (msg: string) => void
}

const ToastContext = createContext<ToastCtx>({
  toast: () => {}, success: () => {}, error: () => {}, info: () => {}, warning: () => {},
})

export function useToast() {
  return useContext(ToastContext)
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
  warning: '⚠',
}

const STYLES: Record<ToastType, { bg: string; icon: string; bar: string }> = {
  success: { bg: 'rgba(13,217,184,0.12)',  icon: '#0DD9B8', bar: '#0DD9B8' },
  error:   { bg: 'rgba(255,71,87,0.12)',   icon: '#FF4757', bar: '#FF4757' },
  info:    { bg: 'rgba(124,59,255,0.12)',  icon: 'var(--primary)', bar: 'var(--primary)' },
  warning: { bg: 'rgba(255,160,64,0.12)',  icon: '#FFA040', bar: '#FFA040' },
}

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const style = STYLES[item.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      className="relative flex items-start gap-3 w-80 rounded-2xl px-4 py-3 overflow-hidden"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}
    >
      {/* Left color bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: style.bar }} />

      {/* Icon */}
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
        style={{ background: style.bg, color: style.icon }}
      >
        {ICONS[item.type]}
      </div>

      {/* Message */}
      <p className="text-sm font-medium text-main flex-1 leading-snug">{item.message}</p>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="text-faint hover:text-main transition-colors flex-shrink-0 mt-0.5"
      >
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
          <line x1="9" y1="3" x2="3" y2="9" /><line x1="3" y1="3" x2="9" y2="9" />
        </svg>
      </button>

      {/* Auto-dismiss progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 rounded-full"
        style={{ background: style.bar, opacity: 0.5 }}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: item.duration / 1000, ease: 'linear' }}
      />
    </motion.div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counterRef = useRef(0)

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = `toast-${++counterRef.current}`
    setToasts((t) => [...t.slice(-4), { id, message, type, duration }]) // max 5 toasts
    setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  const ctx: ToastCtx = {
    toast,
    success: (msg) => toast(msg, 'success'),
    error:   (msg) => toast(msg, 'error'),
    info:    (msg) => toast(msg, 'info'),
    warning: (msg) => toast(msg, 'warning'),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="sync">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <Toast item={t} onDismiss={() => dismiss(t.id)} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
