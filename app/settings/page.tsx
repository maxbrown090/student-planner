'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { useTheme } from '@/components/providers/ThemeProvider'
import { cn, formatTime } from '@/lib/utils'
import { UserSettings } from '@/store/types'

const THEMES = [
  { value: 'default', label: 'Tempo',   grad: 'from-tempo-500 to-violet-600' },
  { value: 'ocean',   label: 'Ocean',   grad: 'from-blue-400 to-teal-500' },
  { value: 'forest',  label: 'Forest',  grad: 'from-green-400 to-emerald-600' },
  { value: 'sunset',  label: 'Sunset',  grad: 'from-orange-400 to-pink-500' },
]

const PRO_FEATURES = [
  { icon: '🤖', title: 'Unlimited AI Scheduling',    desc: 'Plan as many times as you want, every day.' },
  { icon: '🔄', title: 'Smart Auto-Rescheduling',    desc: 'When life changes, your schedule adapts.' },
  { icon: '📊', title: 'Advanced Analytics',          desc: 'Productivity trends and time-spent insights.' },
  { icon: '🧩', title: 'AI Task Breakdown',           desc: 'Turn big assignments into bite-sized steps.' },
  { icon: '🎨', title: 'Custom Themes',               desc: 'Ocean, Forest, Sunset — your style, your rules.' },
  { icon: '📅', title: 'Google Calendar Sync',        desc: 'Two-way sync with your existing calendar.' },
  { icon: '🔔', title: 'Smart Reminders',             desc: 'Context-aware nudges, not just alarms.' },
  { icon: '🎯', title: 'Weekly & Monthly Goals',      desc: 'Plan beyond tomorrow.' },
]

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <motion.button
      onClick={onChange}
      className="relative w-12 h-6 rounded-full flex-shrink-0"
      animate={{ backgroundColor: on ? 'var(--primary)' : 'var(--surface-3)' }}
      transition={{ duration: 0.2 }}
      role="switch"
      aria-checked={on}
    >
      <motion.span
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
        animate={{ x: on ? 26 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  )
}

export default function SettingsPage() {
  const { settings, updateSettings } = useAppStore()
  const { theme, toggle: toggleTheme } = useTheme()
  const [tab, setTab] = useState<'general' | 'schedule' | 'billing'>('general')
  const [saved, setSaved] = useState(false)

  const save = (updates: Partial<UserSettings>) => {
    updateSettings(updates)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-2xl">
      <motion.div variants={item}>
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-faint mt-0.5">Customize your Tempo experience</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex items-center rounded-xl p-1 gap-0.5 w-fit" style={{ background: 'var(--surface-2)' }}>
        {(['general', 'schedule', 'billing'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all"
            style={tab === t
              ? { background: 'var(--surface)', color: 'var(--text)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
              : { color: 'var(--text-3)' }}
          >
            {t}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {tab === 'general' && (
          <motion.div key="general" variants={container} initial="hidden" animate="show" className="space-y-4">
            <motion.div variants={item} className="card p-5 space-y-4">
              <h2 className="text-sm font-bold text-main">Profile</h2>
              <div>
                <label className="label">Your Name</label>
                <input className="input" value={settings.name}
                  onChange={(e) => save({ name: e.target.value })} placeholder="Enter your name" />
              </div>
            </motion.div>

            <motion.div variants={item} className="card p-5 space-y-4">
              <h2 className="text-sm font-bold text-main">Appearance</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-main">Dark Mode</p>
                  <p className="text-xs text-faint">Easy on the eyes at night</p>
                </div>
                <Toggle on={theme === 'dark'} onChange={toggleTheme} />
              </div>

              {settings.plan === 'pro' ? (
                <div>
                  <label className="label">Color Theme</label>
                  <div className="grid grid-cols-4 gap-2">
                    {THEMES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => save({ theme: t.value as UserSettings['theme'] })}
                        className="p-3 rounded-2xl border-2 transition-all text-center"
                        style={settings.theme === t.value
                          ? { borderColor: 'var(--primary)', background: 'var(--surface-2)', boxShadow: '0 0 0 1px var(--primary)' }
                          : { borderColor: 'var(--border)' }}
                      >
                        <div className={cn('w-full h-7 rounded-xl bg-gradient-to-r mb-2', t.grad)} />
                        <p className="text-xs font-semibold text-faint">{t.label}</p>
                        {settings.theme === t.value && (
                          <p className="text-2xs font-bold" style={{ color: 'var(--primary)' }}>Active</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="label">Color Theme</label>
                  <div className="grid grid-cols-4 gap-2">
                    {THEMES.map((t) => (
                      <div
                        key={t.value}
                        className="p-3 rounded-2xl border-2 text-center opacity-50 cursor-not-allowed"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <div className={cn('w-full h-7 rounded-xl bg-gradient-to-r mb-2', t.grad)} />
                        <p className="text-xs font-semibold text-faint">{t.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-faint mt-2">
                    🔒 Unlock themes with{' '}
                    <button onClick={() => setTab('billing')} className="font-bold" style={{ color: 'var(--primary)' }}>
                      Pro
                    </button>
                  </p>
                </div>
              )}
            </motion.div>

            <motion.div variants={item} className="card p-5 space-y-4">
              <h2 className="text-sm font-bold text-main">Notifications</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-main">Enable Reminders</p>
                  <p className="text-xs text-faint">Deadline nudges and check-in alerts</p>
                </div>
                <Toggle on={settings.notifications} onChange={() => save({ notifications: !settings.notifications })} />
              </div>
            </motion.div>

            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 p-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(13,217,184,0.1)', color: '#0DD9B8', border: '1px solid rgba(13,217,184,0.2)' }}
                >
                  ✓ Saved
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {tab === 'schedule' && (
          <motion.div key="schedule" variants={container} initial="hidden" animate="show" className="space-y-4">
            <motion.div variants={item} className="card p-5 space-y-4">
              <h2 className="text-sm font-bold text-main">Daily Hours</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Wake Time</label>
                  <input type="time" className="input" value={settings.wakeTime}
                    onChange={(e) => save({ wakeTime: e.target.value })} />
                </div>
                <div>
                  <label className="label">Sleep Time</label>
                  <input type="time" className="input" value={settings.sleepTime}
                    onChange={(e) => save({ sleepTime: e.target.value })} />
                </div>
              </div>
            </motion.div>

            <motion.div variants={item} className="card p-5 space-y-4">
              <h2 className="text-sm font-bold text-main">Free Time Goal</h2>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="label mb-0">Per day target</label>
                  <span className="text-sm font-black text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {formatTime(settings.freeTimePerDayMinutes)}
                  </span>
                </div>
                <input
                  type="range" min={30} max={300} step={15}
                  value={settings.freeTimePerDayMinutes}
                  onChange={(e) => save({ freeTimePerDayMinutes: Number(e.target.value) })}
                  className="w-full accent-tempo-500"
                />
                <div className="flex justify-between text-xs text-faint mt-1">
                  <span>30m</span><span>5h</span>
                </div>
              </div>

              <div>
                <label className="label">Preferred Free Time Slots</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['morning', 'afternoon', 'evening', 'night'].map((slot) => {
                    const active = settings.preferredFreeTimeSlots.includes(slot)
                    return (
                      <motion.button
                        key={slot}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => save({
                          preferredFreeTimeSlots: active
                            ? settings.preferredFreeTimeSlots.filter((s) => s !== slot)
                            : [...settings.preferredFreeTimeSlots, slot],
                        })}
                        className="px-4 py-2 rounded-xl text-xs font-bold border-2 capitalize transition-all"
                        style={active
                          ? { background: 'rgba(124,59,255,0.1)', borderColor: 'var(--primary)', color: 'var(--primary)' }
                          : { borderColor: 'var(--border)', color: 'var(--text-3)' }}
                      >
                        {slot}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {tab === 'billing' && (
          <motion.div key="billing" variants={container} initial="hidden" animate="show" className="space-y-4">
            {settings.plan === 'free' ? (
              <>
                <motion.div variants={item} className="card p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: 'var(--surface-2)' }}>🆓</div>
                    <div>
                      <p className="text-sm font-bold text-main">Free Plan</p>
                      <p className="text-xs text-faint">3 AI uses per day</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-faint">
                    <p>✓ Unlimited assignments &amp; events</p>
                    <p>✓ Weekly + monthly calendar</p>
                    <p>✓ Bucket list</p>
                    <p className="opacity-50">✗ 3 AI scheduling uses/day</p>
                    <p className="opacity-50">✗ No analytics</p>
                    <p className="opacity-50">✗ No themes</p>
                  </div>
                </motion.div>

                <motion.div
                  variants={item}
                  className="rounded-2xl p-6 text-white relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, var(--primary-dark, #5B21B6) 0%, var(--primary) 50%, var(--primary-dark, #8B2FD0) 100%)' }}
                >
                  {/* Decorative blobs */}
                  <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: '#0DD9B8', filter: 'blur(40px)', transform: 'translate(30%, -30%)' }} />
                  <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10" style={{ background: '#FF4757', filter: 'blur(30px)', transform: 'translate(-30%, 30%)' }} />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-xs font-bold opacity-70 uppercase tracking-widest mb-1">Tempo</p>
                        <p className="text-2xl font-black" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pro Plan</p>
                        <p className="text-sm opacity-75 mt-0.5">Your life upgrade</p>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-black" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$8</p>
                        <p className="text-xs opacity-70">/month</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 mb-6">
                      {PRO_FEATURES.map((f) => (
                        <div key={f.title} className="flex items-start gap-2.5">
                          <span className="text-base flex-shrink-0">{f.icon}</span>
                          <div>
                            <p className="text-sm font-semibold">{f.title}</p>
                            <p className="text-xs opacity-65">{f.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { updateSettings({ plan: 'pro', aiUsesRemaining: Infinity }); alert('Pro unlocked! (Demo mode)') }}
                      className="w-full py-3.5 rounded-2xl font-black text-base transition-all"
                      style={{ background: 'white', color: '#5B21B6', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      Upgrade to Pro — $8/month
                    </motion.button>
                    <p className="text-center text-xs opacity-60 mt-2">Cancel anytime · 7-day free trial</p>
                  </div>
                </motion.div>
              </>
            ) : (
              <motion.div variants={item} className="card p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(124,59,255,0.12)' }}>✨</div>
                  <div>
                    <p className="font-black text-main" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Tempo Pro</p>
                    <p className="text-xs font-bold" style={{ color: 'var(--primary)' }}>Active · All features unlocked</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {PRO_FEATURES.map((f) => (
                    <p key={f.title} className="text-sm text-faint">✓ {f.title}</p>
                  ))}
                </div>
                <button onClick={() => updateSettings({ plan: 'free', aiUsesRemaining: 3 })}
                  className="btn-ghost text-xs mt-5" style={{ color: '#FF4757' }}>
                  Downgrade to Free
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
