import React, { useState, useEffect } from 'react';
import { useAssetStore } from '../../stores/assetStore';
import {
  LayoutGenerationRequest,
  ChannelFormat,
  TemplatePreference,
  BrandGuidelines,
  LayoutVariation,
} from '../../types';
import { FormatSelector } from './FormatSelector';
import { LayoutPreview } from './LayoutPreview';
import { BrandComplianceChecker } from './BrandComplianceChecker';

interface LayoutGeneratorProps {
  onLayoutGenerated?: (layouts: LayoutVariation[]) => void;
  onClose?: () => void;
}

export const LayoutGenerator: React.FC<LayoutGeneratorProps> = ({ onLayoutGenerated, onClose }) => {
  const {
    selectedAssets,
    assets,
    layouts,
    currentLayout,
    visualIntelligence,
    isGeneratingLayouts,
    isAnalyzingVisuals,
    layoutGenerationError,
    generateLayouts,
    analyzeVisualIntelligence,
    selectLayout,
    clearLayoutError,
  } = useAssetStore();

  // Note: currentTerritory not available in app store - using fallback
  const currentTerritory: { positioning: string; tone: string; audience: string } | null = null; // TODO: Replace with proper territory selection

  const [selectedFormats, setSelectedFormats] = useState<ChannelFormat[]>(['instagram_post']);
  const [templatePreferences, setTemplatePreferences] = useState<TemplatePreference>({
    style: 'minimal',
    layout: 'hero',
    textDominance: 'balanced',
    colorScheme: 'brand',
  });
  const [customRequirements, setCustomRequirements] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get selected assets or all assets if none selected
  const assetsToUse =
    selectedAssets.length > 0 ? assets.filter(asset => selectedAssets.includes(asset.id)) : assets;

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

  const handleGenerateLayouts = async () => {
    if (!currentTerritory) {
      alert('Please select a territory first');
      return;
    }

    if (assetsToUse.length === 0) {
      alert('Please upload or select assets first');
      return;
    }

    clearLayoutError();

    try {
      // First analyze visual intelligence
      await analyzeVisualIntelligence(assetsToUse, currentTerritory!);

      // Then generate layouts
      const request: LayoutGenerationRequest = {
        territory: currentTerritory!,
        assets: assetsToUse,
        targetFormats: selectedFormats,
        brandGuidelines: defaultBrandGuidelines,
        templatePreferences: [templatePreferences],
        customRequirements: customRequirements || undefined,
        priorityAssets: selectedAssets.length > 0 ? selectedAssets : undefined,
      };

      const generatedLayouts = await generateLayouts(request);
      onLayoutGenerated?.(generatedLayouts);
    } catch (error) {
      console.error('Layout generation failed:', error);
    }
  };

  const handleFormatChange = (formats: ChannelFormat[]) => {
    setSelectedFormats(formats);
  };

  const handleTemplatePreferenceChange = (key: keyof TemplatePreference, value: any) => {
    setTemplatePreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const canGenerate = currentTerritory && assetsToUse.length > 0 && selectedFormats.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🎨 AI Layout Generator</h2>
          <p className="text-gray-600 mt-1">
            Create professional layouts using AI-powered composition algorithms
          </p>
        </div>
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

      {/* Error Display */}
      {layoutGenerationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-800">{layoutGenerationError}</span>
            <button onClick={clearLayoutError} className="ml-auto text-red-400 hover:text-red-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Territory Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📍 Current Territory</h3>
            <p className="text-blue-600">No territory selected (feature temporarily disabled)</p>
          </div>

          {/* Assets Info */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">🖼️ Assets to Use</h3>
            <p className="text-green-800">
              {assetsToUse.length} asset{assetsToUse.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {assetsToUse.slice(0, 5).map(asset => (
                <span
                  key={asset.id}
                  className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                >
                  {asset.type}
                </span>
              ))}
              {assetsToUse.length > 5 && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                  +{assetsToUse.length - 5} more
                </span>
              )}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">📱 Target Formats</h3>
            <FormatSelector
              selectedFormats={selectedFormats}
              onFormatsChange={handleFormatChange}
            />
          </div>

          {/* Template Preferences */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">🎨 Style Preferences</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
                <select
                  value={templatePreferences.style}
                  onChange={e => handleTemplatePreferenceChange('style', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="minimal">Minimal</option>
                  <option value="bold">Bold</option>
                  <option value="elegant">Elegant</option>
                  <option value="playful">Playful</option>
                  <option value="corporate">Corporate</option>
                  <option value="artistic">Artistic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
                <select
                  value={templatePreferences.layout}
                  onChange={e => handleTemplatePreferenceChange('layout', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hero">Hero</option>
                  <option value="grid">Grid</option>
                  <option value="collage">Collage</option>
                  <option value="split">Split</option>
                  <option value="overlay">Overlay</option>
                  <option value="magazine">Magazine</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Balance</label>
                <select
                  value={templatePreferences.textDominance}
                  onChange={e => handleTemplatePreferenceChange('textDominance', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text-heavy">Text Heavy</option>
                  <option value="balanced">Balanced</option>
                  <option value="image-heavy">Image Heavy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Scheme</label>
                <select
                  value={templatePreferences.colorScheme}
                  onChange={e => handleTemplatePreferenceChange('colorScheme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="brand">Brand Colors</option>
                  <option value="complementary">Complementary</option>
                  <option value="monochromatic">Monochromatic</option>
                  <option value="vibrant">Vibrant</option>
                  <option value="muted">Muted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <svg
                className={`w-4 h-4 mr-1 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              Advanced Options
            </button>

            {showAdvanced && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Requirements
                </label>
                <textarea
                  value={customRequirements}
                  onChange={e => setCustomRequirements(e.target.value)}
                  placeholder="Describe any specific requirements or preferences..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateLayouts}
            disabled={!canGenerate || isGeneratingLayouts || isAnalyzingVisuals}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
              canGenerate && !isGeneratingLayouts && !isAnalyzingVisuals
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isAnalyzingVisuals ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Analyzing Assets...
              </span>
            ) : isGeneratingLayouts ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Generating Layouts...
              </span>
            ) : (
              '🎨 Generate AI Layouts'
            )}
          </button>
        </div>

        {/* Preview Panel */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">👁️ Layout Preview</h3>

          {currentLayout ? (
            <div className="space-y-4">
              <LayoutPreview layout={currentLayout} />
              <BrandComplianceChecker compliance={currentLayout.brandCompliance} />
            </div>
          ) : layouts.length > 0 ? (
            <div className="space-y-4">
              <p className="text-gray-600">Select a layout to preview:</p>
              <div className="grid grid-cols-2 gap-3">
                {layouts.slice(0, 4).map(layout => (
                  <button
                    key={layout.id}
                    onClick={() => selectLayout(layout)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="font-medium text-sm">{layout.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Score: {layout.performancePrediction}%
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-500">Generate layouts to see AI-powered compositions</p>
            </div>
          )}
        </div>
      </div>

      {/* Visual Intelligence Summary */}
      {visualIntelligence && (
        <div className="mt-8 bg-purple-50 rounded-lg p-6">
          <h3 className="font-semibold text-purple-900 mb-4">🧠 Visual Intelligence Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Asset-Territory Match</h4>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {Math.round(
                  visualIntelligence.assetTerritoryMatch.reduce(
                    (sum, match) => sum + match.matchScore,
                    0
                  ) / visualIntelligence.assetTerritoryMatch.length
                )}
                %
              </div>
              <p className="text-sm text-gray-600">Average match score</p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Color Harmony</h4>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {visualIntelligence.colorHarmony.harmonyScore}%
              </div>
              <p className="text-sm text-gray-600">Harmony score</p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Style Consistency</h4>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {visualIntelligence.styleConsistency.consistencyScore}%
              </div>
              <p className="text-sm text-gray-600">Consistency score</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
