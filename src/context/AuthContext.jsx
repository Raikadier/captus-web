import React, { useEffect, useState } from 'react';
import { supabase } from '../shared/api/supabase';
import apiClient from '../shared/api/client';
import { validatePassword } from '../lib/passwordValidator';
import { AuthContext } from './contextDefinitions';

// useAuth hook moved to ../hooks/useAuth.js to fix HMR warnings

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session/user on app start and subscribe to auth changes
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Check for existing session
        const { data: sessionData } = await supabase.auth.getSession();

        if (!mounted) return;

        if (sessionData?.session?.user) {
          setSession(sessionData.session);
          setUser(sessionData.session.user);
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);

        // Handle invalid refresh token by forcing sign out
        if (error.message && (error.message.includes('Invalid Refresh Token') || error.message.includes('Refresh Token Not Found'))) {
          console.warn('Invalid refresh token detected. Clearing session.');
          await supabase.auth.signOut();
        }

        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Handle token refresh failure
      if (event === 'TOKEN_REFRESH_FAILED') {
        console.warn('Token refresh failed. Signing out.');
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        return;
      }

      setSession(session);
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Sync user to backend (ensures public.users has the latest role/info)
      try {
        await apiClient.post('/users/sync');
      } catch (syncError) {
        console.error('Backend sync failed:', syncError);
        // We don't block login if sync fails, but we log it
      }

      // Manually update state to avoid race conditions with ProtectedRoute
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
      }

      return { success: true, data };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (email, password, name, role = 'student') => {
    try {
      const passwordCheck = validatePassword(password);
      if (!passwordCheck.valid) {
        return { success: false, error: passwordCheck.error };
      }

      // First check if email is already registered in our users table
      try {
        // Using apiClient to check email existence (needs to be safe for unauthenticated calls if it's a public endpoint, or we handle the error)
        // Assuming /users/check-email is public or handles missing auth gracefully if needed.
        // But apiClient adds token if available. During registration, we might not have a token yet.
        // If we don't have a token, apiClient just doesn't add the header, which is fine for public endpoints.
        const response = await apiClient.post('/users/check-email', { email });

        if (response.data && response.data.registered) {
          return { success: false, error: 'Este email ya está registrado' };
        }
      } catch (checkError) {
        // If check fails (e.g. 404 or 500), we proceed with registration attempt or handle specific errors.
        console.warn('Could not check email registration:', checkError);
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: role,
            display_name: name,
            full_name: name
          }
        }
      });

      if (error) {
        if (error.message && (
          error.message.includes('already registered') ||
          error.message.includes('already been registered') ||
          error.message.includes('User already registered')
        )) {
          return { success: false, error: 'Este email ya está registrado' };
        }
        throw error;
      }

      if (data.session) {
        try {
          await apiClient.post('/users/sync');
        } catch (syncError) {
          console.error('Backend sync failed during registration:', syncError);
        }
      }

      const requiresEmailConfirmation = !data.session;

      return { success: true, requiresEmailConfirmation };
    } catch (err) {
      console.error('Registration error:', err);

      if (err.message && (
        err.message.includes('already registered') ||
        err.message.includes('already been registered') ||
        err.message.includes('User already registered')
      )) {
        return { success: false, error: 'Este email ya está registrado' };
      }

      if (err.message?.includes('Error sending confirmation email')) {
        return {
          success: false,
          error: 'No se pudo enviar el correo de verificación. Revisa la configuración SMTP en Supabase o inténtalo más tarde.',
        };
      }

      return { success: false, error: err.message || 'Error en el registro' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const redirectToTasks = () => {
    // This can be used by consumers to redirect after login
    // In a real app, you might use useNavigate() from react-router-dom
    // but since this context is often above Router or needs a hard redirect:
    window.location.href = '/tasks';
  };

  const value = {
    session,
    user,
    loading,
    isAuthenticated: !!user,
    getToken,
    login,
    register,
    logout,
    redirectToTasks,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
