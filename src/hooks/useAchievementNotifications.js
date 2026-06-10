import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import apiClient from '../shared/api/client';

const POLL_INTERVAL_MS = 60_000;

export const useAchievementNotifications = () => {
  const { user } = useAuth();
  const [currentNotification, setCurrentNotification] = useState(null);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const isPollingRef = useRef(false);

  const showAchievementNotification = useCallback((achievementId) => {
    setNotificationQueue(prev => [...prev, achievementId]);
  }, []);

  const closeNotification = useCallback(() => {
    setCurrentNotification(null);
  }, []);

  useEffect(() => {
    if (!currentNotification && notificationQueue.length > 0) {
      const nextAchievement = notificationQueue[0];
      setCurrentNotification(nextAchievement);
      setNotificationQueue(prev => prev.slice(1));
    }
  }, [currentNotification, notificationQueue]);

  useEffect(() => {
    if (!user?.id) return;

    const pollNotifications = async () => {
      if (document.hidden || isPollingRef.current) return;

      try {
        isPollingRef.current = true;
        const response = await apiClient.get('/notifications?type=achievement&unread=true&limit=10');

        if (response.data && Array.isArray(response.data)) {
          const achievementNotifications = response.data.filter(
            notification =>
              notification.event_type === 'achievement_unlocked' &&
              notification.metadata?.achievementId &&
              !notification.read
          );

          for (const notification of achievementNotifications) {
            await apiClient.put(`/notifications/${notification.id}/read`);
            showAchievementNotification(notification.metadata.achievementId);
          }
        }
      } catch (error) {
        console.error('Error polling achievement notifications:', error);
      } finally {
        isPollingRef.current = false;
      }
    };

    pollNotifications();

    const interval = setInterval(pollNotifications, POLL_INTERVAL_MS);
    const onVisibilityChange = () => {
      if (!document.hidden) pollNotifications();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [user?.id, showAchievementNotification]);

  return {
    currentNotification,
    closeNotification,
    showAchievementNotification
  };
};
