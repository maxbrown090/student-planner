import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInDays, parseISO, isToday, isTomorrow } from 'date-fns'
import { EventCategory, Priority } from '@/store/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  school: '#7c3aed',
  personal: '#14b8a6',
  work: '#3b82f6',
  health: '#22c55e',
  social: '#ec4899',
  free: '#f59e0b',
}

export const CATEGORY_BG: Record<EventCategory, string> = {
  school: 'bg-violet-100 text-violet-700',
  personal: 'bg-teal-100 text-teal-700',
  work: 'bg-blue-100 text-blue-700',
  health: 'bg-green-100 text-green-700',
  social: 'bg-pink-100 text-pink-700',
  free: 'bg-amber-100 text-amber-700',
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  high: { label: 'High', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  medium: { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  low: { label: 'Low', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
}

export function getDueDateLabel(dueDate: string): { label: string; urgent: boolean; color: string } {
  // Append noon to avoid UTC-midnight timezone shift when parsing ISO date strings
  const days = differenceInDays(parseISO(dueDate + 'T12:00:00'), new Date())
  if (days < 0) return { label: 'Overdue', urgent: true, color: 'text-red-600' }
  if (days === 0) return { label: 'Due today', urgent: true, color: 'text-red-600' }
  if (days === 1) return { label: 'Due tomorrow', urgent: true, color: 'text-orange-500' }
  if (days <= 3) return { label: `Due in ${days} days`, urgent: true, color: 'text-amber-500' }
  if (days <= 7) return { label: `Due in ${days} days`, urgent: false, color: 'text-yellow-600' }
  return { label: `Due ${format(parseISO(dueDate), 'MMM d')}`, urgent: false, color: 'text-slate-500' }
}

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function getMotivationMessage(completedToday: number, totalToday: number): string {
  const messages = {
    allDone: [
      "Everything done — go enjoy your evening 🎉",
      "Crushed it today. Seriously.",
      "All clear. You earned some real rest.",
    ],
    halfDone: [
      "You're halfway there. Keep the momentum.",
      "Good progress — the hardest part is behind you.",
      "Nice work so far. What's next?",
    ],
    justStarting: [
      "Let's get one thing done — that's all it takes to start.",
      "Small wins add up. Pick the easiest task first.",
      "You've got this. One thing at a time.",
    ],
    behind: [
      "Behind today? It happens. Prioritize and move forward.",
      "Don't stress about yesterday. Focus on now.",
      "Even finishing one task is better than zero.",
    ],
  }
  if (totalToday === 0) return messages.justStarting[Math.floor(Math.random() * 3)]
  if (completedToday === totalToday) return messages.allDone[Math.floor(Math.random() * 3)]
  if (completedToday / totalToday >= 0.5) return messages.halfDone[Math.floor(Math.random() * 3)]
  return messages.justStarting[Math.floor(Math.random() * 3)]
}

export function getStreakMessage(streak: number): string {
  if (streak === 0) return 'Start your streak today'
  if (streak === 1) return '1 day streak — keep it going!'
  if (streak < 7) return `${streak} day streak 🔥`
  if (streak < 30) return `${streak} days straight! You're on fire 🔥`
  return `${streak} days — absolute legend 🏆`
}
