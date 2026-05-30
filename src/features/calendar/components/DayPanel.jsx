import React from 'react'
import { Calendar, Clock } from 'lucide-react'
import { getPriorityColor } from '../helpers/calendarUtils'

export default function DayPanel({ selectedDate, tasks, events, onTaskClick, onEventClick, onAddEvent }) {
  const dayTasks = tasks.filter(t => new Date(t.endDate || t.creationDate).toDateString() === selectedDate.toDateString())
  const dayEvents = events.filter(e => new Date(e.start_date).toDateString() === selectedDate.toDateString())

  return (
    <div className="rounded-xl shadow-sm p-6 bg-card border border-border">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10">
          <Clock className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">
            {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          <p className="text-sm text-muted-foreground">{dayTasks.length + dayEvents.length} elementos programados</p>
        </div>
      </div>

      <div className="space-y-3">
        {dayTasks.length === 0 && dayEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No hay elementos para este día</p>
            <button className="mt-4 text-green-600 hover:text-green-700 font-medium text-sm" onClick={onAddEvent}>Agregar evento</button>
          </div>
        ) : (
          <>
            {dayTasks.map(task => (
              <div key={`task-${task.id}`}
                className={`p-4 rounded-xl border-2 ${getPriorityColor(task.id_Priority || task.priority)} ${task.state ? 'opacity-60' : ''} cursor-pointer`}
                role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()} onClick={() => onTaskClick(task)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    <div>
                      <h4 className={`font-semibold ${task.state ? 'line-through' : ''}`}>{task.title}</h4>
                      {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${task.state ? 'bg-green-100 text-green-800' : 'bg-muted text-foreground'}`}>
                    {task.state ? 'Completada' : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
            {dayEvents.map(event => (
              <div key={`event-${event.id}`} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer" role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()} onClick={() => onEventClick(event)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    <div>
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(event.start_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        {event.type && ` • ${event.type}`}
                      </p>
                      {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
                    </div>
                  </div>
                  {event.notify && <span className="px-3 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">🔔 Notificaciones</span>}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
