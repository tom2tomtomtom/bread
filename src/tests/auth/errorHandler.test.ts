import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  handleError,
  getErrorMessage,
  shouldRetry,
  getRetryDelay,
  ErrorCategory,
  ErrorSeverity,
} from '../../utils/errorHandler';

describe('Error Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  describe('handleError', () => {
    it('should handle string errors', () => {
      const error = 'Test error message';
      const result = handleError(error);

      expect(result.message).toBe('Test error message');
      expect(result.category).toBe(ErrorCategory.UNKNOWN);
      expect(result.severity).toBe(ErrorSeverity.LOW);
      expect(result.retryable).toBe(true);
      expect(result.id).toMatch(/^err_\d+_[a-z0-9]+$/);
      expect(result.timestamp).toBeTruthy();
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      
      const result = handleError(error);

      expect(result.message).toBe('Test error');
      expect(result.errorType).toBe('Error');
      expect(result.technicalDetails).toBe('Error stack trace');
    });

    it('should categorize authentication errors correctly', () => {
      const error = 'Invalid email or password';
      const result = handleError(error);

      expect(result.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(result.userMessage).toBe('The email or password you entered is incorrect. Please try again.');
      expect(result.retryable).toBe(true);
    });

    it('should categorize rate limit errors correctly', () => {
      const error = 'Rate limit exceeded';
      const result = handleError(error);

      expect(result.category).toBe(ErrorCategory.RATE_LIMIT);
      expect(result.userMessage).toBe('You\'ve made too many requests. Please wait a moment before trying again.');
      expect(result.retryable).toBe(true);
    });

    it('should categorize network errors correctly', () => {
      const error = 'Failed to fetch';
      const result = handleError(error);

      expect(result.category).toBe(ErrorCategory.NETWORK);
      expect(result.userMessage).toBe('Unable to connect to our servers. Please check your internet connection and try again.');
      expect(result.retryable).toBe(true);
    });

    it('should categorize server errors correctly', () => {
      const error = 'Internal server error';
      const result = handleError(error);

      expect(result.category).toBe(ErrorCategory.SERVER);
      expect(result.userMessage).toBe('Something went wrong on our end. We\'re working to fix it. Please try again in a few minutes.');
      expect(result.retryable).toBe(true);
    });

    it('should handle HTTP status codes', () => {
      const error = { status: 401, message: 'Unauthorized' };
      const result = handleError(error);

      expect(result.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(result.userMessage).toBe('Please sign in again to continue.');
    });

    it('should handle retry after information', () => {
      const error = { message: 'Rate limit exceeded', retryAfter: 60 };
      const result = handleError(error);

      expect(result.retryAfter).toBe(60);
      expect(result.category).toBe(ErrorCategory.RATE_LIMIT);
    });

    it('should include context information', () => {
      const error = 'Test error';
      const context = { userId: '123', action: 'login' };
      const requestId = 'req_123';
      
      const result = handleError(error, context, requestId);

      expect(result.context).toEqual(context);
      expect(result.requestId).toBe(requestId);
    });

    it('should determine severity correctly', () => {
      const serverError = handleError('Internal server error');
      expect(serverError.severity).toBe(ErrorSeverity.HIGH);

      const networkError = handleError('Failed to fetch');
      expect(networkError.severity).toBe(ErrorSeverity.MEDIUM);

      const authError = handleError('Invalid token');
      expect(authError.severity).toBe(ErrorSeverity.MEDIUM);

      const validationError = handleError('Validation failed');
      expect(validationError.severity).toBe(ErrorSeverity.LOW);
    });
  });

  describe('getErrorMessage', () => {
    it('should return user message', () => {
      const error = handleError('Invalid email or password');
      const message = getErrorMessage(error);

      expect(message).toBe('The email or password you entered is incorrect. Please try again. Please try again.');
    });

    it('should include retry after information', () => {
      const error = handleError({ message: 'Rate limit exceeded', retryAfter: 120 });
      const message = getErrorMessage(error);

      expect(message).toContain('Please try again in 2 minutes.');
    });

    it('should include retry guidance for retryable errors', () => {
      const error = handleError('Network error');
      const message = getErrorMessage(error);

      expect(message).toContain('Please try again.');
    });
  });

  describe('shouldRetry', () => {
    it('should return true for retryable network errors', () => {
      const error = handleError('Failed to fetch');
      expect(shouldRetry(error, 0)).toBe(true);
      expect(shouldRetry(error, 1)).toBe(true);
      expect(shouldRetry(error, 2)).toBe(true);
    });

    it('should return false after max attempts', () => {
      const error = handleError('Failed to fetch');
      expect(shouldRetry(error, 3)).toBe(false);
    });

    it('should return false for non-retryable errors', () => {
      const error = handleError('User with this email already exists');
      expect(shouldRetry(error, 0)).toBe(false);
    });

    it('should return false for critical server errors', () => {
      const criticalError = {
        ...handleError('Internal server error'),
        severity: ErrorSeverity.CRITICAL,
      };
      expect(shouldRetry(criticalError, 0)).toBe(false);
    });
  });

  describe('getRetryDelay', () => {
    it('should implement exponential backoff', () => {
      expect(getRetryDelay(0, 1000)).toBe(1000);
      expect(getRetryDelay(1, 1000)).toBe(2000);
      expect(getRetryDelay(2, 1000)).toBe(4000);
      expect(getRetryDelay(3, 1000)).toBe(8000);
    });

    it('should cap at maximum delay', () => {
      expect(getRetryDelay(10, 1000)).toBe(30000); // Max 30 seconds
    });

    it('should use default base delay', () => {
      expect(getRetryDelay(0)).toBe(1000); // Default 1 second
    });
  });

  describe('Error Categories', () => {
    it('should have all expected categories', () => {
      expect(ErrorCategory.AUTHENTICATION).toBe('authentication');
      expect(ErrorCategory.AUTHORIZATION).toBe('authorization');
      expect(ErrorCategory.VALIDATION).toBe('validation');
      expect(ErrorCategory.NETWORK).toBe('network');
      expect(ErrorCategory.SERVER).toBe('server');
      expect(ErrorCategory.RATE_LIMIT).toBe('rate_limit');
      expect(ErrorCategory.UNKNOWN).toBe('unknown');
    });
  });

  describe('Error Severity', () => {
    it('should have all expected severity levels', () => {
      expect(ErrorSeverity.LOW).toBe('low');
      expect(ErrorSeverity.MEDIUM).toBe('medium');
      expect(ErrorSeverity.HIGH).toBe('high');
      expect(ErrorSeverity.CRITICAL).toBe('critical');
    });
  });

  describe('Development vs Production', () => {
    it('should log errors in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = vi.spyOn(console, 'error');
      handleError('Test error');

      expect(consoleSpy).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });
});
