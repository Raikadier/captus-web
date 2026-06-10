import React, { useState } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import Sidebar from './Sidebar'
import TeacherSidebar from './TeacherSidebar'
import { Button } from '../../../ui/button'
import { useAuth } from '../../../hooks/useAuth'
import ErrorBoundary from '../../../components/shared/ErrorBoundary'

const MainLayout = ({ children }) => {
  const { user } = useAuth()
  const location = useLocation()
  const role = user?.user_metadata?.role || user?.app_metadata?.role;
  const isTeacher = role === 'teacher';
  const [isCollapsed, setIsCollapsed] = useState(false)
  const showFloatingButton = location.pathname !== '/chatbot'

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-500">
      {/* Navigation landmark */}
      <nav aria-label="Navegación principal">
        {isTeacher ? (
          <TeacherSidebar onCollapseChange={setIsCollapsed} />
        ) : (
          <Sidebar onCollapseChange={setIsCollapsed} />
        )}
      </nav>

      {/* Main content landmark — target of skip-to-content link */}
      <main
        id="main-content"
        className={`min-h-screen transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isCollapsed ? 'ml-20' : 'ml-60'
        }`}
        aria-label="Contenido principal"
      >
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
