import React, { memo, useMemo, useCallback } from 'react';
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
 * TerritoryCard - Individual territory display component (PERFORMANCE OPTIMIZED)
 *
 * Responsibilities:
 * - Display territory information (title, positioning, tone)
 * - Show confidence scoring
 * - Handle territory-level actions (star, evolve, predict)
 * - Display performance indicators
 * - Render associated headlines
 *
 * Performance Optimizations:
 * - React.memo for preventing unnecessary re-renders
 * - useMemo for expensive calculations
 * - useCallback for stable function references
 */
const TerritoryCardComponent: React.FC<TerritoryCardProps> = ({
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
  // Memoized calculations to prevent recalculation on every render
  const isStarred = useMemo(
    () => starredItems.territories.includes(territory.id),
    [starredItems.territories, territory.id]
  );

  const territoryHeadlines = useMemo(
    () => starredItems.headlines[territory.id] || [],
    [starredItems.headlines, territory.id]
  );

  // Calculate average confidence (memoized for performance)
  const averageConfidence = useMemo(
    () => Math.round(
      (territory.confidence.marketFit +
        territory.confidence.complianceConfidence +
        territory.confidence.audienceResonance) / 3
    ),
    [territory.confidence.marketFit, territory.confidence.complianceConfidence, territory.confidence.audienceResonance]
  );

  // Memoized confidence color class calculation
  const confidenceColorClass = useMemo(() => {
    if (averageConfidence >= 80) return 'bg-green-400 text-white';
    if (averageConfidence >= 60) return 'bg-yellow-600 text-white';
    return 'bg-red-500 text-white';
  }, [averageConfidence]);

  // Stable callback functions to prevent child re-renders
  const handleToggleStarred = useCallback(() => {
    onToggleTerritoryStarred(territory.id);
  }, [onToggleTerritoryStarred, territory.id]);

  const handleToggleHeadlineStarred = useCallback((headlineIndex: number) => {
    onToggleHeadlineStarred(territory.id, headlineIndex);
  }, [onToggleHeadlineStarred, territory.id]);

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
            onClick={handleToggleStarred}
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
        <div className={`text-xs font-bold px-2 py-1 rounded-full ${confidenceColorClass}`}>
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

// Memoized component to prevent unnecessary re-renders
export const TerritoryCard = memo(TerritoryCardComponent, (prevProps, nextProps) => {
  // Custom comparison function for optimal performance
  return (
    prevProps.territory.id === nextProps.territory.id &&
    prevProps.territory.title === nextProps.territory.title &&
    prevProps.territory.positioning === nextProps.territory.positioning &&
    prevProps.territory.tone === nextProps.territory.tone &&
    prevProps.territory.confidence.marketFit === nextProps.territory.confidence.marketFit &&
    prevProps.territory.confidence.complianceConfidence === nextProps.territory.confidence.complianceConfidence &&
    prevProps.territory.confidence.audienceResonance === nextProps.territory.confidence.audienceResonance &&
    prevProps.territory.confidence.riskLevel === nextProps.territory.confidence.riskLevel &&
    prevProps.territory.headlines.length === nextProps.territory.headlines.length &&
    prevProps.starredItems.territories.includes(prevProps.territory.id) ===
      nextProps.starredItems.territories.includes(nextProps.territory.id) &&
    JSON.stringify(prevProps.starredItems.headlines[prevProps.territory.id]) ===
      JSON.stringify(nextProps.starredItems.headlines[nextProps.territory.id]) &&
    prevProps.territoryEvolutions?.length === nextProps.territoryEvolutions?.length &&
    prevProps.performancePrediction?.overallScore === nextProps.performancePrediction?.overallScore
  );
});

export default TerritoryCard;
