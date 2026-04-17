import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Calendar as CalendarIcon, CheckSquare, Sparkles, StickyNote, Clock } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { Progress } from '../../../ui/progress';
import NotificationsDropdown from './NotificationsDropdown';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/themeContext';
import apiClient from '../../../shared/api/client';
import { useSubTasks } from '../../../hooks/useSubTasks';
import { FadeIn, StaggerContainer, StaggerItem } from '../../../shared/components/animations/MotionComponents';

function getCurrentDate() {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];
  const now = new Date();
  return `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
}

function StatCard({ icon, label, value, bgColor }) {
  return (
    <Card className="p-4 border border-border rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <div className={`${bgColor} p-3 rounded-lg`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function TaskItem({ task, onClick }) {
  const { progress, completedCount, totalCount } = useSubTasks(task.id);

  return (
    <StaggerItem
      className="p-4 border rounded-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-md border-border hover:border-primary bg-card"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-1">
        <h3 className="text-base font-semibold text-foreground">
          {task.title}
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
          {task.Priority?.name || 'Sin prioridad'}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {task.state ? 'Completada' : 'Pendiente'}
        </span>
      </div>

      {/* Subtasks Progress */}
      {totalCount > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Subtareas: {completedCount}/{totalCount}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center">
          <CalendarIcon size={14} className="mr-1.5 text-primary" />
          {task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }) : 'Sin fecha'}
        </div>
        {task.subject && (
          <div className="flex items-center">
            <CheckSquare size={14} className="mr-1.5 text-primary" />
            {task.subject}
          </div>
        )}
      </div>
    </StaggerItem>
  );
}

const HomePage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const [pendingTasks, setPendingTasks] = useState([])
  const [stats, setStats] = useState({
    totalTasks: 0,
    totalNotes: 0,
    upcomingEvents: 0,
    activeReminders: 0
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { darkMode } = useTheme()
  const [unreadCount, setUnreadCount] = useState(0)

  const handleToggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev)
  }, [])

  const handleCloseDropdown = useCallback(() => {
    setIsDropdownOpen(false)
  }, [])

  useEffect(() => {
    const name = user?.user_metadata?.name || user?.name;
    if (name) {
      setUserName(name.split(' ')[0]) // Solo el primer nombre
    }
    loadData()
    loadUnread()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load both tasks and stats in parallel for better performance
      const [tasksResponse, statsResponse] = await Promise.allSettled([
        apiClient.get('/tasks/pending?limit=3'),
        apiClient.get('/statistics/home-page')
      ])

      // Handle tasks response
      if (tasksResponse.status === 'fulfilled' && tasksResponse.value.data.success) {
        setPendingTasks(tasksResponse.value.data.data)
      } else {
        console.error('Error loading tasks:', tasksResponse.reason || tasksResponse.value?.data)
        // Don't fail completely if tasks fail to load
      }

      // Handle stats response
      if (statsResponse.status === 'fulfilled' && statsResponse.value.data.success) {
        setStats(statsResponse.value.data.data)
      } else {
        console.error('Error loading stats:', statsResponse.reason || statsResponse.value?.data)
        // Don't fail completely if stats fail to load
      }
    } catch (error) {
      console.error('Error in loadData:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUnread = async () => {
    try {
      const response = await apiClient.get('/notifications')
      const list = Array.isArray(response.data) ? response.data : response.data?.data || []
      setUnreadCount(list.filter((n) => !n.read).length)
    } catch (error) {
      console.error('Error loading unread notifications:', error)
    }
  }

  return (
    <div className="p-8 bg-background">
      <FadeIn duration={0.6} className="sticky top-0 rounded-xl shadow-sm p-6 mb-6 z-10 bg-card">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              👋 Bienvenid@ {userName ? userName : 'Estudiante'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {getCurrentDate()}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button
                variant="outline"
                className="border-gray-300 relative bg-transparent"
                onClick={handleToggleDropdown}
              >
                <Bell size={18} className="text-gray-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-primary items-center justify-center text-[10px] text-white font-bold">
                      {unreadCount}
                    </span>
                  </span>
                )}
              </Button>
              <NotificationsDropdown
                isOpen={isDropdownOpen}
                onClose={handleCloseDropdown}
                onUnreadChange={setUnreadCount}
              />
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <FadeIn delay={0.2} className="p-6 rounded-xl shadow-sm bg-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Tareas Pendientes
              </h2>
              <Link to="/tasks">
                <Button variant="ghost" className={`text-primary hover:text-primary/90 hover:bg-primary/10 transition-all duration-200 hover:scale-105 ${darkMode ? 'text-primary hover:text-primary hover:bg-primary/20' : ''
                  }`}>
                  Ver todas
                </Button>
              </Link>
            </div>
            <StaggerContainer className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-600">Cargando tareas...</p>
                </div>
              ) : pendingTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tienes tareas pendientes</p>
                  <Link to="/tasks">
                    <Button className="mt-2 bg-primary hover:bg-primary/90">
                      Crear tarea
                    </Button>
                  </Link>
                </div>
              ) : (
                pendingTasks.map((task, index) => (
                  <TaskItem key={task.id} task={task} index={index} onClick={() => navigate(`/tasks/${task.id}`)} />
                ))
              )}
            </StaggerContainer>
          </FadeIn>

          <FadeIn delay={0.4} className="p-6 rounded-xl shadow-sm bg-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Resumen General
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                icon={<CheckSquare className="text-green-600" size={24} />}
                label="Total de Tareas"
                value={loading ? "..." : stats.totalTasks.toString()}
                bgColor="bg-green-50"
              />
              <StatCard
                icon={<CalendarIcon className="text-blue-600" size={24} />}
                label="Próximos Eventos"
                value={loading ? "..." : stats.upcomingEvents.toString()}
                bgColor="bg-blue-50"
              />
              <StatCard
                icon={<StickyNote className="text-orange-600" size={24} />}
                label="Notas Guardadas"
                value={loading ? "..." : stats.totalNotes.toString()}
                bgColor="bg-orange-50"
              />
              <StatCard
                icon={<Bell className="text-purple-600" size={24} />}
                label="Recordatorios Activos"
                value={loading ? "..." : stats.activeReminders.toString()}
                bgColor="bg-purple-50"
              />
            </div>
          </FadeIn>
        </div>
      </div>

    </div>
  )
}

export default HomePage
