import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '../../../ui/button'
import { Card } from '../../../ui/card'
import { Label } from '../../../ui/label'
import { useTheme } from '../../../context/themeContext'
import { toast } from 'sonner'
import { supabase } from '../../../shared/api/supabase'
import { validatePassword } from '../../../lib/passwordValidator'

export default function SeguridadSection() {
  const { compactView } = useTheme()
  const [showPassword, setShowPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Todos los campos de contraseña son obligatorios'); return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden'); return
    }
    const passwordCheck = validatePassword(passwordData.newPassword)
    if (!passwordCheck.valid) {
      toast.error(passwordCheck.error); return
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('La nueva contraseña debe ser diferente a la actual'); return
    }

    setChangingPassword(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        toast.error('No se pudo verificar tu sesión'); return
      }

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword,
      })
      if (verifyError) {
        toast.error('La contraseña actual es incorrecta'); return
      }

      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword })
      if (error) {
        toast.error(`Error al cambiar contraseña: ${error.message}`); return
      }

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Contraseña cambiada exitosamente')
    } catch (err) {
      console.error('Error al cambiar contraseña:', err)
      toast.error('Error al cambiar contraseña')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <Card className={`${compactView ? 'p-4' : 'p-6'} bg-card rounded-xl shadow-sm`}>
      <h2 className={`text-xl font-semibold text-foreground ${compactView ? 'mb-4' : 'mb-6'}`}>Cambiar Contraseña</h2>
      <div className={compactView ? 'space-y-3' : 'space-y-4'}>
        <div>
          <Label htmlFor="current-password" className="text-sm font-medium text-foreground">Contraseña Actual</Label>
          <div className="relative">
            <input id="current-password" type={showPassword ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              placeholder="Ingresa tu contraseña actual"
              autoComplete="current-password"
              className={`mt-1 w-full px-3 ${compactView ? 'py-1.5' : 'py-2'} pr-10 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <Label htmlFor="new-password" className="text-sm font-medium text-foreground">Nueva Contraseña</Label>
          <input id="new-password" type="password" value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            placeholder="Ingresa tu nueva contraseña"
            autoComplete="new-password"
            className={`mt-1 w-full px-3 ${compactView ? 'py-1.5' : 'py-2'} border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`} />
        </div>
        <div>
          <Label htmlFor="confirm-password" className="text-sm font-medium text-foreground">Confirmar Nueva Contraseña</Label>
          <input id="confirm-password" type="password" value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            placeholder="Confirma tu nueva contraseña"
            autoComplete="new-password"
            className={`mt-1 w-full px-3 ${compactView ? 'py-1.5' : 'py-2'} border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`} />
        </div>
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-foreground">
            <strong>Requisitos de contraseña:</strong> Mínimo 8 caracteres, una mayúscula, una minúscula y un número (máx. 32).
          </p>
        </div>
      </div>
      <div className={compactView ? 'mt-4' : 'mt-6'}>
        <Button onClick={handleChangePassword} disabled={changingPassword} className="bg-primary hover:bg-primary/90 disabled:opacity-50">
          {changingPassword ? 'Cambiando...' : 'Actualizar Contraseña'}
        </Button>
      </div>
    </Card>
  )
}
