import { useState, useCallback } from 'react';
// import { useAuth } from './useAuth';
import apiClient from '../shared/api/client';

export function useSubmissions() {
  // const { session } = useAuth(); // session not needed for client calls
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSubmissions = useCallback(async (assignmentId) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/submissions/assignment/${assignmentId}`);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAssignment = async (data) => {
    // data: { assignment_id, file_url, group_id }
    setLoading(true);
    try {
      const response = await apiClient.post('/submissions/submit', data);
      return response.data;
    } catch (err) {
      // apiClient throws on error, but we want to catch it to rethrow or handle specific errors if needed
      // The original code was throwing `resJson.error`. apiClient error might have `error.response.data.error`.
      const message = err.response?.data?.error || err.message || 'Error submitting assignment';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const gradeSubmission = async (submissionId, gradeData) => {
    // gradeData: { grade, feedback }
    setLoading(true);
    try {
      const response = await apiClient.put(`/submissions/grade/${submissionId}`, gradeData);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error grading submission';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return { getSubmissions, submitAssignment, gradeSubmission, loading, error };
}
