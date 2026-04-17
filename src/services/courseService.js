import apiClient from '../shared/api/client';

export const courseService = {
    getCourses: async () => {
        // Default to student courses if generic call, or maybe deprecate this?
        // For now, let's try to detect or just default to student
        const response = await apiClient.get('/courses/student');
        return response.data;
    },

    getTeacherCourses: async () => {
        const response = await apiClient.get('/courses/teacher');
        return response.data;
    },

    getStudentCourses: async () => {
        const response = await apiClient.get('/courses/student');
        return response.data;
    },

    getCourse: async (id) => {
        const response = await apiClient.get(`/courses/${id}`);
        return response.data;
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
