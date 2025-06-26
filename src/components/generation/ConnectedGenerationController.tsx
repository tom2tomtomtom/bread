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
    onGenerate,
    onNewBrief,
    onRegenerateUnstarred,
    onBriefAnalysisToggle,
    onAnalyzeEnhancedBrief,
    onToggleEnhancedAnalysis,
    onApplyBriefSuggestion,
  } = useGenerationStore();

  const { apiKeys } = useConfigStore();
  
  const { 
    starredItems,
    onToggleTerritoryStarred,
    onToggleHeadlineStarred,
  } = useStarredStore();

  const {
    territoryEvolutions,
    evolutionSuggestions,
    performancePredictions,
    isEvolvingTerritory,
    showEvolutionPanel,
    selectedTerritoryForEvolution,
    onGenerateEvolutionSuggestions,
    onEvolveTerritoryWithAI,
    onPredictTerritoryPerformance,
    onToggleEvolutionPanel,
    onSelectTerritoryForEvolution,
  } = useTerritoryStore();

  const { selectedAssets, onAssetsChange } = useAssetStore();

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
