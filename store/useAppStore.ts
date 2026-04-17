'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import {
  Assignment, CalendarEvent, BucketItem,
  UserSettings, FreeTimeBlock, DaySchedule, Subtask, Priority
} from './types'
import { format } from 'date-fns'

const today = format(new Date(), 'yyyy-MM-dd')

const defaultSettings: UserSettings = {
  name: 'Student',
  wakeTime: '07:00',
  sleepTime: '23:00',
  freeTimePerDayMinutes: 120,
  preferredFreeTimeSlots: ['evening'],
  plan: 'free',
  aiUsesRemaining: 3,
  aiUsesResetDate: today,
  theme: 'default',
  notifications: true,
  streakCount: 0,
  lastActiveDate: today,
}

interface AppState {
  // Data
  assignments: Assignment[]
  events: CalendarEvent[]
  bucketList: BucketItem[]
  freeTimeBlocks: FreeTimeBlock[]
  settings: UserSettings
  generatedSchedules: DaySchedule[]

  // UI State
  selectedDate: string
  calendarView: 'week' | 'month'

  // Assignment Actions
  addAssignment: (a: Omit<Assignment, 'id'>) => void
  updateAssignment: (id: string, updates: Partial<Assignment>) => void
  deleteAssignment: (id: string) => void
  toggleAssignment: (id: string) => void
  addSubtask: (assignmentId: string, title: string) => void
  toggleSubtask: (assignmentId: string, subtaskId: string) => void
  deleteSubtask: (assignmentId: string, subtaskId: string) => void

  // Event Actions
  addEvent: (e: Omit<CalendarEvent, 'id'>) => void
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void

  // Bucket List Actions
  addBucketItem: (item: Omit<BucketItem, 'id'>) => void
  updateBucketItem: (id: string, updates: Partial<BucketItem>) => void
  deleteBucketItem: (id: string) => void
  toggleBucketItem: (id: string) => void
  scheduleBucketItem: (id: string, date: string) => void

  // Free Time Actions
  addFreeTimeBlock: (block: Omit<FreeTimeBlock, 'id'>) => void
  deleteFreeTimeBlock: (id: string) => void

  // Settings
  updateSettings: (updates: Partial<UserSettings>) => void
  consumeAIUse: () => boolean  // returns false if no uses left

  // Schedule
  setGeneratedSchedules: (schedules: DaySchedule[]) => void

  // UI
  setSelectedDate: (date: string) => void
  setCalendarView: (view: 'week' | 'month') => void

  // Streak
  checkAndUpdateStreak: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      assignments: [],
      events: [],
      bucketList: [],
      freeTimeBlocks: [
        {
          id: uuidv4(),
          label: 'Evening Relax',
          dayOfWeek: -1, // every day
          startTime: '20:00',
          endTime: '21:00',
          color: '#f59e0b',
        },
      ],
      settings: defaultSettings,
      generatedSchedules: [],
      selectedDate: today,
      calendarView: 'week',

      addAssignment: (a) =>
        set((s) => ({ assignments: [...s.assignments, { id: uuidv4(), ...a }] })),

      updateAssignment: (id, updates) =>
        set((s) => ({
          assignments: s.assignments.map((a) => a.id === id ? { ...a, ...updates } : a),
        })),

      deleteAssignment: (id) =>
        set((s) => ({ assignments: s.assignments.filter((a) => a.id !== id) })),

      toggleAssignment: (id) =>
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.id === id ? { ...a, completed: !a.completed } : a
          ),
        })),

      addSubtask: (assignmentId, title) =>
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.id === assignmentId
              ? { ...a, subtasks: [...a.subtasks, { id: uuidv4(), title, completed: false }] }
              : a
          ),
        })),

      toggleSubtask: (assignmentId, subtaskId) =>
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.id === assignmentId
              ? {
                  ...a,
                  subtasks: a.subtasks.map((st) =>
                    st.id === subtaskId ? { ...st, completed: !st.completed } : st
                  ),
                }
              : a
          ),
        })),

      deleteSubtask: (assignmentId, subtaskId) =>
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.id === assignmentId
              ? { ...a, subtasks: a.subtasks.filter((st) => st.id !== subtaskId) }
              : a
          ),
        })),

      addEvent: (e) =>
        set((s) => ({ events: [...s.events, { id: uuidv4(), ...e }] })),

      updateEvent: (id, updates) =>
        set((s) => ({
          events: s.events.map((e) => e.id === id ? { ...e, ...updates } : e),
        })),

      deleteEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      addBucketItem: (item) =>
        set((s) => ({ bucketList: [...s.bucketList, { id: uuidv4(), ...item }] })),

      updateBucketItem: (id, updates) =>
        set((s) => ({
          bucketList: s.bucketList.map((b) => b.id === id ? { ...b, ...updates } : b),
        })),

      deleteBucketItem: (id) =>
        set((s) => ({ bucketList: s.bucketList.filter((b) => b.id !== id) })),

      toggleBucketItem: (id) =>
        set((s) => ({
          bucketList: s.bucketList.map((b) =>
            b.id === id
              ? { ...b, completed: !b.completed, completedDate: !b.completed ? today : undefined }
              : b
          ),
        })),

      scheduleBucketItem: (id, date) =>
        set((s) => ({
          bucketList: s.bucketList.map((b) => b.id === id ? { ...b, scheduledDate: date } : b),
        })),

      addFreeTimeBlock: (block) =>
        set((s) => ({ freeTimeBlocks: [...s.freeTimeBlocks, { id: uuidv4(), ...block }] })),

      deleteFreeTimeBlock: (id) =>
        set((s) => ({ freeTimeBlocks: s.freeTimeBlocks.filter((b) => b.id !== id) })),

      updateSettings: (updates) =>
        set((s) => ({ settings: { ...s.settings, ...updates } })),

      consumeAIUse: () => {
        const { settings } = get()
        const resetNeeded = settings.aiUsesResetDate !== today
        if (resetNeeded) {
          set((s) => ({
            settings: {
              ...s.settings,
              aiUsesRemaining: s.settings.plan === 'pro' ? Infinity : 3,
              aiUsesResetDate: today,
            },
          }))
        }
        const current = get().settings
        if (current.plan === 'pro') return true
        if (current.aiUsesRemaining <= 0) return false
        set((s) => ({
          settings: { ...s.settings, aiUsesRemaining: s.settings.aiUsesRemaining - 1 },
        }))
        return true
      },

      setGeneratedSchedules: (schedules) => set({ generatedSchedules: schedules }),

      setSelectedDate: (date) => set({ selectedDate: date }),

      setCalendarView: (view) => set({ calendarView: view }),

      checkAndUpdateStreak: () => {
        const { settings } = get()
        const todayDate = today
        if (settings.lastActiveDate === todayDate) return
        const yesterday = format(
          new Date(new Date().setDate(new Date().getDate() - 1)),
          'yyyy-MM-dd'
        )
        const newStreak =
          settings.lastActiveDate === yesterday ? settings.streakCount + 1 : 1
        set((s) => ({
          settings: { ...s.settings, streakCount: newStreak, lastActiveDate: todayDate },
        }))
      },
    }),
    {
      name: 'student-planner-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
