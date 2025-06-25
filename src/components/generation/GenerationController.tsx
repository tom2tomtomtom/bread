import React from 'react';
import { GenerationErrorBoundary } from '../ErrorBoundary';
import { BriefInput } from '../BriefInput';
import { BriefEnhancement } from '../BriefEnhancement';
import { TerritoryOutput } from '../TerritoryOutput';
import { ApiKeys, StarredItems } from '../../types';

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

  // Starred items
  starredItems: StarredItems;

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
  starredItems,
  apiKeys,
  onGenerate,
  onMomentSelect,
  onNewBrief,
  onRegenerateUnstarred,
  onToggleTerritoryStarred,
  onToggleHeadlineStarred,
  _onBriefAnalysisToggle,
}) => {
  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Brief Input Section */}
      <div className="mb-12">
        <GenerationErrorBoundary>
          <BriefInput
            brief={brief}
            setBrief={setBrief}
            apiKeys={apiKeys}
            error={error}
            isGenerating={isGenerating}
            onGenerate={onGenerate}
            onMomentSelect={onMomentSelect}
          />
        </GenerationErrorBoundary>

        {/* Smart Brief Analysis */}
        {briefAnalysis && (
          <div className="mt-6">
            <BriefEnhancement analysis={briefAnalysis} isVisible={showBriefAnalysis} />
          </div>
        )}
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
          />
        </GenerationErrorBoundary>
      )}
    </div>
  );
};
