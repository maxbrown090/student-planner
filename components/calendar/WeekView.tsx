'use client'
import { useState } from 'react'
import { startOfWeek, addDays, format, isSameDay, parseISO, isToday } from 'date-fns'
import { useAppStore } from '@/store/useAppStore'
import { cn, CATEGORY_COLORS, timeToMinutes } from '@/lib/utils'
import { EventModal } from './EventModal'
import type { CalendarEvent } from '@/store/types'

interface Props {
  currentDate: Date
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 7 AM to 10 PM

export function WeekView({ currentDate }: Props) {
  const { events, assignments } = useAppStore()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null)
  const [showModal, setShowModal] = useState(false)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return events.filter((e) => e.date === dateStr)
  }

  const getAssignmentsDueOnDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return assignments.filter((a) => a.dueDate === dateStr && !a.completed)
  }

  const getEventTop = (startTime: string): number => {
    const mins = timeToMinutes(startTime) - 7 * 60
    return (mins / 60) * 64
  }

  const getEventHeight = (startTime: string, endTime: string): number => {
    const mins = timeToMinutes(endTime) - timeToMinutes(startTime)
    return Math.max(24, (mins / 60) * 64)
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'))
    setEditEvent(null)
    setShowModal(true)
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b border-slate-100">
          <div className="p-3 border-r border-slate-100" />
          {days.map((day) => {
            const today = isToday(day)
            const dueSoon = getAssignmentsDueOnDay(day).length
            return (
              <div
                key={day.toISOString()}
                className={cn('p-3 text-center border-r border-slate-100 last:border-r-0 cursor-pointer hover:bg-slate-50 transition-colors', today && 'bg-brand-50')}
                onClick={() => handleDayClick(day)}
              >
                <p className="text-xs text-slate-500 font-medium">{format(day, 'EEE')}</p>
                <p
                  className={cn(
                    'text-lg font-bold mt-0.5',
                    today ? 'text-brand-600' : 'text-slate-700'
                  )}
                >
                  {format(day, 'd')}
                </p>
                {dueSoon > 0 && (
                  <div className="flex justify-center gap-0.5 mt-1">
                    {Array.from({ length: Math.min(dueSoon, 3) }).map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-red-400" />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Time grid */}
        <div className="overflow-y-auto max-h-[600px]">
          <div className="grid grid-cols-8 relative">
            {/* Hour labels */}
            <div className="border-r border-slate-100">
              {HOURS.map((h) => (
                <div key={h} className="h-16 flex items-start justify-end pr-2 pt-1">
                  <span className="text-xs text-slate-400">
                    {h > 12 ? `${h - 12}pm` : h === 12 ? '12pm' : `${h}am`}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day) => {
              const dayEvents = getEventsForDay(day)
              const today = isToday(day)
              return (
                <div
                  key={day.toISOString()}
                  className={cn('border-r border-slate-100 last:border-r-0 relative', today && 'bg-brand-50/30')}
                >
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="h-16 border-b border-slate-50 hover:bg-slate-50/70 cursor-pointer transition-colors"
                      onClick={() => handleDayClick(day)}
                    />
                  ))}

                  {/* Events */}
                  {dayEvents.map((event) => {
                    const top = getEventTop(event.startTime)
                    const height = getEventHeight(event.startTime, event.endTime)
                    const color = CATEGORY_COLORS[event.category]
                    return (
                      <div
                        key={event.id}
                        className="absolute left-0.5 right-0.5 rounded-lg px-1.5 py-1 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
                        style={{ top, height, backgroundColor: color + '20', borderLeft: `3px solid ${color}` }}
                        onClick={(e) => { e.stopPropagation(); setEditEvent(event); setShowModal(true) }}
                      >
                        <p className="text-xs font-semibold leading-tight" style={{ color }}>
                          {event.title}
                        </p>
                        <p className="text-xs opacity-70" style={{ color }}>
                          {event.startTime}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <EventModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditEvent(null) }}
        defaultDate={selectedDate ?? undefined}
        editEvent={editEvent ?? undefined}
      />
    </>
  )
}
