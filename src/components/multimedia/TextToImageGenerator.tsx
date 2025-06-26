/**
 * 🎨 Text-to-Image Generator Component
 * 
 * Advanced AI-powered image generation with territory-driven prompts,
 * brand consistency, and cultural context adaptation.
 */

import React, { useState, useEffect } from 'react';
import { useAssetStore } from '../../stores/assetStore';
import { useAppStore } from '../../stores/appStore';
import {
  TextToImageRequest,
  ImageType,
  CulturalContext,
  AIProvider,
  BrandGuidelines,
} from '../../types';

interface TextToImageGeneratorProps {
  onImageGenerated?: (queueId: string) => void;
  onClose?: () => void;
}

export const TextToImageGenerator: React.FC<TextToImageGeneratorProps> = ({
  onImageGenerated,
  onClose,
}) => {
  const {
    generateImage,
    enhancePrompt,
    isGeneratingImage,
    generationError,
    clearGenerationError,
  } = useAssetStore();

  const { currentTerritory } = useAppStore();

  // Form state
  const [prompt, setPrompt] = useState('');
  const [imageType, setImageType] = useState<ImageType>('background');
  const [culturalContext, setCulturalContext] = useState<CulturalContext>('australian');
  const [styleConsistency, setStyleConsistency] = useState(true);
  const [quality, setQuality] = useState<'standard' | 'hd' | 'ultra'>('standard');
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Default brand guidelines (in production, this would come from brand settings)
  const defaultBrandGuidelines: BrandGuidelines = {
    colors: {
      primary: '#007bff',
      secondary: ['#6c757d'],
      accent: ['#28a745'],
      neutral: ['#f8f9fa', '#e9ecef', '#dee2e6'],
      background: '#ffffff',
      text: '#212529',
    },
    fonts: {
      primary: 'Inter',
      secondary: 'Arial',
      fallbacks: ['sans-serif'],
    },
    logoUsage: {
      minSize: 24,
      clearSpace: 16,
      placement: 'top-right',
      variations: ['primary', 'white', 'black'],
    },
    spacing: {
      grid: 8,
      margins: 16,
      padding: 12,
    },
    imagery: {
      style: ['clean', 'modern'],
      filters: ['none', 'subtle'],
      overlayOpacity: 0.3,
    },
    compliance: {
      requiredElements: ['logo'],
      prohibitedElements: [],
      legalText: [],
    },
  };

  // Clear error when component mounts
  useEffect(() => {
    clearGenerationError();
  }, [clearGenerationError]);

  // Handle prompt enhancement
  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || !currentTerritory) return;

    setIsEnhancing(true);
    try {
      const enhancement = await enhancePrompt(
        prompt,
        currentTerritory,
        defaultBrandGuidelines,
        imageType,
        culturalContext
      );
      setEnhancedPrompt(enhancement.enhancedPrompt);
    } catch (error) {
      console.error('Failed to enhance prompt:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Handle image generation
  const handleGenerate = async () => {
    if (!prompt.trim() || !currentTerritory) return;

    clearGenerationError();

    try {
      const request: TextToImageRequest = {
        prompt: enhancedPrompt || prompt,
        territory: currentTerritory,
        brandGuidelines: defaultBrandGuidelines,
        imageType,
        styleConsistency,
        culturalContext,
        provider,
        quality,
        dimensions: getOptimalDimensions(imageType),
      };

      const queueId = await generateImage(request);
      onImageGenerated?.(queueId);

    } catch (error) {
      console.error('Image generation failed:', error);
    }
  };

  // Get optimal dimensions based on image type
  const getOptimalDimensions = (type: ImageType) => {
    const dimensionMap = {
      background: { width: 1024, height: 1792 }, // Mobile vertical
      lifestyle: { width: 1792, height: 1024 }, // Landscape
      product: { width: 1024, height: 1024 }, // Square
      hero: { width: 1792, height: 1024 }, // Landscape
      icon: { width: 1024, height: 1024 }, // Square
      pattern: { width: 1024, height: 1024 }, // Square
    };
    return dimensionMap[type];
  };

  const isFormValid = prompt.trim() && currentTerritory;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          🎨 AI Image Generation
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Territory Context */}
      {currentTerritory && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Current Territory</h3>
          <p className="text-blue-800 text-sm">
            <strong>{currentTerritory.title}</strong> - {currentTerritory.positioning}
          </p>
          <p className="text-blue-700 text-xs mt-1">Tone: {currentTerritory.tone}</p>
        </div>
      )}

      {/* Prompt Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image Description
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            {prompt.length}/500 characters
          </span>
          <button
            onClick={handleEnhancePrompt}
            disabled={!prompt.trim() || !currentTerritory || isEnhancing}
            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isEnhancing ? '✨ Enhancing...' : '✨ Enhance with AI'}
          </button>
        </div>
      </div>

      {/* Enhanced Prompt Preview */}
      {enhancedPrompt && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-2">🚀 AI-Enhanced Prompt</h4>
          <p className="text-purple-800 text-sm">{enhancedPrompt}</p>
        </div>
      )}

      {/* Generation Options */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image Type
          </label>
          <select
            value={imageType}
            onChange={(e) => setImageType(e.target.value as ImageType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="background">Background</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="product">Product</option>
            <option value="hero">Hero Image</option>
            <option value="icon">Icon</option>
            <option value="pattern">Pattern</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cultural Context
          </label>
          <select
            value={culturalContext}
            onChange={(e) => setCulturalContext(e.target.value as CulturalContext)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="australian">Australian</option>
            <option value="global">Global</option>
            <option value="regional">Regional</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quality
          </label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as 'standard' | 'hd' | 'ultra')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="standard">Standard</option>
            <option value="hd">HD</option>
            <option value="ultra">Ultra</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as AIProvider)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="openai">DALL-E 3</option>
            <option value="midjourney">Midjourney</option>
            <option value="stable-diffusion">Stable Diffusion</option>
          </select>
        </div>
      </div>

      {/* Style Consistency Toggle */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={styleConsistency}
            onChange={(e) => setStyleConsistency(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">
            Maintain brand style consistency
          </span>
        </label>
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
          disabled={!isFormValid || isGeneratingImage}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {isGeneratingImage ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            '🎨 Generate Image'
          )}
        </button>
      </div>
    </div>
  );
};
