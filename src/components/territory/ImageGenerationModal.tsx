import React, { useState, useEffect } from 'react';
import { useAssetStore } from '../../stores/assetStore';
import { EnhancedTerritory, ImageType, CulturalContext } from '../../types';

interface ImageGenerationModalProps {
  territory: EnhancedTerritory;
  brief: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({
  territory,
  brief,
  isOpen,
  onClose,
}) => {
  const { generateImage, isGeneratingImage, generationError, generationProgress } = useAssetStore();
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [imageType, setImageType] = useState<ImageType>('background');
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');

  // Initialize prompt based on territory
  useEffect(() => {
    if (territory && isOpen) {
      const initialPrompt = `Create a ${territory.positioning} image with ${territory.tone} tone. Title: "${territory.title}". Marketing context: ${brief.substring(0, 200)}`;
      setPrompt(initialPrompt);
    }
  }, [territory, brief, isOpen]);

  const handleGenerate = async () => {
    try {
      setGeneratedImageUrl(null);

      const queueId = await generateImage({
        prompt,
        territory: {
          id: territory.id,
          title: territory.title,
          positioning: territory.positioning,
          tone: territory.tone,
          headlines: territory.headlines,
        },
        brandGuidelines: {
          colors: {
            primary: '#ff6b35',
            secondary: ['#f7931e'],
            accent: ['#ffcc02'],
            neutral: ['#f8f9fa', '#e9ecef', '#dee2e6'],
            background: '#ffffff',
            text: '#333333',
          },
          fonts: {
            primary: 'Inter',
            secondary: 'Roboto',
            fallbacks: ['Arial', 'sans-serif'],
          },
          logoUsage: {
            minSize: 24,
            clearSpace: 16,
            placement: 'top-left',
            variations: ['full-color', 'monochrome'],
          },
          spacing: {
            grid: 8,
            margins: 16,
            padding: 12,
          },
          imagery: {
            style: ['modern', 'vibrant'],
            filters: ['brightness', 'contrast'],
            overlayOpacity: 0.7,
          },
          compliance: {
            requiredElements: ['logo', 'disclaimer'],
            prohibitedElements: ['competitor-logos'],
            legalText: ['© 2024 Company Name'],
          },
        },
        styleConsistency: true,
        culturalContext: 'australian',
        imageType,
        quality,
      });

      console.log('✅ Image generation started, queue ID:', queueId);

      // For now, we'll show a success message
      // In a full implementation, you'd track the queue and show the result
      setTimeout(() => {
        setGeneratedImageUrl('/api/placeholder/400/300'); // Placeholder for demo
      }, 3000);
    } catch (error) {
      console.error('❌ Image generation failed:', error);
    }
  };

  const handleSaveToLibrary = () => {
    // The image is already saved to the library by the generateImage function
    console.log('🎯 Image already saved to library automatically');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Generate Image</h3>
              <p className="text-gray-600 mt-1">Territory: "{territory.title}"</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* Territory Context */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-yellow-800 mb-2">Territory Context</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>
                <strong>Positioning:</strong> {territory.positioning}
              </p>
              <p>
                <strong>Tone:</strong> {territory.tone}
              </p>
            </div>
          </div>

          {/* Generation Form */}
          <div className="space-y-6">
            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image Prompt</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={4}
                placeholder="Describe the image you want to generate..."
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Type</label>
                <select
                  value={imageType}
                  onChange={e => setImageType(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="background">Background</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="product">Product</option>
                  <option value="hero">Hero</option>
                  <option value="icon">Icon</option>
                  <option value="pattern">Pattern</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
                <select
                  value={quality}
                  onChange={e => setQuality(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="standard">Standard</option>
                  <option value="hd">HD</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGeneratingImage || !prompt.trim()}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isGeneratingImage ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating... {generationProgress}%
                </>
              ) : (
                <>
                  <span>🎨</span>
                  Generate Image
                </>
              )}
            </button>

            {/* Error Display */}
            {generationError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700">❌ {generationError}</p>
              </div>
            )}

            {/* Generated Image Display */}
            {generatedImageUrl && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-semibold text-green-800 mb-2">
                    ✅ Image Generated Successfully!
                  </h4>
                  <p className="text-green-700 text-sm">
                    The image has been automatically added to your asset library.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <img
                    src={generatedImageUrl}
                    alt="Generated image"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveToLibrary}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>✅</span>
                    View in Library
                  </button>

                  <button
                    onClick={() => setGeneratedImageUrl(null)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>🔄</span>
                    Generate Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationModal;
