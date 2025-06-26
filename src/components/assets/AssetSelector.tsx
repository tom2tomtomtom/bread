import React, { useState } from 'react';
import { useAssetStore } from '../../stores/assetStore';
import { UploadedAsset } from '../../types';
import { AssetCard } from './AssetCard';

interface AssetSelectorProps {
  onAssetsSelected: (assets: UploadedAsset[]) => void;
  onClose: () => void;
  maxSelection?: number;
  allowedTypes?: string[];
  title?: string;
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({
  onAssetsSelected,
  onClose,
  maxSelection = 5,
  allowedTypes = ['image'],
  title = 'Select Assets',
}) => {
  const [localSelection, setLocalSelection] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { applyFilters, setFilters, filters, getAssetById } = useAssetStore();

  // Filter assets based on allowed types and search
  const filteredAssets = applyFilters().filter(asset => {
    const typeMatch = allowedTypes.includes(asset.format);
    const searchMatch =
      searchQuery === '' ||
      asset.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return typeMatch && searchMatch;
  });

  const handleAssetToggle = (assetId: string) => {
    setLocalSelection(prev => {
      if (prev.includes(assetId)) {
        return prev.filter(id => id !== assetId);
      } else if (prev.length < maxSelection) {
        return [...prev, assetId];
      } else {
        // Replace the first selected asset if at max
        return [...prev.slice(1), assetId];
      }
    });
  };

  const handleConfirmSelection = () => {
    const selectedAssets = localSelection
      .map(id => getAssetById(id))
      .filter(asset => asset !== undefined) as UploadedAsset[];

    onAssetsSelected(selectedAssets);
    onClose();
  };

  const handleQuickFilter = (type: string) => {
    if (type === 'all') {
      setFilters({ type: 'all' });
    } else {
      setFilters({ type: type as any });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl border border-white/20 w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-white/70">
              Select up to {maxSelection} assets • {localSelection.length} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
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

        {/* Search and Filters */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 pl-10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-white/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2">
              {['all', 'product', 'lifestyle', 'logo', 'background'].map(type => (
                <button
                  key={type}
                  onClick={() => handleQuickFilter(type)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    (type === 'all' && filters.type === 'all') || filters.type === type
                      ? 'bg-yellow-400 text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Selection Info */}
          {localSelection.length > 0 && (
            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3">
              <p className="text-yellow-300 text-sm">
                {localSelection.length} of {maxSelection} assets selected
                {localSelection.length === maxSelection && ' (maximum reached)'}
              </p>
            </div>
          )}
        </div>

        {/* Asset Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-white/40 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="text-xl font-semibold text-white/60 mb-2">No Assets Found</h3>
              <p className="text-white/40">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : `No ${allowedTypes.join(' or ')} assets available`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAssets.map(asset => (
                <div key={asset.id} className="relative">
                  <AssetCard
                    asset={asset}
                    viewMode="grid"
                    isSelected={localSelection.includes(asset.id)}
                    selectionMode={true}
                    onClick={() => handleAssetToggle(asset.id)}
                    onDoubleClick={() => handleAssetToggle(asset.id)}
                    onToggleFavorite={() => {}} // Disabled in selector
                    onDelete={() => {}} // Disabled in selector
                  />

                  {/* Selection Badge */}
                  {localSelection.includes(asset.id) && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      {localSelection.indexOf(asset.id) + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <div className="text-white/70 text-sm">
            {filteredAssets.length} assets available • {localSelection.length} selected
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={localSelection.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Use Selected Assets ({localSelection.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
