'use client'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useAppStore } from '@/store/useAppStore'
import { generateScheduleMock } from '@/lib/ai-scheduler'
import { cn, formatTime } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import type { DaySchedule } from '@/store/types'

interface Props {
  open: boolean
  onClose: () => void
}

type Step = 'config' | 'generating' | 'result'

export function PlanMyDayModal({ open, onClose }: Props) {
  const { assignments, events, freeTimeBlocks, settings, consumeAIUse, setGeneratedSchedules } = useAppStore()
  const [step, setStep] = useState<Step>('config')
  const [planDays, setPlanDays] = useState<1 | 7>(7)
  const [result, setResult] = useState<ReturnType<typeof generateScheduleMock> | null>(null)

  const handleGenerate = () => {
    if (!consumeAIUse()) {
      alert('You\'ve used all your AI credits for today. Upgrade to Pro for unlimited access!')
      return
    }
    setStep('generating')
    setTimeout(() => {
      const schedule = generateScheduleMock({
        assignments,
        events,
        freeTimeBlocks,
        settings,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        days: planDays,
      })
      setResult(schedule)
      setStep('result')
    }, 2000)
  }

  const handleAccept = () => {
    if (result) {
      setGeneratedSchedules(result.schedules)
    }
    onClose()
    setStep('config')
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => setStep('config'), 300)
  }

  const TYPE_STYLES: Record<string, string> = {
    assignment: 'bg-violet-100 border-violet-200 text-violet-800',
    event: 'bg-blue-100 border-blue-200 text-blue-800',
    free: 'bg-amber-100 border-amber-200 text-amber-800',
    break: 'bg-slate-100 border-slate-200 text-slate-600',
  }

  const TYPE_ICONS: Record<string, string> = {
    assignment: '📚',
    event: '📅',
    free: '☀️',
    break: '☕',
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={step !== 'generating' ? 'AI Schedule Planner' : undefined}
      size="lg"
    >
      {/* Config Step */}
      {step === 'config' && (
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 p-4 bg-brand-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-xl">✨</div>
            <div>
              <p className="text-sm font-semibold text-brand-800">Smart Scheduling</p>
              <p className="text-xs text-brand-600">
                AI will balance your workload, deadlines, and free time automatically.
              </p>
            </div>
          </div>

          <div>
            <label className="label">Plan for</label>
            <div className="flex gap-3">
              <button
                onClick={() => setPlanDays(1)}
                className={cn(
                  'flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all',
                  planDays === 1
                    ? 'bg-brand-50 border-brand-400 text-brand-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                )}
              >
                Today only
              </button>
              <button
                onClick={() => setPlanDays(7)}
                className={cn(
                  'flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all',
                  planDays === 7
                    ? 'bg-brand-50 border-brand-400 text-brand-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                )}
              >
                This week (7 days)
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="label">What I'll work with</label>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-brand-600">
                  {assignments.filter((a) => !a.completed).length}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Assignments</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-teal-600">{events.length}</p>
                <p className="text-xs text-slate-500 mt-0.5">Events</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {formatTime(settings.freeTimePerDayMinutes)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Free/day</p>
              </div>
            </div>
          </div>

          {settings.plan === 'free' && (
            <p className="text-xs text-slate-500 text-center">
              {settings.aiUsesRemaining} AI uses remaining today •{' '}
              <a href="/settings?tab=billing" className="text-brand-600 hover:underline">Upgrade for unlimited</a>
            </p>
          )}

          <div className="flex gap-2">
            <button onClick={handleClose} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleGenerate} className="btn-primary flex-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Generate Schedule
            </button>
          </div>
        </div>
      )}

      {/* Generating Step */}
      {step === 'generating' && (
        <div className="p-12 flex flex-col items-center gap-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-brand-100 animate-ping opacity-60" />
            <div className="relative w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-3xl">
              ✨
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-800">Building your schedule...</p>
            <p className="text-sm text-slate-500 mt-1">Balancing workload, deadlines, and free time</p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Result Step */}
      {step === 'result' && result && (
        <div className="p-6 space-y-5 animate-fade-in">
          {/* Insights */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-violet-50 rounded-xl">
              <p className="text-xs text-violet-500 font-medium">Total Study Time</p>
              <p className="text-lg font-bold text-violet-700 mt-0.5">{formatTime(result.insights.totalStudyMinutes)}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <p className="text-xs text-amber-500 font-medium">Free Time Scheduled</p>
              <p className="text-lg font-bold text-amber-700 mt-0.5">{formatTime(result.insights.totalFreeMinutes)}</p>
            </div>
          </div>

          <div className="p-3 bg-teal-50 rounded-xl flex items-start gap-2">
            <span className="text-teal-500 mt-0.5">💡</span>
            <p className="text-xs text-teal-700 font-medium">{result.insights.tip}</p>
          </div>

          {/* Schedule preview */}
          <div>
            <p className="section-title mb-3">Your Schedule</p>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {result.schedules.map((day) => (
                <div key={day.date}>
                  <p className="text-xs font-semibold text-slate-500 mb-2">
                    {format(new Date(day.date + 'T12:00:00'), 'EEEE, MMM d')}
                  </p>
                  <div className="space-y-1.5">
                    {day.scheduledBlocks.map((block) => (
                      <div
                        key={block.id}
                        className={cn('flex items-center gap-2 p-2 rounded-lg border text-xs', TYPE_STYLES[block.type])}
                      >
                        <span>{TYPE_ICONS[block.type]}</span>
                        <span className="font-medium flex-1">{block.title}</span>
                        <span className="opacity-70">{block.startTime} – {block.endTime}</span>
                      </div>
                    ))}
                    {day.scheduledBlocks.length === 0 && (
                      <p className="text-xs text-slate-400 italic pl-2">Light day — no tasks scheduled</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button onClick={() => setStep('config')} className="btn-secondary flex-1">
              Regenerate
            </button>
            <button onClick={handleAccept} className="btn-primary flex-1">
              Apply Schedule
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
