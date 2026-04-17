'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocialStore } from '@/store/useSocialStore'
import { useAppStore } from '@/store/useAppStore'
import { GPAEntry } from '@/store/types'
import {
  GRADE_OPTIONS, GRADE_COLORS, calculateGPA, gpaColor,
  gpaToLetterGrade, normalizeGrade,
} from '@/lib/gpa'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }

// ─── Pro Gate ────────────────────────────────────────────────────────────────

function ProGate() {
  return (
    <div className="relative max-w-2xl">
      {/* Blurred preview */}
      <div className="pointer-events-none select-none blur-sm opacity-40 space-y-4">
        <div className="card p-6">
          <div className="flex items-center justify-around">
            {[{ v: '3.72', l: 'This Semester' }, { v: '3.58', l: 'Cumulative' }].map((x) => (
              <div key={x.l} className="flex flex-col items-center gap-1">
                <div className="w-28 h-28 rounded-full" style={{ background: 'var(--surface-2)' }} />
                <p className="text-xs text-faint">{x.l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5 space-y-3">
          {['Calculus II', 'English Lit', 'Physics'].map((c) => (
            <div key={c} className="h-10 rounded-xl" style={{ background: 'var(--surface-2)' }} />
          ))}
        </div>
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="card p-8 text-center max-w-sm mx-4 shadow-lift"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark, #5B21B6))' }}
          >
            🎓
          </div>
          <h2 className="text-lg font-black text-main mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            GPA Calculator
          </h2>
          <p className="text-sm text-faint mb-5">
            Track grades, calculate GPA across semesters, and see your weighted average — all in one place.
          </p>
          <div className="space-y-2 text-sm text-left mb-5">
            {[
              'Add unlimited semesters',
              'Weighted + unweighted GPA',
              'Cumulative GPA across all semesters',
              'Per-class grade breakdown',
              '% to letter grade converter',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-faint">
                <span className="font-bold" style={{ color: 'var(--primary)' }}>✓</span>
                {f}
              </div>
            ))}
          </div>
          <Link
            href="/settings?tab=billing"
            className="btn-primary w-full justify-center text-sm"
          >
            Upgrade to Pro — $8/month
          </Link>
          <p className="text-xs text-faint mt-2">7-day free trial · Cancel anytime</p>
        </motion.div>
      </div>
    </div>
  )
}

// ─── GPA Circle ──────────────────────────────────────────────────────────────

function GPACircle({ gpa, label, size = 112 }: { gpa: number; label: string; size?: number }) {
  const color = gpaColor(gpa)
  const r     = (size / 2) - 9
  const circ  = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(gpa / 4.0, 1))

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={8} />
          <motion.circle
            cx={size/2} cy={size/2} r={r}
            fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            transform={`rotate(-90 ${size/2} ${size/2})`}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <motion.span
            key={gpa.toFixed(2)}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-black text-main"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color, fontSize: size * 0.2 }}
          >
            {gpa.toFixed(2)}
          </motion.span>
          <span className="text-2xs font-bold text-faint uppercase tracking-wide">
            {gpaToLetterGrade(gpa)}
          </span>
        </div>
      </div>
      <p className="text-xs font-semibold text-faint text-center">{label}</p>
    </div>
  )
}

// ─── Grade Row ───────────────────────────────────────────────────────────────

function GradeRow({ entry, index, onChange, onDelete }: {
  entry: GPAEntry
  index: number
  onChange: (u: Partial<GPAEntry>) => void
  onDelete: () => void
}) {
  const letter = normalizeGrade(entry.grade)
  const color  = letter ? GRADE_COLORS[letter] : undefined

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="grid items-center gap-2"
      style={{ gridTemplateColumns: '1fr 110px 72px 32px' }}
    >
      <input
        className="input text-sm"
        placeholder={`Class ${index + 1}`}
        value={entry.className}
        onChange={(e) => onChange({ className: e.target.value })}
      />
      <div className="relative">
        <select
          className="input text-sm pr-7 appearance-none font-bold w-full"
          value={letter || ''}
          onChange={(e) => onChange({ grade: e.target.value })}
          style={{ color: color ?? 'var(--text-3)' }}
        >
          <option value="" disabled>Grade</option>
          {GRADE_OPTIONS.map((g) => (
            <option key={g} value={g} style={{ color: GRADE_COLORS[g] }}>{g}</option>
          ))}
        </select>
        {color && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none"
            style={{ background: color }} />
        )}
      </div>
      <input
        className="input text-sm text-center"
        type="number" min={0} max={6} step={0.5}
        placeholder="Cr."
        value={entry.credits || ''}
        onChange={(e) => onChange({ credits: parseFloat(e.target.value) || 0 })}
      />
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={onDelete}
        className="w-8 h-8 flex items-center justify-center rounded-xl text-faint transition-all"
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,71,87,0.08)'; e.currentTarget.style.color = '#FF4757' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '' }}
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
          <line x1="12" y1="4" x2="4" y2="12" /><line x1="4" y1="4" x2="12" y2="12" />
        </svg>
      </motion.button>
    </motion.div>
  )
}

// ─── Add Semester Modal ───────────────────────────────────────────────────────

function AddSemesterModal({ open, onClose, onAdd, existing }: {
  open: boolean
  onClose: () => void
  onAdd: (name: string) => void
  existing: string[]
}) {
  const [value, setValue] = useState('')
  const PRESETS = ['Fall 2024', 'Winter 2025', 'Spring 2025', 'Fall 2025', 'Winter 2026', 'Spring 2026', 'Fall 2026', 'Winter 2027', 'Spring 2027']
  const available = PRESETS.filter((p) => !existing.includes(p))
  const trimmed = value.trim()
  const isDupe = existing.includes(trimmed)

  const submit = (name: string) => {
    if (!name.trim() || existing.includes(name.trim())) return
    onAdd(name.trim())
    setValue('')
    onClose()
  }

  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,7,26,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.93, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="card w-full max-w-sm p-6 space-y-4"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.35)' }}
      >
        <h3 className="font-black text-main" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Add Semester
        </h3>

        {/* Custom name */}
        <div>
          <label className="label">Custom Name</label>
          <input
            className="input text-sm"
            placeholder="e.g. Spring 2026, Junior Year..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(trimmed) }}
            autoFocus
          />
          {isDupe && <p className="text-xs mt-1" style={{ color: '#FF4757' }}>Already added</p>}
        </div>

        {/* Quick presets */}
        {available.length > 0 && (
          <div>
            <label className="label">Quick Add</label>
            <div className="flex flex-wrap gap-2">
              {available.slice(0, 6).map((p) => (
                <button
                  key={p}
                  onClick={() => submit(p)}
                  className="text-xs px-3 py-1.5 rounded-xl font-semibold border-2 transition-all"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={() => submit(trimmed)}
            disabled={!trimmed || isDupe}
            className="btn-primary flex-1"
          >
            Add Semester
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GPAPage() {
  const { settings } = useAppStore()
  const {
    gpaEntries, semesters,
    addGPAEntry, updateGPAEntry, deleteGPAEntry,
    addSemester, removeSemester,
  } = useSocialStore()

  const [activeSemester, setActiveSemester] = useState<string | null>(null)
  const [showAddSemester, setShowAddSemester] = useState(false)
  const [showPctHelp, setShowPctHelp] = useState(false)
  const [pctInput, setPctInput] = useState('')

  // Pro gate
  if (settings.plan !== 'pro') return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">GPA Calculator</h1>
        <p className="text-sm text-faint mt-0.5">Track your grades across semesters</p>
      </div>
      <ProGate />
    </div>
  )

  // Select first semester by default if none selected
  const currentSemester = activeSemester && semesters.includes(activeSemester)
    ? activeSemester
    : semesters[0] ?? null

  const semesterEntries = (sem: string) => gpaEntries.filter((e) => e.semester === sem)
  const semesterGPA     = (sem: string) => {
    const r = calculateGPA(semesterEntries(sem))
    return r.hasWeights ? r.weighted : r.unweighted
  }

  // Cumulative = weighted average of all semester GPAs by credit count
  const allValid = gpaEntries.filter((e) => normalizeGrade(e.grade) !== '')
  const cumResult = calculateGPA(allValid)
  const cumulativeGPA = cumResult.hasWeights ? cumResult.weighted : cumResult.unweighted

  const currentEntries = currentSemester ? semesterEntries(currentSemester) : []
  const currentResult  = currentSemester ? calculateGPA(currentEntries) : null
  const currentGPA     = currentResult
    ? (currentResult.hasWeights ? currentResult.weighted : currentResult.unweighted)
    : 0

  const pctLetter = pctInput ? normalizeGrade(pctInput) : ''

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-2xl">

        {/* Header */}
        <motion.div variants={item} className="flex items-start justify-between">
          <div>
            <h1 className="page-title">GPA Calculator</h1>
            <p className="text-sm text-faint mt-0.5">
              {semesters.length === 0
                ? 'Add your first semester to get started'
                : `${semesters.length} semester${semesters.length > 1 ? 's' : ''} · ${allValid.length} classes tracked`}
            </p>
          </div>
        </motion.div>

        {/* Cumulative summary — shown once at least 1 semester has grades */}
        {allValid.length > 0 && (
          <motion.div variants={item} className="card p-6">
            <p className="section-title mb-5">Overall GPA</p>
            <div className="flex items-center justify-around flex-wrap gap-4">
              <GPACircle gpa={cumulativeGPA} label="Cumulative GPA" size={120} />
              {cumResult.hasWeights && (
                <GPACircle gpa={cumResult.unweighted} label="Unweighted" size={96} />
              )}
              {/* Per-semester mini circles */}
              {semesters.filter((s) => semesterEntries(s).length > 0).map((sem) => (
                <GPACircle key={sem} gpa={semesterGPA(sem)} label={sem} size={80} />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-5 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="text-center">
                <p className="text-lg font-black text-main" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {allValid.length}
                </p>
                <p className="text-xs text-faint font-medium">Total Classes</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-main" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {cumResult.totalCredits}
                </p>
                <p className="text-xs text-faint font-medium">Credit Hours</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black" style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: gpaColor(cumulativeGPA),
                }}>
                  {gpaToLetterGrade(cumulativeGPA)}
                </p>
                <p className="text-xs text-faint font-medium">Letter Grade</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Semester tabs + Add button */}
        <motion.div variants={item}>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="section-title">Semesters</p>
            <div className="flex items-center gap-1.5 flex-wrap ml-1">
              {semesters.map((sem) => (
                <button
                  key={sem}
                  onClick={() => setActiveSemester(sem)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={currentSemester === sem
                    ? { background: 'var(--primary)', color: 'white', boxShadow: '0 4px 12px var(--primary-shadow, rgba(124,59,255,0.3))' }
                    : { background: 'var(--surface-2)', color: 'var(--text-2)' }}
                >
                  {sem}
                  {semesterEntries(sem).length > 0 && (
                    <span
                      className="ml-1.5 text-2xs font-black"
                      style={{ opacity: currentSemester === sem ? 0.7 : 0.5 }}
                    >
                      {semesterGPA(sem).toFixed(2)}
                    </span>
                  )}
                </button>
              ))}
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setShowAddSemester(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-dashed transition-all"
                style={{ borderColor: 'var(--border-2)', color: 'var(--text-3)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-3)' }}
              >
                + Add Semester
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* No semesters yet */}
        {semesters.length === 0 && (
          <motion.div variants={item}>
            <div className="card p-12 text-center">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="text-5xl mb-4"
              >
                🎓
              </motion.div>
              <p className="text-base font-bold text-main">No semesters yet</p>
              <p className="text-sm text-faint mt-1 mb-5">Add a semester to start tracking your GPA</p>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowAddSemester(true)}
                className="btn-primary mx-auto"
              >
                + Add Your First Semester
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Active semester grade table */}
        {currentSemester && (
          <motion.div variants={item} key={currentSemester} className="card p-5 space-y-3">
            <div className="flex items-center justify-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <p className="text-sm font-black text-main" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {currentSemester}
                </p>
                {currentEntries.length > 0 && currentResult && (
                  <p className="text-xs text-faint mt-0.5">
                    {currentEntries.length} class{currentEntries.length !== 1 ? 'es' : ''} ·{' '}
                    <span style={{ color: gpaColor(currentGPA), fontWeight: 700 }}>
                      {currentGPA.toFixed(3)} GPA
                    </span>
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  if (confirm(`Remove ${currentSemester} and all its grades?`)) {
                    removeSemester(currentSemester)
                    setActiveSemester(semesters.find(s => s !== currentSemester) ?? null)
                  }
                }}
                className="text-xs font-semibold px-2 py-1 rounded-lg transition-all text-faint"
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,71,87,0.08)'; e.currentTarget.style.color = '#FF4757' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '' }}
              >
                Remove semester
              </button>
            </div>

            {/* Column headers */}
            <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 110px 72px 32px' }}>
              <span className="text-xs font-bold text-faint uppercase tracking-wider">Class</span>
              <span className="text-xs font-bold text-faint uppercase tracking-wider">Grade</span>
              <span className="text-xs font-bold text-faint uppercase tracking-wider">Credits</span>
              <span />
            </div>

            <AnimatePresence>
              {currentEntries.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-sm text-center text-faint py-4"
                >
                  No classes yet — add one below
                </motion.p>
              )}
              {currentEntries.map((entry, i) => (
                <GradeRow
                  key={entry.id}
                  entry={entry}
                  index={i}
                  onChange={(u) => updateGPAEntry(entry.id, u)}
                  onDelete={() => deleteGPAEntry(entry.id)}
                />
              ))}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.998 }}
              onClick={() => addGPAEntry({ className: '', grade: '', credits: 3, semester: currentSemester })}
              className="w-full py-2.5 rounded-xl text-sm font-bold border-2 border-dashed transition-all"
              style={{ borderColor: 'var(--border-2)', color: 'var(--text-3)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-3)' }}
            >
              + Add Class
            </motion.button>
          </motion.div>
        )}

        {/* Breakdown for active semester */}
        {currentResult && currentResult.breakdown.length > 0 && (
          <motion.div variants={item} className="card p-5">
            <p className="section-title mb-4">Breakdown — {currentSemester}</p>
            <div className="space-y-2.5">
              {currentResult.breakdown.map(({ entry, letter, points }) => (
                <div key={entry.id} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                    style={{ background: GRADE_COLORS[letter] ?? '#857FC4' }}
                  >
                    {letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-main truncate">
                      {entry.className || 'Unnamed class'}
                    </p>
                    <p className="text-xs text-faint">
                      {points.toFixed(1)} pts{entry.credits > 0 ? ` · ${entry.credits} cr` : ''}
                    </p>
                  </div>
                  <div className="h-1.5 w-20 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'var(--surface-2)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(points / 4) * 100}%`, background: GRADE_COLORS[letter] }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-sm font-semibold text-faint">Semester GPA</span>
              <span
                className="text-xl font-black"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: gpaColor(currentGPA) }}
              >
                {currentGPA.toFixed(3)}
              </span>
            </div>
          </motion.div>
        )}

        {/* % converter */}
        <motion.div variants={item} className="card p-5">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowPctHelp(!showPctHelp)}
          >
            <p className="text-sm font-bold text-main">% → Letter Grade Converter</p>
            <motion.svg
              animate={{ rotate: showPctHelp ? 180 : 0 }}
              viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-faint"
            >
              <polyline points="4 6 8 10 12 6" />
            </motion.svg>
          </div>
          <AnimatePresence>
            {showPctHelp && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      className="input w-28 text-sm"
                      type="number" min={0} max={100} placeholder="e.g. 87"
                      value={pctInput} onChange={(e) => setPctInput(e.target.value)}
                    />
                    <span className="text-faint">→</span>
                    {pctLetter
                      ? <span className="text-lg font-black" style={{ color: GRADE_COLORS[pctLetter] }}>{pctLetter}</span>
                      : <span className="text-sm text-faint">—</span>}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      ['A+ 97–100','#16A34A'],['A 93–96','#16A34A'],['A- 90–92','#22C55E'],
                      ['B+ 87–89','#0DD9B8'],['B 83–86','#0DD9B8'],['B- 80–82','#14B8A6'],
                      ['C+ 77–79','#F59E0B'],['C 73–76','#F59E0B'],['C- 70–72','#F97316'],
                      ['D+ 67–69','#EF4444'],['D 63–66','#EF4444'],['F <60','#991B1B'],
                    ].map(([label, color]) => (
                      <div key={label} className="px-2 py-1.5 rounded-lg text-center text-2xs font-semibold text-white"
                        style={{ background: color }}>
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </motion.div>

      <AddSemesterModal
        open={showAddSemester}
        onClose={() => setShowAddSemester(false)}
        onAdd={(name) => {
          addSemester(name)
          setActiveSemester(name)
        }}
        existing={semesters}
      />
    </>
  )
}
