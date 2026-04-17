import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, PlusCircle, Users } from 'lucide-react'
import { Button } from '../../ui/button'
import { useCourses } from '../../hooks/useCourses'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import Loading from '../../ui/loading'
import { toast } from 'sonner'

export default function TeacherCoursesPage() {
  const navigate = useNavigate()
  const { courses, loading, createCourse } = useCourses()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({ title: '', description: '' })

  const handleCreate = async () => {
      try {
          await createCourse(formData);
          toast.success('Curso creado exitosamente');
          setIsCreateOpen(false);
          setFormData({ title: '', description: '' });
      } catch (error) {
          toast.error(error.message);
      }
  }

  if (loading) return <Loading message="Cargando cursos..." />

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between bg-card rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mis Cursos (Profesor)</h1>
            <p className="text-muted-foreground">Gestiona tus clases y estudiantes</p>
          </div>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Crear curso
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Curso</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Título del Curso</label>
                        <Input
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="Ej: Matemáticas Avanzadas"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Descripción</label>
                        <Textarea
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="Breve descripción del curso..."
                        />
                    </div>
                    <Button onClick={handleCreate} className="w-full">Guardar Curso</Button>
                </div>
            </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="p-6 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigate(`/teacher/courses/${course.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">{course.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-3 mb-4">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Código de Invitación</span>
                <div className="text-lg font-mono font-semibold text-green-700 tracking-widest">{course.invite_code}</div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
               <span className="flex items-center gap-1">
                   <Users className="w-4 h-4" /> Gestor de Clase
               </span>
               <span className="text-green-600 font-medium">Entrar &rarr;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
