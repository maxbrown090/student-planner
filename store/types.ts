export type Priority     = 'low' | 'medium' | 'high'
export type EventCategory = 'school' | 'personal' | 'work' | 'health' | 'social' | 'free'
export type Plan         = 'free' | 'pro'
export type SchoolType   = 'middle' | 'high' | 'college'

// ─── Core planner types ───────────────────────────────────────────────────────

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Assignment {
  id: string
  title: string
  subject: string
  dueDate: string
  estimatedMinutes: number
  priority: Priority
  completed: boolean
  subtasks: Subtask[]
  notes: string
  category: EventCategory
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  category: EventCategory
  color?: string
  isAIGenerated?: boolean
  assignmentId?: string
  notes?: string
  isPrivate?: boolean
}

export interface BucketItem {
  id: string
  title: string
  description: string
  category: 'travel' | 'experience' | 'skill' | 'social' | 'health' | 'career' | 'other'
  completed: boolean
  completedDate?: string
  scheduledDate?: string
  priority: 'dream' | 'soon' | 'someday'
  imageEmoji: string
}

export interface FreeTimeBlock {
  id: string
  label: string
  dayOfWeek: number
  startTime: string
  endTime: string
  color: string
}

export interface UserSettings {
  name: string
  wakeTime: string
  sleepTime: string
  freeTimePerDayMinutes: number
  preferredFreeTimeSlots: string[]
  plan: Plan
  aiUsesRemaining: number
  aiUsesResetDate: string
  theme: 'default' | 'ocean' | 'forest' | 'sunset'
  notifications: boolean
  streakCount: number
  lastActiveDate: string
  // Profile / school
  username: string
  schoolType: SchoolType
  schoolName: string
  gradeYear: string
  bio: string
  // Privacy
  shareSchedule: boolean
  shareGPA: boolean
  // Onboarding
  hasOnboarded: boolean
}

export interface DaySchedule {
  date: string
  scheduledBlocks: ScheduledBlock[]
}

export interface ScheduledBlock {
  id: string
  title: string
  startTime: string
  endTime: string
  type: 'assignment' | 'event' | 'free' | 'break'
  category: EventCategory
  assignmentId?: string
  priority?: Priority
}

// ─── GPA types ────────────────────────────────────────────────────────────────

export interface GPAEntry {
  id: string
  className: string
  grade: string          // 'A', 'B+', 'C-', or '95' (percentage)
  credits: number        // 0 = unset / use equal weighting
  semester: string       // e.g. 'Fall 2025'
}

export interface GPASemester {
  name: string
  entries: GPAEntry[]
}

// ─── Social types ─────────────────────────────────────────────────────────────

export type FriendStatus = 'friend' | 'pending_sent' | 'pending_received'

export interface Friend {
  id: string
  username: string
  name: string
  schoolName: string
  schoolType: SchoolType
  gradeYear: string
  status: FriendStatus
  addedDate: string
  avatarColor: string    // hex — used as avatar background
}

export type MessageType = 'text' | 'study_invite'

export interface Message {
  id: string
  fromId: string         // 'me' or friend id
  toId: string
  content: string
  timestamp: string      // ISO string
  type: MessageType
  reaction?: '👍' | '❤️' | '🔥'
  read: boolean
}
