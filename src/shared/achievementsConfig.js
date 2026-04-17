// Configuración de logros - compartida entre frontend y backend
export const achievements = {
  // LOGROS FÁCILES
  "first_task": {
    name: "Primer Paso",
    description: "Completaste tu primera tarea",
    icon: "🎯",
    difficulty: "easy",
    targetValue: 1,
    type: "completed_tasks",
    color: "#4CAF50"
  },
  "prioritario": {
    name: "Prioritario",
    description: "Creaste tu primera tarea de prioridad alta",
    icon: "⭐",
    difficulty: "easy",
    targetValue: 1,
    type: "high_priority_tasks",
    color: "#4CAF50"
  },
  "subdivisor": {
    name: "Subdivisor",
    description: "Creaste tu primera subtarea",
    icon: "📝",
    difficulty: "easy",
    targetValue: 1,
    type: "subtasks_created",
    color: "#4CAF50"
  },
  "explorador": {
    name: "Explorador",
    description: "Creaste 5 tareas diferentes",
    icon: "🗺️",
    difficulty: "easy",
    targetValue: 5,
    type: "tasks_created",
    color: "#4CAF50"
  },

  // LOGROS MEDIOS
  "productivo": {
    name: "Productivo",
    description: "Completaste 25 tareas totales",
    icon: "⚡",
    difficulty: "medium",
    targetValue: 25,
    type: "completed_tasks",
    color: "#FF9800"
  },
  "consistente": {
    name: "Consistente",
    description: "Mantuviste una racha de 3 días",
    icon: "🔥",
    difficulty: "medium",
    targetValue: 3,
    type: "streak",
    color: "#FF9800"
  },
  "tempranero": {
    name: "Tempranero",
    description: "Completaste 3 tareas antes de las 9 AM",
    icon: "🌅",
    difficulty: "medium",
    targetValue: 3,
    type: "early_tasks",
    color: "#FF9800"
  },
  "multitarea": {
    name: "Multitarea",
    description: "Completaste 5 subtareas en una tarea padre",
    icon: "🎪",
    difficulty: "medium",
    targetValue: 5,
    type: "subtasks_completed",
    color: "#FF9800"
  },

  // LOGROS DIFÍCILES
  "maraton": {
    name: "Maratón",
    description: "Completaste 100 tareas totales",
    icon: "🏃",
    difficulty: "hard",
    targetValue: 100,
    type: "completed_tasks",
    color: "#F44336"
  },
  "leyenda": {
    name: "Leyenda",
    description: "Mantuviste una racha de 30 días",
    icon: "👑",
    difficulty: "hard",
    targetValue: 30,
    type: "streak",
    color: "#F44336"
  },
  "velocista": {
    name: "Velocista",
    description: "Completaste 10 tareas en un día",
    icon: "💨",
    difficulty: "hard",
    targetValue: 10,
    type: "tasks_in_day",
    color: "#F44336"
  },
  "perfeccionista": {
    name: "Perfeccionista",
    description: "Completaste 50 tareas sin subtareas",
    icon: "🎯",
    difficulty: "hard",
    targetValue: 50,
    type: "solo_tasks",
    color: "#F44336"
  },

  // LOGROS ESPECIALES
  "dominguero": {
    name: "Dominguero",
    description: "Completaste 5 tareas en domingo",
    icon: "⛱️",
    difficulty: "special",
    targetValue: 5,
    type: "sunday_tasks",
    color: "#9C27B0"
  },
  "maestro": {
    name: "Maestro",
    description: "Completaste 500 tareas totales",
    icon: "🎓",
    difficulty: "special",
    targetValue: 500,
    type: "completed_tasks",
    color: "#9C27B0"
  },

  // LOGROS ÉPICOS
  "inmortal": {
    name: "Inmortal",
    description: "Mantuviste una racha de 100 días",
    icon: "⚡",
    difficulty: "epic",
    targetValue: 100,
    type: "streak",
    color: "#673AB7"
  },
  "titan": {
    name: "Titán",
    description: "Completaste 1000 tareas totales",
    icon: "🏔️",
    difficulty: "epic",
    targetValue: 1000,
    type: "completed_tasks",
    color: "#673AB7"
  },
  "dios_productividad": {
    name: "Dios de la Productividad",
    description: "Completaste 5000 tareas totales",
    icon: "👑",
    difficulty: "epic",
    targetValue: 5000,
    type: "completed_tasks",
    color: "#673AB7"
  }
};

export const difficultyOrder = ['easy', 'medium', 'hard', 'special', 'epic'];
export const difficultyLabels = {
  easy: 'Fácil',
  medium: 'Medio',
  hard: 'Difícil',
  special: 'Especial',
  epic: 'Épico'
};

export const difficultyColors = {
  easy: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-orange-100 text-orange-800 border-orange-200',
  hard: 'bg-red-100 text-red-800 border-red-200',
  special: 'bg-purple-100 text-purple-800 border-purple-200',
  epic: 'bg-indigo-100 text-indigo-800 border-indigo-200'
};