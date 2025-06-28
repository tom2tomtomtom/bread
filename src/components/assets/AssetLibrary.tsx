import React, { useState, useMemo, memo, useCallback } from 'react';
import { useAssetStore } from '../../stores/assetStore';
import { UploadedAsset, SortBy, SortOrder } from '../../types';
import { AssetCard } from './AssetCard';
import { AssetFilters } from './AssetFilters';

interface AssetLibraryProps {
  onAssetSelect?: (asset: UploadedAsset) => void;
  onAssetPreview?: (asset: UploadedAsset) => void;
  selectionMode?: boolean;
  className?: string;
}

const AssetLibraryComponent: React.FC<AssetLibraryProps> = ({
  onAssetSelect,
  onAssetPreview,
  selectionMode = false,
  className = '',
}) => {
  const {
    assets,
    selectedAssets,
    viewMode,
    sortBy,
    sortOrder,
    filters,
    isLoading,
    applyFilters,
    setViewMode,
    setSorting,
    // selectAsset,
    // deselectAsset,
    clearSelection,
    selectAll,
    toggleAssetSelection,
    deleteAsset,
    toggleAssetFavorite,
    getAssetUsageStats,
  } = useAssetStore();

  const [showFilters, setShowFilters] = useState(false);

  // Apply filters and sorting
  const filteredAndSortedAssets = useMemo(() => {
    console.log('🔍 AssetLibrary Debug:', {
      totalAssets: assets.length,
      assets: assets.map(a => ({ id: a.id, filename: a.filename, type: a.type, format: a.format, tags: a.tags })),
      activeFilters: filters
    });
    
    const filtered = applyFilters();
    console.log('📋 Filtered assets:', filtered.length, filtered.map(a => ({ id: a.id, filename: a.filename })));

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.filename.localeCompare(b.filename);
          break;
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
        case 'size':
          comparison = a.metadata.size - b.metadata.size;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'usage':
          comparison = a.usageCount - b.usageCount;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [assets, filters, sortBy, sortOrder, applyFilters]);

  const usageStats = getAssetUsageStats();

  const handleAssetClick = useCallback((asset: UploadedAsset) => {
    if (selectionMode) {
      toggleAssetSelection(asset.id);
    } else {
      onAssetSelect?.(asset);
    }
  }, [selectionMode, toggleAssetSelection, onAssetSelect]);

  const handleAssetDoubleClick = useCallback((asset: UploadedAsset) => {
    onAssetPreview?.(asset);
  }, [onAssetPreview]);

  const handleDeleteSelected = async () => {
    if (selectedAssets.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedAssets.length} asset(s)? This action cannot be undone.`
    );

    if (confirmed) {
      for (const assetId of selectedAssets) {
        await deleteAsset(assetId);
      }
      clearSelection();
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className={`asset-library ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Asset Library</h2>
          <p className="text-white/70">
            {filteredAndSortedAssets.length} of {assets.length} assets
            {usageStats.totalSize > 0 && (
              <span className="ml-2">• {formatFileSize(usageStats.totalSize)} total</span>
            )}
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-4">
          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg transition-all ${
              showFilters ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
              />
            </svg>
          </button>

          {/* View Mode Toggle */}
          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all ${
                viewMode === 'grid' ? 'bg-yellow-400 text-black' : 'text-white hover:bg-white/20'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all ${
                viewMode === 'list' ? 'bg-yellow-400 text-black' : 'text-white hover:bg-white/20'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Sort Controls */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={e => {
              const [newSortBy, newSortOrder] = e.target.value.split('-') as [SortBy, SortOrder];
              setSorting(newSortBy, newSortOrder);
            }}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="size-desc">Largest First</option>
            <option value="size-asc">Smallest First</option>
            <option value="type-asc">Type A-Z</option>
            <option value="usage-desc">Most Used</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6">
          <AssetFilters />
        </div>
      )}

      {/* Selection Actions */}
      {selectedAssets.length > 0 && (
        <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-yellow-300">{selectedAssets.length} asset(s) selected</span>
            <div className="flex items-center gap-3">
              <button onClick={selectAll} className="text-yellow-300 hover:text-yellow-200 text-sm">
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="text-yellow-300 hover:text-yellow-200 text-sm"
              >
                Clear Selection
              </button>
              <button
                onClick={handleDeleteSelected}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1 rounded text-sm transition-all"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Grid/List */}
      {filteredAndSortedAssets.length === 0 ? (
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
            {assets.length === 0
              ? 'Upload your first assets to get started'
              : 'Try adjusting your filters or search terms'}
          </p>
        </div>
      ) : (
        <div
          className={`
          ${
            viewMode === 'grid'
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
              : 'space-y-2'
          }
        `}
        >
          {filteredAndSortedAssets.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              viewMode={viewMode}
              isSelected={selectedAssets.includes(asset.id)}
              selectionMode={selectionMode}
              onClick={() => handleAssetClick(asset)}
              onDoubleClick={() => handleAssetDoubleClick(asset)}
              onToggleFavorite={() => toggleAssetFavorite(asset.id)}
              onDelete={() => deleteAsset(asset.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Export memoized component for performance optimization
export const AssetLibrary = memo(AssetLibraryComponent);
