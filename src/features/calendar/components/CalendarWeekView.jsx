import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { taskMatchesDay, getTaskDate, getTaskPriorityId } from '../helpers/calendarUtils'
const HOUR_HEIGHT = 60
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7)
const DAY_NAMES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']

export default function CalendarWeekView({
  currentDate, setCurrentDate, selectedDate, setSelectedDate,
  tasks, events,
  getEventBlockColor, getTaskBlockColor,
  onTaskClick, onEventClick,
}) {

  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    return day
  })

  const getEventsWithPositions = (day) => {
    const dayEvents = events.filter(e => new Date(e.start_date).toDateString() === day.toDateString())
    const dayTasks = tasks.filter(t => taskMatchesDay(t, day))

    const processed = [
      ...dayEvents.map((event, idx) => {
        const eventDate = new Date(event.start_date)
        const duration = event.end_date ? (new Date(event.end_date) - eventDate) / 3600000 : 1
        const top = (eventDate.getHours() - 7) * HOUR_HEIGHT + (eventDate.getMinutes() / 60) * HOUR_HEIGHT
        return { ...event, top, height: Math.max(duration * HOUR_HEIGHT, 25), color: getEventBlockColor(event.type, idx), isEvent: true, isTask: false, displayTime: eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) }
      }),
      ...dayTasks.map(task => {
        const taskDate = getTaskDate(task) || new Date(day)
        const startHour = taskDate.getHours() || 9
        const top = (startHour - 7) * HOUR_HEIGHT + (taskDate.getMinutes() / 60) * HOUR_HEIGHT
        return { ...task, top, height: 30, color: getTaskBlockColor(getTaskPriorityId(task)), isTask: true, isEvent: false, displayTime: taskDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) }
      })
    ]
    return processed
  }

  const navigateWeek = (dir) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + dir * 7)
    setCurrentDate(newDate)
  }

  return (
    <div className="rounded-xl shadow-sm p-6 mb-6 bg-card border border-border">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigateWeek(-1)} className={`p-2 rounded-xl transition-colors hover:bg-muted`}>
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="text-2xl font-bold text-foreground">Semana del {currentDate.toLocaleDateString('es-ES')}</h2>
        <button onClick={() => navigateWeek(1)} className="p-2 rounded-xl transition-colors hover:bg-muted">
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col">
            {/* Day headers */}
            <div className="flex border-b border-border sticky top-0 bg-card z-10">
              <div className="w-16 flex-shrink-0 py-2 text-center text-xs text-muted-foreground border-r border-border">GMT-05</div>
              {weekDays.map((day, i) => {
                const isToday = day.toDateString() === new Date().toDateString()
                const isSelected = day.toDateString() === selectedDate.toDateString()
                return (
                  <div key={i} className={`flex-1 text-center py-2 border-r border-border last:border-r-0 cursor-pointer active:scale-[0.97] active:opacity-90 transition-transform transition-colors ${isSelected ? 'bg-primary/5' : ''}`} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()} onClick={() => setSelectedDate(day)}>
                    <div className="text-xs font-medium text-muted-foreground">{DAY_NAMES[day.getDay()]}</div>
                    <div className={`text-2xl font-medium mt-1 ${isToday ? 'w-10 h-10 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center' : 'text-foreground'}`}>
                      {day.getDate()}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Time grid */}
            <div className="flex">
              <div className="w-16 flex-shrink-0 border-r border-border">
                {HOURS.map(hour => (
                  <div key={hour} className="relative border-b border-border" style={{ height: `${HOUR_HEIGHT}px` }}>
                    <span className="absolute -top-2.5 right-2 text-xs text-muted-foreground font-medium">{hour.toString().padStart(2, '0')}:00</span>
                  </div>
                ))}
              </div>

              {weekDays.map((day, dayIndex) => {
                const items = getEventsWithPositions(day)
                const isSelected = day.toDateString() === selectedDate.toDateString()
                const now = new Date()
                const isToday = day.toDateString() === now.toDateString()
                return (
                  <div key={dayIndex} className={`flex-1 relative border-r border-border last:border-r-0 ${isSelected ? 'bg-primary/5' : ''}`}
                    style={{ minHeight: `${HOURS.length * HOUR_HEIGHT}px` }} onClick={() => setSelectedDate(day)}>
                    {HOURS.map(hour => (
                      <div key={hour} className="absolute w-full border-b border-border/50" style={{ top: `${(hour - 7) * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }} />
                    ))}
                    {isToday && (
                      <div className="absolute w-full flex items-center z-20" style={{ top: `${((now.getHours() - 7) * HOUR_HEIGHT) + ((now.getMinutes() / 60) * HOUR_HEIGHT)}px` }}>
                        <div className="w-2 h-2 rounded-full bg-destructive/100 -ml-1"></div>
                        <div className="flex-1 h-0.5 bg-destructive/100"></div>
                      </div>
                    )}
                    {items.map((item, itemIndex) => (
                      <div key={item.isTask ? `task-${item.id}` : `event-${item.id}`}
                        className={`absolute left-1 right-1 rounded-xl px-2 py-1 cursor-pointer transition-all shadow-sm overflow-hidden ${item.color.bg} ${item.color.hover} ${item.color.text}`}
                        style={{ top: `${item.top}px`, height: `${item.height}px`, minHeight: '24px', zIndex: 10 + itemIndex }}
                        role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()} onClick={(e) => { e.stopPropagation(); item.isTask ? onTaskClick(item) : onEventClick(item) }}>
                        <div className="text-xs font-semibold truncate">{item.title}</div>
                        {item.height > 35 && (
                          <div className="text-xs opacity-90 truncate">{item.displayTime}{item.type && !item.isTask ? ` • ${item.type}` : ''}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
