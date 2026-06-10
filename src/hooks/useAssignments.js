import { useState, useCallback } from 'react';
import apiClient from '../shared/api/client';
import { unwrapData, unwrapList } from '../shared/api/unwrap';

export function useAssignments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAssignments = useCallback(async (courseId) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/assignments/course/${courseId}`);
      return unwrapList(response.data);
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
      return unwrapData(response.data);
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
