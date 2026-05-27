// useTasks — powered by TanStack Query for automatic caching & background refresh
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../shared/api/client';
import { getCurrentUser } from '../../../shared/api/supabase';
import type { Task, TaskFilter, SubTask } from '../../../types';

export const TASKS_QUERY_KEY = ['tasks'] as const;

// ─── Fetcher ────────────────────────────────────────────────────────────────
async function fetchAllTasks(): Promise<Task[]> {
  const response = await apiClient.get('/tasks');
  const data = response.data?.data;
  return Array.isArray(data) ? data : [];
}

// ─── Hook return type ────────────────────────────────────────────────────────
export interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (filters?: TaskFilter) => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<Task>;
  updateTask: (taskId: number, updateData: Partial<Task>) => Promise<Task>;
  deleteTask: (taskId: number) => Promise<void>;
  toggleTaskCompletion: (taskId: number, completed: boolean) => Promise<Task>;
  getSubtasks: (parentTaskId: number) => Promise<SubTask[]>;
  createSubtask: (parentTaskId: number, subtaskData: Partial<SubTask>) => Promise<SubTask>;
  getOverdueTasks: () => Promise<Task[]>;
  getCompletedTasksToday: () => Promise<Task[]>;
  refetch: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export const useTasks = (filters: TaskFilter = {}): UseTasksReturn => {
  const queryClient = useQueryClient();

  // ── Query ──────────────────────────────────────────────────────────────────
  const {
    data: rawTasks = [],
    isLoading: loading,
    error: queryError,
    refetch: refetchQuery,
  } = useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: fetchAllTasks,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  // Client-side filtering
  const tasks: Task[] = (() => {
    let result = rawTasks;
    if (filters.categoryId)
      result = result.filter(t => t.category_id === Number(filters.categoryId));
    if (filters.priorityId)
      result = result.filter(t => t.priority_id === Number(filters.priorityId));
    if (filters.completed !== undefined && filters.completed !== null && filters.completed !== '') {
      const isCompleted =
        String(filters.completed) === 'true' || filters.completed === true;
      result = result.filter(t => t.completed === isCompleted);
    }
    if (filters.searchText) {
      const text = String(filters.searchText).trim().toLowerCase();
      if (text.length > 0) {
        result = result.filter(
          t =>
            t.title?.toLowerCase().includes(text) ||
            t.description?.toLowerCase().includes(text)
        );
      }
    }
    return result;
  })();

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY }),
    [queryClient]
  );

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (taskData: Partial<Task>): Promise<Task> => {
      const user = await getCurrentUser();
      if (!user?.id) throw new Error('User not authenticated');

      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 1);

      const payload = {
        title: taskData.title ?? '',
        description: taskData.description ?? null,
        due_date: taskData.due_date
          ? new Date(taskData.due_date).toISOString().split('T')[0]
          : defaultDueDate.toISOString().split('T')[0],
        priority_id: taskData.priority_id != null ? Number(taskData.priority_id) : 1,
        category_id: taskData.category_id != null ? Number(taskData.category_id) : 6,
        completed: taskData.completed ?? false,
        user_id: user.id,
      };

      const response = await apiClient.post('/tasks', payload);
      return response.data?.data as Task;
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      taskId,
      updateData,
    }: {
      taskId: number;
      updateData: Partial<Task>;
    }): Promise<Task> => {
      const user = await getCurrentUser();
      if (!user?.id) throw new Error('User not authenticated');

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = updateData;
      const response = await apiClient.put(`/tasks/${taskId}`, {
        ...rest,
        user_id: user.id,
      });
      return response.data?.data as Task;
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (taskId: number): Promise<void> => {
      await apiClient.delete(`/tasks/${taskId}`);
    },
    onSuccess: invalidate,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({
      taskId,
      completed,
    }: {
      taskId: number;
      completed: boolean;
    }): Promise<Task> => {
      const cached = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY) ?? [];
      const currentTask = cached.find(t => t.id === taskId);
      if (!currentTask) throw new Error('Task not found');

      const user = await getCurrentUser();
      if (!user?.id) throw new Error('User not authenticated');

      const payload = {
        completed: !completed,
        title: currentTask.title,
        due_date: currentTask.due_date ? currentTask.due_date.split('T')[0] : null,
        priority_id: currentTask.priority_id ?? 1,
        category_id: currentTask.category_id ?? 6,
        description: currentTask.description ?? null,
        user_id: user.id,
      };
      const response = await apiClient.put(`/tasks/${taskId}`, payload);
      return response.data?.data as Task;
    },
    onSuccess: invalidate,
  });

  // ── Compat wrappers ────────────────────────────────────────────────────────
  const createTask = useCallback(
    (taskData: Partial<Task>) => createMutation.mutateAsync(taskData),
    [createMutation]
  );

  const updateTask = useCallback(
    (taskId: number, updateData: Partial<Task>) =>
      updateMutation.mutateAsync({ taskId, updateData }),
    [updateMutation]
  );

  const deleteTask = useCallback(
    (taskId: number) => deleteMutation.mutateAsync(taskId),
    [deleteMutation]
  );

  const toggleTaskCompletion = useCallback(
    (taskId: number, completed: boolean) =>
      toggleMutation.mutateAsync({ taskId, completed }),
    [toggleMutation]
  );

  const getSubtasks = useCallback(async (parentTaskId: number): Promise<SubTask[]> => {
    try {
      const response = await apiClient.get('/subtasks', {
        params: { parentId: parentTaskId },
      });
      return (response.data?.data as SubTask[]) ?? [];
    } catch {
      return [];
    }
  }, []);

  const createSubtask = useCallback(
    async (parentTaskId: number, subtaskData: Partial<SubTask>): Promise<SubTask> => {
      const user = await getCurrentUser();
      const response = await apiClient.post('/subtasks', {
        ...subtaskData,
        parent_task_id: parentTaskId,
        user_id: user?.id,
      });
      return response.data?.data as SubTask;
    },
    []
  );

  const getOverdueTasks = useCallback(async (): Promise<Task[]> => {
    const cached = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY) ?? [];
    return cached.filter(
      t => !t.completed && t.due_date && new Date(t.due_date) < new Date()
    );
  }, [queryClient]);

  const getCompletedTasksToday = useCallback(async (): Promise<Task[]> => [], []);

  const fetchTasks = useCallback(
    async (_filters?: TaskFilter) => {
      void _filters;
      await refetchQuery();
    },
    [refetchQuery]
  );

  const refetch = useCallback(() => { void refetchQuery(); }, [refetchQuery]);

  return {
    tasks,
    loading,
    error: (queryError as Error | null)?.message ?? null,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getSubtasks,
    createSubtask,
    getOverdueTasks,
    getCompletedTasksToday,
    refetch,
  };
};
