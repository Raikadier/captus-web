import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskPage from './TaskPage';

const mockCreateTask = vi.fn();
const mockUpdateTask = vi.fn();
const mockDeleteTask = vi.fn();
const mockToggleTaskCompletion = vi.fn();
const mockRefetch = vi.fn();

const mockTasks = [
  {
    id: 1,
    title: 'Estudiar ingeniería de software',
    description: 'Repasar pruebas unitarias e integración',
    due_date: '2026-06-20',
    priority_id: 3,
    category_id: 6,
    completed: false,
  },
  {
    id: 2,
    title: 'Entregar informe CAPTUS',
    description: 'Subir documento final',
    due_date: '2026-06-25',
    priority_id: 2,
    category_id: 7,
    completed: true,
  },
];

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams('')],
}));

vi.mock('./hooks/useTasks', () => ({
  useTasks: () => ({
    tasks: mockTasks,
    loading: false,
    error: null,
    createTask: mockCreateTask,
    updateTask: mockUpdateTask,
    deleteTask: mockDeleteTask,
    toggleTaskCompletion: mockToggleTaskCompletion,
    refetch: mockRefetch,
  }),
}));

vi.mock('../../hooks/useReferenceData', () => ({
  useReferenceData: () => ({
    categories: [
      { id: 6, name: 'Personal' },
      { id: 7, name: 'Académica' },
    ],
    priorities: [
      { id: 1, name: 'Baja' },
      { id: 2, name: 'Media' },
      { id: 3, name: 'Alta' },
    ],
  }),
}));

vi.mock('../../services/taskService', () => ({
  taskService: {
    getTasksWithSubtasks: vi.fn().mockResolvedValue(new Set([1])),
  },
}));

vi.mock('../../shared/components/StreakWidget', () => ({
  MiniStreakWidget: () => <div>Mini Streak Widget</div>,
}));

vi.mock('../categories/CategoryManagement', () => ({
  default: () => <div>Category Management Mock</div>,
}));

vi.mock('../../shared/components/animations/MotionComponents', () => ({
  FadeIn: ({ children }) => <div>{children}</div>,
  StaggerContainer: ({ children }) => <div>{children}</div>,
  StaggerItem: ({ children }) => <div>{children}</div>,
}));

vi.mock('./components/TaskCard', () => ({
  default: ({ task, onEdit, onDelete, onToggleComplete }) => (
    <div data-testid={`task-card-${task.id}`}>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <button onClick={() => onEdit(task)}>Editar {task.id}</button>
      <button onClick={() => onDelete(task.id)}>Eliminar {task.id}</button>
      <button onClick={() => onToggleComplete()}>Completar {task.id}</button>
    </div>
  ),
}));

describe('TaskPage – Pruebas de Integración Gestión de Tareas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('INT01 – Integra useTasks y TaskCard mostrando las tareas cargadas', () => {
    render(<TaskPage />);

    expect(screen.getByText('Mis Tareas')).toBeInTheDocument();
    expect(screen.getByText('Estudiar ingeniería de software')).toBeInTheDocument();
    expect(screen.getByText('Entregar informe CAPTUS')).toBeInTheDocument();
    expect(screen.getByText('2 de 2 tareas')).toBeInTheDocument();
  });

  it('INT02 – Integra búsqueda y listado filtrando tareas por texto', () => {
    render(<TaskPage />);

    fireEvent.change(screen.getByPlaceholderText('Buscar tareas...'), {
      target: { value: 'CAPTUS' },
    });

    expect(screen.getByText('Entregar informe CAPTUS')).toBeInTheDocument();
    expect(screen.queryByText('Estudiar ingeniería de software')).not.toBeInTheDocument();
    expect(screen.getByText('1 de 2 tareas')).toBeInTheDocument();
  });

  it('INT03 – Integra TaskForm con createTask al crear nueva tarea', async () => {
    mockCreateTask.mockResolvedValue({ success: true });

    render(<TaskPage />);

    fireEvent.click(screen.getByRole('button', { name: /nueva tarea/i }));

    fireEvent.change(await screen.findByPlaceholderText('Ingresa el título de la tarea'), {
      target: { value: 'Nueva tarea integrada' },
    });

    fireEvent.change(screen.getByPlaceholderText('Describe la tarea (opcional)'), {
      target: { value: 'Descripción de integración' },
    });

    fireEvent.click(screen.getByRole('button', { name: /crear tarea/i }));

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Nueva tarea integrada',
          description: 'Descripción de integración',
          priority_id: 1,
          category_id: 6,
        })
      );
    });
  });

  it('INT04 – Integra TaskCard con updateTask al editar tarea existente', async () => {
    mockUpdateTask.mockResolvedValue({ success: true });

    render(<TaskPage />);

    fireEvent.click(screen.getByRole('button', { name: /editar 1/i }));

    fireEvent.change(await screen.findByPlaceholderText('Ingresa el título de la tarea'), {
      target: { value: 'Tarea editada desde integración' },
    });

    fireEvent.click(screen.getByRole('button', { name: /actualizar tarea/i }));

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          title: 'Tarea editada desde integración',
        })
      );
    });
  });

  it('INT05 – Integra TaskCard y diálogo de confirmación con deleteTask', async () => {
    mockDeleteTask.mockResolvedValue({ success: true });

    render(<TaskPage />);

    fireEvent.click(screen.getByRole('button', { name: /eliminar 1/i }));

    expect(await screen.findByText('Confirmar Eliminación')).toBeInTheDocument();
    expect(screen.getByText(/Estudiar ingeniería de software/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /eliminar tarea/i }));

    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith(1);
    });
  });

  it('INT06 – Integra TaskCard con toggleTaskCompletion', () => {
    render(<TaskPage />);

    fireEvent.click(screen.getByRole('button', { name: /completar 1/i }));

    expect(mockToggleTaskCompletion).toHaveBeenCalledWith(1, false);
  });
});