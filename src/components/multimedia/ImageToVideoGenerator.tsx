/**
 * 🎬 Image-to-Video Generator Component
 *
 * AI-powered video generation from static images with sophisticated
 * animation types and platform optimization.
 */

import React, { useState, useEffect } from 'react';
import { useAssetStore } from '../../stores/assetStore';
import {
  ImageToVideoRequest,
  AnimationType,
  VideoFormat,
  PlatformOptimization,
  AIProvider,
  UploadedAsset,
} from '../../types';

interface ImageToVideoGeneratorProps {
  sourceAsset?: UploadedAsset;
  onVideoGenerated?: (queueId: string) => void;
  onClose?: () => void;
}

export const ImageToVideoGenerator: React.FC<ImageToVideoGeneratorProps> = ({
  sourceAsset,
  onVideoGenerated,
  onClose,
}) => {
  const { assets, generateVideo, isGeneratingVideo, generationError, clearGenerationError } =
    useAssetStore();

  // Note: currentTerritory not available in app store - using fallback
  const currentTerritory: any = null; // TODO: Replace with proper territory selection

  // Form state
  const [selectedAssetId, setSelectedAssetId] = useState(sourceAsset?.id || '');
  const [animationType, setAnimationType] = useState<AnimationType>('subtle_float');
  const [duration, setDuration] = useState(5);
  const [outputFormat, setOutputFormat] = useState<VideoFormat>('mp4');
  const [platformOptimization, setPlatformOptimization] =
    useState<PlatformOptimization>('instagram');
  const [quality, setQuality] = useState<'standard' | 'hd' | 'ultra'>('standard');
  const [provider, setProvider] = useState<AIProvider>('runway');
  const [fps, setFps] = useState(30);
  const [customPrompt, setCustomPrompt] = useState('');

  // Get available image assets
  const imageAssets = assets.filter(asset => asset.format === 'image');
  const selectedAsset = assets.find(asset => asset.id === selectedAssetId);

  // Platform specifications
  const platformSpecs = {
    instagram: { maxDuration: 60, aspectRatio: '9:16', recommendedFps: 30 },
    facebook: { maxDuration: 240, aspectRatio: '16:9', recommendedFps: 30 },
    tiktok: { maxDuration: 180, aspectRatio: '9:16', recommendedFps: 30 },
    youtube: { maxDuration: 43200, aspectRatio: '16:9', recommendedFps: 60 },
    linkedin: { maxDuration: 600, aspectRatio: '16:9', recommendedFps: 30 },
    twitter: { maxDuration: 140, aspectRatio: '16:9', recommendedFps: 30 },
  };

  // Animation type descriptions
  const animationDescriptions = {
    subtle_float: 'Gentle floating motion with soft up and down movement',
    gentle_rotation: 'Slow, graceful 360-degree rotation around center axis',
    parallax: 'Multi-layer depth animation with foreground/background separation',
    zoom: 'Gradual zoom in/out with smooth scaling transformation',
    fade: 'Elegant opacity transitions with subtle effects',
    slide: 'Smooth sliding motion with directional movement',
  };

  // Clear error when component mounts
  useEffect(() => {
    clearGenerationError();
  }, [clearGenerationError]);

  // Update FPS based on platform selection
  useEffect(() => {
    const spec = platformSpecs[platformOptimization];
    setFps(spec.recommendedFps);

    // Adjust duration if it exceeds platform maximum
    if (duration > spec.maxDuration) {
      setDuration(Math.min(spec.maxDuration, 60));
    }
  }, [platformOptimization, duration]);

  // Handle video generation
  const handleGenerate = async () => {
    if (!selectedAsset || !currentTerritory) return;

    clearGenerationError();

    try {
      const request: ImageToVideoRequest = {
        sourceImageId: selectedAsset.id,
        sourceImageUrl: selectedAsset.url,
        animationType,
        duration,
        outputFormat,
        platformOptimization,
        provider,
        quality,
        fps,
        customPrompt: customPrompt.trim() || undefined,
      };

      const queueId = await generateVideo(request);
      onVideoGenerated?.(queueId);
    } catch (error) {
      console.error('Video generation failed:', error);
    }
  };

  const isFormValid =
    selectedAsset && duration > 0 && duration <= platformSpecs[platformOptimization].maxDuration;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🎬 AI Video Generation</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Source Image Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Source Image</label>
        {imageAssets.length === 0 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              No image assets available. Please upload an image first.
            </p>
          </div>
        ) : (
          <select
            value={selectedAssetId}
            onChange={e => setSelectedAssetId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an image...</option>
            {imageAssets.map(asset => (
              <option key={asset.id} value={asset.id}>
                {asset.filename} ({asset.metadata.dimensions?.width}x
                {asset.metadata.dimensions?.height})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Selected Image Preview */}
      {selectedAsset && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Selected Image</h4>
          <div className="flex items-center space-x-4">
            <img
              src={selectedAsset.thumbnailUrl || selectedAsset.url}
              alt={selectedAsset.filename}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <p className="font-medium text-gray-900">{selectedAsset.filename}</p>
              <p className="text-sm text-gray-600">
                {selectedAsset.metadata.dimensions?.width}x
                {selectedAsset.metadata.dimensions?.height}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedAsset.metadata.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Animation Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Animation Type</label>
        <select
          value={animationType}
          onChange={e => setAnimationType(e.target.value as AnimationType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        >
          <option value="subtle_float">Subtle Float</option>
          <option value="gentle_rotation">Gentle Rotation</option>
          <option value="parallax">Parallax</option>
          <option value="zoom">Zoom</option>
          <option value="fade">Fade</option>
          <option value="slide">Slide</option>
        </select>
        <p className="text-xs text-gray-600">{animationDescriptions[animationType]}</p>
      </div>

      {/* Duration and Platform */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duration (seconds)</label>
          <input
            type="number"
            value={duration}
            onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max={platformSpecs[platformOptimization].maxDuration}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Max: {platformSpecs[platformOptimization].maxDuration}s for {platformOptimization}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Platform Optimization
          </label>
          <select
            value={platformOptimization}
            onChange={e => setPlatformOptimization(e.target.value as PlatformOptimization)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">Twitter</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {platformSpecs[platformOptimization].aspectRatio} •{' '}
            {platformSpecs[platformOptimization].recommendedFps}fps
          </p>
        </div>
      </div>

      {/* Quality and Format */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
          <select
            value={quality}
            onChange={e => setQuality(e.target.value as 'standard' | 'hd' | 'ultra')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="standard">Standard</option>
            <option value="hd">HD</option>
            <option value="ultra">Ultra</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
          <select
            value={outputFormat}
            onChange={e => setOutputFormat(e.target.value as VideoFormat)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="mp4">MP4</option>
            <option value="mov">MOV</option>
            <option value="webm">WebM</option>
            <option value="gif">GIF</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">AI Provider</label>
          <select
            value={provider}
            onChange={e => setProvider(e.target.value as AIProvider)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="runway">RunwayML</option>
            <option value="stable-video">Stable Video</option>
          </select>
        </div>
      </div>

      {/* Custom Prompt */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Animation Prompt (Optional)
        </label>
        <textarea
          value={customPrompt}
          onChange={e => setCustomPrompt(e.target.value)}
          placeholder="Describe specific animation details or style preferences..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
        />
      </div>

      {/* Error Display */}
      {generationError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{generationError}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleGenerate}
          disabled={!isFormValid || isGeneratingVideo}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {isGeneratingVideo ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating...
            </>
          ) : (
            '🎬 Generate Video'
          )}
        </button>
      </div>
    </div>
  );
};
