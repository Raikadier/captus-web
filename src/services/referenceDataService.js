import apiClient from '../shared/api/client';

export const referenceDataService = {
    getCategories: async () => {
        const response = await apiClient.get('/categories');
        return response.data?.data || response.data || [];
    },

    getPriorities: async () => {
        const response = await apiClient.get('/priorities');
        return response.data?.data || response.data || [];
    }
};
