/**
 * 🎬 Multimedia Generation Workflow
 *
 * Complete workflow component that demonstrates the full multimedia
 * generation pipeline from territory selection to final asset creation.
 */

import React, { useState, useEffect } from 'react';
import { useAssetStore } from '../../stores/assetStore';
import { TextToImageGenerator } from './TextToImageGenerator';
import { ImageToVideoGenerator } from './ImageToVideoGenerator';
import { GenerationQueue } from './GenerationQueue';
import { MediaPreview } from './MediaPreview';
import { GenerationQueue as QueueItem, GeneratedAsset, UploadedAsset } from '../../types';

interface MultimediaWorkflowProps {
  onComplete?: (assets: GeneratedAsset[]) => void;
}

type WorkflowStep = 'select' | 'image' | 'video' | 'queue' | 'preview' | 'complete';

export const MultimediaWorkflow: React.FC<MultimediaWorkflowProps> = ({ onComplete }) => {
  const { generationQueue, generatedAssets, assets, clearGenerationQueue, getGenerationStatus } =
    useAssetStore();

  // Note: currentTerritory not available in app store - using fallback
  const currentTerritory: any = null; // TODO: Replace with proper territory selection

  const [currentStep, setCurrentStep] = useState<WorkflowStep>('select');
  const [selectedAsset, setSelectedAsset] = useState<UploadedAsset | null>(null);
  const [previewAsset, setPreviewAsset] = useState<GeneratedAsset | null>(null);
  const [completedAssets, setCompletedAssets] = useState<GeneratedAsset[]>([]);

  // Monitor queue for completed items
  useEffect(() => {
    const completedItems = generationQueue.filter(
      item => item.status === 'complete' && item.result
    );

    const newAssets = completedItems
      .map(item => item.result!)
      .filter(asset => !completedAssets.find(existing => existing.id === asset.id));

    if (newAssets.length > 0) {
      setCompletedAssets(prev => [...prev, ...newAssets]);

      // Auto-advance to preview if we have new assets
      if (currentStep === 'queue' && newAssets.length > 0 && newAssets[0]) {
        setPreviewAsset(newAssets[0]);
        setCurrentStep('preview');
      }
    }
  }, [generationQueue, completedAssets, currentStep]);

  // Handle image generation completion
  const handleImageGenerated = (queueId: string) => {
    console.log('🎨 Image generation queued:', queueId);
    setCurrentStep('queue');
  };

  // Handle video generation completion
  const handleVideoGenerated = (queueId: string) => {
    console.log('🎬 Video generation queued:', queueId);
    setCurrentStep('queue');
  };

  // Handle queue item click
  const handleQueueItemClick = (item: QueueItem) => {
    if (item.status === 'complete' && item.result) {
      setPreviewAsset(item.result);
      setCurrentStep('preview');
    }
  };

  // Handle asset selection for video generation
  const handleAssetSelect = (asset: UploadedAsset) => {
    setSelectedAsset(asset);
    setCurrentStep('video');
  };

  // Handle save to assets
  const handleSaveToAssets = (asset: GeneratedAsset) => {
    // In a real implementation, this would save the generated asset
    // to the main asset collection
    console.log('💾 Saving asset to collection:', asset.id);

    // Move to next asset or complete workflow
    const currentIndex = completedAssets.findIndex(a => a.id === asset.id);
    const nextAsset = completedAssets[currentIndex + 1];

    if (nextAsset) {
      setPreviewAsset(nextAsset);
    } else {
      setCurrentStep('complete');
      onComplete?.(completedAssets);
    }
  };

  // Handle regenerate request
  const handleRegenerateRequest = (asset: GeneratedAsset) => {
    console.log('🔄 Regenerate request for:', asset.id);
    // This would trigger a new generation with similar parameters
    setCurrentStep('select');
  };

  // Reset workflow
  const handleReset = () => {
    setCurrentStep('select');
    setSelectedAsset(null);
    setPreviewAsset(null);
    setCompletedAssets([]);
    clearGenerationQueue();
  };

  // Get step progress
  const getStepProgress = () => {
    const steps: WorkflowStep[] = ['select', 'image', 'video', 'queue', 'preview', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  // Check if territory is available
  if (!currentTerritory) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-4xl mb-4">🎯</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Territory Selected</h2>
        <p className="text-gray-600 mb-4">
          Please select a territory to begin multimedia generation.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">🎬 Multimedia Generation Workflow</h1>
          <button
            onClick={handleReset}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            🔄 Reset
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(getStepProgress())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between text-xs">
          {[
            { key: 'select', label: 'Select Type', icon: '🎯' },
            { key: 'image', label: 'Generate Image', icon: '🎨' },
            { key: 'video', label: 'Generate Video', icon: '🎬' },
            { key: 'queue', label: 'Processing', icon: '⚡' },
            { key: 'preview', label: 'Preview', icon: '👁️' },
            { key: 'complete', label: 'Complete', icon: '✅' },
          ].map((step, index) => (
            <div
              key={step.key}
              className={`flex flex-col items-center ${
                currentStep === step.key
                  ? 'text-blue-600'
                  : index <
                      ['select', 'image', 'video', 'queue', 'preview', 'complete'].indexOf(
                        currentStep
                      )
                    ? 'text-green-600'
                    : 'text-gray-400'
              }`}
            >
              <div className="text-lg mb-1">{step.icon}</div>
              <span>{step.label}</span>
            </div>
          ))}
        </div>

        {/* Territory Context */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600 font-medium">Current Territory:</span>
            <span className="text-blue-800">{currentTerritory.title}</span>
            <span className="text-blue-600">•</span>
            <span className="text-blue-700 text-sm">{currentTerritory.tone}</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === 'select' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Choose Generation Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Generation Option */}
              <button
                onClick={() => setCurrentStep('image')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎨</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Images</h3>
                  <p className="text-gray-600 text-sm">
                    Create AI-powered images with territory-driven prompts and brand consistency
                  </p>
                  <div className="mt-4 text-xs text-gray-500">
                    • Multiple AI providers • Brand guidelines • Cultural context
                  </div>
                </div>
              </button>

              {/* Video Generation Option */}
              <button
                onClick={() => {
                  if (assets.filter(a => a.format === 'image').length === 0) {
                    alert('Please upload or generate an image first to create videos.');
                    return;
                  }
                  setCurrentStep('video');
                }}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎬</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Videos</h3>
                  <p className="text-gray-600 text-sm">
                    Transform images into engaging videos with professional animations
                  </p>
                  <div className="mt-4 text-xs text-gray-500">
                    • Platform optimization • Multiple animations • HD quality
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {currentStep === 'image' && (
          <TextToImageGenerator
            onImageGenerated={handleImageGenerated}
            onClose={() => setCurrentStep('select')}
          />
        )}

        {currentStep === 'video' && (
          <ImageToVideoGenerator
            sourceAsset={selectedAsset || undefined}
            onVideoGenerated={handleVideoGenerated}
            onClose={() => setCurrentStep('select')}
          />
        )}

        {currentStep === 'queue' && (
          <div className="space-y-6">
            <GenerationQueue
              onItemClick={handleQueueItemClick}
              maxItems={20}
              showCompleted={true}
            />

            {completedAssets.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  ✅ Completed Assets ({completedAssets.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {completedAssets.map(asset => (
                    <button
                      key={asset.id}
                      onClick={() => {
                        setPreviewAsset(asset);
                        setCurrentStep('preview');
                      }}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                          {asset.type === 'image' ? (
                            <div className="w-8 h-8 bg-blue-400/40 rounded border border-blue-400/20"></div>
                          ) : (
                            <div className="w-8 h-6 bg-purple-400/40 rounded border border-purple-400/20 relative">
                              <div className="absolute inset-1 bg-purple-400/20 rounded-sm"></div>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {asset.type} • {asset.quality}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 'preview' && previewAsset && (
          <MediaPreview
            asset={previewAsset}
            showMetadata={true}
            showQualityAssessment={true}
            onSaveToAssets={handleSaveToAssets}
            onRegenerateRequest={handleRegenerateRequest}
            onClose={() => setCurrentStep('queue')}
          />
        )}

        {currentStep === 'complete' && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Workflow Complete!</h2>
            <p className="text-gray-600 mb-6">
              Successfully generated {completedAssets.length} multimedia assets for the "
              {currentTerritory.title}" territory.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">🎨</div>
                <div className="font-medium">Images</div>
                <div className="text-sm text-gray-600">
                  {completedAssets.filter(a => a.type === 'image').length} generated
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-2">🎬</div>
                <div className="font-medium">Videos</div>
                <div className="text-sm text-gray-600">
                  {completedAssets.filter(a => a.type === 'video').length} generated
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-medium">Total Time</div>
                <div className="text-sm text-gray-600">
                  {Math.round(
                    completedAssets.reduce((sum, asset) => sum + asset.generationTime, 0) / 1000
                  )}
                  s
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                🔄 Start New Workflow
              </button>
              <button
                onClick={() => setCurrentStep('queue')}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                📋 View Queue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
