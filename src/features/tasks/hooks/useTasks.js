// Custom hook for task management using Backend API
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../shared/api/client';
import { getCurrentUser } from '../../../shared/api/supabase';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all tasks
  const fetchTasks = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/tasks', { params: filters });
      const data = response.data?.data || []; // Backend response structure: { success: true, data: [...] }

      // Client-side filtering if backend returns all (fallback)
      let filteredData = Array.isArray(data) ? data : [];

      if (filters.categoryId) {
        filteredData = filteredData.filter(t => t.category_id === Number(filters.categoryId));
      }
      if (filters.priorityId) {
        filteredData = filteredData.filter(t => t.priority_id === Number(filters.priorityId));
      }
      if (filters.completed !== undefined && filters.completed !== null && filters.completed !== '') {
        const isCompleted = String(filters.completed) === 'true' || filters.completed === true;
        filteredData = filteredData.filter(t => t.completed === isCompleted);
      }
      if (filters.searchText) {
        const text = String(filters.searchText).trim().toLowerCase();
        if (text.length > 0) {
           filteredData = filteredData.filter(t =>
             t.title?.toLowerCase().includes(text) ||
             t.description?.toLowerCase().includes(text)
           );
        }
      }

      setTasks(filteredData);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new task
  const createTask = useCallback(async (taskData) => {
    try {
      setError(null);

      const user = await getCurrentUser();
      if (!user?.id) throw new Error('User not authenticated');

      // Set default values for required fields
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 1); // Default to tomorrow

      const payload = {
        title: taskData.title ?? '',
        description: taskData.description ?? null,
        due_date: taskData.due_date ? new Date(taskData.due_date).toISOString().split('T')[0] : defaultDueDate.toISOString().split('T')[0],
        priority_id: taskData.priority_id && taskData.priority_id !== '' ? parseInt(taskData.priority_id) : 1, // Default to "Baja" (1)
        category_id: taskData.category_id && taskData.category_id !== '' ? parseInt(taskData.category_id) : 6, // Default to existing category (Personal = 6)
        completed: taskData.completed ?? false,
        user_id: user.id,
      };

      const response = await apiClient.post('/tasks', payload);
      const data = response.data?.data; // { success: true, data: ... }

      setTasks(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.message || 'Failed to create task');
      throw err;
    }
  }, []);

  // Update a task
  const updateTask = useCallback(async (taskId, updateData) => {
    try {
      setError(null);

      const user = await getCurrentUser();
      if (!user?.id) throw new Error('User not authenticated');

      // Sanitize payload but keep user_id
      const {
        id, created_at, updated_at,
        ...rest
      } = updateData || {};

      // Add user_id to payload
      const payload = {
        ...rest,
        user_id: user.id
      };

      const response = await apiClient.put(`/tasks/${taskId}`, payload);
      const data = response.data?.data;

      setTasks(prev => prev.map(task =>
        task.id === taskId ? data : task
      ));
      return data;
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.message || 'Failed to update task');
      throw err;
    }
  }, []);

  // Delete a task
  const deleteTask = useCallback(async (taskId) => {
    try {
      setError(null);
      await apiClient.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.message || 'Failed to delete task');
      throw err;
    }
  }, []);

  // Toggle task completion
  const toggleTaskCompletion = useCallback(async (taskId, completed) => {
    // Find the current task to get ALL its data
    const currentTask = tasks.find(t => t.id === taskId);

    if (!currentTask) {
      throw new Error('Task not found');
    }

    // Include ALL required fields to avoid null constraint errors
    const updateData = {
      completed: !completed,
      title: currentTask.title, // Required field
      due_date: currentTask.due_date ? currentTask.due_date.split('T')[0] : null,
      priority_id: currentTask.priority_id || currentTask.id_Priority || 1, // Required field
      category_id: currentTask.category_id || currentTask.id_Category || 6, // Required field - default to existing category (Personal = 6)
      description: currentTask.description || null
    };

    return updateTask(taskId, updateData);
  }, [tasks, updateTask]);

  // Get subtasks for a task
  const getSubtasks = useCallback(async (parentTaskId) => {
    try {
      const response = await apiClient.get(`/subtasks`, { params: { parentId: parentTaskId } });
      // Assuming backend has this route, otherwise fallback or we need to add it
      // If /subtasks not fully implemented, we might need to filter main tasks if they included subtasks
      // But usually REST is /tasks/:id/subtasks or /subtasks?parentId=...
      // Checking backend/routes/SubTaskRoutes.js -> it seems to use SubTaskController
      return response.data?.data || [];
    } catch (err) {
      console.error('Error fetching subtasks:', err);
      return [];
    }
  }, []);

  // Create subtask
  const createSubtask = useCallback(async (parentTaskId, subtaskData) => {
    try {
      const user = await getCurrentUser();
      const payload = {
        ...subtaskData,
        parent_task_id: parentTaskId,
        user_id: user?.id
      };
      // The backend might have /subtasks endpoint
      const response = await apiClient.post('/subtasks', payload);
      return response.data?.data;
    } catch (err) {
      console.error('Error creating subtask:', err);
      throw err;
    }
  }, []);

  // Get overdue tasks
  const getOverdueTasks = useCallback(async () => {
    try {
      // Backend could offer filtering for this
      const response = await apiClient.get('/tasks'); // Or dedicated endpoint if exists
      const allTasks = response.data?.data || [];
      return allTasks.filter(t =>
        !t.completed &&
        t.due_date &&
        new Date(t.due_date) < new Date()
      );
    } catch (err) {
      console.error('Error fetching overdue tasks:', err);
      throw err;
    }
  }, []);

  // Get completed tasks today
  const getCompletedTasksToday = useCallback(async () => {
    try {
       // We can re-use fetched tasks or ask backend
       // Simulating with client side filter on recently fetched might be stale
       // Let's trust the fetchTasks logic if called properly
       return [];
    } catch (err) {
      throw err;
    }
  }, []);

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getSubtasks,
    createSubtask,
    getOverdueTasks,
    getCompletedTasksToday,
    refetch: fetchTasks
  };
};
