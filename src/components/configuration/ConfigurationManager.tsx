import React from 'react';
import { AdminPanel } from '../AdminPanel';
import { Toast } from '../Toast';
import { Prompts, ApiKeys, ToastType } from '../../types';

interface ConfigurationManagerProps {
  // Admin panel state
  showAdmin: boolean;
  onAdminClose: () => void;

  // Configuration state
  prompts: Prompts;
  apiKeys: ApiKeys;
  apiKeysSaved: boolean;
  generateImages: boolean;

  // Toast state
  showToast: boolean;
  toastMessage: string;
  toastType: ToastType;

  // Event handlers
  onPromptUpdate: (key: keyof Prompts, value: string) => void;
  onApiKeyUpdate: (provider: keyof ApiKeys, key: string) => void;
  onSaveApiKeys: () => void;
  onSaveConfiguration: () => void;
  onGenerateImagesToggle: (enabled: boolean) => void;
  onToastClose: () => void;
}

export const ConfigurationManager: React.FC<ConfigurationManagerProps> = ({
  showAdmin,
  onAdminClose,
  prompts,
  apiKeys,
  apiKeysSaved,
  generateImages,
  showToast,
  toastMessage,
  toastType,
  onPromptUpdate,
  onApiKeyUpdate,
  onSaveApiKeys,
  onSaveConfiguration,
  onGenerateImagesToggle,
  onToastClose,
}) => {
  return (
    <>
      {/* Admin Panel Overlay */}
      {showAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onAdminClose}
          ></div>
          <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <AdminPanel
              prompts={prompts}
              apiKeys={apiKeys}
              apiKeysSaved={apiKeysSaved}
              generateImages={generateImages}
              onPromptUpdate={onPromptUpdate}
              onApiKeyUpdate={onApiKeyUpdate}
              onSaveApiKeys={onSaveApiKeys}
              onSaveConfiguration={onSaveConfiguration}
              onGenerateImagesToggle={onGenerateImagesToggle}
              onClose={onAdminClose}
            />
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <Toast message={toastMessage} type={toastType} isVisible={showToast} onClose={onToastClose} />
    </>
  );
};
