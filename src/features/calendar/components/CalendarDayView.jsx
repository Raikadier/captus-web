import React from 'react'
import { Clock } from 'lucide-react'
import { getEventColor, getPriorityColor } from '../helpers/calendarUtils'

export default function CalendarDayView({ selectedDate, tasks, events, onTaskClick, onEventClick }) {
  const dayTasks = tasks.filter(t => new Date(t.endDate || t.creationDate).toDateString() === selectedDate.toDateString())
  const dayEvents = events.filter(e => new Date(e.start_date).toDateString() === selectedDate.toDateString())
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="text-xl font-bold mb-6 text-foreground border-b pb-4">
        {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </h3>
      <div className="space-y-4">
        {hours.map(hour => {
          const hourEvents = dayEvents.filter(e => new Date(e.start_date).getHours() === hour)
          if (hourEvents.length === 0) return null
          return (
            <div key={hour} className="flex group">
              <div className="w-16 text-sm font-medium text-muted-foreground pt-2 border-r border-border pr-4">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div className="flex-1 pl-4 pb-4 space-y-2 border-l border-transparent group-hover:border-border/50 -ml-[1px]">
                {hourEvents.map(event => (
                  <div key={`event-${event.id}`} className={`p-2 rounded-lg border cursor-pointer hover:opacity-80 ${getEventColor(event.type)}`} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()} onClick={() => onEventClick(event)}>
                    <div className="p-2 bg-card/50 rounded-xl backdrop-blur-sm"><Clock size={16} /></div>
                    <div>
                      <h4 className="text-sm font-semibold">{event.title}</h4>
                      <p className="text-xs opacity-80">
                        {new Date(event.start_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        {event.type && ` • ${event.type}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        {dayEvents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground italic">No hay eventos programados para hoy</div>
        )}
      </div>

      {dayTasks.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <h4 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2"><span>📋</span> Tareas del día</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dayTasks.map(task => (
              <div key={`task-${task.id}`}
                className={`p-3 rounded-xl border transition-all hover:shadow-md cursor-pointer flex items-start justify-between gap-3 ${getPriorityColor(task.id_Priority || task.priority)} ${task.state ? 'opacity-60 grayscale' : ''}`}
                role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()} onClick={() => onTaskClick(task)}>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm truncate ${task.state ? 'line-through' : ''}`}>{task.title}</h4>
                  {task.description && <p className="text-xs opacity-80 mt-1 line-clamp-1">{task.description}</p>}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${task.state ? 'bg-brand-100 text-brand-700' : 'bg-muted text-foreground'}`}>
                  {task.state ? 'Listo' : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
