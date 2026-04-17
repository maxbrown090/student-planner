'use client'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useAppStore } from '@/store/useAppStore'
import { Priority, EventCategory, Assignment } from '@/store/types'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'

interface Props {
  open: boolean
  onClose: () => void
  editAssignment?: Assignment
}

const SUBJECTS = ['Math', 'English', 'Science', 'History', 'Computer Science', 'Art', 'Music', 'PE', 'Other']

export function AddAssignmentModal({ open, onClose, editAssignment }: Props) {
  const { addAssignment, updateAssignment } = useAppStore()
  const isEdit = !!editAssignment

  const [form, setForm] = useState({
    title: editAssignment?.title ?? '',
    subject: editAssignment?.subject ?? 'Other',
    dueDate: editAssignment?.dueDate ?? format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    estimatedMinutes: editAssignment?.estimatedMinutes ?? 60,
    priority: (editAssignment?.priority ?? 'medium') as Priority,
    category: (editAssignment?.category ?? 'school') as EventCategory,
    notes: editAssignment?.notes ?? '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.dueDate) e.dueDate = 'Due date is required'
    if (form.estimatedMinutes < 5) e.estimatedMinutes = 'Minimum 5 minutes'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (isEdit && editAssignment) {
      updateAssignment(editAssignment.id, form)
    } else {
      addAssignment({ ...form, completed: false, subtasks: [] })
    }
    onClose()
  }

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: 'border-green-300 bg-green-50 text-green-700' },
    { value: 'medium', label: 'Medium', color: 'border-amber-300 bg-amber-50 text-amber-700' },
    { value: 'high', label: 'High', color: 'border-red-300 bg-red-50 text-red-700' },
  ]

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Assignment' : 'New Assignment'} size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Title */}
        <div>
          <label className="label">Assignment Title *</label>
          <input
            className={cn('input', errors.title && 'border-red-300 focus:ring-red-200')}
            placeholder="e.g. Chapter 5 Essay"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            autoFocus
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        {/* Subject + Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Subject</label>
            <select
              className="input"
              value={form.subject}
              onChange={(e) => set('subject', e.target.value)}
            >
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => set('category', e.target.value as EventCategory)}
            >
              <option value="school">School</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
            </select>
          </div>
        </div>

        {/* Due Date + Estimated time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Due Date *</label>
            <input
              type="date"
              className={cn('input', errors.dueDate && 'border-red-300')}
              value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Estimated Time</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className={cn('input', errors.estimatedMinutes && 'border-red-300')}
                value={form.estimatedMinutes}
                min={5}
                max={480}
                step={5}
                onChange={(e) => set('estimatedMinutes', Number(e.target.value))}
              />
              <span className="text-xs text-slate-500 whitespace-nowrap">min</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ≈ {Math.round(form.estimatedMinutes / 60 * 10) / 10}h
            </p>
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="label">Priority</label>
          <div className="flex gap-2">
            {PRIORITY_OPTIONS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => set('priority', p.value)}
                className={cn(
                  'flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all',
                  form.priority === p.value
                    ? p.color + ' border-current'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes (optional)</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Any details or reminders..."
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1">
            {isEdit ? 'Save Changes' : 'Add Assignment'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
