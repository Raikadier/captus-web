/**
 * Task details, event details, and delete-confirm modals for CalendarPage.
 */
import React from 'react'
import { Bell, Calendar, Clock, Edit, Trash2, X } from 'lucide-react'
import { Button } from '../../../ui/button'
import { getPriorityColor, getEventColor } from '../helpers/calendarUtils'

export function TaskDetailsModal({ task, onClose }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300 border border-border">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><span className="text-2xl">📋</span></div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Detalles de Tarea</h2>
                <p className="text-sm text-muted-foreground">{new Date(task.endDate || task.creationDate).toLocaleDateString('es-ES')}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{task.title}</h3>
              {task.description && <p className="text-muted-foreground mt-2">{task.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-xs rounded-full font-medium ${task.state ? 'bg-green-100 text-green-800' : 'bg-muted text-foreground'}`}>
                {task.state ? 'Completada' : 'Pendiente'}
              </span>
              {task.id_Priority && (
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityColor(task.id_Priority)}`}>
                  Prioridad {task.id_Priority}
                </span>
              )}
            </div>
            {task.Category && <div className="text-sm text-muted-foreground"><strong>Categoría:</strong> {task.Category.name}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export function EventDetailsModal({ event, onClose, onEdit, onDelete }) {
  const colorClasses = getEventColor(event.type).split(' ')
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300 border border-border">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[0]}`}>
                <Calendar size={24} className={colorClasses[1]} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Detalles del Evento</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date(event.start_date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
          </div>
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-1">{event.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-1 rounded border font-medium ${getEventColor(event.type)}`}>{event.type || 'Evento'}</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(event.start_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {event.description && (
                <div className="mt-4 p-3 bg-muted/50 rounded-xl text-sm text-foreground/80 leading-relaxed">{event.description}</div>
              )}
            </div>
            {event.notify && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg border border-green-100">
                <Bell size={14} /><span className="font-medium">Notificaciones activadas</span>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => onEdit(event)} className="flex-1">
                <Edit size={16} className="mr-2" />Editar
              </Button>
              <Button variant="ghost" onClick={() => onDelete(event.id)} className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700">
                <Trash2 size={16} className="mr-2" />Eliminar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DeleteEventModal({ eventTitle, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300 border border-border">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"><Trash2 size={24} className="text-red-600" /></div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Eliminar Evento</h2>
                <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}><X size={20} /></Button>
          </div>
          <p className="text-muted-foreground mb-6">
            ¿Estás seguro de que quieres eliminar el evento <strong className="text-foreground">{eventTitle}</strong>? Se perderá permanentemente.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
              <Trash2 size={16} className="mr-2" />Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
