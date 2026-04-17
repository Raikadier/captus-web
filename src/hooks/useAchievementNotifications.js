import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import apiClient from '../shared/api/client';

export const useAchievementNotifications = () => {
  const { user } = useAuth();
  const [currentNotification, setCurrentNotification] = useState(null);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [isPolling, setIsPolling] = useState(false);

  // Function to show achievement notification
  const showAchievementNotification = useCallback((achievementId) => {
    setNotificationQueue(prev => [...prev, achievementId]);
  }, []);

  // Function to close current notification
  const closeNotification = useCallback(() => {
    setCurrentNotification(null);
  }, []);

  // Process notification queue
  useEffect(() => {
    if (!currentNotification && notificationQueue.length > 0) {
      const nextAchievement = notificationQueue[0];
      setCurrentNotification(nextAchievement);
      setNotificationQueue(prev => prev.slice(1));
    }
  }, [currentNotification, notificationQueue]);

  // Poll for new achievement notifications
  useEffect(() => {
    if (!user?.id || isPolling) return;

    const pollNotifications = async () => {
      try {
        setIsPolling(true);
        const response = await apiClient.get('/notifications?type=achievement&unread=true&limit=10');

        if (response.data && Array.isArray(response.data)) {
          // Filter achievement notifications that haven't been shown yet
          const achievementNotifications = response.data.filter(
            notification =>
              notification.event_type === 'achievement_unlocked' &&
              notification.metadata?.achievementId &&
              !notification.read
          );

          // Mark as read and show notifications
          for (const notification of achievementNotifications) {
            // Mark as read
            await apiClient.put(`/notifications/${notification.id}/read`);

            // Show notification
            showAchievementNotification(notification.metadata.achievementId);
          }
        }
      } catch (error) {
        console.error('Error polling achievement notifications:', error);
      } finally {
        setIsPolling(false);
      }
    };

    // Initial poll
    pollNotifications();

    // Set up polling interval (every 30 seconds)
    const interval = setInterval(pollNotifications, 30000);

    return () => clearInterval(interval);
  }, [user?.id, showAchievementNotification, isPolling]);

  return {
    currentNotification,
    closeNotification,
    showAchievementNotification
  };
};