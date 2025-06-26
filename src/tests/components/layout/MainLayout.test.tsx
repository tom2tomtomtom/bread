import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MainLayout } from '../../../components/layout/MainLayout';
import { useAppStore } from '../../../store/appStore';
import { renderWithProviders, checkAccessibility } from '../../utils/testUtils';

/**
 * Comprehensive MainLayout Tests
 * 
 * Test Coverage:
 * - Layout structure and navigation
 * - Responsive design behavior
 * - Accessibility compliance
 * - State management integration
 * - Performance optimization
 */

// Mock the store
vi.mock('../../../store/appStore', () => ({
  useAppStore: vi.fn(),
}));

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('MainLayout', () => {
  const mockStore = {
    // UI state
    showAuthModal: false,
    toastMessage: null,
    
    // User state
    isAuthenticated: false,
    user: null,
    
    // Actions
    setShowAuthModal: vi.fn(),
    showToast: vi.fn(),
    logout: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue(mockStore);
  });

  describe('Layout Structure', () => {
    it('renders without crashing', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('displays main navigation', () => {
      renderWithProviders(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText(/bread/i)).toBeInTheDocument(); // Logo/brand
    });

    it('displays header with branding', () => {
      renderWithProviders(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header).toHaveTextContent(/bread/i);
    });

    it('displays main content area', () => {
      renderWithProviders(
        <MainLayout>
          <div data-testid="main-content">Main Content</div>
        </MainLayout>
      );
      
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });

    it('displays footer', () => {
      renderWithProviders(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });
  });

  describe('Authentication Integration', () => {
    it('shows login button when not authenticated', () => {
      renderWithProviders(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('shows user menu when authenticated', () => {
      const authenticatedStore = {
        ...mockStore,
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
      };
      (useAppStore as any).mockReturnValue(authenticatedStore);

      renderWithProviders(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument();
    });

    it('opens auth modal on sign in click', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);
      
      expect(mockStore.setShowAuthModal).toHaveBeenCalledWith(true);
    });

    it('handles logout correctly', async () => {
      const user = userEvent.setup();
      const authenticatedStore = {
        ...mockStore,
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
      };
      (useAppStore as any).mockReturnValue(authenticatedStore);

      renderWithProviders(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      // Open user menu
      const userMenuButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(userMenuButton);
      
      // Click logout
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);
      
      expect(mockStore.logout).toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    it('adapts to mobile viewport', () => {
      // Mock mobile viewport
      (window.matchMedia as any).mockImplementation(query => ({
        matches: query === '(max-width: 768px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      renderWithProviders(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      // Should show mobile navigation
      expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
    });

    it('shows desktop navigation on large screens', () => {
      // Mock desktop viewport
      (window.matchMedia as any).mockImplementation(query => ({
        matches: query === '(min-width: 1024px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      renderWithProviders(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      // Should show full navigation
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass(/desktop/i);
    });

    it('handles mobile menu toggle', async () => {
      const user = userEvent.setup();
      
      // Mock mobile viewport
      (window.matchMedia as any).mockImplementation(query => ({
        matches: query === '(max-width: 768px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      renderWithProviders(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      const menuButton = screen.getByRole('button', { name: /menu/i });
      await user.click(menuButton);
      
      // Mobile menu should be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Toast Notifications', () => {
    it('displays toast messages', () => {
      const storeWithToast = {
        ...mockStore,
        toastMessage: { message: 'Test notification', type: 'success' },
      };
      (useAppStore as any).mockReturnValue(storeWithToast);

      renderWithProviders(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      expect(screen.getByText('Test notification')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('handles different toast types', () => {
      const storeWithErrorToast = {
        ...mockStore,
        toastMessage: { message: 'Error occurred', type: 'error' },
      };
      (useAppStore as any).mockReturnValue(storeWithErrorToast);

      renderWithProviders(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass(/error/i);
      expect(toast).toHaveTextContent('Error occurred');
    });

    it('auto-dismisses toast after timeout', async () => {
      vi.useFakeTimers();
      
      const storeWithToast = {
        ...mockStore,
        toastMessage: { message: 'Auto dismiss test', type: 'info' },
      };
      (useAppStore as any).mockReturnValue(storeWithToast);

      renderWithProviders(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      expect(screen.getByText('Auto dismiss test')).toBeInTheDocument();
      
      // Fast-forward time
      vi.advanceTimersByTime(5000);
      
      // Toast should be dismissed
      expect(screen.queryByText('Auto dismiss test')).not.toBeInTheDocument();
      
      vi.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility requirements', async () => {
      const { container } = renderWithProviders(
        <MainLayout>
          <div>Accessible Content</div>
        </MainLayout>
      );
      
      await checkAccessibility(container);
    });

    it('has proper ARIA landmarks', () => {
      renderWithProviders(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // Nav
      expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      // Tab through interactive elements
      await user.tab();
      expect(screen.getByRole('button', { name: /sign in/i })).toHaveFocus();
      
      await user.tab();
      // Next focusable element should receive focus
      expect(document.activeElement).toBeDefined();
    });

    it('has proper heading hierarchy', () => {
      renderWithProviders(
        <MainLayout>
          <div>Content</div>
        </MainLayout>
      );
      
      const headings = screen.getAllByRole('heading');
      expect(headings[0]).toHaveAttribute('aria-level', '1'); // Main heading
    });
  });

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = performance.now();
      renderWithProviders(
        <MainLayout>
          <div>Performance Test Content</div>
        </MainLayout>
      );
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50); // 50ms threshold
    });

    it('does not re-render unnecessarily', () => {
      const renderSpy = vi.fn();
      const TestChild = () => {
        renderSpy();
        return <div>Test Child</div>;
      };

      const { rerender } = renderWithProviders(
        <MainLayout>
          <TestChild />
        </MainLayout>
      );
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props
      rerender(
        <MainLayout>
          <TestChild />
        </MainLayout>
      );
      
      // Should not cause unnecessary re-renders
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('handles child component errors gracefully', () => {
      const ErrorChild = () => {
        throw new Error('Child component error');
      };
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      renderWithProviders(
        <MainLayout>
          <ErrorChild />
        </MainLayout>
      );
      
      // Layout should still render with error boundary
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });
});
