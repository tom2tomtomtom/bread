import React from 'react';

interface TerritoryActionsProps {
  territoryId: string;
  onSelectTerritoryForEvolution?: (territoryId: string | null) => void;
  onPredictTerritoryPerformance?: (territoryId: string) => void;
  onGenerateImage?: (territoryId: string) => void;
}

/**
 * TerritoryActions - Action buttons for territory operations
 *
 * Responsibilities:
 * - Evolution button and handler
 * - Performance prediction button and handler
 * - Future territory actions (analyze, optimize, etc.)
 */
export const TerritoryActions: React.FC<TerritoryActionsProps> = ({
  territoryId,
  onSelectTerritoryForEvolution,
  onPredictTerritoryPerformance,
  onGenerateImage,
}) => {
  return (
    <>
      {/* Image Generation Button */}
      {onGenerateImage && (
        <button
          onClick={() => onGenerateImage(territoryId)}
          className="text-sm bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 px-2 py-1 rounded-lg text-orange-600 transition-all flex items-center gap-1"
          title="Generate image for this territory"
        >
          <span>🎨</span>
          Image
        </button>
      )}

      {/* Evolution Button */}
      {onSelectTerritoryForEvolution && (
        <button
          onClick={() => onSelectTerritoryForEvolution(territoryId)}
          className="text-sm bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 px-2 py-1 rounded-lg text-blue-600 transition-all flex items-center gap-1"
          title="Evolve this territory"
        >
          <span>🧬</span>
          Evolve
        </button>
      )}

      {/* Performance Prediction Button */}
      {onPredictTerritoryPerformance && (
        <button
          onClick={() => onPredictTerritoryPerformance(territoryId)}
          className="text-sm bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 px-2 py-1 rounded-lg text-purple-600 transition-all flex items-center gap-1"
          title="Predict performance"
        >
          <span>📊</span>
          Predict
        </button>
      )}
    </>
  );
};

export default TerritoryActions;
