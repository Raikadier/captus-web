import { useState, useCallback } from 'react';
// import { useAuth } from './useAuth';
import apiClient from '../shared/api/client';

export function useCourseGroups() {
  // const { session } = useAuth(); // session not needed for client calls
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getGroups = useCallback(async (courseId) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/groups/course/${courseId}`);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createGroup = async (data) => {
    // data: { course_id, name, description }
    setLoading(true);
    try {
      const response = await apiClient.post('/groups', data);
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (groupId, studentId) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/groups/add-member', { groupId, studentId });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error adding member';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return { getGroups, createGroup, addMember, loading, error };
}
