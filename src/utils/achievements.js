// Global function to refresh achievements from anywhere
// This is separated from the Context file to allow Fast Refresh to work properly

let globalRefreshAchievements = null;

export const setGlobalRefreshAchievements = (fn) => {
    globalRefreshAchievements = fn;
};

export const refreshAchievementsGlobally = () => {
    if (globalRefreshAchievements) {
        globalRefreshAchievements();
    }
};
