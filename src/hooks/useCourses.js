import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import apiClient from '../shared/api/client';

export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session, user } = useAuth();

  // Helper to determine if we should fetch teacher or student courses
  const role = user?.user_metadata?.role || 'student';

  const fetchCourses = useCallback(async () => {
    // Rely on apiClient interceptor for token.
    // However, if we don't have a session, we might want to skip or let apiClient handle 401.
    // Given the component structure, it's safer to wait for auth, but apiClient will handle it.
    if (!session) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const endpoint = role === 'teacher' ? '/courses/teacher' : '/courses/student';
      // apiClient.get returns { data: responseData } wrapper from our client.js
      const response = await apiClient.get(endpoint);
      // Assuming backend returns the array directly or { data: [...] } ?
      // Previous code: const data = await response.json(); setCourses(data);
      // We need to know the backend response shape.
      // If backend returns JSON array, axios.data is that array.
      // If backend returns { success: true, data: [...] }, axios.data is that object.
      // Looking at useTasks, it handled { data: { data: [] } }.
      // But looking at previous useCourses implementation: setCourses(data) where data = response.json().
      // This implies the endpoint returns the array directly.
      // But let's be careful. Let's assume response.data is what we want.
      // Ensure we have an array
      const data = response.data;
      if (Array.isArray(data)) {
        setCourses(data);
      } else if (data && Array.isArray(data.data)) {
        // Handle wrapped response { success: true, data: [...] }
        setCourses(data.data);
      } else {
        console.warn('Unexpected courses response format:', data);
        setCourses([]);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Error fetching courses');
    } finally {
      setLoading(false);
    }
  }, [session, role]);

  const createCourse = useCallback(async (courseData) => {
    const response = await apiClient.post('/courses', courseData);
    // Previous code: await fetchCourses(); return await response.json();
    await fetchCourses();
    return response.data;
  }, [fetchCourses]);

  const getCourse = useCallback(async (id) => {
    const response = await apiClient.get(`/courses/${id}`);
    return response.data;
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refresh: fetchCourses, createCourse, getCourse };
}
