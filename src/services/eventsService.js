import apiClient from '../shared/api/client';

export const eventsService = {
    getUpcoming: async (options = {}) => {
        const params = new URLSearchParams(options).toString();
        const response = await apiClient.get(`/events/upcoming?${params}`);
        return response.data; // Expecting { success: true, data: [...] } or just [...] depending on backend
    },

    getEvents: async (startDate, endDate) => {
        const response = await apiClient.get(`/events?startDate=${startDate}&endDate=${endDate}`);
        return response.data;
    },

    createEvent: async (data) => {
        const response = await apiClient.post('/events', data);
        return response.data;
    },

    updateEvent: async (id, data) => {
        const response = await apiClient.put(`/events/${id}`, data);
        return response.data;
    },

    deleteEvent: async (id) => {
        const response = await apiClient.delete(`/events/${id}`);
        return response.data;
    }
};
