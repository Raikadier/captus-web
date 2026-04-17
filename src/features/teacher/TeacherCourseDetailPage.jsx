import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCourses } from '../../hooks/useCourses'
import { useEnrollments } from '../../hooks/useEnrollments'
import { useAssignments } from '../../hooks/useAssignments'
import apiClient from '../../shared/api/client'
import { Button } from '../../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs'
import { Plus, Users, FileText, ClipboardList, BookOpen, Calendar as CalendarIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog'
import { Input } from '../../ui/input'
import Loading from '../../ui/loading'
import { toast } from 'sonner'

export default function TeacherCourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getCourse } = useCourses()
  const { getStudents, addStudentManually } = useEnrollments()
  const { getAssignments } = useAssignments()

  const [course, setCourse] = useState(null)
  const [students, setStudents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  // Add Student State
  const [emailToAdd, setEmailToAdd] = useState('')
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)

  // Mock Data
  const mockStudents = [
    { id: 'm1', name: 'Juan Pérez (Mock)', email: 'juan@example.com' },
    { id: 'm2', name: 'Maria Gomez (Mock)', email: 'maria@example.com' },
  ]

  const mockTasks = [
    { id: 't1', title: 'Examen Parcial (Mock)', dueDate: '2025-02-15', description: 'Evaluación de mitad de periodo' },
    { id: 't2', title: 'Proyecto Final (Mock)', dueDate: '2025-03-01', description: 'Entrega del proyecto grupal' }
  ]

  const mockAnnouncements = [
    { id: 'a1', title: 'Bienvenidos (Mock)', body: 'Inicio de curso', type: 'info' },
  ]

  const loadData = useCallback(async () => {
    try {
      const c = await getCourse(id)
      setCourse(c)
      const s = await getStudents(id)
      setStudents(s)
      const a = await getAssignments(id)
      setAssignments(a)
    } catch (err) {
      console.error(err)
      // toast.error('Error cargando datos del curso')
    } finally {
      setLoading(false)
    }
  }, [id, getCourse, getStudents, getAssignments])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddStudent = async () => {
    try {
      await addStudentManually(id, emailToAdd)
      toast.success('Estudiante agregado')
      setEmailToAdd('')
      setIsAddStudentOpen(false)
      loadData() // Refresh list
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading) return <Loading message="Cargando..." />
  if (!course) return <div className="p-6">Curso no encontrado</div>

  // Combine real and mock data for display
  const displayedAssignments = [
    ...assignments,
    ...mockTasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      due_date: t.dueDate,
      is_mock: true
    }))
  ]

  const displayedStudents = [
    ...students,
    ...mockStudents.map(s => ({ ...s, is_mock: true }))
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600 mt-2">{course.description}</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <span className="text-sm font-medium text-green-800">Código de Invitación:</span>
              <span className="font-mono font-bold text-green-900">{course.invite_code}</span>
            </div>
          </div>
        </div>
        <Button onClick={() => navigate(`/teacher/tasks/new/edit?courseId=${id}`)} className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Crear Tarea
        </Button>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="assignments">
          <TabsList>
            <TabsTrigger value="assignments" className="flex gap-2"><FileText className="w-4 h-4" /> Tareas</TabsTrigger>
            <TabsTrigger value="students" className="flex gap-2"><Users className="w-4 h-4" /> Estudiantes</TabsTrigger>
            <TabsTrigger value="announcements" className="flex gap-2"><BookOpen className="w-4 h-4" /> Anuncios</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="mt-6 space-y-4">
            {displayedAssignments.map(assign => (
              <Card key={assign.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/teacher/reviews/${assign.id}`)}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-bold">{assign.title} {assign.is_mock && '(Mock)'}</CardTitle>
                  <Button variant="outline" size="sm" onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/teacher/tasks/${assign.id}/edit`)
                  }}>
                    Editar
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-2">{assign.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="bg-gray-100 px-2 py-1 rounded">Vence: {assign.due_date ? new Date(assign.due_date).toLocaleDateString() : 'Sin fecha'}</span>
                    <span className="text-blue-600 font-medium flex items-center gap-1">
                      <ClipboardList className="w-4 h-4" />
                      Revisar Entregas
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {displayedAssignments.length === 0 && <p className="text-gray-500 p-4">No hay tareas creadas.</p>}
          </TabsContent>

          <TabsContent value="students" className="mt-6 space-y-3">
            <div className="flex justify-end mb-4 gap-2">
              <Button variant="outline" onClick={async () => {
                try {
                  const response = await apiClient.get(`/courses/${id}/grades/download`, { responseType: 'blob' });
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', `notas_curso_${id}.txt`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                } catch (error) {
                  toast.error('Error al descargar notas');
                  console.error(error);
                }
              }}>
                <FileText className="w-4 h-4 mr-2" /> Descargar Notas
              </Button>
              <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline"><Plus className="w-4 h-4 mr-2" /> Agregar Estudiante</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Estudiante Manualmente</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input placeholder="Email del estudiante" value={emailToAdd} onChange={e => setEmailToAdd(e.target.value)} />
                    <Button onClick={handleAddStudent} className="w-full">Agregar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {displayedStudents.map((s) => (
              <div key={s.id} className="p-3 border border-gray-200 rounded-lg bg-white">
                <p className="font-medium text-gray-900">{s.name}</p>
                <p className="text-sm text-gray-600">{s.email}</p>
                {s.is_mock && <span className="text-xs text-gray-400">(Mock Data)</span>}
              </div>
            ))}
            {displayedStudents.length === 0 && <p className="text-gray-500">No hay estudiantes inscritos.</p>}
          </TabsContent>

          <TabsContent value="announcements" className="mt-6 space-y-3">
            {mockAnnouncements.map((a) => (
              <div key={a.id} className="p-3 border border-gray-200 rounded-lg bg-white">
                <p className="font-medium text-gray-900">{a.title}</p>
                <p className="text-sm text-gray-600">{a.body}</p>
                <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 inline-block mt-2">{a.type}</span>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
