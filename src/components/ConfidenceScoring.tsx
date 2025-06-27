import React from 'react';
import { TerritoryConfidence } from '../types';

interface ConfidenceScoringProps {
  confidence: TerritoryConfidence;
  territoryId: string;
}

export const ConfidenceScoring: React.FC<ConfidenceScoringProps> = ({ confidence }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-400/20';
    if (score >= 60) return 'bg-yellow-400/20';
    return 'bg-red-400/20';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'text-green-400 bg-green-400/20';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'HIGH':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const averageScore = Math.round(
    (confidence.marketFit + confidence.complianceConfidence + confidence.audienceResonance) / 3
  );

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-white/80">CONFIDENCE ANALYSIS</h4>
        <div
          className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreBackground(averageScore)}`}
        >
          <span className={getScoreColor(averageScore)}>{averageScore}%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Market Fit */}
        <div className="text-center">
          <div className={`text-lg font-bold ${getScoreColor(confidence.marketFit)}`}>
            {confidence.marketFit}%
          </div>
          <div className="text-xs text-white/60">Market Fit</div>
        </div>

        {/* Compliance */}
        <div className="text-center">
          <div className={`text-lg font-bold ${getScoreColor(confidence.complianceConfidence)}`}>
            {confidence.complianceConfidence}%
          </div>
          <div className="text-xs text-white/60">Compliance</div>
        </div>

        {/* Audience */}
        <div className="text-center">
          <div className={`text-lg font-bold ${getScoreColor(confidence.audienceResonance)}`}>
            {confidence.audienceResonance}%
          </div>
          <div className="text-xs text-white/60">Resonance</div>
        </div>
      </div>

      {/* Risk Level */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60">Risk Level:</span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-bold ${getRiskColor(confidence.riskLevel)}`}
          >
            {confidence.riskLevel}
          </span>
        </div>
      </div>

      {/* Reasoning */}
      <div className="text-xs text-white/70 leading-relaxed">
        {(confidence as any).reasoning || 'Confidence scoring based on market fit, compliance, and audience resonance.'}
      </div>

      {/* Visual Score Bars */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60 w-16">Market:</span>
          <div className="flex-1 bg-white/10 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                confidence.marketFit >= 80
                  ? 'bg-green-400'
                  : confidence.marketFit >= 60
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
              }`}
              style={{ width: `${confidence.marketFit}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60 w-16">Legal:</span>
          <div className="flex-1 bg-white/10 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                confidence.complianceConfidence >= 80
                  ? 'bg-green-400'
                  : confidence.complianceConfidence >= 60
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
              }`}
              style={{ width: `${confidence.complianceConfidence}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60 w-16">Appeal:</span>
          <div className="flex-1 bg-white/10 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                confidence.audienceResonance >= 80
                  ? 'bg-green-400'
                  : confidence.audienceResonance >= 60
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
              }`}
              style={{ width: `${confidence.audienceResonance}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
