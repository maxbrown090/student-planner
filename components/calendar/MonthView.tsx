'use client'
import { useState } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, format, isSameMonth, isToday, isSameDay,
} from 'date-fns'
import { useAppStore } from '@/store/useAppStore'
import { cn, CATEGORY_COLORS } from '@/lib/utils'
import { EventModal } from './EventModal'
import type { CalendarEvent } from '@/store/types'

interface Props { currentDate: Date }

export function MonthView({ currentDate }: Props) {
  const { events, assignments } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let d = gridStart
  while (d <= gridEnd) {
    days.push(d)
    d = addDays(d, 1)
  }

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return events.filter((e) => e.date === dateStr)
  }

  const getAssignmentsDueOnDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return assignments.filter((a) => a.dueDate === dateStr && !a.completed)
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'))
    setEditEvent(null)
    setShowModal(true)
  }

  return (
    <>
      <div className="card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="p-3 text-center">
              <span className="text-xs font-semibold text-slate-400 uppercase">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentDate)
            const today = isToday(day)
            const dayEvents = getEventsForDay(day)
            const dueAssignments = getAssignmentsDueOnDay(day)

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'min-h-[96px] p-2 border-b border-r border-slate-50 cursor-pointer transition-colors',
                  !isCurrentMonth && 'bg-slate-50/50 opacity-50',
                  today && 'bg-brand-50/50',
                  'hover:bg-slate-50'
                )}
                onClick={() => handleDayClick(day)}
              >
                <div
                  className={cn(
                    'w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold mb-1',
                    today ? 'bg-brand-600 text-white' : 'text-slate-600'
                  )}
                >
                  {format(day, 'd')}
                </div>

                {/* Events */}
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs px-1.5 py-0.5 rounded font-medium truncate"
                      style={{
                        backgroundColor: CATEGORY_COLORS[event.category] + '20',
                        color: CATEGORY_COLORS[event.category],
                      }}
                      onClick={(e) => { e.stopPropagation(); setEditEvent(event); setShowModal(true) }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <p className="text-xs text-slate-400 px-1">+{dayEvents.length - 2} more</p>
                  )}
                  {dueAssignments.slice(0, 1).map((a) => (
                    <div key={a.id} className="text-xs px-1.5 py-0.5 rounded font-medium truncate bg-red-50 text-red-600">
                      📚 {a.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
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
