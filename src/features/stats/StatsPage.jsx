import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, MessageSquare, TrendingUp, CheckSquare, Target, Award, Settings, PlusCircle, CheckCircle2, ListChecks } from 'lucide-react'
import { Button } from '../../ui/button'
import { Card } from '../../ui/card'
import apiClient from '../../shared/api/client'
import Loading from '../../ui/loading'
import { ManageSubjectsDialog } from '../subjects/components/ManageSubjectsDialog'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart } from 'recharts'
import StreakWidget, { FavoriteCategoryWidget, EventsOverviewWidget, ProjectsOverviewWidget, NotesStatsWidget, CategoriesStatsWidget, AverageTimeWidget, RecentAchievementsWidget, BestStreakWidget } from '../../shared/components/StreakWidget'
import { StatsProvider, useStreakData, useAdditionalStats } from '../../hooks/useConsolidatedStats'

function getCurrentDate() {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ]
  const now = new Date()
  return `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`
}

function StatCard({ icon, label, value, bgColor }) {
  return (
    <Card className="p-6 border border-border rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <div className={`${bgColor} p-4 rounded-xl`}>{icon}</div>
        <div>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </div>
      </div>
    </Card>
  )
}

function SubjectProgress({ subject }) {
  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-600',
      purple: 'bg-purple-600',
      green: 'bg-green-600',
      orange: 'bg-orange-600',
      red: 'bg-red-600',
      yellow: 'bg-yellow-600',
    }
    return colors[color] || 'bg-gray-600'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-medium text-foreground">{subject.name}</h3>
          {/* Display progress if available, or default text */}
          <p className="text-sm text-muted-foreground">{subject.progress ? `${subject.progress}% completado` : ''}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">{subject.grade}</p>
          <p className="text-sm text-muted-foreground">Promedio</p>
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all ${getColorClass(subject.color)}`}
          style={{ width: `${subject.progress || 0}%` }}
        />
      </div>
    </div>
  )
}


function StatsPageContent() {
  const { streakData } = useStreakData();
  const { additionalStats } = useAdditionalStats();

  const [stats, setStats] = useState({
    averageGrade: 0,
    completedTasks: 0,
    totalTasks: 0,
    studyHours: 0,
    racha: 0, // Backend uses 'racha' or 'streak'
    subjects: []
  });
  // New state for detailed task stats
  const [taskStats, setTaskStats] = useState({
    tasksCreatedToday: 0,
    tasksCompletedToday: 0,
    subTasksCompletedToday: 0,
    totalSubTasksCompleted: 0,
    productivityChart: [],
    totalCompleted: 0,
    weeklyCompletionRate: 0
  });

  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [generalResponse, taskResponse] = await Promise.all([
        apiClient.get('/statistics'),
        apiClient.get('/statistics/tasks')
      ]);

      const data = generalResponse.data?.data || generalResponse.data;
      const tData = taskResponse.data;

      if (data) {
        setStats({
          averageGrade: data.averageGrade || 0,
          completedTasks: data.completedTasks || 0,
          totalTasks: data.totalTasks || 0,
          studyHours: data.studyHours || 0,
          racha: data.racha || data.streak || 0,
          subjects: data.subjects || []
        });
      }

      if (tData) {
        setTaskStats({
          tasksCreatedToday: tData.tasksCreatedToday || 0,
          tasksCompletedToday: tData.tasksCompletedToday || 0,
          subTasksCompletedToday: tData.subTasksCompletedToday || 0,
          totalSubTasksCompleted: tData.totalSubTasksCompleted || 0,
          productivityChart: tData.productivityChart || [],
          totalCompleted: tData.totalCompleted || 0,
          weeklyCompletionRate: tData.weeklyCompletionRate || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const completionPercent = taskStats.weeklyCompletionRate;
  const totalCompleted = taskStats.totalCompleted || 0;
  const totalCreated = totalCompleted + (taskStats.tasksCreatedToday || 0);
  const pendingTasks = Math.max(0, totalCreated - totalCompleted);

  const expiredTasks = taskStats.productivityChart?.reduce((sum, day) => {
    return sum + Math.max(0, day.created - day.completed);
  }, 0) || 0;

  const priorityDistribution = additionalStats?.priorityStats ? [
    { name: 'Alta', value: additionalStats.priorityStats.high, color: '#ef4444' },
    { name: 'Media', value: additionalStats.priorityStats.medium, color: '#f59e0b' },
    { name: 'Baja', value: additionalStats.priorityStats.low, color: '#10b981' }
  ].filter(item => item.value > 0) : [];

  if (loading) {
    return <Loading message="Cargando estadísticas..." />;
  }

  const completionRateData = [
    { name: 'Completadas', value: totalCompleted, color: '#22c55e', percentage: totalCreated > 0 ? Math.round((totalCompleted / totalCreated) * 100) : 0 },
    { name: 'Pendientes', value: Math.max(0, pendingTasks - expiredTasks), color: '#f59e0b', percentage: totalCreated > 0 ? Math.round(((pendingTasks - expiredTasks) / totalCreated) * 100) : 0 },
    { name: 'Expiradas', value: expiredTasks, color: '#ef4444', percentage: totalCreated > 0 ? Math.round((expiredTasks / totalCreated) * 100) : 0 }
  ].filter(item => item.value > 0);


  // Weekly performance by day
  // const weeklyPerformanceData = taskStats.productivityChart?.map(day => ({
  //   day: day.day,
  //   created: day.created,
  //   completed: day.completed,
  //   completionRate: day.created > 0 ? Math.round((day.completed / day.created) * 100) : 0
  // })) || [];

  // Cumulative completion data for area chart
  // const cumulativeData = taskStats.productivityChart?.reduce((acc, day, index) => {
  //   const previousTotal = acc[index - 1]?.cumulativeCompleted || 0;
  //   const newTotal = previousTotal + day.completed;
  //   acc.push({
  //     day: day.day,
  //     dailyCompleted: day.completed,
  //     cumulativeCompleted: newTotal,
  //     created: day.created
  //   });
  //   return acc;
  // }, []) || [];

  const circumference = 2 * Math.PI * 88;
  const strokeDasharray = `${(completionPercent / 100) * circumference} ${circumference}`;

  if (loading) {
    return <Loading message="Cargando estadísticas..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <header className="sticky top-0 bg-card rounded-xl shadow-sm p-6 mb-6 z-10 border border-border">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">📊 Panel de Estadísticas</h1>
              <p className="text-muted-foreground mt-1">{getCurrentDate()}</p>
            </div>
            <ManageSubjectsDialog
              onUpdate={fetchStats}
              trigger={
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Gestionar Materias
                </Button>
              }
            />
          </div>
        </header>

        {/* Streak Widget - Main Feature */}
        <div className="mb-8">
          <StreakWidget />
        </div>

        {/* Favorite Category Widget */}
        <div className="mb-8">
          <FavoriteCategoryWidget />
        </div>

        {/* Daily Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard
            icon={<PlusCircle className="text-blue-600" size={24} />}
            label="Tareas Creadas Hoy"
            value={taskStats.tasksCreatedToday}
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={<CheckCircle2 className="text-green-600" size={24} />}
            label="Tareas Completadas Hoy"
            value={taskStats.tasksCompletedToday}
            bgColor="bg-green-50"
          />
          <StatCard
            icon={<ListChecks className="text-purple-600" size={24} />}
            label="Subtareas Completadas (Total)"
            value={streakData?.totalSubTasksCompleted || 0}
            bgColor="bg-purple-50"
          />
        </div>

        {/* Small Insight Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <EventsOverviewWidget />
          <ProjectsOverviewWidget />
          <NotesStatsWidget />
          <CategoriesStatsWidget />
        </div>

        {/* Additional Insight Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <AverageTimeWidget />
          <RecentAchievementsWidget />
          <BestStreakWidget />
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <StatCard
            icon={<TrendingUp className="text-green-600" size={28} />}
            label="Promedio General"
            value={stats.averageGrade.toFixed(2)}
            bgColor="bg-green-50"
          />
          <StatCard
            icon={<CheckSquare className="text-blue-600" size={28} />}
            label="Total Completadas"
            value={taskStats.totalCompleted}
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={<Target className="text-orange-600" size={28} />}
            label="Productividad Semanal"
            value={`${taskStats.weeklyCompletionRate}%`}
            bgColor="bg-orange-50"
          />
        </div>

        {/* Progress by Subject */}
        {stats.subjects && stats.subjects.length > 0 ? (
          <Card className="p-6 bg-card rounded-xl shadow-sm mb-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-6">Progreso por Materia</h2>
            <div className="space-y-6">
              {stats.subjects.map((subject) => (
                <SubjectProgress key={subject.id || subject.name} subject={subject} />
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-6 bg-card rounded-xl shadow-sm mb-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-2">Materias</h2>
            <p className="text-muted-foreground">No hay materias registradas aún. ¡Agrega algunas para ver tu progreso académico!</p>
          </Card>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Overall Completion Rate Pie Chart */}
          <Card className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado General de Tareas</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionRateData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ percentage }) => `${percentage}%`}
                  >
                    {completionRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value, name) => [`${value} tareas`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {completionRateData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Weekly Productivity Chart */}
          <Card className="p-6 bg-card rounded-xl shadow-sm border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Productividad Semanal</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskStats.productivityChart}>
                  <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                  <Bar dataKey="created" name="Creadas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completadas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Additional Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Completion Circle */}
          <Card className="p-6 bg-card rounded-xl shadow-sm border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">Tasa de Cumplimiento Semanal</h2>
            <div className="flex items-center justify-center h-64">
              <div className="relative w-48 h-48">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle cx="96" cy="96" r="88" stroke="#E5E7EB" strokeWidth="16" fill="none" className="opacity-30" />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#10b981"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-4xl font-bold text-foreground">{completionPercent}%</span>
                  <span className="text-sm text-muted-foreground">Esta Semana</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Priority Distribution */}
          <Card className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Distribución por Prioridad</h2>
            <div className="h-64 w-full">
              {priorityDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityDistribution}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      formatter={(value, name) => [`${value} tareas`, name]}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {priorityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p>No hay tareas con prioridad asignada</p>
                </div>
              )}
            </div>
            {priorityDistribution.length > 0 && (
              <div className="flex justify-center space-x-4 mt-4">
                {priorityDistribution.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Floating AI Chat Button */}
      <Link to="/chatbot" title="Hablar con Captus">
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
          size="icon"
        >
          <MessageSquare size={24} />
        </Button>
      </Link>
    </div>
  )
}

function MonthBar({ month, color, value, label }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{month}</span>
      <div className="flex items-center gap-2">
        <div className="w-32 bg-muted rounded-full h-2">
          <div className={`${color} h-2 rounded-full`} style={{ width: `${value}%` }} />
        </div>
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
    </div>
  )
}

// Main export with Provider wrapper
export default function StatsPage() {
  return (
    <StatsProvider>
      <StatsPageContent />
    </StatsProvider>
  );
}
