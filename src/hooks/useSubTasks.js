import { useState, useEffect } from 'react';
import apiClient from '../shared/api/client';

export const useSubTasks = (taskId) => {
  const [subTasks, setSubTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubTasks = async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      const response = await apiClient.get(`/subtasks/task/${taskId}`);
      if (response.data.success) {
        setSubTasks(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Error al cargar subtareas');
      console.error('Error fetching subtasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSubTask = async (subTaskData) => {
    try {
      const response = await apiClient.post('/subtasks', {
        ...subTaskData,
        id_Task: taskId
      });
      if (response.data.success) {
        setSubTasks(prev => [...prev, response.data.data]);
        return { success: true };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (err) {
      console.error('Error creating subtask:', err);
      return { success: false, error: 'Error al crear subtarea' };
    }
  };

  const updateSubTask = async (subTaskId, updates) => {
    try {
      // Ensure id_Task is included for validation
      const updateData = {
        ...updates,
        id_Task: taskId
      };
      const response = await apiClient.put(`/subtasks/${subTaskId}`, updateData);
      if (response.data.success) {
        setSubTasks(prev => prev.map(st =>
          st.id_SubTask === subTaskId ? response.data.data : st
        ));
        return { success: true };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (err) {
      console.error('Error updating subtask:', err);
      return { success: false, error: 'Error al actualizar subtarea' };
    }
  };

  const deleteSubTask = async (subTaskId) => {
    try {
      const response = await apiClient.delete(`/subtasks/${subTaskId}`);
      if (response.data.success) {
        setSubTasks(prev => prev.filter(st => st.id_SubTask !== subTaskId));
        return { success: true };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (err) {
      console.error('Error deleting subtask:', err);
      return { success: false, error: 'Error al eliminar subtarea' };
    }
  };

  const toggleSubTask = async (subTaskId) => {
    const subTask = subTasks.find(st => st.id_SubTask === subTaskId);
    if (!subTask) return { success: false, error: 'Subtarea no encontrada' };

    // Send all required fields for validation
    return updateSubTask(subTaskId, {
      title: subTask.title,
      description: subTask.description,
      endDate: subTask.endDate,
      id_Category: subTask.id_Category,
      id_Priority: subTask.id_Priority,
      state: !subTask.state
    });
  };

  useEffect(() => {
    fetchSubTasks();
  }, [taskId]);

  // Calcular progreso
  const completedCount = subTasks.filter(st => st.state).length;
  const totalCount = subTasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return {
    subTasks,
    loading,
    error,
    progress,
    completedCount,
    totalCount,
    createSubTask,
    updateSubTask,
    deleteSubTask,
    toggleSubTask,
    refreshSubTasks: fetchSubTasks
  };
};