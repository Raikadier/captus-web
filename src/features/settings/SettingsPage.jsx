import React, { useState } from 'react'
import { User, Lock, Bell, Palette, Shield, Award } from 'lucide-react'
import { Card } from '../../ui/card'
import { useTheme } from '../../context/themeContext'
import { FadeIn } from '../../shared/components/animations/MotionComponents'
import PerfilSection from './sections/PerfilSection'
import SeguridadSection from './sections/SeguridadSection'
import AparienciaSection from './sections/AparienciaSection'
import PrivacidadSection from './sections/PrivacidadSection'
import NotificacionesSection from './sections/NotificacionesSection'
import LogrosSection from './sections/LogrosSection'

function getCurrentDate() {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const now = new Date()
  return `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`
}

const NAV_ITEMS = [
  { id: 'perfil',        icon: <User size={18} />,    label: 'Perfil' },
  { id: 'seguridad',     icon: <Lock size={18} />,    label: 'Seguridad' },
  { id: 'notificaciones',icon: <Bell size={18} />,    label: 'Notificaciones' },
  { id: 'apariencia',    icon: <Palette size={18} />, label: 'Apariencia' },
  { id: 'privacidad',    icon: <Shield size={18} />,  label: 'Privacidad' },
  { id: 'logros',        icon: <Award size={18} />,   label: 'Logros' },
]

function SettingsMenuItem({ icon, label, active, onClick }) {
  const { darkMode } = useTheme()
  return (
    <button onClick={onClick} type="button"
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
        active ? 'bg-primary/10 text-primary'
          : 'text-foreground hover:bg-muted'
      }`}>
      <div className="flex items-center space-x-3">
        <span className={active ? 'text-primary' : 'text-muted-foreground'}>{icon}</span>
        <span className="font-medium text-sm">{label}</span>
      </div>
    </button>
  )
}

export default function SettingsPage() {
  const { darkMode, compactView } = useTheme()
  const [activeSection, setActiveSection] = useState('perfil')

  return (
    <div className="bg-background">
      <div className={`max-w-7xl mx-auto ${compactView ? 'p-4 pb-24' : 'p-8 pb-8'}`}>
        <FadeIn className={`sticky top-0 bg-card rounded-xl shadow-sm ${compactView ? 'p-4' : 'p-6'} mb-6 z-10`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">⚙️ Configuración</h1>
              <p className="text-muted-foreground mt-1">{getCurrentDate()}</p>
            </div>
          </div>
        </FadeIn>

        <div className={`grid grid-cols-1 lg:grid-cols-3 ${compactView ? 'gap-4' : 'gap-6'}`}>
          <FadeIn delay={0.2} className="lg:col-span-1">
            <Card className={`${compactView ? 'p-3' : 'p-4'} ${'bg-card'} rounded-xl shadow-sm`}>
              <nav className={compactView ? 'space-y-1' : 'space-y-2'}>
                {NAV_ITEMS.map(item => (
                  <SettingsMenuItem key={item.id} icon={item.icon} label={item.label}
                    active={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)} />
                ))}
              </nav>
            </Card>
          </FadeIn>

          <FadeIn delay={0.4} className={`lg:col-span-2 ${compactView ? 'space-y-4' : 'space-y-6'}`}>
            {activeSection === 'perfil'         && <PerfilSection />}
            {activeSection === 'seguridad'      && <SeguridadSection />}
            {activeSection === 'notificaciones' && <NotificacionesSection />}
            {activeSection === 'apariencia'     && <AparienciaSection />}
            {activeSection === 'privacidad'     && <PrivacidadSection />}
            {activeSection === 'logros'         && <LogrosSection />}
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
