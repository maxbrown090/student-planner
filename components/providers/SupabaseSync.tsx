'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/useAppStore'

/**
 * Syncs the Supabase-authenticated user into the local Zustand store
 * (username, display name). Runs once per mount + on auth state change.
 */
export function SupabaseSync() {
  const updateSettings = useAppStore((s) => s.updateSettings)

  useEffect(() => {
    const supabase = createClient()

    const sync = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const meta = user.user_metadata ?? {}
      const updates: Record<string, unknown> = {}

      // Pull name from metadata (set on signup) or OAuth profile
      const name = meta.full_name || meta.name || user.email?.split('@')[0]
      if (name) updates.name = name

      const username = meta.username || (user.email?.split('@')[0] ?? '').toLowerCase()
      if (username) updates.username = username

      if (Object.keys(updates).length) updateSettings(updates as any)
    }

    sync()

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') sync()
    })

    return () => sub.subscription.unsubscribe()
  }, [updateSettings])

  return null
}
