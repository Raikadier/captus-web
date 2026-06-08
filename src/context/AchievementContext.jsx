import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../shared/api/client';
import { AchievementContext } from './contextDefinitions';

export const AchievementProvider = ({ children }) => {
  const { user } = useAuth();
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [, setGlobalRefreshAchievements] = useState(null);
  const [error, setError] = useState(null);

  // Function to refresh achievements
  const refreshAchievements = useCallback(async (forceRecalculate = false) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      // console.log('🔄 Refreshing achievements...', { forceRecalculate, userId: user.id });

      if (forceRecalculate) {
        // console.log('🔄 Recalculating achievements...');
        try {
          await apiClient.post('/achievements/recalculate');
          // console.log('✅ Recalculate response:', recalcResponse.data);
        } catch (recalcError) {
          console.warn('⚠️ Recalculation failed, continuing anyway:', recalcError);
        }
      }

      // console.log('📡 Fetching achievements from /achievements/my...');
      const response = await apiClient.get('/achievements/my');
      // console.log('📊 RAW API Response:', response);
      // console.log('📊 Response data:', response.data);
      // console.log('📊 Response data.success:', response.data?.success);
      // console.log('📊 Response data.data:', response.data?.data);

      if (response.data?.success) {
        const achievements = response.data.data || [];
        // console.log('✅ Achievements to set in state:', achievements);
        // console.log('✅ Number of achievements:', achievements.length);
        // console.log('✅ Unlocked achievements:', achievements.filter(a => a.isCompleted === true).length);

        // Log each achievement's isCompleted status
        // achievements.forEach(a => {
        //   console.log(`  - ${a.achievementId}: isCompleted=${a.isCompleted} (type: ${typeof a.isCompleted})`);
        // });

        setUserAchievements(achievements);
        setLastUpdate(new Date());
        // console.log('✅ State updated successfully');
      } else {
        // console.error('❌ API returned success=false:', response.data);
        setError(response.data?.message || 'Error al cargar logros');
      }
    } catch (error) {
      console.error('❌ Error refreshing achievements:', error);
      // console.error('❌ Error details:', error.response?.data);
      setError(error.message || 'Error de conexión');
      // Keep existing achievements instead of clearing them
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Auto-refresh when tab is visible (efficiency: ISO 25010 performance)
  useEffect(() => {
    if (!user?.id) return;

    const refreshIfVisible = () => {
      if (!document.hidden) refreshAchievements();
    };

    const interval = setInterval(refreshIfVisible, 60_000);
    document.addEventListener('visibilitychange', refreshIfVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [user?.id, refreshAchievements]);

  // Set global function
  useEffect(() => {
    setGlobalRefreshAchievements(() => refreshAchievements);
    return () => {
      setGlobalRefreshAchievements(null);
    };
  }, [refreshAchievements]);

  // Initial load - ALWAYS load on mount when user is available
  useEffect(() => {
    if (user?.id) {
      // console.log('🏆 AchievementProvider: Loading achievements for user', user.id);
      refreshAchievements(true); // Force recalculate on first load
    }
  }, [user?.id, refreshAchievements]);

  // Function to get achievement data for a specific achievement
  const getAchievementData = useCallback((achievementId) => {
    return userAchievements.find(ua => ua.achievementId === achievementId) || null;
  }, [userAchievements]);

  // Function to check if achievement is unlocked
  const isAchievementUnlocked = useCallback((achievementId) => {
    const achievement = getAchievementData(achievementId);
    return achievement?.isCompleted || false;
  }, [getAchievementData]);

  const value = {
    userAchievements,
    loading,
    lastUpdate,
    error,
    refreshAchievements,
    getAchievementData,
    isAchievementUnlocked
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
};