/**
 * Focused Store Types
 *
 * Type definitions for the focused store architecture.
 * These types are extracted from the individual store files for better organization.
 */

import {
  EnhancedGeneratedOutput,
  BriefAnalysis,
  EnhancedBriefAnalysis,
  RealTimeAnalysis,
  ToastType,
  Prompts,
  ApiKeys,
  TerritoryEvolution,
  EvolutionSuggestion,
  EvolutionHistory,
  PerformancePrediction,
  StarredItems,
} from '../types';

/**
 * Generation Store State
 */
export interface GenerationState {
  // Brief and generation state
  brief: string;
  isGenerating: boolean;
  showOutput: boolean;
  generatedOutput: EnhancedGeneratedOutput | null;
  error: string;

  // Basic brief analysis
  showBriefAnalysis: boolean;
  briefAnalysis: BriefAnalysis | null;

  // Enhanced Brief Intelligence state
  enhancedBriefAnalysis: EnhancedBriefAnalysis | null;
  isAnalyzingBrief: boolean;
  realTimeAnalysis: RealTimeAnalysis | null;
  showEnhancedAnalysis: boolean;

  // Actions
  setBrief: (brief: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setShowOutput: (show: boolean) => void;
  setGeneratedOutput: (output: EnhancedGeneratedOutput | null) => void;
  setError: (error: string) => void;

  // Basic brief analysis actions
  setShowBriefAnalysis: (show: boolean) => void;
  setBriefAnalysis: (analysis: BriefAnalysis | null) => void;

  // Enhanced Brief Intelligence actions
  setEnhancedBriefAnalysis: (analysis: EnhancedBriefAnalysis | null) => void;
  setIsAnalyzingBrief: (analyzing: boolean) => void;
  setRealTimeAnalysis: (analysis: RealTimeAnalysis | null) => void;
  setShowEnhancedAnalysis: (show: boolean) => void;
  analyzeEnhancedBrief: () => Promise<void>;
  updateRealTimeAnalysis: (brief: string) => void;

  // Reset functions
  resetGeneration: () => void;
  resetAll: () => void;
}

/**
 * UI Store State
 */
export interface UIState {
  // Panel visibility
  showAdmin: boolean;
  showAssets: boolean;
  showEvolutionPanel: boolean;
  showTemplateSelector: boolean;

  // Toast notifications
  showToast: boolean;
  toastMessage: string;
  toastType: ToastType;

  // Loading states (UI-specific)
  isLoadingTemplates: boolean;
  isGeneratingRecommendations: boolean;

  // UI preferences
  theme: 'light' | 'dark' | 'auto';
  sidebarCollapsed: boolean;
  compactMode: boolean;

  // Actions
  setShowAdmin: (show: boolean) => void;
  setShowAssets: (show: boolean) => void;
  setShowEvolutionPanel: (show: boolean) => void;
  setShowTemplateSelector: (show: boolean) => void;

  // Toast actions
  showToastMessage: (message: string, type: ToastType) => void;
  hideToast: () => void;

  // Loading state actions
  setIsLoadingTemplates: (loading: boolean) => void;
  setIsGeneratingRecommendations: (generating: boolean) => void;

  // UI preference actions
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCompactMode: (compact: boolean) => void;

  // Utility actions
  closeAllPanels: () => void;
  resetUI: () => void;
}

/**
 * Config Store State
 */
export interface ConfigState {
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

/**
 * Territory Store State
 */
export interface TerritoryState {
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

/**
 * Starred Store State
 */
export interface StarredState {
  // Starred items data
  starredItems: StarredItems;

  // Starred items metadata
  starredMetadata: {
    territories: {
      [territoryId: string]: {
        starredAt: string;
        notes?: string;
        tags?: string[];
      };
    };
    headlines: {
      [territoryId: string]: {
        [headlineIndex: number]: {
          starredAt: string;
          notes?: string;
          tags?: string[];
        };
      };
    };
  };

  // Organization features
  collections: {
    id: string;
    name: string;
    description?: string;
    territoryIds: string[];
    headlineRefs: { territoryId: string; headlineIndex: number }[];
    createdAt: string;
    updatedAt: string;
  }[];

  // Actions
  toggleTerritoryStarred: (territoryId: string) => void;
  toggleHeadlineStarred: (territoryId: string, headlineIndex: number) => void;
  clearStarredItems: () => void;

  // Advanced starred operations
  addTerritoryNote: (territoryId: string, note: string) => void;
  addHeadlineNote: (territoryId: string, headlineIndex: number, note: string) => void;
  addTerritoryTags: (territoryId: string, tags: string[]) => void;
  addHeadlineTags: (territoryId: string, headlineIndex: number, tags: string[]) => void;

  // Collection management
  createCollection: (name: string, description?: string) => string;
  addToCollection: (
    collectionId: string,
    territoryId?: string,
    headlineRef?: { territoryId: string; headlineIndex: number }
  ) => void;
  removeFromCollection: (
    collectionId: string,
    territoryId?: string,
    headlineRef?: { territoryId: string; headlineIndex: number }
  ) => void;
  deleteCollection: (collectionId: string) => void;
  updateCollection: (
    collectionId: string,
    updates: { name?: string; description?: string }
  ) => void;

  // Query and analytics
  getStarredCount: () => { territories: number; headlines: number };
  getStarredByTag: (tag: string) => {
    territories: string[];
    headlines: { territoryId: string; headlineIndex: number }[];
  };
  getRecentlyStarred: (limit?: number) => {
    territories: string[];
    headlines: { territoryId: string; headlineIndex: number }[];
  };
  getStarredAnalytics: () => {
    totalStarred: number;
    starredByMonth: { [month: string]: number };
    topTags: { tag: string; count: number }[];
    collections: number;
  };

  // Export functionality
  exportStarredItems: (format: 'json' | 'csv' | 'pdf') => Promise<void>;
  exportCollection: (collectionId: string, format: 'json' | 'csv' | 'pdf') => Promise<void>;
}

/**
 * Store Health Check Result
 */
export interface StoreHealthCheck {
  sizes: {
    generation: number;
    ui: number;
    config: number;
    territory: number;
    starred: number;
    assets: number;
    total: number;
  };
  issues: string[];
  warnings: string[];
  healthy: boolean;
  timestamp: string;
}

/**
 * Migration Validation Result
 */
export interface MigrationValidation {
  valid: boolean;
  issues: string[];
  warnings: string[];
  timestamp: string;
}
