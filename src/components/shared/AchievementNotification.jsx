import React, { useEffect, useState } from 'react';
import { Trophy, Star, Flame, Zap, Sparkles, Crown, X } from 'lucide-react';
import { achievements } from '../../shared/achievementsConfig';

const AchievementNotification = ({ achievementId, onClose, autoClose = true }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const achievement = achievements[achievementId];
  if (!achievement) return null;

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);
    setTimeout(() => setIsAnimating(true), 300);

    // Auto close after 5 seconds
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievementId, autoClose]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 300);
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return <Star className="w-8 h-8 text-green-500" />;
      case 'medium': return <Flame className="w-8 h-8 text-orange-500" />;
      case 'hard': return <Zap className="w-8 h-8 text-red-500" />;
      case 'special': return <Sparkles className="w-8 h-8 text-purple-500" />;
      case 'epic': return <Crown className="w-8 h-8 text-purple-700" />;
      default: return <Trophy className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getDifficultyStyles = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return {
          bg: 'bg-gradient-to-br from-green-400 via-green-500 to-green-600',
          glow: 'shadow-green-500/50',
          particles: 'bg-green-300'
        };
      case 'medium':
        return {
          bg: 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600',
          glow: 'shadow-orange-500/50',
          particles: 'bg-orange-300'
        };
      case 'hard':
        return {
          bg: 'bg-gradient-to-br from-red-400 via-red-500 to-red-600',
          glow: 'shadow-red-500/50',
          particles: 'bg-red-300'
        };
      case 'special':
        return {
          bg: 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600',
          glow: 'shadow-purple-500/50',
          particles: 'bg-purple-300'
        };
      case 'epic':
        return {
          bg: 'bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-600',
          glow: 'shadow-purple-500/50',
          particles: 'bg-indigo-300'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600',
          glow: 'shadow-yellow-500/50',
          particles: 'bg-yellow-300'
        };
    }
  };

  const styles = getDifficultyStyles(achievement.difficulty);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Notification */}
      <div
        className={`
          relative max-w-md w-full mx-4 pointer-events-auto
          transform transition-all duration-500 ease-out
          ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
        `}
      >
        {/* Particles effect */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 ${styles.particles} rounded-full animate-ping`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>

        {/* Main card */}
        <div className={`
          relative bg-white rounded-2xl p-6 shadow-2xl border-2 border-white/20
          ${styles.bg} ${styles.glow} shadow-2xl
          transform transition-all duration-300
          ${isAnimating ? 'rotate-0' : 'rotate-2'}
        `}>
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Trophy icon with bounce animation */}
            <div className={`
              inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-4
              transform transition-all duration-500
              ${isAnimating ? 'animate-bounce' : ''}
            `}>
              <Trophy className="w-10 h-10 text-white" />
            </div>

            {/* Achievement unlocked text */}
            <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
              ¡Logro Desbloqueado!
            </h2>

            {/* Achievement name and icon */}
            <div className="flex items-center justify-center space-x-2 mb-3">
              <span className="text-4xl">{achievement.icon}</span>
              <h3 className="text-xl font-bold text-white drop-shadow-lg">
                {achievement.name}
              </h3>
              {getDifficultyIcon(achievement.difficulty)}
            </div>

            {/* Description */}
            <p className="text-white/90 text-sm leading-relaxed drop-shadow">
              {achievement.description}
            </p>

            {/* Difficulty badge */}
            <div className="mt-4 inline-flex items-center space-x-1 bg-white/20 rounded-full px-3 py-1">
              {getDifficultyIcon(achievement.difficulty)}
              <span className="text-white font-medium text-sm capitalize">
                {achievement.difficulty === 'easy' ? 'Fácil' :
                 achievement.difficulty === 'medium' ? 'Medio' :
                 achievement.difficulty === 'hard' ? 'Difícil' :
                 achievement.difficulty === 'special' ? 'Especial' : 'Épico'}
              </span>
            </div>
          </div>

          {/* Shine effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;