import React, { useState, memo } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import {
  BookOpen,
  Home,
  CheckSquare,
  Calendar as CalendarIcon,
  StickyNote,
  BarChart3,
  Sparkles,
  Settings,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  X,
} from 'lucide-react'
import { cn } from '../../../lib/utils'

const Sidebar = memo(({ onCollapseChange, isMobile = false, mobileOpen = false, onMobileClose }) => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { path: '/home', icon: Home, label: 'Inicio' },
    { path: '/courses', icon: BookOpen, label: 'Cursos' },
    { path: '/tasks', icon: CheckSquare, label: 'Tareas' },
    { path: '/diagrams', icon: GitBranch, label: 'Diagramas' },
    { path: '/calendar', icon: CalendarIcon, label: 'Calendario' },
    { path: '/notes', icon: StickyNote, label: 'Notas' },
    { path: '/groups', icon: Users, label: 'Grupos' },
    { path: '/stats', icon: BarChart3, label: 'Estadísticas' },
    { path: '/chatbot', icon: Sparkles, label: 'Captus AI' },
    { path: '/settings', icon: Settings, label: 'Configuración' },
  ]

  const handleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    onCollapseChange?.(newState)
  }

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleNavClick = () => {
    if (isMobile) onMobileClose?.()
  }

  const showLabels = isMobile || !isCollapsed

  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 bg-sidebar border-r border-sidebar-border flex flex-col',
        'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        isMobile
          ? cn('w-60 z-40', mobileOpen ? 'translate-x-0' : '-translate-x-full')
          : cn('z-10 animate-in slide-in-from-left-10 duration-500', isCollapsed ? 'w-20' : 'w-60'),
      )}
    >
      <div className="flex items-center justify-between h-16 border-b border-sidebar-border px-4">
        {showLabels ? (
          <div className="flex items-center space-x-2 transition-opacity duration-200">
            <BookOpen className="text-primary" size={24} />
            <h1 className="text-xl font-semibold text-primary">Captus</h1>
          </div>
        ) : (
          <div className="transition-opacity duration-200">
            <BookOpen className="text-primary" size={24} />
          </div>
        )}
        {isMobile ? (
          <button
            type="button"
            onClick={onMobileClose}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
            aria-label="Cerrar menú de navegación"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCollapse}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
            aria-label={isCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
            aria-expanded={!isCollapsed}
            title={isCollapsed ? 'Expandir' : 'Colapsar'}
          >
            {isCollapsed ? (
              <ChevronRight size={18} className="text-muted-foreground" />
            ) : (
              <ChevronLeft size={18} className="text-muted-foreground" />
            )}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="p-4 flex-shrink-0">
          <div
            className={cn(
              'flex items-center mb-6 p-3 bg-sidebar-accent/50 rounded-xl transition-all duration-200',
              showLabels ? 'space-x-3' : 'justify-center',
            )}
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-sidebar-primary flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-sidebar-primary-foreground font-semibold">
                {(user?.user_metadata?.name || user?.name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            {showLabels && (
              <div className="transition-opacity duration-200">
                <p className="font-medium text-sidebar-foreground whitespace-nowrap">
                  {(user?.user_metadata?.name || user?.name || 'Usuario').split(' ')[0]}
                </p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Estudiante</p>
              </div>
            )}
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 active:scale-95',
                    showLabels ? 'space-x-3' : 'justify-center',
                    active
                      ? 'bg-sidebar-accent text-primary font-medium shadow-sm'
                      : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                  )}
                  title={!showLabels ? item.label : ''}
                >
                  <span className={active ? 'text-primary' : 'text-muted-foreground'}>
                    <Icon size={18} />
                  </span>
                  {showLabels && (
                    <span className="font-medium text-sm whitespace-nowrap transition-opacity duration-200">
                      {item.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="flex-shrink-0 p-4 border-t border-sidebar-border">
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            'flex items-center px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-200 w-full active:scale-95',
            showLabels ? 'space-x-3' : 'justify-center',
          )}
          title={!showLabels ? 'Cerrar Sesión' : ''}
        >
          <LogOut size={18} />
          {showLabels && (
            <span className="font-medium text-sm whitespace-nowrap transition-opacity duration-200">
              Cerrar Sesión
            </span>
          )}
        </button>
      </div>
    </div>
  )
})

Sidebar.displayName = 'Sidebar'

export default Sidebar
