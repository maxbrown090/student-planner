'use client'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { SupabaseSync } from '@/components/providers/SupabaseSync'

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuth   = pathname?.startsWith('/auth')

  if (isAuth) {
    return <div className="w-full min-h-screen">{children}</div>
  }

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <SupabaseSync />
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
