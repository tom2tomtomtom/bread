import React from 'react';
import { BriefAnalysis } from '../services/enhancementService';

interface BriefEnhancementProps {
  analysis: BriefAnalysis;
  isVisible: boolean;
}

export const BriefEnhancement: React.FC<BriefEnhancementProps> = ({ analysis, isVisible }) => {
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

  return (
    <div className="backdrop-blur-xl bg-purple-400/10 border border-purple-400/20 rounded-2xl p-6 shadow-xl animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-purple-400 text-2xl">🧠</div>
        <h3 className="text-lg font-bold text-purple-400">SMART BRIEF ANALYSIS</h3>
        <div
          className={`px-3 py-1 rounded-full text-sm font-bold border ${getScoreBackground(analysis.score)}`}
        >
          <span className={getScoreColor(analysis.score)}>{analysis.score}/100</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Suggestions */}
        {analysis.suggestions.length > 0 && (
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-blue-400">💡</span>
              <h4 className="font-bold text-blue-400 text-sm">SUGGESTIONS</h4>
            </div>
            <ul className="space-y-2">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Strengths */}
        {analysis.strengths.length > 0 && (
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-green-400">✅</span>
              <h4 className="font-bold text-green-400 text-sm">STRENGTHS</h4>
            </div>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {analysis.warnings.length > 0 && (
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-orange-400">⚠️</span>
              <h4 className="font-bold text-orange-400 text-sm">WARNINGS</h4>
            </div>
            <ul className="space-y-2">
              {analysis.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Market Insights */}
        {analysis.marketInsights.length > 0 && (
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-purple-400">📊</span>
              <h4 className="font-bold text-purple-400 text-sm">MARKET INSIGHTS</h4>
            </div>
            <ul className="space-y-2">
              {analysis.marketInsights.map((insight, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex gap-2 flex-wrap">
          <button className="text-xs bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 px-3 py-1 rounded-full transition-colors">
            Apply All Suggestions
          </button>
          <button className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 rounded-full transition-colors">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
