'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastProvider'
import { Logo } from '@/components/ui/Logo'
import { cn } from '@/lib/utils'

type Mode = 'signin' | 'signup'

// ─── OAuth brand logos ────────────────────────────────────────────────────────

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.41-1.09-.47-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.41C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  )
}

function GitHubLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.77.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0112 5.8c1.02.01 2.04.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.21.7.83.58A12 12 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const router = useRouter()
  const params = useSearchParams()
  const toast  = useToast()
  const [mode, setMode]       = useState<Mode>('signin')
  const [loading, setLoading] = useState<string | null>(null)

  // Form state
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShow] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (params.get('error') === 'oauth_failed') {
      toast.error('Sign in failed. Please try again.')
    }
  }, [params])

  // ── OAuth sign in ───────────────────────────────────────────────────────────
  const handleOAuth = async (provider: 'google' | 'apple' | 'github') => {
    setLoading(provider)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        toast.error(error.message)
        setLoading(null)
      }
      // On success, Supabase redirects to the OAuth provider
    } catch (err) {
      toast.error('Sign in failed. Check your connection.')
      setLoading(null)
    }
  }

  // ── Email sign in ───────────────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading('email')
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) {
      toast.error(error.message)
      setLoading(null)
      return
    }
    toast.success('Welcome back! 👋')
    router.push('/')
    router.refresh()
  }

  // ── Email sign up ───────────────────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password || !username.trim()) return

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      toast.error('Username: 3–20 chars, letters/numbers/underscores only')
      return
    }

    setLoading('email')
    const { error, data } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          username: username.trim().toLowerCase(),
          full_name: fullName.trim() || username.trim(),
        },
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(null)
      return
    }

    if (data.user && !data.session) {
      toast.success('Check your email to confirm your account!')
      setLoading(null)
      setMode('signin')
      return
    }

    toast.success(`Welcome to Tempo, ${username}! 🎉`)
    router.push('/')
    router.refresh()
  }

  const isSignUp = mode === 'signup'

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">

      {/* ── LEFT: Branding ──────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:flex-1 relative items-center justify-center p-12"
        style={{
          background: 'linear-gradient(135deg, #0D0B1F 0%, #2C0C70 50%, #5218C4 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-20"
          style={{ background: '#7C3BFF', filter: 'blur(80px)' }} />
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full opacity-20"
          style={{ background: '#0DD9B8', filter: 'blur(80px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10"
          style={{ background: '#FFB347', filter: 'blur(100px)' }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="relative max-w-md text-white"
        >
          <Logo size={52} />
          <h1 className="text-5xl font-black mt-8 leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Do more.<br />
            <span className="bg-gradient-to-r from-mint-400 to-amber-400 bg-clip-text text-transparent">
              Stress less.
            </span>
          </h1>
          <p className="text-white/70 text-lg mt-4 leading-relaxed">
            AI-powered planner built for students. Track assignments, plan your week, track your GPA — all in one beautiful place.
          </p>

          <div className="space-y-3 mt-10">
            {[
              { icon: '⚡', title: 'Plan My Day, in one click', desc: 'AI schedules your week around your classes and goals.' },
              { icon: '🎯', title: 'Focus Mode + Pomodoro timer', desc: 'Deep work sessions with zero distractions.' },
              { icon: '📊', title: 'GPA Calculator & grade tracking', desc: 'See exactly where your grades stand.' },
              { icon: '👥', title: 'Study with friends', desc: 'Share schedules, send study invites, stay motivated.' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                className="flex items-start gap-3 p-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-xl flex-shrink-0">{f.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white">{f.title}</p>
                  <p className="text-xs text-white/60">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-xs text-white/40 mt-10">
            Trusted by students at every grade level. Free forever. Upgrade to Pro anytime.
          </p>
        </motion.div>
      </div>

      {/* ── RIGHT: Auth form ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-app">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo size={36} showName />
          </div>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-3xl font-black text-main mb-1"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-sm text-faint mb-8">
                {isSignUp
                  ? 'Start planning your week smarter.'
                  : 'Sign in to pick up where you left off.'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* OAuth buttons */}
          <div className="space-y-2.5">
            <motion.button
              whileTap={{ scale: 0.985 }}
              onClick={() => handleOAuth('google')}
              disabled={!!loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
              style={{
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                color: 'var(--text)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
            >
              {loading === 'google' ? <Spinner /> : <GoogleLogo />}
              Continue with Google
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.985 }}
              onClick={() => handleOAuth('apple')}
              disabled={!!loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60"
              style={{ background: '#000' }}
            >
              {loading === 'apple' ? <Spinner /> : <AppleLogo />}
              Continue with Apple
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.985 }}
              onClick={() => handleOAuth('github')}
              disabled={!!loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60"
              style={{ background: '#24292F' }}
            >
              {loading === 'github' ? <Spinner /> : <GitHubLogo />}
              Continue with GitHub
            </motion.button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs font-semibold text-faint uppercase tracking-wider">Or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* Email form */}
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-3">
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden space-y-3"
                >
                  <div>
                    <label className="label">Full name</label>
                    <input
                      className="input text-sm"
                      placeholder="Alex Smith"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Username</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint text-sm font-semibold">@</span>
                      <input
                        className="input pl-7 text-sm"
                        placeholder="alex_s"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        maxLength={20}
                      />
                    </div>
                    <p className="text-2xs text-faint mt-1">3–20 chars · letters, numbers, underscores</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input text-sm"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                {!isSignUp && (
                  <button type="button" className="text-2xs font-semibold" style={{ color: 'var(--primary)' }}>
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10 text-sm"
                  placeholder={isSignUp ? 'At least 8 characters' : 'Your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  minLength={isSignUp ? 8 : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShow(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-main transition-colors"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.185A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.985 }}
              type="submit"
              disabled={!!loading}
              className="w-full btn-primary justify-center py-3 mt-5"
            >
              {loading === 'email'
                ? <Spinner />
                : (isSignUp ? 'Create account →' : 'Sign in →')}
            </motion.button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-sm text-faint mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setMode(isSignUp ? 'signin' : 'signup')}
              className="font-bold hover:underline"
              style={{ color: 'var(--primary)' }}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>

          {/* Terms */}
          {isSignUp && (
            <p className="text-center text-2xs text-faint mt-4 leading-relaxed">
              By signing up, you agree to our{' '}
              <a href="#" className="underline">Terms of Service</a> and{' '}
              <a href="#" className="underline">Privacy Policy</a>.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
    />
  )
}
