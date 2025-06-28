import React, { useEffect, useState } from 'react';
import { useCopyStore, CopyVariation, CopyGenerationRequest } from '../../stores/copyStore';
import { useMotivationStore } from '../../stores/motivationStore';
import { useTemplateWorkflowStore } from '../../stores/templateWorkflowStore';

interface CopyGeneratorProps {
  onCopySelected?: (copy: any) => void;
  onContinue?: () => void;
}

const TONE_ICONS = {
  urgent: '⚡',
  friendly: '😊',
  professional: '💼',
  emotional: '❤️',
  playful: '🎉',
  authoritative: '👑',
};

const TONE_COLORS = {
  urgent: 'border-red-300 bg-red-50',
  friendly: 'border-green-300 bg-green-50',
  professional: 'border-blue-300 bg-blue-50',
  emotional: 'border-purple-300 bg-purple-50',
  playful: 'border-yellow-300 bg-yellow-50',
  authoritative: 'border-gray-300 bg-gray-50',
};

export const CopyGenerator: React.FC<CopyGeneratorProps> = ({
  onCopySelected,
  onContinue,
}) => {
  const {
    generatedCopyVariations,
    selectedCopy,
    isGenerating,
    error,
    generateCopy,
    selectCopy,
    updateSelectedCopy,
    clearError,
  } = useCopyStore();

  const {
    generatedMotivations,
    selectedMotivations,
  } = useMotivationStore();

  const {
    selectedTemplate,
    brief,
    targetAudience,
    campaignGoal,
    markStepCompleted,
  } = useTemplateWorkflowStore();

  const [hasGenerated, setHasGenerated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Auto-generate copy when component mounts if we have the required data
  useEffect(() => {
    if (selectedMotivations.length > 0 && !hasGenerated && generatedCopyVariations.length === 0) {
      handleGenerateCopy();
    }
  }, [selectedMotivations.length, hasGenerated, generatedCopyVariations.length]);

  const handleGenerateCopy = async () => {
    if (selectedMotivations.length === 0 || !brief || !targetAudience) {
      return;
    }

    const request: CopyGenerationRequest = {
      brief,
      selectedMotivations,
      templateType: selectedTemplate?.type || 'general',
      targetAudience,
      additionalRequirements: campaignGoal,
    };

    await generateCopy(request);
    setHasGenerated(true);
  };

  const handleCopySelect = (variation: CopyVariation) => {
    selectCopy(variation);
    setIsEditing(false);
  };

  const handleContinue = () => {
    if (selectedCopy) {
      markStepCompleted('copy-generation');
      onCopySelected?.(selectedCopy);
      onContinue?.();
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSelectedMotivationTitles = () => {
    return generatedMotivations
      .filter(m => selectedMotivations.includes(m.id))
      .map(m => m.title)
      .join(', ');
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          ✍️ Generate Copy Variations
        </h1>
        <p className="text-gray-400 text-lg">
          AI will create compelling headlines and copy based on your selected motivations
        </p>
      </div>

      {/* Selected Motivations Summary */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">🧠 Selected Motivations</h2>
        <div className="text-orange-400 font-medium">
          {getSelectedMotivationTitles()}
        </div>
        <div className="text-sm text-gray-400 mt-2">
          Copy will be generated to leverage these psychological triggers
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-400 text-xl mr-3">⚠️</span>
              <div>
                <p className="text-red-300 font-medium">Error generating copy</p>
                <p className="text-red-200 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-300 hover:text-red-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Generation Button */}
      {!hasGenerated && generatedCopyVariations.length === 0 && (
        <div className="text-center mb-8">
          <button
            onClick={handleGenerateCopy}
            disabled={isGenerating || selectedMotivations.length === 0}
            className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-black font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                Writing Copy...
              </div>
            ) : (
              'Generate Copy Variations'
            )}
          </button>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
            <p className="text-white font-medium">Creating compelling copy...</p>
            <p className="text-gray-400 text-sm mt-2">Crafting headlines and messaging</p>
          </div>
        </div>
      )}

      {/* Generated Copy Variations */}
      {generatedCopyVariations.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Choose Your Copy
            </h2>
            {selectedCopy && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-orange-400 hover:text-orange-300 transition-colors text-sm"
              >
                {isEditing ? '✅ Done Editing' : '✏️ Edit Selected Copy'}
              </button>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {generatedCopyVariations.map((variation) => (
              <CopyVariationCard
                key={variation.id}
                variation={variation}
                isSelected={selectedCopy?.variationId === variation.id}
                onSelect={() => handleCopySelect(variation)}
                getConfidenceColor={getConfidenceColor}
              />
            ))}
          </div>
        </div>
      )}

      {/* Selected Copy Editor */}
      {selectedCopy && isEditing && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">✏️ Edit Your Copy</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Headline
              </label>
              <textarea
                value={selectedCopy.headline}
                onChange={(e) => updateSelectedCopy({ headline: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all resize-none"
                rows={3}
                placeholder="Your headline..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Call to Action
              </label>
              <input
                type="text"
                value={selectedCopy.callToAction}
                onChange={(e) => updateSelectedCopy({ callToAction: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
                placeholder="Your call to action..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Body Text
              </label>
              <textarea
                value={selectedCopy.bodyText}
                onChange={(e) => updateSelectedCopy({ bodyText: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all resize-none"
                rows={4}
                placeholder="Your body text..."
              />
            </div>

            {selectedCopy.subheadline !== undefined && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subheadline
                </label>
                <input
                  type="text"
                  value={selectedCopy.subheadline || ''}
                  onChange={(e) => updateSelectedCopy({ subheadline: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
                  placeholder="Your subheadline..."
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Continue Button */}
      {generatedCopyVariations.length > 0 && (
        <div className="flex justify-between items-center">
          <button
            onClick={handleGenerateCopy}
            disabled={isGenerating}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300"
          >
            🔄 Regenerate Copy
          </button>

          <button
            onClick={handleContinue}
            disabled={!selectedCopy}
            className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-black font-semibold px-8 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Asset Selection →
          </button>
        </div>
      )}
    </div>
  );
};

interface CopyVariationCardProps {
  variation: CopyVariation;
  isSelected: boolean;
  onSelect: () => void;
  getConfidenceColor: (score: number) => string;
}

const CopyVariationCard: React.FC<CopyVariationCardProps> = ({
  variation,
  isSelected,
  onSelect,
  getConfidenceColor,
}) => {
  return (
    <div
      className={`relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
        isSelected
          ? 'border-orange-400 bg-orange-400/10 shadow-orange-400/20'
          : `${TONE_COLORS[variation.tone]} hover:border-opacity-60`
      }`}
      onClick={onSelect}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      {/* Tone Icon */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{TONE_ICONS[variation.tone]}</span>
        <span className="text-sm font-medium text-gray-600 capitalize">
          {variation.tone} Tone
        </span>
      </div>

      {/* Headline */}
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-600 mb-2">HEADLINE</div>
        <h3 className="text-lg font-bold text-gray-900 leading-tight">
          "{variation.headline}"
        </h3>
      </div>

      {/* Subheadline */}
      {variation.subheadline && (
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-600 mb-1">SUBHEADLINE</div>
          <p className="text-sm font-medium text-gray-700">
            {variation.subheadline}
          </p>
        </div>
      )}

      {/* Body Text */}
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-600 mb-1">BODY TEXT</div>
        <p className="text-sm text-gray-700 leading-relaxed">
          {variation.bodyText}
        </p>
      </div>

      {/* Call to Action */}
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-600 mb-1">CALL TO ACTION</div>
        <button className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
          {variation.callToAction}
        </button>
      </div>

      {/* Confidence Score */}
      <div className="flex items-center justify-between mb-4">
        <div className={`px-2 py-1 rounded-full text-xs font-bold ${getConfidenceColor(variation.confidenceScore)}`}>
          {variation.confidenceScore}% Confidence
        </div>
      </div>

      {/* Reasoning */}
      <div className="pt-4 border-t border-gray-300">
        <div className="text-xs font-medium text-gray-600 mb-1">WHY THIS WORKS</div>
        <p className="text-xs text-gray-700 italic">
          {variation.reasoning}
        </p>
      </div>
    </div>
  );
};