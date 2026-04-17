import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, X, FileText } from 'lucide-react'
import { Button } from '../../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'

export default function TeacherReviewSubmissionPage() {
  const { studentId } = useParams()
  const navigate = useNavigate()

  const submission = {
    student: 'María Gómez',
    task: 'Ensayo cap. 2',
    course: 'Programación I',
    content: 'Contenido de la entrega...'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-card rounded-xl shadow-sm p-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <FileText className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Revisión de entrega</h1>
          <p className="text-sm text-muted-foreground">Estudiante {submission.student} • {submission.course}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{submission.task}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{submission.content}</p>
          <div className="flex gap-3">
            <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('/teacher/tasks')}>
              <Check className="w-4 h-4 mr-2" />
              Aprobar
            </Button>
            <Button variant="outline" onClick={() => navigate('/teacher/tasks')}>
              <X className="w-4 h-4 mr-2" />
              Rechazar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
