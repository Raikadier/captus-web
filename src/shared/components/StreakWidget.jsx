// StreakWidget - Widget mejorado con animación y mejor diseño
import React, { useState, useEffect } from 'react';
import { Flame, Target, Calendar, Settings, CheckCircle, Star, Activity, TrendingUp, Clock, Award, AlertTriangle, AlertCircle, Minus } from 'lucide-react';
import Loading from '../../ui/loading';
import { Progress } from '../../ui/progress';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Card } from '../../ui/card';
import apiClient from '../api/client';
import { toast } from 'sonner';
import { useStreakData, useEventsData, useProjectsData, useNotesData, usePriorityData, useTimeData, useAchievementsData } from '../../hooks/useConsolidatedStats';
import { useAchievementsContext } from '../../hooks/useAchievementsContext';

const StreakWidget = () => {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedStreak, setAnimatedStreak] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newDailyGoal, setNewDailyGoal] = useState('');

  useEffect(() => {
    fetchStreakData();
  }, []);

  useEffect(() => {
    // Animate streak number
    if (streakData?.currentStreak !== undefined) {
      const targetStreak = streakData.currentStreak;
      const duration = 1000; // 1 second
      const steps = 60;
      const increment = targetStreak / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= targetStreak) {
          setAnimatedStreak(targetStreak);
          clearInterval(timer);
        } else {
          setAnimatedStreak(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [streakData?.currentStreak]);

  useEffect(() => {
    // Animate progress percentage
    if (streakData?.progressPercentage !== undefined) {
      const targetProgress = streakData.progressPercentage;
      const duration = 1500; // 1.5 seconds
      const steps = 90;
      const increment = targetProgress / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= targetProgress) {
          setAnimatedProgress(targetProgress);
          clearInterval(timer);
        } else {
          setAnimatedProgress(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [streakData?.progressPercentage]);

  const fetchStreakData = async () => {
    try {
      // Use the statistics endpoint for streak data
      const response = await apiClient.get('/statistics/streak-stats');
      const data = response?.data;
      if (data) {
        setStreakData(data);
        setNewDailyGoal(data.dailyGoal?.toString() || '5');
      } else {
        // Default streak data if none exists
        setStreakData({
          currentStreak: 0,
          lastCompletedDate: null,
          dailyGoal: 5,
          tasksCompletedToday: 0,
          progressPercentage: 0,
          motivationalMessage: '¡Empieza tu racha hoy!',
          bestStreak: 0
        });
        setNewDailyGoal('5');
      }
    } catch (error) {
      console.error('Error fetching streak data:', error);
      setStreakData({
        currentStreak: 0,
        lastCompletedDate: null,
        dailyGoal: 5,
        tasksCompletedToday: 0,
        progressPercentage: 0,
        motivationalMessage: '¡Empieza tu racha hoy!',
        bestStreak: 0
      });
      setNewDailyGoal('5');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDailyGoal = async () => {
    try {
      const goal = parseInt(newDailyGoal);
      if (goal < 3) {
        toast.error('La meta diaria debe ser al menos 3 tareas');
        return;
      }

      const response = await apiClient.put('/statistics/daily-goal', { dailyGoal: goal });
      if (response.data.success) {
        toast.success('Meta diaria actualizada');
        setIsSettingsOpen(false);
        fetchStreakData(); // Refresh data
      } else {
        toast.error(response.data.message || 'Error al actualizar la meta');
      }
    } catch (error) {
      console.error('Error updating daily goal:', error);
      toast.error('Error al actualizar la meta diaria');
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl shadow-sm p-6">
        <Loading message="Cargando racha..." fullScreen={false} />
      </div>
    );
  }

  if (!streakData) {
    return (
      <div className="bg-card rounded-xl shadow-sm p-6">
        <div className="text-center text-muted-foreground">No se pudo cargar la información de racha</div>
      </div>
    );
  }

  const isStreakActive = streakData.lastCompletedDate &&
    new Date(streakData.lastCompletedDate).toDateString() === new Date().toDateString();

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-xl shadow-lg p-8 w-full max-w-md mx-auto">
      {/* Header with settings */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-foreground flex items-center">
          <Flame className="mr-3 text-orange-500" size={28} />
          Mi Racha
        </h3>
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Settings size={18} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurar Meta Diaria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tareas por día (mínimo 3)</label>
                <Input
                  type="number"
                  min="3"
                  value={newDailyGoal}
                  onChange={(e) => setNewDailyGoal(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleUpdateDailyGoal} className="w-full">
                Actualizar Meta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Streak counter */}
      <div className="text-center mb-6">
        <div className={`text-8xl font-bold mb-3 ${animatedStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`}>
          {animatedStreak}
        </div>
        <div className="text-lg text-muted-foreground mb-2">
          {animatedStreak === 1 ? 'día consecutivo' : 'días consecutivos'}
        </div>
        {streakData.bestStreak > 0 && (
          <div className="text-sm text-muted-foreground">
            Mejor racha: {streakData.bestStreak} días
          </div>
        )}
      </div>

      {/* Daily Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Progreso Diario</span>
          <span className="text-sm text-muted-foreground">
            {streakData.tasksCompletedToday || 0} / {streakData.dailyGoal} tareas
          </span>
        </div>
        <Progress value={animatedProgress} className="h-3" />
        <div className="text-center mt-2">
          <span className="text-sm font-medium text-primary">
            {Math.round(animatedProgress)}% completado
          </span>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Mensaje motivacional</p>
            <p className="text-sm text-muted-foreground italic">
              "{streakData.motivationalMessage}"
            </p>
          </div>
        </div>
      </div>

      {/* Streak status */}
      <div className="text-center">
        {isStreakActive ? (
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium">
            <Flame size={16} className="mr-2" />
            ¡Racha activa! 🔥
          </div>
        ) : (
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-medium">
            <Calendar size={16} className="mr-2" />
            Completa tu meta diaria para mantener la racha
          </div>
        )}
      </div>

      {/* Last completed date */}
      {streakData.lastCompletedDate && (
        <div className="text-center text-xs text-muted-foreground mt-4">
          Última actividad: {new Date(streakData.lastCompletedDate).toLocaleDateString('es-ES')}
        </div>
      )}
    </div>
  );
};

// Mini version for task pages
export const MiniStreakWidget = () => {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreakData();
  }, []);

  const fetchStreakData = async () => {
    try {
      const response = await apiClient.get('/statistics/streak-stats');
      const data = response?.data;
      if (data) {
        setStreakData(data);
      }
    } catch (error) {
      console.error('Error fetching streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !streakData) {
    return (
      <div className="bg-card rounded-lg p-4 border">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Flame className="text-orange-500" size={20} />
          <div>
            <p className="text-sm font-medium text-foreground">Racha Actual</p>
            <p className="text-lg font-bold text-orange-600">{streakData.currentStreak} días</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Meta diaria</p>
          <p className="text-sm font-medium">{streakData.tasksCompletedToday || 0}/{streakData.dailyGoal}</p>
        </div>
      </div>
      {streakData.motivationalMessage && (
        <div className="mt-3 p-2 bg-white/50 dark:bg-black/20 rounded text-xs text-muted-foreground italic">
          "{streakData.motivationalMessage}"
        </div>
      )}
    </div>
  );
};

// Favorite Category Widget
export const FavoriteCategoryWidget = () => {
  const [favoriteCategory, setFavoriteCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavoriteCategory();
  }, []);

  const fetchFavoriteCategory = async () => {
    try {
      const response = await apiClient.get('/statistics');
      const data = response?.data;
      if (data?.favoriteCategoryAnalysis) {
        setFavoriteCategory(data.favoriteCategoryAnalysis);
      }
    } catch (error) {
      console.error('Error fetching favorite category:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg p-6 border">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-full"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!favoriteCategory) {
    return (
      <div className="bg-card rounded-lg p-6 border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            <Star className="text-muted-foreground" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Categoría Favorita</h3>
            <p className="text-sm text-muted-foreground">Aún no hay suficientes datos</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 border">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Star className="text-white" size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Categoría Favorita</h3>
          <p className="text-sm text-muted-foreground">Tu categoría más efectiva</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">{favoriteCategory.category.name}</span>
          <span className="text-sm font-medium text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-1 rounded">
            {favoriteCategory.stats.completionRate}% completado
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total de tareas</p>
            <p className="font-semibold text-foreground">{favoriteCategory.stats.totalTasks}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Completadas</p>
            <p className="font-semibold text-green-600">{favoriteCategory.stats.completedTasks}</p>
          </div>
        </div>

        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
            style={{ width: `${favoriteCategory.stats.completionRate}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground italic">
          {favoriteCategory.stats.reason}
        </p>
      </div>
    </div>
  );
};

// Events Overview Widget (Small)
export const EventsOverviewWidget = () => {
  const { eventsData, loading } = useEventsData();

  if (loading) {
    return (
      <Card className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!eventsData) return null;

  return (
    <Card className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
          <Calendar className="text-purple-600" size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Eventos</h3>
          <p className="text-sm text-gray-600">Calendario</p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-600">Total de eventos</span>
        <span className="text-2xl font-bold text-purple-600">{eventsData.totalEvents}</span>
      </div>
    </Card>
  );
};

// Projects Overview Widget (Small)
export const ProjectsOverviewWidget = () => {
  const { projectsData, loading } = useProjectsData();

  if (loading) {
    return (
      <Card className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (!projectsData) return null;

  return (
    <Card className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
          <Target className="text-orange-600" size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Proyectos</h3>
          <p className="text-sm text-gray-600">Gestión de proyectos</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total de proyectos</span>
          <span className="font-bold text-orange-600">{projectsData.totalProjects}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Proyectos activos</span>
          <span className="font-medium text-gray-900">{projectsData.activeProjects}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Completados</span>
          <span className="font-medium text-green-600">{projectsData.totalProjects - projectsData.activeProjects}</span>
        </div>
      </div>
    </Card>
  );
};

// Notes Stats Widget (Small)
export const NotesStatsWidget = () => {
  const { notesData, loading } = useNotesData();

  if (loading) {
    return (
      <Card className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!notesData) return null;

  return (
    <Card className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center">
          <CheckCircle className="text-cyan-600" size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Notas</h3>
          <p className="text-sm text-gray-600">Total de notas</p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-600">Total</span>
        <span className="text-2xl font-bold text-cyan-600">{notesData.totalNotes}</span>
      </div>
    </Card>
  );
};

// Categories Stats Widget (Small)
export const CategoriesStatsWidget = () => {
  const { notesData, loading } = useNotesData();

  if (loading) {
    return (
      <Card className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!notesData) return null;

  return (
    <Card className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
          <Settings className="text-purple-600" size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Categorías</h3>
          <p className="text-sm text-gray-600">Organización</p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-600">Total Categorías</span>
        <span className="text-2xl font-bold text-purple-600">{notesData.totalCategories}</span>
      </div>
    </Card>
  );
};



// Average Completion Time Widget
export const AverageTimeWidget = () => {
  const { timeData, loading } = useTimeData();

  if (loading) {
    return (
      <Card className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!timeData || timeData.averageTime === 0) return null;

  const formatTime = (hours) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    } else if (hours < 24) {
      return `${hours.toFixed(1)} h`;
    } else {
      return `${(hours / 24).toFixed(1)} días`;
    }
  };

  return (
    <Card className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
          <Clock className="text-blue-600" size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Tiempo Promedio</h3>
          <p className="text-sm text-gray-600">Completación de tareas</p>
        </div>
      </div>

      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600 mb-2">
          {formatTime(timeData.averageTime)}
        </div>
        <p className="text-sm text-gray-600">
          Tiempo promedio para completar una tarea
        </p>
      </div>
    </Card>
  );
};

// Recent Achievements Widget
export const RecentAchievementsWidget = () => {
  const { userAchievements, loading } = useAchievementsContext();

  // Filter only completed achievements and sort by most recent
  const recentAchievements = userAchievements
    .filter(achievement => achievement.isCompleted)
    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
    .slice(0, 3);

  if (loading) {
    return (
      <Card className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (recentAchievements.length === 0) {
    return (
      <Card className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
            <Award className="text-yellow-600" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Logros Recientes</h3>
            <p className="text-sm text-gray-600">Tus últimos desbloqueos</p>
          </div>
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">¡Completa tareas para desbloquear logros!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
          <Award className="text-yellow-600" size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Logros Recientes</h3>
          <p className="text-sm text-gray-600">Tus últimos desbloqueos</p>
        </div>
      </div>

      <div className="space-y-3">
        {recentAchievements.map((achievement) => (
          <div key={achievement.achievementId} className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-sm">🏆</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {achievement.achievementId ? achievement.achievementId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Logro Desbloqueado'}
              </p>
              <p className="text-xs text-gray-600">
                {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString('es-ES') : 'Hoy'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Best Streak Widget (Historical Record)
export const BestStreakWidget = () => {
  const { streakData, loading } = useStreakData();

  if (loading) {
    return (
      <Card className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!streakData || !streakData.bestStreak) return null;

  return (
    <Card className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
          <Award className="text-yellow-600" size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Mejor Racha</h3>
          <p className="text-sm text-gray-600">Récord histórico</p>
        </div>
      </div>

      <div className="text-center">
        <div className="text-4xl font-bold text-yellow-600 mb-2">
          {streakData.bestStreak} días
        </div>
        <p className="text-sm text-gray-600">
          Tu mejor racha consecutiva
        </p>
      </div>
    </Card>
  );
};

export default StreakWidget;
