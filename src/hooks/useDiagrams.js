import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import apiClient from '../shared/api/client';

export function useDiagrams() {
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchDiagrams = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await apiClient.get('/diagrams');
      // apiClient.get returns { data: responseData }
      // assuming responseData is { success: true, data: ... } based on previous usage
      const result = response.data;
      if (result.success) {
        setDiagrams(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createDiagram = async (data) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/diagrams', data);
      const result = response.data;
      if (result.success) {
        setDiagrams(prev => [result.data, ...prev]);
        return { success: true };
      }
      return { success: false, error: result.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateDiagram = async (id, data) => {
    setLoading(true);
    try {
      const response = await apiClient.put(`/diagrams/${id}`, data);
      const result = response.data;
      if (result.success) {
        setDiagrams(prev => prev.map(d => d.id === id ? result.data : d));
        return { success: true };
      }
      return { success: false, error: result.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteDiagram = async (id) => {
    setLoading(true);
    try {
      const response = await apiClient.delete(`/diagrams/${id}`);
      const result = response.data;
      if (result.success) {
        setDiagrams(prev => prev.filter(d => d.id !== id));
        return { success: true };
      }
      return { success: false, error: result.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagrams();
  }, [fetchDiagrams]);

  return {
    diagrams,
    loading,
    error,
    refreshDiagrams: fetchDiagrams,
    createDiagram,
    updateDiagram,
    deleteDiagram
  };
}
