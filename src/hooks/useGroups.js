import { useState, useEffect, useCallback } from 'react';
import apiClient from '../shared/api/client';

export const useGroups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchGroups = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/groups/my-groups');
            setGroups(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Error fetching groups');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const createGroup = async (data) => {
        try {
            const response = await apiClient.post('/groups', data);
            setGroups(prev => [...prev, response.data]);
            return response.data;
        } catch (err) {
            throw new Error(err.response?.data?.error || 'Error creating group');
        }
    };

    const joinGroup = async (groupId) => {
        try {
            const response = await apiClient.post('/groups/add-member', { groupId });
            fetchGroups(); // Refresh list after joining
            return response.data;
        } catch (err) {
            throw new Error(err.response?.data?.error || 'Error joining group');
        }
    };

    return {
        groups,
        loading,
        error,
        createGroup,
        joinGroup,
        refresh: fetchGroups
    };
};
