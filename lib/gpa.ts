import { GPAEntry } from '@/store/types'

export const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F':  0.0,
}

export const GRADE_OPTIONS = ['A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','F']

export const GRADE_COLORS: Record<string, string> = {
  'A+': '#16A34A', 'A': '#16A34A', 'A-': '#22C55E',
  'B+': '#0DD9B8', 'B': '#0DD9B8', 'B-': '#14B8A6',
  'C+': '#F59E0B', 'C': '#F59E0B', 'C-': '#F97316',
  'D+': '#EF4444', 'D': '#EF4444', 'D-': '#DC2626',
  'F':  '#991B1B',
}

export function percentageToLetter(pct: number): string {
  if (pct >= 97) return 'A+'
  if (pct >= 93) return 'A'
  if (pct >= 90) return 'A-'
  if (pct >= 87) return 'B+'
  if (pct >= 83) return 'B'
  if (pct >= 80) return 'B-'
  if (pct >= 77) return 'C+'
  if (pct >= 73) return 'C'
  if (pct >= 70) return 'C-'
  if (pct >= 67) return 'D+'
  if (pct >= 63) return 'D'
  if (pct >= 60) return 'D-'
  return 'F'
}

export function normalizeGrade(raw: string): string {
  const trimmed = raw.trim().toUpperCase()
  if (GRADE_POINTS[trimmed] !== undefined) return trimmed
  const num = parseFloat(trimmed)
  if (!isNaN(num) && num >= 0 && num <= 100) return percentageToLetter(num)
  return ''
}

export function getGradePoints(grade: string): number | null {
  const normalized = normalizeGrade(grade)
  if (!normalized) return null
  return GRADE_POINTS[normalized] ?? null
}

export interface GPAResult {
  unweighted: number
  weighted: number
  hasWeights: boolean
  totalCredits: number
  breakdown: Array<{ entry: GPAEntry; letter: string; points: number }>
}

export function calculateGPA(entries: GPAEntry[]): GPAResult {
  const breakdown = entries
    .map((e) => {
      const letter = normalizeGrade(e.grade)
      const points = letter ? (GRADE_POINTS[letter] ?? null) : null
      return { entry: e, letter, points }
    })
    .filter((r): r is { entry: GPAEntry; letter: string; points: number } =>
      r.letter !== '' && r.points !== null
    )

  if (breakdown.length === 0) {
    return { unweighted: 0, weighted: 0, hasWeights: false, totalCredits: 0, breakdown: [] }
  }

  const unweightedSum = breakdown.reduce((s, r) => s + r.points, 0)
  const unweighted = unweightedSum / breakdown.length

  const hasWeights = breakdown.some((r) => r.entry.credits > 0)
  const totalCredits = hasWeights
    ? breakdown.reduce((s, r) => s + (r.entry.credits || 3), 0)
    : breakdown.length

  const weightedSum = breakdown.reduce(
    (s, r) => s + r.points * (hasWeights ? (r.entry.credits || 3) : 1),
    0
  )
  const weighted = weightedSum / totalCredits

  return { unweighted, weighted, hasWeights, totalCredits, breakdown }
}

export function gpaToLetterGrade(gpa: number): string {
  if (gpa >= 3.85) return 'A'
  if (gpa >= 3.5)  return 'A-'
  if (gpa >= 3.15) return 'B+'
  if (gpa >= 2.85) return 'B'
  if (gpa >= 2.5)  return 'B-'
  if (gpa >= 2.15) return 'C+'
  if (gpa >= 1.85) return 'C'
  return 'C-'
}

export function gpaColor(gpa: number): string {
  if (gpa >= 3.5) return '#16A34A'
  if (gpa >= 3.0) return '#0DD9B8'
  if (gpa >= 2.5) return '#F59E0B'
  if (gpa >= 2.0) return '#F97316'
  return '#EF4444'
}
