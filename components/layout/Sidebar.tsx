'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { useSocialStore } from '@/store/useSocialStore'
import { useTheme } from '@/components/providers/ThemeProvider'
import { Logo } from '@/components/ui/Logo'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const PLANNER_NAV = [
  { href: '/', label: 'Today', icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" /></svg> },
  { href: '/calendar', label: 'Calendar', icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" /></svg> },
  { href: '/assignments', label: 'Assignments', icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" /></svg> },
  { href: '/bucket-list', label: 'Bucket List', icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" /></svg> },
]

const ACADEMIC_NAV = [
  { href: '/gpa', label: 'GPA Calculator', icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v2a1 1 0 102 0v-2zm2-5a1 1 0 011 1v6a1 1 0 11-2 0V8a1 1 0 011-1zm4 4a1 1 0 10-2 0v3a1 1 0 102 0v-3z" clipRule="evenodd" /></svg> },
]

const SOCIAL_NAV = [
  { href: '/friends', label: 'Friends', icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg> },
  { href: '/messages', label: 'Messages', icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg> },
]

function NavItem({ href, label, icon, badge }: { href: string; label: string; icon: React.ReactNode; badge?: number }) {
  const pathname = usePathname()
  const active = pathname === href

  return (
    <Link
      href={href}
      className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group')}
      style={active
        ? { background: 'linear-gradient(135deg, var(--primary), var(--primary-dark, #5B21B6))', color: 'white', boxShadow: '0 4px 14px var(--primary-shadow, rgba(124,59,255,0.35))' }
        : { color: 'var(--text-2)' }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)' }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = '' }}
    >
      <span className={cn('transition-transform duration-150 group-hover:scale-110', active ? 'text-white' : '')}>
        {icon}
      </span>
      <span>{label}</span>
      {badge != null && badge > 0 && (
        <span className="ml-auto text-2xs font-black rounded-full w-5 h-5 flex items-center justify-center"
          style={active ? { background: 'rgba(255,255,255,0.3)', color: 'white' } : { background: '#FF4757', color: 'white' }}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  )
}

export function Sidebar() {
  const { settings, assignments } = useAppStore()
  const { unreadCount, friends } = useSocialStore()
  const { theme, toggle } = useTheme()

  const todayStr    = format(new Date(), 'yyyy-MM-dd')
  const taskBadge   = assignments.filter((a) => !a.completed && a.dueDate <= todayStr).length
  const msgUnread   = unreadCount()
  const friendReqs  = friends.filter(f => f.status === 'pending_received').length

  const initials = settings.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <aside
      className="w-[252px] flex-shrink-0 flex flex-col h-full border-r transition-colors duration-300 overflow-y-auto"
      style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
    >
      {/* Brand */}
      <div className="px-5 pt-5 pb-3 flex-shrink-0">
        <Logo size={34} showName />
      </div>

      {/* User card */}
      <div className="mx-3 mb-3 flex-shrink-0">
        <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark, #5B21B6))' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-main">{settings.name}</p>
            {settings.username && <p className="text-xs text-faint truncate">@{settings.username}</p>}
            {!settings.username && (
              <p className="text-xs font-medium" style={{ color: 'var(--warning)' }}>
                {settings.streakCount > 0 ? `🔥 ${settings.streakCount}d streak` : 'Set username →'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-4 pb-2">
        {/* Planner */}
        <div className="space-y-0.5">
          <p className="section-title px-3 mb-1.5">Planner</p>
          <NavItem href="/" label="Today" icon={PLANNER_NAV[0].icon} badge={taskBadge} />
          <NavItem href="/calendar" label="Calendar" icon={PLANNER_NAV[1].icon} />
          <NavItem href="/assignments" label="Assignments" icon={PLANNER_NAV[2].icon} />
          <NavItem href="/bucket-list" label="Bucket List" icon={PLANNER_NAV[3].icon} />
        </div>

        {/* Academic */}
        <div className="space-y-0.5">
          <p className="section-title px-3 mb-1.5">Academic</p>
          <NavItem
            href="/gpa"
            label={settings.plan === 'free' ? 'GPA Calculator 🔒' : 'GPA Calculator'}
            icon={ACADEMIC_NAV[0].icon}
          />
        </div>

        {/* Social */}
        <div className="space-y-0.5">
          <p className="section-title px-3 mb-1.5">Connect</p>
          <NavItem href="/friends" label="Friends" icon={SOCIAL_NAV[0].icon} badge={friendReqs} />
          <NavItem href="/messages" label="Messages" icon={SOCIAL_NAV[1].icon} badge={msgUnread} />
        </div>
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-5 space-y-2 flex-shrink-0">
        {settings.plan === 'free' && (
          <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-main">AI Credits</span>
              <span className="text-xs font-bold text-primary">{settings.aiUsesRemaining}/3</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${(settings.aiUsesRemaining / 3) * 100}%`, background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />
            </div>
            <Link href="/settings?tab=billing"
              className="mt-2 block text-center text-xs font-bold text-white py-1.5 rounded-lg transition-all"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark, #5B21B6))' }}>
              Unlock Pro ✨
            </Link>
          </div>
        )}
        {settings.plan === 'pro' && (
          <div className="rounded-xl px-3 py-2 flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, rgba(124,59,255,0.12), rgba(13,217,184,0.08))', border: '1px solid rgba(124,59,255,0.2)' }}>
            <span className="text-sm">✨</span>
            <span className="text-xs font-bold text-primary">Pro Active</span>
          </div>
        )}

        <NavItem href="/settings" label="Settings"
          icon={<svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.295 1.473c.497.144.971.342 1.416.587l1.25-.834a1 1 0 011.262.125l1.666 1.667a1 1 0 01.125 1.261l-.834 1.25c.245.445.443.919.587 1.416l1.473.294a1 1 0 01.804.98v2.361a1 1 0 01-.804.98l-1.473.295a6.95 6.95 0 01-.587 1.416l.834 1.25a1 1 0 01-.125 1.261l-1.666 1.667a1 1 0 01-1.261.125l-1.25-.834a6.953 6.953 0 01-1.416.587l-.294 1.473a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.295-1.473a6.957 6.957 0 01-1.416-.587l-1.25.834a1 1 0 01-1.261-.125l-1.667-1.667a1 1 0 01-.125-1.261l.834-1.25a6.957 6.957 0 01-.587-1.416l-1.473-.294A1 1 0 011 11.18V8.82a1 1 0 01.804-.98l1.473-.295c.144-.497.342-.971.587-1.416l-.834-1.25a1 1 0 01.125-1.261l1.667-1.667a1 1 0 011.261-.125l1.25.834a6.957 6.957 0 011.416-.587l.294-1.473zM13 10a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd" /></svg>}
        />

        <button onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ color: 'var(--text-2)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '')}>
          <span className="text-base">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </aside>
  )
}
