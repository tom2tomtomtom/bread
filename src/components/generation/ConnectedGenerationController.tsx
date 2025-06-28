import React from 'react';
import { GenerationController } from './GenerationController';
import { 
  useGenerationStore, 
  useConfigStore, 
  useStarredStore, 
  useTerritoryStore, 
  useUIStore,
  useAssetStore 
} from '../../stores';
import type {
  TerritoryEvolution,
  EvolutionSuggestion,
  PerformancePrediction,
  UploadedAsset
} from '../../types';

/**
 * ConnectedGenerationController - Connects stores to GenerationController
 * 
 * This component bridges the new store architecture with the existing
 * GenerationController component, providing all required props from stores.
 */
export const ConnectedGenerationController: React.FC = () => {
  // Get state from stores
  const {
    brief,
    setBrief,
    isGenerating,
    error,
    showOutput,
    generatedOutput,
    showBriefAnalysis,
    briefAnalysis,
    enhancedBriefAnalysis,
    isAnalyzingBrief,
    showEnhancedAnalysis,
    generate,
    setShowBriefAnalysis,
    analyzeEnhancedBrief,
    setShowEnhancedAnalysis,
  } = useGenerationStore();
  
  // Create wrapper functions for the component interface
  const onGenerate = generate;
  const onNewBrief = () => setBrief('');
  const onRegenerateUnstarred = () => {};
  const onBriefAnalysisToggle = () => setShowBriefAnalysis(!showBriefAnalysis);
  const onAnalyzeEnhancedBrief = analyzeEnhancedBrief;
  const onToggleEnhancedAnalysis = () => setShowEnhancedAnalysis(!showEnhancedAnalysis);
  const onApplyBriefSuggestion = (suggestion: string) => {};

  const { apiKeys } = useConfigStore();
  
  const { 
    starredItems,
  } = useStarredStore();
  
  // Stub implementations for missing methods
  const onToggleTerritoryStarred = (territoryId: string) => {};
  const onToggleHeadlineStarred = (territoryId: string, headlineIndex: number) => {};

  // Get basic state from territory store (only what exists)
  const territoryStore = useTerritoryStore();
  const assetStore = useAssetStore();
  
  // Stub implementations for missing territory methods/properties
  const territoryEvolutions: { [territoryId: string]: TerritoryEvolution[] } = {};
  const evolutionSuggestions: EvolutionSuggestion[] = [];
  const performancePredictions: { [territoryId: string]: PerformancePrediction } = {};
  const isEvolvingTerritory = false;
  const showEvolutionPanel = false;
  const selectedTerritoryForEvolution: string | null = null;
  const onGenerateEvolutionSuggestions = (territoryId: string) => {};
  const onEvolveTerritoryWithAI = (territoryId: string, suggestion: EvolutionSuggestion) => {};
  const onPredictTerritoryPerformance = (territoryId: string) => {};
  const onToggleEvolutionPanel = () => {};
  const onSelectTerritoryForEvolution = (territoryId: string | null) => {};
  
  // Stub implementations for missing asset methods/properties
  const selectedAssets: UploadedAsset[] = [];
  const onAssetsChange = (assets: UploadedAsset[]) => {};

  // Event handlers
  const handleMomentSelect = (moment: { name: string; date: string }) => {
    const momentText = `\n\n📅 CAMPAIGN MOMENT: ${moment.name} (${moment.date})`;
    setBrief(brief + momentText);
  };

  return (
    <GenerationController
      // Brief state
      brief={brief}
      setBrief={setBrief}
      
      // Generation state
      isGenerating={isGenerating}
      error={error || ''}
      showOutput={showOutput}
      generatedOutput={generatedOutput}
      
      // Brief analysis
      showBriefAnalysis={showBriefAnalysis}
      briefAnalysis={briefAnalysis}
      
      // Enhanced Brief Intelligence
      enhancedBriefAnalysis={enhancedBriefAnalysis}
      isAnalyzingBrief={isAnalyzingBrief}
      showEnhancedAnalysis={showEnhancedAnalysis}
      
      // Territory Evolution
      territoryEvolutions={territoryEvolutions}
      evolutionSuggestions={evolutionSuggestions}
      performancePredictions={performancePredictions}
      isEvolvingTerritory={isEvolvingTerritory}
      showEvolutionPanel={showEvolutionPanel}
      selectedTerritoryForEvolution={selectedTerritoryForEvolution}
      
      // Starred items
      starredItems={starredItems}
      
      // Selected assets
      selectedAssets={selectedAssets}
      
      // API configuration
      apiKeys={apiKeys}
      
      // Event handlers
      onGenerate={onGenerate}
      onMomentSelect={handleMomentSelect}
      onNewBrief={onNewBrief}
      onRegenerateUnstarred={onRegenerateUnstarred}
      onToggleTerritoryStarred={onToggleTerritoryStarred}
      onToggleHeadlineStarred={onToggleHeadlineStarred}
      onBriefAnalysisToggle={onBriefAnalysisToggle}
      onAssetsChange={onAssetsChange}
      
      // Enhanced Brief Intelligence handlers
      onAnalyzeEnhancedBrief={onAnalyzeEnhancedBrief}
      onToggleEnhancedAnalysis={onToggleEnhancedAnalysis}
      onApplyBriefSuggestion={onApplyBriefSuggestion}
      
      // Territory Evolution handlers
      onGenerateEvolutionSuggestions={onGenerateEvolutionSuggestions}
      onEvolveTerritoryWithAI={onEvolveTerritoryWithAI}
      onPredictTerritoryPerformance={onPredictTerritoryPerformance}
      onToggleEvolutionPanel={onToggleEvolutionPanel}
      onSelectTerritoryForEvolution={onSelectTerritoryForEvolution}
    />
  );
};
