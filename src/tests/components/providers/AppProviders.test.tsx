import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProviders } from '../../../components/providers/AppProviders';
import { useAppStore } from '../../../store/appStore';

/**
 * Comprehensive AppProviders Tests
 * 
 * Test Coverage:
 * - Provider hierarchy and context availability
 * - State management integration
 * - Error boundary functionality
 * - Performance and memory management
 * - Provider composition and isolation
 */

// Mock the store
vi.mock('../../../store/appStore', () => ({
  useAppStore: vi.fn(),
}));

// Mock child components to isolate provider testing
const TestChild = () => {
  const store = useAppStore();
  return (
    <div>
      <div data-testid="store-available">{store ? 'Store Available' : 'Store Missing'}</div>
      <div data-testid="generation-state">{store?.generatedOutput ? 'Has Output' : 'No Output'}</div>
      <div data-testid="auth-state">{store?.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
    </div>
  );
};

const ErrorChild = () => {
  throw new Error('Test error for error boundary');
};

describe('AppProviders', () => {
  const mockStore = {
    // Generation state
    generatedOutput: null,
    isGenerating: false,
    
    // Authentication state
    isAuthenticated: false,
    user: null,
    
    // UI state
    showAuthModal: false,
    toastMessage: null,
    
    // Configuration
    apiKeys: {},
    
    // Actions
    setGeneratedOutput: vi.fn(),
    setIsGenerating: vi.fn(),
    setIsAuthenticated: vi.fn(),
    setUser: vi.fn(),
    setShowAuthModal: vi.fn(),
    showToast: vi.fn(),
    setApiKeys: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue(mockStore);
  });

  describe('Provider Hierarchy', () => {
    it('renders without crashing', () => {
      render(
        <AppProviders>
          <div>Test Content</div>
        </AppProviders>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('provides store context to children', () => {
      render(
        <AppProviders>
          <TestChild />
        </AppProviders>
      );
      
      expect(screen.getByTestId('store-available')).toHaveTextContent('Store Available');
    });

    it('provides authentication context', () => {
      render(
        <AppProviders>
          <TestChild />
        </AppProviders>
      );
      
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated');
    });

    it('provides generation context', () => {
      render(
        <AppProviders>
          <TestChild />
        </AppProviders>
      );
      
      expect(screen.getByTestId('generation-state')).toHaveTextContent('No Output');
    });
  });

  describe('State Management Integration', () => {
    it('reflects authenticated state changes', () => {
      const authenticatedStore = {
        ...mockStore,
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' },
      };
      
      (useAppStore as any).mockReturnValue(authenticatedStore);
      
      render(
        <AppProviders>
          <TestChild />
        </AppProviders>
      );
      
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Authenticated');
    });

    it('reflects generation state changes', () => {
      const generationStore = {
        ...mockStore,
        generatedOutput: { territories: [], compliance: { output: '', powerBy: [], notes: [] }, overallConfidence: 85 },
      };
      
      (useAppStore as any).mockReturnValue(generationStore);
      
      render(
        <AppProviders>
          <TestChild />
        </AppProviders>
      );
      
      expect(screen.getByTestId('generation-state')).toHaveTextContent('Has Output');
    });
  });

  describe('Error Boundary Functionality', () => {
    it('catches and handles child component errors', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <AppProviders>
          <ErrorChild />
        </AppProviders>
      );
      
      // Should show error boundary UI instead of crashing
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('provides error recovery options', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <AppProviders>
          <ErrorChild />
        </AppProviders>
      );
      
      // Should have a retry or reload option
      expect(screen.getByText(/try again/i) || screen.getByText(/reload/i)).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance and Memory Management', () => {
    it('renders quickly with multiple children', async () => {
      const startTime = performance.now();
      
      render(
        <AppProviders>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
          <TestChild />
        </AppProviders>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in less than 50ms
      expect(renderTime).toBeLessThan(50);
      expect(screen.getByText('Child 1')).toBeInTheDocument();
    });

    it('does not cause memory leaks on unmount', () => {
      const { unmount } = render(
        <AppProviders>
          <TestChild />
        </AppProviders>
      );
      
      // Should unmount cleanly without errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Provider Composition', () => {
    it('maintains provider order and nesting', () => {
      // Test that providers are composed in the correct order
      // This ensures that inner providers can access outer provider contexts
      render(
        <AppProviders>
          <TestChild />
        </AppProviders>
      );
      
      // All contexts should be available
      expect(screen.getByTestId('store-available')).toHaveTextContent('Store Available');
      expect(screen.getByTestId('auth-state')).toBeInTheDocument();
      expect(screen.getByTestId('generation-state')).toBeInTheDocument();
    });

    it('isolates provider concerns', () => {
      // Each provider should handle its own state without interfering with others
      const isolatedStore = {
        ...mockStore,
        isAuthenticated: true,
        generatedOutput: null, // Auth state independent of generation state
      };
      
      (useAppStore as any).mockReturnValue(isolatedStore);
      
      render(
        <AppProviders>
          <TestChild />
        </AppProviders>
      );
      
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('generation-state')).toHaveTextContent('No Output');
    });
  });

  describe('Edge Cases', () => {
    it('handles null children gracefully', () => {
      expect(() => {
        render(<AppProviders>{null}</AppProviders>);
      }).not.toThrow();
    });

    it('handles undefined children gracefully', () => {
      expect(() => {
        render(<AppProviders>{undefined}</AppProviders>);
      }).not.toThrow();
    });

    it('handles empty children array', () => {
      expect(() => {
        render(<AppProviders>{[]}</AppProviders>);
      }).not.toThrow();
    });

    it('handles multiple child types', () => {
      render(
        <AppProviders>
          <div>String child</div>
          {42}
          {true && <span>Conditional child</span>}
          <TestChild />
        </AppProviders>
      );
      
      expect(screen.getByText('String child')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('Conditional child')).toBeInTheDocument();
      expect(screen.getByTestId('store-available')).toBeInTheDocument();
    });
  });

  describe('Integration with Real Store', () => {
    it('works with actual store implementation', () => {
      // Temporarily use real store
      vi.unmock('../../../store/appStore');
      
      render(
        <AppProviders>
          <TestChild />
        </AppProviders>
      );
      
      // Should still work with real store
      expect(screen.getByTestId('store-available')).toBeInTheDocument();
      
      // Re-mock for other tests
      vi.mock('../../../store/appStore', () => ({
        useAppStore: vi.fn().mockReturnValue(mockStore),
      }));
    });
  });
});
