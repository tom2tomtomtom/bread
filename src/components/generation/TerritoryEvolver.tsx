import React, { useState, useEffect } from 'react';
import {
  Territory,
  EvolutionSuggestion,
  TerritoryEvolution,
  PerformancePrediction,
} from '../../types';

interface TerritoryEvolverProps {
  territory: Territory;
  suggestions: EvolutionSuggestion[];
  evolutions: TerritoryEvolution[];
  performancePrediction?: PerformancePrediction;
  isEvolving: boolean;
  onEvolveTerritoryWithAI: (suggestion: EvolutionSuggestion) => void;
  onGenerateSuggestions: () => void;
  onPredictPerformance: () => void;
  onClose: () => void;
}

export const TerritoryEvolver: React.FC<TerritoryEvolverProps> = ({
  territory,
  suggestions,
  evolutions,
  performancePrediction,
  isEvolving,
  onEvolveTerritoryWithAI,
  onGenerateSuggestions,
  onPredictPerformance,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'evolutions' | 'performance'>(
    'suggestions'
  );
  const [selectedSuggestion, setSelectedSuggestion] = useState<EvolutionSuggestion | null>(null);

  useEffect(() => {
    if (suggestions.length === 0) {
      onGenerateSuggestions();
    }
    if (!performancePrediction) {
      onPredictPerformance();
    }
  }, []);

  const getEvolutionTypeIcon = (type: string) => {
    const icons = {
      TONE_SHIFT: '🎭',
      AUDIENCE_PIVOT: '👥',
      COMPETITIVE_RESPONSE: '⚔️',
      CULTURAL_ADAPTATION: '🇦🇺',
      SEASONAL_OPTIMIZATION: '📅',
      PERFORMANCE_ENHANCEMENT: '📈',
      CREATIVE_EXPLORATION: '🎨',
      COMPLIANCE_ADJUSTMENT: '⚖️',
    };
    return icons[type as keyof typeof icons] || '🔄';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'LOW':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-400 to-green-600';
    if (score >= 60) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-blue-400 text-2xl">🧬</div>
          <div>
            <h3 className="text-xl font-bold text-blue-400">Territory Evolution</h3>
            <p className="text-white/70 text-sm">{territory.title}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all"
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

      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 mb-6">
        {[
          { id: 'suggestions', label: 'Evolution Ideas', icon: '💡', count: suggestions.length },
          { id: 'evolutions', label: 'Evolution History', icon: '📜', count: evolutions.length },
          { id: 'performance', label: 'Performance Prediction', icon: '📊' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {tab.count !== undefined && (
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            {suggestions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🤔</div>
                <p className="text-white/70">Generating evolution suggestions...</p>
                <button
                  onClick={onGenerateSuggestions}
                  className="mt-4 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-all"
                >
                  Generate Suggestions
                </button>
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer ${
                    selectedSuggestion === suggestion ? 'ring-2 ring-blue-400/50' : ''
                  }`}
                  onClick={() => setSelectedSuggestion(suggestion)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getEvolutionTypeIcon(suggestion.type)}</span>
                      <div>
                        <h4 className="font-bold text-white">{suggestion.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold border ${getPriorityColor(suggestion.priority)}`}
                          >
                            {suggestion.priority}
                          </span>
                          <span className="text-sm text-white/70">
                            {suggestion.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onEvolveTerritoryWithAI(suggestion);
                      }}
                      disabled={isEvolving}
                      className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-sm text-blue-400 transition-all disabled:opacity-50"
                    >
                      {isEvolving ? 'Evolving...' : 'Evolve'}
                    </button>
                  </div>
                  <p className="text-white/70 text-sm mb-2">{suggestion.description}</p>
                  <p className="text-green-400 text-sm">{suggestion.expectedImpact}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'evolutions' && (
          <div className="space-y-4">
            {evolutions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🌱</div>
                <p className="text-white/70">
                  No evolutions yet. Try some suggestions to get started!
                </p>
              </div>
            ) : (
              evolutions.map((evolution, _index) => (
                <div
                  key={evolution.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getEvolutionTypeIcon(evolution.evolutionType)}
                      </span>
                      <div>
                        <h4 className="font-bold text-white">
                          {evolution.resultingTerritory.title}
                        </h4>
                        <p className="text-sm text-white/70">
                          {evolution.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full font-bold ${
                        evolution.improvementScore >= 80
                          ? 'bg-green-500/20 text-green-400'
                          : evolution.improvementScore >= 60
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      +{evolution.improvementScore}
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mb-3">{evolution.evolutionReasoning}</p>

                  {/* Show evolved territory preview */}
                  <div className="bg-black/20 rounded-lg p-3 mt-3">
                    <div className="text-xs text-white/60 mb-1">Evolved Positioning:</div>
                    <div className="text-sm text-white">
                      {evolution.resultingTerritory.positioning}
                    </div>
                    <div className="text-xs text-white/60 mt-2 mb-1">Evolved Tone:</div>
                    <div className="text-sm text-blue-400">{evolution.resultingTerritory.tone}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            {!performancePrediction ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-white/70">Analyzing territory performance...</p>
                <button
                  onClick={onPredictPerformance}
                  className="mt-4 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 transition-all"
                >
                  Predict Performance
                </button>
              </div>
            ) : (
              <>
                {/* Overall Score */}
                <div className="text-center">
                  <div
                    className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${getScoreGradient(performancePrediction.overallScore)} mb-4`}
                  >
                    <span className="text-2xl font-bold text-white">
                      {performancePrediction.overallScore}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Predicted Performance</h4>
                  <p className="text-white/70 text-sm">
                    Confidence: {performancePrediction.confidence}%
                  </p>
                </div>

                {/* Category Scores */}
                <div className="space-y-3">
                  <h5 className="font-bold text-white">Performance Categories</h5>
                  {Object.entries(performancePrediction.categoryScores).map(([category, score]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-white/70 capitalize">
                        {category.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getScoreGradient(score)} transition-all duration-500`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className={`font-bold text-sm ${getScoreColor(score)}`}>{score}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Strengths */}
                {performancePrediction.strengths.length > 0 && (
                  <div>
                    <h5 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                      <span>✅</span>
                      Strengths
                    </h5>
                    <div className="space-y-2">
                      {performancePrediction.strengths.map((strength, index) => (
                        <div key={index} className="text-sm text-white/70 flex items-start gap-2">
                          <span className="text-green-400 mt-1">•</span>
                          {strength}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weaknesses */}
                {performancePrediction.weaknesses.length > 0 && (
                  <div>
                    <h5 className="font-bold text-red-400 mb-3 flex items-center gap-2">
                      <span>⚠️</span>
                      Areas for Improvement
                    </h5>
                    <div className="space-y-2">
                      {performancePrediction.weaknesses.map((weakness, index) => (
                        <div key={index} className="text-sm text-white/70 flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          {weakness}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {performancePrediction.recommendations.length > 0 && (
                  <div>
                    <h5 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                      <span>💡</span>
                      Recommendations
                    </h5>
                    <div className="space-y-2">
                      {performancePrediction.recommendations.map((recommendation, index) => (
                        <div key={index} className="text-sm text-white/70 flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          {recommendation}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Evolution in Progress Overlay */}
      {isEvolving && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-blue-400/20 rounded-xl p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-400/20 border-t-blue-400 rounded-full mx-auto mb-4"></div>
            <h4 className="text-lg font-bold text-blue-400 mb-2">Evolving Territory</h4>
            <p className="text-white/70">AI is creating an enhanced version...</p>
          </div>
        </div>
      )}
    </div>
  );
};
