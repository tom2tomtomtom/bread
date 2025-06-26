import React, { ReactNode } from 'react';
import { AppErrorBoundary } from '../common/AppErrorBoundary';
import { AuthenticationProvider } from './AuthenticationProvider';
import { ConfigurationProvider } from './ConfigurationProvider';
import { UIStateManager } from './UIStateManager';
import { GenerationOrchestrator } from './GenerationOrchestrator';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * AppProviders - Combines all application providers in the correct order
 * 
 * Provider hierarchy (outer to inner):
 * 1. AppErrorBoundary - Catches and handles all errors
 * 2. AuthenticationProvider - Manages authentication state
 * 3. ConfigurationProvider - Manages app configuration
 * 4. UIStateManager - Manages UI state and interactions
 * 5. GenerationOrchestrator - Manages content generation
 * 6. Children - The actual app components
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AppErrorBoundary>
      <AuthenticationProvider>
        <ConfigurationProvider>
          <UIStateManager>
            <GenerationOrchestrator>
              {children}
            </GenerationOrchestrator>
          </UIStateManager>
        </ConfigurationProvider>
      </AuthenticationProvider>
    </AppErrorBoundary>
  );
};

export default AppProviders;
