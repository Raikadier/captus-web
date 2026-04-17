// TaskCard - Equivalent to individual task display in frmTask.cs
import React, { useState } from 'react';
import { CheckCircle, Circle, Calendar, Tag, AlertTriangle, ListChecks } from 'lucide-react';
import { Progress } from '../../../ui/progress';
import { useSubTasks } from '../../../hooks/useSubTasks';
import SubTasksModal from './SubTasksModal';

const TaskCard = ({
  task,
  categories = [],
  priorities = [],
  onToggleComplete,
  onEdit,
  // onDelete,
  showActions = true
}) => {
  const [showSubTasksModal, setShowSubTasksModal] = useState(false);
  const { progress, completedCount, totalCount } = useSubTasks(task.id);

  const category = categories.find(c => c.id === task.category_id);
  const priority = priorities.find(p => p.id === task.priority_id);

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;

  return (
    <div className={`bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${isOverdue ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-border'
      }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={() => onToggleComplete(task.id)}
            className="mt-1 flex-shrink-0"
            disabled={!showActions || isOverdue}
          >
            {task.completed ? (
              <CheckCircle className="h-5 w-5 text-primary" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <h3 className={`text-base font-medium truncate ${task.completed ? 'text-muted-foreground line-through' : 'text-card-foreground'
              }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                  <Tag size={12} className="mr-1" />
                  {category.name}
                </span>
              )}

              {task.due_date && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isOverdue
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                  }`}>
                  <Calendar size={12} className="mr-1" />
                  {new Date(task.due_date).toLocaleDateString()}
                </span>
              )}

              {priority && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priority.name === 'Alta' ? 'bg-red-100 text-red-800' :
                  priority.name === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-primary/10 text-primary'
                  }`}>
                  <AlertTriangle size={12} className="mr-1" />
                  {priority.name}
                </span>
              )}

              {/* Subtasks Indicator */}
              {totalCount > 0 && (
                <button
                  onClick={() => setShowSubTasksModal(true)}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  <ListChecks size={12} className="mr-1" />
                  {completedCount}/{totalCount}
                </button>
              )}
            </div>

            {/* Subtasks Progress Bar (only if there are subtasks) */}
            {totalCount > 0 && (
              <div className="mt-2 w-full max-w-[200px]">
                <Progress value={progress} className="h-1.5" />
              </div>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex items-center space-x-2 ml-4">
            {!task.completed && (
              <button
                onClick={() => onEdit(task)}
                className="text-primary hover:text-primary/80 text-sm font-medium"
              >
                Editar
              </button>
            )}
            {/* Delete button could go here if needed, but usually handled in parent or context menu */}
          </div>
        )}
      </div>

      <SubTasksModal
        task={task}
        isOpen={showSubTasksModal}
        onClose={() => setShowSubTasksModal(false)}
      />
    </div>
  );
};

export default TaskCard;
