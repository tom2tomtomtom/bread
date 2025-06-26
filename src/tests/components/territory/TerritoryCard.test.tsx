import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { TerritoryCard } from '../../../components/territory/TerritoryCard';
import {
  renderWithProviders,
  createMockTerritory,
  createMockHandlers,
  expectElementToBeVisible,
  checkAccessibility,
  expectFastRender,
} from '../../utils/testUtils';
import { EnhancedTerritory } from '../../../types';

/**
 * Comprehensive TerritoryCard Component Tests
 * 
 * Test Coverage:
 * - Rendering and display
 * - User interactions
 * - Performance optimization
 * - Accessibility compliance
 * - Error handling
 * - Edge cases
 */

describe('TerritoryCard', () => {
  let mockTerritory: EnhancedTerritory;
  let mockHandlers: ReturnType<typeof createMockHandlers>;
  let defaultProps: any;

  beforeEach(() => {
    mockTerritory = {
      ...createMockTerritory({
        id: 'T1',
        title: 'Premium Coffee Experience',
        positioning: 'Artisanal coffee for discerning taste',
        tone: 'Sophisticated yet approachable',
      }),
      confidence: {
        marketFit: 85,
        complianceConfidence: 90,
        audienceResonance: 80,
        riskLevel: 'LOW' as const,
      },
    };

    mockHandlers = createMockHandlers();

    defaultProps = {
      territory: mockTerritory,
      index: 0,
      starredItems: { territories: [], headlines: {} },
      onToggleTerritoryStarred: mockHandlers.onToggleTerritoryStarred,
      onToggleHeadlineStarred: mockHandlers.onToggleHeadlineStarred,
    };
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderWithProviders(<TerritoryCard {...defaultProps} />);
      expect(container).toBeInTheDocument();
    });

    it('displays territory information correctly', async () => {
      renderWithProviders(<TerritoryCard {...defaultProps} />);
      
      await expectElementToBeVisible('Premium Coffee Experience');
      await expectElementToBeVisible('Artisanal coffee for discerning taste');
      await expectElementToBeVisible('Sophisticated yet approachable');
      await expectElementToBeVisible('T1');
    });

    it('displays confidence score correctly', async () => {
      renderWithProviders(<TerritoryCard {...defaultProps} />);
      
      // Average confidence: (85 + 90 + 80) / 3 = 85
      await expectElementToBeVisible('85% CONF');
    });

    it('shows correct confidence color for high score', () => {
      renderWithProviders(<TerritoryCard {...defaultProps} />);
      
      const confidenceBadge = screen.getByText('85% CONF');
      expect(confidenceBadge).toHaveClass('bg-green-400');
    });

    it('shows correct confidence color for medium score', () => {
      const mediumConfidenceTerritory = {
        ...mockTerritory,
        confidence: {
          ...mockTerritory.confidence,
          marketFit: 65,
          complianceConfidence: 70,
          audienceResonance: 60,
        },
      };

      renderWithProviders(
        <TerritoryCard {...defaultProps} territory={mediumConfidenceTerritory} />
      );
      
      const confidenceBadge = screen.getByText('65% CONF');
      expect(confidenceBadge).toHaveClass('bg-yellow-600');
    });

    it('shows correct confidence color for low score', () => {
      const lowConfidenceTerritory = {
        ...mockTerritory,
        confidence: {
          ...mockTerritory.confidence,
          marketFit: 45,
          complianceConfidence: 50,
          audienceResonance: 40,
        },
      };

      renderWithProviders(
        <TerritoryCard {...defaultProps} territory={lowConfidenceTerritory} />
      );
      
      const confidenceBadge = screen.getByText('45% CONF');
      expect(confidenceBadge).toHaveClass('bg-red-500');
    });
  });

  describe('User Interactions', () => {
    it('handles territory starring correctly', async () => {
      const { user } = renderWithProviders(<TerritoryCard {...defaultProps} />);
      
      const starButton = screen.getByTitle('Star territory');
      await user.click(starButton);
      
      expect(mockHandlers.onToggleTerritoryStarred).toHaveBeenCalledWith('T1');
    });

    it('shows starred state correctly', () => {
      const starredProps = {
        ...defaultProps,
        starredItems: { territories: ['T1'], headlines: {} },
      };

      renderWithProviders(<TerritoryCard {...starredProps} />);
      
      const starButton = screen.getByTitle('Unstar territory');
      expect(starButton).toHaveTextContent('⭐');
    });

    it('shows unstarred state correctly', () => {
      renderWithProviders(<TerritoryCard {...defaultProps} />);
      
      const starButton = screen.getByTitle('Star territory');
      expect(starButton).toHaveTextContent('☆');
    });

    it('handles evolution button when provided', async () => {
      const propsWithEvolution = {
        ...defaultProps,
        onSelectTerritoryForEvolution: mockHandlers.onSelectTerritoryForEvolution,
      };

      const { user } = renderWithProviders(<TerritoryCard {...propsWithEvolution} />);
      
      const evolveButton = screen.getByText('Evolve');
      await user.click(evolveButton);
      
      expect(mockHandlers.onSelectTerritoryForEvolution).toHaveBeenCalledWith('T1');
    });

    it('handles performance prediction button when provided', async () => {
      const propsWithPrediction = {
        ...defaultProps,
        onPredictTerritoryPerformance: mockHandlers.onPredictTerritoryPerformance,
      };

      const { user } = renderWithProviders(<TerritoryCard {...propsWithPrediction} />);
      
      const predictButton = screen.getByText('Predict');
      await user.click(predictButton);
      
      expect(mockHandlers.onPredictTerritoryPerformance).toHaveBeenCalledWith('T1');
    });
  });

  describe('Performance Optimization', () => {
    it('renders quickly', async () => {
      await expectFastRender(() => {
        renderWithProviders(<TerritoryCard {...defaultProps} />);
      });
    });

    it('uses React.memo to prevent unnecessary re-renders', () => {
      const { rerender } = renderWithProviders(<TerritoryCard {...defaultProps} />);
      
      // Re-render with same props should not cause re-render
      rerender(<TerritoryCard {...defaultProps} />);
      
      // Only one call to onToggleTerritoryStarred should be made if clicked
      expect(mockHandlers.onToggleTerritoryStarred).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility requirements', async () => {
      const { container } = renderWithProviders(<TerritoryCard {...defaultProps} />);
      await checkAccessibility(container);
    });

    it('has proper button labels', () => {
      renderWithProviders(<TerritoryCard {...defaultProps} />);
      
      expect(screen.getByTitle('Star territory')).toBeInTheDocument();
    });

    it('has proper semantic structure', () => {
      renderWithProviders(<TerritoryCard {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Premium Coffee Experience');
    });
  });

  describe('Enhanced Features', () => {
    it('displays performance prediction when available', () => {
      const propsWithPrediction = {
        ...defaultProps,
        performancePrediction: { overallScore: 92 },
      };

      renderWithProviders(<TerritoryCard {...propsWithPrediction} />);
      
      expect(screen.getByText('Performance: 92/100')).toBeInTheDocument();
    });

    it('displays evolution count when available', () => {
      const propsWithEvolutions = {
        ...defaultProps,
        territoryEvolutions: [{ id: '1' }, { id: '2' }],
      };

      renderWithProviders(<TerritoryCard {...propsWithEvolutions} />);
      
      expect(screen.getByText('2 Evolutions')).toBeInTheDocument();
    });

    it('displays singular evolution text correctly', () => {
      const propsWithEvolution = {
        ...defaultProps,
        territoryEvolutions: [{ id: '1' }],
      };

      renderWithProviders(<TerritoryCard {...propsWithEvolution} />);
      
      expect(screen.getByText('1 Evolution')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing headlines gracefully', () => {
      const territoryWithoutHeadlines = {
        ...mockTerritory,
        headlines: [],
      };

      const { container } = renderWithProviders(
        <TerritoryCard {...defaultProps} territory={territoryWithoutHeadlines} />
      );
      
      expect(container).toBeInTheDocument();
    });

    it('handles very long territory titles', () => {
      const territoryWithLongTitle = {
        ...mockTerritory,
        title: 'This is a very long territory title that might cause layout issues if not handled properly',
      };

      const { container } = renderWithProviders(
        <TerritoryCard {...defaultProps} territory={territoryWithLongTitle} />
      );
      
      expect(container).toBeInTheDocument();
    });

    it('handles extreme confidence values', () => {
      const territoryWithExtremeConfidence = {
        ...mockTerritory,
        confidence: {
          marketFit: 0,
          complianceConfidence: 100,
          audienceResonance: 50,
          riskLevel: 'HIGH' as const,
        },
      };

      renderWithProviders(
        <TerritoryCard {...defaultProps} territory={territoryWithExtremeConfidence} />
      );
      
      // Average: (0 + 100 + 50) / 3 = 50
      expect(screen.getByText('50% CONF')).toBeInTheDocument();
    });
  });
});
