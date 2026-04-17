'use client'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useAppStore } from '@/store/useAppStore'
import { CalendarEvent, EventCategory } from '@/store/types'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  defaultDate?: string
  editEvent?: CalendarEvent
}

const CATEGORIES: { value: EventCategory; label: string; color: string }[] = [
  { value: 'school', label: 'School', color: 'bg-violet-500' },
  { value: 'personal', label: 'Personal', color: 'bg-teal-500' },
  { value: 'work', label: 'Work', color: 'bg-blue-500' },
  { value: 'health', label: 'Health', color: 'bg-green-500' },
  { value: 'social', label: 'Social', color: 'bg-pink-500' },
  { value: 'free', label: 'Free Time', color: 'bg-amber-500' },
]

export function EventModal({ open, onClose, defaultDate, editEvent }: Props) {
  const { addEvent, updateEvent, deleteEvent } = useAppStore()
  const isEdit = !!editEvent

  const [form, setForm] = useState({
    title: editEvent?.title ?? '',
    date: editEvent?.date ?? defaultDate ?? new Date().toISOString().split('T')[0],
    startTime: editEvent?.startTime ?? '09:00',
    endTime: editEvent?.endTime ?? '10:00',
    category: (editEvent?.category ?? 'personal') as EventCategory,
    notes: editEvent?.notes ?? '',
  })

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    if (isEdit && editEvent) {
      updateEvent(editEvent.id, form)
    } else {
      addEvent(form)
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Event' : 'New Event'} size="sm">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="label">Event Title *</label>
          <input
            className="input"
            placeholder="e.g. Study group, Gym, Doctor..."
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="label">Date</label>
          <input type="date" className="input" value={form.date} onChange={(e) => set('date', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Start</label>
            <input type="time" className="input" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
          </div>
          <div>
            <label className="label">End</label>
            <input type="time" className="input" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => set('category', c.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all',
                  form.category === c.value
                    ? 'border-current bg-slate-50'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                )}
              >
                <span className={cn('w-2 h-2 rounded-full', c.color)} />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Notes</label>
          <input className="input" placeholder="Optional..." value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>

        <div className="flex gap-2 pt-1">
          {isEdit && (
            <button
              type="button"
              onClick={() => { deleteEvent(editEvent!.id); onClose() }}
              className="btn-danger"
            >
              Delete
            </button>
          )}
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">
            {isEdit ? 'Save' : 'Add Event'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
