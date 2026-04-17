import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider, useTheme } from './context/themeContext';
import { AchievementProvider } from './context/AchievementContext';
import LoginForm from './features/auth/components/LoginForm';
import HomePage from './features/dashboard/components/HomePage';
import MainLayout from './features/dashboard/components/MainLayout';
import TaskPage from './features/tasks/TaskPage';
import ChatBotPage from './features/chatbot/ChatBotPage';
import NotesPage from './features/notes/NotesPage';
import ProfilePage from './features/profile/ProfilePage';
import CalendarPage from './features/calendar/CalendarPage';
import GroupsPage from './features/groups/GroupsPage';
import SettingsPage from './features/settings/SettingsPage';
import StatsPage from './features/stats/StatsPage';
import StudentCoursesPage from './features/courses/StudentCoursesPage';
import StudentCourseDetailPage from './features/courses/StudentCourseDetailPage';
import StudentDiagramsPage from './features/student/StudentDiagramsPage';
import TeacherHomePage from './features/teacher/TeacherHomePage';
import TeacherCoursesPage from './features/teacher/TeacherCoursesPage';
import TeacherCourseDetailPage from './features/teacher/TeacherCourseDetailPage';
import TeacherTasksCreatedPage from './features/teacher/TeacherTasksCreatedPage';
import TeacherReviewSubmissionPage from './features/teacher/TeacherReviewSubmissionPage';
import TeacherStatsPage from './features/teacher/TeacherStatsPage';
import TeacherDiagramsPage from './features/teacher/TeacherDiagramsPage';
import TeacherReviewsPage from './features/teacher/TeacherReviewsPage';
import TeacherEditTaskPage from './features/teacher/TeacherEditTaskPage';
import TeacherCalendarPage from './features/teacher/TeacherCalendarPage';
import AchievementsPage from './features/achievements/AchievementsPage';
import NotificationsPage from './features/notifications/NotificationsPage';
import Loading from './ui/loading';
import { Toaster } from 'sonner';
import AchievementNotification from './components/shared/AchievementNotification';
import { useAchievementNotifications } from './hooks/useAchievementNotifications';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // En desarrollo, permite navegar sin autenticación para validar estilos/UX
  if (import.meta.env.MODE !== 'production') {
    return children;
  }

  if (loading) {
    return <Loading message="Cargando..." />;
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

// Teacher Route component
const TeacherRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading message="Verificando permisos..." />;
  }

  const isTeacher = user?.user_metadata?.role === 'teacher' || user?.email === 'teacher@gmail.com';

  return isTeacher ? children : <Navigate to="/home" />;
};

function AppContent() {
  const { fontSize } = useTheme();
  const { currentNotification, closeNotification } = useAchievementNotifications();

  return (
    <Router>
      <div className={`App text-primary font-${fontSize}`}>
        <Toaster richColors position="top-right" />

        {/* Achievement Notification */}
        {currentNotification && (
          <AchievementNotification
            achievementId={currentNotification}
            onClose={closeNotification}
          />
        )}

        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <HomePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <StudentCoursesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <StudentCourseDetailPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TaskPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ChatBotPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <NotesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProfilePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CalendarPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <GroupsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <StatsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AchievementsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SettingsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <NotificationsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/diagrams"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <StudentDiagramsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          {/* Rutas docente */}
          <Route
            path="/teacher/home"
            element={
              <ProtectedRoute>
                <TeacherRoute>
                  <MainLayout>
                    <TeacherHomePage />
                  </MainLayout>
                </TeacherRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/courses"
            element={
              <ProtectedRoute>
                <TeacherRoute>
                  <MainLayout>
                    <TeacherCoursesPage />
                  </MainLayout>
                </TeacherRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/courses/:id"
            element={
              <ProtectedRoute>
                <TeacherRoute>
                  <MainLayout>
                    <TeacherCourseDetailPage />
                  </MainLayout>
                </TeacherRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/tasks/:id/edit"
            element={
              <ProtectedRoute>
                <TeacherRoute>
                  <MainLayout>
                    <TeacherEditTaskPage />
                  </MainLayout>
                </TeacherRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/tasks"
            element={
              <ProtectedRoute>
                <TeacherRoute>
                  <MainLayout>
                    <TeacherTasksCreatedPage />
                  </MainLayout>
                </TeacherRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/reviews/:studentId"
            element={
              <ProtectedRoute>
                <TeacherRoute>
                  <MainLayout>
                    <TeacherReviewsPage />
                  </MainLayout>
                </TeacherRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/stats"
            element={
              <ProtectedRoute>
                <TeacherRoute>
                  <MainLayout>
                    <TeacherStatsPage />
                  </MainLayout>
                </TeacherRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/diagrams"
            element={
              <ProtectedRoute>
                <TeacherRoute>
                  <MainLayout>
                    <TeacherDiagramsPage />
                  </MainLayout>
                </TeacherRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/calendar"
            element={
              <ProtectedRoute>
                <TeacherRoute>
                  <MainLayout>
                    <TeacherCalendarPage />
                  </MainLayout>
                </TeacherRoute>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AchievementProvider>
          <AppContent />
        </AchievementProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
