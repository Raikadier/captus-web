import apiClient from '../shared/api/client';

export const taskService = {
    getTasksWithSubtasks: async () => {
        const response = await apiClient.get('/subtasks/tasks/with-subtasks');
        if (response.data.success) {
            return new Set(response.data.data);
        }
        throw new Error(response.data.message || 'Failed to fetch tasks with subtasks');
    }
};
