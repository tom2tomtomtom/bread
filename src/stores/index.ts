/**
 * Focused Store Architecture - Index
 * 
 * This file exports all the focused stores that replace the monolithic appStore.
 * Each store has a single responsibility and clear boundaries.
 * 
 * Migration Guide:
 * - useAppStore -> Use specific focused stores
 * - Generation state -> useGenerationStore
 * - UI state -> useUIStore
 * - Configuration -> useConfigStore
 * - Territory features -> useTerritoryStore
 * - Starred items -> useStarredStore
 * - Asset management -> useAssetStore (already exists)
 * 
 * Benefits:
 * - Better performance (smaller state updates)
 * - Easier testing (isolated concerns)
 * - Better maintainability (single responsibility)
 * - Clearer code organization
 */

// Import stores for local use
import { useGenerationStore } from './generationStore';
import { useUIStore } from './uiStore';
import { useConfigStore } from './configStore';
import { useTerritoryStore } from './territoryStore';
import { useStarredStore } from './starredStore';
import { useAssetStore } from './assetStore';
import { useAuthStore } from './authStore';

// Export all focused stores
export { useGenerationStore } from './generationStore';
export { useUIStore } from './uiStore';
export { useConfigStore } from './configStore';
export { useTerritoryStore } from './territoryStore';
export { useStarredStore } from './starredStore';
export { useAssetStore } from './assetStore';
export { useAuthStore } from './authStore';

// Keep the old store for backward compatibility during migration
export { useAppStore } from './appStore';

// Store migration utilities
export { migrateFromAppStore, createStoreHooks } from './migration';

// Types for the focused stores
export type {
  GenerationState,
  UIState,
  ConfigState,
  TerritoryState,
  StarredState,
} from './types';

/**
 * Composite hook for components that need multiple stores
 * Use this sparingly - prefer using individual stores when possible
 */
export const useCompositeStore = () => {
  const generation = useGenerationStore();
  const ui = useUIStore();
  const config = useConfigStore();
  const territory = useTerritoryStore();
  const starred = useStarredStore();
  const assets = useAssetStore();

  return {
    generation,
    ui,
    config,
    territory,
    starred,
    assets,
  };
};

/**
 * Hook for components that only need read access to multiple stores
 * More performant than useCompositeStore for read-only scenarios
 */
export const useStoreSelectors = () => {
  const brief = useGenerationStore(state => state.brief);
  const isGenerating = useGenerationStore(state => state.isGenerating);
  const showOutput = useGenerationStore(state => state.showOutput);
  const generatedOutput = useGenerationStore(state => state.generatedOutput);
  
  const showToast = useUIStore(state => state.showToast);
  const toastMessage = useUIStore(state => state.toastMessage);
  const toastType = useUIStore(state => state.toastType);
  
  const apiKeys = useConfigStore(state => state.apiKeys);
  const generateImages = useConfigStore(state => state.generateImages);
  
  const starredItems = useStarredStore(state => state.starredItems);
  
  return {
    // Generation state
    brief,
    isGenerating,
    showOutput,
    generatedOutput,
    
    // UI state
    showToast,
    toastMessage,
    toastType,
    
    // Config state
    apiKeys,
    generateImages,
    
    // Starred state
    starredItems,
  };
};

/**
 * Development helper to check store sizes
 * Useful for monitoring performance and identifying bloated stores
 */
export const getStoreSizes = () => {
  if (process.env.NODE_ENV !== 'development') {
    return {};
  }

  const generation = useGenerationStore.getState();
  const ui = useUIStore.getState();
  const config = useConfigStore.getState();
  const territory = useTerritoryStore.getState();
  const starred = useStarredStore.getState();
  const assets = useAssetStore.getState();

  const getSize = (obj: any) => JSON.stringify(obj).length;

  return {
    generation: getSize(generation),
    ui: getSize(ui),
    config: getSize(config),
    territory: getSize(territory),
    starred: getSize(starred),
    assets: getSize(assets),
    total: getSize({ generation, ui, config, territory, starred, assets }),
  };
};

/**
 * Development helper to reset all stores
 * Useful for testing and development
 */
export const resetAllStores = () => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('resetAllStores is only available in development mode');
    return;
  }

  useGenerationStore.getState().resetAll();
  useUIStore.getState().resetUI();
  useConfigStore.getState().resetAll();
  useTerritoryStore.getState().resetTerritoryState();
  useStarredStore.getState().clearStarredItems();
  // Note: Asset store has its own reset methods
};

/**
 * Store health check for monitoring
 * Returns information about store state and potential issues
 */
export const getStoreHealth = () => {
  const sizes = getStoreSizes();
  const generation = useGenerationStore.getState();
  const config = useConfigStore.getState();
  
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check for potential issues
  if (sizes.total && sizes.total > 1000000) { // 1MB
    issues.push('Total store size exceeds 1MB');
  }

  if (sizes.generation && sizes.generation > 500000) { // 500KB
    warnings.push('Generation store is large - consider cleanup');
  }

  if (!config.apiKeys.openai) {
    warnings.push('OpenAI API key not configured');
  }

  if (generation.error) {
    issues.push(`Generation error: ${generation.error}`);
  }

  return {
    sizes,
    issues,
    warnings,
    healthy: issues.length === 0,
    timestamp: new Date().toISOString(),
  };
};
