import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Territory,
  TerritoryEvolution,
  EvolutionSuggestion,
  EvolutionHistory,
  PerformancePrediction,
} from '../types';
import { APP_CONFIG } from '../config/app';

/**
 * TerritoryStore - Focused store for territory evolution and performance
 *
 * Responsibilities:
 * - Territory evolution management
 * - Performance predictions
 * - Evolution suggestions
 * - Evolution history tracking
 * - Territory analytics
 *
 * Benefits:
 * - Specialized territory intelligence
 * - Better performance tracking
 * - Clear evolution workflow
 * - Isolated territory concerns
 */

interface TerritoryState {
  // Territory Evolution state
  territoryEvolutions: { [territoryId: string]: TerritoryEvolution[] };
  evolutionSuggestions: EvolutionSuggestion[];
  evolutionHistory: { [territoryId: string]: EvolutionHistory };
  performancePredictions: { [territoryId: string]: PerformancePrediction };

  // UI state for territory features
  isEvolvingTerritory: boolean;
  selectedTerritoryForEvolution: string | null;

  // Analytics and insights
  territoryAnalytics: {
    [territoryId: string]: {
      engagementScore: number;
      conversionRate: number;
      audienceResonance: number;
      competitiveAdvantage: number;
      lastUpdated: string;
    };
  };

  // Actions
  addTerritoryEvolution: (territoryId: string, evolution: TerritoryEvolution) => void;
  setEvolutionSuggestions: (suggestions: EvolutionSuggestion[]) => void;
  setPerformancePrediction: (territoryId: string, prediction: PerformancePrediction) => void;
  setIsEvolvingTerritory: (evolving: boolean) => void;
  setSelectedTerritoryForEvolution: (territoryId: string | null) => void;

  // Advanced territory operations
  generateEvolutionSuggestions: (territoryId: string) => Promise<void>;
  evolveTerritoryWithAI: (territoryId: string, suggestion: EvolutionSuggestion) => Promise<void>;
  predictTerritoryPerformance: (territoryId: string) => Promise<void>;
  analyzeTerritoryTrends: (territoryId: string) => Promise<void>;

  // Analytics actions
  updateTerritoryAnalytics: (territoryId: string, analytics: any) => void;
  getTerritoryInsights: (territoryId: string) => any;
  compareTerritories: (territoryIds: string[]) => any;

  // Utility actions
  clearEvolutionData: (territoryId?: string) => void;
  resetTerritoryState: () => void;
}

export const useTerritoryStore = create<TerritoryState>()(
  persist(
    (set, get) => ({
      // Initial state
      territoryEvolutions: {},
      evolutionSuggestions: [],
      evolutionHistory: {},
      performancePredictions: {},
      isEvolvingTerritory: false,
      selectedTerritoryForEvolution: null,
      territoryAnalytics: {},

      // Basic actions
      addTerritoryEvolution: (territoryId: string, evolution: TerritoryEvolution) =>
        set(state => ({
          territoryEvolutions: {
            ...state.territoryEvolutions,
            [territoryId]: [...(state.territoryEvolutions[territoryId] || []), evolution],
          },
        })),

      setEvolutionSuggestions: (evolutionSuggestions: EvolutionSuggestion[]) =>
        set({ evolutionSuggestions }),

      setPerformancePrediction: (territoryId: string, prediction: PerformancePrediction) =>
        set(state => ({
          performancePredictions: {
            ...state.performancePredictions,
            [territoryId]: prediction,
          },
        })),

      setIsEvolvingTerritory: (isEvolvingTerritory: boolean) => set({ isEvolvingTerritory }),
      setSelectedTerritoryForEvolution: (selectedTerritoryForEvolution: string | null) =>
        set({ selectedTerritoryForEvolution }),

      // Advanced territory operations
      generateEvolutionSuggestions: async (territoryId: string) => {
        set({ isEvolvingTerritory: true });

        try {
          // TODO: Implement AI-powered evolution suggestion generation
          console.log('Generating evolution suggestions for territory:', territoryId);

          // Mock implementation
          await new Promise(resolve => setTimeout(resolve, 2000));

          const mockSuggestions: EvolutionSuggestion[] = [
            {
              type: 'TONE_SHIFT',
              title: 'Adjust tone for better engagement',
              description: 'Consider a more conversational tone to increase audience connection',
              confidence: 85,
              expectedImpact: 'medium',
              priority: 'MEDIUM',
              prompt: 'Update positioning and headline tone to be more conversational and engaging',
            },
            {
              type: 'COMPETITIVE_RESPONSE',
              title: 'Refine positioning strategy',
              description: 'Shift focus to emotional benefits over functional features',
              confidence: 78,
              expectedImpact: 'high',
              priority: 'HIGH',
              prompt: 'Revise territory positioning statement to emphasize emotional benefits',
            },
          ];

          set({
            evolutionSuggestions: mockSuggestions,
            isEvolvingTerritory: false,
          });
        } catch (error) {
          console.error('Failed to generate evolution suggestions:', error);
          set({ isEvolvingTerritory: false });
        }
      },

      evolveTerritoryWithAI: async (territoryId: string, suggestion: EvolutionSuggestion) => {
        set({ isEvolvingTerritory: true });

        try {
          // TODO: Implement AI-powered territory evolution
          console.log('Evolving territory with AI:', territoryId, suggestion);

          // Mock implementation
          await new Promise(resolve => setTimeout(resolve, 3000));

          // Create a mock evolved territory based on the suggestion
          const evolvedTerritory: Territory = {
            id: `evolved-${territoryId}-${Date.now()}`,
            title: 'Evolved Territory',
            positioning: 'Updated positioning based on AI suggestion',
            tone: 'Refined tone for better engagement',
            headlines: [
              {
                text: 'New evolved headline 1',
                followUp: 'Evolved follow-up 1',
                reasoning: 'AI-generated evolution reasoning',
                confidence: 85,
              },
              {
                text: 'New evolved headline 2',
                followUp: 'Evolved follow-up 2',
                reasoning: 'AI-generated evolution reasoning',
                confidence: 80,
              },
            ],
          };

          const evolution: TerritoryEvolution = {
            id: `evolution-${Date.now()}`,
            originalTerritoryId: territoryId,
            evolutionType: suggestion.type,
            evolutionPrompt: suggestion.prompt,
            resultingTerritory: evolvedTerritory,
            improvementScore: suggestion.confidence,
            evolutionReasoning: suggestion.description,
            timestamp: new Date(),
            metadata: {
              briefContext: 'Brief context for evolution',
              targetAudience: 'Target audience for evolution',
              competitiveContext: 'Competitive context for evolution',
              culturalContext: 'Cultural context for evolution',
            },
          };

          get().addTerritoryEvolution(territoryId, evolution);
          set({ isEvolvingTerritory: false });
        } catch (error) {
          console.error('Failed to evolve territory:', error);
          set({ isEvolvingTerritory: false });
        }
      },

      predictTerritoryPerformance: async (territoryId: string) => {
        try {
          // TODO: Implement AI-powered performance prediction
          console.log('Predicting performance for territory:', territoryId);

          // Mock implementation
          await new Promise(resolve => setTimeout(resolve, 1500));

          const prediction: PerformancePrediction = {
            overallScore: Math.random() * 40 + 60, // 60-100
            categoryScores: {
              audienceResonance: Math.random() * 30 + 70,
              brandAlignment: Math.random() * 20 + 80,
              marketFit: Math.random() * 30 + 70,
              creativePotential: Math.random() * 40 + 60,
              executionFeasibility: Math.random() * 30 + 70,
            },
            strengths: [
              'Strong emotional appeal expected',
              'Good alignment with target audience',
              'High creative potential',
            ],
            weaknesses: [
              'Consider A/B testing different headlines',
              'May need cultural adaptation',
            ],
            recommendations: [
              'Test with focus groups before launch',
              'Monitor engagement metrics closely',
              'Consider seasonal adjustments',
            ],
            confidence: Math.random() * 20 + 80,
          };

          get().setPerformancePrediction(territoryId, prediction);
        } catch (error) {
          console.error('Failed to predict territory performance:', error);
        }
      },

      analyzeTerritoryTrends: async (territoryId: string) => {
        try {
          // TODO: Implement territory trend analysis
          console.log('Analyzing trends for territory:', territoryId);

          // Mock implementation
          await new Promise(resolve => setTimeout(resolve, 1000));

          const analytics = {
            engagementScore: Math.random() * 0.4 + 0.6,
            conversionRate: Math.random() * 0.3 + 0.5,
            audienceResonance: Math.random() * 0.3 + 0.7,
            competitiveAdvantage: Math.random() * 0.4 + 0.6,
            lastUpdated: new Date().toISOString(),
          };

          get().updateTerritoryAnalytics(territoryId, analytics);
        } catch (error) {
          console.error('Failed to analyze territory trends:', error);
        }
      },

      // Analytics actions
      updateTerritoryAnalytics: (territoryId: string, analytics: any) =>
        set(state => ({
          territoryAnalytics: {
            ...state.territoryAnalytics,
            [territoryId]: analytics,
          },
        })),

      getTerritoryInsights: (territoryId: string) => {
        const { territoryAnalytics, performancePredictions, territoryEvolutions } = get();

        return {
          analytics: territoryAnalytics[territoryId],
          prediction: performancePredictions[territoryId],
          evolutionHistory: territoryEvolutions[territoryId] || [],
        };
      },

      compareTerritories: (territoryIds: string[]) => {
        const { territoryAnalytics, performancePredictions } = get();

        return territoryIds.map(id => ({
          territoryId: id,
          analytics: territoryAnalytics[id],
          prediction: performancePredictions[id],
        }));
      },

      // Utility actions
      clearEvolutionData: (territoryId?: string) => {
        if (territoryId) {
          set(state => {
            const newPerformancePredictions = { ...state.performancePredictions };
            delete newPerformancePredictions[territoryId];

            return {
              territoryEvolutions: {
                ...state.territoryEvolutions,
                [territoryId]: [],
              },
              performancePredictions: newPerformancePredictions,
            };
          });
        } else {
          set({
            territoryEvolutions: {},
            evolutionSuggestions: [],
            evolutionHistory: {},
            performancePredictions: {},
          });
        }
      },

      resetTerritoryState: () =>
        set({
          territoryEvolutions: {},
          evolutionSuggestions: [],
          evolutionHistory: {},
          performancePredictions: {},
          isEvolvingTerritory: false,
          selectedTerritoryForEvolution: null,
          territoryAnalytics: {},
        }),
    }),
    {
      name: `${APP_CONFIG.storage.keys.appState}-territory`,
      partialize: state => ({
        // Persist territory data
        territoryEvolutions: state.territoryEvolutions,
        evolutionHistory: state.evolutionHistory,
        performancePredictions: state.performancePredictions,
        territoryAnalytics: state.territoryAnalytics,
      }),
    }
  )
);
