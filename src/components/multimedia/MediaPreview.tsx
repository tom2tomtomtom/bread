/**
 * 🖼️ Media Preview Component
 * 
 * Advanced preview component for generated multimedia assets with
 * quality assessment, metadata display, and action controls.
 */

import React, { useState } from 'react';
import { useAssetStore } from '../../stores/assetStore';
import { GeneratedAsset, QualityAssessment } from '../../types';

interface MediaPreviewProps {
  asset: GeneratedAsset;
  showMetadata?: boolean;
  showQualityAssessment?: boolean;
  onSaveToAssets?: (asset: GeneratedAsset) => void;
  onRegenerateRequest?: (asset: GeneratedAsset) => void;
  onClose?: () => void;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  asset,
  showMetadata = true,
  showQualityAssessment = true,
  onSaveToAssets,
  onRegenerateRequest,
  onClose,
}) => {
  const { qualityAssessments } = useAssetStore();
  
  const [activeTab, setActiveTab] = useState<'preview' | 'metadata' | 'quality'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Find quality assessment for this asset
  const qualityAssessment = qualityAssessments.find(
    assessment => assessment.approved // Mock: in production, match by asset ID
  );

  // Format file size
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format generation time
  const formatGenerationTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Get quality score color
  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  // Handle save to assets
  const handleSaveToAssets = () => {
    onSaveToAssets?.(asset);
  };

  // Handle regenerate request
  const handleRegenerateRequest = () => {
    onRegenerateRequest?.(asset);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${isFullscreen ? 'fixed inset-4 z-50' : 'max-w-4xl mx-auto'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">
            {asset.type === 'image' ? '🎨' : '🎬'}
          </span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Generated {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
            </h2>
            <p className="text-sm text-gray-600">
              Created {new Date(asset.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isFullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              )}
            </svg>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'preview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Preview
          </button>
          {showMetadata && (
            <button
              onClick={() => setActiveTab('metadata')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'metadata'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Metadata
            </button>
          )}
          {showQualityAssessment && qualityAssessment && (
            <button
              onClick={() => setActiveTab('quality')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'quality'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Quality Assessment
            </button>
          )}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'preview' && (
          <div className="text-center">
            {asset.type === 'image' ? (
              <img
                src={asset.url}
                alt="Generated image"
                className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
              />
            ) : (
              <video
                src={asset.url}
                controls
                className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                poster={asset.thumbnailUrl}
              >
                Your browser does not support the video tag.
              </video>
            )}

            {/* Asset Info */}
            <div className="mt-4 text-sm text-gray-600">
              <p>
                {asset.metadata.dimensions.width} × {asset.metadata.dimensions.height}
                {asset.metadata.duration && ` • ${asset.metadata.duration}s`}
                {asset.metadata.fps && ` • ${asset.metadata.fps}fps`}
              </p>
              <p>{formatFileSize(asset.metadata.fileSize)} • {asset.quality} quality</p>
            </div>
          </div>
        )}

        {activeTab === 'metadata' && showMetadata && (
          <div className="space-y-6">
            {/* Generation Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Generation Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Provider:</span>
                  <span className="ml-2 text-gray-600">{asset.provider}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Model:</span>
                  <span className="ml-2 text-gray-600">{asset.metadata.model}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Generation Time:</span>
                  <span className="ml-2 text-gray-600">{formatGenerationTime(asset.generationTime)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Quality:</span>
                  <span className="ml-2 text-gray-600">{asset.quality}</span>
                </div>
                {asset.cost && (
                  <div>
                    <span className="font-medium text-gray-700">Cost:</span>
                    <span className="ml-2 text-gray-600">${asset.cost.toFixed(4)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Prompts */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Prompts</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700 block mb-1">Original Prompt:</span>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {asset.metadata.originalPrompt}
                  </p>
                </div>
                {asset.metadata.enhancedPrompt !== asset.metadata.originalPrompt && (
                  <div>
                    <span className="font-medium text-gray-700 block mb-1">Enhanced Prompt:</span>
                    <p className="text-sm text-gray-600 bg-purple-50 p-3 rounded-md">
                      {asset.metadata.enhancedPrompt}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Specifications */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Technical Specifications</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Dimensions:</span>
                  <span className="ml-2 text-gray-600">
                    {asset.metadata.dimensions.width} × {asset.metadata.dimensions.height}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Format:</span>
                  <span className="ml-2 text-gray-600">{asset.metadata.format}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">File Size:</span>
                  <span className="ml-2 text-gray-600">{formatFileSize(asset.metadata.fileSize)}</span>
                </div>
                {asset.metadata.seed && (
                  <div>
                    <span className="font-medium text-gray-700">Seed:</span>
                    <span className="ml-2 text-gray-600">{asset.metadata.seed}</span>
                  </div>
                )}
                {asset.metadata.duration && (
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <span className="ml-2 text-gray-600">{asset.metadata.duration}s</span>
                  </div>
                )}
                {asset.metadata.fps && (
                  <div>
                    <span className="font-medium text-gray-700">Frame Rate:</span>
                    <span className="ml-2 text-gray-600">{asset.metadata.fps} fps</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quality' && qualityAssessment && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getQualityColor(qualityAssessment.score)}`}>
                {qualityAssessment.score}/100
              </div>
              <p className="text-gray-600 mt-1">Overall Quality Score</p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getQualityColor(qualityAssessment.brandCompliance)}`}>
                  {qualityAssessment.brandCompliance}
                </div>
                <p className="text-sm text-gray-600">Brand Compliance</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getQualityColor(qualityAssessment.technicalQuality)}`}>
                  {qualityAssessment.technicalQuality}
                </div>
                <p className="text-sm text-gray-600">Technical Quality</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getQualityColor(qualityAssessment.creativityScore)}`}>
                  {qualityAssessment.creativityScore}
                </div>
                <p className="text-sm text-gray-600">Creativity</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getQualityColor(qualityAssessment.territoryAlignment)}`}>
                  {qualityAssessment.territoryAlignment}
                </div>
                <p className="text-sm text-gray-600">Territory Alignment</p>
              </div>
            </div>

            {/* Recommendations */}
            {qualityAssessment.recommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {qualityAssessment.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-sm text-gray-600">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Approval Status */}
            <div className={`p-4 rounded-lg ${qualityAssessment.approved ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {qualityAssessment.approved ? '✅' : '⚠️'}
                </span>
                <span className={`font-medium ${qualityAssessment.approved ? 'text-green-800' : 'text-yellow-800'}`}>
                  {qualityAssessment.approved ? 'Approved for Use' : 'Requires Review'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
        <button
          onClick={handleRegenerateRequest}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          🔄 Regenerate
        </button>
        <button
          onClick={handleSaveToAssets}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          💾 Save to Assets
        </button>
      </div>
    </div>
  );
};
