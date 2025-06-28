import React, { ReactNode } from 'react';
import { useAppStore } from '../../stores/appStore';
import { APP_CONFIG } from '../../config/app';

interface ConfigurationProviderProps {
  children: ReactNode;
}

/**
 * ConfigurationProvider - Handles all configuration and settings
 * Responsibilities:
 * - API configuration management
 * - Prompt management
 * - Feature toggles
 * - Configuration persistence
 * - Settings validation
 */
export const ConfigurationProvider: React.FC<ConfigurationProviderProps> = ({ children }) => {
  const {
    // Configuration State
    prompts,
    apiKeys,
    apiKeysSaved,
    generateImages,

    // Configuration Actions
    updatePrompt,
    updateApiKey,
    setApiKeysSaved,
    setGenerateImages,
    showToastMessage,
  } = useAppStore();

  // Configuration Handlers
  const handlePromptUpdate = (promptType: keyof typeof prompts, value: string) => {
    updatePrompt(promptType, value);
  };

  const handleApiKeyUpdate = (provider: keyof typeof apiKeys, value: string) => {
    updateApiKey(provider, value);
  };

  const handleSaveApiKeys = () => {
    // Validate API keys before saving
    const hasValidKeys = Object.values(apiKeys).some(key => key.trim().length > 0);

    if (hasValidKeys) {
      setApiKeysSaved(true);
      showToastMessage(APP_CONFIG.success.apiKey, 'success');
    } else {
      showToastMessage('Please enter at least one API key', 'error');
    }
  };

  const handleSaveConfiguration = () => {
    // Save all configuration
    setApiKeysSaved(true);
    showToastMessage(APP_CONFIG.success.save, 'success');
  };

  const handleGenerateImagesToggle = (enabled: boolean) => {
    setGenerateImages(enabled);
    showToastMessage(`Image generation ${enabled ? 'enabled' : 'disabled'}`, 'info');
  };

  // Validation helpers
  const validateApiKey = (key: string): boolean => {
    return key.trim().length >= 10; // Basic validation
  };

  const validatePrompt = (prompt: string): boolean => {
    return prompt.trim().length >= 20; // Basic validation
  };

  const getApiStatus = () => {
    return {
      openaiReady: validateApiKey(apiKeys.openai) || true, // Always true with server-side setup
      imagesEnabled: generateImages,
      configurationComplete: apiKeysSaved,
    };
  };

  // Create configuration context value
  const configurationContextValue = {
    // State
    prompts,
    apiKeys,
    apiKeysSaved,
    generateImages,
    apiStatus: getApiStatus(),

    // Handlers
    handlePromptUpdate,
    handleApiKeyUpdate,
    handleSaveApiKeys,
    handleSaveConfiguration,
    handleGenerateImagesToggle,

    // Validation
    validateApiKey,
    validatePrompt,
  };

  return (
    <>
      {/* Pass configuration state and handlers to children */}
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...configurationContextValue,
          } as any);
        }
        return child;
      })}
    </>
  );
};

// Hook for accessing configuration in child components
export const useConfiguration = () => {
  const { prompts, apiKeys, apiKeysSaved, generateImages } = useAppStore();

  return {
    prompts,
    apiKeys,
    apiKeysSaved,
    generateImages,
    isConfigured: apiKeysSaved,
  };
};

export default ConfigurationProvider;
