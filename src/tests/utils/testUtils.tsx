import React, { ReactElement } from 'react';
import { render, RenderOptions, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AppProviders } from '../../components/providers';
import { EnhancedGeneratedOutput, Territory, Headline } from '../../types';

/**
 * Comprehensive Testing Utilities for A+ Quality Testing
 * 
 * Features:
 * - Custom render with providers
 * - Mock data factories
 * - Common test helpers
 * - Performance testing utilities
 * - Accessibility testing helpers
 */

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withProviders?: boolean;
  initialState?: any;
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { withProviders = true, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (withProviders) {
      return <AppProviders>{children}</AppProviders>;
    }
    return <>{children}</>;
  };

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Mock data factories
export const createMockTerritory = (overrides: Partial<Territory> = {}): Territory => ({
  id: 'T1',
  title: 'Test Territory',
  positioning: 'Test positioning statement',
  tone: 'Professional and engaging',
  headlines: [createMockHeadline()],
  ...overrides,
});

export const createMockHeadline = (overrides: Partial<Headline> = {}): Headline => ({
  text: 'Test Headline',
  followUp: 'Test follow-up content',
  reasoning: 'Test reasoning',
  confidence: 85,
  ...overrides,
});

export const createMockGeneratedOutput = (
  overrides: Partial<EnhancedGeneratedOutput> = {}
): EnhancedGeneratedOutput => ({
  territories: [
    {
      ...createMockTerritory(),
      confidence: {
        marketFit: 85,
        complianceConfidence: 90,
        audienceResonance: 80,
        riskLevel: 'LOW' as const,
      },
    },
  ],
  compliance: {
    output: 'Test compliance output',
    powerBy: ['Test Framework'],
    notes: ['Test compliance note'],
  },
  overallConfidence: 85,
  ...overrides,
});

// Mock functions
export const createMockHandlers = () => ({
  onNewBrief: vi.fn(),
  onRegenerateUnstarred: vi.fn(),
  onToggleTerritoryStarred: vi.fn(),
  onToggleHeadlineStarred: vi.fn(),
  onSelectTerritoryForEvolution: vi.fn(),
  onPredictTerritoryPerformance: vi.fn(),
  onShowToast: vi.fn(),
});

// Test helpers
export const waitForLoadingToFinish = async () => {
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
};

export const expectElementToBeVisible = async (text: string | RegExp) => {
  await waitFor(() => {
    expect(screen.getByText(text)).toBeVisible();
  });
};

export const expectElementNotToBeInDocument = async (text: string | RegExp) => {
  await waitFor(() => {
    expect(screen.queryByText(text)).not.toBeInTheDocument();
  });
};

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now();
  renderFn();
  await waitForLoadingToFinish();
  const end = performance.now();
  return end - start;
};

export const expectFastRender = async (renderFn: () => void, maxTime: number = 100) => {
  const renderTime = await measureRenderTime(renderFn);
  expect(renderTime).toBeLessThan(maxTime);
};

// Accessibility testing helpers
export const checkAccessibility = async (container: HTMLElement) => {
  // Check for basic accessibility requirements
  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    expect(button).toHaveAttribute('type');
    if (!button.textContent?.trim()) {
      expect(button).toHaveAttribute('aria-label');
    }
  });

  const inputs = container.querySelectorAll('input');
  inputs.forEach(input => {
    expect(input).toHaveAttribute('type');
  });
};

// Error testing utilities
export const simulateError = (errorMessage: string = 'Test error') => {
  const error = new Error(errorMessage);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  return error;
};

export const expectErrorToBeHandled = async (errorMessage: string) => {
  await waitFor(() => {
    expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
  });
};

// Network testing utilities
export const mockNetworkError = () => {
  global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
};

export const mockNetworkSuccess = (data: any) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
};

// Local storage mocking
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        Object.keys(store).forEach(key => delete store[key]);
      }),
    },
    writable: true,
  });
  
  return store;
};

// Component testing patterns
export const testComponentRender = (Component: React.ComponentType<any>, props: any = {}) => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<Component {...props} />);
    expect(container).toBeInTheDocument();
  });
};

export const testComponentAccessibility = (Component: React.ComponentType<any>, props: any = {}) => {
  it('meets accessibility requirements', async () => {
    const { container } = renderWithProviders(<Component {...props} />);
    await checkAccessibility(container);
  });
};

export const testComponentPerformance = (Component: React.ComponentType<any>, props: any = {}) => {
  it('renders quickly', async () => {
    await expectFastRender(() => {
      renderWithProviders(<Component {...props} />);
    });
  });
};

// Test suite generator
export const createComponentTestSuite = (
  Component: React.ComponentType<any>,
  defaultProps: any = {},
  customTests: (() => void)[] = []
) => {
  describe(Component.displayName || Component.name, () => {
    testComponentRender(Component, defaultProps);
    testComponentAccessibility(Component, defaultProps);
    testComponentPerformance(Component, defaultProps);
    
    customTests.forEach(test => test());
  });
};

export default {
  renderWithProviders,
  createMockTerritory,
  createMockHeadline,
  createMockGeneratedOutput,
  createMockHandlers,
  waitForLoadingToFinish,
  expectElementToBeVisible,
  expectElementNotToBeInDocument,
  measureRenderTime,
  expectFastRender,
  checkAccessibility,
  simulateError,
  expectErrorToBeHandled,
  mockNetworkError,
  mockNetworkSuccess,
  mockLocalStorage,
  createComponentTestSuite,
};
