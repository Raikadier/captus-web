import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import apiClient from '../shared/api/client';

export function useEnrollments() {
  // const { session } = useAuth(); // Unused
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const joinByCode = useCallback(async (code) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/enrollments/join-by-code', { code });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error al unirse al curso';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getStudents = useCallback(async (courseId) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/enrollments/course/${courseId}/students`);
      return response.data;
    } finally {
      setLoading(false);
    }
  }, []);

  const addStudentManually = useCallback(async (courseId, email) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/enrollments/add-student', { courseId, email });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error agregando estudiante';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { joinByCode, getStudents, addStudentManually, loading, error };
}
