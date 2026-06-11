import apiClient from '../shared/api/client';
import { unwrapList } from '../shared/api/unwrap';

export const submissionService = {
    submitAssignment: async (data) => {
        const response = await apiClient.post('/submissions/submit', data);
        return response.data;
    },

    getSubmissions: async (assignmentId) => {
        const response = await apiClient.get(`/submissions/assignment/${assignmentId}`);
        return unwrapList(response.data);
    },

    gradeSubmission: async (submissionId, grade, feedback) => {
        const response = await apiClient.put(`/submissions/grade/${submissionId}`, { grade, feedback });
        return response.data;
    },

    getPendingReviews: async () => {
        const response = await apiClient.get('/submissions/pending');
        return unwrapList(response.data);
    }
};
