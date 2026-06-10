import React, { useState, useEffect } from 'react'
import { Button } from '../../../ui/button'
import { Card } from '../../../ui/card'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '../../../ui/dialog'
import { useTheme } from '../../../context/themeContext'
import apiClient from '../../../shared/api/client'
import { toast } from 'sonner'
import { supabase } from '../../../shared/api/supabase'

export default function PrivacidadSection() {
  const { compactView } = useTheme()
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteStep, setDeleteStep] = useState(1)
  const [countdown, setCountdown] = useState(10)
  const [countdownActive, setCountdownActive] = useState(false)

  useEffect(() => {
    let interval
    if (countdownActive && countdown > 0) {
      interval = setInterval(() => setCountdown(prev => prev - 1), 1000)
    } else if (countdown === 0) {
      setCountdownActive(false)
    }
    return () => clearInterval(interval)
  }, [countdownActive, countdown])

  const handleDeleteAccount = () => { setShowDeleteModal(true); setDeleteStep(1) }

  const handleConfirmDelete = () => {
    if (deleteStep === 1) {
      setDeleteStep(2); setCountdown(10); setCountdownActive(true)
    } else if (deleteStep === 2 && countdown === 0) {
      executeDeleteAccount()
    }
  }

  const executeDeleteAccount = async () => {
    setDeletingAccount(true); setCountdownActive(false)
    try {
      await apiClient.delete('/users/account')
      toast.success('Cuenta eliminada exitosamente. Redirigiendo...')
      await supabase.auth.signOut()
      setTimeout(() => { window.location.href = '/' }, 2000)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar cuenta')
      setShowDeleteModal(false)
    } finally {
      setDeletingAccount(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false); setDeleteStep(1); setCountdown(10); setCountdownActive(false)
  }

  return (
    <>
      <Card className={`${compactView ? 'p-4' : 'p-6'} bg-card rounded-xl shadow-sm`}>
        <h2 className={`text-xl font-semibold text-foreground ${compactView ? 'mb-4' : 'mb-6'}`}>Gestión de Datos</h2>
        <div className={compactView ? 'space-y-2' : 'space-y-3'}>
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDeleteAccount} disabled={deletingAccount}>
            {deletingAccount ? 'Eliminando cuenta...' : 'Eliminar mi cuenta'}
          </Button>
        </div>
        <div className={`${compactView ? 'mt-3' : 'mt-4'} p-3 bg-destructive/10 border-destructive/30 border rounded-lg`}>
          <p className="text-sm text-destructive">
            ⚠️ <strong>Advertencia importante:</strong> La eliminación de tu cuenta es <strong>permanente</strong> e <strong>irreversible</strong>.
            Perderás acceso a todas tus tareas, estadísticas, rachas y datos almacenados. Esta acción no se puede deshacer.
          </p>
        </div>
      </Card>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-card max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-destructive">⚠️ Eliminar Cuenta</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {deleteStep === 1 ? (
                <div className="space-y-3">
                  <p>¿Estás seguro de que quieres eliminar tu cuenta?</p>
                  <div className="p-3 rounded-lg bg-destructive/10">
                    <p className="text-sm font-medium text-destructive mb-2">Esta acción es <strong>IRREVERSIBLE</strong> y eliminará:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Todas tus tareas y subtareas</li>
                      <li>• Tus estadísticas y rachas de productividad</li>
                      <li>• Tus logros y medallas desbloqueadas</li>
                      <li>• Toda tu información personal</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border-2 bg-destructive/10 border-destructive/30">
                    <h3 className="font-bold text-lg text-destructive mb-2">🚨 ÚLTIMA ADVERTENCIA 🚨</h3>
                    <p className="text-destructive font-medium">Esta es tu última oportunidad para cancelar.</p>
                    <p className="text-muted-foreground mt-2">¿Realmente quieres <strong>ELIMINAR DEFINITIVAMENTE</strong> tu cuenta de Captus?</p>
                    <p className="text-sm text-muted-foreground mt-2">No podrás recuperar ningún dato después de esto.</p>
                  </div>
                  {countdownActive && (
                    <div className="text-center p-3 rounded-xl bg-muted">
                      <p className="text-sm text-muted-foreground">
                        El botón se habilitará en: <span className="font-bold text-red-500">{countdown}s</span>
                      </p>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                        <div className="bg-destructive/100 h-2 rounded-full transition-all duration-1000" style={{ width: `${(countdown / 10) * 100}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCancelDelete} disabled={deletingAccount}>Cancelar</Button>
            <Button onClick={handleConfirmDelete} disabled={deleteStep === 2 && countdown > 0} className="bg-red-600 hover:bg-red-700 text-white">
              {deletingAccount ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Eliminando...
                </div>
              ) : deleteStep === 1 ? 'Continuar' : countdown > 0 ? `Eliminar en ${countdown}s` : '🗑️ Eliminar Definitivamente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
