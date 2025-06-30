import React, { useState, useEffect } from 'react';
import { useTemplateWorkflowStore } from '../../stores/templateWorkflowStore';
import { useGenerationStore } from '../../stores/generationStore';
import { useConfigStore } from '../../stores/configStore';
import { TerritoryOutput } from '../territory/TerritoryOutput';
import { Territory } from '../../types';

interface StreamlinedTerritoryGeneratorProps {
  onTerritoryGenerated?: () => void;
}

export const StreamlinedTerritoryGenerator: React.FC<StreamlinedTerritoryGeneratorProps> = ({
  onTerritoryGenerated,
}) => {
  const { parsedBrief, briefText } = useTemplateWorkflowStore();
  const { generatedOutput, isGenerating, error, generate, setShowOutput, showOutput } =
    useGenerationStore();
  const { apiKeys } = useConfigStore();

  const [hasGenerated, setHasGenerated] = useState(false);

  // Auto-generate territories when component mounts if we have the required data
  useEffect(() => {
    if (briefText && !hasGenerated && !generatedOutput && apiKeys.openai) {
      handleGenerate();
    }
  }, [briefText, hasGenerated, generatedOutput, apiKeys.openai]);

  const handleGenerate = async () => {
    if (!briefText) return;

    setHasGenerated(true);
    await generate();
    setShowOutput(true);
    onTerritoryGenerated?.();
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Brief Summary */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">📝 Your Brief Summary</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">Campaign Goal</div>
            <div className="text-white font-medium">
              {parsedBrief?.goal || 'Extracted from brief'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Target Audience</div>
            <div className="text-white font-medium">
              {parsedBrief?.targetAudience || 'Extracted from brief'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Brand Personality</div>
            <div className="text-white font-medium">
              {parsedBrief?.brandPersonality || 'Extracted from brief'}
            </div>
          </div>
        </div>

        {/* Brief Text */}
        <div className="mt-4">
          <div className="text-sm text-gray-400 mb-1">Full Brief</div>
          <div className="text-gray-300 text-sm bg-black/20 rounded-lg p-3 max-h-24 overflow-y-auto">
            {briefText}
          </div>
        </div>
      </div>

      {/* API Key Check */}
      {!apiKeys.openai && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-8">
          <h3 className="text-red-400 font-semibold mb-2">⚠️ OpenAI Not Configured</h3>
          <p className="text-gray-300 text-sm">
            Configure your OpenAI API key in the Admin panel to start generating territories.
          </p>
        </div>
      )}

      {/* Generate Button */}
      {!showOutput && !isGenerating && (
        <div className="text-center mb-8">
          <button
            onClick={handleGenerate}
            disabled={!briefText || !apiKeys.openai || isGenerating}
            className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-bold px-8 py-4 rounded-xl text-lg transition-all transform hover:scale-105 disabled:transform-none"
          >
            🚀 GENERATE TERRITORIES
          </button>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 text-orange-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400"></div>
            <span className="text-lg font-medium">Generating creative territories...</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-8">
          <h3 className="text-red-400 font-semibold mb-2">❌ Generation Error</h3>
          <p className="text-gray-300 text-sm">{error}</p>
          <button
            onClick={handleGenerate}
            className="mt-3 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Generated Output */}
      {showOutput && generatedOutput && (
        <TerritoryOutput
          generatedOutput={generatedOutput}
          onNewBrief={() => setShowOutput(false)}
          onRegenerateUnstarred={() => {}}
          onToggleTerritoryStarred={() => {}}
          onToggleHeadlineStarred={() => {}}
          starredItems={{ territories: [], headlines: {} }}
          onGenerateImage={() => {}}
        />
      )}
    </div>
  );
};
