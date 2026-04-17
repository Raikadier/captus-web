import { useState, useEffect, useCallback } from 'react'
import apiClient from '../shared/api/client'

export function useEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/events')
      if (response.data.success) {
        setEvents(response.data.data || [])
      } else {
        setError(response.data.message || 'Error fetching events')
      }
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Error al cargar los eventos')
    } finally {
      setLoading(false)
    }
  }, [])

  const createEvent = async (eventData) => {
    setLoading(true)
    try {
      const response = await apiClient.post('/events', eventData)
      if (response.data.success) {
        await fetchEvents()
        return { success: true, data: response.data.data }
      } else {
        return { success: false, message: response.data.message }
      }
    } catch (err) {
      console.error('Error creating event:', err)
      return { success: false, message: 'Error al crear el evento' }
    } finally {
      setLoading(false)
    }
  }

  const updateEvent = async (id, eventData) => {
    setLoading(true)
    try {
      const response = await apiClient.put(`/events/${id}`, eventData)
      if (response.data.success) {
        await fetchEvents()
        return { success: true, data: response.data.data }
      } else {
        return { success: false, message: response.data.message }
      }
    } catch (err) {
      console.error('Error updating event:', err)
      return { success: false, message: 'Error al actualizar el evento' }
    } finally {
      setLoading(false)
    }
  }

  const deleteEvent = async (id) => {
    setLoading(true)
    try {
      const response = await apiClient.delete(`/events/${id}`)
      if (response.data.success) {
        await fetchEvents()
        return { success: true }
      } else {
        return { success: false, message: response.data.message }
      }
    } catch (err) {
      console.error('Error deleting event:', err)
      return { success: false, message: 'Error al eliminar el evento' }
    } finally {
      setLoading(false)
    }
  }

  // Load events on mount
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchEvents
  }
}
