import React, { useState } from 'react';
import { UploadedAsset } from '../../types';
import { useAssetStore } from '../../stores/assetStore';

interface AssetPreviewProps {
  asset: UploadedAsset | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export const AssetPreview: React.FC<AssetPreviewProps> = ({
  asset,
  isOpen,
  onClose,
  onNext,
  onPrevious,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'details' | 'analysis'>('preview');
  const [editingTags, setEditingTags] = useState(false);
  const [newTags, setNewTags] = useState<string>('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState('');

  const { updateAsset, toggleAssetFavorite, deleteAsset } = useAssetStore();

  if (!isOpen || !asset) return null;

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString();
  };

  const handleSaveTags = async () => {
    const tags = newTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    await updateAsset(asset.id, { tags });
    setEditingTags(false);
    setNewTags('');
  };

  const handleSaveDescription = async () => {
    await updateAsset(asset.id, { description: newDescription });
    setEditingDescription(false);
    setNewDescription('');
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this asset? This action cannot be undone.'
    );
    if (confirmed) {
      await deleteAsset(asset.id);
      onClose();
    }
  };

  const renderPreview = () => {
    if (asset.format === 'image') {
      return (
        <img
          src={asset.url}
          alt={asset.filename}
          className="max-w-full max-h-full object-contain"
        />
      );
    }

    if (asset.format === 'video') {
      return (
        <video src={asset.url} controls className="max-w-full max-h-full">
          Your browser does not support the video tag.
        </video>
      );
    }

    if (asset.format === 'audio') {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <svg
            className="w-24 h-24 text-white/40 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          <audio src={asset.url} controls className="w-full max-w-md">
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-64">
        <svg
          className="w-24 h-24 text-white/40 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-white/60 text-center">Preview not available for this file type</p>
        <a
          href={asset.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-300 transition-all"
        >
          Download File
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl border border-white/20 w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white truncate">{asset.filename}</h2>
            <button
              onClick={() => toggleAssetFavorite(asset.id)}
              className={`p-2 rounded-lg transition-all ${
                asset.isFavorite
                  ? 'bg-yellow-400/20 text-yellow-400'
                  : 'bg-white/10 text-white/60 hover:text-white'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={asset.isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Navigation */}
            {onPrevious && (
              <button
                onClick={onPrevious}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}

            {/* Actions */}
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Preview Area */}
          <div className="flex-1 flex items-center justify-center p-6 bg-black/20">
            {renderPreview()}
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-white/10 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {[
                { id: 'preview', label: 'Preview' },
                { id: 'details', label: 'Details' },
                { id: 'analysis', label: 'AI Analysis' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'text-yellow-400 border-b-2 border-yellow-400'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'preview' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white/80 mb-2">Quick Info</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Type:</span>
                        <span className="text-white">{asset.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Format:</span>
                        <span className="text-white">{asset.format}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Size:</span>
                        <span className="text-white">{formatFileSize(asset.metadata.size)}</span>
                      </div>
                      {asset.metadata.dimensions && (
                        <div className="flex justify-between">
                          <span className="text-white/60">Dimensions:</span>
                          <span className="text-white">
                            {asset.metadata.dimensions.width}×{asset.metadata.dimensions.height}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-white/80">Description</h3>
                      <button
                        onClick={() => {
                          setEditingDescription(true);
                          setNewDescription(asset.description || '');
                        }}
                        className="text-yellow-400 hover:text-yellow-300 text-xs"
                      >
                        Edit
                      </button>
                    </div>
                    {editingDescription ? (
                      <div className="space-y-2">
                        <textarea
                          value={newDescription}
                          onChange={e => setNewDescription(e.target.value)}
                          placeholder="Add a description..."
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveDescription}
                            className="bg-green-500/20 text-green-300 px-3 py-1 rounded text-xs hover:bg-green-500/30"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingDescription(false)}
                            className="bg-gray-500/20 text-gray-300 px-3 py-1 rounded text-xs hover:bg-gray-500/30"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-white/70 text-sm">
                        {asset.description || 'No description provided'}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-white/80">Tags</h3>
                      <button
                        onClick={() => {
                          setEditingTags(true);
                          setNewTags(asset.tags.join(', '));
                        }}
                        className="text-yellow-400 hover:text-yellow-300 text-xs"
                      >
                        Edit
                      </button>
                    </div>
                    {editingTags ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={newTags}
                          onChange={e => setNewTags(e.target.value)}
                          placeholder="Enter tags separated by commas"
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveTags}
                            className="bg-green-500/20 text-green-300 px-3 py-1 rounded text-xs hover:bg-green-500/30"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingTags(false)}
                            className="bg-gray-500/20 text-gray-300 px-3 py-1 rounded text-xs hover:bg-gray-500/30"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {asset.tags.length > 0 ? (
                          asset.tags.map(tag => (
                            <span
                              key={tag}
                              className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-white/50 text-sm">No tags</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white/80 mb-3">File Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Original Name:</span>
                        <span className="text-white text-right">{asset.metadata.originalName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">MIME Type:</span>
                        <span className="text-white">{asset.metadata.mimeType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">File Hash:</span>
                        <span className="text-white font-mono text-xs">
                          {asset.metadata.fileHash.substring(0, 16)}...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Uploaded:</span>
                        <span className="text-white text-right">
                          {formatDate(asset.uploadedAt)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Last Modified:</span>
                        <span className="text-white text-right">{formatDate(asset.updatedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Usage Count:</span>
                        <span className="text-white">{asset.usageCount}</span>
                      </div>
                    </div>
                  </div>

                  {asset.metadata.colorPalette && (
                    <div>
                      <h3 className="text-sm font-medium text-white/80 mb-3">Color Palette</h3>
                      <div className="flex gap-2">
                        {asset.metadata.colorPalette.map((color, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 rounded border border-white/20"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-white/80 mb-3">Usage Rights</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">License:</span>
                        <span className="text-white">{asset.usageRights.license}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Commercial Use:</span>
                        <span
                          className={
                            asset.usageRights.commercial_use ? 'text-green-400' : 'text-red-400'
                          }
                        >
                          {asset.usageRights.commercial_use ? 'Allowed' : 'Not Allowed'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Modification:</span>
                        <span
                          className={
                            asset.usageRights.modification_allowed
                              ? 'text-green-400'
                              : 'text-red-400'
                          }
                        >
                          {asset.usageRights.modification_allowed ? 'Allowed' : 'Not Allowed'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analysis' && (
                <div className="space-y-4">
                  {asset.aiAnalysis ? (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-white/80 mb-3">AI Analysis</h3>
                        <div className="space-y-3">
                          <div>
                            <span className="text-white/60 text-sm">Mood:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {asset.aiAnalysis.mood.map(mood => (
                                <span
                                  key={mood}
                                  className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs"
                                >
                                  {mood}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-white/60 text-sm">Style:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {asset.aiAnalysis.style.map(style => (
                                <span
                                  key={style}
                                  className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs"
                                >
                                  {style}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-white/60 text-sm">Objects Detected:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {asset.aiAnalysis.objects.map(object => (
                                <span
                                  key={object}
                                  className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs"
                                >
                                  {object}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-white/60">Quality Score:</span>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 bg-white/20 rounded-full h-2">
                                  <div
                                    className="bg-yellow-400 h-2 rounded-full"
                                    style={{ width: `${asset.aiAnalysis.quality_score}%` }}
                                  />
                                </div>
                                <span className="text-white">
                                  {asset.aiAnalysis.quality_score}%
                                </span>
                              </div>
                            </div>

                            <div>
                              <span className="text-white/60">Aesthetic Score:</span>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 bg-white/20 rounded-full h-2">
                                  <div
                                    className="bg-yellow-400 h-2 rounded-full"
                                    style={{ width: `${asset.aiAnalysis.aesthetic_score}%` }}
                                  />
                                </div>
                                <span className="text-white">
                                  {asset.aiAnalysis.aesthetic_score}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-white/60">Faces Detected:</span>
                              <span className="text-white">{asset.aiAnalysis.faces}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Text Detected:</span>
                              <span
                                className={
                                  asset.aiAnalysis.text_detected
                                    ? 'text-green-400'
                                    : 'text-gray-400'
                                }
                              >
                                {asset.aiAnalysis.text_detected ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>

                          <div>
                            <span className="text-white/60 text-sm">Brand Safety:</span>
                            <span
                              className={`ml-2 ${asset.aiAnalysis.brand_safety ? 'text-green-400' : 'text-red-400'}`}
                            >
                              {asset.aiAnalysis.brand_safety ? 'Safe' : 'Unsafe'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
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
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      <p className="text-white/60">No AI analysis available</p>
                      <p className="text-white/40 text-sm mt-1">
                        AI analysis is only available for image assets
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
