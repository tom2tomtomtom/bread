import React, { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { GenerationController } from './components/generation/GenerationController';
import { ConfigurationManager } from './components/configuration/ConfigurationManager';
import { useConfiguration } from './hooks/useConfiguration';
import { useGeneration } from './hooks/useGeneration';
import { useStarredItems } from './hooks/useStarredItems';

// Types are now imported from types/index.ts
export type { Headline, Territory, ComplianceData, GeneratedOutput, Prompts, ApiKeys } from './types';

const BreadApp: React.FC = () => {
  // Brief state
  const [brief, setBrief] = useState<string>('');

  // Custom hooks for organized state management
  const configuration = useConfiguration();
  const starredItems = useStarredItems();
  const generation = useGeneration({
    prompts: configuration.prompts,
    generateImages: configuration.generateImages,
    starredItems: starredItems.starredItems,
    onShowToast: configuration.showToastMessage
  });

  // Event handlers
  const handleMomentSelect = (moment: { name: string; date: string }) => {
    const momentText = `\n\n📅 CAMPAIGN MOMENT: ${moment.name} (${moment.date})`;
    setBrief(prev => prev + momentText);
  };

  const handleGenerate = () => {
    generation.handleGenerate(brief);
  };

  const handleNewBrief = () => {
    setBrief('');
    generation.handleNewBrief();
    starredItems.clearStarredItems();
  };

  const handleRegenerateUnstarred = () => {
    generation.handleRegenerateUnstarred(brief);
  };

  return (
    <MainLayout
      showAdmin={configuration.showAdmin}
      onAdminToggle={configuration.toggleAdmin}
      generateImages={configuration.generateImages}
      apiStatus={{
        openaiReady: true, // Always true with server-side setup
        imagesEnabled: configuration.generateImages
      }}
    >
      <GenerationController
        brief={brief}
        setBrief={setBrief}
        isGenerating={generation.isGenerating}
        error={generation.error}
        showOutput={generation.showOutput}
        generatedOutput={generation.generatedOutput}
        showBriefAnalysis={generation.showBriefAnalysis}
        briefAnalysis={generation.briefAnalysis}
        starredItems={starredItems.starredItems}
        apiKeys={configuration.apiKeys}
        onGenerate={handleGenerate}
        onMomentSelect={handleMomentSelect}
        onNewBrief={handleNewBrief}
        onRegenerateUnstarred={handleRegenerateUnstarred}
        onToggleTerritoryStarred={starredItems.toggleTerritoryStarred}
        onToggleHeadlineStarred={starredItems.toggleHeadlineStarred}
        onBriefAnalysisToggle={() => generation.setShowBriefAnalysis(prev => !prev)}
      />

      <ConfigurationManager
        showAdmin={configuration.showAdmin}
        onAdminClose={configuration.toggleAdmin}
        prompts={configuration.prompts}
        apiKeys={configuration.apiKeys}
        apiKeysSaved={configuration.apiKeysSaved}
        generateImages={configuration.generateImages}
        showToast={configuration.showToast}
        toastMessage={configuration.toastMessage}
        toastType={configuration.toastType}
        onPromptUpdate={configuration.updatePrompt}
        onApiKeyUpdate={configuration.updateApiKey}
        onSaveApiKeys={configuration.saveApiKeys}
        onSaveConfiguration={configuration.saveConfiguration}
        onGenerateImagesToggle={configuration.toggleGenerateImages}
        onToastClose={configuration.hideToast}
      />
    </MainLayout>
  );
};

export default BreadApp;