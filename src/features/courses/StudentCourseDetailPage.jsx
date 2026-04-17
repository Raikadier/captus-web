import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCourses } from '../../hooks/useCourses'
import { useAssignments } from '../../hooks/useAssignments'
import { useCourseGroups } from '../../hooks/useCourseGroups'
import { useSubmissions } from '../../hooks/useSubmissions'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../ui/breadcrumb'
import { Badge } from '../../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table'
import { Progress } from '../../ui/progress'
import { toast } from 'sonner'
import Loading from '../../ui/loading'
import {
  FileText,
  Users,
  Clock,
  Upload,
  CheckCircle,
  ArrowLeft,
  PlayCircle,
  File as FilePdf,
  Bookmark,
  CheckCircle2,
  Calendar,
  Bell,
  BadgeCheck
} from 'lucide-react'

export default function StudentCourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  const { getCourse } = useCourses()
  const { getAssignments } = useAssignments()
  const { getGroups } = useCourseGroups()
  const { getSubmissions, submitAssignment } = useSubmissions()

  // Real Data State
  const [realCourse, setRealCourse] = useState(null)
  const [realAssignments, setRealAssignments] = useState([])
  const [groups, setGroups] = useState([])
  const [submissions, setSubmissions] = useState({})

  // UI State
  const [loading, setLoading] = useState(true)
  const [fileUrl, setFileUrl] = useState('')
  const [selectedAssignment, setSelectedAssignment] = useState(null)

  // Mock Data
  const mockCourse = {
    name: 'Cálculo Diferencial (Mock)',
    professor: 'Dr. Juan Pérez',
    color: '#3b82f6',
  }

  const contentItems = [
    { id: 1, title: 'Introducción al Cálculo', type: 'Video', viewed: true, duration: '15 min' },
    { id: 2, title: 'Límites - Teoría', type: 'PDF', viewed: true, pages: 12 },
    { id: 3, title: 'Ejercicios de Límites', type: 'Apunte', viewed: false, pages: 5 },
    { id: 4, title: 'Quiz: Límites Básicos', type: 'Quiz', viewed: false, questions: 10 },
    { id: 5, title: 'Continuidad de Funciones', type: 'Video', viewed: false, duration: '20 min' },
  ]

  const mockAssignments = [
    { id: 'm1', name: 'Taller 1: Límites', dueDate: '2025-01-20', status: 'entregada', grade: 95 },
    { id: 'm2', name: 'Taller 2: Continuidad', dueDate: '2025-01-25', status: 'entregada', grade: 88 },
    { id: 'm3', name: 'Taller 3: Derivadas', dueDate: '2025-02-01', status: 'pendiente', grade: null },
    { id: 'm4', name: 'Parcial 1', dueDate: '2025-01-15', status: 'atrasada', grade: null },
  ]

  const announcements = [
    { id: 1, title: 'Cambio de horario para el parcial', date: '2025-01-18', type: 'Urgente', content: 'El parcial se realizará el viernes a las 2 PM' },
    { id: 2, title: 'Nuevo material disponible', date: '2025-01-17', type: 'General', content: 'Se ha publicado el material de derivadas' },
    { id: 3, title: 'Recordatorio: Taller 3', date: '2025-01-16', type: 'Recordatorio', content: 'El taller 3 vence este viernes' },
  ]

  const mockStudents = [
    { id: 1, name: 'Ana García', status: 'activo', progress: 85 },
    { id: 2, name: 'Carlos Mendoza', status: 'activo', progress: 92 },
    { id: 3, name: 'Laura Pérez', status: 'activo', progress: 78 },
    { id: 4, name: 'Miguel Torres', status: 'retirado', progress: 45 },
    { id: 5, name: 'Sofia Ramirez', status: 'activo', progress: 95 },
  ]

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const c = await getCourse(id)
      setRealCourse(c)

      const a = await getAssignments(id)
      setRealAssignments(a || [])

      const g = await getGroups(id)
      setGroups(g || [])

      // Load submissions for assignments
      if (a && a.length > 0) {
        const subs = {}
        for (const assign of a) {
          const sub = await getSubmissions(assign.id)
          if (sub && sub.length > 0) {
            subs[assign.id] = sub[0] // Assuming one submission per student per assignment
          }
        }
        setSubmissions(subs)
      }

    } catch (err) {
      console.error(err)
      // toast.error('Error cargando datos del curso')
    } finally {
      setLoading(false)
    }
  }, [id, getCourse, getAssignments, getGroups, getSubmissions])

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id, loadData])

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Video': return <PlayCircle className="w-4 h-4 text-blue-600" />
      case 'PDF': return <FilePdf className="w-4 h-4 text-red-600" />
      case 'Apunte': return <Bookmark className="w-4 h-4 text-primary" />
      case 'Quiz': return <CheckCircle2 className="w-4 h-4 text-purple-600" />
      default: return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const handleSubmit = async () => {
    if (!fileUrl) return toast.error('Debes ingresar una URL del archivo');
    if (!selectedAssignment) return;

    let groupId = null;
    if (selectedAssignment.is_group_assignment) {
      const myGroup = groups.find(g =>
        g.members && g.members.some(m => m.student_id === user.id)
      );

      if (!myGroup) {
        return toast.error('Debes pertenecer a un grupo para entregar esta tarea');
      }
      groupId = myGroup.id;
    }

    try {
      await submitAssignment({
        assignment_id: selectedAssignment.id,
        file_url: fileUrl,
        group_id: groupId
      });
      toast.success('Tarea entregada');
      setFileUrl('');
      setSelectedAssignment(null);
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'entregada':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Entregada</Badge>
      case 'pendiente':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pendiente</Badge>
      case 'atrasada':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Atrasada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getAnnouncementBadge = (type) => {
    switch (type) {
      case 'Urgente':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Urgente</Badge>
      case 'Recordatorio':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Recordatorio</Badge>
      case 'General':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">General</Badge>
      default:
        return null
    }
  }

  if (loading) return <Loading message="Cargando curso..." />

  const displayCourse = realCourse || mockCourse

  // Merge Assignments for display
  const displayedAssignments = [
    ...realAssignments.map(a => ({
      id: a.id,
      name: a.title,
      dueDate: new Date(a.due_date).toLocaleDateString(),
      status: submissions[a.id] ? 'entregada' : 'pendiente', // Simple logic
      grade: submissions[a.id]?.grade,
      is_group_assignment: a.is_group_assignment
    })),
    ...mockAssignments
  ]

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/home">Inicio</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/courses">Cursos</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{displayCourse.title || displayCourse.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header with course info */}
      <div className="bg-card rounded-xl shadow-sm p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/courses')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a cursos
        </Button>

        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-lg"
            style={{ backgroundColor: displayCourse.color || '#3b82f6' }}
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{displayCourse.title || displayCourse.name}</h1>
            <p className="text-sm text-muted-foreground">{displayCourse.description || displayCourse.professor}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Contenido</TabsTrigger>
          <TabsTrigger value="assignments">Tareas</TabsTrigger>
          <TabsTrigger value="announcements">Anuncios</TabsTrigger>
          <TabsTrigger value="students">Estudiantes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Próximas clases */}
            <div className="bg-card rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-foreground mb-4">Próximas Clases</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-foreground">Límites y Continuidad</p>
                  <p className="text-xs text-muted-foreground">Lunes 10:00 AM</p>
                </div>
              </div>
            </div>

            {/* Últimas publicaciones */}
            <div className="bg-card rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-foreground mb-4">Últimas Publicaciones</h3>
              <div className="space-y-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-foreground">Material de Derivadas</p>
                  <p className="text-xs text-muted-foreground">Hace 2 días</p>
                </div>
              </div>
            </div>

            {/* Tareas pendientes */}
            <div className="bg-card rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-foreground mb-4">Tareas Pendientes</h3>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-foreground">Taller 3</p>
                  <p className="text-xs text-muted-foreground">Vence en 2 días</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Material del Curso</h2>
            <div className="space-y-2">
              {contentItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => console.log('[v0] Open content', item.id)}
                >
                  <div className="flex items-center gap-3">
                    {getTypeIcon(item.type)}
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.type} • {item.type === 'Video' ? item.duration : `${item.pages} páginas`}
                      </p>
                    </div>
                  </div>
                  {item.viewed ? (
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                      <BadgeCheck className="w-3 h-3 mr-1" />
                      Visto
                    </Badge>
                  ) : (
                    <Badge variant="outline">No visto</Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Tareas del Curso</h2>
            </div>

            <div className="space-y-3">
              {displayedAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{assignment.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Entrega: {assignment.dueDate}</p>
                      {assignment.grade && (
                        <span className="text-xs text-muted-foreground ml-2">• Nota: {assignment.grade}/100</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(assignment.status)}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedAssignment(assignment)}
                        >
                          {assignment.status === 'entregada' ? 'Ver entrega' : 'Entregar'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Entrega: {assignment.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {assignment.status === 'entregada' ? (
                            <div className="text-center py-4">
                              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                              <p className="font-medium">Tarea entregada correctamente</p>
                              {assignment.grade && <p className="text-lg font-bold mt-2">Nota: {assignment.grade}</p>}
                            </div>
                          ) : (
                            <>
                              <div className="space-y-2">
                                <Label>URL del archivo (Google Drive, Dropbox, etc)</Label>
                                <Input
                                  placeholder="https://..."
                                  value={fileUrl}
                                  onChange={(e) => setFileUrl(e.target.value)}
                                />
                              </div>
                              <Button className="w-full" onClick={handleSubmit}>
                                <Upload className="w-4 h-4 mr-2" />
                                Enviar Tarea
                              </Button>
                            </>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="announcements">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Anuncios del Curso</h2>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                    </div>
                    {getAnnouncementBadge(announcement.type)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
                  <p className="text-xs text-muted-foreground">{announcement.date}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Estudiantes Inscritos</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Progreso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      {student.status === 'activo' ? (
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Activo</Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground hover:bg-muted">Retirado</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={student.progress} className="w-24" />
                        <span className="text-sm text-muted-foreground">{student.progress}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {groups.length === 0 && <p className="text-muted-foreground mt-4">No hay grupos formados.</p>}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
