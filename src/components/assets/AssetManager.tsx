import React, { useState } from 'react';
import { AssetUpload } from './AssetUpload';
import { AssetLibrary } from './AssetLibrary';
import { AssetPreview } from './AssetPreview';
import { useAssetStore } from '../../stores/assetStore';
import { UploadedAsset } from '../../types';

interface AssetManagerProps {
  onAssetSelect?: (asset: UploadedAsset) => void;
  selectionMode?: boolean;
  className?: string;
}

export const AssetManager: React.FC<AssetManagerProps> = ({
  onAssetSelect,
  selectionMode = false,
  className = '',
}) => {
  const [activeView, setActiveView] = useState<'library' | 'upload'>('library');
  const [previewAsset, setPreviewAsset] = useState<UploadedAsset | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number>(-1);

  const { assets, selectedAssets, applyFilters, clearSelection, getAssetUsageStats } =
    useAssetStore();

  const filteredAssets = applyFilters();
  const usageStats = getAssetUsageStats();

  // Handle asset preview navigation
  const handlePreviewNext = () => {
    if (previewIndex < filteredAssets.length - 1) {
      const nextIndex = previewIndex + 1;
      const nextAsset = filteredAssets[nextIndex];
      if (nextAsset) {
        setPreviewIndex(nextIndex);
        setPreviewAsset(nextAsset);
      }
    }
  };

  const handlePreviewPrevious = () => {
    if (previewIndex > 0) {
      const prevIndex = previewIndex - 1;
      const prevAsset = filteredAssets[prevIndex];
      if (prevAsset) {
        setPreviewIndex(prevIndex);
        setPreviewAsset(prevAsset);
      }
    }
  };

  const handleAssetPreview = (asset: UploadedAsset) => {
    const index = filteredAssets.findIndex(a => a.id === asset.id);
    setPreviewIndex(index);
    setPreviewAsset(asset);
  };

  const handleUploadComplete = () => {
    setActiveView('library');
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <div className={`asset-manager ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Asset Management</h1>
          <div className="flex items-center gap-6 text-sm text-white/70">
            <span>{usageStats.totalAssets} assets</span>
            <span>{formatFileSize(usageStats.totalSize)} total size</span>
            {selectedAssets.length > 0 && (
              <span className="text-yellow-400">{selectedAssets.length} selected</span>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setActiveView('library')}
            className={`px-4 py-2 rounded transition-all ${
              activeView === 'library' ? 'bg-yellow-400 text-black' : 'text-white hover:bg-white/20'
            }`}
          >
            📚 Library
          </button>
          <button
            onClick={() => setActiveView('upload')}
            className={`px-4 py-2 rounded transition-all ${
              activeView === 'upload' ? 'bg-yellow-400 text-black' : 'text-white hover:bg-white/20'
            }`}
          >
            ⬆️ Upload
          </button>
        </div>
      </div>

      {/* Usage Statistics */}
      {usageStats.totalAssets > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          {Object.entries(usageStats.byType).map(([type, count]) => (
            <div
              key={type}
              className="bg-white/5 border border-white/10 rounded-lg p-4 text-center"
            >
              <div className="text-2xl font-bold text-white">{count}</div>
              <div className="text-sm text-white/60 capitalize">{type}</div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="min-h-[600px]">
        {activeView === 'library' ? (
          <AssetLibrary
            onAssetSelect={onAssetSelect}
            onAssetPreview={handleAssetPreview}
            selectionMode={selectionMode}
          />
        ) : (
          <AssetUpload onUploadComplete={handleUploadComplete} />
        )}
      </div>

      {/* Asset Preview Modal */}
      <AssetPreview
        asset={previewAsset}
        isOpen={!!previewAsset}
        onClose={() => {
          setPreviewAsset(null);
          setPreviewIndex(-1);
        }}
        onNext={previewIndex < filteredAssets.length - 1 ? handlePreviewNext : undefined}
        onPrevious={previewIndex > 0 ? handlePreviewPrevious : undefined}
      />

      {/* Quick Actions */}
      {selectedAssets.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-yellow-400 text-black rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-4">
            <span className="font-medium">{selectedAssets.length} asset(s) selected</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Add to collection functionality would go here
                  console.log('Add to collection:', selectedAssets);
                }}
                className="bg-black/20 hover:bg-black/30 text-black px-3 py-1 rounded text-sm transition-all"
              >
                Add to Collection
              </button>
              <button
                onClick={clearSelection}
                className="bg-black/20 hover:bg-black/30 text-black px-3 py-1 rounded text-sm transition-all"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {assets.length === 0 && activeView === 'library' && (
        <div className="text-center py-16">
          <svg
            className="w-24 h-24 mx-auto text-white/20 mb-6"
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
          <h3 className="text-2xl font-bold text-white/60 mb-4">No Assets Yet</h3>
          <p className="text-white/40 mb-8 max-w-md mx-auto">
            Start building your asset library by uploading images, videos, and other creative
            materials.
          </p>
          <button
            onClick={() => setActiveView('upload')}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold px-8 py-3 rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 shadow-lg"
          >
            Upload Your First Assets
          </button>
        </div>
      )}
    </div>
  );
};
