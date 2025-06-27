import React, { useState, useEffect } from 'react';
import { EvolutionSuggestion, Territory } from '../../types';

interface SmartSuggestionsProps {
  territories: Territory[];
  suggestions: EvolutionSuggestion[];
  isVisible: boolean;
  onApplySuggestion: (territoryId: string, suggestion: EvolutionSuggestion) => void;
  onGenerateSuggestions: () => void;
  onClose: () => void;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  territories,
  suggestions,
  isVisible,
  onApplySuggestion,
  onGenerateSuggestions,
  onClose,
}) => {
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);
  const [filteredSuggestions, setFilteredSuggestions] = useState<EvolutionSuggestion[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  useEffect(() => {
    if (suggestions.length === 0) {
      onGenerateSuggestions();
    }
  }, [suggestions.length, onGenerateSuggestions]);

  useEffect(() => {
    let filtered = suggestions;

    if (filterType !== 'ALL') {
      filtered = suggestions.filter(s => s.priority === filterType);
    }

    setFilteredSuggestions(filtered);
  }, [suggestions, filterType]);

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

  const getTypeColor = (type: string) => {
    const colors = {
      TONE_SHIFT: 'bg-purple-500/20 text-purple-400',
      AUDIENCE_PIVOT: 'bg-blue-500/20 text-blue-400',
      COMPETITIVE_RESPONSE: 'bg-red-500/20 text-red-400',
      CULTURAL_ADAPTATION: 'bg-green-500/20 text-green-400',
      SEASONAL_OPTIMIZATION: 'bg-orange-500/20 text-orange-400',
      PERFORMANCE_ENHANCEMENT: 'bg-pink-500/20 text-pink-400',
      CREATIVE_EXPLORATION: 'bg-indigo-500/20 text-indigo-400',
      COMPLIANCE_ADJUSTMENT: 'bg-yellow-500/20 text-yellow-400',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  const groupedSuggestions = filteredSuggestions.reduce(
    (acc, suggestion) => {
      if (!acc[suggestion.type]) {
        acc[suggestion.type] = [];
      }
      acc[suggestion.type]!.push(suggestion);
      return acc;
    },
    {} as Record<string, EvolutionSuggestion[]>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-green-400/20 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="text-green-400 text-3xl">🤖</div>
            <div>
              <h2 className="text-2xl font-bold text-green-400">Smart Evolution Suggestions</h2>
              <p className="text-white/70">AI-powered territory optimization recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70">{filteredSuggestions.length} suggestions</span>
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

        {/* Filters */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <span className="text-white/70 font-medium">Filter by Priority:</span>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(priority => (
              <button
                key={priority}
                onClick={() => setFilterType(priority as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  filterType === priority
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        {/* Territory Selection */}
        {territories.length > 1 && (
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <span className="text-white/70 font-medium">Apply to Territory:</span>
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
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredSuggestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤔</div>
              <h3 className="text-xl font-bold text-white mb-2">No Suggestions Available</h3>
              <p className="text-white/70 mb-6">
                Generate smart suggestions to optimize your territories
              </p>
              <button
                onClick={onGenerateSuggestions}
                className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 font-medium transition-all"
              >
                Generate Smart Suggestions
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedSuggestions).map(([type, typeSuggestions]) => (
                <div key={type} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getEvolutionTypeIcon(type)}</span>
                    <h3 className="text-lg font-bold text-white">
                      {type
                        .replace(/_/g, ' ')
                        .toLowerCase()
                        .replace(/\b\w/g, l => l.toUpperCase())}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getTypeColor(type)}`}>
                      {typeSuggestions.length} suggestion{typeSuggestions.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {typeSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-white">{suggestion.title}</h4>
                              <span
                                className={`px-2 py-1 rounded text-xs font-bold border ${getPriorityColor(suggestion.priority)}`}
                              >
                                {suggestion.priority}
                              </span>
                              <span className="text-sm text-white/70">
                                {suggestion.confidence}% confidence
                              </span>
                            </div>
                            <p className="text-white/70 text-sm mb-3">{suggestion.description}</p>
                            <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-3">
                              <div className="text-xs font-medium text-green-400 mb-1">
                                Expected Impact:
                              </div>
                              <div className="text-sm text-white">{suggestion.expectedImpact}</div>
                            </div>
                          </div>
                          <div className="ml-4 space-y-2">
                            {selectedTerritory ? (
                              <button
                                onClick={() => onApplySuggestion(selectedTerritory, suggestion)}
                                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-sm text-green-400 transition-all whitespace-nowrap"
                              >
                                Apply to Selected
                              </button>
                            ) : (
                              <div className="space-y-1">
                                {territories.map(territory => (
                                  <button
                                    key={territory.id}
                                    onClick={() => onApplySuggestion(territory.id, suggestion)}
                                    className="block w-full px-3 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-xs text-green-400 transition-all"
                                  >
                                    Apply to "{territory.title.substring(0, 20)}..."
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/70">
              💡 Tip: High priority suggestions offer the most significant improvements
            </div>
            <div className="flex gap-3">
              <button
                onClick={onGenerateSuggestions}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white/70 hover:text-white transition-all"
              >
                Refresh Suggestions
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
