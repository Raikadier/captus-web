import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSubmissions } from '../../hooks/useSubmissions'
import { useAssignments } from '../../hooks/useAssignments'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { Card, CardContent } from '../../ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog'
import Loading from '../../ui/loading'
import { toast } from 'sonner'
import { ArrowLeft, ExternalLink, CheckCircle, Clock, ListChecks } from 'lucide-react'

export default function TeacherReviewsPage() {
  const { studentId } = useParams()
  const assignmentId = studentId;

  const navigate = useNavigate()
  const { getSubmissions, gradeSubmission } = useSubmissions()
  const { getAssignment } = useAssignments()

  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  // Grading Modal State
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [grade, setGrade] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isGradeOpen, setIsGradeOpen] = useState(false)

  // Mock Data
  const mockReviews = [
    { id: 'm1', studentName: 'Carlos Mock', submittedAt: '2025-01-20T10:00:00', grade: 85, graded: true, feedback: 'Buen trabajo' },
    { id: 'm2', studentName: 'Ana Mock', submittedAt: '2025-01-21T11:30:00', grade: null, graded: false, feedback: '' }
  ]

  const loadData = async () => {
      try {
          const a = await getAssignment(assignmentId)
          setAssignment(a)
          const s = await getSubmissions(assignmentId)
          setSubmissions(s)
      } catch (e) {
          console.error(e)
          toast.error('Error cargando entregas')
      } finally {
          setLoading(false)
      }
  }

  useEffect(() => {
    loadData()
  }, [assignmentId])

  const handleGrade = async () => {
      try {
          if (!grade) return toast.error('Ingresa una nota');

          if (selectedSubmission.is_mock) {
              toast.success('Calificación simulada guardada (Mock)');
              setIsGradeOpen(false);
              return;
          }

          await gradeSubmission(selectedSubmission.id, { grade, feedback });
          toast.success('Calificación guardada');
          setIsGradeOpen(false);
          loadData(); // Refresh
      } catch (error) {
          toast.error(error.message);
      }
  }

  const openGradeModal = (sub) => {
      setSelectedSubmission(sub)
      setGrade(sub.grade || '')
      setFeedback(sub.feedback || '')
      setIsGradeOpen(true)
  }

  if (loading) return <Loading message="Cargando..." />

  // Combine Real and Mock
  const displayedSubmissions = [
      ...submissions,
      ...mockReviews.map(m => ({
          id: m.id,
          student: { name: m.studentName },
          submitted_at: m.submittedAt,
          grade: m.grade,
          graded: m.graded,
          feedback: m.feedback,
          file_url: '#',
          is_mock: true
      }))
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="bg-card rounded-xl shadow-sm p-6 flex items-center gap-3">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <ListChecks className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Revisiones: {assignment?.title || 'Cargando...'}</h1>
          <p className="text-sm text-muted-foreground">Total entregas: {displayedSubmissions.length}</p>
        </div>
      </div>

       <div className="grid grid-cols-1 gap-4">
           {displayedSubmissions.map(sub => (
               <Card key={sub.id} className="hover:shadow-sm transition-shadow">
                   <CardContent className="p-4 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                           <div className={`w-2 h-12 rounded-full ${sub.graded ? 'bg-green-500' : 'bg-yellow-500'}`} />
                           <div>
                               <h3 className="font-bold text-foreground flex items-center gap-2">
                                   {sub.student?.name || sub.student?.email || (sub.group ? `Grupo: ${sub.group.name}` : 'Desconocido')}
                                   {sub.is_mock && <span className="text-xs text-muted-foreground font-normal">(Mock)</span>}
                               </h3>
                               <div className="text-sm text-muted-foreground flex items-center gap-2">
                                   <Clock className="w-3 h-3" />
                                   Entregado: {new Date(sub.submitted_at).toLocaleString()}
                               </div>
                               <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline flex items-center gap-1 mt-1">
                                   <ExternalLink className="w-3 h-3" /> Ver archivo
                               </a>
                           </div>
                       </div>

                       <div className="flex items-center gap-4">
                           {sub.graded && (
                               <div className="text-right mr-4">
                                   <div className="text-2xl font-bold text-green-700">{sub.grade}</div>
                                   <div className="text-xs text-muted-foreground">Calificado</div>
                               </div>
                           )}

                           <Dialog open={isGradeOpen && selectedSubmission?.id === sub.id} onOpenChange={(open) => !open && setIsGradeOpen(false)}>
                               <DialogTrigger asChild>
                                   <Button onClick={() => openGradeModal(sub)}>
                                       {sub.graded ? 'Editar Nota' : 'Calificar'}
                                   </Button>
                               </DialogTrigger>
                               <DialogContent>
                                   <DialogHeader>
                                       <DialogTitle>Calificar Entrega</DialogTitle>
                                   </DialogHeader>
                                   <div className="space-y-4 py-4">
                                       <div className="space-y-2">
                                           <label className="text-sm font-medium">Calificación (0-100)</label>
                                           <Input
                                                type="number"
                                                value={grade}
                                                onChange={e => setGrade(e.target.value)}
                                                placeholder="Ej: 95"
                                           />
                                       </div>
                                       <div className="space-y-2">
                                           <label className="text-sm font-medium">Feedback (Opcional)</label>
                                           <Textarea
                                                value={feedback}
                                                onChange={e => setFeedback(e.target.value)}
                                                placeholder="Comentarios para el estudiante..."
                                           />
                                       </div>
                                       <Button onClick={handleGrade} className="w-full">Guardar Calificación</Button>
                                   </div>
                               </DialogContent>
                           </Dialog>
                       </div>
                   </CardContent>
               </Card>
           ))}
           {displayedSubmissions.length === 0 && (
               <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed border-border">
                   No hay entregas para esta tarea aún.
               </div>
           )}
       </div>
    </div>
  )
}
