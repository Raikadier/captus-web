import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import apiClient from '../shared/api/client';

export function useAssignments() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAssignments = useCallback(async (courseId) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/assignments/course/${courseId}`);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAssignment = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/assignments/${id}`);
      return response.data;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAssignment = async (data) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/assignments', data);
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const updateAssignment = async (id, data) => {
    setLoading(true);
    try {
      const response = await apiClient.put(`/assignments/${id}`, data);
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async (id) => {
    setLoading(true);
    try {
      await apiClient.delete(`/assignments/${id}`);
    } finally {
      setLoading(false);
    }
  };

  return { getAssignments, getAssignment, createAssignment, updateAssignment, deleteAssignment, loading, error };
}
