import React, { useState, useEffect } from 'react'
import { MessageSquare, Mail, Phone, Save, Loader2 } from 'lucide-react'
import { Button } from '../../../ui/button'
import { Card } from '../../../ui/card'
import { Label } from '../../../ui/label'
import { Switch } from '../../../ui/switch'
import { Badge } from '../../../ui/badge'
import { useTheme } from '../../../context/themeContext'
import apiClient from '../../../shared/api/client'
import { toast } from 'sonner'

export default function NotificacionesSection() {
  const { compactView } = useTheme()
  const [telegramStatus, setTelegramStatus] = useState({ connected: false, username: null })
  const [telegramCode, setTelegramCode] = useState(null)
  const [telegramLoading, setTelegramLoading] = useState(false)
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_enabled: true, whatsapp_enabled: false, email: '', whatsapp: ''
  })
  const [notificationsSaving, setNotificationsSaving] = useState(false)

  useEffect(() => {
    fetchTelegramStatus()
    fetchNotificationPreferences()
  }, [])

  const fetchTelegramStatus = async () => {
    try {
      const response = await apiClient.get('/telegram/status')
      if (response.data.success) setTelegramStatus(response.data.data)
    } catch (error) {
      console.error('Error fetching Telegram status:', error)
    }
  }

  const generateTelegramCode = async () => {
    setTelegramLoading(true)
    try {
      const response = await apiClient.post('/telegram/generate-code')
      if (response.data.success) setTelegramCode(response.data.data)
    } catch (err) {
      console.error('Error al generar código Telegram:', err)
      toast.error('Error al generar código de vinculación')
    } finally {
      setTelegramLoading(false)
    }
  }

  const unlinkTelegram = async () => {
    setTelegramLoading(true)
    try {
      await apiClient.delete('/telegram/unlink')
      setTelegramStatus({ connected: false, username: null })
      setTelegramCode(null)
      toast.success('Cuenta de Telegram desvinculada')
    } catch (err) {
      console.error('Error al desvincular Telegram:', err)
      toast.error('Error al desvincular cuenta')
    } finally {
      setTelegramLoading(false)
    }
  }

  const fetchNotificationPreferences = async () => {
    try {
      const response = await apiClient.get('/notifications/preferences')
      const data = response.data
      setNotificationPrefs({
        email_enabled: data.email_enabled ?? true,
        whatsapp_enabled: data.whatsapp_enabled ?? false,
        email: data.email || '',
        whatsapp: data.whatsapp || ''
      })
    } catch (error) {
      console.error('Error fetching preferences', error)
    }
  }

  const handleSaveNotificationPreferences = async () => {
    setNotificationsSaving(true)
    try {
      await apiClient.put('/notifications/preferences', notificationPrefs)
      toast.success('Preferencias de notificación actualizadas')
    } catch (err) {
      console.error('Error al guardar preferencias:', err)
      toast.error('Error al guardar preferencias')
    } finally {
      setNotificationsSaving(false)
    }
  }

  return (
    <Card className={`${compactView ? 'p-4' : 'p-6'} ${'bg-card'} rounded-xl shadow-sm`}>
      <h2 className={`text-xl font-semibold text-foreground ${compactView ? 'mb-4' : 'mb-6'}`}>Notificaciones</h2>

      <div className={compactView ? 'space-y-4' : 'space-y-6'}>
        {/* Telegram */}
        <div className={`p-4 rounded-xl border ${'bg-primary/5 border-primary/20'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${'bg-primary/10 text-primary'}`}>
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className={`font-medium text-foreground`}>Telegram Bot</h3>
                <p className={`text-sm text-muted-foreground`}>Recibe notificaciones de tareas y eventos directamente en Telegram</p>
              </div>
            </div>
            <Badge variant={telegramStatus.connected ? "success" : "secondary"}>
              {telegramStatus.connected ? "Conectado" : "Desconectado"}
            </Badge>
          </div>

          {telegramStatus.connected ? (
            <div className="mt-4 pl-14">
              <p className={`text-sm mb-3 ${'text-foreground'}`}>Tu cuenta está vinculada correctamente.</p>
              <Button variant="destructive" size="sm" onClick={unlinkTelegram} disabled={telegramLoading}>
                {telegramLoading ? 'Procesando...' : 'Desvincular Cuenta'}
              </Button>
            </div>
          ) : (
            <div className="mt-4 pl-14">
              {!telegramCode ? (
                <div>
                  <p className={`text-sm mb-3 ${'text-foreground'}`}>Para vincular tu cuenta, genera un código y envíalo al bot.</p>
                  <Button onClick={generateTelegramCode} disabled={telegramLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    {telegramLoading ? 'Generando...' : 'Generar Código de Vinculación'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border-2 border-dashed ${'border-border bg-background'}`}>
                    <p className={`text-center text-sm mb-2 text-muted-foreground`}>Envía este código al bot de Telegram:</p>
                    <div className={`text-3xl font-mono font-bold text-center tracking-wider text-foreground`}>{telegramCode.code}</div>
                    <p className={`text-center text-xs mt-2 text-muted-foreground`}>Expira en 15 minutos</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full"
                      onClick={() => window.open(`https://t.me/${import.meta.env.VITE_TELEGRAM_BOT_NAME || 'CaptusBot'}?start=${telegramCode.code}`, '_blank')}>
                      Abrir Bot en Telegram
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setTelegramCode(null)}>Cancelar</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Email */}
        <div className={`p-4 rounded-xl border ${'bg-card border-border'}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${'bg-brand-50 text-brand-700'}`}>
                <Mail size={24} />
              </div>
              <div>
                <h3 className={`font-medium text-foreground`}>Correo Electrónico</h3>
                <p className={`text-sm text-muted-foreground`}>Recibe resúmenes y alertas importantes</p>
              </div>
            </div>
            <Switch checked={notificationPrefs.email_enabled}
              onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, email_enabled: checked }))} />
          </div>
          {notificationPrefs.email_enabled && (
            <div className="pl-14 space-y-3">
              <div>
                <Label className={`text-sm ${'text-foreground'}`}>Correo alternativo (opcional)</Label>
                <input type="email" value={notificationPrefs.email}
                  onChange={(e) => setNotificationPrefs(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="ejemplo@correo.com"
                  className={`mt-1 w-full px-3 py-2 border ${'border-border bg-background text-foreground'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`} />
                <p className="text-xs text-muted-foreground mt-1">Si se deja vacío, se usará tu correo de cuenta principal.</p>
              </div>
            </div>
          )}
        </div>

        {/* WhatsApp */}
        <div className={`p-4 rounded-xl border ${'bg-card border-border'}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${'bg-brand-100 text-primary'}`}>
                <Phone size={24} />
              </div>
              <div>
                <h3 className={`font-medium text-foreground`}>WhatsApp</h3>
                <p className={`text-sm text-muted-foreground`}>Recibe alertas urgentes en tu celular</p>
              </div>
            </div>
            <Switch checked={notificationPrefs.whatsapp_enabled}
              onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, whatsapp_enabled: checked }))} />
          </div>
          {notificationPrefs.whatsapp_enabled && (
            <div className="pl-14 space-y-3">
              <div>
                <Label className={`text-sm ${'text-foreground'}`}>Número de WhatsApp</Label>
                <input type="tel" value={notificationPrefs.whatsapp}
                  onChange={(e) => setNotificationPrefs(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="+52 123 456 7890"
                  className={`mt-1 w-full px-3 py-2 border ${'border-border bg-background text-foreground'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`} />
                <p className="text-xs text-muted-foreground mt-1">Incluye el código de país (ej. +54, +52).</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSaveNotificationPreferences} disabled={notificationsSaving} className="bg-primary hover:bg-primary/90">
            {notificationsSaving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Guardar Preferencias</>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
