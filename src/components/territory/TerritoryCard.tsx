import React from 'react';
import { EnhancedTerritory, TerritoryEvolution, PerformancePrediction } from '../../types';
import { HeadlineList } from './HeadlineList';
import { TerritoryActions } from './TerritoryActions';
import { ConfidenceDisplay } from './ConfidenceDisplay';

interface TerritoryCardProps {
  territory: EnhancedTerritory;
  index: number;
  starredItems: { territories: string[]; headlines: { [territoryId: string]: number[] } };
  onToggleTerritoryStarred: (territoryId: string) => void;
  onToggleHeadlineStarred: (territoryId: string, headlineIndex: number) => void;
  
  // Enhanced features (optional)
  onSelectTerritoryForEvolution?: (territoryId: string | null) => void;
  onPredictTerritoryPerformance?: (territoryId: string) => void;
  territoryEvolutions?: TerritoryEvolution[];
  performancePrediction?: PerformancePrediction;
}

/**
 * TerritoryCard - Individual territory display component
 * 
 * Responsibilities:
 * - Display territory information (title, positioning, tone)
 * - Show confidence scoring
 * - Handle territory-level actions (star, evolve, predict)
 * - Display performance indicators
 * - Render associated headlines
 */
export const TerritoryCard: React.FC<TerritoryCardProps> = ({
  territory,
  index,
  starredItems,
  onToggleTerritoryStarred,
  onToggleHeadlineStarred,
  onSelectTerritoryForEvolution,
  onPredictTerritoryPerformance,
  territoryEvolutions,
  performancePrediction,
}) => {
  const isStarred = starredItems.territories.includes(territory.id);
  const territoryHeadlines = starredItems.headlines[territory.id] || [];

  // Calculate average confidence
  const averageConfidence = Math.round(
    (territory.confidence.marketFit +
      territory.confidence.complianceConfidence +
      territory.confidence.audienceResonance) / 3
  );

  // Get confidence color class
  const getConfidenceColorClass = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-400 text-white';
    if (confidence >= 60) return 'bg-yellow-600 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <div
      className="bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-500 text-black p-6 rounded-2xl shadow-xl shadow-yellow-400/20 hover:shadow-yellow-400/30 transition-all duration-300"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Territory Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          {/* Territory ID */}
          <div className="text-xs font-bold text-red-600 bg-white/20 px-2 py-1 rounded-full">
            {territory.id}
          </div>

          {/* Star Button */}
          <button
            onClick={() => onToggleTerritoryStarred(territory.id)}
            className={`text-lg transition-all duration-300 hover:scale-110 ${
              isStarred
                ? 'text-yellow-500 drop-shadow-lg'
                : 'text-gray-400 hover:text-yellow-400'
            }`}
            title={isStarred ? 'Unstar territory' : 'Star territory'}
          >
            {isStarred ? '⭐' : '☆'}
          </button>

          {/* Territory Actions */}
          <TerritoryActions
            territoryId={territory.id}
            onSelectTerritoryForEvolution={onSelectTerritoryForEvolution}
            onPredictTerritoryPerformance={onPredictTerritoryPerformance}
          />
        </div>

        {/* Confidence Badge */}
        <div className={`text-xs font-bold px-2 py-1 rounded-full ${getConfidenceColorClass(averageConfidence)}`}>
          {averageConfidence}% CONF
        </div>
      </div>

      {/* Territory Title */}
      <h3 className="text-2xl font-subheading mb-4">"{territory.title}"</h3>

      {/* Positioning */}
      <div className="bg-black/10 p-3 rounded-xl mb-3">
        <div className="text-xs font-subheading mb-2">POSITIONING</div>
        <p className="font-body font-normal text-sm text-gray-800 normal-case">
          {territory.positioning}
        </p>
      </div>

      {/* Enhanced Features Indicators */}
      <div className="flex gap-2 mb-3">
        {/* Performance Prediction Indicator */}
        {performancePrediction && (
          <div className="bg-purple-500/20 border border-purple-500/30 px-2 py-1 rounded-lg">
            <div className="text-xs font-bold text-purple-600 flex items-center gap-1">
              <span>📊</span>
              Performance: {performancePrediction.overallScore}/100
            </div>
          </div>
        )}

        {/* Evolution Count Indicator */}
        {territoryEvolutions && territoryEvolutions.length > 0 && (
          <div className="bg-blue-500/20 border border-blue-500/30 px-2 py-1 rounded-lg">
            <div className="text-xs font-bold text-blue-600 flex items-center gap-1">
              <span>🧬</span>
              {territoryEvolutions.length} Evolution{territoryEvolutions.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {/* Tone */}
      <div className="bg-black/10 p-3 rounded-xl mb-4">
        <div className="text-xs font-subheading mb-2">TONE</div>
        <p className="font-body font-normal text-sm text-gray-800 normal-case">
          {territory.tone}
        </p>
      </div>

      {/* Confidence Display */}
      <ConfidenceDisplay confidence={territory.confidence} />

      {/* Headlines */}
      <HeadlineList
        territoryId={territory.id}
        headlines={territory.headlines}
        starredHeadlines={territoryHeadlines}
        onToggleHeadlineStarred={onToggleHeadlineStarred}
      />
    </div>
  );
};

export default TerritoryCard;
