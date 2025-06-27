import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { renderWithProviders, createMockGeneratedOutput, mockNetworkSuccess } from '../utils/testUtils';

/**
 * Integration Tests for Complete User Workflows
 * 
 * Test Coverage:
 * - End-to-end user journeys
 * - Cross-component interactions
 * - State management flow
 * - Error recovery workflows
 * - Performance under realistic usage
 */

// Mock API responses
global.fetch = vi.fn();

describe('User Workflows Integration Tests', () => {
  const mockGeneratedOutput = createMockGeneratedOutput();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNetworkSuccess(mockGeneratedOutput);
    
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Brief Generation Workflow', () => {
    it('completes full brief generation journey', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      // Step 1: User enters brief
      const briefInput = screen.getByRole('textbox', { name: /brief/i });
      await user.type(briefInput, 'Launch campaign for premium coffee brand targeting millennials');

      // Step 2: User clicks generate
      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      // Step 3: Loading state appears
      expect(screen.getByText(/generating/i)).toBeInTheDocument();

      // Step 4: Results appear
      await waitFor(() => {
        expect(screen.getByText(/territories generated/i)).toBeInTheDocument();
      });

      // Step 5: User can interact with results
      const territoryCard = screen.getByTestId('territory-card-0');
      expect(territoryCard).toBeInTheDocument();

      // Step 6: User can star territories
      const starButton = screen.getByRole('button', { name: /star territory/i });
      await user.click(starButton);

      expect(screen.getByText('⭐')).toBeInTheDocument();
    });

    it('handles brief regeneration workflow', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      // Generate initial brief
      const briefInput = screen.getByRole('textbox', { name: /brief/i });
      await user.type(briefInput, 'Initial brief content');
      
      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/territories generated/i)).toBeInTheDocument();
      });

      // Modify brief and regenerate
      await user.clear(briefInput);
      await user.type(briefInput, 'Modified brief content with new requirements');
      await user.click(generateButton);

      // Should show new generation
      expect(screen.getByText(/generating/i)).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText(/territories generated/i)).toBeInTheDocument();
      });
    });

    it('handles territory evolution workflow', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      // Generate initial territories
      const briefInput = screen.getByRole('textbox', { name: /brief/i });
      await user.type(briefInput, 'Test brief for evolution');
      
      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/territories generated/i)).toBeInTheDocument();
      });

      // Evolve a territory
      const evolveButton = screen.getByRole('button', { name: /evolve/i });
      await user.click(evolveButton);

      // Should show evolution interface
      expect(screen.getByText(/territory evolution/i)).toBeInTheDocument();

      // Complete evolution
      const confirmEvolution = screen.getByRole('button', { name: /confirm evolution/i });
      await user.click(confirmEvolution);

      await waitFor(() => {
        expect(screen.getByText(/evolution complete/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Workflow', () => {
    it('completes sign-up and sign-in flow', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      // Open auth modal
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Switch to sign-up
      const signUpTab = screen.getByRole('tab', { name: /sign up/i });
      await user.click(signUpTab);

      // Fill sign-up form
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const nameInput = screen.getByRole('textbox', { name: /name/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'securepassword123');
      await user.type(nameInput, 'Test User');

      // Submit sign-up
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Should show success and auto sign-in
      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // User should be authenticated
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('handles authentication errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock auth error
      (global.fetch as any).mockRejectedValueOnce(new Error('Invalid credentials'));
      
      renderWithProviders(<App />);

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      // Fill invalid credentials
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'invalid@example.com');
      await user.type(passwordInput, 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // Modal should remain open for retry
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Export and Sharing Workflow', () => {
    it('completes PDF export workflow', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      // Generate territories first
      const briefInput = screen.getByRole('textbox', { name: /brief/i });
      await user.type(briefInput, 'Test brief for export');
      
      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/territories generated/i)).toBeInTheDocument();
      });

      // Star some territories
      const starButtons = screen.getAllByRole('button', { name: /star territory/i });
      await user.click(starButtons[0]);

      // Export to PDF
      const exportButton = screen.getByRole('button', { name: /export pdf/i });
      await user.click(exportButton);

      // Should show export progress
      expect(screen.getByText(/generating pdf/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/pdf ready/i)).toBeInTheDocument();
      });
    });

    it('completes CSV export workflow', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      // Generate and star territories
      const briefInput = screen.getByRole('textbox', { name: /brief/i });
      await user.type(briefInput, 'Test brief for CSV export');
      
      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/territories generated/i)).toBeInTheDocument();
      });

      // Star territories and headlines
      const starButtons = screen.getAllByRole('button', { name: /star/i });
      await user.click(starButtons[0]); // Territory
      await user.click(starButtons[1]); // Headline

      // Export to CSV
      const exportButton = screen.getByRole('button', { name: /export csv/i });
      await user.click(exportButton);

      // Should trigger download
      await waitFor(() => {
        expect(screen.getByText(/csv downloaded/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery Workflows', () => {
    it('recovers from network errors during generation', async () => {
      const user = userEvent.setup();
      
      // Mock network error, then success
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeneratedOutput),
        });

      renderWithProviders(<App />);

      const briefInput = screen.getByRole('textbox', { name: /brief/i });
      await user.type(briefInput, 'Test brief for error recovery');
      
      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Retry should work
      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText(/territories generated/i)).toBeInTheDocument();
      });
    });

    it('handles component errors with error boundaries', async () => {
      const user = userEvent.setup();
      
      // Mock a component error scenario
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      renderWithProviders(<App />);

      // Trigger an error condition (e.g., invalid data)
      const briefInput = screen.getByRole('textbox', { name: /brief/i });
      await user.type(briefInput, 'TRIGGER_ERROR'); // Special test case
      
      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      // Should show error boundary
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Should have recovery option
      const reloadButton = screen.getByRole('button', { name: /reload/i });
      expect(reloadButton).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Performance Under Load', () => {
    it('handles rapid user interactions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      const briefInput = screen.getByRole('textbox', { name: /brief/i });
      const generateButton = screen.getByRole('button', { name: /generate/i });

      // Rapid typing and clicking
      await user.type(briefInput, 'Rapid interaction test');
      
      // Multiple rapid clicks
      await user.click(generateButton);
      await user.click(generateButton);
      await user.click(generateButton);

      // Should handle gracefully without crashes
      expect(screen.getByText(/generating/i)).toBeInTheDocument();
      
      // Should only trigger one generation
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('maintains performance with large datasets', async () => {
      const user = userEvent.setup();
      
      // Mock large dataset response
      const largeDataset = {
        ...mockGeneratedOutput,
        territories: Array(50).fill(null).map((_, i) => ({
          ...mockGeneratedOutput.territories[0],
          id: `T${i}`,
          title: `Territory ${i}`,
        })),
      };
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(largeDataset),
      });

      renderWithProviders(<App />);

      const briefInput = screen.getByRole('textbox', { name: /brief/i });
      await user.type(briefInput, 'Large dataset test');
      
      const generateButton = screen.getByRole('button', { name: /generate/i });
      
      const startTime = performance.now();
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/territories generated/i)).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render large dataset in reasonable time
      expect(renderTime).toBeLessThan(2000); // 2 second threshold
      
      // Should show all territories
      expect(screen.getAllByTestId(/territory-card/)).toHaveLength(50);
    });
  });
});
