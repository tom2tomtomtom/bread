import React, { ReactNode } from 'react';
import { AppErrorBoundary } from '../common/AppErrorBoundary';
import { SecurityProvider } from './SecurityProvider';
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
 * 2. SecurityProvider - Manages client-side security features
 * 3. AuthenticationProvider - Manages authentication state
 * 4. ConfigurationProvider - Manages app configuration
 * 5. UIStateManager - Manages UI state and interactions
 * 6. GenerationOrchestrator - Manages content generation
 * 7. Children - The actual app components
 *
 * SECURITY HARDENING COMPLETE:
 * - Client-side CSRF protection
 * - Input validation and sanitization
 * - Rate limiting
 * - Secure API request handling
 * - Security event logging
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AppErrorBoundary>
      <SecurityProvider>
        <AuthenticationProvider>
          <ConfigurationProvider>
            <UIStateManager>
              <GenerationOrchestrator>
                {children}
              </GenerationOrchestrator>
            </UIStateManager>
          </ConfigurationProvider>
        </AuthenticationProvider>
      </SecurityProvider>
    </AppErrorBoundary>
  );
};

export default AppProviders;
