import React, { useEffect, useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { GenerationController } from './components/generation/GenerationController';
import { ConfigurationManager } from './components/configuration/ConfigurationManager';
import { AssetManager } from './components/assets/AssetManager';
import { AuthModal } from './components/auth';
import { useAppStore } from './stores/appStore';
import { useAuthStore } from './stores/authStore';
import { generateWithOpenAI } from './services/secureApiService';
import {
  analyzeBrief,
  enhanceGeneratedOutput,
  mergeWithStarredContent,
} from './services/enhancementService';
import { APP_CONFIG } from './config/app';
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

const BreadApp: React.FC = () => {
  // Check for test mode
  const isTestMode = window.location.search.includes('test=enhanced');

  // Authentication state
  const { isAuthenticated, user, getCurrentUser } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Asset integration state
  const [selectedAssets, setSelectedAssets] = useState<any[]>([]);

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
    enhancedBriefAnalysis,
    isAnalyzingBrief,
    showEnhancedAnalysis,
    territoryEvolutions,
    evolutionSuggestions,
    performancePredictions,
    isEvolvingTerritory,
    showEvolutionPanel,
    selectedTerritoryForEvolution,
    prompts,
    apiKeys,
    apiKeysSaved,
    generateImages,
    showAdmin,
    showAssets,
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
    analyzeEnhancedBrief,
    setShowEnhancedAnalysis,
    updateRealTimeAnalysis,
    generateEvolutionSuggestions,
    evolveTerritoryWithAI,
    predictTerritoryPerformance,
    setShowEvolutionPanel,
    setSelectedTerritoryForEvolution,
    updatePrompt,
    updateApiKey,
    setApiKeysSaved,
    setGenerateImages,
    setShowAdmin,
    setShowAssets,
    showToastMessage,
    hideToast,
    toggleTerritoryStarred,
    toggleHeadlineStarred,
    clearStarredItems,
    resetGeneration,
  } = useAppStore();

  // Check authentication on app load
  useEffect(() => {
    if (isAuthenticated && user) {
      getCurrentUser().catch(() => {
        // If getCurrentUser fails, user will be logged out automatically
      });
    }
  }, [isAuthenticated, user, getCurrentUser]);

  // Authentication handlers
  const handleShowLogin = () => {
    setAuthModalMode('login');
    setShowAuthModal(true);
  };

  const handleShowRegister = () => {
    setAuthModalMode('register');
    setShowAuthModal(true);
  };

  // Event handlers
  const handleMomentSelect = (moment: { name: string; date: string }) => {
    const momentText = `\n\n📅 CAMPAIGN MOMENT: ${moment.name} (${moment.date})`;
    setBrief(brief + momentText);
  };

  // Real-time brief analysis
  const handleBriefChange = (newBrief: string) => {
    setBrief(newBrief);
    // Debounced real-time analysis
    if (newBrief.trim().length > 10) {
      updateRealTimeAnalysis(newBrief);
    }
  };

  // Enhanced brief analysis handler
  const handleAnalyzeEnhancedBrief = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to analyze brief');
      handleShowLogin();
      return;
    }
    await analyzeEnhancedBrief();
  };

  // Apply brief suggestion handler
  const handleApplyBriefSuggestion = (suggestion: string) => {
    const enhancedBrief = `${brief}\n\n${suggestion}`;
    setBrief(enhancedBrief);
    showToastMessage('Suggestion applied to brief', 'success');
  };

  // Territory evolution handlers
  const handleGenerateEvolutionSuggestions = async (territoryId: string) => {
    if (!isAuthenticated) {
      setError('Please sign in to generate evolution suggestions');
      handleShowLogin();
      return;
    }
    await generateEvolutionSuggestions(territoryId);
  };

  const handleEvolveTerritoryWithAI = async (territoryId: string, suggestion: any) => {
    if (!isAuthenticated) {
      setError('Please sign in to evolve territories');
      handleShowLogin();
      return;
    }
    await evolveTerritoryWithAI(territoryId, suggestion);
    showToastMessage('Territory evolved successfully', 'success');
  };

  const handlePredictTerritoryPerformance = async (territoryId: string) => {
    if (!isAuthenticated) {
      setError('Please sign in to predict performance');
      handleShowLogin();
      return;
    }
    await predictTerritoryPerformance(territoryId);
  };

  const handleSelectTerritoryForEvolution = (territoryId: string | null) => {
    setSelectedTerritoryForEvolution(territoryId);
    if (territoryId) {
      setShowEvolutionPanel(true);
      handleGenerateEvolutionSuggestions(territoryId);
    }
  };

  const handleGenerate = async (regenerateMode: boolean = false) => {
    // Check authentication first
    if (!isAuthenticated) {
      setError('Please sign in to generate content');
      handleShowLogin();
      return;
    }

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

  // Render test page if in test mode
  if (isTestMode) {
    return <TestEnhancedSystem />;
  }

  return (
    <MainLayout
      showAdmin={showAdmin}
      onAdminToggle={() => setShowAdmin(!showAdmin)}
      generateImages={generateImages}
      apiStatus={{
        openaiReady: true, // Always true with server-side setup
        imagesEnabled: generateImages,
      }}
      onShowLogin={handleShowLogin}
      onShowRegister={handleShowRegister}
      onShowAssets={() => setShowAssets(true)}
    >
      <GenerationController
        brief={brief}
        setBrief={handleBriefChange}
        isGenerating={isGenerating}
        error={error}
        showOutput={showOutput}
        generatedOutput={generatedOutput}
        showBriefAnalysis={showBriefAnalysis}
        briefAnalysis={briefAnalysis}
        enhancedBriefAnalysis={enhancedBriefAnalysis}
        isAnalyzingBrief={isAnalyzingBrief}
        showEnhancedAnalysis={showEnhancedAnalysis}
        territoryEvolutions={territoryEvolutions}
        evolutionSuggestions={evolutionSuggestions}
        performancePredictions={performancePredictions}
        isEvolvingTerritory={isEvolvingTerritory}
        showEvolutionPanel={showEvolutionPanel}
        selectedTerritoryForEvolution={selectedTerritoryForEvolution}
        starredItems={starredItems}
        selectedAssets={selectedAssets}
        apiKeys={apiKeys}
        onGenerate={() => handleGenerate()}
        onMomentSelect={handleMomentSelect}
        onNewBrief={handleNewBrief}
        onRegenerateUnstarred={handleRegenerateUnstarred}
        onToggleTerritoryStarred={toggleTerritoryStarred}
        onToggleHeadlineStarred={toggleHeadlineStarred}
        onBriefAnalysisToggle={() => setShowBriefAnalysis(!showBriefAnalysis)}
        onAssetsChange={setSelectedAssets}
        onAnalyzeEnhancedBrief={handleAnalyzeEnhancedBrief}
        onToggleEnhancedAnalysis={() => setShowEnhancedAnalysis(!showEnhancedAnalysis)}
        onApplyBriefSuggestion={handleApplyBriefSuggestion}
        onGenerateEvolutionSuggestions={handleGenerateEvolutionSuggestions}
        onEvolveTerritoryWithAI={handleEvolveTerritoryWithAI}
        onPredictTerritoryPerformance={handlePredictTerritoryPerformance}
        onToggleEvolutionPanel={() => setShowEvolutionPanel(!showEvolutionPanel)}
        onSelectTerritoryForEvolution={handleSelectTerritoryForEvolution}
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

      {/* Asset Management */}
      {showAssets && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm">
          <div className="h-full overflow-y-auto">
            <div className="min-h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-white">Asset Management</h1>
                  <button
                    onClick={() => setShowAssets(false)}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-3 text-white transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <AssetManager />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </MainLayout>
  );
};

export default BreadApp;
