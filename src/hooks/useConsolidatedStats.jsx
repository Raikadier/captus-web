// Consolidated hook for all statistics data to prevent duplicate API calls
import { useState, useEffect, createContext, useContext } from 'react';
import apiClient from '../shared/api/client';

const StatsContext = createContext(null);

// Provider component to wrap StatsPage
export function StatsProvider({ children }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllStats = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all stats in one consolidated call
            const [streakRes, additionalRes] = await Promise.all([
                apiClient.get('/statistics/streak-stats'),
                apiClient.get('/statistics/additional')
            ]);

            const consolidatedData = {
                streak: streakRes.data || {},
                additional: additionalRes.data || {},
                timestamp: Date.now()
            };

            setStats(consolidatedData);
        } catch (err) {
            console.error('Error fetching consolidated stats:', err);
            setError(err);
            // Set default values to prevent crashes
            setStats({
                streak: {
                    currentStreak: 0,
                    dailyGoal: 5,
                    tasksCompletedToday: 0,
                    progressPercentage: 0,
                    motivationalMessage: '¡Empieza tu racha hoy!',
                    bestStreak: 0,
                    totalSubTasksCompleted: 0
                },
                additional: {
                    totalEvents: 0,
                    upcomingEvents: 0,
                    completedEvents: 0,
                    totalProjects: 0,
                    activeProjects: 0,
                    totalNotes: 0,
                    recentNotes: 0,
                    totalCategories: 0,
                    priorityStats: { high: 0, medium: 0, low: 0 },
                    averageCompletionTime: 0,
                    recentAchievements: []
                },
                timestamp: Date.now()
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllStats();
    }, []);

    const refresh = () => {
        fetchAllStats();
    };

    return (
        <StatsContext.Provider value={{ stats, loading, error, refresh }}>
            {children}
        </StatsContext.Provider>
    );
}

// Hook to access consolidated stats
export function useConsolidatedStats() {
    const context = useContext(StatsContext);
    if (!context) {
        throw new Error('useConsolidatedStats must be used within StatsProvider');
    }
    return context;
}

// Specific hooks for individual widgets
export function useStreakData() {
    const { stats, loading } = useConsolidatedStats();
    return {
        streakData: stats?.streak || null,
        loading
    };
}

export function useAdditionalStats() {
    const { stats, loading } = useConsolidatedStats();
    return {
        additionalStats: stats?.additional || null,
        loading
    };
}

export function useEventsData() {
    const { stats, loading } = useConsolidatedStats();
    return {
        eventsData: stats?.additional ? {
            totalEvents: stats.additional.totalEvents,
            upcomingEvents: stats.additional.upcomingEvents,
            completedEvents: stats.additional.completedEvents
        } : null,
        loading
    };
}

export function useProjectsData() {
    const { stats, loading } = useConsolidatedStats();
    return {
        projectsData: stats?.additional ? {
            totalProjects: stats.additional.totalProjects,
            activeProjects: stats.additional.activeProjects
        } : null,
        loading
    };
}

export function useNotesData() {
    const { stats, loading } = useConsolidatedStats();
    return {
        notesData: stats?.additional ? {
            totalNotes: stats.additional.totalNotes,
            recentNotes: stats.additional.recentNotes,
            totalCategories: stats.additional.totalCategories
        } : null,
        loading
    };
}

export function usePriorityData() {
    const { stats, loading } = useConsolidatedStats();
    return {
        priorityData: stats?.additional?.priorityStats || null,
        loading
    };
}

export function useTimeData() {
    const { stats, loading } = useConsolidatedStats();
    return {
        timeData: stats?.additional ? {
            averageTime: stats.additional.averageCompletionTime
        } : null,
        loading
    };
}

export function useAchievementsData() {
    const { stats, loading } = useConsolidatedStats();
    return {
        achievements: stats?.additional?.recentAchievements || [],
        loading
    };
}
