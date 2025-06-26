import React from 'react';
import { ConfigurationManager } from './ConfigurationManager';
import { useConfigStore, useUIStore } from '../../stores';

/**
 * ConnectedConfigurationManager - Connects stores to ConfigurationManager
 * 
 * This component bridges the new store architecture with the existing
 * ConfigurationManager component, providing all required props from stores.
 */
export const ConnectedConfigurationManager: React.FC = () => {
  // Get state from stores
  const {
    prompts,
    apiKeys,
    apiKeysSaved,
    generateImages,
    onPromptUpdate,
    onApiKeyUpdate,
    onSaveApiKeys,
    onSaveConfiguration,
    onGenerateImagesToggle,
  } = useConfigStore();

  const {
    showAdmin,
    showToast,
    toastMessage,
    toastType,
    setShowAdmin,
    onToastClose,
  } = useUIStore();

  // Event handlers
  const handleAdminClose = () => setShowAdmin(false);

  return (
    <ConfigurationManager
      // Admin panel state
      showAdmin={showAdmin}
      onAdminClose={handleAdminClose}
      
      // Configuration state
      prompts={prompts}
      apiKeys={apiKeys}
      apiKeysSaved={apiKeysSaved}
      generateImages={generateImages}
      
      // Toast state
      showToast={showToast}
      toastMessage={toastMessage}
      toastType={toastType}
      
      // Event handlers
      onPromptUpdate={onPromptUpdate}
      onApiKeyUpdate={onApiKeyUpdate}
      onSaveApiKeys={onSaveApiKeys}
      onSaveConfiguration={onSaveConfiguration}
      onGenerateImagesToggle={onGenerateImagesToggle}
      onToastClose={onToastClose}
    />
  );
};
