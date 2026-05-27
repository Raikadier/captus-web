import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider, useTheme } from './context/themeContext';
import { AchievementProvider } from './context/AchievementContext';
import Loading from './ui/loading';
import { Toaster } from 'sonner';
import AchievementNotification from './components/shared/AchievementNotification';
import { useAchievementNotifications } from './hooks/useAchievementNotifications';
// Layouts are always needed once authenticated — keep eager
import MainLayout from './features/dashboard/components/MainLayout';
import AdminLayout from './features/admin/components/AdminLayout';

// ─── Route-level code splitting ───────────────────────────────────────────────
// Student pages
const LoginForm             = lazy(() => import('./features/auth/components/LoginForm'));
const HomePage              = lazy(() => import('./features/dashboard/components/HomePage'));
const TaskPage              = lazy(() => import('./features/tasks/TaskPage'));
const CalendarPage          = lazy(() => import('./features/calendar/CalendarPage'));
const NotesPage             = lazy(() => import('./features/notes/NotesPage'));
const ProfilePage           = lazy(() => import('./features/profile/ProfilePage'));
const GroupsPage            = lazy(() => import('./features/groups/GroupsPage'));
const StatsPage             = lazy(() => import('./features/stats/StatsPage'));
const SettingsPage          = lazy(() => import('./features/settings/SettingsPage'));
const AchievementsPage      = lazy(() => import('./features/achievements/AchievementsPage'));
const NotificationsPage     = lazy(() => import('./features/notifications/NotificationsPage'));
const StudentCoursesPage    = lazy(() => import('./features/courses/StudentCoursesPage'));
const StudentCourseDetailPage = lazy(() => import('./features/courses/StudentCourseDetailPage'));
const StudentDiagramsPage   = lazy(() => import('./features/student/StudentDiagramsPage'));
const ChatBotPage           = lazy(() => import('./features/chatbot/ChatBotPage'));
// Teacher pages
const TeacherHomePage             = lazy(() => import('./features/teacher/TeacherHomePage'));
const TeacherCoursesPage          = lazy(() => import('./features/teacher/TeacherCoursesPage'));
const TeacherCourseDetailPage     = lazy(() => import('./features/teacher/TeacherCourseDetailPage'));
const TeacherTasksCreatedPage     = lazy(() => import('./features/teacher/TeacherTasksCreatedPage'));
const TeacherReviewSubmissionPage = lazy(() => import('./features/teacher/TeacherReviewSubmissionPage'));
const TeacherStatsPage            = lazy(() => import('./features/teacher/TeacherStatsPage'));
const TeacherDiagramsPage         = lazy(() => import('./features/teacher/TeacherDiagramsPage'));
const TeacherReviewsPage          = lazy(() => import('./features/teacher/TeacherReviewsPage'));
const TeacherEditTaskPage         = lazy(() => import('./features/teacher/TeacherEditTaskPage'));
const TeacherCalendarPage         = lazy(() => import('./features/teacher/TeacherCalendarPage'));
// Admin pages
const AdminDashboardPage  = lazy(() => import('./features/admin/pages/AdminDashboardPage'));
const AdminUsersPage      = lazy(() => import('./features/admin/pages/AdminUsersPage'));
const AdminCoursesPage    = lazy(() => import('./features/admin/pages/AdminCoursesPage'));
const AdminGradingPage    = lazy(() => import('./features/admin/pages/AdminGradingPage'));
const AdminPeriodsPage    = lazy(() => import('./features/admin/pages/AdminPeriodsPage'));
const AdminReportsPage    = lazy(() => import('./features/admin/pages/AdminReportsPage'));
const AdminInstitutionPage = lazy(() => import('./features/admin/pages/AdminInstitutionPage'));

// ─── TanStack QueryClient ─────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ─── Route guards ─────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // En desarrollo, permite navegar sin autenticación para validar estilos/UX
  if (import.meta.env.MODE !== 'production') return children;
  if (loading) return <Loading message="Cargando..." />;
  return isAuthenticated ? children : <Navigate to="/" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loading message="Verificando permisos..." />;
  const role = user?.user_metadata?.role || user?.app_metadata?.role;
  return role === 'admin' ? children : <Navigate to="/home" />;
};

const TeacherRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loading message="Verificando permisos..." />;
  return user?.user_metadata?.role === 'teacher' ? children : <Navigate to="/home" />;
};

// ─── App shell ────────────────────────────────────────────────────────────────
function AppContent() {
  const { fontSize } = useTheme();
  const { currentNotification, closeNotification } = useAchievementNotifications();

  return (
    <Router>
      <div className={`App text-primary font-${fontSize}`}>
        <Toaster richColors position="top-right" />

        {currentNotification && (
          <AchievementNotification achievementId={currentNotification} onClose={closeNotification} />
        )}

        <Suspense fallback={<Loading message="Cargando página..." />}>
          <Routes>
            <Route path="/" element={<LoginForm />} />

            {/* ── Student ── */}
            <Route path="/home"         element={<ProtectedRoute><MainLayout><HomePage /></MainLayout></ProtectedRoute>} />
            <Route path="/courses"      element={<ProtectedRoute><MainLayout><StudentCoursesPage /></MainLayout></ProtectedRoute>} />
            <Route path="/courses/:id"  element={<ProtectedRoute><MainLayout><StudentCourseDetailPage /></MainLayout></ProtectedRoute>} />
            <Route path="/tasks"        element={<ProtectedRoute><MainLayout><TaskPage /></MainLayout></ProtectedRoute>} />
            <Route path="/chatbot"      element={<ProtectedRoute><MainLayout><ChatBotPage /></MainLayout></ProtectedRoute>} />
            <Route path="/notes"        element={<ProtectedRoute><MainLayout><NotesPage /></MainLayout></ProtectedRoute>} />
            <Route path="/profile"      element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
            <Route path="/calendar"     element={<ProtectedRoute><MainLayout><CalendarPage /></MainLayout></ProtectedRoute>} />
            <Route path="/groups"       element={<ProtectedRoute><MainLayout><GroupsPage /></MainLayout></ProtectedRoute>} />
            <Route path="/stats"        element={<ProtectedRoute><MainLayout><StatsPage /></MainLayout></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><MainLayout><AchievementsPage /></MainLayout></ProtectedRoute>} />
            <Route path="/settings"     element={<ProtectedRoute><MainLayout><SettingsPage /></MainLayout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><MainLayout><NotificationsPage /></MainLayout></ProtectedRoute>} />
            <Route path="/diagrams"     element={<ProtectedRoute><MainLayout><StudentDiagramsPage /></MainLayout></ProtectedRoute>} />

            {/* ── Teacher ── */}
            <Route path="/teacher/home"               element={<ProtectedRoute><TeacherRoute><MainLayout><TeacherHomePage /></MainLayout></TeacherRoute></ProtectedRoute>} />
            <Route path="/teacher/courses"            element={<ProtectedRoute><TeacherRoute><MainLayout><TeacherCoursesPage /></MainLayout></TeacherRoute></ProtectedRoute>} />
            <Route path="/teacher/courses/:id"        element={<ProtectedRoute><TeacherRoute><MainLayout><TeacherCourseDetailPage /></MainLayout></TeacherRoute></ProtectedRoute>} />
            <Route path="/teacher/tasks/:id/edit"     element={<ProtectedRoute><TeacherRoute><MainLayout><TeacherEditTaskPage /></MainLayout></TeacherRoute></ProtectedRoute>} />
            <Route path="/teacher/tasks"              element={<ProtectedRoute><TeacherRoute><MainLayout><TeacherTasksCreatedPage /></MainLayout></TeacherRoute></ProtectedRoute>} />
            <Route path="/teacher/reviews/:studentId" element={<ProtectedRoute><TeacherRoute><MainLayout><TeacherReviewsPage /></MainLayout></TeacherRoute></ProtectedRoute>} />
            <Route path="/teacher/stats"              element={<ProtectedRoute><TeacherRoute><MainLayout><TeacherStatsPage /></MainLayout></TeacherRoute></ProtectedRoute>} />
            <Route path="/teacher/diagrams"           element={<ProtectedRoute><TeacherRoute><MainLayout><TeacherDiagramsPage /></MainLayout></TeacherRoute></ProtectedRoute>} />
            <Route path="/teacher/calendar"           element={<ProtectedRoute><TeacherRoute><MainLayout><TeacherCalendarPage /></MainLayout></TeacherRoute></ProtectedRoute>} />

            {/* ── Admin ── */}
            <Route path="/admin"              element={<ProtectedRoute><AdminRoute><AdminLayout><AdminDashboardPage /></AdminLayout></AdminRoute></ProtectedRoute>} />
            <Route path="/admin/users"        element={<ProtectedRoute><AdminRoute><AdminLayout><AdminUsersPage /></AdminLayout></AdminRoute></ProtectedRoute>} />
            <Route path="/admin/courses"      element={<ProtectedRoute><AdminRoute><AdminLayout><AdminCoursesPage /></AdminLayout></AdminRoute></ProtectedRoute>} />
            <Route path="/admin/grading"      element={<ProtectedRoute><AdminRoute><AdminLayout><AdminGradingPage /></AdminLayout></AdminRoute></ProtectedRoute>} />
            <Route path="/admin/periods"      element={<ProtectedRoute><AdminRoute><AdminLayout><AdminPeriodsPage /></AdminLayout></AdminRoute></ProtectedRoute>} />
            <Route path="/admin/reports"      element={<ProtectedRoute><AdminRoute><AdminLayout><AdminReportsPage /></AdminLayout></AdminRoute></ProtectedRoute>} />
            <Route path="/admin/institution"  element={<ProtectedRoute><AdminRoute><AdminLayout><AdminInstitutionPage /></AdminLayout></AdminRoute></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <AchievementProvider>
            <AppContent />
          </AchievementProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
