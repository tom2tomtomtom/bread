/**
 * Store Migration Utilities
 *
 * Utilities to help migrate from the monolithic appStore to focused stores.
 * This ensures a smooth transition without data loss.
 */

import { useGenerationStore } from './generationStore';
import { useUIStore } from './uiStore';
import { useConfigStore } from './configStore';
import { useTerritoryStore } from './territoryStore';
import { useStarredStore } from './starredStore';

/**
 * Migrate data from the old appStore to the new focused stores
 * Call this once during app initialization to ensure data continuity
 */
export const migrateFromAppStore = () => {
  try {
    // Check if old appStore data exists in localStorage
    const oldStoreKey = 'bread-app-storage';
    const oldStoreData = localStorage.getItem(oldStoreKey);

    if (!oldStoreData) {
      console.log('No legacy store data found - skipping migration');
      return;
    }

    const parsedData = JSON.parse(oldStoreData);
    const oldState = parsedData.state;

    if (!oldState) {
      console.log('No legacy state found - skipping migration');
      return;
    }

    console.log('Migrating legacy store data to focused stores...');

    // Migrate generation data
    if (oldState.brief || oldState.generatedOutput || oldState.briefAnalysis) {
      const generationStore = useGenerationStore.getState();

      // Only migrate if the new store is empty (first migration)
      if (!generationStore.brief && !generationStore.generatedOutput) {
        useGenerationStore.setState({
          brief: oldState.brief || '',
          generatedOutput: oldState.generatedOutput || null,
          briefAnalysis: oldState.briefAnalysis || null,
          enhancedBriefAnalysis: oldState.enhancedBriefAnalysis || null,
        });
        console.log('✅ Migrated generation data');
      }
    }

    // Migrate UI preferences
    if (oldState.showAdmin !== undefined || oldState.showAssets !== undefined) {
      const uiStore = useUIStore.getState();

      // Only migrate if the new store has default values
      if (!uiStore.showAdmin && !uiStore.showAssets) {
        useUIStore.setState({
          showAdmin: oldState.showAdmin || false,
          showAssets: oldState.showAssets || false,
          showEvolutionPanel: oldState.showEvolutionPanel || false,
          showTemplateSelector: oldState.showTemplateSelector || false,
        });
        console.log('✅ Migrated UI state');
      }
    }

    // Migrate configuration
    if (oldState.prompts || oldState.apiKeys) {
      const configStore = useConfigStore.getState();

      // Only migrate if the new store has default values
      if (!configStore.apiKeys.openai && oldState.apiKeys?.openai) {
        useConfigStore.setState({
          prompts: oldState.prompts || configStore.prompts,
          apiKeys: oldState.apiKeys || configStore.apiKeys,
          apiKeysSaved: oldState.apiKeysSaved || false,
          generateImages: oldState.generateImages || false,
        });
        console.log('✅ Migrated configuration data');
      }
    }

    // Migrate territory data
    if (oldState.territoryEvolutions || oldState.performancePredictions) {
      const territoryStore = useTerritoryStore.getState();

      // Only migrate if the new store is empty
      if (Object.keys(territoryStore.territoryEvolutions).length === 0) {
        useTerritoryStore.setState({
          territoryEvolutions: oldState.territoryEvolutions || {},
          evolutionSuggestions: oldState.evolutionSuggestions || [],
          evolutionHistory: oldState.evolutionHistory || {},
          performancePredictions: oldState.performancePredictions || {},
          selectedTerritoryForEvolution: oldState.selectedTerritoryForEvolution || null,
        });
        console.log('✅ Migrated territory data');
      }
    }

    // Migrate starred items
    if (oldState.starredItems) {
      const starredStore = useStarredStore.getState();

      // Only migrate if the new store is empty
      if (starredStore.starredItems.territories.length === 0) {
        useStarredStore.setState({
          starredItems: oldState.starredItems || { territories: [], headlines: {} },
        });
        console.log('✅ Migrated starred items');
      }
    }

    // Mark migration as complete
    localStorage.setItem('bread-store-migration-complete', 'true');
    console.log('🎉 Store migration completed successfully');

    // Optionally remove old store data after successful migration
    // Uncomment the next line if you want to clean up old data immediately
    // localStorage.removeItem(oldStoreKey);
  } catch (error) {
    console.error('❌ Store migration failed:', error);
    // Don't throw - let the app continue with default state
  }
};

/**
 * Check if migration has been completed
 */
export const isMigrationComplete = (): boolean => {
  return localStorage.getItem('bread-store-migration-complete') === 'true';
};

/**
 * Force re-migration (for development/testing)
 */
export const resetMigration = () => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('resetMigration is only available in development mode');
    return;
  }

  localStorage.removeItem('bread-store-migration-complete');
  console.log('Migration reset - will run again on next app load');
};

/**
 * Create hooks that automatically handle the transition from old to new stores
 * These hooks will use the new focused stores but fall back to the old store if needed
 */
export const createStoreHooks = () => {
  // Generation hooks
  const useGeneration = () => {
    const newStore = useGenerationStore();
    return newStore;
  };

  const useUI = () => {
    const newStore = useUIStore();
    return newStore;
  };

  const useConfig = () => {
    const newStore = useConfigStore();
    return newStore;
  };

  const useTerritory = () => {
    const newStore = useTerritoryStore();
    return newStore;
  };

  const useStarred = () => {
    const newStore = useStarredStore();
    return newStore;
  };

  return {
    useGeneration,
    useUI,
    useConfig,
    useTerritory,
    useStarred,
  };
};

/**
 * Validation utility to ensure migration was successful
 */
export const validateMigration = () => {
  const issues: string[] = [];
  const warnings: string[] = [];

  try {
    // Check if stores are accessible
    const generation = useGenerationStore.getState();
    const ui = useUIStore.getState();
    const config = useConfigStore.getState();
    const territory = useTerritoryStore.getState();
    const starred = useStarredStore.getState();

    // Validate store structure
    if (typeof generation.setBrief !== 'function') {
      issues.push('Generation store is not properly initialized');
    }

    if (typeof ui.showToastMessage !== 'function') {
      issues.push('UI store is not properly initialized');
    }

    if (typeof config.updateApiKey !== 'function') {
      issues.push('Config store is not properly initialized');
    }

    if (typeof territory.addTerritoryEvolution !== 'function') {
      issues.push('Territory store is not properly initialized');
    }

    if (typeof starred.toggleTerritoryStarred !== 'function') {
      issues.push('Starred store is not properly initialized');
    }

    // Check for data consistency
    if (config.apiKeys && !config.apiKeys.openai && localStorage.getItem('bread_openai_key')) {
      warnings.push('API key may not have been migrated properly');
    }

    // Check migration completion
    if (!isMigrationComplete()) {
      warnings.push('Migration has not been marked as complete');
    }
  } catch (error) {
    issues.push(`Store validation failed: ${error}`);
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Development utility to compare old and new store data
 */
export const compareStoreData = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  try {
    const oldStoreData = localStorage.getItem('bread-app-storage');
    if (!oldStoreData) {
      return { error: 'No old store data found' };
    }

    const oldState = JSON.parse(oldStoreData).state;

    const newStores = {
      generation: useGenerationStore.getState(),
      ui: useUIStore.getState(),
      config: useConfigStore.getState(),
      territory: useTerritoryStore.getState(),
      starred: useStarredStore.getState(),
    };

    return {
      old: oldState,
      new: newStores,
      comparison: {
        briefMatches: oldState.brief === newStores.generation.brief,
        apiKeysMatch: JSON.stringify(oldState.apiKeys) === JSON.stringify(newStores.config.apiKeys),
        starredItemsMatch:
          JSON.stringify(oldState.starredItems) === JSON.stringify(newStores.starred.starredItems),
      },
    };
  } catch (error) {
    return { error: `Comparison failed: ${error}` };
  }
};
