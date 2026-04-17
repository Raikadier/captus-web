import React, { useState } from 'react';
import { X, Plus, Edit, Trash2, CheckCircle, Circle } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import { Label } from '../../../ui/label';
import { Progress } from '../../../ui/progress';
import { useSubTasks } from '../../../hooks/useSubTasks';

const SubTasksModal = ({ task, isOpen, onClose }) => {
  const {
    subTasks,
    loading,
    progress,
    completedCount,
    totalCount,
    createSubTask,
    updateSubTask,
    deleteSubTask,
    toggleSubTask
  } = useSubTasks(task?.id);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSubTask, setEditingSubTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    endDate: '',
    id_Category: task?.category_id || '',
    id_Priority: task?.priority_id || ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      endDate: '',
      id_Category: task?.category_id || '',
      id_Priority: task?.priority_id || ''
    });
    setEditingSubTask(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const subTaskData = {
      ...formData,
      endDate: formData.endDate || null
    };

    let result;
    if (editingSubTask) {
      result = await updateSubTask(editingSubTask.id_SubTask, subTaskData);
    } else {
      result = await createSubTask(subTaskData);
    }

    if (result.success) {
      resetForm();
    } else {
      alert(result.error);
    }
  };

  const handleEdit = (subTask) => {
    setEditingSubTask(subTask);
    setFormData({
      title: subTask.title,
      description: subTask.description || '',
      endDate: subTask.endDate ? new Date(subTask.endDate).toISOString().split('T')[0] : '',
      id_Category: subTask.id_Category,
      id_Priority: subTask.id_Priority
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (subTaskId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta subtarea?')) {
      const result = await deleteSubTask(subTaskId);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const handleToggle = async (subTaskId) => {
    const subTask = subTasks.find(st => st.id_SubTask === subTaskId);
    if (!subTask) return;

    const result = await toggleSubTask(subTaskId);
    if (!result.success) {
      alert(result.error);
      return;
    }

    // Check if all subtasks are now completed
    const newCompletedCount = completedCount + (subTask.state ? -1 : 1);
    if (newCompletedCount === totalCount && totalCount > 0) {
      // Backend will automatically complete parent task
      // No need to refresh here as backend handles it
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-border">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Subtareas de: {task.title}</h2>
                <p className="text-sm text-muted-foreground">Gestiona las subtareas de esta tarea</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {/* Progress Overview */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progreso</span>
              <span className="text-sm text-muted-foreground">
                {completedCount} de {totalCount} completadas
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(progress)}% completado
            </p>
          </div>

          {/* Add SubTask Button */}
          {!task.completed && (
            <div className="mb-4">
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="w-full"
                variant="outline"
              >
                <Plus size={16} className="mr-2" />
                {showCreateForm ? 'Cancelar' : 'Agregar Subtarea'}
              </Button>
            </div>
          )}

          {/* Create/Edit Form */}
          {showCreateForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-4">
                <div>
                  <Label>Título *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título de la subtarea"
                    required
                  />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción opcional"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Fecha límite</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    max={task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : undefined}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    La fecha debe estar entre hoy y la fecha límite de la tarea padre
                    {task.endDate && ` (${new Date(task.endDate).toLocaleDateString('es-ES')})`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingSubTask ? 'Actualizar' : 'Crear'} Subtarea
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* SubTasks List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Cargando subtareas...</p>
              </div>
            ) : subTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay subtareas aún.</p>
                <p className="text-sm">Haz clic en "Agregar Subtarea" para crear la primera.</p>
              </div>
            ) : (
              subTasks.map((subTask) => (
                <div
                  key={subTask.id_SubTask}
                  className={`p-4 border rounded-lg transition-all ${subTask.state ? 'bg-green-50 border-green-200 dark:bg-green-900/20' :
                    (subTask.endDate && new Date(subTask.endDate) < new Date()) ? 'bg-red-50 border-red-200 dark:bg-red-900/20' : 'bg-card border-border'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        onClick={() => handleToggle(subTask.id_SubTask)}
                        className="mt-1 flex-shrink-0"
                        disabled={task.completed || (subTask.endDate && new Date(subTask.endDate) < new Date() && !subTask.state)} // No permitir cambios si la tarea padre está completada o si la subtarea está vencida
                        title={subTask.endDate && new Date(subTask.endDate) < new Date() && !subTask.state ? "Esta subtarea está vencida y no puede ser completada" : ""}
                      >
                        {subTask.state ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground hover:text-green-500" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium ${subTask.state ? 'line-through text-muted-foreground' : ''}`}>
                          {subTask.title}
                        </h4>
                        {subTask.description && (
                          <p className={`text-sm mt-1 ${subTask.state ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                            {subTask.description}
                          </p>
                        )}
                        {subTask.endDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            📅 {new Date(subTask.endDate).toLocaleDateString('es-ES')}
                          </p>
                        )}
                      </div>
                    </div>

                    {!task.completed && !subTask.state && (
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(subTask)}
                          className="text-primary hover:text-primary/80 text-sm"
                          title="Editar subtarea"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(subTask.id_SubTask)}
                          className="text-red-600 hover:text-red-900 text-sm"
                          title="Eliminar subtarea"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubTasksModal;
