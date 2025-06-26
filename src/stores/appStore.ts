import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Prompts,
  ApiKeys,
  StarredItems,
  ToastType,
  EnhancedBriefAnalysis,
  TerritoryEvolution,
  EvolutionSuggestion,
  EvolutionHistory,
  PerformancePrediction,
} from '../types';
import { DEFAULT_PROMPTS } from '../config/prompts';
import { APP_CONFIG } from '../config/app';

interface AppState {
  // Brief and generation state
  brief: string;
  isGenerating: boolean;
  showOutput: boolean;
  generatedOutput: any | null;
  error: string;
  showBriefAnalysis: boolean;
  briefAnalysis: any | null;

  // Enhanced Brief Intelligence state
  enhancedBriefAnalysis: EnhancedBriefAnalysis | null;
  isAnalyzingBrief: boolean;
  realTimeAnalysis: {
    score: number;
    wordCount: number;
    completeness: number;
    suggestions: string[];
  } | null;
  showEnhancedAnalysis: boolean;

  // Territory Evolution state
  territoryEvolutions: { [territoryId: string]: TerritoryEvolution[] };
  evolutionSuggestions: EvolutionSuggestion[];
  evolutionHistory: { [territoryId: string]: EvolutionHistory };
  performancePredictions: { [territoryId: string]: PerformancePrediction };
  isEvolvingTerritory: boolean;
  showEvolutionPanel: boolean;
  selectedTerritoryForEvolution: string | null;

  // Configuration state
  prompts: Prompts;
  apiKeys: ApiKeys;
  apiKeysSaved: boolean;
  generateImages: boolean;

  // UI state
  showAdmin: boolean;
  showAssets: boolean;
  showToast: boolean;
  toastMessage: string;
  toastType: ToastType;

  // Starred items
  starredItems: StarredItems;

  // Actions
  setBrief: (brief: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setShowOutput: (show: boolean) => void;
  setGeneratedOutput: (output: any) => void;
  setError: (error: string) => void;
  setShowBriefAnalysis: (show: boolean) => void;
  setBriefAnalysis: (analysis: any) => void;

  // Enhanced Brief Intelligence actions
  setEnhancedBriefAnalysis: (analysis: EnhancedBriefAnalysis | null) => void;
  setIsAnalyzingBrief: (analyzing: boolean) => void;
  setRealTimeAnalysis: (analysis: any) => void;
  setShowEnhancedAnalysis: (show: boolean) => void;
  analyzeEnhancedBrief: () => Promise<void>;
  updateRealTimeAnalysis: (brief: string) => void;

  // Territory Evolution actions
  addTerritoryEvolution: (territoryId: string, evolution: TerritoryEvolution) => void;
  setEvolutionSuggestions: (suggestions: EvolutionSuggestion[]) => void;
  setPerformancePrediction: (territoryId: string, prediction: PerformancePrediction) => void;
  setIsEvolvingTerritory: (evolving: boolean) => void;
  setShowEvolutionPanel: (show: boolean) => void;
  setSelectedTerritoryForEvolution: (territoryId: string | null) => void;
  generateEvolutionSuggestions: (territoryId: string) => Promise<void>;
  evolveTerritoryWithAI: (territoryId: string, suggestion: EvolutionSuggestion) => Promise<void>;
  predictTerritoryPerformance: (territoryId: string) => Promise<void>;

  updatePrompt: (key: keyof Prompts, value: string) => void;
  updateApiKey: (provider: keyof ApiKeys, key: string) => void;
  setApiKeysSaved: (saved: boolean) => void;
  setGenerateImages: (enabled: boolean) => void;

  setShowAdmin: (show: boolean) => void;
  setShowAssets: (show: boolean) => void;
  showToastMessage: (message: string, type: ToastType) => void;
  hideToast: () => void;

  toggleTerritoryStarred: (territoryId: string) => void;
  toggleHeadlineStarred: (territoryId: string, headlineIndex: number) => void;
  clearStarredItems: () => void;

  // Reset functions
  resetGeneration: () => void;
  resetAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      brief: '',
      isGenerating: false,
      showOutput: false,
      generatedOutput: null,
      error: '',
      showBriefAnalysis: false,
      briefAnalysis: null,

      // Enhanced Brief Intelligence initial state
      enhancedBriefAnalysis: null,
      isAnalyzingBrief: false,
      realTimeAnalysis: null,
      showEnhancedAnalysis: false,

      // Territory Evolution initial state
      territoryEvolutions: {},
      evolutionSuggestions: [],
      evolutionHistory: {},
      performancePredictions: {},
      isEvolvingTerritory: false,
      showEvolutionPanel: false,
      selectedTerritoryForEvolution: null,

      prompts: DEFAULT_PROMPTS,
      apiKeys: { openai: '' },
      apiKeysSaved: false,
      generateImages: false,

      showAdmin: false,
      showAssets: false,
      showToast: false,
      toastMessage: '',
      toastType: 'success',

      starredItems: {
        territories: [],
        headlines: {},
      },

      // Brief and generation actions
      setBrief: brief => set({ brief }),
      setIsGenerating: isGenerating => set({ isGenerating }),
      setShowOutput: showOutput => set({ showOutput }),
      setGeneratedOutput: generatedOutput => set({ generatedOutput }),
      setError: error => set({ error }),
      setShowBriefAnalysis: showBriefAnalysis => set({ showBriefAnalysis }),
      setBriefAnalysis: briefAnalysis => set({ briefAnalysis }),

      // Enhanced Brief Intelligence actions
      setEnhancedBriefAnalysis: enhancedBriefAnalysis => set({ enhancedBriefAnalysis }),
      setIsAnalyzingBrief: isAnalyzingBrief => set({ isAnalyzingBrief }),
      setRealTimeAnalysis: realTimeAnalysis => set({ realTimeAnalysis }),
      setShowEnhancedAnalysis: showEnhancedAnalysis => set({ showEnhancedAnalysis }),

      analyzeEnhancedBrief: async () => {
        const { brief } = get();
        if (!brief.trim()) return;

        set({ isAnalyzingBrief: true });
        try {
          // Import here to avoid circular dependencies
          const { analyzeEnhancedBrief } = await import('../services/briefIntelligenceService');
          const analysis = await analyzeEnhancedBrief(brief);
          set({
            enhancedBriefAnalysis: analysis,
            isAnalyzingBrief: false,
            showEnhancedAnalysis: true,
          });
        } catch (error) {
          console.error('Enhanced brief analysis failed:', error);
          set({ isAnalyzingBrief: false });
        }
      },

      updateRealTimeAnalysis: (brief: string) => {
        // Import here to avoid circular dependencies
        import('../services/briefIntelligenceService').then(({ analyzeRealTime }) => {
          const analysis = analyzeRealTime(brief);
          set({ realTimeAnalysis: analysis });
        });
      },

      // Territory Evolution actions
      addTerritoryEvolution: (territoryId: string, evolution: TerritoryEvolution) => {
        set(state => ({
          territoryEvolutions: {
            ...state.territoryEvolutions,
            [territoryId]: [...(state.territoryEvolutions[territoryId] || []), evolution],
          },
        }));
      },

      setEvolutionSuggestions: evolutionSuggestions => set({ evolutionSuggestions }),
      setPerformancePrediction: (territoryId: string, prediction: PerformancePrediction) => {
        set(state => ({
          performancePredictions: {
            ...state.performancePredictions,
            [territoryId]: prediction,
          },
        }));
      },
      setIsEvolvingTerritory: isEvolvingTerritory => set({ isEvolvingTerritory }),
      setShowEvolutionPanel: showEvolutionPanel => set({ showEvolutionPanel }),
      setSelectedTerritoryForEvolution: selectedTerritoryForEvolution =>
        set({ selectedTerritoryForEvolution }),

      generateEvolutionSuggestions: async (territoryId: string) => {
        const { generatedOutput, brief } = get();
        if (!generatedOutput?.territories) return;

        const territory = generatedOutput.territories.find((t: any) => t.id === territoryId);
        if (!territory) return;

        try {
          const { generateEvolutionSuggestions } = await import(
            '../services/territoryEvolutionService'
          );
          const suggestions = await generateEvolutionSuggestions(territory, brief);
          set({ evolutionSuggestions: suggestions });
        } catch (error) {
          console.error('Failed to generate evolution suggestions:', error);
        }
      },

      evolveTerritoryWithAI: async (territoryId: string, suggestion: EvolutionSuggestion) => {
        const { generatedOutput, brief } = get();
        if (!generatedOutput?.territories) return;

        const territory = generatedOutput.territories.find((t: any) => t.id === territoryId);
        if (!territory) return;

        set({ isEvolvingTerritory: true });
        try {
          const { evolveTerritoryWithAI } = await import('../services/territoryEvolutionService');
          const evolution = await evolveTerritoryWithAI(
            territory,
            suggestion.type,
            suggestion.prompt,
            brief
          );

          // Add evolution to store
          get().addTerritoryEvolution(territoryId, evolution);
          set({ isEvolvingTerritory: false });
        } catch (error) {
          console.error('Failed to evolve territory:', error);
          set({ isEvolvingTerritory: false });
        }
      },

      predictTerritoryPerformance: async (territoryId: string) => {
        const { generatedOutput, brief } = get();
        if (!generatedOutput?.territories) return;

        const territory = generatedOutput.territories.find((t: any) => t.id === territoryId);
        if (!territory) return;

        try {
          const { predictTerritoryPerformance } = await import(
            '../services/territoryEvolutionService'
          );
          const prediction = await predictTerritoryPerformance(territory, brief);
          get().setPerformancePrediction(territoryId, prediction);
        } catch (error) {
          console.error('Failed to predict territory performance:', error);
        }
      },

      // Configuration actions
      updatePrompt: (key, value) =>
        set(state => ({
          prompts: { ...state.prompts, [key]: value },
        })),
      updateApiKey: (provider, key) =>
        set(state => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        })),
      setApiKeysSaved: apiKeysSaved => set({ apiKeysSaved }),
      setGenerateImages: generateImages => set({ generateImages }),

      // UI actions
      setShowAdmin: showAdmin => set({ showAdmin }),
      setShowAssets: showAssets => set({ showAssets }),
      showToastMessage: (message, type) => {
        set({ toastMessage: message, toastType: type, showToast: true });
        // Auto-hide after configured duration
        setTimeout(() => set({ showToast: false }), APP_CONFIG.ui.toastDuration);
      },
      hideToast: () => set({ showToast: false }),

      // Starred items actions
      toggleTerritoryStarred: territoryId =>
        set(state => {
          const isCurrentlyStarred = state.starredItems.territories.includes(territoryId);

          if (isCurrentlyStarred) {
            return {
              starredItems: {
                ...state.starredItems,
                territories: state.starredItems.territories.filter(id => id !== territoryId),
                headlines: Object.fromEntries(
                  Object.entries(state.starredItems.headlines).filter(
                    ([key]) => key !== territoryId
                  )
                ),
              },
            };
          } else {
            return {
              starredItems: {
                ...state.starredItems,
                territories: [...state.starredItems.territories, territoryId],
              },
            };
          }
        }),

      toggleHeadlineStarred: (territoryId, headlineIndex) =>
        set(state => {
          const territoryHeadlines = state.starredItems.headlines[territoryId] || [];
          const isCurrentlyStarred = territoryHeadlines.includes(headlineIndex);

          if (isCurrentlyStarred) {
            const updatedHeadlines = territoryHeadlines.filter(index => index !== headlineIndex);

            if (updatedHeadlines.length === 0) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { [territoryId]: _removed, ...remainingHeadlines } =
                state.starredItems.headlines;
              return {
                starredItems: {
                  ...state.starredItems,
                  headlines: remainingHeadlines,
                },
              };
            } else {
              return {
                starredItems: {
                  ...state.starredItems,
                  headlines: {
                    ...state.starredItems.headlines,
                    [territoryId]: updatedHeadlines,
                  },
                },
              };
            }
          } else {
            return {
              starredItems: {
                ...state.starredItems,
                headlines: {
                  ...state.starredItems.headlines,
                  [territoryId]: [...territoryHeadlines, headlineIndex],
                },
              },
            };
          }
        }),

      clearStarredItems: () =>
        set({
          starredItems: { territories: [], headlines: {} },
        }),

      // Reset functions
      resetGeneration: () =>
        set({
          brief: '',
          isGenerating: false,
          showOutput: false,
          generatedOutput: null,
          error: '',
          showBriefAnalysis: false,
          briefAnalysis: null,
          enhancedBriefAnalysis: null,
          isAnalyzingBrief: false,
          realTimeAnalysis: null,
          showEnhancedAnalysis: false,
          territoryEvolutions: {},
          evolutionSuggestions: [],
          performancePredictions: {},
          isEvolvingTerritory: false,
          showEvolutionPanel: false,
          selectedTerritoryForEvolution: null,
        }),

      resetAll: () =>
        set({
          brief: '',
          isGenerating: false,
          showOutput: false,
          generatedOutput: null,
          error: '',
          showBriefAnalysis: false,
          briefAnalysis: null,
          enhancedBriefAnalysis: null,
          isAnalyzingBrief: false,
          realTimeAnalysis: null,
          showEnhancedAnalysis: false,
          territoryEvolutions: {},
          evolutionSuggestions: [],
          evolutionHistory: {},
          performancePredictions: {},
          isEvolvingTerritory: false,
          showEvolutionPanel: false,
          selectedTerritoryForEvolution: null,
          prompts: DEFAULT_PROMPTS,
          apiKeys: { openai: '' },
          apiKeysSaved: false,
          generateImages: false,
          showAdmin: false,
          showAssets: false,
          showToast: false,
          toastMessage: '',
          toastType: 'success',
          starredItems: { territories: [], headlines: {} },
        }),
    }),
    {
      name: APP_CONFIG.storage.keys.appState,
      partialize: state => ({
        // Only persist certain parts of the state
        prompts: state.prompts,
        apiKeys: state.apiKeys,
        generateImages: state.generateImages,
        starredItems: state.starredItems,
      }),
    }
  )
);
