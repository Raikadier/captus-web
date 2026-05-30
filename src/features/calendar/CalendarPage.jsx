import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useTheme } from '../../context/themeContext'
import { Button } from '../../ui/button'
import apiClient from '../../shared/api/client'
import { useEvents } from '../../hooks/useEvents'
import {
  MONTH_NAMES, DAY_NAMES_SHORT, getDaysInMonth,
  getPriorityColor, getEventColor, getEventBlockColor, getTaskBlockColor,
} from './helpers/calendarUtils'
import { CreateEventModal, EditEventModal } from './components/EventFormModal'
import CalendarWeekView from './components/CalendarWeekView'
import CalendarDayView from './components/CalendarDayView'
import DayPanel from './components/DayPanel'
import { TaskDetailsModal, EventDetailsModal, DeleteEventModal } from './components/CalendarModals'

export default function CalendarPage() {
  const { darkMode } = useTheme()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [tasks, setTasks] = useState([])
  const [view, setView] = useState('week')
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(null)
  const [showTaskDetails, setShowTaskDetails] = useState(null)
  const [showEventDetails, setShowEventDetails] = useState(null)
  const [showDeleteEventConfirm, setShowDeleteEventConfirm] = useState(null)

  const { events, loading: eventsLoading, error: eventsError, createEvent, updateEvent, deleteEvent } = useEvents()

  const loadData = useCallback(async () => {
    try {
      setTasksLoading(true); setTasksError(null)
      const response = await apiClient.get('/tasks/pending?limit=50')
      if (response.data.success) setTasks(response.data.data || [])
    } catch (error) {
      setTasksError('Error al cargar las tareas')
    } finally {
      setTasksLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const handler = () => loadData()
    window.addEventListener('event-update', handler)
    return () => window.removeEventListener('event-update', handler)
  }, [loadData])

  const handleCreateEvent = async (eventData) => {
    const result = await createEvent(eventData)
    if (!result.success) alert(result.message)
  }

  const handleUpdateEvent = async (id, eventData) => {
    const result = await updateEvent(id, eventData)
    if (!result.success) {
      alert(result.message)
    } else {
      setShowEditModal(null)
      if (showEventDetails?.id === id) setShowEventDetails(result.data)
    }
  }

  const handleDeleteEvent = (eventId) => setShowDeleteEventConfirm(eventId)

  const confirmDeleteEvent = async () => {
    const eventId = showDeleteEventConfirm
    setShowDeleteEventConfirm(null)
    try {
      const result = await deleteEvent(eventId)
      if (result.success) setShowEventDetails(null)
      else alert('Error al eliminar el evento: ' + result.message)
    } catch (err) {
      alert('Error al eliminar el evento')
    }
  }

  const navigateMonth = (dir) => {
    setCurrentDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + dir); return d })
  }

  if (tasksLoading || eventsLoading) {
    return (
      <div className="p-6">
        <div className="rounded-xl shadow-sm p-6 bg-card border border-border flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Cargando calendario...</span>
        </div>
      </div>
    )
  }

  if (tasksError || eventsError) {
    return (
      <div className="p-6">
        <div className="rounded-xl shadow-sm p-6 bg-card border border-border flex flex-col items-center py-12">
          <div className="text-destructive mb-4">Error: {tasksError || eventsError}</div>
          <button onClick={loadData} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Reintentar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="rounded-xl shadow-sm p-6 mb-6 bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Calendario</h1>
          <p className="mt-1 text-muted-foreground flex items-center gap-2">
            <span>{events.length} Eventos</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>{tasks.length} Tareas</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex space-x-2">
            {['month', 'week'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                  view === v ? 'bg-primary/10 text-primary shadow-sm' : darkMode ? 'text-slate-400 hover:bg-gray-700' : 'text-muted-foreground hover:bg-background'
                }`}>
                {v === 'month' ? 'Mes' : 'Semana'}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90">
            <Plus size={16} className="mr-2" />Nuevo Evento
          </Button>
        </div>
      </div>

      {/* Month view */}
      {view === 'month' && (
        <div className="rounded-xl shadow-sm p-6 mb-6 bg-card border border-border">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-foreground capitalize">
                {MONTH_NAMES[currentDate.getMonth()]} <span className="text-muted-foreground">{currentDate.getFullYear()}</span>
              </h2>
              <div className="flex items-center border rounded-md bg-background">
                <button onClick={() => navigateMonth(-1)} className="p-1.5 hover:bg-muted rounded-l-md transition-colors">
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <div className="w-[1px] h-4 bg-border"></div>
                <button onClick={() => navigateMonth(1)} className="p-1.5 hover:bg-muted rounded-r-md transition-colors">
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()) }}>Hoy</Button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {DAY_NAMES_SHORT.map(day => (
              <div key={day} className="text-center font-medium text-sm text-muted-foreground uppercase tracking-wider">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth(currentDate).map((date, index) => {
              if (!date) return <div key={index} className="bg-muted/10 rounded-xl" />
              const dayTasks = tasks.filter(t => new Date(t.endDate || t.creationDate).toDateString() === date.toDateString())
              const dayEvents = events.filter(e => new Date(e.start_date).toDateString() === date.toDateString())
              const totalItems = dayTasks.length + dayEvents.length
              const isToday = date.toDateString() === new Date().toDateString()
              const isSelected = date.toDateString() === selectedDate.toDateString()
              return (
                <div key={index}
                  className={`min-h-32 p-3 border-2 rounded-xl hover:shadow-md cursor-pointer transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-primary bg-primary/10 border-primary/20' : 'border-border hover:border-primary/20 bg-card'
                  }`}
                  role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()} onClick={() => { setSelectedDate(date); setView('day') }}>
                  <div className={`text-sm font-semibold mb-2 ${isToday ? 'w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center' : 'text-foreground'}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 1).map(task => (
                      <div key={`task-${task.id}`}
                        className={`text-xs p-1.5 rounded-lg border ${getPriorityColor(task.id_Priority || task.priority)} ${task.state ? 'line-through opacity-60' : ''} cursor-pointer hover:opacity-80`}
                        title={task.title}
                        role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()} onClick={(e) => { e.stopPropagation(); setShowTaskDetails(task) }}>
                        📋 {task.title.length > 8 ? `${task.title.substring(0, 8)}...` : task.title}
                      </div>
                    ))}
                    {dayEvents.slice(0, 2 - Math.min(dayTasks.length, 1)).map(event => (
                      <div key={`event-${event.id}`}
                        className={`text-[10px] px-1.5 py-1 rounded border truncate transition-opacity hover:opacity-80 ${getEventColor(event.type)}`}
                        title={event.title}
                        onClick={(e) => { e.stopPropagation(); setShowEventDetails(event) }}>
                        {event.title}
                      </div>
                    ))}
                    {totalItems > 2 && <div className="text-[10px] text-muted-foreground font-medium pl-1">+{totalItems - 2} más</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Week view */}
      {view === 'week' && (
        <CalendarWeekView
          currentDate={currentDate} setCurrentDate={setCurrentDate}
          selectedDate={selectedDate} setSelectedDate={setSelectedDate}
          tasks={tasks} events={events}
          getEventBlockColor={getEventBlockColor} getTaskBlockColor={getTaskBlockColor}
          onTaskClick={setShowTaskDetails} onEventClick={setShowEventDetails}
        />
      )}

      {/* Day view */}
      {view === 'day' && (
        <CalendarDayView
          selectedDate={selectedDate}
          tasks={tasks} events={events}
          onTaskClick={setShowTaskDetails} onEventClick={setShowEventDetails}
        />
      )}

      {/* Selected date panel */}
      <DayPanel
        selectedDate={selectedDate}
        tasks={tasks} events={events}
        onTaskClick={setShowTaskDetails} onEventClick={setShowEventDetails}
        onAddEvent={() => setShowCreateModal(true)}
      />

      {/* Modals */}
      {showTaskDetails && <TaskDetailsModal task={showTaskDetails} onClose={() => setShowTaskDetails(null)} />}
      {showEventDetails && (
        <EventDetailsModal
          event={showEventDetails}
          onClose={() => setShowEventDetails(null)}
          onEdit={(event) => { setShowEditModal(event); setShowEventDetails(null) }}
          onDelete={handleDeleteEvent}
        />
      )}
      {showDeleteEventConfirm && (
        <DeleteEventModal
          eventTitle={events.find(e => e.id === showDeleteEventConfirm)?.title}
          onConfirm={confirmDeleteEvent}
          onCancel={() => setShowDeleteEventConfirm(null)}
        />
      )}
      {showCreateModal && <CreateEventModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateEvent} selectedDate={selectedDate} />}
      {showEditModal && <EditEventModal onClose={() => setShowEditModal(null)} onUpdate={handleUpdateEvent} event={showEditModal} />}
    </div>
  )
}
