// TaskPage - Diseño como la plantilla con mejor UI
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Filter, Search as SearchIcon, Bell, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useTasks } from './hooks/useTasks';
import { useReferenceData } from '../../hooks/useReferenceData';
import { taskService } from '../../services/taskService';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import { MiniStreakWidget } from '../../shared/components/StreakWidget';
import CategoryManagement from '../categories/CategoryManagement';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/dialog';
import Loading from '../../ui/loading';
import './TaskTabs.css';
import { FadeIn, StaggerContainer, StaggerItem } from '../../shared/components/animations/MotionComponents';

const TaskPage = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'categories' ? 'categories' : 'tasks';

  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    refetch
  } = useTasks();

  const { categories, priorities } = useReferenceData();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    searchText: '',
    categoryId: '',
    priorityId: '',
    completed: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    task: null
  });
  const [tasksWithSubTasks, setTasksWithSubTasks] = useState(new Set());

  const checkTasksWithSubTasks = useCallback(async () => {
    if (tasks.length === 0) return;

    try {
      const taskIds = await taskService.getTasksWithSubtasks();
      setTasksWithSubTasks(taskIds);
    } catch (error) {
      console.error('Error checking tasks with subtasks:', error);
      setTasksWithSubTasks(new Set());
    }
  }, [tasks]);

  useEffect(() => {
    checkTasksWithSubTasks();
  }, [checkTasksWithSubTasks]);

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData);
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      await updateTask(editingTask.id, taskData);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setDeleteDialog({
      isOpen: true,
      task: task
    });
  };

  const confirmDeleteTask = async () => {
    if (deleteDialog.task) {
      try {
        await deleteTask(deleteDialog.task.id);
        setDeleteDialog({ isOpen: false, task: null });
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const cancelDeleteTask = () => {
    setDeleteDialog({ isOpen: false, task: null });
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  const handleCancelForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchText: '',
      categoryId: '',
      priorityId: '',
      completed: ''
    });
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.searchText && !task.title.toLowerCase().includes(filters.searchText.toLowerCase()) &&
      !task.description?.toLowerCase().includes(filters.searchText.toLowerCase())) {
      return false;
    }
    if (filters.categoryId && task.category_id !== parseInt(filters.categoryId)) {
      return false;
    }
    if (filters.priorityId && task.priority_id !== parseInt(filters.priorityId)) {
      return false;
    }
    if (filters.completed !== '') {
      if (filters.completed === 'overdue') {
        // Mostrar solo tareas vencidas (no completadas y con fecha límite pasada)
        const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;
        if (!isOverdue) return false;
      } else {
        // Filtro normal de completadas/pendientes
        const isCompleted = filters.completed === 'true';
        if (task.completed !== isCompleted) return false;
      }
    }
    return true;
  });

  if (tasksLoading && tasks.length === 0) {
    return <Loading message="Cargando tareas..." />;
  }

  return (
    <div className="p-8 bg-background">
      {/* Header */}
      <FadeIn duration={0.6} className="sticky top-0 bg-card rounded-xl shadow-sm p-6 mb-6 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {activeTab === 'tasks' ? 'Mis Tareas' : 'Categorías'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {activeTab === 'tasks'
                ? 'Gestiona tus tareas y mantén tu racha de productividad'
                : 'Organiza tus tareas con categorías personalizadas'
              }
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Show Streak Widget and Task Controls only in tasks tab */}
      {activeTab === 'tasks' && (
        <>
          {/* Mini Streak Widget */}
          <FadeIn delay={0.1} className="mb-6">
            <MiniStreakWidget />
          </FadeIn>

          {/* Actions Bar */}
          <FadeIn delay={0.2} className="mb-6">
            <Card className="p-6 bg-card rounded-xl shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Button onClick={() => setShowTaskForm(true)} className="bg-primary hover:bg-primary/90">
                    <Plus size={18} className="mr-2" />
                    Nueva Tarea
                  </Button>
                  <Button
                    variant="outline"
                    className="border-input bg-background"
                    onClick={() => setShowFilters((v) => !v)}
                    title="Filtros"
                  >
                    <Filter size={18} className="mr-2 text-muted-foreground" />
                    Filtros
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {filteredTasks.length} de {tasks.length} tareas
                </div>
              </div>

              {/* Search */}
              <div className="mt-4">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    placeholder="Buscar tareas..."
                    value={filters.searchText}
                    onChange={(e) => handleFilterChange('searchText', e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Categoría
                      </label>
                      <select
                        value={filters.categoryId}
                        onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
                      >
                        <option value="">Todas las categorías</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Prioridad
                      </label>
                      <select
                        value={filters.priorityId}
                        onChange={(e) => handleFilterChange('priorityId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
                      >
                        <option value="">Todas las prioridades</option>
                        {priorities.map((priority) => (
                          <option key={priority.id} value={priority.id}>
                            {priority.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Estado
                      </label>
                      <select
                        value={filters.completed}
                        onChange={(e) => handleFilterChange('completed', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
                      >
                        <option value="">Todos</option>
                        <option value="false">Pendientes</option>
                        <option value="true">Completadas</option>
                        <option value="overdue">Expiradas</option>
                      </select>
                    </div>

                    <div className="flex md:items-end">
                      <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                        Limpiar filtros
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </FadeIn>
        </>
      )
      }

      {/* Task Form Dialog */}
      <Dialog open={activeTab === 'tasks' && (showTaskForm || !!editingTask)} onOpenChange={(open) => !open && handleCancelForm()}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                {editingTask ? <Edit className="w-6 h-6 text-primary" /> : <Plus className="w-6 h-6 text-primary" />}
              </div>
              <div className="text-left">
                <DialogTitle className="text-xl font-bold text-foreground">
                  {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {editingTask ? 'Modifica los detalles de tu tarea' : 'Crea una nueva tarea para organizar tu día'}
                </p>
              </div>
            </div>
          </DialogHeader>
          <TaskForm
            task={editingTask}
            categories={categories}
            priorities={priorities}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={handleCancelForm}
            isModal={true}
          />
        </DialogContent>
      </Dialog>

      {/* Error Message */}
      {
        tasksError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">{tasksError}</div>
          </div>
        )
      }

      {/* Main Tabs */}
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="task-main-tabs bg-card mb-6 rounded-xl p-1 shadow-sm">
          <TabsTrigger
            value="tasks"
            className="tab-trigger px-6 py-2.5 rounded-lg font-medium data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            <span className="tab-icon">📝</span> Mis Tareas
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="tab-trigger px-6 py-2.5 rounded-lg font-medium data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            <span className="tab-icon">🏷️</span> Categorías
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="tab-content space-y-6">
          {/* Sub-tabs for task status */}
          <Tabs defaultValue="todas" className="w-full">
            <TabsList className="task-sub-tabs bg-muted mb-4 rounded-lg p-1">
              <TabsTrigger
                value="todas"
                className="tab-trigger px-4 py-2 rounded-md text-sm font-medium"
              >
                <span className="tab-icon">📋</span> Todas
              </TabsTrigger>
              <TabsTrigger
                value="pendiente"
                className="tab-trigger px-4 py-2 rounded-md text-sm font-medium"
              >
                <span className="tab-icon">⏳</span> Pendientes
              </TabsTrigger>
              <TabsTrigger
                value="con-subtareas"
                className="tab-trigger px-4 py-2 rounded-md text-sm font-medium"
              >
                <span className="tab-icon">📋</span> Con Subtareas
              </TabsTrigger>
              <TabsTrigger
                value="completada"
                className="tab-trigger px-4 py-2 rounded-md text-sm font-medium"
              >
                <span className="tab-icon">✅</span> Completadas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="todas">
              <StaggerContainer className="space-y-4">
                {filteredTasks.length === 0 ? (
                  <Card className="p-12 text-center bg-card rounded-xl shadow-sm">
                    <div className="text-muted-foreground text-lg mb-2">
                      {tasks.length === 0 ? 'No tienes tareas aún' : 'No se encontraron tareas con los filtros aplicados'}
                    </div>
                    <p className="text-muted-foreground">
                      {tasks.length === 0 ? 'Crea tu primera tarea para comenzar' : 'Prueba cambiando los filtros'}
                    </p>
                  </Card>
                ) : (
                  filteredTasks.map((task) => (
                    <StaggerItem key={task.id}>
                      <TaskCard
                        task={task}
                        categories={categories}
                        priorities={priorities}
                        onToggleComplete={(taskId) => toggleTaskCompletion(taskId)}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                      />
                    </StaggerItem>
                  ))
                )}
              </StaggerContainer>
            </TabsContent>

            <TabsContent value="pendiente">
              <StaggerContainer className="space-y-4">
                {filteredTasks
                  .filter((t) => t.completed === false)
                  .map((task) => (
                    <StaggerItem key={task.id}>
                      <TaskCard
                        task={task}
                        categories={categories}
                        priorities={priorities}
                        onToggleComplete={(taskId) => toggleTaskCompletion(taskId)}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onRefreshTasks={refetch}
                      />
                    </StaggerItem>
                  ))}
              </StaggerContainer>
            </TabsContent>

            <TabsContent value="con-subtareas">
              <StaggerContainer className="space-y-4">
                {filteredTasks
                  .filter((task) => {
                    // Mostrar solo tareas no completadas que tienen subtareas
                    return !task.completed && tasksWithSubTasks.has(task.id);
                  })
                  .map((task) => (
                    <StaggerItem key={task.id}>
                      <TaskCard
                        task={task}
                        categories={categories}
                        priorities={priorities}
                        onToggleComplete={(taskId) => toggleTaskCompletion(taskId)}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                      />
                    </StaggerItem>
                  ))}
              </StaggerContainer>
            </TabsContent>

            <TabsContent value="completada">
              <StaggerContainer className="space-y-4">
                {filteredTasks
                  .filter((t) => t.completed === true)
                  .map((task) => (
                    <StaggerItem key={task.id}>
                      <TaskCard
                        task={task}
                        categories={categories}
                        priorities={priorities}
                        onToggleComplete={(taskId) => toggleTaskCompletion(taskId)}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                      />
                    </StaggerItem>
                  ))}
              </StaggerContainer>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="tab-content">
          <CategoryManagement />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && cancelDeleteTask()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription className="text-left">
              ¿Estás seguro de que quieres eliminar la tarea <strong>"{deleteDialog.task?.title}"</strong>?
              <br /><br />
              <span className="text-red-600 font-medium">
                ⚠️ Esta acción no se puede deshacer y la tarea será removida permanentemente de tu lista.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDeleteTask}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTask}>
              Eliminar Tarea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default TaskPage;
