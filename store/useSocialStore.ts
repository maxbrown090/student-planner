'use client'
/**
 * Social store — Friends, Messages, GPA
 *
 * MVP: uses localStorage via Zustand persist.
 * Production: replace actions with Supabase calls.
 * See /lib/supabase-schema.sql for the DB schema.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { Friend, Message, GPAEntry, FriendStatus } from './types'
import { format } from 'date-fns'

// ─── Seed mock friends so the UI looks alive out of the box ──────────────────
const MOCK_FRIENDS: Friend[] = [
  {
    id: 'f1', username: 'alex_s', name: 'Alex Smith',
    schoolName: 'Riverside High', schoolType: 'high', gradeYear: '11th',
    status: 'friend', addedDate: '2026-01-15', avatarColor: '#7C3BFF',
  },
  {
    id: 'f2', username: 'jordan_k', name: 'Jordan Kim',
    schoolName: 'Riverside High', schoolType: 'high', gradeYear: '11th',
    status: 'friend', addedDate: '2026-02-01', avatarColor: '#0DD9B8',
  },
  {
    id: 'f3', username: 'sam_w', name: 'Sam Wilson',
    schoolName: 'Riverside High', schoolType: 'high', gradeYear: '10th',
    status: 'pending_received', addedDate: '2026-04-16', avatarColor: '#F97316',
  },
]

const MOCK_MESSAGES: Record<string, Message[]> = {
  f1: [
    { id: 'm1', fromId: 'f1', toId: 'me', content: 'Hey! Are you studying for the calc test?', timestamp: '2026-04-16T14:30:00', type: 'text', read: true },
    { id: 'm2', fromId: 'me', toId: 'f1', content: 'Yeah, been working on chapter 7', timestamp: '2026-04-16T14:35:00', type: 'text', read: true },
    { id: 'm3', fromId: 'f1', toId: 'me', content: "Let's study together at 5pm?", timestamp: '2026-04-16T14:36:00', type: 'study_invite', read: false },
  ],
  f2: [
    { id: 'm4', fromId: 'f2', toId: 'me', content: 'Did you finish the history essay?', timestamp: '2026-04-17T09:00:00', type: 'text', read: false },
  ],
}

interface SocialState {
  // GPA
  gpaEntries: GPAEntry[]
  addGPAEntry: (e: Omit<GPAEntry, 'id'>) => void
  updateGPAEntry: (id: string, updates: Partial<GPAEntry>) => void
  deleteGPAEntry: (id: string) => void

  // Friends
  friends: Friend[]
  addFriend: (f: Omit<Friend, 'id' | 'addedDate' | 'status'>) => void
  acceptFriend: (id: string) => void
  declineFriend: (id: string) => void
  removeFriend: (id: string) => void
  sendFriendRequest: (username: string) => { ok: boolean; message: string }

  // Semesters
  semesters: string[]
  addSemester: (name: string) => void
  removeSemester: (name: string) => void
  renameSemester: (oldName: string, newName: string) => void

  // Messages
  conversations: Record<string, Message[]>
  sendMessage: (toId: string, content: string, type?: Message['type']) => void
  addReaction: (friendId: string, messageId: string, reaction: Message['reaction']) => void
  markRead: (friendId: string) => void
  unreadCount: () => number
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      // ── GPA ─────────────────────────────────────────────────────────────────
      gpaEntries: [],
      semesters: [],

      addGPAEntry: (e) =>
        set((s) => ({ gpaEntries: [...s.gpaEntries, { id: uuidv4(), ...e }] })),

      updateGPAEntry: (id, updates) =>
        set((s) => ({
          gpaEntries: s.gpaEntries.map((e) => e.id === id ? { ...e, ...updates } : e),
        })),

      deleteGPAEntry: (id) =>
        set((s) => ({ gpaEntries: s.gpaEntries.filter((e) => e.id !== id) })),

      addSemester: (name) =>
        set((s) => ({
          semesters: s.semesters.includes(name) ? s.semesters : [...s.semesters, name],
        })),

      removeSemester: (name) =>
        set((s) => ({
          semesters: s.semesters.filter((sem) => sem !== name),
          // Also delete all entries for this semester
          gpaEntries: s.gpaEntries.filter((e) => e.semester !== name),
        })),

      renameSemester: (oldName, newName) =>
        set((s) => ({
          semesters: s.semesters.map((sem) => sem === oldName ? newName : sem),
          gpaEntries: s.gpaEntries.map((e) =>
            e.semester === oldName ? { ...e, semester: newName } : e
          ),
        })),

      // ── Friends ──────────────────────────────────────────────────────────────
      friends: MOCK_FRIENDS,

      addFriend: (f) =>
        set((s) => ({
          friends: [...s.friends, {
            id: uuidv4(),
            ...f,
            status: 'pending_sent' as FriendStatus,
            addedDate: format(new Date(), 'yyyy-MM-dd'),
          }],
        })),

      acceptFriend: (id) =>
        set((s) => ({
          friends: s.friends.map((f) =>
            f.id === id ? { ...f, status: 'friend' as FriendStatus } : f
          ),
        })),

      declineFriend: (id) =>
        set((s) => ({ friends: s.friends.filter((f) => f.id !== id) })),

      removeFriend: (id) =>
        set((s) => ({ friends: s.friends.filter((f) => f.id !== id) })),

      sendFriendRequest: (username) => {
        const existing = get().friends.find(
          (f) => f.username.toLowerCase() === username.toLowerCase()
        )
        if (existing) return { ok: false, message: 'Already connected or request pending' }
        // In production: POST /api/friends/request
        set((s) => ({
          friends: [...s.friends, {
            id: uuidv4(),
            username,
            name: username,
            schoolName: '',
            schoolType: 'high' as const,
            gradeYear: '',
            status: 'pending_sent' as FriendStatus,
            addedDate: format(new Date(), 'yyyy-MM-dd'),
            avatarColor: '#857FC4',
          }],
        }))
        return { ok: true, message: `Request sent to @${username}` }
      },

      // ── Messages ─────────────────────────────────────────────────────────────
      conversations: MOCK_MESSAGES,

      sendMessage: (toId, content, type = 'text') =>
        set((s) => {
          const msg: Message = {
            id: uuidv4(), fromId: 'me', toId,
            content, timestamp: new Date().toISOString(),
            type, read: true,
          }
          const existing = s.conversations[toId] ?? []
          return { conversations: { ...s.conversations, [toId]: [...existing, msg] } }
        }),

      addReaction: (friendId, messageId, reaction) =>
        set((s) => ({
          conversations: {
            ...s.conversations,
            [friendId]: (s.conversations[friendId] ?? []).map((m) =>
              m.id === messageId ? { ...m, reaction } : m
            ),
          },
        })),

      markRead: (friendId) =>
        set((s) => ({
          conversations: {
            ...s.conversations,
            [friendId]: (s.conversations[friendId] ?? []).map((m) => ({ ...m, read: true })),
          },
        })),

      unreadCount: () => {
        const { conversations } = get()
        return Object.values(conversations).flat().filter((m) => !m.read && m.fromId !== 'me').length
      },
    }),
    {
      name: 'tempo-social-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
