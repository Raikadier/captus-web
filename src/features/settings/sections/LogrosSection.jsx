import React, { useState, useEffect, useRef } from 'react'
import { Filter, Trophy, CheckCircle } from 'lucide-react'
import { Button } from '../../../ui/button'
import { Card } from '../../../ui/card'
import { Progress } from '../../../ui/progress'
import { useTheme } from '../../../context/themeContext'
import { useAchievementsContext } from '../../../hooks/useAchievementsContext'
import { achievements as achievementsConfig, difficultyOrder, difficultyLabels, difficultyColors } from '../../../shared/achievementsConfig'
import { toast } from 'sonner'
import Loading from '../../../ui/loading'

const getDifficultyColor = (difficulty) => difficultyColors[difficulty] || 'bg-muted text-foreground border-border'

export default function LogrosSection() {
  const { darkMode, compactView } = useTheme()
  const { userAchievements, loading: achievementsLoading, error: achievementsError, refreshAchievements } = useAchievementsContext()
  const [statusFilter, setStatusFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const hasShownInitialToast = useRef(false)

  // Combine config with user data
  const achievements = Object.keys(achievementsConfig).map(achievementId => {
    const config = achievementsConfig[achievementId]
    const userAchievement = userAchievements.find(ua => ua.achievementId === achievementId)
    return { achievementId, ...config, userAchievement: userAchievement || null }
  })

  let filteredAchievements = achievements
  if (statusFilter !== 'all') {
    filteredAchievements = filteredAchievements.filter(a => {
      const isCompleted = a.userAchievement?.isCompleted || false
      return statusFilter === 'completed' ? isCompleted : !isCompleted
    })
  }
  if (difficultyFilter !== 'all') {
    filteredAchievements = filteredAchievements.filter(a => a && a.difficulty === difficultyFilter)
  }

  const achievementsByDifficulty = filteredAchievements.reduce((groups, a) => {
    if (a && a.difficulty) {
      if (!groups[a.difficulty]) groups[a.difficulty] = []
      groups[a.difficulty].push(a)
    }
    return groups
  }, {})

  const totalAchievements = achievements.length
  const unlockedAchievements = achievements.filter(a => a.userAchievement?.isCompleted).length

  useEffect(() => {
    if (!achievementsLoading && achievementsError === null && userAchievements.length > 0 && !hasShownInitialToast.current) {
      hasShownInitialToast.current = true
      toast.success(`Logros cargados: ${unlockedAchievements}/${totalAchievements} completados`, { duration: 3000 })
    }
  }, [achievementsLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className={`${compactView ? 'p-4' : 'p-6'} ${darkMode ? 'bg-card border-gray-700' : 'bg-white'} rounded-xl shadow-sm`}>
      <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-foreground'} ${compactView ? 'mb-4' : 'mb-6'}`}>🏆 Mis Logros</h2>

      {achievementsLoading ? (
        <div className="text-center py-8"><Loading message="Cargando logros..." fullScreen={false} /></div>
      ) : achievementsError ? (
        <div className="text-center py-8">
          <div className="text-red-600 text-lg mb-4">Error: {achievementsError}</div>
          <Button onClick={() => window.location.reload()} variant="outline">Reintentar</Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Trophy className="text-yellow-500" size={32} />Sistema de Logros
            </h2>
            <p className="text-muted-foreground">Completa desafíos y desbloquea logros para demostrar tu productividad</p>
          </div>

          {/* Progress + Filters */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500 rounded-lg"><Trophy className="text-white" size={20} /></div>
                <div>
                  <h3 className="font-bold text-foreground">🏆 Tu Progreso</h3>
                  <p className="text-xs text-muted-foreground">Estadísticas y filtros</p>
                </div>
              </div>
              <Button onClick={() => refreshAchievements(true)} disabled={achievementsLoading}
                variant="outline" size="sm" className="bg-white/70 hover:bg-white border-yellow-300 text-yellow-700 hover:text-yellow-800">
                {achievementsLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>Actualizando...
                  </div>
                ) : <div className="flex items-center gap-2">🔄 Actualizar</div>}
              </Button>
              <div className="flex gap-4">
                <div className="bg-white/70 rounded-lg px-4 py-2 border border-yellow-200 text-center">
                  <div className="text-lg font-bold text-yellow-600">{unlockedAchievements}</div>
                  <div className="text-xs text-muted-foreground">Completados</div>
                </div>
                <div className="bg-white/70 rounded-lg px-4 py-2 border border-yellow-200 text-center">
                  <div className="text-lg font-bold text-orange-600">{totalAchievements}</div>
                  <div className="text-xs text-muted-foreground">Por Descubrir</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><Filter size={14} />Estado</h4>
                <div className="flex gap-2">
                  {[['all', 'Todos'], ['pending', '🔍 Por Descubrir'], ['completed', '✅ Completados']].map(([val, label]) => (
                    <Button key={val} variant={statusFilter === val ? 'default' : 'outline'} size="sm"
                      onClick={() => setStatusFilter(val)}
                      className={statusFilter === val ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'}>
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Dificultad</h4>
                <div className="flex gap-2">
                  <Button variant={difficultyFilter === 'all' ? 'default' : 'outline'} size="sm"
                    onClick={() => setDifficultyFilter('all')}
                    className={difficultyFilter === 'all' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-orange-300 text-orange-700 hover:bg-orange-50'}>
                    Todas
                  </Button>
                  {difficultyOrder.map(difficulty => (
                    <Button key={difficulty} variant={difficultyFilter === difficulty ? 'default' : 'outline'} size="sm"
                      onClick={() => setDifficultyFilter(difficulty)}
                      className={difficultyFilter === difficulty
                        ? `${getDifficultyColor(difficulty).split(' ')[0]} hover:opacity-90 text-white`
                        : `${getDifficultyColor(difficulty)} border-opacity-50`}>
                      {difficultyLabels[difficulty]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Achievement cards */}
          <div className="space-y-6">
            {difficultyOrder.map(difficulty => {
              const difficultyAchievements = achievementsByDifficulty[difficulty] || []
              if (difficultyAchievements.length === 0) return null
              return (
                <div key={difficulty}>
                  <div className="flex items-center mb-4">
                    <div className={`px-3 py-1 rounded-full border font-semibold text-sm ${getDifficultyColor(difficulty)}`}>
                      {difficultyLabels[difficulty]}
                    </div>
                    <div className="ml-3 h-px bg-gradient-to-r from-gray-300 to-transparent flex-1"></div>
                    <div className="text-xs text-muted-foreground">{difficultyAchievements.length} logro{difficultyAchievements.length !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {difficultyAchievements.map(achievement => {
                      if (!achievement || !achievement.achievementId) return null
                      const config = achievementsConfig[achievement.achievementId]
                      const isCompleted = achievement.userAchievement?.isCompleted || false
                      const progress = achievement.userAchievement?.progress || 0
                      const progressPercent = Math.min((progress / (config?.targetValue || 1)) * 100, 100)
                      return (
                        <Card key={achievement.achievementId} className={`p-4 hover:shadow-md transition-shadow relative overflow-hidden ${isCompleted ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' : 'border-border'}`}>
                          {!isCompleted && (
                            <div className="absolute top-0 left-0 right-0 h-3/4 bg-gradient-to-b from-black/60 via-black/40 to-transparent flex items-start justify-center pt-6 rounded-t-lg">
                              <div className="bg-slate-800/95 text-white px-3 py-1 rounded-full font-semibold text-xs shadow-lg">🔒 Bloqueado</div>
                            </div>
                          )}
                          <div className="flex items-start space-x-3">
                            <div className={`text-3xl ${isCompleted ? '' : 'opacity-70'}`}>{config?.icon || '🏆'}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className={`font-semibold text-lg ${isCompleted ? 'text-green-800' : 'text-foreground'}`}>
                                  {config?.name || achievement.achievementId}
                                </h3>
                                {isCompleted && <CheckCircle className="text-green-600" size={24} />}
                              </div>
                              <p className={`text-sm mb-3 ${isCompleted ? 'text-green-700' : 'text-muted-foreground'}`}>
                                {config?.description || 'Descripción no disponible'}
                              </p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className={isCompleted ? 'text-green-700' : 'text-muted-foreground'}>Progreso</span>
                                  <span className={`font-medium ${isCompleted ? 'text-green-800' : 'text-foreground'}`}>{progress}/{config?.targetValue || 1}</span>
                                </div>
                                <Progress value={progressPercent} className={`h-2 ${isCompleted ? 'bg-green-200' : 'bg-slate-200'}`} />
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            {filteredAchievements.length === 0 && (
              <div className="text-center py-12">
                <Trophy size={48} className="mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No se encontraron logros</h3>
                <p className="text-muted-foreground text-sm">Prueba cambiando los filtros para ver más logros</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
