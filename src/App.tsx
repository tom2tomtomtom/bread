import React from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { GenerationController } from './components/generation/GenerationController';
import { ConfigurationManager } from './components/configuration/ConfigurationManager';
import { useAppStore } from './stores/appStore';
import { generateWithOpenAI } from './services/secureApiService';
import {
  analyzeBrief,
  enhanceGeneratedOutput,
  mergeWithStarredContent,
} from './services/enhancementService';
import { APP_CONFIG } from './config/app';

// Types are now imported from types/index.ts
export type {
  Headline,
  Territory,
  ComplianceData,
  GeneratedOutput,
  Prompts,
  ApiKeys,
} from './types';

const BreadApp: React.FC = () => {
  // Zustand store - centralized state management
  const {
    // State
    brief,
    isGenerating,
    showOutput,
    generatedOutput,
    error,
    showBriefAnalysis,
    briefAnalysis,
    prompts,
    apiKeys,
    apiKeysSaved,
    generateImages,
    showAdmin,
    showToast,
    toastMessage,
    toastType,
    starredItems,

    // Actions
    setBrief,
    setIsGenerating,
    setShowOutput,
    setGeneratedOutput,
    setError,
    setShowBriefAnalysis,
    setBriefAnalysis,
    updatePrompt,
    updateApiKey,
    setApiKeysSaved,
    setGenerateImages,
    setShowAdmin,
    showToastMessage,
    hideToast,
    toggleTerritoryStarred,
    toggleHeadlineStarred,
    clearStarredItems,
    resetGeneration,
  } = useAppStore();

  // Event handlers
  const handleMomentSelect = (moment: { name: string; date: string }) => {
    const momentText = `\n\n📅 CAMPAIGN MOMENT: ${moment.name} (${moment.date})`;
    setBrief(brief + momentText);
  };

  const handleGenerate = async (regenerateMode: boolean = false) => {
    if (!brief.trim()) {
      setError(APP_CONFIG.errors.generation.noBrief);
      return;
    }

    setIsGenerating(true);
    setError('');
    if (!regenerateMode) {
      setShowOutput(false);
    }
    setShowBriefAnalysis(false);

    try {
      console.log('🚀 Starting generation process...');

      // Analyze brief for insights
      const analysis = await analyzeBrief(brief);
      setBriefAnalysis(analysis);
      setShowBriefAnalysis(true);

      // Build the full prompt
      const fullPrompt = `${prompts.systemInstructions}

${prompts.brandGuidelines}

${prompts.territoryPrompt}

${prompts.headlinePrompt}

${prompts.compliancePrompt}

BRIEF TO ADDRESS:
${brief}

Please provide a structured response with territories, headlines, and compliance guidance that DIRECTLY ADDRESSES THE BRIEF.`;

      // Generate with OpenAI (now secure server-side)
      const result = await generateWithOpenAI(fullPrompt, generateImages, brief);

      // Enhance the output with confidence scoring
      let enhancedResult = enhanceGeneratedOutput(result, brief);

      // If regenerating, merge with existing starred content
      if (regenerateMode && generatedOutput) {
        enhancedResult = mergeWithStarredContent(enhancedResult, generatedOutput, starredItems);
      }

      setGeneratedOutput(enhancedResult);
      setShowOutput(true);

      showToastMessage(APP_CONFIG.success.generation, 'success');
      console.log('✅ Generation completed successfully');
    } catch (error: any) {
      console.error('❌ Generation failed:', error);
      const errorMessage = error.message || APP_CONFIG.errors.generation.apiError;
      setError(errorMessage);
      showToastMessage(errorMessage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewBrief = () => {
    resetGeneration();
    clearStarredItems();
  };

  const handleRegenerateUnstarred = () => {
    handleGenerate(true);
  };

  return (
    <MainLayout
      showAdmin={showAdmin}
      onAdminToggle={() => setShowAdmin(!showAdmin)}
      generateImages={generateImages}
      apiStatus={{
        openaiReady: true, // Always true with server-side setup
        imagesEnabled: generateImages,
      }}
    >
      <GenerationController
        brief={brief}
        setBrief={setBrief}
        isGenerating={isGenerating}
        error={error}
        showOutput={showOutput}
        generatedOutput={generatedOutput}
        showBriefAnalysis={showBriefAnalysis}
        briefAnalysis={briefAnalysis}
        starredItems={starredItems}
        apiKeys={apiKeys}
        onGenerate={() => handleGenerate()}
        onMomentSelect={handleMomentSelect}
        onNewBrief={handleNewBrief}
        onRegenerateUnstarred={handleRegenerateUnstarred}
        onToggleTerritoryStarred={toggleTerritoryStarred}
        onToggleHeadlineStarred={toggleHeadlineStarred}
        onBriefAnalysisToggle={() => setShowBriefAnalysis(!showBriefAnalysis)}
      />

      <ConfigurationManager
        showAdmin={showAdmin}
        onAdminClose={() => setShowAdmin(false)}
        prompts={prompts}
        apiKeys={apiKeys}
        apiKeysSaved={apiKeysSaved}
        generateImages={generateImages}
        showToast={showToast}
        toastMessage={toastMessage}
        toastType={toastType}
        onPromptUpdate={updatePrompt}
        onApiKeyUpdate={updateApiKey}
        onSaveApiKeys={() => {
          setApiKeysSaved(true);
          showToastMessage(APP_CONFIG.success.apiKey, 'success');
        }}
        onSaveConfiguration={() => {
          showToastMessage(APP_CONFIG.success.save, 'success');
        }}
        onGenerateImagesToggle={setGenerateImages}
        onToastClose={hideToast}
      />
    </MainLayout>
  );
};

export default BreadApp;
