import React, { useState } from 'react';
import { UploadedAsset } from '../../types';
import { AssetSelector } from '../assets/AssetSelector';

interface AssetEnhancedBriefBuilderProps {
  brief: string;
  onBriefChange: (brief: string) => void;
  selectedAssets: UploadedAsset[];
  onAssetsChange: (assets: UploadedAsset[]) => void;
}

export const AssetEnhancedBriefBuilder: React.FC<AssetEnhancedBriefBuilderProps> = ({
  brief,
  onBriefChange,
  selectedAssets,
  onAssetsChange,
}) => {
  const [showAssetSelector, setShowAssetSelector] = useState(false);

  const handleAssetSelection = (assets: UploadedAsset[]) => {
    onAssetsChange(assets);

    // Auto-enhance brief with asset information
    if (assets.length > 0) {
      enhanceBriefWithAssets(assets);
    }
  };

  const enhanceBriefWithAssets = (assets: UploadedAsset[]) => {
    let enhancement = '\n\n🎨 SELECTED ASSETS:\n';

    assets.forEach((asset, index) => {
      enhancement += `${index + 1}. ${asset.filename}\n`;
      enhancement += `   Type: ${asset.type} | Format: ${asset.format}\n`;

      if (asset.aiAnalysis) {
        enhancement += `   Mood: ${asset.aiAnalysis.mood.join(', ')}\n`;
        enhancement += `   Style: ${asset.aiAnalysis.style.join(', ')}\n`;
        if (asset.aiAnalysis.colors.primary) {
          enhancement += `   Primary Color: ${asset.aiAnalysis.colors.primary}\n`;
        }
      }

      if (asset.tags.length > 0) {
        enhancement += `   Tags: ${asset.tags.slice(0, 5).join(', ')}\n`;
      }

      enhancement += '\n';
    });

    enhancement += '📝 CREATIVE DIRECTION:\n';
    enhancement +=
      'Please incorporate the visual elements, mood, and style from the selected assets into the territory generation. ';
    enhancement +=
      'Consider the color palette, composition style, and thematic elements when creating territories that would complement these assets.\n';

    // Only add if not already present
    if (!brief.includes('🎨 SELECTED ASSETS:')) {
      onBriefChange(brief + enhancement);
    } else {
      // Replace existing asset section
      const briefParts = brief.split('🎨 SELECTED ASSETS:');
      const newBrief = briefParts[0] + enhancement;
      onBriefChange(newBrief);
    }
  };

  const removeAsset = (assetId: string) => {
    const updatedAssets = selectedAssets.filter(asset => asset.id !== assetId);
    onAssetsChange(updatedAssets);

    if (updatedAssets.length === 0) {
      // Remove asset section from brief
      const briefParts = brief.split('🎨 SELECTED ASSETS:');
      if (briefParts.length > 1) {
        onBriefChange(briefParts[0].trim());
      }
    } else {
      enhanceBriefWithAssets(updatedAssets);
    }
  };

  const getAssetTypeIcon = (type: string) => {
    const icons = {
      product: '📦',
      lifestyle: '🌟',
      logo: '🏷️',
      background: '🖼️',
      texture: '🎨',
      icon: '🔸',
      other: '📄',
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  return (
    <div className="space-y-6">
      {/* Brief Input */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">Creative Brief</label>
        <textarea
          value={brief}
          onChange={e => onBriefChange(e.target.value)}
          placeholder="Describe your creative vision, target audience, key messages, and any specific requirements..."
          className="w-full h-32 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all resize-none"
        />
      </div>

      {/* Asset Integration Section */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Visual Assets</h3>
          <button
            onClick={() => setShowAssetSelector(true)}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-semibold px-4 py-2 rounded-lg transition-all duration-300"
          >
            + Add Assets
          </button>
        </div>

        {selectedAssets.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 mx-auto text-white/40 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-white/60 mb-2">No assets selected</p>
            <p className="text-white/40 text-sm">
              Add visual assets to enhance your creative brief with specific visual references
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-white/70 text-sm">
              {selectedAssets.length} asset(s) selected. These will influence the creative
              direction.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedAssets.map(asset => (
                <div key={asset.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        {asset.format === 'image' && asset.thumbnailUrl ? (
                          <img
                            src={asset.thumbnailUrl}
                            alt={asset.filename}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-xl">{getAssetTypeIcon(asset.type)}</span>
                        )}
                      </div>

                      {/* Asset Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white text-sm truncate">
                          {asset.filename}
                        </h4>
                        <p className="text-white/60 text-xs">
                          {asset.type} • {asset.format}
                        </p>

                        {/* AI Analysis Preview */}
                        {asset.aiAnalysis && (
                          <div className="mt-2 space-y-1">
                            {asset.aiAnalysis.mood.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {asset.aiAnalysis.mood.slice(0, 3).map(mood => (
                                  <span
                                    key={mood}
                                    className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs"
                                  >
                                    {mood}
                                  </span>
                                ))}
                              </div>
                            )}

                            {asset.aiAnalysis.colors.primary && (
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded border border-white/20"
                                  style={{ backgroundColor: asset.aiAnalysis.colors.primary }}
                                />
                                <span className="text-white/50 text-xs">
                                  {asset.aiAnalysis.colors.primary}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeAsset(asset.id)}
                      className="p-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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
              ))}
            </div>

            {/* Asset Insights */}
            {selectedAssets.some(asset => asset.aiAnalysis) && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="text-blue-300 font-medium mb-2">💡 Asset Insights</h4>
                <div className="text-blue-200 text-sm space-y-1">
                  {(() => {
                    const allMoods = selectedAssets.flatMap(asset => asset.aiAnalysis?.mood || []);
                    const allStyles = selectedAssets.flatMap(
                      asset => asset.aiAnalysis?.style || []
                    );
                    const uniqueMoods = Array.from(new Set(allMoods));
                    const uniqueStyles = Array.from(new Set(allStyles));

                    return (
                      <>
                        {uniqueMoods.length > 0 && (
                          <p>• Dominant moods: {uniqueMoods.slice(0, 4).join(', ')}</p>
                        )}
                        {uniqueStyles.length > 0 && (
                          <p>• Visual styles: {uniqueStyles.slice(0, 4).join(', ')}</p>
                        )}
                        <p>• These elements will be considered in territory generation</p>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Asset Selector Modal */}
      {showAssetSelector && (
        <AssetSelector
          onAssetsSelected={handleAssetSelection}
          onClose={() => setShowAssetSelector(false)}
          maxSelection={5}
          allowedTypes={['image']}
          title="Select Visual References"
        />
      )}
    </div>
  );
};
