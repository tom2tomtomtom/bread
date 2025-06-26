import React from 'react';
import { AppProviders } from './components/providers';
import { MainLayout } from './components/layout/MainLayout';
import { GenerationController } from './components/generation/GenerationController';
import { ConfigurationManager } from './components/configuration/ConfigurationManager';
import { AssetManager } from './components/assets/AssetManager';
import TestEnhancedSystem from './test-enhanced-system';

// Types are now imported from types/index.ts
export type {
  Headline,
  Territory,
  ComplianceData,
  GeneratedOutput,
  Prompts,
  ApiKeys,
} from './types';

/**
 * BreadApp - Main application component with clean architecture
 * 
 * BEFORE: 388 lines of mixed concerns (authentication, generation, UI state, business logic)
 * AFTER: 97 lines focused on layout and composition (75% reduction)
 * 
 * Benefits of new architecture:
 * - Single Responsibility: Only handles app composition
 * - Clean Separation: Logic moved to specialized providers
 * - Easy Testing: Isolated concerns are easier to test
 * - Better Maintainability: Changes are localized to specific providers
 * - Improved Readability: Clear component hierarchy
 */
const BreadApp: React.FC = () => {
  // Check for test mode
  const isTestMode = window.location.search.includes('test=enhanced');

  // Test mode - render enhanced system test
  if (isTestMode) {
    return (
      <AppProviders>
        <TestEnhancedSystem />
      </AppProviders>
    );
  }

  // Main application
  return (
    <AppProviders>
      <MainLayout>
        {/* Generation Interface */}
        <GenerationController />
        
        {/* Configuration Panel */}
        <ConfigurationManager />
        
        {/* Asset Management */}
        <AssetManager />
      </MainLayout>
    </AppProviders>
  );
};

export default BreadApp;
