import React, { useState } from 'react';
import { TerritoryEvolution, Territory } from '../../types';

interface EvolutionHistoryProps {
  territories: Territory[];
  evolutions: { [territoryId: string]: TerritoryEvolution[] };
  isVisible: boolean;
  onClose: () => void;
  onApplyEvolution: (evolution: TerritoryEvolution) => void;
  onCompareEvolutions: (evolution1: TerritoryEvolution, evolution2: TerritoryEvolution) => void;
}

export const EvolutionHistory: React.FC<EvolutionHistoryProps> = ({
  territories,
  evolutions,
  isVisible,
  onClose,
  onApplyEvolution,
  onCompareEvolutions,
}) => {
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);
  const [selectedEvolutions, setSelectedEvolutions] = useState<TerritoryEvolution[]>([]);
  const [viewMode, setViewMode] = useState<'timeline' | 'comparison'>('timeline');

  if (!isVisible) return null;

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
  };

  const getAllEvolutions = () => {
    return Object.values(evolutions)
      .flat()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getEvolutionsForTerritory = (territoryId: string) => {
    return evolutions[territoryId] || [];
  };

  const handleEvolutionSelect = (evolution: TerritoryEvolution) => {
    if (selectedEvolutions.includes(evolution)) {
      setSelectedEvolutions(selectedEvolutions.filter(e => e.id !== evolution.id));
    } else if (selectedEvolutions.length < 2) {
      setSelectedEvolutions([...selectedEvolutions, evolution]);
    } else {
      setSelectedEvolutions([selectedEvolutions[1], evolution]);
    }
  };

  const totalEvolutions = getAllEvolutions().length;
  const averageImprovement =
    totalEvolutions > 0
      ? Math.round(
          getAllEvolutions().reduce((sum, e) => sum + e.improvementScore, 0) / totalEvolutions
        )
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-orange-400/20 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="text-orange-400 text-3xl">📜</div>
            <div>
              <h2 className="text-2xl font-bold text-orange-400">Evolution History</h2>
              <p className="text-white/70">Track and compare territory evolution progress</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="text-white font-medium">{totalEvolutions} Total Evolutions</div>
              <div className="text-white/70">Avg. Improvement: {averageImprovement}%</div>
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

        {/* Controls */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-white/70 font-medium">View:</span>
              {['timeline', 'comparison'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all capitalize ${
                    viewMode === mode
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-white/70 font-medium">Territory:</span>
              <select
                value={selectedTerritory || ''}
                onChange={e => setSelectedTerritory(e.target.value || null)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="">All Territories</option>
                {territories.map(territory => (
                  <option key={territory.id} value={territory.id}>
                    {territory.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {viewMode === 'comparison' && selectedEvolutions.length > 0 && (
            <div className="mt-4 p-3 bg-orange-400/10 border border-orange-400/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-orange-400 font-medium">
                  {selectedEvolutions.length} evolution{selectedEvolutions.length !== 1 ? 's' : ''}{' '}
                  selected
                </span>
                {selectedEvolutions.length === 2 && (
                  <button
                    onClick={() =>
                      onCompareEvolutions(selectedEvolutions[0], selectedEvolutions[1])
                    }
                    className="px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded text-sm text-orange-400 transition-all"
                  >
                    Compare Selected
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {totalEvolutions === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-white mb-2">No Evolution History</h3>
              <p className="text-white/70">Start evolving territories to see their history here</p>
            </div>
          ) : viewMode === 'timeline' ? (
            <div className="space-y-6">
              {(selectedTerritory
                ? getEvolutionsForTerritory(selectedTerritory)
                : getAllEvolutions()
              ).map((evolution, index) => (
                <div
                  key={evolution.id}
                  className={`bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer ${
                    selectedEvolutions.includes(evolution) ? 'ring-2 ring-orange-400/50' : ''
                  }`}
                  onClick={() => {
                    if (viewMode === 'timeline') {
                      onApplyEvolution(evolution);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl">
                          {getEvolutionTypeIcon(evolution.evolutionType)}
                        </span>
                        <div className="w-px h-8 bg-white/20 mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-white">
                            {evolution.resultingTerritory.title}
                          </h4>
                          <span className="text-sm text-white/70">
                            {evolution.timestamp.toLocaleDateString()} at{' '}
                            {evolution.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-orange-400 font-medium">
                            {evolution.evolutionType.replace(/_/g, ' ').toLowerCase()}
                          </span>
                          <span className="text-white/70">•</span>
                          <span className="text-sm text-white/70">
                            Original:{' '}
                            {territories.find(t => t.id === evolution.originalTerritoryId)?.title ||
                              'Unknown'}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm">{evolution.evolutionReasoning}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-3 py-1 rounded-full font-bold ${getScoreBackground(evolution.improvementScore)}`}
                      >
                        +{evolution.improvementScore}
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onApplyEvolution(evolution);
                        }}
                        className="px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded text-sm text-orange-400 transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Evolution Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-black/20 rounded-lg p-3">
                      <div className="text-xs text-white/60 mb-1">Evolved Positioning:</div>
                      <div className="text-sm text-white">
                        {evolution.resultingTerritory.positioning}
                      </div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <div className="text-xs text-white/60 mb-1">Evolved Tone:</div>
                      <div className="text-sm text-orange-400">
                        {evolution.resultingTerritory.tone}
                      </div>
                    </div>
                  </div>

                  {/* Headlines Preview */}
                  {evolution.resultingTerritory.headlines.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs text-white/60 mb-2">Sample Headlines:</div>
                      <div className="space-y-1">
                        {evolution.resultingTerritory.headlines.slice(0, 2).map((headline, idx) => (
                          <div
                            key={idx}
                            className="text-sm text-white/80 bg-black/20 rounded px-2 py-1"
                          >
                            "{headline.text}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-white mb-2">Evolution Comparison Mode</h3>
                <p className="text-white/70">
                  Select up to 2 evolutions to compare their performance and changes
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getAllEvolutions().map(evolution => (
                  <div
                    key={evolution.id}
                    className={`bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer ${
                      selectedEvolutions.includes(evolution)
                        ? 'ring-2 ring-orange-400/50 bg-orange-400/5'
                        : ''
                    }`}
                    onClick={() => handleEvolutionSelect(evolution)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl">
                        {getEvolutionTypeIcon(evolution.evolutionType)}
                      </span>
                      <div
                        className={`px-2 py-1 rounded font-bold text-sm ${getScoreBackground(evolution.improvementScore)}`}
                      >
                        +{evolution.improvementScore}
                      </div>
                    </div>
                    <h4 className="font-bold text-white text-sm mb-2">
                      {evolution.resultingTerritory.title}
                    </h4>
                    <p className="text-xs text-white/70 mb-2">
                      {evolution.evolutionType.replace(/_/g, ' ').toLowerCase()}
                    </p>
                    <p className="text-xs text-white/60">
                      {evolution.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/70">
              📊 Track evolution performance to identify the most effective optimization strategies
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-400 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
