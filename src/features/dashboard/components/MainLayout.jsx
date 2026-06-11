import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { Sparkles, Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import TeacherSidebar from './TeacherSidebar'
import { Button } from '../../../ui/button'
import { useAuth } from '../../../hooks/useAuth'
import { useIsMobile } from '../../../hooks/useMediaQuery'
import ErrorBoundary from '../../../components/shared/ErrorBoundary'

const MainLayout = ({ children }) => {
  const { user } = useAuth()
  const location = useLocation()
  const role = user?.user_metadata?.role || user?.app_metadata?.role
  const isTeacher = role === 'teacher'
  const isMobile = useIsMobile()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const isChatbot = location.pathname === '/chatbot'
  const showFloatingButton = !isChatbot
  const showMobileHeader = isMobile && !isChatbot
  const showAppSidebar = !(isMobile && isChatbot)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isMobile) setMobileNavOpen(false)
  }, [isMobile])

  const sidebarProps = {
    isMobile,
    mobileOpen: mobileNavOpen,
    onMobileClose: () => setMobileNavOpen(false),
    onCollapseChange: setIsCollapsed,
  }

  const mainOffsetClass = isMobile
    ? 'ml-0'
    : isCollapsed
      ? 'ml-20'
      : 'ml-60'

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-500">
      {showAppSidebar && (
        <nav aria-label="Navegación principal">
          {isTeacher ? (
            <TeacherSidebar {...sidebarProps} />
          ) : (
            <Sidebar {...sidebarProps} />
          )}
        </nav>
      )}

      {isMobile && mobileNavOpen && showAppSidebar && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50"
          aria-label="Cerrar menú de navegación"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <main
        id="main-content"
        className={`min-h-screen transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${mainOffsetClass}`}
        aria-label="Contenido principal"
      >
        {showMobileHeader && (
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label="Abrir menú de navegación"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu size={20} />
            </Button>
            <img src="/captus-icon.png" alt="" className="h-9 w-9 object-contain" aria-hidden />
            <span className="font-semibold text-primary">Captus</span>
          </header>
        )}

        <ErrorBoundary>
          {children || <Outlet />}
        </ErrorBoundary>
      </main>

      {showFloatingButton && (
        <Link
          to="/chatbot"
          aria-label="Abrir asistente Captus IA"
          title="Hablar con Captus IA"
        >
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-brand-sm hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 animate-pulse z-50"
            size="icon"
            aria-hidden="true"
          >
            <Sparkles size={24} />
          </Button>
        </Link>
      )}
    </div>
  )
}

export default MainLayout
