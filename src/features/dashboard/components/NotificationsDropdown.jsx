import React, { useEffect, useRef, useState, useCallback } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { ScrollArea } from '../../../ui/scroll-area'
import { Button } from '../../../ui/button'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import apiClient from '../../../shared/api/client'

export default function NotificationsDropdown({ isOpen, onClose, onUnreadChange }) {
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const response = await apiClient.get('/notifications')
      const data = response.data
      const list = Array.isArray(data) ? data : data.data || []
      setNotifications(list)
      if (onUnreadChange) {
        onUnreadChange(list.filter((n) => !n.read).length)
      }
    } catch (error) {
      console.error('Error loading notifications', error)
    } finally {
      setLoading(false)
    }
  }, [user, onUnreadChange])

  useEffect(() => {
    if (!isOpen) return

    fetchNotifications()

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose, fetchNotifications])

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation()
    try {
      await apiClient.put(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      if (onUnreadChange) {
        const nextCount = notifications.filter((n) => n.id !== id && !n.read).length
        onUnreadChange(nextCount)
      }
    } catch (error) {
      console.error('Error marking as read', error)
    }
  }

  if (!isOpen) return null

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-[340px] bg-card rounded-xl shadow-lg border border-border z-50 animate-in fade-in-0 zoom-in-95 duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Notificaciones</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {unreadCount} nuevas
            </span>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[300px]">
        {loading ? (
          <div className="flex justify-center items-center h-full p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No tienes notificaciones
          </div>
        ) : (
          <div className="p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer group ${notification.read ? 'bg-card hover:bg-muted' : 'bg-primary/10 hover:bg-primary/20'}`}
              >
                {/* Unread indicator */}
                <div className="flex-shrink-0 mt-1">
                  {!notification.read ? (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  ) : (
                    <div className="w-2 h-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground mb-0.5">{notification.title}</p>
                  <p className="text-sm text-muted-foreground mb-1 line-clamp-2">{notification.body}</p>
                  <p className="text-xs text-muted-foreground">{new Date(notification.created_at).toLocaleString()}</p>
                </div>

                {/* Mark as read icon (appears on hover) */}
                {!notification.read && (
                  <button
                    onClick={(e) => handleMarkAsRead(e, notification.id)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Marcar como leída"
                  >
                    <CheckCircle size={16} className="text-muted-foreground hover:text-primary" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          className="w-full text-sm text-primary hover:text-primary/90 hover:bg-primary/10"
          onClick={() => {
            onClose()
            navigate('/notifications')
          }}
        >
          Ver todas las notificaciones →
        </Button>
      </div>
    </div>
  )
}
