import React from 'react';
import { GenerationErrorBoundary } from '../ErrorBoundary';
import { BriefInput } from '../BriefInput';
import { BriefEnhancement } from '../BriefEnhancement';
import { TerritoryOutput } from '../territory/TerritoryOutput';
import { AssetEnhancedBriefBuilder } from './AssetEnhancedBriefBuilder';
import { BriefAnalyzer } from './BriefAnalyzer';
import { TerritoryEvolver } from './TerritoryEvolver';
import {
  ApiKeys,
  StarredItems,
  UploadedAsset,
  EnhancedBriefAnalysis,
  TerritoryEvolution,
  EvolutionSuggestion,
  PerformancePrediction,
} from '../../types';

interface GenerationControllerProps {
  // Brief state
  brief: string;
  setBrief: (brief: string) => void;

  // Generation state
  isGenerating: boolean;
  error: string;
  showOutput: boolean;
  generatedOutput: any | null;

  // Brief analysis
  showBriefAnalysis: boolean;
  briefAnalysis: any | null;

  // Enhanced Brief Intelligence
  enhancedBriefAnalysis: EnhancedBriefAnalysis | null;
  isAnalyzingBrief: boolean;
  showEnhancedAnalysis: boolean;

  // Territory Evolution
  territoryEvolutions: { [territoryId: string]: TerritoryEvolution[] };
  evolutionSuggestions: EvolutionSuggestion[];
  performancePredictions: { [territoryId: string]: PerformancePrediction };
  isEvolvingTerritory: boolean;
  showEvolutionPanel: boolean;
  selectedTerritoryForEvolution: string | null;

  // Starred items
  starredItems: StarredItems;

  // Selected assets
  selectedAssets: UploadedAsset[];

  // API configuration
  apiKeys: ApiKeys;

  // Event handlers
  onGenerate: () => void;
  onMomentSelect: (moment: { name: string; date: string }) => void;
  onNewBrief: () => void;
  onRegenerateUnstarred: () => void;
  onToggleTerritoryStarred: (territoryId: string) => void;
  onToggleHeadlineStarred: (territoryId: string, headlineIndex: number) => void;
  onBriefAnalysisToggle: () => void;
  onAssetsChange: (assets: UploadedAsset[]) => void;

  // Enhanced Brief Intelligence handlers
  onAnalyzeEnhancedBrief: () => void;
  onToggleEnhancedAnalysis: () => void;
  onApplyBriefSuggestion: (suggestion: string) => void;

  // Territory Evolution handlers
  onGenerateEvolutionSuggestions: (territoryId: string) => void;
  onEvolveTerritoryWithAI: (territoryId: string, suggestion: EvolutionSuggestion) => void;
  onPredictTerritoryPerformance: (territoryId: string) => void;
  onToggleEvolutionPanel: () => void;
  onSelectTerritoryForEvolution: (territoryId: string | null) => void;
}

export const GenerationController: React.FC<GenerationControllerProps> = ({
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
  territoryEvolutions,
  evolutionSuggestions,
  performancePredictions,
  isEvolvingTerritory,
  showEvolutionPanel,
  selectedTerritoryForEvolution,
  starredItems,
  selectedAssets,
  apiKeys,
  onGenerate,
  onMomentSelect,
  onNewBrief,
  onRegenerateUnstarred,
  onToggleTerritoryStarred,
  onToggleHeadlineStarred,
  onAssetsChange,
  onAnalyzeEnhancedBrief,
  onToggleEnhancedAnalysis,
  onApplyBriefSuggestion,
  onGenerateEvolutionSuggestions,
  onEvolveTerritoryWithAI,
  onPredictTerritoryPerformance,
  onToggleEvolutionPanel,
  onSelectTerritoryForEvolution,
}) => {
  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Enhanced Brief Input Section */}
      <div className="mb-12">
        <GenerationErrorBoundary>
          <AssetEnhancedBriefBuilder
            brief={brief}
            onBriefChange={setBrief}
            selectedAssets={selectedAssets}
            onAssetsChange={onAssetsChange}
          />

          {/* Generation Controls */}
          <div className="mt-6">
            <BriefInput
              brief={brief}
              setBrief={setBrief}
              apiKeys={apiKeys}
              error={error}
              isGenerating={isGenerating}
              onGenerate={onGenerate}
              onMomentSelect={onMomentSelect}
            />
          </div>
        </GenerationErrorBoundary>

        {/* Smart Brief Analysis */}
        {briefAnalysis && (
          <div className="mt-6">
            <BriefEnhancement analysis={briefAnalysis} isVisible={showBriefAnalysis} />
          </div>
        )}

        {/* Enhanced Brief Intelligence Controls */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={onAnalyzeEnhancedBrief}
            disabled={isAnalyzingBrief || !brief.trim()}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-purple-400 font-medium transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <span>🧠</span>
            {isAnalyzingBrief ? 'Analyzing...' : 'Enhanced Analysis'}
          </button>

          {generatedOutput?.territories && (
            <>
              <button
                onClick={onToggleEvolutionPanel}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 font-medium transition-all flex items-center gap-2"
              >
                <span>🧬</span>
                Territory Evolution
              </button>

              <button
                onClick={() => {
                  /* Show smart suggestions */
                }}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 font-medium transition-all flex items-center gap-2"
              >
                <span>🤖</span>
                Smart Suggestions
              </button>
            </>
          )}
        </div>
      </div>

      {/* Output Section */}
      {showOutput && generatedOutput && (
        <GenerationErrorBoundary>
          <TerritoryOutput
            generatedOutput={generatedOutput}
            onNewBrief={onNewBrief}
            onRegenerateUnstarred={onRegenerateUnstarred}
            onToggleTerritoryStarred={onToggleTerritoryStarred}
            onToggleHeadlineStarred={onToggleHeadlineStarred}
            starredItems={starredItems}
            // Enhanced features
            onSelectTerritoryForEvolution={onSelectTerritoryForEvolution}
            onGenerateEvolutionSuggestions={onGenerateEvolutionSuggestions}
            onPredictTerritoryPerformance={onPredictTerritoryPerformance}
            territoryEvolutions={territoryEvolutions}
            performancePredictions={performancePredictions}
          />
        </GenerationErrorBoundary>
      )}

      {/* Enhanced Brief Intelligence Modal */}
      {enhancedBriefAnalysis && (
        <BriefAnalyzer
          analysis={enhancedBriefAnalysis}
          isVisible={showEnhancedAnalysis}
          isAnalyzing={isAnalyzingBrief}
          onClose={onToggleEnhancedAnalysis}
          onApplySuggestion={onApplyBriefSuggestion}
        />
      )}

      {/* Territory Evolution Panel */}
      {showEvolutionPanel && selectedTerritoryForEvolution && generatedOutput?.territories && (
        <TerritoryEvolver
          territory={generatedOutput.territories.find(
            (t: any) => t.id === selectedTerritoryForEvolution
          )}
          suggestions={evolutionSuggestions}
          evolutions={territoryEvolutions[selectedTerritoryForEvolution] || []}
          performancePrediction={performancePredictions[selectedTerritoryForEvolution]}
          isEvolving={isEvolvingTerritory}
          onEvolveTerritoryWithAI={suggestion =>
            onEvolveTerritoryWithAI(selectedTerritoryForEvolution, suggestion)
          }
          onGenerateSuggestions={() =>
            onGenerateEvolutionSuggestions(selectedTerritoryForEvolution)
          }
          onPredictPerformance={() => onPredictTerritoryPerformance(selectedTerritoryForEvolution)}
          onClose={onToggleEvolutionPanel}
        />
      )}
    </div>
  );
};
