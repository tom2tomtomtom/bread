import React, { useState } from 'react';
import { useAssetStore } from '../../stores/assetStore';
import { AssetType, AssetFormat } from '../../types';

export const AssetFilters: React.FC = () => {
  const { filters, collections, assets, setFilters, clearFilters, searchAssets } = useAssetStore();

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get all unique tags from assets
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    assets.forEach(asset => {
      asset.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [assets]);

  const handleSearchChange = (value: string) => {
    setFilters({ search: value });
    if (value.trim()) {
      searchAssets(value);
    }
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    setFilters({ tags: newTags });
  };

  const handleCollectionToggle = (collectionId: string) => {
    const newCollections = filters.collections.includes(collectionId)
      ? filters.collections.filter(c => c !== collectionId)
      : [...filters.collections, collectionId];
    setFilters({ collections: newCollections });
  };

  const assetTypes: { value: AssetType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'product', label: 'Product' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'logo', label: 'Logo' },
    { value: 'background', label: 'Background' },
    { value: 'texture', label: 'Texture' },
    { value: 'icon', label: 'Icon' },
    { value: 'other', label: 'Other' },
  ];

  const assetFormats: { value: AssetFormat | 'all'; label: string }[] = [
    { value: 'all', label: 'All Formats' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'document', label: 'Documents' },
    { value: 'archive', label: 'Archives' },
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Filters</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-white/70 hover:text-white text-sm"
          >
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </button>
          <button onClick={clearFilters} className="text-yellow-400 hover:text-yellow-300 text-sm">
            Clear All
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Search Assets</label>
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search by filename, tags, or description..."
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
        </div>

        {/* Type and Format */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Asset Type</label>
            <select
              value={filters.type}
              onChange={e => setFilters({ type: e.target.value as AssetType | 'all' })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              {assetTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Format</label>
            <select
              value={filters.format}
              onChange={e => setFilters({ format: e.target.value as AssetFormat | 'all' })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              {assetFormats.map(format => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filters */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Quick Filters</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilters({ onlyFavorites: !filters.onlyFavorites })}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                filters.onlyFavorites
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              ⭐ Favorites Only
            </button>
            <button
              onClick={() => setFilters({ onlyPublic: !filters.onlyPublic })}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                filters.onlyPublic
                  ? 'bg-green-400 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🌐 Public Only
            </button>
          </div>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Tags ({filters.tags.length} selected)
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    filters.tags.includes(tag)
                      ? 'bg-blue-400 text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Collections */}
        {collections.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Collections ({filters.collections.length} selected)
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {collections.map(collection => (
                <label key={collection.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.collections.includes(collection.id)}
                    onChange={() => handleCollectionToggle(collection.id)}
                    className="mr-2 rounded"
                  />
                  <span className="text-white text-sm">{collection.name}</span>
                  <span className="text-white/50 text-xs ml-2">
                    ({collection.assetIds.length} assets)
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Upload Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.dateRange?.start.toISOString().split('T')[0] || ''}
                  onChange={e => {
                    const start = e.target.value ? new Date(e.target.value) : undefined;
                    setFilters({
                      dateRange:
                        start && filters.dateRange?.end
                          ? { start, end: filters.dateRange.end }
                          : undefined,
                    });
                  }}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                />
                <input
                  type="date"
                  value={filters.dateRange?.end.toISOString().split('T')[0] || ''}
                  onChange={e => {
                    const end = e.target.value ? new Date(e.target.value) : undefined;
                    setFilters({
                      dateRange:
                        end && filters.dateRange?.start
                          ? { start: filters.dateRange.start, end }
                          : undefined,
                    });
                  }}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            </div>

            {/* File Size Range */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                File Size Range (MB)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min size"
                  value={filters.sizeRange?.min ? filters.sizeRange.min / (1024 * 1024) : ''}
                  onChange={e => {
                    const min = e.target.value
                      ? parseFloat(e.target.value) * 1024 * 1024
                      : undefined;
                    setFilters({
                      sizeRange:
                        min !== undefined && filters.sizeRange?.max
                          ? { min, max: filters.sizeRange.max }
                          : undefined,
                    });
                  }}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                />
                <input
                  type="number"
                  placeholder="Max size"
                  value={filters.sizeRange?.max ? filters.sizeRange.max / (1024 * 1024) : ''}
                  onChange={e => {
                    const max = e.target.value
                      ? parseFloat(e.target.value) * 1024 * 1024
                      : undefined;
                    setFilters({
                      sizeRange:
                        max !== undefined && filters.sizeRange?.min
                          ? { min: filters.sizeRange.min, max }
                          : undefined,
                    });
                  }}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {(filters.search ||
        filters.type !== 'all' ||
        filters.format !== 'all' ||
        filters.tags.length > 0 ||
        filters.collections.length > 0 ||
        filters.onlyFavorites ||
        filters.onlyPublic ||
        filters.dateRange ||
        filters.sizeRange) && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <h4 className="text-sm font-medium text-white/80 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {filters.search && (
              <span className="bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded">
                Search: "{filters.search}"
              </span>
            )}
            {filters.type !== 'all' && (
              <span className="bg-blue-400/20 text-blue-300 px-2 py-1 rounded">
                Type: {filters.type}
              </span>
            )}
            {filters.format !== 'all' && (
              <span className="bg-green-400/20 text-green-300 px-2 py-1 rounded">
                Format: {filters.format}
              </span>
            )}
            {filters.tags.map(tag => (
              <span key={tag} className="bg-purple-400/20 text-purple-300 px-2 py-1 rounded">
                Tag: {tag}
              </span>
            ))}
            {filters.onlyFavorites && (
              <span className="bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded">
                Favorites Only
              </span>
            )}
            {filters.onlyPublic && (
              <span className="bg-green-400/20 text-green-300 px-2 py-1 rounded">Public Only</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
