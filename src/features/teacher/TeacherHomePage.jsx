import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { BookOpen, Users, Calendar, PlusCircle, ListChecks, BarChart3, Network, ClipboardList, Loader2 } from 'lucide-react'
import { Button } from '../../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'

import { courseService } from '../../services/courseService'
import { eventsService } from '../../services/eventsService'
import { submissionService } from '../../services/submissionService'

export default function TeacherHomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [pendingReviews, setPendingReviews] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch Courses
        const coursesData = await courseService.getTeacherCourses()
        setCourses(coursesData)

        // Fetch Upcoming Events
        const eventsResult = await eventsService.getUpcoming({ limit: 5 })
        if (eventsResult.success) {
          setUpcomingEvents(eventsResult.data)
        }

        // Fetch Pending Reviews
        // Note: We need to ensure submissionService has this method
        try {
          const reviewsData = await submissionService.getPendingReviews()
          setPendingReviews(reviewsData)
        } catch (e) {
          console.warn("Could not fetch pending reviews", e)
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="bg-card rounded-xl shadow-sm p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-primary/10 p-3 rounded-xl">
            <BookOpen className="text-primary" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bienvenid@ {(user?.user_metadata?.name || user?.name || 'Profesor').split(' ')[0]}</h1>
            <p className="text-muted-foreground mt-1">Revisa tus cursos y actividades académicas</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Accesos Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Button className="bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95" onClick={() => navigate('/teacher/courses/new')}>
              <PlusCircle size={18} className="mr-2" />
              Crear curso
            </Button>
            <Button variant="outline" className="transition-all hover:scale-105 active:scale-95" onClick={() => navigate('/teacher/courses')}>
              <BookOpen size={18} className="mr-2" />
              Ver todos los cursos
            </Button>
            <Button variant="outline" className="transition-all hover:scale-105 active:scale-95" onClick={() => navigate('/teacher/diagrams')}>
              <Network size={18} className="mr-2" />
              Diagramas
            </Button>
            <Button variant="outline" className="transition-all hover:scale-105 active:scale-95" onClick={() => navigate('/teacher/stats')}>
              <BarChart3 size={18} className="mr-2" />
              Estadísticas
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <BookOpen size={20} className="mr-2 text-primary" />
              Mis Cursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tienes cursos activos. ¡Crea uno nuevo!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                        <p className="text-sm text-gray-600">{course.students} estudiantes</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/teacher/courses/${course.id}`)}>
                        Ver curso
                      </Button>
                    </div>
                    {/* Pending tasks count is currently 0 from backend, we can hide it or calculate it if we fetch reviews differently */}
                    {/* <div className="mt-3 text-sm text-gray-600">Tareas pendientes: {course.pendingTasks}</div> */}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calendar size={20} className="mr-2 text-primary" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No hay eventos próximos.
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(event.start_date).toLocaleDateString()} • {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <ListChecks size={20} className="mr-2 text-primary" />
              Revisiones pendientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingReviews.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No hay revisiones pendientes.
              </div>
            ) : (
              pendingReviews.map((review) => (
                <div key={review.id} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{review.student?.name || 'Estudiante'}</p>
                    <p className="text-sm text-gray-600">{review.assignment?.title} • {review.assignment?.course?.name}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/teacher/courses/${review.assignment?.course_id}/assignments/${review.assignment_id}/submissions`)}>
                    Revisar
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
