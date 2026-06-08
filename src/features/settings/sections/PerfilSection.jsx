import React, { useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '../../../ui/button'
import { Card } from '../../../ui/card'
import { Label } from '../../../ui/label'
import { useTheme } from '../../../context/themeContext'
import apiClient from '../../../shared/api/client'
import { toast } from 'sonner'
import Loading from '../../../ui/loading'
import { supabase } from '../../../shared/api/supabase'

export default function PerfilSection() {
  const { compactView } = useTheme()
  const fileInputRef = useRef(null)

  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    career: '',
    bio: ''
  })

  useEffect(() => { fetchUserProfile() }, [])

  const fetchUserProfile = async () => {
    setError('')
    setLoading(true)
    try {
      const response = await apiClient.get('/users/profile')
      const userDataResponse = response.data
      if (userDataResponse.success && userDataResponse.data) {
        const user = userDataResponse.data
        const nameParts = user.name ? user.name.split(' ') : ['', '']
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''
        const userWithSplitName = {
          ...user, firstName, lastName,
          fullName: user.name,
          createdAt: user.createdAt || user.created_at,
          avatar_url: user.avatar_url
        }
        setUserData(userWithSplitName)
        setFormData({ firstName, lastName, email: user.email || '', career: user.carrer || '', bio: user.bio || '' })
      } else {
        setError('No se pudieron cargar los datos del perfil')
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('Authentication issue, user may need to re-login')
      } else {
        setError(error.message || 'Error de conexión al cargar perfil')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData?.session?.access_token) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
        return
      }
      const fullName = `${formData.firstName} ${formData.lastName}`.trim()
      const userId = sessionData.session.user.id
      await apiClient.put(`/users/${userId}`, { name: fullName, carrer: formData.career, bio: formData.bio })
      setUserData(prev => ({ ...prev, firstName: formData.firstName, lastName: formData.lastName, name: fullName, carrer: formData.career, bio: formData.bio }))
      toast.success('Perfil actualizado exitosamente')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar el perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Por favor selecciona un archivo de imagen'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('La imagen no debe superar los 5MB'); return }
    setUploadingPhoto(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData?.session?.user?.id
      if (!userId) throw new Error('No user session')
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}-${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      await apiClient.put(`/users/${userId}`, { avatar_url: publicUrl })
      setUserData(prev => ({ ...prev, avatar_url: publicUrl }))
      toast.success('Foto de perfil actualizada')
    } catch (err) {
      console.error('Error al subir foto de perfil:', err)
      toast.error('Error al subir la foto')
    } finally {
      setUploadingPhoto(false)
    }
  }

  if (loading) return <Card className={`${compactView ? 'p-4' : 'p-6'} bg-card rounded-xl shadow-sm`}><div className="text-center py-8"><Loading message="Cargando información del perfil..." fullScreen={false} /></div></Card>
  if (error) return (
    <Card className={`${compactView ? 'p-4' : 'p-6'} bg-card rounded-xl shadow-sm`}>
      <div className="text-center py-8">
        <div className="text-destructive text-lg mb-4">Error: {error}</div>
        <Button onClick={fetchUserProfile} variant="outline">Reintentar</Button>
      </div>
    </Card>
  )

  return (
    <Card className={`${compactView ? 'p-4' : 'p-6'} bg-card rounded-xl shadow-sm`}>
      <h2 className={`text-xl font-semibold text-foreground ${compactView ? 'mb-4' : 'mb-6'}`}>Información Personal</h2>
      <div className={compactView ? 'space-y-3' : 'space-y-4'}>
        <div className="flex items-center space-x-4">
          <div className={`${compactView ? 'w-16 h-16' : 'w-20 h-20'} rounded-full overflow-hidden bg-primary flex items-center justify-center relative group`}>
            {userData?.avatar_url ? (
              <img src={userData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className={`text-primary-foreground ${compactView ? 'text-xl' : 'text-2xl'} font-semibold`}>
                {userData?.firstName?.[0]}{userData?.lastName?.[0]}
              </span>
            )}
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>
          <div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}>
              {uploadingPhoto ? 'Subiendo...' : 'Cambiar Foto'}
            </Button>
          </div>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 ${compactView ? 'gap-3' : 'gap-4'}`}>
          <div>
            <Label htmlFor="nombre" className="text-sm font-medium text-foreground">Nombre</Label>
            <input id="nombre" type="text" value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="Tu nombre"
              className={`mt-1 w-full px-3 ${compactView ? 'py-1.5' : 'py-2'} border ${'border-border bg-background text-foreground'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`} />
          </div>
          <div>
            <Label htmlFor="apellido" className="text-sm font-medium text-foreground">Apellido</Label>
            <input id="apellido" type="text" value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Tu apellido"
              className={`mt-1 w-full px-3 ${compactView ? 'py-1.5' : 'py-2'} border ${'border-border bg-background text-foreground'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`} />
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
          <input id="email" type="email" value={formData.email} disabled
            className={`mt-1 w-full px-3 ${compactView ? 'py-1.5' : 'py-2'} border ${'border-border bg-background text-foreground'} rounded-lg opacity-60 cursor-not-allowed`} />
        </div>

        <div>
          <Label htmlFor="carrera" className="text-sm font-medium text-foreground">Carrera</Label>
          <input id="carrera" type="text" value={formData.career}
            onChange={(e) => setFormData(prev => ({ ...prev, career: e.target.value }))}
            placeholder="Ej: Ingeniería de Sistemas"
            className={`mt-1 w-full px-3 ${compactView ? 'py-1.5' : 'py-2'} border ${'border-border bg-background text-foreground'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`} />
        </div>

        <div>
          <Label htmlFor="bio" className="text-sm font-medium text-foreground">Biografía</Label>
          <textarea id="bio" rows={3} value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Cuéntanos un poco sobre ti..."
            className={`mt-1 w-full px-3 ${compactView ? 'py-1.5' : 'py-2'} border ${'border-border bg-background text-foreground placeholder:text-muted-foreground'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`} />
        </div>

        <div className={compactView ? 'mt-4' : 'mt-6'}>
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>

        {userData?.createdAt && (
          <div className={`mt-6 text-center ${compactView ? 'py-3' : 'py-4'}`}>
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border-2 ${'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20'} backdrop-blur-sm`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className={`text-sm font-medium ${'text-primary'}`}>Miembro desde</span>
              </div>
              <div className={`px-3 py-1 rounded-xl ${'bg-card/70'} border border-primary/20`}>
                <span className={`font-bold text-foreground`}>
                  {new Date(userData.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${'text-primary'}`}>🎉</span>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              </div>
            </div>
            <p className={`text-xs mt-2 text-muted-foreground`}>¡Gracias por ser parte de Captus!</p>
          </div>
        )}
      </div>
    </Card>
  )
}
