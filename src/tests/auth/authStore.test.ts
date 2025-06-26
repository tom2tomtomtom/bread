import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAuthStore } from '../../stores';
import { handleError, ErrorCategory } from '../../utils/errorHandler';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      tokens: null,
      isLoading: false,
      error: null,
      enhancedError: null,
      usageStats: null,
    });

    // Clear all mocks
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.tokens).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.enhancedError).toBeNull();
      expect(state.usageStats).toBeNull();
    });
  });

  describe('Login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        plan: 'pro',
        createdAt: '2024-01-01T00:00:00Z',
      };

      const mockTokens = {
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            user: mockUser,
            token: mockTokens.token,
            refreshToken: mockTokens.refreshToken,
          },
        }),
      });

      const { login } = useAuthStore.getState();
      
      await login({ email: 'test@example.com', password: 'password123' });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.tokens).toEqual(mockTokens);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle login failure with enhanced error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Invalid email or password',
        }),
      });

      const { login } = useAuthStore.getState();
      
      try {
        await login({ email: 'test@example.com', password: 'wrongpassword' });
      } catch (error) {
        // Expected to throw
      }

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.tokens).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeTruthy();
      expect(state.enhancedError).toBeTruthy();
      expect(state.enhancedError?.category).toBe(ErrorCategory.AUTHENTICATION);
    });

    it('should use mock authentication in development when backend unavailable', async () => {
      // Mock environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Mock fetch to fail (simulating no backend)
      mockFetch.mockRejectedValueOnce(new Error('Backend not available'));

      const { login } = useAuthStore.getState();
      
      await login({ email: 'test@example.com', password: 'password123' });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.email).toBe('test@example.com');
      expect(state.user?.name).toBe('Development User');
      expect(state.user?.plan).toBe('pro');
      expect(state.tokens?.token).toBe('dev-access-token');

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should set loading state during login', async () => {
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise(resolve => {
        resolveLogin = resolve;
      });

      mockFetch.mockReturnValueOnce(loginPromise);

      const { login } = useAuthStore.getState();
      
      // Start login
      const loginCall = login({ email: 'test@example.com', password: 'password123' });

      // Check loading state
      expect(useAuthStore.getState().isLoading).toBe(true);

      // Resolve login
      resolveLogin!({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            user: { id: '1', email: 'test@example.com', name: 'Test', plan: 'free', createdAt: '2024-01-01' },
            token: 'token',
            refreshToken: 'refresh',
          },
        }),
      });

      await loginCall;

      // Check loading state is cleared
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('Register', () => {
    it('should successfully register new user', async () => {
      const mockUser = {
        id: 'user123',
        email: 'newuser@example.com',
        name: 'New User',
        plan: 'free',
        createdAt: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            user: mockUser,
            token: 'mock-jwt-token',
            refreshToken: 'mock-refresh-token',
          },
        }),
      });

      const { register } = useAuthStore.getState();
      
      await register({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
    });

    it('should handle registration failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'User with this email already exists',
        }),
      });

      const { register } = useAuthStore.getState();
      
      try {
        await register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Test User',
        });
      } catch (error) {
        // Expected to throw
      }

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeTruthy();
    });
  });

  describe('Logout', () => {
    it('should clear authentication state on logout', () => {
      // Set authenticated state
      useAuthStore.setState({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', name: 'Test', plan: 'free', createdAt: '2024-01-01' },
        tokens: { token: 'token', refreshToken: 'refresh' },
      });

      const { logout } = useAuthStore.getState();
      logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.tokens).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should clear errors when clearError is called', () => {
      useAuthStore.setState({
        error: 'Test error',
        enhancedError: {
          id: 'err1',
          category: ErrorCategory.AUTHENTICATION,
          severity: 'medium' as const,
          message: 'Test error',
          userMessage: 'Test error message',
          timestamp: '2024-01-01T00:00:00Z',
          retryable: true,
        },
      });

      const { clearError } = useAuthStore.getState();
      clearError();

      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
      expect(state.enhancedError).toBeNull();
    });

    it('should set enhanced error correctly', () => {
      const testError = {
        id: 'err1',
        category: ErrorCategory.NETWORK,
        severity: 'high' as const,
        message: 'Network error',
        userMessage: 'Connection failed',
        timestamp: '2024-01-01T00:00:00Z',
        retryable: true,
      };

      const { setEnhancedError } = useAuthStore.getState();
      setEnhancedError(testError);

      const state = useAuthStore.getState();
      expect(state.enhancedError).toEqual(testError);
      expect(state.error).toBe('Connection failed');
    });
  });

  describe('Token Management', () => {
    it('should return auth token when available', () => {
      const tokens = { token: 'test-token', refreshToken: 'test-refresh' };
      useAuthStore.setState({ tokens });

      const { getAuthToken } = useAuthStore.getState();
      expect(getAuthToken()).toBe('test-token');
    });

    it('should return null when no token available', () => {
      useAuthStore.setState({ tokens: null });

      const { getAuthToken } = useAuthStore.getState();
      expect(getAuthToken()).toBeNull();
    });

    it('should set tokens correctly', () => {
      const tokens = { token: 'new-token', refreshToken: 'new-refresh' };
      
      const { setTokens } = useAuthStore.getState();
      setTokens(tokens);

      const state = useAuthStore.getState();
      expect(state.tokens).toEqual(tokens);
    });

    it('should clear tokens correctly', () => {
      useAuthStore.setState({
        tokens: { token: 'token', refreshToken: 'refresh' },
      });

      const { clearTokens } = useAuthStore.getState();
      clearTokens();

      const state = useAuthStore.getState();
      expect(state.tokens).toBeNull();
    });
  });
});
