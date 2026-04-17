// TaskListView - Equivalent to the task list display in frmMain.cs
// Shows tasks grouped by date with the same visual style
import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Check, Calendar, List } from 'lucide-react';
import Loading from '../../../ui/loading';
import AddTaskForm from './AddTaskForm';

const TaskListView = () => {
  const { tasks, loading, error, toggleTaskStatus, refreshTasks } = useTasks();
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  // Group tasks by date (equivalent to MostrarTareasAgrupadas)
  const groupTasksByDate = (tasks) => {
    const grouped = {};
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    tasks.forEach(task => {
      const taskDate = new Date(task.due_date);
      let groupKey;

      if (taskDate.toDateString() === today.toDateString()) {
        groupKey = 'Hoy';
      } else if (taskDate.toDateString() === tomorrow.toDateString()) {
        groupKey = 'Mañana';
      } else if (taskDate < today) {
        groupKey = 'Tareas Pasadas';
      } else {
        groupKey = taskDate.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(task);
    });

    return grouped;
  };

  const groupedTasks = groupTasksByDate(tasks.filter(task => !task.completed));

  // Priority color mapping (equivalent to ObtenerColorPrioridad)
  const getPriorityColor = (priorityName) => {
    switch (priorityName?.toLowerCase()) {
      case 'alta': return 'border-red-500';
      case 'media': return 'border-orange-500';
      case 'baja': return 'border-primary';
      default: return 'border-gray-500';
    }
  };

  const handleTaskComplete = async (taskId) => {
    try {
      await toggleTaskStatus(taskId);
      await refreshTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskAdded = async () => {
    await refreshTasks();
  };

  if (loading) {
    return <Loading message="Cargando tareas..." fullScreen={false} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
    <div className="min-h-screen bg-background p-6">
      {/* Header with view toggle */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-card p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Mis Tareas</h1>

          <div className="flex items-center space-x-4">
            {/* View toggle buttons */}
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md transition-colors ${viewMode === 'list'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <List size={18} className="inline mr-2" />
                Lista
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md transition-colors ${viewMode === 'calendar'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <Calendar size={18} className="inline mr-2" />
                Calendario
              </button>
            </div>

            {/* Add task button */}
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center"
            >
              <Check size={18} className="mr-2" />
              Agregar Tarea
            </button>
          </div>
        </div>
      </div>

      {/* Task list content */}
      <div className="max-w-4xl mx-auto">
        {Object.keys(groupedTasks).length === 0 ? (
          <div className="bg-card rounded-lg shadow-sm p-8 text-center">
            <div className="text-muted-foreground text-lg mb-4">No hay tareas pendientes</div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Crear tu primera tarea
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTasks).map(([dateGroup, tasksInGroup]) => (
              <div key={dateGroup} className="bg-card rounded-lg shadow-sm overflow-hidden">
                {/* Date header */}
                <div className="bg-primary/10 px-6 py-3 border-b">
                  <h2 className="text-lg font-bold text-primary">{dateGroup}</h2>
                </div>

                {/* Tasks in this group */}
                <div className="divide-y divide-border">
                  {tasksInGroup.map(task => (
                    <div
                      key={task.id}
                      className={`p-4 hover:bg-muted transition-colors cursor-pointer border-l-4 ${getPriorityColor(task.priority?.name)}`}
                      onClick={() => handleTaskComplete(task.id)}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Checkbox */}
                        <div className="flex-shrink-0 mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTaskComplete(task.id);
                            }}
                            className="w-6 h-6 border-2 border-primary rounded flex items-center justify-center hover:bg-primary/10 transition-colors"
                            className="w-6 h-6 border-2 border-primary rounded flex items-center justify-center hover:bg-primary/10 transition-colors"
                          >
                            {task.completed && <Check size={16} className="text-primary" />}
                            {task.completed && <Check size={16} className="text-primary" />}
                          </button>
                        </div>

                        {/* Task content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-foreground mb-1">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                              {task.description.length > 100
                                ? task.description.substring(0, 100) + '...'
                                : task.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {new Date(task.due_date).toLocaleDateString('es-ES')}
                            </span>
                            {task.category && (
                              <span className="bg-muted px-2 py-1 rounded text-xs">
                                {task.category.name}
                              </span>
                            )}
                            {task.priority && (
                              <span className={`px-2 py-1 rounded text-xs text-white ${task.priority.name === 'Alta' ? 'bg-red-500' :
                                task.priority.name === 'Media' ? 'bg-orange-500' : 'bg-primary'
                                }`}>
                                {task.priority.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddForm && (
        <AddTaskForm
          onClose={() => setShowAddForm(false)}
          onTaskAdded={handleTaskAdded}
        />
      )}
    </div>
  );
};

export default TaskListView;
