import React, { useState, useEffect } from 'react'
import { Users, Plus, MessageCircle, Calendar, CheckSquare, Search, X, ChevronDown, MoreVertical, School } from 'lucide-react'
import { Button } from '../../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog'
import { useGroups } from '../../hooks/useGroups'
import { useCourses } from '../../hooks/useCourses'
import apiClient from '../../shared/api/client'
import { toast } from 'sonner'
import { FadeIn, StaggerContainer, StaggerItem } from '../../shared/components/animations/MotionComponents'
import { useTheme } from '../../context/themeContext'
import { Card } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Textarea } from '../../ui/textarea'
import Loading from '../../ui/loading'

export default function GroupsPage() {
  const { darkMode } = useTheme()
  const { groups, loading, createGroup, refresh } = useGroups()
  const { courses } = useCourses()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [availableStudents, setAvailableStudents] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (selectedCourseId) {
      const fetchStudents = async () => {
        try {
          const response = await apiClient.get(`/enrollments/course/${selectedCourseId}/students`);
          setAvailableStudents(response.data);
        } catch (error) {
          console.error('Error fetching students:', error);
          toast.error('Error al cargar estudiantes');
        }
      };
      fetchStudents();
    } else {
      setAvailableStudents([]);
    }
  }, [selectedCourseId]);

  const addStudent = (student) => {
    if (!selectedStudents.find(s => s.id === student.id)) {
      setSelectedStudents([...selectedStudents, student])
    }
    setSearchInput('')
    setShowSuggestions(false)
  }

  const removeStudent = (studentId) => {
    setSelectedStudents(selectedStudents.filter(s => s.id !== studentId))
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Por favor ingresa un nombre para el grupo')
      return
    }
    if (!selectedCourseId) {
      toast.error('Por favor selecciona un curso')
      return
    }

    setCreating(true)
    try {
      const newGroup = await createGroup({
        name: groupName,
        description: groupDescription,
        course_id: selectedCourseId
      });

      if (selectedStudents.length > 0) {
        await Promise.all(selectedStudents.map(student =>
          apiClient.post('/groups/add-member', { groupId: newGroup.id, studentId: student.id })
        ));
      }

      toast.success(`Grupo "${groupName}" creado exitosamente`);
      refresh();
      setShowCreateForm(false)
      resetForm()
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCreating(false)
    }
  }

  const resetForm = () => {
    setGroupName('')
    setGroupDescription('')
    setSelectedCourseId('')
    setSelectedStudents([])
    setSearchInput('')
  }

  const handleJoinGroup = () => {
    toast.info('Función de unirse próximamente');
  }

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const suggestedStudents = availableStudents.filter(student =>
    student.name.toLowerCase().includes(searchInput.toLowerCase()) &&
    !selectedStudents.find(s => s.id === student.id)
  )

  const getCourseName = (id) => courses.find(c => c.id === id)?.title || 'Curso desconocido';

  if (loading) return <Loading fullScreen message="Cargando grupos..." />

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-background' : 'bg-[#F6F7FB]'}`}>
      <div className="max-w-7xl mx-auto p-6 md:p-8 pb-24">

        <FadeIn>
          <div className={`rounded-2xl shadow-sm p-6 mb-8 border ${darkMode ? 'bg-card border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Mis Grupos</h1>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Colabora y gestiona tus equipos de trabajo</p>
                </div>
              </div>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Grupo
              </Button>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mb-8 relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <Input
              type="text"
              placeholder="Buscar grupos por nombre o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-12 py-6 text-lg rounded-xl border-0 shadow-sm ${darkMode
                ? 'bg-card text-white placeholder-gray-500 focus:ring-primary/50'
                : 'bg-white text-gray-900 placeholder-gray-400 focus:ring-primary/20'
                }`}
            />
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.length === 0 ? (
            <div className="col-span-full">
              <FadeIn>
                <div className={`text-center py-16 rounded-2xl border-2 border-dashed ${darkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white/50'}`}>
                  <Users className={`mx-auto h-16 w-16 mb-4 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                  <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No hay grupos</h3>
                  <p className={`mb-6 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {searchQuery ? 'No se encontraron grupos con ese criterio' : 'Crea tu primer grupo para comenzar a colaborar'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Grupo
                    </Button>
                  )}
                </div>
              </FadeIn>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <StaggerItem key={group.id}>
                <Card
                  className={`h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer border-0 overflow-hidden group ${darkMode ? 'bg-card hover:bg-gray-800' : 'bg-white hover:shadow-lg'
                    }`}
                  onClick={() => setSelectedGroup(group)}
                >
                  <div className={`h-2 w-full bg-gradient-to-r from-primary to-purple-500`} />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                        <Users className="w-5 h-5" />
                      </div>
                      <Badge variant="secondary" className={`${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {group.members} miembros
                      </Badge>
                    </div>

                    <h3 className={`text-xl font-bold mb-2 line-clamp-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {group.name}
                    </h3>
                    <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {group.description || 'Sin descripción'}
                    </p>

                    <div className={`pt-4 border-t flex items-center justify-between text-xs ${darkMode ? 'border-gray-800 text-gray-500' : 'border-gray-100 text-gray-400'}`}>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(group.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckSquare className="w-3 h-3" />
                        0 tareas
                      </div>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))
          )}
        </StaggerContainer>

        {/* Create Group Dialog */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Grupo</DialogTitle>
              <DialogDescription>
                Crea un espacio colaborativo para tu equipo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Nombre del Grupo</Label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Ej. Proyecto Final Matemáticas"
                />
              </div>

              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Describe el propósito del grupo..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Curso Asociado</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {selectedCourseId ? getCourseName(selectedCourseId) : 'Seleccionar curso...'}
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[550px]">
                    {courses.map(course => (
                      <DropdownMenuItem
                        key={course.id}
                        onClick={() => {
                          setSelectedCourseId(course.id)
                          setSelectedStudents([])
                        }}
                      >
                        <School className="w-4 h-4 mr-2" />
                        {course.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {selectedCourseId && (
                <div className="space-y-2">
                  <Label>Añadir Integrantes ({selectedStudents.length})</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value)
                        setShowSuggestions(true)
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Buscar estudiante..."
                      className="pl-9"
                    />
                    {showSuggestions && searchInput && suggestedStudents.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto">
                        {suggestedStudents.map((student) => (
                          <div
                            key={student.id}
                            onClick={() => addStudent(student)}
                            className="px-4 py-2 hover:bg-accent cursor-pointer text-sm"
                          >
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-muted-foreground">{student.email}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedStudents.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedStudents.map((student) => (
                        <Badge key={student.id} variant="secondary" className="pl-2 pr-1 py-1">
                          {student.name}
                          <button onClick={() => removeStudent(student.id)} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancelar</Button>
              <Button onClick={handleCreateGroup} disabled={creating}>
                {creating ? 'Creando...' : 'Crear Grupo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Group Details Dialog */}
        <Dialog open={!!selectedGroup} onOpenChange={(open) => !open && setSelectedGroup(null)}>
          <DialogContent className="sm:max-w-[700px]">
            {selectedGroup && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl">{selectedGroup.name}</DialogTitle>
                      <DialogDescription>{selectedGroup.description}</DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-4 py-6">
                  <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{selectedGroup.members}</div>
                    <div className={`text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-blue-600/60'}`}>Miembros</div>
                  </div>
                  <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{selectedGroup.tasks || 0}</div>
                    <div className={`text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-purple-600/60'}`}>Tareas</div>
                  </div>
                  <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-gray-800' : 'bg-green-50'}`}>
                    <div className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {new Date(selectedGroup.created_at).toLocaleDateString()}
                    </div>
                    <div className={`text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-green-600/60'}`}>Creado</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Acciones Rápidas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:border-primary hover:text-primary">
                      <MessageCircle className="w-6 h-6" />
                      <span>Abrir Chat</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:border-primary hover:text-primary">
                      <CheckSquare className="w-6 h-6" />
                      <span>Ver Tareas</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:border-primary hover:text-primary">
                      <Calendar className="w-6 h-6" />
                      <span>Calendario</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:border-primary hover:text-primary">
                      <Users className="w-6 h-6" />
                      <span>Miembros</span>
                    </Button>
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button variant="ghost" onClick={() => setSelectedGroup(null)}>Cerrar</Button>
                  <Button onClick={() => handleJoinGroup(selectedGroup.id)}>Unirse al Grupo</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
