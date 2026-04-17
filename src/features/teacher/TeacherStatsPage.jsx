import React, { useEffect, useState } from 'react'
import { BarChart3, CheckCircle, BookOpen, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import apiClient from '../../shared/api/client'
import Loading from '../../ui/loading'

export default function TeacherStatsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch dashboard stats which includes subjects and general stats
        const response = await apiClient.get('/statistics/dashboard')
        setStats(response.data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <Loading message="Cargando estadísticas..." />

  // Calculate teacher specific stats from the response
  // Assuming 'subjects' are the courses the teacher teaches
  const activeCourses = stats?.subjects?.length || 0
  const totalStudents = stats?.subjects?.reduce((acc, sub) => acc + (sub.studentCount || 0), 0) || 0 // Assuming subject has studentCount

  // For "Tasks reviewed", we might need a specific endpoint, but for now let's use completedTasks as a proxy or 0 if not available
  const tasksReviewed = stats?.completedTasks || 0

  const statCards = [
    { label: 'Cursos Activos', value: activeCourses, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tareas Revisadas', value: tasksReviewed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Promedio General', value: `${stats?.averageGrade || 0}/10`, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="bg-card rounded-xl shadow-sm p-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <BarChart3 className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estadísticas del profesor</h1>
          <p className="text-sm text-muted-foreground">Rendimiento de cursos y tareas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((s) => (
          <Card key={s.label} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional detailed stats could go here */}
    </div>
  )
}
