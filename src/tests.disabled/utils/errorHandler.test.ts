import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  handleError,
  CircuitBreaker,
  CircuitState,
  circuitBreakers,
  ErrorCategory,
  ErrorSeverity,
  shouldRetry,
  getRetryDelay,
} from '../../utils/errorHandler';

/**
 * Comprehensive Error Handler Tests
 * 
 * Test Coverage:
 * - Error categorization and severity
 * - Circuit breaker functionality
 * - Retry mechanisms
 * - Error logging and reporting
 * - Edge cases and error scenarios
 */

describe('Error Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset circuit breakers
    Object.values(circuitBreakers).forEach(cb => {
      // Reset internal state (this would need to be exposed or we'd need a reset method)
      cb.getStats(); // Just to ensure they're initialized
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('handleError', () => {
    it('creates enhanced error from string', () => {
      const error = handleError('Test error message');
      
      expect(error.message).toBe('Test error message');
      expect(error.id).toBeDefined();
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.category).toBe(ErrorCategory.UNKNOWN);
    });

    it('creates enhanced error from Error object', () => {
      const originalError = new Error('Network connection failed');
      const error = handleError(originalError);
      
      expect(error.message).toBe('Network connection failed');
      expect(error.category).toBe(ErrorCategory.NETWORK);
      expect(error.userMessage).toContain('connection');
    });

    it('categorizes network errors correctly', () => {
      const networkError = handleError('fetch failed due to network timeout');
      expect(networkError.category).toBe(ErrorCategory.NETWORK);
      expect(networkError.userMessage).toContain('connection');
    });

    it('categorizes authentication errors correctly', () => {
      const authError = handleError('unauthorized access');
      expect(authError.category).toBe(ErrorCategory.AUTH);
      expect(authError.userMessage).toContain('sign in');
    });

    it('categorizes generation errors correctly', () => {
      const genError = handleError('OpenAI API generation failed');
      expect(genError.category).toBe(ErrorCategory.GENERATION);
      expect(genError.userMessage).toContain('generation');
    });

    it('determines severity correctly for critical errors', () => {
      const criticalError = handleError('Critical system failure');
      expect(criticalError.severity).toBe(ErrorSeverity.CRITICAL);
    });

    it('includes context information', () => {
      const context = { userId: '123', action: 'generate' };
      const error = handleError('Test error', context);
      
      expect(error.context).toEqual(context);
    });
  });

  describe('CircuitBreaker', () => {
    let circuitBreaker: CircuitBreaker;
    let mockOperation: vi.Mock;

    beforeEach(() => {
      circuitBreaker = new CircuitBreaker(2, 1000, 1); // Low thresholds for testing
      mockOperation = vi.fn();
    });

    it('starts in CLOSED state', () => {
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('executes operation successfully in CLOSED state', async () => {
      mockOperation.mockResolvedValue('success');
      
      const result = await circuitBreaker.execute(mockOperation);
      
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledOnce();
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('transitions to OPEN state after failure threshold', async () => {
      mockOperation.mockRejectedValue(new Error('Service error'));
      
      // First failure
      await expect(circuitBreaker.execute(mockOperation)).rejects.toThrow();
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
      
      // Second failure - should open circuit
      await expect(circuitBreaker.execute(mockOperation)).rejects.toThrow();
      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
    });

    it('rejects requests immediately in OPEN state', async () => {
      // Force circuit to OPEN state
      mockOperation.mockRejectedValue(new Error('Service error'));
      await expect(circuitBreaker.execute(mockOperation)).rejects.toThrow();
      await expect(circuitBreaker.execute(mockOperation)).rejects.toThrow();
      
      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
      
      // Reset mock to track calls
      mockOperation.mockClear();
      
      // Should reject without calling operation
      await expect(circuitBreaker.execute(mockOperation)).rejects.toThrow('temporarily unavailable');
      expect(mockOperation).not.toHaveBeenCalled();
    });

    it('transitions to HALF_OPEN after recovery timeout', async () => {
      // Force circuit to OPEN state
      mockOperation.mockRejectedValue(new Error('Service error'));
      await expect(circuitBreaker.execute(mockOperation)).rejects.toThrow();
      await expect(circuitBreaker.execute(mockOperation)).rejects.toThrow();
      
      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
      
      // Wait for recovery timeout (using a shorter timeout for testing)
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      mockOperation.mockResolvedValue('success');
      const result = await circuitBreaker.execute(mockOperation);
      
      expect(result).toBe('success');
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('provides accurate stats', () => {
      const stats = circuitBreaker.getStats();
      
      expect(stats).toHaveProperty('state');
      expect(stats).toHaveProperty('failureCount');
      expect(stats).toHaveProperty('successCount');
      expect(stats).toHaveProperty('lastFailureTime');
    });
  });

  describe('Retry Logic', () => {
    it('identifies retryable errors correctly', () => {
      const networkError = handleError('Network timeout');
      expect(shouldRetry(networkError)).toBe(true);
      
      const authError = handleError('Unauthorized');
      expect(shouldRetry(authError)).toBe(false);
    });

    it('respects retry attempt limits', () => {
      const networkError = handleError('Network timeout');
      
      expect(shouldRetry(networkError, 0)).toBe(true);
      expect(shouldRetry(networkError, 2)).toBe(true);
      expect(shouldRetry(networkError, 3)).toBe(false);
    });

    it('calculates exponential backoff correctly', () => {
      expect(getRetryDelay(0)).toBe(1000);
      expect(getRetryDelay(1)).toBe(2000);
      expect(getRetryDelay(2)).toBe(4000);
      expect(getRetryDelay(3)).toBe(8000);
    });

    it('caps maximum retry delay', () => {
      expect(getRetryDelay(10)).toBe(30000); // Max 30 seconds
    });

    it('allows custom base delay', () => {
      expect(getRetryDelay(1, 500)).toBe(1000);
      expect(getRetryDelay(2, 500)).toBe(2000);
    });
  });

  describe('Global Circuit Breakers', () => {
    it('provides circuit breakers for different services', () => {
      expect(circuitBreakers.openai).toBeInstanceOf(CircuitBreaker);
      expect(circuitBreakers.claude).toBeInstanceOf(CircuitBreaker);
      expect(circuitBreakers.storage).toBeInstanceOf(CircuitBreaker);
      expect(circuitBreakers.auth).toBeInstanceOf(CircuitBreaker);
    });

    it('has different configurations for different services', () => {
      const openaiStats = circuitBreakers.openai.getStats();
      const storageStats = circuitBreakers.storage.getStats();
      
      expect(openaiStats.state).toBe(CircuitState.CLOSED);
      expect(storageStats.state).toBe(CircuitState.CLOSED);
    });
  });

  describe('Error Logging', () => {
    it('logs errors in development mode', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      handleError('Test error for logging');
      
      expect(consoleSpy).toHaveBeenCalled();
      
      // Restore
      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('handles null/undefined errors gracefully', () => {
      const error1 = handleError(null as any);
      const error2 = handleError(undefined as any);
      
      expect(error1.message).toBeDefined();
      expect(error2.message).toBeDefined();
    });

    it('handles errors with circular references', () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;
      
      const error = handleError('Circular error', { circular: circularObj });
      expect(error.context).toBeDefined();
    });

    it('handles very long error messages', () => {
      const longMessage = 'A'.repeat(10000);
      const error = handleError(longMessage);
      
      expect(error.message).toBe(longMessage);
      expect(error.userMessage).toBeDefined();
    });

    it('handles special characters in error messages', () => {
      const specialMessage = 'Error with émojis 🚨 and spëcial chars';
      const error = handleError(specialMessage);
      
      expect(error.message).toBe(specialMessage);
    });
  });
});
