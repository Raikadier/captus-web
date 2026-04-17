import { useState, useCallback } from 'react';
import apiClient from '../../../shared/api/client';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/categories');
      setCategories(response.data || []);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching categories:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (categoryData) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/categories', categoryData);
      await fetchCategories(); // Refresh the list
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  const updateCategory = useCallback(async (id, categoryData) => {
    try {
      setLoading(true);
      const response = await apiClient.put(`/categories/${id}`, categoryData);
      await fetchCategories(); // Refresh the list
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (id) => {
    try {
      setLoading(true);
      await apiClient.delete(`/categories/${id}`);
      await fetchCategories(); // Refresh the list
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};