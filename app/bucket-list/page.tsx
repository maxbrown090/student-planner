'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import { BucketItem } from '@/store/types'
import { format } from 'date-fns'

const CATEGORY_EMOJIS: Record<string, string> = {
  travel: '✈️',
  experience: '🎭',
  skill: '🎯',
  social: '👥',
  health: '💪',
  career: '🚀',
  other: '⭐',
}

const PRIORITY_CONFIG = {
  dream: { label: 'Dream Big', bg: 'bg-violet-50 border-violet-200', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700' },
  soon: { label: 'Do Soon', bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700', badge: 'bg-teal-100 text-teal-700' },
  someday: { label: 'Someday', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-600', badge: 'bg-slate-100 text-slate-600' },
}

function AddBucketModal({ open, onClose, edit }: { open: boolean; onClose: () => void; edit?: BucketItem }) {
  const { addBucketItem, updateBucketItem } = useAppStore()
  const isEdit = !!edit

  const [form, setForm] = useState({
    title: edit?.title ?? '',
    description: edit?.description ?? '',
    category: edit?.category ?? 'experience' as BucketItem['category'],
    priority: edit?.priority ?? 'someday' as BucketItem['priority'],
    imageEmoji: edit?.imageEmoji ?? '⭐',
  })

  const EMOJIS = ['⭐', '🌍', '🎭', '🎯', '💪', '🚀', '🎨', '🏔️', '🌊', '🎵', '📚', '🍕', '🤝', '💡', '🏆', '🌅']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    if (isEdit && edit) {
      updateBucketItem(edit.id, form)
    } else {
      addBucketItem({ ...form, completed: false })
    }
    onClose()
  }

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Goal' : 'Add to Bucket List'} size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Emoji picker */}
        <div>
          <label className="label">Icon</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => set('imageEmoji', e)}
                className={cn(
                  'w-9 h-9 rounded-xl text-lg transition-all',
                  form.imageEmoji === e ? 'bg-brand-100 ring-2 ring-brand-400' : 'hover:bg-slate-100'
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Goal Title *</label>
          <input
            className="input"
            placeholder="e.g. Visit Japan, Learn guitar, Run a 5K..."
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Why do you want to do this?"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              <option value="travel">Travel</option>
              <option value="experience">Experience</option>
              <option value="skill">Learn a Skill</option>
              <option value="social">Social</option>
              <option value="health">Health</option>
              <option value="career">Career</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">When?</label>
            <div className="flex flex-col gap-1.5">
              {(['soon', 'someday', 'dream'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set('priority', p)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all text-left',
                    form.priority === p
                      ? PRIORITY_CONFIG[p].bg + ' ' + PRIORITY_CONFIG[p].text
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  )}
                >
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">
            {isEdit ? 'Save Changes' : 'Add Goal'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function BucketCard({ item }: { item: BucketItem }) {
  const { toggleBucketItem, deleteBucketItem, scheduleBucketItem } = useAppStore()
  const [showEdit, setShowEdit] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')

  const config = PRIORITY_CONFIG[item.priority]

  return (
    <>
      <div
        className={cn(
          'card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft',
          item.completed && 'opacity-60',
          'border-2',
          item.completed ? 'border-slate-100' : config.bg.split(' ')[1]
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0', item.completed ? 'bg-slate-100' : config.bg.split(' ')[0])}>
            {item.completed ? '✅' : item.imageEmoji}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={cn('font-semibold text-slate-800', item.completed && 'line-through text-slate-400')}>
                {item.title}
              </p>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setShowEdit(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => deleteBucketItem(item.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {item.description && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={cn('badge', config.badge)}>{config.label}</span>
              <span className="badge bg-slate-100 text-slate-500">
                {CATEGORY_EMOJIS[item.category]} {item.category}
              </span>
              {item.scheduledDate && (
                <span className="badge bg-blue-100 text-blue-600">
                  📅 {format(new Date(item.scheduledDate + 'T12:00:00'), 'MMM d')}
                </span>
              )}
              {item.completed && item.completedDate && (
                <span className="badge bg-green-100 text-green-600">
                  ✓ {format(new Date(item.completedDate + 'T12:00:00'), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {!item.completed && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setShowSchedule(true)}
              className="btn-ghost text-xs flex-1 justify-center"
            >
              📅 Schedule It
            </button>
            <button
              onClick={() => toggleBucketItem(item.id)}
              className="btn-ghost text-xs flex-1 justify-center text-teal-600 hover:bg-teal-50"
            >
              ✓ Mark Done
            </button>
          </div>
        )}
        {item.completed && (
          <button
            onClick={() => toggleBucketItem(item.id)}
            className="mt-3 pt-3 border-t border-slate-100 w-full btn-ghost text-xs text-slate-400"
          >
            Undo completion
          </button>
        )}
      </div>

      {/* Schedule date picker */}
      <Modal open={showSchedule} onClose={() => setShowSchedule(false)} title="Schedule This Goal" size="sm">
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            When would you like to do <strong>{item.title}</strong>?
          </p>
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowSchedule(false)} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={() => {
                if (scheduleDate) scheduleBucketItem(item.id, scheduleDate)
                setShowSchedule(false)
              }}
              className="btn-primary flex-1"
              disabled={!scheduleDate}
            >
              Schedule
            </button>
          </div>
        </div>
      </Modal>

      <AddBucketModal open={showEdit} onClose={() => setShowEdit(false)} edit={item} />
    </>
  )
}

export default function BucketListPage() {
  const { bucketList } = useAppStore()
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'soon'>('all')

  const filtered = bucketList.filter((item) => {
    switch (filter) {
      case 'pending': return !item.completed
      case 'completed': return item.completed
      case 'soon': return !item.completed && item.priority === 'soon'
      default: return true
    }
  })

  const completedCount = bucketList.filter((b) => b.completed).length

  const grouped = {
    soon: filtered.filter((b) => !b.completed && b.priority === 'soon'),
    dream: filtered.filter((b) => !b.completed && b.priority === 'dream'),
    someday: filtered.filter((b) => !b.completed && b.priority === 'someday'),
    completed: filtered.filter((b) => b.completed),
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Bucket List</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {completedCount} of {bucketList.length} goals achieved
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          + Add Goal
        </button>
      </div>

      {/* Progress banner */}
      {bucketList.length > 0 && (
        <div className="card p-5 bg-gradient-to-r from-violet-50 via-pink-50 to-amber-50 border-violet-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700">Life Goals Progress</p>
            <p className="text-sm font-bold text-brand-600">
              {Math.round((completedCount / bucketList.length) * 100)}%
            </p>
          </div>
          <div className="h-2 bg-white/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all"
              style={{ width: `${(completedCount / bucketList.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {completedCount > 0 ? `You've crossed off ${completedCount} dream${completedCount > 1 ? 's' : ''}. Keep going!` : 'Add your first goal and start living intentionally.'}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5 w-fit">
        {([
          { value: 'all', label: 'All' },
          { value: 'soon', label: 'Do Soon' },
          { value: 'pending', label: 'Pending' },
          { value: 'completed', label: 'Done' },
        ] as const).map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filter === f.value ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {bucketList.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">🌟</div>
          <h2 className="text-lg font-semibold text-slate-700">Your bucket list is empty</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            Add experiences, skills, trips, and dreams. Life is short — plan the good stuff too.
          </p>
          <button onClick={() => setShowAdd(true)} className="btn-primary mt-5 mx-auto">
            Add Your First Goal
          </button>
        </div>
      )}

      {/* Grouped cards */}
      {filter === 'all' && (
        <div className="space-y-6">
          {grouped.soon.length > 0 && (
            <Section title="Do Soon 🎯" items={grouped.soon} />
          )}
          {grouped.dream.length > 0 && (
            <Section title="Dream Big ✨" items={grouped.dream} />
          )}
          {grouped.someday.length > 0 && (
            <Section title="Someday 🌅" items={grouped.someday} />
          )}
          {grouped.completed.length > 0 && (
            <Section title="Completed 🏆" items={grouped.completed} />
          )}
        </div>
      )}

      {filter !== 'all' && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((item) => <BucketCard key={item.id} item={item} />)}
        </div>
      )}

      {filter !== 'all' && filtered.length === 0 && bucketList.length > 0 && (
        <div className="card p-8 text-center">
          <p className="text-slate-500">No items in this category</p>
        </div>
      )}

      <AddBucketModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}

function Section({ title, items }: { title: string; items: BucketItem[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-600 mb-3">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => <BucketCard key={item.id} item={item} />)}
      </div>
    </div>
  )
}
