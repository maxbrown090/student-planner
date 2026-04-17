'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { useSocialStore } from '@/store/useSocialStore'
import { Logo } from '@/components/ui/Logo'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { SchoolType } from '@/store/types'

const STEP_COUNT = 3

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
}

export function OnboardingModal({ onComplete }: { onComplete: () => void }) {
  const { updateSettings, addAssignment } = useAppStore()
  const [step, setStep]   = useState(0)
  const [dir, setDir]     = useState(1)

  // Step 1 state
  const [name, setName]         = useState('')
  const [schoolType, setSchool] = useState<SchoolType>('high')

  // Step 2 state
  const [title, setTitle]       = useState('')
  const [subject, setSubject]   = useState('')
  const [dueDate, setDueDate]   = useState(format(addDays(new Date(), 2), 'yyyy-MM-dd'))
  const [skipAssignment, setSkip] = useState(false)

  const go = (next: number) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  const handleFinish = () => {
    // Save name + school
    updateSettings({
      name: name.trim() || 'Student',
      schoolType,
      hasOnboarded: true as any,
    })

    // Optionally save first assignment
    if (!skipAssignment && title.trim()) {
      addAssignment({
        title: title.trim(),
        subject: subject.trim() || 'General',
        dueDate,
        estimatedMinutes: 60,
        priority: 'medium',
        completed: false,
        subtasks: [],
        notes: '',
        category: 'school',
      })
    }
    onComplete()
  }

  const SCHOOL_OPTIONS: { value: SchoolType; label: string; emoji: string }[] = [
    { value: 'middle', label: 'Middle School', emoji: '📖' },
    { value: 'high',   label: 'High School',   emoji: '🎒' },
    { value: 'college', label: 'College',      emoji: '🎓' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,7,26,0.7)', backdropFilter: 'blur(12px)' }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="card w-full max-w-md overflow-hidden"
        style={{ boxShadow: '0 32px 96px rgba(0,0,0,0.4)' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <Logo size={28} showName />
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: STEP_COUNT }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ width: i === step ? 20 : 6, opacity: i === step ? 1 : 0.3 }}
                transition={{ duration: 0.25 }}
                className="h-1.5 rounded-full"
                style={{ background: 'var(--primary)' }}
              />
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="relative overflow-hidden" style={{ minHeight: 340 }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="absolute inset-0 p-6 flex flex-col"
            >
              {/* ── Step 0: Welcome ─────────────────────────────────── */}
              {step === 0 && (
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <div className="text-5xl mb-4">👋</div>
                    <h2 className="text-2xl font-black text-main mb-2"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Welcome to Tempo
                    </h2>
                    <p className="text-sm text-faint mb-6">
                      Your AI-powered planner for school, life, and everything in between. Let's get you set up in 60 seconds.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="label">What should we call you?</label>
                        <input
                          className="input text-sm"
                          placeholder="Your first name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && go(1)}
                        />
                      </div>

                      <div>
                        <label className="label">I am a...</label>
                        <div className="grid grid-cols-3 gap-2">
                          {SCHOOL_OPTIONS.map((o) => (
                            <button
                              key={o.value}
                              type="button"
                              onClick={() => setSchool(o.value)}
                              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all text-center"
                              style={schoolType === o.value
                                ? { borderColor: 'var(--primary)', background: 'rgba(124,59,255,0.08)' }
                                : { borderColor: 'var(--border)' }}
                            >
                              <span className="text-2xl">{o.emoji}</span>
                              <span className="text-xs font-bold text-faint">{o.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => go(1)}
                    className="btn-primary w-full justify-center mt-4"
                  >
                    Let's go →
                  </motion.button>
                </div>
              )}

              {/* ── Step 1: First Assignment ─────────────────────────── */}
              {step === 1 && (
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <div className="text-5xl mb-4">📚</div>
                    <h2 className="text-2xl font-black text-main mb-1"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Add your first assignment
                    </h2>
                    <p className="text-sm text-faint mb-6">
                      Got something due soon? Add it now so Tempo can help you plan.
                    </p>

                    {!skipAssignment ? (
                      <div className="space-y-3">
                        <div>
                          <label className="label">Assignment title</label>
                          <input className="input text-sm" placeholder="e.g. Chapter 5 Essay"
                            value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="label">Subject</label>
                            <input className="input text-sm" placeholder="e.g. English"
                              value={subject} onChange={(e) => setSubject(e.target.value)} />
                          </div>
                          <div>
                            <label className="label">Due date</label>
                            <input type="date" className="input text-sm"
                              value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                          </div>
                        </div>
                        <button
                          onClick={() => setSkip(true)}
                          className="text-xs text-faint hover:text-main transition-colors"
                        >
                          Skip for now →
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 py-8">
                        <div className="text-4xl">👍</div>
                        <p className="text-sm text-faint">No problem — you can add assignments anytime.</p>
                        <button onClick={() => setSkip(false)} className="text-xs font-semibold"
                          style={{ color: 'var(--primary)' }}>
                          Actually, I'll add one
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button onClick={() => go(0)} className="btn-secondary px-4">←</button>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => go(2)}
                      className="btn-primary flex-1 justify-center"
                      disabled={!skipAssignment && !title.trim()}
                    >
                      {skipAssignment || title.trim() ? 'Continue →' : 'Add a title to continue'}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Ready! ───────────────────────────────────── */}
              {step === 2 && (
                <div className="flex flex-col items-center text-center h-full">
                  <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
                      className="text-6xl"
                    >
                      🚀
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-black text-main"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        You're all set{name ? `, ${name.split(' ')[0]}` : ''}!
                      </h2>
                      <p className="text-sm text-faint mt-1">Here's how to get the most out of Tempo:</p>
                    </div>

                    <div className="w-full space-y-2.5 text-left">
                      {[
                        { icon: '⚡', tip: 'Hit "Plan My Day" to let AI schedule your week' },
                        { icon: '🎯', tip: 'Use Focus Mode to deep-work through assignments' },
                        { icon: '🌟', tip: 'Add big life goals to your Bucket List' },
                        { icon: '📊', tip: 'Track your grades in GPA Calculator (Pro)' },
                      ].map((t) => (
                        <div key={t.tip} className="flex items-start gap-3 p-3 rounded-xl"
                          style={{ background: 'var(--surface-2)' }}>
                          <span className="text-lg flex-shrink-0">{t.icon}</span>
                          <p className="text-xs font-medium text-main">{t.tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 w-full">
                    <button onClick={() => go(1)} className="btn-secondary px-4">←</button>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleFinish}
                      className="btn-primary flex-1 justify-center"
                    >
                      Start using Tempo 🎉
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
