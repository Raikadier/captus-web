import apiClient from '../shared/api/client';
import { unwrapData, unwrapList } from '../shared/api/unwrap';

export const courseService = {
    getCourses: async () => {
        const response = await apiClient.get('/courses/student');
        return unwrapList(response.data);
    },

    getTeacherCourses: async () => {
        const response = await apiClient.get('/courses/teacher');
        return unwrapList(response.data);
    },

    getStudentCourses: async () => {
        const response = await apiClient.get('/courses/student');
        return unwrapList(response.data);
    },

    getCourse: async (id) => {
        const response = await apiClient.get(`/courses/${id}`);
        return unwrapData(response.data);
    },

    createCourse: async (data) => {
        const response = await apiClient.post('/courses', data);
        return response.data;
    },

    updateCourse: async (id, data) => {
        const response = await apiClient.put(`/courses/${id}`, data);
        return response.data;
    },

    deleteCourse: async (id) => {
        const response = await apiClient.delete(`/courses/${id}`);
        return response.data;
    }
};
