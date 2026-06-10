import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, ChevronRight, Plus, GraduationCap, BarChart3, Calendar } from 'lucide-react'
import { Button } from '../../ui/button'
import { useCourses } from '../../hooks/useCourses'
import { useEnrollments } from '../../hooks/useEnrollments'
import { useAuth } from '../../hooks/useAuth'
import { toast } from 'sonner'
import { Input } from '../../ui/input'
import Loading from '../../ui/loading'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../../ui/dialog'
import { FadeIn, StaggerContainer, StaggerItem } from '../../shared/components/animations/MotionComponents'
import { Card } from '../../ui/card'
import { Progress } from '../../ui/progress'
import { Badge } from '../../ui/badge'

export default function StudentCoursesPage() {
  const navigate = useNavigate()
  const { courses, loading, error, refresh } = useCourses()
  const { joinByCode } = useEnrollments()
  const [inviteCode, setInviteCode] = useState('')
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [joining, setJoining] = useState(false)

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      toast.error('Por favor ingresa un código')
      return
    }

    setJoining(true)
    try {
      await joinByCode(inviteCode);
      toast.success('Inscripción exitosa');
      setIsJoinDialogOpen(false);
      setInviteCode('');
      refresh();
    } catch (error) {
      toast.error(error.message || 'Error al inscribirse');
    } finally {
      setJoining(false)
    }
  }

  const { user } = useAuth()

  // Redirect teachers to their own page
  React.useEffect(() => {
    if (user?.user_metadata?.role === 'teacher') {
      navigate('/teacher/courses')
    }
  }, [user, navigate])

  if (loading) return <Loading fullScreen message="Cargando cursos..." />

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-destructive/10 rounded-xl">
          <p className="text-destructive mb-4">Error al cargar los cursos: {error}</p>
          <Button onClick={refresh}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${'bg-background'}`}>
      <div className="max-w-7xl mx-auto p-6 md:p-8 pb-24">

        <FadeIn>
          <div className={`rounded-2xl shadow-sm p-6 mb-8 border bg-card border-border`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 text-primary`}>
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold text-foreground`}>Mis Cursos</h1>
                  <p className={`text-muted-foreground`}>Gestiona tu aprendizaje y progreso académico</p>
                </div>
              </div>

              <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-white shadow-brand-sm shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Unirse a un curso
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Unirse mediante código</DialogTitle>
                    <DialogDescription>
                      Ingresa el código de invitación proporcionado por tu profesor.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Código de invitación</label>
                      <Input
                        placeholder="Ej: A1B2C3"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        className="text-center text-lg tracking-widest uppercase"
                        maxLength={8}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleJoin} disabled={joining} className="w-full sm:w-auto">
                      {joining ? 'Uniéndose...' : 'Unirse al Curso'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length === 0 ? (
            <div className="col-span-full">
              <FadeIn>
                <div className={`text-center py-16 rounded-2xl border-2 border-dashed border-border bg-card/50`}>
                  <GraduationCap className={`mx-auto h-16 w-16 mb-4 text-muted-foreground`} />
                  <h3 className={`text-lg font-semibold mb-2 text-foreground`}>No estás inscrito en cursos</h3>
                  <p className={`mb-6 text-muted-foreground`}>
                    Únete a un curso usando un código de invitación para comenzar.
                  </p>
                  <Button onClick={() => setIsJoinDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Unirse a un curso
                  </Button>
                </div>
              </FadeIn>
            </div>
          ) : (
            courses.map((course) => (
              <StaggerItem key={course.id}>
                <Card
                  className={`h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer border-0 overflow-hidden group flex flex-col ${'bg-card hover:shadow-md'
                    }`}
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <div
                    className="h-32 w-full relative overflow-hidden"
                    style={{ backgroundColor: course.color || '#3b82f6' }}
                  >
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md line-clamp-1">
                        {course.title}
                      </h3>
                      <div className="flex items-center text-white/90 text-sm">
                        <GraduationCap className="w-4 h-4 mr-1" />
                        {course.professor}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="space-y-4 mb-6 flex-1">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className={`flex items-center gap-1 text-muted-foreground`}>
                            <BarChart3 className="w-4 h-4" />
                            Progreso
                          </span>
                          <span className={`font-semibold text-foreground`}>
                            {course.progress}%
                          </span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>

                      <div className={`flex items-center gap-2 text-xs text-muted-foreground`}>
                        <Calendar className="w-3 h-3" />
                        <span>Inscrito: {new Date(course.enrolled_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border mt-auto">
                      <Button
                        className={`w-full justify-between group-hover:bg-primary group-hover:text-white transition-colors ${'bg-background text-foreground hover:bg-primary hover:text-primary-foreground'
                          }`}
                        variant="ghost"
                      >
                        Ver contenido
                        <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))
          )}
        </StaggerContainer>
      </div>
    </div>
  )
}
