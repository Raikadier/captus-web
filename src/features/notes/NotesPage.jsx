import React, { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, MessageSquare, Pin, Edit, Trash2, Search as SearchIcon, Plus, FileText, X, Save, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../ui/button'
import { Card } from '../../ui/card'
import { Input } from '../../ui/input'
import { Badge } from '../../ui/badge'
import { Textarea } from '../../ui/textarea'
import { Label } from '../../ui/label'
import { Switch } from '../../ui/switch'
import Loading from '../../ui/loading'
import apiClient from '../../shared/api/client'

function getCurrentDate() {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ]
  const now = new Date()
  return `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`
}

const colorOptions = ['blue', 'purple', 'green', 'orange', 'red', 'yellow']

const getColorClass = (color) => {
    const map = {
      blue: 'bg-blue-50 border-blue-200',
      purple: 'bg-purple-50 border-purple-200',
      green: 'bg-green-50 border-green-200',
      orange: 'bg-orange-50 border-orange-200',
      red: 'bg-red-50 border-red-200',
      yellow: 'bg-yellow-50 border-yellow-200',
      'bg-blue-50': 'bg-blue-50 border-blue-200', // Fallback for new notes
      'bg-purple-50': 'bg-purple-50 border-purple-200',
      'bg-green-50': 'bg-green-50 border-green-200',
      'bg-orange-50': 'bg-orange-50 border-orange-200',
      'bg-red-50': 'bg-red-50 border-red-200',
      'bg-yellow-50': 'bg-yellow-50 border-yellow-200',
    }
    return map[color] || 'bg-card border-border'
}

function NoteDetailModal({ note, onClose, onSave, onDelete, onTogglePin }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(note.title)
  const [editedContent, setEditedContent] = useState(note.content)
  const [editedSubject, setEditedSubject] = useState(note.subject || '')

  const handleSave = () => {
    onSave(note.id, {
      title: editedTitle,
      content: editedContent,
      subject: editedSubject,
    })
    setIsEditing(false)
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-border">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${getColorClass(note.color).split(' ')[0]} rounded-lg flex items-center justify-center`}>
                <FileText size={24} className="text-gray-700" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Detalle de Nota</h2>
                <p className="text-sm text-muted-foreground">
                  Editado: {note.lastEdited.includes('-') ?
                    new Date(note.lastEdited).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                    : note.lastEdited}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="mt-1 bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label>Materia</Label>
                <Input
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="mt-1 bg-background border-border text-foreground"
                  placeholder="Opcional"
                />
              </div>
              <div>
                <Label>Contenido</Label>
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="mt-1 min-h-[300px] bg-background border-border text-foreground"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                  <Save size={16} className="mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-foreground mb-2">{note.title}</h3>
                {note.subject && (
                  <span className="inline-block text-sm font-medium text-card-foreground bg-muted px-3 py-1 rounded-md">
                    {note.subject}
                  </span>
                )}
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{note.content}</p>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => onTogglePin(note.id)}
                  className={note.pinned ? 'text-primary border-primary' : ''}
                >
                  <Pin size={16} className="mr-2" />
                  {note.pinned ? 'Desfijar' : 'Fijar'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit size={16} className="mr-2" />
                  Editar
                </Button>
                <Button variant="outline" onClick={() => onDelete(note.id)} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                  <Trash2 size={16} className="mr-2" />
                  Eliminar
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function CreateNoteModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subject, setSubject] = useState('')
  const [isPinned, setIsPinned] = useState(false)

  const handleCreate = () => {
    if (title.trim() && content.trim()) {
      onCreate({
        title,
        content,
        subject: subject || null,
        is_pinned: isPinned,
      })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-border">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Plus size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Nueva Nota</h2>
                <p className="text-sm text-muted-foreground">Crea una nueva nota para tus estudios</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la nota"
                className="mt-1 bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label>Materia</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Opcional"
                className="mt-1 bg-background border-border text-foreground"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="pinned"
                checked={isPinned}
                onCheckedChange={setIsPinned}
              />
              <Label htmlFor="pinned">Fijar nota</Label>
            </div>
            <div>
              <Label>Contenido *</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe el contenido de tu nota aquí..."
                className="mt-1 min-h-[300px] bg-background border-border text-foreground"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!title.trim() || !content.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                <Save size={16} className="mr-2" />
                Crear Nota
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function NoteCard({ note, index, onClick, onTogglePin }) {
  const colorClass = useMemo(() => getColorClass(note.color), [note.color])

  const handlePinClick = (e) => {
    e.stopPropagation()
    onTogglePin(note.id)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
      <Card
        className={`p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border ${colorClass} cursor-pointer relative`}
        onClick={onClick}
      >
        <button
          onClick={handlePinClick}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-card/50 transition-colors"
          title={note.pinned ? 'Desfijar nota' : 'Fijar nota'}
        >
          <Pin size={14} className={note.pinned ? 'text-primary' : 'text-muted-foreground'} />
        </button>
        <div className="flex justify-between items-start mb-3 pr-8">
          <h3 className="font-semibold text-gray-900 text-base flex-1">{note.title}</h3>
        </div>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{note.content}</p>
        <div className="flex justify-between items-center">
          {note.subject ? (
            <Badge variant="outline" className="bg-card">
              {note.subject}
            </Badge>
          ) : (<div></div>)}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Editado:{' '}
          {note.lastEdited.includes('-') ?
            new Date(note.lastEdited).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
            : note.lastEdited}
        </p>
      </Card>
    </motion.div>
  )
}

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/notes')
      if (response.data.success) {
        // Add color to notes for UI
        const notesWithColor = response.data.data.map((note, index) => ({
          ...note,
          color: colorOptions[index % colorOptions.length]
        }))
        setNotes(notesWithColor)
      } else {
        setError(response.data.message || 'Error al cargar notas')
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
      console.error('Error loading notes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNote = async (noteId, updates) => {
    try {
      const response = await apiClient.put(`/notes/${noteId}`, updates)
      if (response.data.success) {
        setNotes(notes.map((n) => (n.id === noteId ? { ...n, ...response.data.data } : n)))
        setSelectedNote(null)
      } else {
        alert('Error al guardar la nota: ' + response.data.message)
      }
    } catch (err) {
      alert('Error al guardar la nota')
      console.error('Error saving note:', err)
    }
  }

  const handleDeleteNote = async (noteId) => {
    setShowDeleteConfirm(noteId)
  }

  const confirmDeleteNote = async () => {
    const noteId = showDeleteConfirm
    setShowDeleteConfirm(null)
    try {
      const response = await apiClient.delete(`/notes/${noteId}`)
      if (response.data.success) {
        setNotes(notes.filter((n) => n.id !== noteId))
        setSelectedNote(null)
      } else {
        alert('Error al eliminar la nota: ' + response.data.message)
      }
    } catch (err) {
      alert('Error al eliminar la nota')
      console.error('Error deleting note:', err)
    }
  }

  const handleTogglePin = async (noteId) => {
    try {
      const response = await apiClient.put(`/notes/${noteId}/toggle-pin`)
      if (response.data.success) {
        setNotes(notes.map((n) => (n.id === noteId ? { ...n, ...response.data.data } : n)))
        // Update selected note if open
        if (selectedNote && selectedNote.id === noteId) {
          setSelectedNote(prev => ({ ...prev, ...response.data.data }))
        }
      } else {
        alert('Error al cambiar el estado de fijación: ' + response.data.message)
      }
    } catch (err) {
      alert('Error al cambiar el estado de fijación')
      console.error('Error toggling pin:', err)
    }
  }

  const handleCreateNote = async (newNote) => {
    try {
      const response = await apiClient.post('/notes', newNote)
      if (response.data.success) {
        const createdNote = {
          ...response.data.data,
          color: colorOptions[notes.length % colorOptions.length]
        }
        setNotes([...notes, createdNote])
      } else {
        alert('Error al crear la nota: ' + response.data.message)
      }
    } catch (err) {
      alert('Error al crear la nota')
      console.error('Error creating note:', err)
    }
  }

  const pinnedNotes = useMemo(() => notes.filter((n) => n.pinned), [notes])
  const regularNotes = useMemo(
    () =>
      notes
        .filter((n) => !n.pinned)
        .filter((n) => {
          if (!searchQuery.trim()) return true
          const q = searchQuery.toLowerCase()
          return (
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q) ||
            (n.subject && n.subject.toLowerCase().includes(q))
          )
        }),
    [notes, searchQuery]
  )

  const filteredPinnedNotes = pinnedNotes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.subject && note.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando notas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={loadNotes} className="bg-primary hover:bg-primary/90">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <header className="sticky top-0 bg-card rounded-xl shadow-sm p-6 mb-6 z-10 border border-border">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">📝 Mis Notas</h1>
              <p className="text-muted-foreground mt-1">{getCurrentDate()}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowCreateModal(true)}>
                <Plus size={16} className="mr-2" />
                Nueva Nota
              </Button>
            </div>
          </div>
        </header>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Buscar notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border text-foreground"
            />
          </div>
        </div>

        {/* Pinned Notes */}
        {filteredPinnedNotes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Pin size={18} className="mr-2 text-primary" />
              Notas Fijadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPinnedNotes.map((note, index) => (
                <NoteCard key={note.id} note={note} index={index} onClick={() => setSelectedNote(note)} onTogglePin={handleTogglePin} />
              ))}
            </div>
          </div>
        )}

        {/* Regular Notes */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Todas las Notas</h2>
          <AnimatePresence>
            {regularNotes.length === 0 && filteredPinnedNotes.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-card rounded-xl border border-border">
                <p className="text-muted-foreground">No se encontraron notas</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regularNotes.map((note, index) => (
                  <NoteCard key={note.id} note={note} index={index} onClick={() => setSelectedNote(note)} onTogglePin={handleTogglePin} />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {selectedNote && (
        <NoteDetailModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
          onTogglePin={handleTogglePin}
        />
      )}

      {showCreateModal && <CreateNoteModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateNote} />}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto border border-border">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Trash2 size={24} className="text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Eliminar Nota</h2>
                    <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm(null)}>
                  <X size={20} />
                </Button>
              </div>

              <p className="text-muted-foreground mb-6">
                ¿Estás seguro de que quieres eliminar esta nota? Se perderá permanentemente.
              </p>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                  Cancelar
                </Button>
                <Button onClick={confirmDeleteNote} className="bg-red-600 hover:bg-red-700">
                  <Trash2 size={16} className="mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
