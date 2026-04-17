import React, { useEffect, useState } from 'react'
import apiClient from '../../shared/api/client'
import { Card } from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { CheckCircle, Bell, Calendar, Clock, Check, Trash2, Filter } from 'lucide-react'
import Loading from '../../ui/loading'
import { FadeIn, StaggerContainer, StaggerItem } from '../../shared/components/animations/MotionComponents'
import { useTheme } from '../../context/themeContext'

export default function NotificationsPage() {
  const { darkMode } = useTheme()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications')
      const data = response.data
      setNotifications(Array.isArray(data) ? data : data.data || [])
    } catch (error) {
      console.error('Error fetching notifications', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (error) {
      console.error('Error marking read', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read)
    await Promise.all(unread.map(n => handleMarkAsRead(n.id)))
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'read') return n.read
    return true
  })

  if (loading) return <Loading fullScreen message="Cargando notificaciones..." />

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-background' : 'bg-[#F6F7FB]'}`}>
      <div className="max-w-5xl mx-auto p-6 md:p-8 pb-24">

        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notificaciones</h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                Mantente al día con tus actividades académicas y personales
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                className={`${darkMode ? 'bg-card border-gray-700 hover:bg-gray-800 text-gray-300' : 'bg-white hover:bg-gray-50'}`}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar todas como leídas
              </Button>
            </div>
          </div>
        </FadeIn>

        {/* Filters */}
        <FadeIn delay={0.1}>
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'unread', label: 'No leídas' },
              { id: 'read', label: 'Leídas' }
            ].map((f) => (
              <Button
                key={f.id}
                variant={filter === f.id ? 'default' : 'ghost'}
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-6 ${filter === f.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : `${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`
                  }`}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </FadeIn>

        <StaggerContainer className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <FadeIn>
              <div className={`text-center py-16 rounded-2xl border-2 border-dashed ${darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <Bell className={`h-8 w-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                </div>
                <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sin notificaciones</h3>
                <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  No tienes notificaciones {filter !== 'all' ? 'en esta categoría' : ''}
                </p>
              </div>
            </FadeIn>
          ) : (
            filteredNotifications.map((notification) => (
              <StaggerItem key={notification.id}>
                <Card
                  className={`p-5 transition-all duration-200 group relative overflow-hidden border-0 ${!notification.read
                    ? darkMode
                      ? 'bg-blue-900/10 border-l-4 border-l-blue-500 shadow-lg'
                      : 'bg-white border-l-4 border-l-blue-500 shadow-md'
                    : darkMode
                      ? 'bg-card hover:bg-gray-800/80'
                      : 'bg-white hover:shadow-md'
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl flex-shrink-0 ${!notification.read
                      ? darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                      : darkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-500'
                      }`}>
                      <Bell size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className={`font-semibold text-lg leading-tight ${!notification.read
                          ? darkMode ? 'text-white' : 'text-gray-900'
                          : darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          {notification.title}
                        </h3>
                        <span className={`text-xs flex items-center gap-1 whitespace-nowrap ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          <Clock size={12} />
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                      </div>

                      <p className={`mt-2 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {notification.body}
                      </p>

                      {notification.event_type && (
                        <div className="mt-3 flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={`text-xs font-medium px-2.5 py-0.5 rounded-md ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                              }`}
                          >
                            {notification.event_type.replace('_', ' ')}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {!notification.read && (
                      <div className="flex flex-col gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Marcar como leída"
                          className={`h-8 w-8 ${darkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/20' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                        >
                          <CheckCircle size={18} />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </StaggerItem>
            ))
          )}
        </StaggerContainer>
      </div>
    </div>
  )
}
