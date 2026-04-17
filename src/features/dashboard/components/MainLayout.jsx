import React, { useState } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import Sidebar from './Sidebar'
import TeacherSidebar from './TeacherSidebar'
import { Button } from '../../../ui/button'
import { useAuth } from '../../../hooks/useAuth'

const MainLayout = ({ children }) => {
  const { user } = useAuth()
  const location = useLocation()
  // Show teacher sidebar if user has teacher role OR if on a teacher route
  const isTeacher = user?.user_metadata?.role === 'teacher' || location.pathname.startsWith('/teacher')
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Don't show the floating button on the chatbot page itself to avoid redundancy
  const showFloatingButton = location.pathname !== '/chatbot'

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-500">
      {isTeacher ? (
        <TeacherSidebar onCollapseChange={setIsCollapsed} />
      ) : (
        <Sidebar onCollapseChange={setIsCollapsed} />
      )}
      <div
        className={`min-h-screen transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'ml-20' : 'ml-60'
          }`}
      >
        {children || <Outlet />}
      </div>

      {showFloatingButton && (
        <Link to="/chatbot" title="Hablar con Captus AI">
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 animate-pulse z-50"
            size="icon"
          >
            <Sparkles size={24} />
          </Button>
        </Link>
      )}
    </div>
  )
}

export default MainLayout
