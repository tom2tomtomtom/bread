import React, { useState } from 'react';
import { UploadedAsset, ViewMode } from '../../types';

interface AssetCardProps {
  asset: UploadedAsset;
  viewMode: ViewMode;
  isSelected: boolean;
  selectionMode: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  viewMode,
  isSelected,
  selectionMode,
  onClick,
  onDoubleClick,
  onToggleFavorite,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString();
  };

  const getFileIcon = (format: string, _type: string) => {
    if (format === 'image') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    }
    if (format === 'video') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      );
    }
    if (format === 'audio') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  };

  const getTypeColor = (type: string) => {
    const colors = {
      product: 'bg-blue-500/20 text-blue-300',
      lifestyle: 'bg-green-500/20 text-green-300',
      logo: 'bg-purple-500/20 text-purple-300',
      background: 'bg-orange-500/20 text-orange-300',
      texture: 'bg-pink-500/20 text-pink-300',
      icon: 'bg-indigo-500/20 text-indigo-300',
      other: 'bg-gray-500/20 text-gray-300',
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`
          flex items-center p-4 rounded-lg border transition-all cursor-pointer
          ${
            isSelected
              ? 'bg-yellow-400/20 border-yellow-400/50'
              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
          }
        `}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Selection Checkbox */}
        {selectionMode && (
          <div className="mr-4">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                isSelected ? 'bg-yellow-400 border-yellow-400' : 'border-white/30'
              }`}
            >
              {isSelected && (
                <svg
                  className="w-3 h-3 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mr-4 flex-shrink-0">
          {asset.format === 'image' && asset.thumbnailUrl && !imageError ? (
            <img
              src={asset.thumbnailUrl}
              alt={asset.filename}
              className="w-full h-full object-cover rounded-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="text-white/60">{getFileIcon(asset.format, asset.type)}</div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-white truncate">{asset.filename}</h3>
            {asset.isFavorite && (
              <svg
                className="w-4 h-4 text-yellow-400 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-white/60">
            <span className={`px-2 py-1 rounded text-xs ${getTypeColor(asset.type)}`}>
              {asset.type}
            </span>
            <span>{formatFileSize(asset.metadata.size)}</span>
            <span>{formatDate(asset.uploadedAt)}</span>
            {asset.metadata.dimensions && (
              <span>
                {asset.metadata.dimensions.width}×{asset.metadata.dimensions.height}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={e => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
            >
              <svg
                className="w-4 h-4"
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
            <button
              onClick={e => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <div
      className={`
        relative group rounded-lg border transition-all cursor-pointer overflow-hidden
        ${
          isSelected
            ? 'bg-yellow-400/20 border-yellow-400/50 ring-2 ring-yellow-400/30'
            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
        }
      `}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {/* Selection Checkbox */}
      {selectionMode && (
        <div className="absolute top-2 left-2 z-10">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              isSelected ? 'bg-yellow-400 border-yellow-400' : 'border-white/30 bg-black/50'
            }`}
          >
            {isSelected && (
              <svg
                className="w-3 h-3 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Favorite Icon */}
      {asset.isFavorite && (
        <div className="absolute top-2 right-2 z-10">
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      )}

      {/* Thumbnail */}
      <div className="aspect-square bg-white/10 flex items-center justify-center">
        {asset.format === 'image' && asset.thumbnailUrl && !imageError ? (
          <img
            src={asset.thumbnailUrl}
            alt={asset.filename}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-white/60">{getFileIcon(asset.format, asset.type)}</div>
        )}
      </div>

      {/* Info Overlay */}
      <div className="p-3">
        <h3 className="font-medium text-white text-sm truncate mb-1">{asset.filename}</h3>
        <div className="flex items-center justify-between text-xs text-white/60">
          <span className={`px-2 py-1 rounded ${getTypeColor(asset.type)}`}>{asset.type}</span>
          <span>{formatFileSize(asset.metadata.size)}</span>
        </div>
        {asset.metadata.dimensions && (
          <div className="text-xs text-white/50 mt-1">
            {asset.metadata.dimensions.width}×{asset.metadata.dimensions.height}
          </div>
        )}
      </div>

      {/* Actions Overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          onClick={e => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all"
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
        <button
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
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
      </div>
    </div>
  );
};
