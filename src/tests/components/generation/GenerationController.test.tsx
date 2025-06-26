import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenerationController } from '../../../components/generation/GenerationController';
import { useAppStore } from '../../../store/appStore';
import { renderWithProviders, createMockGeneratedOutput } from '../../utils/testUtils';

/**
 * Comprehensive GenerationController Tests
 * 
 * Test Coverage:
 * - Brief input and validation
 * - Generation workflow and states
 * - Error handling and recovery
 * - Performance and user experience
 * - Integration with store and services
 */

// Mock the store
vi.mock('../../../store/appStore', () => ({
  useAppStore: vi.fn(),
}));

// Mock API calls
global.fetch = vi.fn();

describe('GenerationController', () => {
  const mockStore = {
    // Generation state
    generatedOutput: null,
    isGenerating: false,
    briefInput: '',
    
    // Configuration
    apiKeys: {
      openai: 'test-key',
      claude: 'test-key',
    },
    
    // Actions
    setGeneratedOutput: vi.fn(),
    setIsGenerating: vi.fn(),
    setBriefInput: vi.fn(),
    showToast: vi.fn(),
  };

  const mockGeneratedOutput = createMockGeneratedOutput();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue(mockStore);
    
    // Mock successful API response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockGeneratedOutput),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      renderWithProviders(<GenerationController />);
      expect(screen.getByText(/brief input/i)).toBeInTheDocument();
    });

    it('displays brief input textarea', () => {
      renderWithProviders(<GenerationController />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('placeholder');
    });

    it('displays generate button', () => {
      renderWithProviders(<GenerationController />);
      const generateButton = screen.getByRole('button', { name: /generate/i });
      expect(generateButton).toBeInTheDocument();
    });

    it('shows API key configuration when keys are missing', () => {
      const storeWithoutKeys = {
        ...mockStore,
        apiKeys: {},
      };
      (useAppStore as any).mockReturnValue(storeWithoutKeys);

      renderWithProviders(<GenerationController />);
      expect(screen.getByText(/api key/i)).toBeInTheDocument();
    });
  });

  describe('Brief Input Handling', () => {
    it('updates brief input on textarea change', async () => {
      const user = userEvent.setup();
      renderWithProviders(<GenerationController />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test brief content');
      
      expect(mockStore.setBriefInput).toHaveBeenCalledWith('Test brief content');
    });

    it('validates brief input before generation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<GenerationController />);
      
      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);
      
      // Should show validation error for empty input
      expect(screen.getByText(/brief is required/i)).toBeInTheDocument();
    });

    it('accepts valid brief input', async () => {
      const user = userEvent.setup();
      const storeWithInput = {
        ...mockStore,
        briefInput: 'Valid brief content with sufficient detail',
      };
      (useAppStore as any).mockReturnValue(storeWithInput);

      renderWithProviders(<GenerationController />);
      
      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);
      
      expect(mockStore.setIsGenerating).toHaveBeenCalledWith(true);
    });
  });

  describe('Generation Workflow', () => {
    it('starts generation process correctly', async () => {
      const user = userEvent.setup();
      const storeWithInput = {
        ...mockStore,
        briefInput: 'Test brief for generation',
      };
      (useAppStore as any).mockReturnValue(storeWithInput);

      renderWithProviders(<GenerationController />);
      
      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);
      
      expect(mockStore.setIsGenerating).toHaveBeenCalledWith(true);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('shows loading state during generation', () => {
      const generatingStore = {
        ...mockStore,
        isGenerating: true,
        briefInput: 'Test brief',
      };
      (useAppStore as any).mockReturnValue(generatingStore);

      renderWithProviders(<GenerationController />);
      
      expect(screen.getByText(/generating/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /generating/i })).toBeDisabled();
    });

    it('completes generation successfully', async () => {
      const user = userEvent.setup();
      const storeWithInput = {
        ...mockStore,
        briefInput: 'Test brief for generation',
      };
      (useAppStore as any).mockReturnValue(storeWithInput);

      renderWithProviders(<GenerationController />);
      
      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(mockStore.setGeneratedOutput).toHaveBeenCalledWith(mockGeneratedOutput);
        expect(mockStore.setIsGenerating).toHaveBeenCalledWith(false);
      });
    });

    it('displays progress indicators', () => {
      const generatingStore = {
        ...mockStore,
        isGenerating: true,
        briefInput: 'Test brief',
      };
      (useAppStore as any).mockReturnValue(generatingStore);

      renderWithProviders(<GenerationController />);
      
      // Should show progress bar or spinner
      expect(screen.getByRole('progressbar') || screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock API error
      (global.fetch as any).mockRejectedValue(new Error('API Error'));
      
      const storeWithInput = {
        ...mockStore,
        briefInput: 'Test brief for generation',
      };
      (useAppStore as any).mockReturnValue(storeWithInput);

      renderWithProviders(<GenerationController />);
      
      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(mockStore.showToast).toHaveBeenCalledWith(
          expect.stringContaining('error'),
          'error'
        );
        expect(mockStore.setIsGenerating).toHaveBeenCalledWith(false);
      });
    });

    it('handles network timeouts', async () => {
      const user = userEvent.setup();
      
      // Mock timeout
      (global.fetch as any).mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );
      
      const storeWithInput = {
        ...mockStore,
        briefInput: 'Test brief for generation',
      };
      (useAppStore as any).mockReturnValue(storeWithInput);

      renderWithProviders(<GenerationController />);
      
      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(mockStore.showToast).toHaveBeenCalledWith(
          expect.stringContaining('timeout'),
          'error'
        );
      }, { timeout: 2000 });
    });

    it('provides retry functionality after errors', async () => {
      const user = userEvent.setup();
      
      // Mock initial error, then success
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGeneratedOutput),
        });
      
      const storeWithInput = {
        ...mockStore,
        briefInput: 'Test brief for generation',
      };
      (useAppStore as any).mockReturnValue(storeWithInput);

      renderWithProviders(<GenerationController />);
      
      const generateButton = screen.getByRole('button', { name: /generate/i });
      
      // First attempt - should fail
      await user.click(generateButton);
      await waitFor(() => {
        expect(mockStore.showToast).toHaveBeenCalledWith(
          expect.stringContaining('error'),
          'error'
        );
      });
      
      // Retry - should succeed
      await user.click(generateButton);
      await waitFor(() => {
        expect(mockStore.setGeneratedOutput).toHaveBeenCalledWith(mockGeneratedOutput);
      });
    });
  });

  describe('Performance and UX', () => {
    it('renders quickly', () => {
      const startTime = performance.now();
      renderWithProviders(<GenerationController />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50); // 50ms threshold
    });

    it('debounces input changes', async () => {
      const user = userEvent.setup();
      renderWithProviders(<GenerationController />);
      
      const textarea = screen.getByRole('textbox');
      
      // Type rapidly
      await user.type(textarea, 'Quick typing test');
      
      // Should not call setBriefInput for every keystroke
      expect(mockStore.setBriefInput).toHaveBeenCalledTimes(1);
    });

    it('provides keyboard shortcuts', async () => {
      const user = userEvent.setup();
      const storeWithInput = {
        ...mockStore,
        briefInput: 'Test brief for generation',
      };
      (useAppStore as any).mockReturnValue(storeWithInput);

      renderWithProviders(<GenerationController />);
      
      const textarea = screen.getByRole('textbox');
      textarea.focus();
      
      // Ctrl+Enter should trigger generation
      await user.keyboard('{Control>}{Enter}{/Control}');
      
      expect(mockStore.setIsGenerating).toHaveBeenCalledWith(true);
    });
  });

  describe('Integration Tests', () => {
    it('integrates with store state changes', () => {
      const { rerender } = renderWithProviders(<GenerationController />);
      
      // Update store state
      const updatedStore = {
        ...mockStore,
        generatedOutput: mockGeneratedOutput,
      };
      (useAppStore as any).mockReturnValue(updatedStore);
      
      rerender(<GenerationController />);
      
      // Should reflect the new state
      expect(screen.getByText(/generated successfully/i)).toBeInTheDocument();
    });

    it('handles concurrent generation requests', async () => {
      const user = userEvent.setup();
      const storeWithInput = {
        ...mockStore,
        briefInput: 'Test brief for generation',
      };
      (useAppStore as any).mockReturnValue(storeWithInput);

      renderWithProviders(<GenerationController />);
      
      const generateButton = screen.getByRole('button', { name: /generate/i });
      
      // Click multiple times rapidly
      await user.click(generateButton);
      await user.click(generateButton);
      await user.click(generateButton);
      
      // Should only start one generation
      expect(mockStore.setIsGenerating).toHaveBeenCalledTimes(1);
    });
  });
});
