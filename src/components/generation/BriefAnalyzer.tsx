import React, { useState } from 'react';
import { EnhancedBriefAnalysis, CategoryScore } from '../../types';

interface BriefAnalyzerProps {
  analysis: EnhancedBriefAnalysis;
  isVisible: boolean;
  isAnalyzing: boolean;
  onClose: () => void;
  onApplySuggestion: (suggestion: string) => void;
}

export const BriefAnalyzer: React.FC<BriefAnalyzerProps> = ({
  analysis,
  isVisible,
  isAnalyzing,
  onClose,
  onApplySuggestion,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'categories' | 'insights' | 'suggestions'
  >('overview');

  if (!isVisible) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-400/10 border-green-400/20';
    if (score >= 60) return 'bg-yellow-400/10 border-yellow-400/20';
    return 'bg-red-400/10 border-red-400/20';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-400 to-green-600';
    if (score >= 60) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  if (isAnalyzing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-purple-400/20 rounded-3xl p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-purple-400/20 border-t-purple-400 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-purple-400 mb-2">Analyzing Brief</h3>
            <p className="text-white/70">
              AI is performing deep analysis of your creative brief...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-purple-400/20 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="text-purple-400 text-3xl">🧠</div>
            <div>
              <h2 className="text-2xl font-bold text-purple-400">Enhanced Brief Intelligence</h2>
              <p className="text-white/70">AI-powered analysis and insights</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`px-4 py-2 rounded-full border ${getScoreBackground(analysis.overallScore)}`}
            >
              <span className={`font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}/100
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all"
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
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'categories', label: 'Categories', icon: '📈' },
            { id: 'insights', label: 'Insights', icon: '💡' },
            { id: 'suggestions', label: 'Suggestions', icon: '🎯' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-400/5'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${getScoreGradient(analysis.overallScore)} mb-4`}
                >
                  <span className="text-4xl font-bold text-white">{analysis.overallScore}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Overall Brief Quality</h3>
                <p className="text-white/70">
                  Confidence: {analysis.confidence}% • Analyzed:{' '}
                  {analysis.analysisTimestamp.toLocaleString()}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {analysis.missingElements.length}
                  </div>
                  <div className="text-sm text-white/70">Missing Elements</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {analysis.improvementSuggestions.length}
                  </div>
                  <div className="text-sm text-white/70">Suggestions</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {analysis.culturalInsights.length}
                  </div>
                  <div className="text-sm text-white/70">Cultural Insights</div>
                </div>
              </div>

              {/* Top Missing Elements */}
              {analysis.missingElements.length > 0 && (
                <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4">
                  <h4 className="font-bold text-red-400 mb-3 flex items-center gap-2">
                    <span>⚠️</span>
                    Critical Missing Elements
                  </h4>
                  <div className="space-y-2">
                    {analysis.missingElements.slice(0, 3).map((element, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            element.importance === 'HIGH'
                              ? 'bg-red-500/20 text-red-400'
                              : element.importance === 'MEDIUM'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {element.importance}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-white">{element.element}</div>
                          <div className="text-sm text-white/70">{element.suggestion}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-4">
              {Object.entries(analysis.categoryScores).map(([category, score]) => (
                <CategoryScoreCard key={category} category={category} score={score} />
              ))}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* Cultural Insights */}
              {analysis.culturalInsights.length > 0 && (
                <div>
                  <h4 className="font-bold text-purple-400 mb-4 flex items-center gap-2">
                    <span>🇦🇺</span>
                    Australian Cultural Insights
                  </h4>
                  <div className="space-y-4">
                    {analysis.culturalInsights.map((insight, index) => (
                      <div
                        key={index}
                        className="bg-purple-400/10 border border-purple-400/20 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-white">{insight.context}</h5>
                          <span className="text-sm text-purple-400">
                            {insight.relevance}% relevant
                          </span>
                        </div>
                        <p className="text-white/70 mb-3">{insight.opportunity}</p>
                        <div className="space-y-1">
                          {insight.considerations.map((consideration, idx) => (
                            <div key={idx} className="text-sm text-white/60 flex items-start gap-2">
                              <span className="text-purple-400 mt-1">•</span>
                              {consideration}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategic Gaps */}
              {analysis.strategicGaps.length > 0 && (
                <div>
                  <h4 className="font-bold text-orange-400 mb-4 flex items-center gap-2">
                    <span>🎯</span>
                    Strategic Gaps
                  </h4>
                  <div className="space-y-4">
                    {analysis.strategicGaps.map((gap, index) => (
                      <div
                        key={index}
                        className="bg-orange-400/10 border border-orange-400/20 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-white">{gap.area}</h5>
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              gap.competitiveRisk === 'HIGH'
                                ? 'bg-red-500/20 text-red-400'
                                : gap.competitiveRisk === 'MEDIUM'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-green-500/20 text-green-400'
                            }`}
                          >
                            {gap.competitiveRisk} RISK
                          </span>
                        </div>
                        <p className="text-white/70 mb-2">{gap.description}</p>
                        <p className="text-sm text-orange-400">{gap.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitive Opportunities */}
              {analysis.competitiveOpportunities.length > 0 && (
                <div>
                  <h4 className="font-bold text-green-400 mb-4 flex items-center gap-2">
                    <span>🚀</span>
                    Competitive Opportunities
                  </h4>
                  <div className="space-y-4">
                    {analysis.competitiveOpportunities.map((opportunity, index) => (
                      <div
                        key={index}
                        className="bg-green-400/10 border border-green-400/20 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-white">{opportunity.competitor}</h5>
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              opportunity.riskLevel === 'HIGH'
                                ? 'bg-red-500/20 text-red-400'
                                : opportunity.riskLevel === 'MEDIUM'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-green-500/20 text-green-400'
                            }`}
                          >
                            {opportunity.riskLevel} RISK
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-white/70">Weakness:</span>{' '}
                            <span className="text-white">{opportunity.weakness}</span>
                          </div>
                          <div>
                            <span className="text-white/70">Opportunity:</span>{' '}
                            <span className="text-white">{opportunity.opportunity}</span>
                          </div>
                          <div>
                            <span className="text-white/70">Approach:</span>{' '}
                            <span className="text-green-400">{opportunity.approach}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              {analysis.improvementSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          suggestion.priority === 'HIGH'
                            ? 'bg-red-500/20 text-red-400'
                            : suggestion.priority === 'MEDIUM'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {suggestion.priority}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          suggestion.type === 'STRATEGIC'
                            ? 'bg-purple-500/20 text-purple-400'
                            : suggestion.type === 'TACTICAL'
                              ? 'bg-blue-500/20 text-blue-400'
                              : suggestion.type === 'CREATIVE'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-orange-500/20 text-orange-400'
                        }`}
                      >
                        {suggestion.type}
                      </span>
                    </div>
                    <button
                      onClick={() => onApplySuggestion(suggestion.implementation)}
                      className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-sm text-purple-400 transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  <h5 className="font-bold text-white mb-2">{suggestion.title}</h5>
                  <p className="text-white/70 mb-3">{suggestion.description}</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-white/70">Implementation:</span>{' '}
                      <span className="text-white">{suggestion.implementation}</span>
                    </div>
                    <div>
                      <span className="text-white/70">Expected Impact:</span>{' '}
                      <span className="text-green-400">{suggestion.expectedImpact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Category Score Card Component
const CategoryScoreCard: React.FC<{ category: string; score: CategoryScore }> = ({
  category,
  score,
}) => {
  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 80) return 'text-green-400';
    if (scoreValue >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (scoreValue: number) => {
    if (scoreValue >= 80) return 'from-green-400 to-green-600';
    if (scoreValue >= 60) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const formatCategoryName = (name: string) => {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-bold text-white">{formatCategoryName(category)}</h5>
        <div className="flex items-center gap-3">
          <div className={`w-16 h-2 bg-gray-700 rounded-full overflow-hidden`}>
            <div
              className={`h-full bg-gradient-to-r ${getScoreGradient(score.score)} transition-all duration-500`}
              style={{ width: `${score.score}%` }}
            />
          </div>
          <span className={`font-bold ${getScoreColor(score.score)}`}>{score.score}</span>
        </div>
      </div>
      <p className="text-white/70 text-sm mb-3">{score.reasoning}</p>
      {score.improvements.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-white/60">Improvements:</div>
          {score.improvements.map((improvement, index) => (
            <div key={index} className="text-xs text-white/60 flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              {improvement}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
