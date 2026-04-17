// API client for making HTTP requests to the backend
import axios from 'axios';
import { supabase } from './supabase';

const getBaseUrl = () => {
  // During development, we use a relative path to leverage Vite's proxy.
  // VITE_API_BASE_URL can be used to override this for production or other environments.
  return import.meta.env.VITE_API_BASE_URL || '/api';
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000, // Increased to 30s for statistics queries
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching session token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.warn('Unauthorized access. Redirecting to login...');
      // Optional: Dispatch a custom event or use a callback if we had access to the router/context here
      // But window.location is a safe fallback for hard redirects
      if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
         window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
