import { useContext } from 'react';
import { AchievementContext } from '../context/contextDefinitions';

export const useAchievementsContext = () => {
    const context = useContext(AchievementContext);
    if (!context) {
        throw new Error('useAchievementsContext must be used within AchievementProvider');
    }
    return context;
};
