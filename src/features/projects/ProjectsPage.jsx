import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Folder, Plus, Calendar, Users, MoreVertical, Trash2 } from 'lucide-react'
import { Button } from '../../ui/button'
import { useProjects } from '../../hooks/useProjects'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { toast } from 'sonner'
import Loading from '../../ui/loading'

export default function ProjectsPage() {
    const navigate = useNavigate()
    const { projects, loading, createProject, deleteProject } = useProjects()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', description: '' })

    const handleCreate = async () => {
        try {
            await createProject(formData);
            toast.success('Proyecto creado');
            setIsCreateOpen(false);
            setFormData({ name: '', description: '' });
        } catch (error) {
            toast.error(error.message);
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
            try {
                await deleteProject(id);
                toast.success('Proyecto eliminado');
            } catch (error) {
                toast.error(error.message);
            }
        }
    }

    if (loading) return <Loading message="Cargando proyectos..." />

    return (
        <div className="p-6 space-y-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-card rounded-xl shadow-sm p-6 border border-border mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Folder className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">Proyectos</h1>
                                <p className="text-sm text-muted-foreground">Gestiona tus proyectos y colaboraciones</p>
                            </div>
                        </div>

                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    Nuevo Proyecto
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nombre del Proyecto</label>
                                        <Input
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ej: Desarrollo Web"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Descripción</label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Descripción del proyecto..."
                                        />
                                    </div>
                                    <Button onClick={handleCreate} className="w-full">Crear Proyecto</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.length === 0 && (
                        <div className="col-span-3 text-center py-10 text-muted-foreground">
                            No tienes proyectos aún. ¡Crea uno nuevo!
                        </div>
                    )}
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-all cursor-pointer group"
                            onClick={() => navigate(`/projects/${project.id}`)}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Folder className="w-5 h-5" />
                                    </div>
                                    {project.role === 'owner' && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-1 hover:bg-muted rounded-md opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="text-destructive" onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(project.id);
                                                }}>
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>

                                <h3 className="text-lg font-semibold text-foreground mb-2">{project.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    {project.description || 'Sin descripción'}
                                </p>

                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        <span>{project.role === 'owner' ? 'Propietario' : 'Miembro'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
