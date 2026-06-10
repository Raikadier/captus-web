import React from 'react'
import { Check } from 'lucide-react'
import { Button } from '../../../ui/button'
import { Card } from '../../../ui/card'
import { Label } from '../../../ui/label'
import { Switch } from '../../../ui/switch'
import { useTheme } from '../../../context/themeContext'

const COLORS = [
  { name: 'green',  bg: 'bg-primary',  border: 'border-green-700' },
  { name: 'blue',   bg: 'bg-blue-600',   border: 'border-blue-700' },
  { name: 'purple', bg: 'bg-purple-600', border: 'border-purple-700' },
  { name: 'orange', bg: 'bg-orange-600', border: 'border-orange-700' },
  { name: 'pink',   bg: 'bg-pink-600',   border: 'border-pink-700' },
]

export default function AparienciaSection() {
  const { darkMode, toggleTheme, compactView, setCompactView, fontSize, changeFontSize, accentColor, changeAccentColor } = useTheme()

  return (
    <Card className={`${compactView ? 'p-4' : 'p-6'} bg-card rounded-xl shadow-sm`}>
      <h2 className={`text-xl font-semibold text-foreground ${compactView ? 'mb-4' : 'mb-6'}`}>Personalización de la Interfaz</h2>
      <div className={compactView ? 'space-y-3' : 'space-y-4'}>
        <div className={`flex items-center justify-between ${compactView ? 'py-2' : 'py-3'} border-b border-border`}>
          <div>
            <p className="font-medium text-foreground">Modo oscuro</p>
            <p className="text-sm text-muted-foreground">Activa el tema oscuro en toda la aplicación</p>
          </div>
          <Switch checked={darkMode} onCheckedChange={toggleTheme} />
        </div>
        <div className={`flex items-center justify-between ${compactView ? 'py-2' : 'py-3'} border-b border-border`}>
          <div>
            <p className="font-medium text-foreground">Vista compacta</p>
            <p className="text-sm text-muted-foreground">Reduce el espaciado entre elementos</p>
          </div>
          <Switch checked={compactView} onCheckedChange={setCompactView} />
        </div>
        <div className={compactView ? 'py-2' : 'py-3'}>
          <Label className="text-sm font-medium text-foreground mb-3 block">Tamaño de fuente</Label>
          <div className="flex gap-2">
            {['small', 'medium', 'large'].map((size) => (
              <Button key={size} variant={fontSize === size ? 'default' : 'outline'} size="sm"
                onClick={() => changeFontSize(size)}
                className={fontSize === size ? 'bg-primary hover:bg-primary/90' : ''}>
                {size === 'small' ? 'Pequeña' : size === 'medium' ? 'Media' : 'Grande'}
              </Button>
            ))}
          </div>
        </div>
        <div className={compactView ? 'py-2' : 'py-3'}>
          <Label className="text-sm font-medium text-foreground mb-3 block">Color de acento</Label>
          <div className="flex gap-2">
            {COLORS.map((color) => (
              <button key={color.name} onClick={() => changeAccentColor(color.name)}
                className={`w-10 h-10 rounded-full ${color.bg} flex items-center justify-center transition-all ${
                  accentColor === color.name
                    ? `border-2 ${'border-foreground'} ring-2 ${'ring-border'}`
                    : 'hover:scale-110'
                }`}>
                {accentColor === color.name && <Check size={20} className="text-white" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
