/**
 * Shared pure utilities for the calendar feature.
 * No React imports — safe to use anywhere.
 */

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function getDaysInMonth(date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []
  for (let i = 0; i < firstDay.getDay(); i++) days.push(null)
  for (let day = 1; day <= lastDay.getDate(); day++) days.push(new Date(year, month, day))
  return days
}

export function getPriorityColor(priority) {
  if (typeof priority === 'number') {
    switch (priority) {
      case 3: return 'bg-red-100 text-red-800 border-red-200'
      case 2: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 1: return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }
  switch (priority) {
    case 'high':   return 'bg-red-100 text-red-800 border-red-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':    return 'bg-primary/10 text-primary border-primary/20'
    default:       return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getEventColor(type) {
  switch (type) {
    case 'Examen':  return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
    case 'Entrega': return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
    case 'Clase':   return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
    default:        return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
  }
}

const BLOCK_COLORS = [
  { bg: 'bg-[#039BE5]', hover: 'hover:bg-[#0288D1]', text: 'text-white' },
  { bg: 'bg-[#7CB342]', hover: 'hover:bg-[#689F38]', text: 'text-white' },
  { bg: 'bg-[#8E24AA]', hover: 'hover:bg-[#7B1FA2]', text: 'text-white' },
  { bg: 'bg-[#E67C73]', hover: 'hover:bg-[#D32F2F]', text: 'text-white' },
  { bg: 'bg-[#F4511E]', hover: 'hover:bg-[#E64A19]', text: 'text-white' },
  { bg: 'bg-[#33B679]', hover: 'hover:bg-[#2E7D32]', text: 'text-white' },
]

export function getEventBlockColor(type, index = 0) {
  switch (type) {
    case 'Examen':  return BLOCK_COLORS[3]
    case 'Entrega': return BLOCK_COLORS[4]
    case 'Clase':   return BLOCK_COLORS[0]
    case 'Reunión': return BLOCK_COLORS[2]
    default:        return BLOCK_COLORS[index % BLOCK_COLORS.length]
  }
}

export function getTaskDate(task) {
  const raw = task?.due_date ?? task?.endDate ?? task?.creationDate ?? task?.created_at
  if (!raw) return null
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? null : d
}

export function isTaskCompleted(task) {
  return Boolean(task?.completed ?? task?.state)
}

/** True when due date is before today (local). Tasks due today are not overdue. */
export function isTaskOverdue(dueDate, completed = false) {
  if (!dueDate || completed) return false

  const raw = String(dueDate).split('T')[0]
  const [year, month, day] = raw.split('-').map(Number)
  if (!year || !month || !day) return false

  const due = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return due < today
}

export function getTaskPriorityId(task) {
  return task?.priority_id ?? task?.id_Priority ?? task?.priority
}

export function taskMatchesDay(task, date) {
  const taskDate = getTaskDate(task)
  if (!taskDate || !date) return false
  return taskDate.toDateString() === date.toDateString()
}

export function getTaskBlockColor(priority) {
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
