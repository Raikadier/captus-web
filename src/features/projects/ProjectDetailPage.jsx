import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd' // We don't have this lib, so we'll use simple buttons for now
import { Plus, ArrowLeft, CheckCircle, Circle, Clock } from 'lucide-react'
import { Button } from '../../ui/button'
import apiClient from '../../shared/api/client'
import { toast } from 'sonner'
import Loading from '../../ui/loading'

// Simple Kanban Board without DnD lib (using state and buttons)
export default function ProjectDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [project, setProject] = useState(null)
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectRes, tasksRes] = await Promise.all([
                    apiClient.get(`/projects/${id}`),
                    apiClient.get(`/tasks?projectId=${id}`) // Assuming we updated backend to support this
                ])
                setProject(projectRes.data)
                setTasks(tasksRes.data)
            } catch (error) {
                console.error('Error fetching project details:', error)
                toast.error('Error al cargar el proyecto')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    const handleStatusChange = async (taskId, isCompleted) => {
        try {
            // Optimistic update
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: isCompleted } : t))

            if (isCompleted) {
                await apiClient.put(`/tasks/${taskId}/complete`)
            } else {
                // If we have an uncomplete endpoint, use it. Otherwise update.
                await apiClient.put(`/tasks/${taskId}`, { is_completed: false })
            }
        } catch (error) {
            toast.error('Error actualizando tarea')
            // Revert
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: !isCompleted } : t))
        }
    }

    if (loading) return <Loading message="Cargando proyecto..." />
    if (!project) return <div className="p-6">Proyecto no encontrado</div>

    const pendingTasks = tasks.filter(t => !t.is_completed)
    const completedTasks = tasks.filter(t => t.is_completed)

    return (
        <div className="p-6 h-screen flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                </div>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nueva Tarea
                </Button>
            </div>

            {/* Kanban Columns */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
                {/* Pending Column */}
                <div className="bg-gray-50/50 rounded-xl border border-gray-200 flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200 bg-white/50 rounded-t-xl flex items-center justify-between">
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                            <Circle className="w-4 h-4" /> Pendientes
                        </h3>
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                            {pendingTasks.length}
                        </span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto space-y-3">
                        {pendingTasks.map(task => (
                            <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(task.due_date).toLocaleDateString()}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleStatusChange(task.id, true)}
                                    >
                                        Completar
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {pendingTasks.length === 0 && (
                            <div className="text-center py-10 text-gray-400 text-sm">
                                No hay tareas pendientes
                            </div>
                        )}
                    </div>
                </div>

                {/* Completed Column */}
                <div className="bg-gray-50/50 rounded-xl border border-gray-200 flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200 bg-white/50 rounded-t-xl flex items-center justify-between">
                        <h3 className="font-semibold text-green-700 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Completadas
                        </h3>
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            {completedTasks.length}
                        </span>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto space-y-3">
                        {completedTasks.map(task => (
                            <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 opacity-75 hover:opacity-100 transition-all group">
                                <h4 className="font-medium text-gray-900 mb-1 line-through text-gray-500">{task.title}</h4>
                                <div className="flex items-center justify-end mt-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 text-xs text-gray-500 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleStatusChange(task.id, false)}
                                    >
                                        Reabrir
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {completedTasks.length === 0 && (
                            <div className="text-center py-10 text-gray-400 text-sm">
                                No hay tareas completadas
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
