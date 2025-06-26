import React, { memo, useMemo, useCallback } from 'react';
import { Headline } from '../../types';

interface HeadlineListProps {
  territoryId: string;
  headlines: Headline[];
  starredHeadlines: number[];
  onToggleHeadlineStarred: (territoryId: string, headlineIndex: number) => void;
}

/**
 * HeadlineList - Display and manage headlines for a territory (PERFORMANCE OPTIMIZED)
 *
 * Responsibilities:
 * - Display all headlines for a territory
 * - Handle headline starring/unstarring
 * - Show headline confidence scores
 * - Display follow-up content and reasoning
 *
 * Performance Optimizations:
 * - React.memo for preventing unnecessary re-renders
 * - useMemo for expensive calculations
 * - useCallback for stable function references
 */
const HeadlineListComponent: React.FC<HeadlineListProps> = ({
  territoryId,
  headlines,
  starredHeadlines,
  onToggleHeadlineStarred,
}) => {
  // Memoized confidence color calculation
  const getHeadlineConfidenceColor = useCallback((confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  }, []);

  // Memoized headline toggle handler
  const handleToggleHeadlineStarred = useCallback((headlineIndex: number) => {
    onToggleHeadlineStarred(territoryId, headlineIndex);
  }, [onToggleHeadlineStarred, territoryId]);

  return (
    <div>
      <div className="text-xs font-subheading mb-3">HEADLINES</div>
      <div className="space-y-3">
        {headlines.map((headline, headlineIndex) => {
          const isHeadlineStarred = starredHeadlines.includes(headlineIndex);
          
          return (
            <div
              key={headlineIndex}
              className="bg-black/10 p-4 rounded-xl hover:bg-black/15 transition-all duration-200"
            >
              {/* Headline Header */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-2 flex-1">
                  {/* Star Button */}
                  <button
                    onClick={() => handleToggleHeadlineStarred(headlineIndex)}
                    className={`text-sm transition-all duration-300 hover:scale-110 mt-0.5 ${
                      isHeadlineStarred
                        ? 'text-yellow-500 drop-shadow-lg'
                        : 'text-gray-400 hover:text-yellow-400'
                    }`}
                    title={isHeadlineStarred ? 'Unstar headline' : 'Star headline'}
                  >
                    {isHeadlineStarred ? '⭐' : '☆'}
                  </button>

                  {/* Headline Text */}
                  <div className="flex-1">
                    <h4 className="font-subheading text-base font-bold text-gray-900 mb-1">
                      "{headline.text}"
                    </h4>
                  </div>
                </div>

                {/* Confidence Score */}
                {headline.confidence && (
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${getHeadlineConfidenceColor(headline.confidence)}`}>
                    {headline.confidence}%
                  </div>
                )}
              </div>

              {/* Follow-up Content */}
              {headline.followUp && (
                <div className="mb-2">
                  <div className="text-xs font-medium text-gray-600 mb-1">FOLLOW-UP</div>
                  <p className="text-sm text-gray-700 font-body">
                    {headline.followUp}
                  </p>
                </div>
              )}

              {/* Reasoning */}
              {headline.reasoning && (
                <div className="mb-2">
                  <div className="text-xs font-medium text-gray-600 mb-1">WHY THIS WORKS</div>
                  <p className="text-sm text-gray-700 font-body italic">
                    {headline.reasoning}
                  </p>
                </div>
              )}

              {/* Additional Headline Metadata */}
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                <span>#{headlineIndex + 1}</span>
                {headline.confidence && (
                  <span>Confidence: {headline.confidence}%</span>
                )}
                {isHeadlineStarred && (
                  <span className="text-yellow-600 font-medium">⭐ Starred</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Headlines Summary */}
      {headlines.length > 0 && (
        <div className="mt-3 p-2 bg-black/5 rounded-lg">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>{headlines.length} headline{headlines.length !== 1 ? 's' : ''} generated</span>
            <span>{starredHeadlines.length} starred</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoized component to prevent unnecessary re-renders
export const HeadlineList = memo(HeadlineListComponent, (prevProps, nextProps) => {
  // Custom comparison for optimal performance
  return (
    prevProps.territoryId === nextProps.territoryId &&
    prevProps.headlines.length === nextProps.headlines.length &&
    prevProps.starredHeadlines.length === nextProps.starredHeadlines.length &&
    JSON.stringify(prevProps.starredHeadlines) === JSON.stringify(nextProps.starredHeadlines) &&
    prevProps.headlines.every((headline, index) =>
      headline.text === nextProps.headlines[index]?.text &&
      headline.confidence === nextProps.headlines[index]?.confidence
    )
  );
});

export default HeadlineList;
