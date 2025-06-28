import React from 'react';
import { TerritoryConfidence } from '../../types';

interface ConfidenceDisplayProps {
  confidence: TerritoryConfidence;
  showDetails?: boolean;
}

/**
 * ConfidenceDisplay - Territory confidence scoring display
 *
 * Responsibilities:
 * - Display confidence metrics (market fit, compliance, audience resonance)
 * - Show risk level with appropriate styling
 * - Provide visual confidence indicators
 * - Optional detailed breakdown
 */
export const ConfidenceDisplay: React.FC<ConfidenceDisplayProps> = ({
  confidence,
  showDetails = true,
}) => {
  // Get color class based on confidence score
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Get risk level styling
  const getRiskLevelStyle = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'HIGH':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Get confidence bar width
  const getBarWidth = (score: number) => `${score}%`;

  if (!showDetails) {
    // Simple confidence display
    const averageConfidence = Math.round(
      (confidence.marketFit + confidence.complianceConfidence + confidence.audienceResonance) / 3
    );

    return (
      <div
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getConfidenceColor(averageConfidence)}`}
      >
        {averageConfidence}% CONF
      </div>
    );
  }

  return (
    <div className="bg-black/10 p-3 rounded-xl mb-4">
      <div className="text-xs font-subheading mb-3">CONFIDENCE BREAKDOWN</div>

      {/* Market Fit */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium">Market Fit</span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${getConfidenceColor(confidence.marketFit)}`}
          >
            {confidence.marketFit}%
          </span>
        </div>
        <div className="w-full bg-black/20 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: getBarWidth(confidence.marketFit) }}
          />
        </div>
      </div>

      {/* Compliance Confidence */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium">Compliance</span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${getConfidenceColor(confidence.complianceConfidence)}`}
          >
            {confidence.complianceConfidence}%
          </span>
        </div>
        <div className="w-full bg-black/20 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: getBarWidth(confidence.complianceConfidence) }}
          />
        </div>
      </div>

      {/* Audience Resonance */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium">Audience Resonance</span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${getConfidenceColor(confidence.audienceResonance)}`}
          >
            {confidence.audienceResonance}%
          </span>
        </div>
        <div className="w-full bg-black/20 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: getBarWidth(confidence.audienceResonance) }}
          />
        </div>
      </div>

      {/* Risk Level */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Risk Level</span>
        <div
          className={`px-2 py-1 rounded-full text-xs font-bold border ${getRiskLevelStyle(confidence.riskLevel)}`}
        >
          {confidence.riskLevel}
        </div>
      </div>
    </div>
  );
};

export default ConfidenceDisplay;
