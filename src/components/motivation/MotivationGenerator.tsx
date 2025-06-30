import React, { useEffect, useState } from 'react';
import {
  useMotivationStore,
  Motivation,
  MotivationGenerationRequest,
} from '../../stores/motivationStore';
import { useTemplateWorkflowStore } from '../../stores/templateWorkflowStore';

interface MotivationGeneratorProps {
  onMotivationsSelected?: (motivationIds: string[]) => void;
  onContinue?: () => void;
}

const PSYCHOLOGY_TYPE_ICONS = {
  fear: '⚠️',
  desire: '✨',
  social_proof: '👥',
  urgency: '⏰',
  authority: '🏆',
  reciprocity: '🤝',
  scarcity: '💎',
  curiosity: '🤔',
};

const PSYCHOLOGY_TYPE_COLORS = {
  fear: 'border-red-300 bg-red-50',
  desire: 'border-purple-300 bg-purple-50',
  social_proof: 'border-blue-300 bg-blue-50',
  urgency: 'border-orange-300 bg-orange-50',
  authority: 'border-yellow-300 bg-yellow-50',
  reciprocity: 'border-green-300 bg-green-50',
  scarcity: 'border-pink-300 bg-pink-50',
  curiosity: 'border-indigo-300 bg-indigo-50',
};

export const MotivationGenerator: React.FC<MotivationGeneratorProps> = ({
  onMotivationsSelected,
  onContinue,
}) => {
  const {
    generatedMotivations,
    selectedMotivations,
    isGenerating,
    error,
    generateMotivations,
    selectMotivation,
    deselectMotivation,
    clearError,
  } = useMotivationStore();

  const { selectedTemplate, briefText, parsedBrief, markStepCompleted } =
    useTemplateWorkflowStore();

  // Extract data from parsed brief or fall back to legacy fields
  const brief = briefText || '';
  const targetAudience = parsedBrief?.targetAudience || '';
  const campaignGoal = parsedBrief?.goal || '';

  const [hasGenerated, setHasGenerated] = useState(false);

  // Auto-generate motivations when component mounts if we have the required data
  useEffect(() => {
    if (
      brief &&
      targetAudience &&
      campaignGoal &&
      !hasGenerated &&
      generatedMotivations.length === 0
    ) {
      handleGenerateMotivations();
    }
  }, [brief, targetAudience, campaignGoal, hasGenerated, generatedMotivations.length]);

  const handleGenerateMotivations = async () => {
    if (!brief || !targetAudience || !campaignGoal) {
      return;
    }

    const request: MotivationGenerationRequest = {
      brief,
      targetAudience,
      campaignGoal,
      templateType: selectedTemplate?.type,
    };

    await generateMotivations(request);
    setHasGenerated(true);
  };

  const handleMotivationToggle = (motivationId: string) => {
    if (selectedMotivations.includes(motivationId)) {
      deselectMotivation(motivationId);
    } else {
      // Limit to 3 selections
      if (selectedMotivations.length < 3) {
        selectMotivation(motivationId);
      }
    }
  };

  const handleContinue = () => {
    if (selectedMotivations.length > 0) {
      markStepCompleted('motivation-generation');
      onMotivationsSelected?.(selectedMotivations);
      onContinue?.();
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          🧠 Generate Psychological Motivations
        </h1>
        <p className="text-gray-400 text-lg">
          AI will analyze your brief and create powerful psychological hooks to drive action
        </p>
      </div>

      {/* Brief Summary */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">📝 Your Brief Summary</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">Campaign Goal</div>
            <div className="text-white font-medium">{campaignGoal}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Target Audience</div>
            <div className="text-white font-medium">{targetAudience}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Template Type</div>
            <div className="text-white font-medium">
              {selectedTemplate?.type || 'Not specified'}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-400 text-xl mr-3">⚠️</span>
              <div>
                <p className="text-red-300 font-medium">Error generating motivations</p>
                <p className="text-red-200 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-300 hover:text-red-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Generation Button */}
      {!hasGenerated && generatedMotivations.length === 0 && (
        <div className="text-center mb-8">
          <button
            onClick={handleGenerateMotivations}
            disabled={isGenerating || !brief || !targetAudience || !campaignGoal}
            className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-black font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                Analyzing Psychology...
              </div>
            ) : (
              'Generate Motivations'
            )}
          </button>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
            <p className="text-white font-medium">Analyzing psychological triggers...</p>
            <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
          </div>
        </div>
      )}

      {/* Generated Motivations */}
      {generatedMotivations.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Select Your Motivations (Choose 1-3)</h2>
            <div className="text-sm text-gray-400">{selectedMotivations.length} of 3 selected</div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedMotivations.map(motivation => (
              <MotivationCard
                key={motivation.id}
                motivation={motivation}
                isSelected={selectedMotivations.includes(motivation.id)}
                onToggle={() => handleMotivationToggle(motivation.id)}
                disabled={
                  !selectedMotivations.includes(motivation.id) && selectedMotivations.length >= 3
                }
                getConfidenceColor={getConfidenceColor}
              />
            ))}
          </div>
        </div>
      )}

      {/* Continue Button */}
      {generatedMotivations.length > 0 && (
        <div className="flex justify-between items-center">
          <button
            onClick={handleGenerateMotivations}
            disabled={isGenerating}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300"
          >
            🔄 Regenerate Motivations
          </button>

          <button
            onClick={handleContinue}
            disabled={selectedMotivations.length === 0}
            className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-black font-semibold px-8 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Copy Generation →
          </button>
        </div>
      )}
    </div>
  );
};

interface MotivationCardProps {
  motivation: Motivation;
  isSelected: boolean;
  onToggle: () => void;
  disabled: boolean;
  getConfidenceColor: (score: number) => string;
}

const MotivationCard: React.FC<MotivationCardProps> = ({
  motivation,
  isSelected,
  onToggle,
  disabled,
  getConfidenceColor,
}) => {
  return (
    <div
      className={`relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
        isSelected
          ? 'border-orange-400 bg-orange-400/10 shadow-orange-400/20'
          : disabled
            ? 'border-gray-600 bg-gray-800/50 opacity-50 cursor-not-allowed'
            : `${PSYCHOLOGY_TYPE_COLORS[motivation.psychologyType]} hover:border-opacity-60`
      }`}
      onClick={!disabled ? onToggle : undefined}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Psychology Type Icon */}
      <div className="text-3xl mb-4">{PSYCHOLOGY_TYPE_ICONS[motivation.psychologyType]}</div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-2">{motivation.title}</h3>

      {/* Description */}
      <p className="text-gray-700 text-sm mb-4 leading-relaxed">{motivation.description}</p>

      {/* Target Emotion */}
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-600 mb-1">TARGET EMOTION</div>
        <div className="text-sm font-medium text-gray-800">{motivation.targetEmotion}</div>
      </div>

      {/* Confidence Score */}
      <div className="flex items-center justify-between">
        <div
          className={`px-2 py-1 rounded-full text-xs font-bold ${getConfidenceColor(motivation.confidenceScore)}`}
        >
          {motivation.confidenceScore}% Confidence
        </div>
        <div className="text-xs text-gray-500 capitalize">
          {motivation.psychologyType.replace('_', ' ')}
        </div>
      </div>

      {/* Reasoning (shown on hover or selection) */}
      {isSelected && (
        <div className="mt-4 pt-4 border-t border-gray-300">
          <div className="text-xs font-medium text-gray-600 mb-1">WHY THIS WORKS</div>
          <p className="text-xs text-gray-700 italic">{motivation.reasoning}</p>
        </div>
      )}
    </div>
  );
};
