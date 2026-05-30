/**
 * Reusable event form modal — handles both create and edit.
 * Pass `event` for edit mode, omit for create mode.
 */
import React, { useState } from 'react'
import { Plus, Edit, X, Bell, BellOff } from 'lucide-react'
import { Button } from '../../../ui/button'
import { Input } from '../../../ui/input'
import { Label } from '../../../ui/label'
import { Textarea } from '../../../ui/textarea'
import { Switch } from '../../../ui/switch'

const EVENT_TYPES = ['Reunión', 'Examen', 'Entrega', 'Clase']

function toLocalDateStr(isoDate) {
  return new Date(isoDate).toISOString().split('T')[0]
}

function toLocalTimeStr(isoDate) {
  return new Date(isoDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export function CreateEventModal({ onClose, onCreate, selectedDate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(selectedDate?.toISOString().split('T')[0] || '')
  const [time, setTime] = useState('09:00')
  const [type, setType] = useState('Reunión')
  const [notify, setNotify] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !date) return
    setLoading(true)
    await onCreate({ title, description: description || null, start_date: new Date(`${date}T${time}`).toISOString(), end_date: null, type, notify })
    setLoading(false)
    onClose()
  }

  return <EventFormModal onClose={onClose} onSubmit={handleSubmit} loading={loading}
    title={title} setTitle={setTitle} description={description} setDescription={setDescription}
    date={date} setDate={setDate} time={time} setTime={setTime}
    type={type} setType={setType} notify={notify} setNotify={setNotify}
    mode="create" />
}

export function EditEventModal({ onClose, onUpdate, event }) {
  const [title, setTitle] = useState(event.title)
  const [description, setDescription] = useState(event.description || '')
  const [date, setDate] = useState(toLocalDateStr(event.start_date))
  const [time, setTime] = useState(toLocalTimeStr(event.start_date))
  const [type, setType] = useState(event.type)
  const [notify, setNotify] = useState(event.notify || false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !date) return
    setLoading(true)
    await onUpdate(event.id, { title, description: description || null, start_date: new Date(`${date}T${time}`).toISOString(), end_date: null, type, notify })
    setLoading(false)
    onClose()
  }

  return <EventFormModal onClose={onClose} onSubmit={handleSubmit} loading={loading}
    title={title} setTitle={setTitle} description={description} setDescription={setDescription}
    date={date} setDate={setDate} time={time} setTime={setTime}
    type={type} setType={setType} notify={notify} setNotify={setNotify}
    mode="edit" />
}

function EventFormModal({ onClose, onSubmit, loading, title, setTitle, description, setDescription, date, setDate, time, setTime, type, setType, notify, setNotify, mode }) {
  const isCreate = mode === 'create'
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300 border border-border">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                {isCreate ? <Plus size={24} className="text-primary" /> : <Edit size={24} className="text-primary" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{isCreate ? 'Nuevo Evento' : 'Editar Evento'}</h2>
                <p className="text-sm text-muted-foreground">{isCreate ? 'Crea un evento en tu calendario' : 'Modifica los detalles del evento'}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título del evento" className="mt-1 bg-background border-border text-foreground" />
            </div>
            <div>
              <Label>Tipo</Label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-foreground">
                {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha *</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 bg-background border-border text-foreground" />
              </div>
              <div>
                <Label>Hora</Label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 bg-background border-border text-foreground" />
              </div>
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe tu evento..." className="mt-1 bg-background border-border text-foreground" rows={3} />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="notify-modal" checked={notify} onCheckedChange={setNotify} />
              <Label htmlFor="notify-modal" className="flex items-center gap-2">
                {notify ? <Bell size={16} className="text-primary" /> : <BellOff size={16} />}
                Recibir notificaciones por email
              </Label>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={onSubmit} disabled={!title.trim() || !date || loading} className="bg-primary hover:bg-primary/90">
                {loading ? (isCreate ? 'Creando...' : 'Actualizando...') : (isCreate ? 'Crear Evento' : 'Actualizar Evento')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
