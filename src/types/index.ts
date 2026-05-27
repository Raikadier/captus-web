/**
 * Central type definitions for Captus Web.
 *
 * Migration strategy: JS files use JSDoc @type references; new files
 * are written in TypeScript. `tsconfig.json` has allowJs + checkJs:false
 * so existing JS files compile without modification.
 *
 * Promote to strict: change checkJs → true and fix errors incrementally.
 */

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    role?: UserRole;
    avatar_url?: string;
  };
  app_metadata?: {
    role?: UserRole;
  };
}

export type UserRole = 'student' | 'teacher' | 'admin' | 'superadmin';

// ─── Tasks ───────────────────────────────────────────────────────────────────

export interface Task {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null;           // ISO date string YYYY-MM-DD
  completed: boolean;
  user_id: string;
  category_id: number | null;
  priority_id: number | null;
  created_at: string;
  updated_at: string;
  /** Joined from categories table when requested */
  category?: Category;
  /** Joined from priorities table when requested */
  priority?: Priority;
}

export interface TaskFilter {
  categoryId?: number | string;
  priorityId?: number | string;
  completed?: boolean | string;
  searchText?: string;
}

export interface SubTask {
  id: number;
  title: string;
  completed: boolean;
  parent_task_id: number;
  user_id: string;
  created_at: string;
}

// ─── Reference Data ──────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  color?: string;
  user_id?: string;
}

export interface Priority {
  id: number;
  name: string;          // 'Alta' | 'Media' | 'Baja'
  level?: number;
}

// ─── Calendar Events ─────────────────────────────────────────────────────────

export type EventType = 'Reunión' | 'Examen' | 'Entrega' | 'Clase';

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string | null;
  start_time: string;    // ISO datetime
  end_time: string;      // ISO datetime
  event_type: EventType;
  user_id: string;
  created_at: string;
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export interface Note {
  id: number;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export interface Course {
  id: number | string;
  name: string;
  description?: string | null;
  teacher_id?: string;
  code?: string;
  color?: string;
  created_at?: string;
}

// ─── Statistics ──────────────────────────────────────────────────────────────

export interface UserStats {
  totalTasksCompleted: number;
  currentStreak: number;
  bestStreak: number;
  tasksCompletedThisWeek: number;
  tasksCompletedToday: number;
  dailyGoal: number;
  totalNotes: number;
  totalEvents: number;
}

// ─── Achievements ────────────────────────────────────────────────────────────

export type AchievementDifficulty = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: AchievementDifficulty;
  requiredCount: number;
  type: string;
}

export interface UserAchievement {
  definitionId: string;
  isCompleted: boolean;
  currentCount: number;
  unlockedAt?: string | null;
  definition: AchievementDefinition;
}

// ─── API Helpers ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  total?: number;
  page?: number;
  limit?: number;
}
