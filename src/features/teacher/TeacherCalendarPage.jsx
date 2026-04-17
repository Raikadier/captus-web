import React, { useEffect, useState } from 'react'
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import apiClient from '../../shared/api/client'
import Loading from '../../ui/loading'

export default function TeacherCalendarPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiClient.get('/events')
        setEvents(response.data.data || [])
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  if (loading) return <Loading message="Cargando calendario..." />

  return (
    <div className="p-6 space-y-6">
      <div className="bg-card rounded-xl shadow-sm p-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <CalendarIcon className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendario docente</h1>
          <p className="text-sm text-muted-foreground">Eventos académicos próximos</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Próximos eventos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {events.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay eventos próximos programados.
            </div>
          )}
          {events.map((e) => (
            <div key={e.id || e.id_Event} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex items-start justify-between group">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{e.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {new Date(e.date).toLocaleDateString()}
                  </span>
                  {e.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {e.time}
                    </span>
                  )}
                  {e.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {e.location}
                    </span>
                  )}
                </div>
                {e.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{e.description}</p>
                )}
              </div>
              <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                {e.type || 'Evento'}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
