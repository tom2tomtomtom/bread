import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { APP_CONFIG } from '../config/app';

// Types for authentication
export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  lastLogin?: string;
  createdAt: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface UsageStats {
  totalRequests: number;
  monthlyRequests: number;
  lastResetDate: string;
  limit: number;
}

interface AuthState {
  // Authentication state
  isAuthenticated: boolean;
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
  
  // Usage tracking
  usageStats: UsageStats | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  getUsageStats: () => Promise<void>;
  clearError: () => void;
  
  // Token management
  getAuthToken: () => string | null;
  setTokens: (tokens: AuthTokens) => void;
  clearTokens: () => void;
}

// API base URL helper
const getApiBaseUrl = (): string => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8888/.netlify/functions';
  }
  return '/.netlify/functions';
};

// API response interface
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      tokens: null,
      isLoading: false,
      error: null,
      usageStats: null,

      // Login action
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${getApiBaseUrl()}/auth-login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          const result: ApiResponse = await response.json();

          if (!result.success) {
            throw new Error(result.error || 'Login failed');
          }

          const { user, token, refreshToken } = result.data;
          const tokens = { token, refreshToken };

          set({
            isAuthenticated: true,
            user,
            tokens,
            isLoading: false,
            error: null,
          });

          // Fetch usage stats after successful login
          get().getUsageStats();

        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Login failed',
            isAuthenticated: false,
            user: null,
            tokens: null,
          });
          throw error;
        }
      },

      // Register action
      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${getApiBaseUrl()}/auth-register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          const result: ApiResponse = await response.json();

          if (!result.success) {
            throw new Error(result.error || 'Registration failed');
          }

          const { user, token, refreshToken } = result.data;
          const tokens = { token, refreshToken };

          set({
            isAuthenticated: true,
            user,
            tokens,
            isLoading: false,
            error: null,
          });

          // Fetch usage stats after successful registration
          get().getUsageStats();

        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Registration failed',
            isAuthenticated: false,
            user: null,
            tokens: null,
          });
          throw error;
        }
      },

      // Logout action
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          tokens: null,
          usageStats: null,
          error: null,
        });
      },

      // Refresh token action
      refreshToken: async () => {
        const { tokens } = get();
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await fetch(`${getApiBaseUrl()}/auth-refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken: tokens.refreshToken }),
          });

          const result: ApiResponse = await response.json();

          if (!result.success) {
            throw new Error(result.error || 'Token refresh failed');
          }

          const { token, refreshToken, user } = result.data;
          const newTokens = { token, refreshToken };

          set({
            tokens: newTokens,
            user,
          });

        } catch (error: any) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      // Get current user action
      getCurrentUser: async () => {
        const token = get().getAuthToken();
        if (!token) {
          throw new Error('No authentication token');
        }

        try {
          const response = await fetch(`${getApiBaseUrl()}/auth-me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const result: ApiResponse = await response.json();

          if (!result.success) {
            throw new Error(result.error || 'Failed to get user data');
          }

          set({ user: result.data });

        } catch (error: any) {
          // If getting user fails, try to refresh token
          try {
            await get().refreshToken();
            // Retry getting user after refresh
            await get().getCurrentUser();
          } catch (refreshError) {
            get().logout();
            throw error;
          }
        }
      },

      // Get usage stats action
      getUsageStats: async () => {
        const token = get().getAuthToken();
        if (!token) {
          return;
        }

        try {
          const response = await fetch(`${getApiBaseUrl()}/usage-stats`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const result: ApiResponse = await response.json();

          if (result.success) {
            set({ usageStats: result.data });
          }

        } catch (error) {
          // Silently fail for usage stats - not critical
          console.warn('Failed to fetch usage stats:', error);
        }
      },

      // Clear error action
      clearError: () => {
        set({ error: null });
      },

      // Get auth token helper
      getAuthToken: () => {
        const { tokens } = get();
        return tokens?.token || null;
      },

      // Set tokens helper
      setTokens: (tokens: AuthTokens) => {
        set({ tokens });
      },

      // Clear tokens helper
      clearTokens: () => {
        set({ tokens: null });
      },
    }),
    {
      name: `${APP_CONFIG.storage.keys.appState}-auth`,
      partialize: (state) => ({
        // Only persist authentication data
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        tokens: state.tokens,
      }),
    }
  )
);
