import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Prompts, ApiKeys, StarredItems, ToastType } from '../types';
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

  // Configuration state
  prompts: Prompts;
  apiKeys: ApiKeys;
  apiKeysSaved: boolean;
  generateImages: boolean;

  // UI state
  showAdmin: boolean;
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

  updatePrompt: (key: keyof Prompts, value: string) => void;
  updateApiKey: (provider: keyof ApiKeys, key: string) => void;
  setApiKeysSaved: (saved: boolean) => void;
  setGenerateImages: (enabled: boolean) => void;

  setShowAdmin: (show: boolean) => void;
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
    (set, _get) => ({
      // Initial state
      brief: '',
      isGenerating: false,
      showOutput: false,
      generatedOutput: null,
      error: '',
      showBriefAnalysis: false,
      briefAnalysis: null,

      prompts: DEFAULT_PROMPTS,
      apiKeys: { openai: '' },
      apiKeysSaved: false,
      generateImages: false,

      showAdmin: false,
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
          prompts: DEFAULT_PROMPTS,
          apiKeys: { openai: '' },
          apiKeysSaved: false,
          generateImages: false,
          showAdmin: false,
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
