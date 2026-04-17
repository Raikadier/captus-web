import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Plus, Clock, X, Bell, BellOff, Edit, Trash2 } from 'lucide-react'
import { useTheme } from '../../context/themeContext'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Textarea } from '../../ui/textarea'
import { Switch } from '../../ui/switch'
import apiClient from '../../shared/api/client'
import { useEvents } from '../../hooks/useEvents'

function EditEventModal({ onClose, onUpdate, event }) {
  const [title, setTitle] = useState(event.title)
  const [description, setDescription] = useState(event.description || '')
  const [date, setDate] = useState(new Date(event.start_date).toISOString().split('T')[0])
  const [time, setTime] = useState(new Date(event.start_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }))
  const [type, setType] = useState(event.type)
  const [notify, setNotify] = useState(event.notify || false)
  const [loading, setLoading] = useState(false)
  // const { darkMode } = useTheme()

  // Use hook for update but we need to pass data, not call directly here if we want to follow pattern?
  // But the modal handles its own submission in the current design.
  // We can use the props `onUpdate` which will likely call the hook in the parent or we can use the hook here.
  // The parent passes `handleUpdateEvent` which calls `setEvents`.
  // To use `useEvents` properly, we should call the API via `useEvents` hook methods.
  // But `useEvents` is initialized in the parent.
  // We'll update the parent's `handleUpdateEvent` to use the hook's `updateEvent`.
  // Wait, the modal is doing the API call currently. We should delegate that to the parent or use the hook here.
  // Let's use the hook in the parent and pass the function down.
  // Actually, the modal receives `onUpdate` which expects the updated event object.
  // I will change the props to receive the async update function or handle it internally if I use the hook here.
  // Ideally, Modals should be dumb or use the hook directly.
  // Let's keep the Modal "dumb-ish" regarding state management but it can call the async function passed from parent.

  const handleSubmit = async () => {
    if (title.trim() && date) {
      setLoading(true)
      const startDate = new Date(`${date}T${time}`)
      const eventData = {
        title,
        description: description || null,
        start_date: startDate.toISOString(),
        end_date: null,
        type,
        notify,
      }
      await onUpdate(event.id, eventData)
      setLoading(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300 border border-border">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Edit size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Editar Evento</h2>
                <p className="text-sm text-muted-foreground">Modifica los detalles del evento</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del evento"
                className="mt-1 bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option>Reunión</option>
                <option>Examen</option>
                <option>Entrega</option>
                <option>Clase</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha *</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label>Hora</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1 bg-background border-border text-foreground"
                />
              </div>
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu evento..."
                className="mt-1 bg-background border-border text-foreground"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="notify-edit"
                checked={notify}
                onCheckedChange={setNotify}
              />
              <Label htmlFor="notify-edit" className="flex items-center gap-2">
                {notify ? <Bell size={16} className="text-primary" /> : <BellOff size={16} />}
                Recibir notificaciones por email
              </Label>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!title.trim() || !date || loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? 'Actualizando...' : 'Actualizar Evento'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateEventModal({ onClose, onCreate, selectedDate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(selectedDate?.toISOString().split('T')[0] || '')
  const [time, setTime] = useState('09:00')
  const [type, setType] = useState('Reunión')
  const [notify, setNotify] = useState(false)
  const [loading, setLoading] = useState(false)
  // const { darkMode } = useTheme()

  const handleCreate = async () => {
    if (title.trim() && date) {
      setLoading(true)
      const startDate = new Date(`${date}T${time}`)
      const eventData = {
        title,
        description: description || null,
        start_date: startDate.toISOString(),
        end_date: null,
        type,
        notify,
      }
      await onCreate(eventData)
      setLoading(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300 border border-border">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Plus size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Nuevo Evento</h2>
                <p className="text-sm text-muted-foreground">Crea un evento en tu calendario</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del evento"
                className="mt-1 bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option>Reunión</option>
                <option>Examen</option>
                <option>Entrega</option>
                <option>Clase</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha *</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label>Hora</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1 bg-background border-border text-foreground"
                />
              </div>
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu evento..."
                className="mt-1 bg-background border-border text-foreground"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="notify"
                checked={notify}
                onCheckedChange={setNotify}
              />
              <Label htmlFor="notify" className="flex items-center gap-2">
                {notify ? <Bell size={16} className="text-primary" /> : <BellOff size={16} />}
                Recibir notificaciones por email
              </Label>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!title.trim() || !date || loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? 'Creando...' : 'Crear Evento'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [tasks, setTasks] = useState([])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(null)
  const [showTaskDetails, setShowTaskDetails] = useState(null)
  const [showEventDetails, setShowEventDetails] = useState(null)
  const [showDeleteEventConfirm, setShowDeleteEventConfirm] = useState(null)
  const [view, setView] = useState('week')
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState(null)
  const { darkMode } = useTheme()
  const { events, loading: eventsLoading, error: eventsError, createEvent, updateEvent, deleteEvent } = useEvents()

  const loadData = useCallback(async () => {
    try {
      setTasksLoading(true)
      setTasksError(null)
      const response = await apiClient.get('/tasks/pending?limit=50')
      if (response.data.success) {
        setTasks(response.data.data || [])
      } else {
        console.error('Tasks API error:', response.data.message)
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
      setTasksError('Error al cargar las tareas')
    } finally {
      setTasksLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()

    const handleEventUpdate = () => loadData()
    window.addEventListener('event-update', handleEventUpdate)
    return () => window.removeEventListener('event-update', handleEventUpdate)
  }, [loadData])

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const navigateMonth = (direction) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() + direction)
      return newDate
    })
  }

  const getTasksForDate = (date) => {
    if (!date) return []
    return tasks.filter((task) => {
      const taskDate = new Date(task.endDate || task.creationDate)
      return taskDate.toDateString() === date.toDateString()
    })
  }

  const getEventsForDate = (date) => {
    if (!date) return []
    return events.filter((event) => {
      const eventDate = new Date(event.start_date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const handleTaskClick = (task) => {
    setShowTaskDetails(task)
  }

  const handleEventClick = (event) => {
    setShowEventDetails(event)
  }

  const getPriorityColor = (priority) => {
    if (typeof priority === 'number') {
      switch (priority) {
        case 3: return 'bg-red-100 text-red-800 border-red-200'
        case 2: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 1: return 'bg-green-100 text-green-800 border-green-200'
        default: return 'bg-gray-100 text-gray-800 border-gray-200'
      }
    }
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-primary/10 text-primary border-primary/20'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEventColor = (type) => {
    switch (type) {
      case 'Examen': return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
      case 'Entrega': return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100';
      case 'Clase': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      default: return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100';
    }
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const handleCreateEvent = async (eventData) => {
    const result = await createEvent(eventData)
    if (!result.success) {
      alert(result.message)
    }
  }

  const handleUpdateEvent = async (id, eventData) => {
    const result = await updateEvent(id, eventData)
    if (!result.success) {
      alert(result.message)
    } else {
      setShowEditModal(null)
      // Also update the detail view if open
      if (showEventDetails && showEventDetails.id === id) {
        setShowEventDetails(result.data)
      }
    }
  }

  const handleDeleteEvent = (eventId) => {
    setShowDeleteEventConfirm(eventId)
  }

  const confirmDeleteEvent = async () => {
    const eventId = showDeleteEventConfirm
    setShowDeleteEventConfirm(null)
    try {
      const result = await deleteEvent(eventId)
      if (result.success) {
        setShowEventDetails(null)
      } else {
        alert('Error al eliminar el evento: ' + result.message)
      }
    } catch (err) {
      alert('Error al eliminar el evento')
      console.error('Error deleting event:', err)
    }
  }

  const getEventBlockColor = (type, index = 0) => {
    const colors = [
      { bg: 'bg-[#039BE5]', hover: 'hover:bg-[#0288D1]', text: 'text-white' },
      { bg: 'bg-[#7CB342]', hover: 'hover:bg-[#689F38]', text: 'text-white' },
      { bg: 'bg-[#8E24AA]', hover: 'hover:bg-[#7B1FA2]', text: 'text-white' },
      { bg: 'bg-[#E67C73]', hover: 'hover:bg-[#D32F2F]', text: 'text-white' },
      { bg: 'bg-[#F4511E]', hover: 'hover:bg-[#E64A19]', text: 'text-white' },
      { bg: 'bg-[#33B679]', hover: 'hover:bg-[#2E7D32]', text: 'text-white' },
    ]
    switch (type) {
      case 'Examen': return colors[3]
      case 'Entrega': return colors[4]
      case 'Clase': return colors[0]
      case 'Reunión': return colors[2]
      default: return colors[index % colors.length]
    }
  }

  const getTaskBlockColor = (priority) => {
    if (typeof priority === 'number') {
      switch (priority) {
        case 3: return { bg: 'bg-[#E67C73]', hover: 'hover:bg-[#D32F2F]', text: 'text-white' }
        case 2: return { bg: 'bg-[#D4AC0D]', hover: 'hover:bg-[#C7A500]', text: 'text-white' }
        case 1: return { bg: 'bg-[#33B679]', hover: 'hover:bg-[#2E7D32]', text: 'text-white' }
        default: return { bg: 'bg-[#9E9E9E]', hover: 'hover:bg-[#757575]', text: 'text-white' }
      }
    }
    return { bg: 'bg-[#039BE5]', hover: 'hover:bg-[#0288D1]', text: 'text-white' }
  }

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      return day
    })

    const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
    const hours = Array.from({ length: 15 }, (_, i) => i + 7)
    const hourHeight = 60

    const getEventsWithPositions = (day) => {
      const dayEvents = getEventsForDate(day)
      const dayTasks = getTasksForDate(day)

      const processedEvents = dayEvents.map((event, idx) => {
        const eventDate = new Date(event.start_date)
        const startHour = eventDate.getHours()
        const startMinute = eventDate.getMinutes()

        let duration = 1
        if (event.end_date) {
          const endDate = new Date(event.end_date)
          duration = (endDate - eventDate) / (1000 * 60 * 60)
        }

        const top = ((startHour - 7) * hourHeight) + ((startMinute / 60) * hourHeight)
        const height = Math.max(duration * hourHeight, 25)
        const color = getEventBlockColor(event.type, idx)

        return {
          ...event,
          top,
          height,
          color,
          isEvent: true,
          displayTime: eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        }
      })

      const processedTasks = dayTasks.map((task) => {
        const taskDate = new Date(task.endDate || task.creationDate)
        const startHour = taskDate.getHours() || 9
        const startMinute = taskDate.getMinutes() || 0

        const top = ((startHour - 7) * hourHeight) + ((startMinute / 60) * hourHeight)
        const height = 30
        const color = getTaskBlockColor(task.id_Priority || task.priority)

        return {
          ...task,
          top,
          height,
          color,
          isTask: true,
          isEvent: false,
          displayTime: taskDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        }
      })

      return [...processedEvents, ...processedTasks]
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col">
            <div className="flex border-b border-border sticky top-0 bg-card z-10">
              <div className="w-16 flex-shrink-0 py-2 text-center text-xs text-muted-foreground border-r border-border">
                GMT-05
              </div>
              {weekDays.map((day, index) => {
                const isToday = day.toDateString() === new Date().toDateString()
                const isSelected = day.toDateString() === selectedDate.toDateString()
                return (
                  <div
                    key={index}
                    className={`flex-1 text-center py-2 border-r border-border last:border-r-0 cursor-pointer transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="text-xs font-medium text-muted-foreground">
                      {dayNames[day.getDay()]}
                    </div>
                    <div className={`text-2xl font-medium mt-1 ${isToday
                      ? 'w-10 h-10 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center'
                      : 'text-foreground'
                      }`}>
                      {day.getDate()}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex">
              <div className="w-16 flex-shrink-0 border-r border-border">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="relative border-b border-border"
                    style={{ height: `${hourHeight}px` }}
                  >
                    <span className="absolute -top-2.5 right-2 text-xs text-muted-foreground font-medium">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>

              {weekDays.map((day, dayIndex) => {
                const items = getEventsWithPositions(day)
                const isSelected = day.toDateString() === selectedDate.toDateString()

                return (
                  <div
                    key={dayIndex}
                    className={`flex-1 relative border-r border-border last:border-r-0 ${isSelected ? 'bg-primary/5' : ''}`}
                    style={{ minHeight: `${hours.length * hourHeight}px` }}
                    onClick={() => setSelectedDate(day)}
                  >
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="absolute w-full border-b border-border/50"
                        style={{ top: `${(hour - 7) * hourHeight}px`, height: `${hourHeight}px` }}
                      />
                    ))}

                    {day.toDateString() === new Date().toDateString() && (
                      <div
                        className="absolute w-full flex items-center z-20"
                        style={{
                          top: `${((new Date().getHours() - 7) * hourHeight) + ((new Date().getMinutes() / 60) * hourHeight)}px`
                        }}
                      >
                        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                        <div className="flex-1 h-0.5 bg-red-500"></div>
                      </div>
                    )}

                    {items.map((item, itemIndex) => (
                      <div
                        key={item.isTask ? `task-${item.id}` : `event-${item.id}`}
                        className={`absolute left-1 right-1 rounded-lg px-2 py-1 cursor-pointer transition-all shadow-sm overflow-hidden ${item.color.bg} ${item.color.hover} ${item.color.text}`}
                        style={{
                          top: `${item.top}px`,
                          height: `${item.height}px`,
                          minHeight: '24px',
                          zIndex: 10 + itemIndex
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (item.isTask) {
                            handleTaskClick(item)
                          } else {
                            handleEventClick(item)
                          }
                        }}
                      >
                        <div className="text-xs font-semibold truncate">
                          {item.title}
                        </div>
                        {item.height > 35 && (
                          <div className="text-xs opacity-90 truncate">
                            {item.displayTime}{item.type && !item.isTask ? ` • ${item.type}` : ''}
                          </div>
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
    )
  }

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const dayTasks = getTasksForDate(selectedDate)
    const dayEvents = getEventsForDate(selectedDate)

    return (
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-xl font-bold mb-6 text-foreground border-b pb-4">
          {selectedDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </h3>
        <div className="space-y-4">
          {hours.map((hour) => {
            const hourEvents = dayEvents.filter(event => {
              const eventHour = new Date(event.start_date).getHours()
              return eventHour === hour
            })

            if (hourEvents.length === 0) return null // Optional: hide empty hours to save space or keep for structure

            return (
              <div key={hour} className="flex group">
                <div className="w-16 text-sm font-medium text-muted-foreground pt-2 border-r border-border pr-4">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 pl-4 pb-4 space-y-2 border-l border-transparent group-hover:border-border/50 -ml-[1px]">
                  {hourEvents.map((event) => (
                    <div
                      key={`event-${event.id}`}
                      className={`p-2 rounded-lg border cursor-pointer hover:opacity-80 ${getEventColor(event.type)}`}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="p-2 bg-card/50 rounded-lg backdrop-blur-sm">
                        <Clock size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">{event.title}</h4>
                        <p className="text-xs opacity-80">
                          {new Date(event.start_date).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {event.type && ` • ${event.type}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {/* If no events, show empty state for schedule */}
          {dayEvents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground italic">No hay eventos programados para hoy</div>
          )}
        </div>

        {/* Tasks section below */}
        {dayTasks.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <h4 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <span>📋</span> Tareas del día
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dayTasks.map((task) => (
                <div
                  key={`task-${task.id}`}
                  className={`p-3 rounded-xl border transition-all hover:shadow-md cursor-pointer flex items-start justify-between gap-3 ${getPriorityColor(task.id_Priority || task.priority)} ${task.state ? 'opacity-60 grayscale' : ''}`}
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-sm truncate ${task.state ? 'line-through' : ''}`}>{task.title}</h4>
                    {task.description && (
                      <p className="text-xs opacity-80 mt-1 line-clamp-1">{task.description}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${task.state ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                  >
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

  const handleDayClick = (date) => {
    setSelectedDate(date)
    setView('day')
  }

  if (tasksLoading || eventsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="rounded-xl shadow-sm p-6 mb-6 bg-card border border-border">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Cargando calendario...</span>
          </div>
        </div>
      </div>
    )
  }

  if (tasksError || eventsError) {
    return (
      <div className="p-6 space-y-6">
        <div className="rounded-xl shadow-sm p-6 mb-6 bg-card border border-border">
          <div className="flex items-center justify-center py-12">
            <div className="text-red-600 mb-4">Error: {tasksError || eventsError}</div>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="rounded-xl shadow-sm p-6 mb-6 bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Calendario
          </h1>
          <p className="mt-1 text-muted-foreground flex items-center gap-2">
            <span>{events.length} Eventos</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>{tasks.length} Tareas</span>
          </p>
        </div>

        <div className="flex space-x-2">
          {['month', 'week'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${view === v
                ? 'bg-primary/10 text-primary shadow-sm'
                : darkMode
                  ? 'text-gray-400 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              {v === 'month' ? 'Mes' : 'Semana'}
            </button>
          ))}
        </div>
      </div>

      {view === 'month' && (
        <div className="rounded-xl shadow-sm p-6 mb-6 bg-card border border-border">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-foreground capitalize">
                {monthNames[currentDate.getMonth()]} <span className="text-muted-foreground">{currentDate.getFullYear()}</span>
              </h2>
              <div className="flex items-center border rounded-md bg-background">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-1.5 hover:bg-muted rounded-l-md transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <div className="w-[1px] h-4 bg-border"></div>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-1.5 hover:bg-muted rounded-r-md transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}>
              Hoy
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center font-medium text-sm text-muted-foreground uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {getDaysInMonth(currentDate).map((date, index) => {
              if (!date) return <div key={index} className="bg-muted/10 rounded-xl" />

              const dayTasks = getTasksForDate(date)
              const dayEvents = getEventsForDate(date)
              const totalItems = dayTasks.length + dayEvents.length
              const isToday = date.toDateString() === new Date().toDateString()
              const isSelected = date.toDateString() === selectedDate.toDateString()

              return (
                <div
                  key={index}
                  className={`min-h-32 p-3 border-2 rounded-xl hover:shadow-md cursor-pointer transition-all duration-200 ${date && date.toDateString() === selectedDate.toDateString()
                    ? 'ring-2 ring-primary bg-primary/10 border-primary/20'
                    : date
                      ? 'border-border hover:border-primary/20 bg-card'
                      : 'border-transparent'
                    }`}
                  onClick={() => date && handleDayClick(date)}
                >
                  {date && (
                    <>
                      <div
                        className={`text-sm font-semibold mb-2 ${date.toDateString() === new Date().toDateString()
                          ? 'w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center'
                          : 'text-foreground'
                          }`}
                      >
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {/* Tasks - Show max 1 */}
                        {dayTasks.slice(0, 1).map((task) => (
                          <div
                            key={`task-${task.id}`}
                            className={`text-xs p-1.5 rounded-lg border ${getPriorityColor(task.id_Priority || task.priority)} ${task.state ? 'line-through opacity-60' : ''
                              } cursor-pointer hover:opacity-80`}
                            title={task.title}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTaskClick(task)
                            }}
                          >
                            📋 {task.title.length > 8 ? `${task.title.substring(0, 8)}...` : task.title}
                          </div>
                        ))}

                        {/* Tasks */}
                        {dayTasks.slice(0, Math.max(0, 2 - dayEvents.slice(0, 2).length)).map((task) => (
                          <div
                            key={`task-${task.id}`}
                            className={`text-[10px] px-1.5 py-1 rounded border truncate transition-opacity hover:opacity-80 ${getPriorityColor(task.id_Priority || task.priority)} ${task.state ? 'line-through opacity-60' : ''
                              }`}
                            title={task.title}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTaskClick(task)
                            }}
                          >
                            {task.title}
                          </div>
                        ))}

                        {totalItems > 2 && (
                          <div className="text-[10px] text-muted-foreground font-medium pl-1">+{totalItems - 2} más</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {view === 'week' && (
            <div className="rounded-xl shadow-sm p-6 mb-6 bg-card border border-border">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate)
                    newDate.setDate(newDate.getDate() - 7)
                    setCurrentDate(newDate)
                  }}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>

                <h2 className="text-2xl font-bold text-foreground">
                  Semana del {currentDate.toLocaleDateString('es-ES')}
                </h2>

                <button
                  onClick={() => {
                    const newDate = new Date(currentDate)
                    newDate.setDate(newDate.getDate() + 7)
                    setCurrentDate(newDate)
                  }}
                  className="p-2 rounded-lg transition-colors hover:bg-muted"
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              </div>
              {renderWeekView()}
            </div>
          )}

          {view === 'day' && renderDayView()}

          {selectedDate && (
            <div className="rounded-xl shadow-sm p-6 bg-card border border-border">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-primary/10' : 'bg-primary/10'
                  }`}>
                  <Clock className={`w-6 h-6 text-primary`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {selectedDate.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getTasksForDate(selectedDate).length + getEventsForDate(selectedDate).length} elementos programados
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {getTasksForDate(selectedDate).length === 0 && getEventsForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No hay elementos para este día
                    </p>
                    <button
                      className="mt-4 text-green-600 hover:text-green-700 font-medium text-sm"
                      onClick={() => setShowCreateModal(true)}
                    >
                      Agregar evento
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Tasks */}
                    {getTasksForDate(selectedDate).map((task) => (
                      <div
                        key={`task-${task.id}`}
                        className={`p-4 rounded-xl border-2 ${getPriorityColor(task.id_Priority || task.priority)} ${task.state ? 'opacity-60' : ''} cursor-pointer`}
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📋</span>
                            <div>
                              <h4 className={`font-semibold ${task.state ? 'line-through' : ''}`}>{task.title}</h4>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${task.state ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}
                          >
                            {task.state ? 'Completada' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Events */}
                    {getEventsForDate(selectedDate).map((event) => (
                      <div
                        key={`event-${event.id}`}
                        className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 cursor-pointer"
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📅</span>
                            <div>
                              <h4 className="font-semibold">{event.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(event.start_date).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                                {event.type && ` • ${event.type}`}
                              </p>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                              )}
                            </div>
                          </div>
                          {event.notify && (
                            <span className="px-3 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">
                              🔔 Notificaciones
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Task Details Modal */}
          {showTaskDetails && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300 border border-border">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📋</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Detalles de Tarea</h2>
                        <p className="text-sm text-muted-foreground">
                          {new Date(showTaskDetails.endDate || showTaskDetails.creationDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setShowTaskDetails(null)}>
                      <X size={20} />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{showTaskDetails.title}</h3>
                      {showTaskDetails.description && (
                        <p className="text-muted-foreground mt-2">{showTaskDetails.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${showTaskDetails.state ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {showTaskDetails.state ? 'Completada' : 'Pendiente'}
                      </span>
                      {showTaskDetails.id_Priority && (
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityColor(showTaskDetails.id_Priority)}`}>
                          Prioridad {showTaskDetails.id_Priority}
                        </span>
                      )}
                    </div>

                    {showTaskDetails.Category && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Categoría:</strong> {showTaskDetails.Category.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Event Details Modal */}
          {showEventDetails && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300 border border-border">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getEventColor(showEventDetails.type).split(' ')[0]}`}>
                        <Calendar size={24} className={getEventColor(showEventDetails.type).split(' ')[1]} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Detalles del Evento</h2>
                        <p className="text-sm text-muted-foreground">
                          {new Date(showEventDetails.start_date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setShowEventDetails(null)}>
                      <X size={20} />
                    </Button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">{showEventDetails.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded border font-medium ${getEventColor(showEventDetails.type)}`}>
                          {showEventDetails.type || 'Evento'}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(showEventDetails.start_date).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {showEventDetails.description && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-foreground/80 leading-relaxed">
                          {showEventDetails.description}
                        </div>
                      )}
                    </div>

                    {showEventDetails.notify && (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg border border-green-100">
                        <Bell size={14} />
                        <span className="font-medium">Notificaciones activadas</span>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => handleEditEvent(showEventDetails)}
                        className="flex-1"
                      >
                        <Edit size={16} className="mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteEvent(showEventDetails.id)}
                        className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showCreateModal && (
            <CreateEventModal
              onClose={() => setShowCreateModal(false)}
              onCreate={handleCreateEvent}
              selectedDate={selectedDate}
            />
          )}

          {showEditModal && (
            <EditEventModal
              onClose={() => setShowEditModal(null)}
              onUpdate={handleUpdateEvent}
              event={showEditModal}
            />
          )}

          {showDeleteEventConfirm && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300 border border-border">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <Trash2 size={24} className="text-red-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Eliminar Evento</h2>
                        <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setShowDeleteEventConfirm(null)}>
                      <X size={20} />
                    </Button>
                  </div>

                  <p className="text-muted-foreground mb-6">
                    ¿Estás seguro de que quieres eliminar el evento <strong className="text-foreground">{events.find(e => e.id === showDeleteEventConfirm)?.title}</strong>?
                    Se perderá permanentemente.
                  </p>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowDeleteEventConfirm(null)}>
                      Cancelar
                    </Button>
                    <Button onClick={confirmDeleteEvent} className="bg-red-600 hover:bg-red-700">
                      <Trash2 size={16} className="mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
    </div>
  )
}
