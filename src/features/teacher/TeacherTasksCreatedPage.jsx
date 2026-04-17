import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Edit2, Calendar, CheckCircle2 } from 'lucide-react'
import { Button } from '../../ui/button'
import apiClient from '../../shared/api/client'
import Loading from '../../ui/loading'

export default function TeacherTasksCreatedPage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Fetch tasks created by the current user (teacher)
        const response = await apiClient.get('/tasks')
        // Filter or sort if necessary, assuming /tasks returns all user's tasks
        setTasks(response.data.data || response.data)
      } catch (error) {
        console.error('Error fetching tasks:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  if (loading) return <Loading message="Cargando tareas..." />

  return (
    <div className="p-6 space-y-6">
      <div className="bg-card rounded-xl shadow-sm p-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <ClipboardList className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tareas creadas</h1>
          <p className="text-sm text-muted-foreground">Administra las tareas de tus cursos</p>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 && (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No has creado ninguna tarea aún.</p>
            <Button variant="link" onClick={() => navigate('/teacher/courses')}>Ir a mis cursos</Button>
          </div>
        )}
        {tasks.map((task) => (
          <div key={task.id || task.id_Task} className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.title}</h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                {task.Category && (
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{task.Category.name}</span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(task.due_date || task.endDate).toLocaleDateString()}
                </span>
                <span className={`flex items-center gap-1 ${task.state ? 'text-green-600' : 'text-orange-600'}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  {task.state ? 'Completada' : 'Pendiente'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(`/teacher/tasks/${task.id || task.id_Task}/edit`)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
