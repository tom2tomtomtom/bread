import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Prompts, ApiKeys } from '../types';
import { DEFAULT_PROMPTS } from '../config/prompts';
import { APP_CONFIG } from '../config/app';

/**
 * ConfigStore - Focused store for configuration management
 * 
 * Responsibilities:
 * - API keys management
 * - Prompts configuration
 * - Feature flags
 * - User preferences
 * - Application settings
 * 
 * Benefits:
 * - Centralized configuration management
 * - Secure API key handling
 * - Easy feature flag management
 * - Clear separation of configuration concerns
 */

interface ConfigState {
  // Configuration state
  prompts: Prompts;
  apiKeys: ApiKeys;
  apiKeysSaved: boolean;
  generateImages: boolean;

  // Feature flags
  features: {
    imageGeneration: boolean;
    briefAnalysis: boolean;
    territoryEvolution: boolean;
    campaignTemplates: boolean;
    assetManagement: boolean;
    enhancedAnalytics: boolean;
  };

  // User preferences
  preferences: {
    autoSave: boolean;
    showConfidenceScores: boolean;
    defaultTerritoryCount: number;
    defaultHeadlinesPerTerritory: number;
    exportFormat: 'pdf' | 'docx' | 'json';
  };

  // Actions
  updatePrompt: (key: keyof Prompts, value: string) => void;
  updateApiKey: (provider: keyof ApiKeys, key: string) => void;
  setApiKeysSaved: (saved: boolean) => void;
  setGenerateImages: (enabled: boolean) => void;

  // Feature flag actions
  toggleFeature: (feature: keyof ConfigState['features']) => void;
  setFeature: (feature: keyof ConfigState['features'], enabled: boolean) => void;

  // Preference actions
  updatePreference: <K extends keyof ConfigState['preferences']>(
    key: K, 
    value: ConfigState['preferences'][K]
  ) => void;

  // Utility actions
  resetPrompts: () => void;
  clearApiKeys: () => void;
  resetPreferences: () => void;
  resetAll: () => void;

  // Validation
  validateApiKeys: () => { valid: boolean; missing: string[] };
  validatePrompts: () => { valid: boolean; issues: string[] };
}

const DEFAULT_FEATURES = {
  imageGeneration: true,
  briefAnalysis: true,
  territoryEvolution: true,
  campaignTemplates: true,
  assetManagement: true,
  enhancedAnalytics: false, // Premium feature
};

const DEFAULT_PREFERENCES = {
  autoSave: true,
  showConfidenceScores: true,
  defaultTerritoryCount: APP_CONFIG.generation.defaultTerritoryCount,
  defaultHeadlinesPerTerritory: APP_CONFIG.generation.defaultHeadlinesPerTerritory,
  exportFormat: 'pdf' as const,
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      // Initial state
      prompts: DEFAULT_PROMPTS,
      apiKeys: { openai: '' },
      apiKeysSaved: false,
      generateImages: false,
      features: DEFAULT_FEATURES,
      preferences: DEFAULT_PREFERENCES,

      // Prompt actions
      updatePrompt: (key: keyof Prompts, value: string) =>
        set((state) => ({
          prompts: { ...state.prompts, [key]: value },
        })),

      // API key actions
      updateApiKey: (provider: keyof ApiKeys, key: string) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
          apiKeysSaved: false, // Reset saved status when keys change
        })),

      setApiKeysSaved: (apiKeysSaved: boolean) => set({ apiKeysSaved }),
      setGenerateImages: (generateImages: boolean) => set({ generateImages }),

      // Feature flag actions
      toggleFeature: (feature: keyof ConfigState['features']) =>
        set((state) => ({
          features: { ...state.features, [feature]: !state.features[feature] },
        })),

      setFeature: (feature: keyof ConfigState['features'], enabled: boolean) =>
        set((state) => ({
          features: { ...state.features, [feature]: enabled },
        })),

      // Preference actions
      updatePreference: <K extends keyof ConfigState['preferences']>(
        key: K, 
        value: ConfigState['preferences'][K]
      ) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        })),

      // Utility actions
      resetPrompts: () => set({ prompts: DEFAULT_PROMPTS }),

      clearApiKeys: () => set({ 
        apiKeys: { openai: '' }, 
        apiKeysSaved: false 
      }),

      resetPreferences: () => set({ preferences: DEFAULT_PREFERENCES }),

      resetAll: () => set({
        prompts: DEFAULT_PROMPTS,
        apiKeys: { openai: '' },
        apiKeysSaved: false,
        generateImages: false,
        features: DEFAULT_FEATURES,
        preferences: DEFAULT_PREFERENCES,
      }),

      // Validation
      validateApiKeys: () => {
        const { apiKeys } = get();
        const missing: string[] = [];
        
        if (!apiKeys.openai?.trim()) {
          missing.push('OpenAI API Key');
        }

        return {
          valid: missing.length === 0,
          missing,
        };
      },

      validatePrompts: () => {
        const { prompts } = get();
        const issues: string[] = [];

        // Check for empty prompts
        Object.entries(prompts).forEach(([key, value]) => {
          if (!value?.trim()) {
            issues.push(`${key} prompt is empty`);
          }
        });

        // Check for minimum prompt lengths
        if (prompts.systemInstructions && prompts.systemInstructions.length < 50) {
          issues.push('System prompt is too short (minimum 50 characters)');
        }

        return {
          valid: issues.length === 0,
          issues,
        };
      },
    }),
    {
      name: `${APP_CONFIG.storage.keys.appState}-config`,
      partialize: (state) => ({
        // Persist all configuration data
        prompts: state.prompts,
        apiKeys: state.apiKeys,
        apiKeysSaved: state.apiKeysSaved,
        generateImages: state.generateImages,
        features: state.features,
        preferences: state.preferences,
      }),
    }
  )
);
