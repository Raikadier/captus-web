// useTasks — powered by TanStack Query for automatic caching & background refresh
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../shared/api/client';
import { getCurrentUser } from '../../../shared/api/supabase';

export const TASKS_QUERY_KEY = ['tasks'];

// ─── Fetcher ────────────────────────────────────────────────────────────────
async function fetchAllTasks() {
  const response = await apiClient.get('/tasks');
  const data = response.data?.data;
  return Array.isArray(data) ? data : [];
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export const useTasks = (filters = {}) => {
  const queryClient = useQueryClient();

  // ── Query ──────────────────────────────────────────────────────────────────
  const {
    data: rawTasks = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: fetchAllTasks,
    staleTime: 60_000,       // consider data fresh for 1 min
    gcTime: 5 * 60_000,      // keep in cache for 5 min after unmount
  });

  // Client-side filtering (backend returns all; filters are a local concern)
  const tasks = (() => {
    let result = rawTasks;
    if (filters.categoryId) result = result.filter(t => t.category_id === Number(filters.categoryId));
    if (filters.priorityId) result = result.filter(t => t.priority_id === Number(filters.priorityId));
    if (filters.completed !== undefined && filters.completed !== null && filters.completed !== '') {
      const isCompleted = String(filters.completed) === 'true' || filters.completed === true;
      result = result.filter(t => t.completed === isCompleted);
    }
    if (filters.searchText) {
      const text = String(filters.searchText).trim().toLowerCase();
      if (text.length > 0) {
        result = result.filter(t =>
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
    mutationFn: async (taskData) => {
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
        priority_id: taskData.priority_id && taskData.priority_id !== '' ? parseInt(taskData.priority_id) : 1,
        category_id: taskData.category_id && taskData.category_id !== '' ? parseInt(taskData.category_id) : 6,
        completed: taskData.completed ?? false,
        user_id: user.id,
      };

      const response = await apiClient.post('/tasks', payload);
      return response.data?.data;
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ taskId, updateData }) => {
      const user = await getCurrentUser();
      if (!user?.id) throw new Error('User not authenticated');

      const { id, created_at, updated_at, ...rest } = updateData || {};
      const response = await apiClient.put(`/tasks/${taskId}`, { ...rest, user_id: user.id });
      return response.data?.data;
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (taskId) => {
      await apiClient.delete(`/tasks/${taskId}`);
      return taskId;
    },
    onSuccess: invalidate,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ taskId, completed }) => {
      const cached = queryClient.getQueryData(TASKS_QUERY_KEY) || [];
      const currentTask = cached.find(t => t.id === taskId);
      if (!currentTask) throw new Error('Task not found');

      const user = await getCurrentUser();
      if (!user?.id) throw new Error('User not authenticated');

      const payload = {
        completed: !completed,
        title: currentTask.title,
        due_date: currentTask.due_date ? currentTask.due_date.split('T')[0] : null,
        priority_id: currentTask.priority_id || 1,
        category_id: currentTask.category_id || 6,
        description: currentTask.description || null,
        user_id: user.id,
      };
      const response = await apiClient.put(`/tasks/${taskId}`, payload);
      return response.data?.data;
    },
    onSuccess: invalidate,
  });

  // ── Compat wrappers (same signatures as before) ────────────────────────────
  const createTask = useCallback(
    (taskData) => createMutation.mutateAsync(taskData),
    [createMutation]
  );

  const updateTask = useCallback(
    (taskId, updateData) => updateMutation.mutateAsync({ taskId, updateData }),
    [updateMutation]
  );

  const deleteTask = useCallback(
    (taskId) => deleteMutation.mutateAsync(taskId),
    [deleteMutation]
  );

  const toggleTaskCompletion = useCallback(
    (taskId, completed) => toggleMutation.mutateAsync({ taskId, completed }),
    [toggleMutation]
  );

  const getSubtasks = useCallback(async (parentTaskId) => {
    try {
      const response = await apiClient.get('/subtasks', { params: { parentId: parentTaskId } });
      return response.data?.data || [];
    } catch {
      return [];
    }
  }, []);

  const createSubtask = useCallback(async (parentTaskId, subtaskData) => {
    const user = await getCurrentUser();
    const response = await apiClient.post('/subtasks', {
      ...subtaskData,
      parent_task_id: parentTaskId,
      user_id: user?.id,
    });
    return response.data?.data;
  }, []);

  const getOverdueTasks = useCallback(async () => {
    const cached = queryClient.getQueryData(TASKS_QUERY_KEY) || [];
    return cached.filter(t => !t.completed && t.due_date && new Date(t.due_date) < new Date());
  }, [queryClient]);

  const getCompletedTasksToday = useCallback(async () => [], []);

  const fetchTasks = useCallback(
    (filters_) => {
      void filters_; // filters handled client-side via hook argument
      return refetch();
    },
    [refetch]
  );

  return {
    tasks,
    loading,
    error: queryError?.message || null,
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
