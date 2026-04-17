import { useState, useEffect, useCallback } from 'react';
import apiClient from '../shared/api/client';

export const useProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch both created and member projects
            const [createdRes, memberRes] = await Promise.all([
                apiClient.get('/projects/created'),
                apiClient.get('/projects/member')
            ]);

            // Combine and tag them
            const created = createdRes.data.map(p => ({ ...p, role: 'owner' }));
            const member = memberRes.data.map(p => ({ ...p, role: 'member' }));

            setProjects([...created, ...member]);
            setError(null);
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const createProject = async (data) => {
        try {
            const response = await apiClient.post('/projects', data);
            setProjects(prev => [...prev, { ...response.data, role: 'owner' }]);
            return response.data;
        } catch (err) {
            throw new Error(err.response?.data?.error || 'Error creating project');
        }
    };

    const deleteProject = async (id) => {
        try {
            await apiClient.delete(`/projects/${id}`);
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            throw new Error(err.response?.data?.error || 'Error deleting project');
        }
    }

    return {
        projects,
        loading,
        error,
        createProject,
        deleteProject,
        refresh: fetchProjects
    };
};
