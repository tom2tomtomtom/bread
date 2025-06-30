import React, { useState, useEffect } from 'react';
import { useAssetStore } from '../../stores/assetStore';
import { EnhancedTerritory } from '../../types';

interface VideoGenerationModalProps {
  territory: EnhancedTerritory;
  brief: string;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoGenerationModal: React.FC<VideoGenerationModalProps> = ({
  territory,
  brief,
  isOpen,
  onClose,
}) => {
  const { generateVideo, isGeneratingVideo, generationError, generationProgress } = useAssetStore();
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [videoStyle, setVideoStyle] = useState<'dynamic' | 'cinematic' | 'minimal'>('dynamic');
  const [duration, setDuration] = useState<number>(15);

  // Initialize prompt based on territory
  useEffect(() => {
    if (territory && isOpen) {
      const initialPrompt = `Create a ${duration}-second ${videoStyle} video showcasing ${territory.positioning} with ${territory.tone} tone. Title: "${territory.title}". Marketing context: ${brief.substring(0, 200)}`;
      setPrompt(initialPrompt);
    }
  }, [territory, brief, isOpen, videoStyle, duration]);

  const handleGenerate = async () => {
    try {
      setGeneratedVideoUrl(null);

      // Use the first headline as the hook
      const hook = territory.headlines?.[0]?.text || territory.title;

      const assetId = await generateVideo({
        sourceImageId: `territory-${territory.id}`,
        sourceImageUrl: '/api/placeholder/1024/1024', // Placeholder for now
        animationType:
          videoStyle === 'dynamic' ? 'zoom' : videoStyle === 'cinematic' ? 'parallax' : 'fade',
        duration,
        outputFormat: 'mp4',
        platformOptimization: 'instagram',
        quality: 'hd',
        customPrompt: `${prompt} Territory: ${territory.title}. ${territory.positioning}. Tone: ${territory.tone}.`,
      });

      console.log('✅ Video generation completed, asset ID:', assetId);

      // Get the generated asset from the store to display it
      const { assets } = useAssetStore.getState();
      const generatedAsset = assets.find(asset => asset.id.includes(assetId.replace('asset_', '')));

      if (generatedAsset && generatedAsset.url) {
        setGeneratedVideoUrl(generatedAsset.url);
        console.log('🎬 Displaying generated video:', generatedAsset.url);
      } else {
        console.warn('⚠️ Generated video asset not found in store, checking again...');
        // Fallback: try to find the most recent video asset
        const mostRecentVideoAsset = assets.find(asset => asset.format === 'video');
        if (mostRecentVideoAsset && mostRecentVideoAsset.url) {
          setGeneratedVideoUrl(mostRecentVideoAsset.url);
          console.log('🎬 Displaying most recent video asset:', mostRecentVideoAsset.url);
        }
      }
    } catch (error) {
      console.error('❌ Video generation failed:', error);
    }
  };

  const handleSaveToLibrary = () => {
    // The video is already saved to the library by the generateVideo function
    console.log('🎯 Video already saved to library automatically');
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
              <h3 className="text-2xl font-bold text-gray-900">Generate Video</h3>
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
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-purple-800 mb-2">Territory Context</h4>
            <div className="text-sm text-purple-700 space-y-1">
              <p>
                <strong>Positioning:</strong> {territory.positioning}
              </p>
              <p>
                <strong>Tone:</strong> {territory.tone}
              </p>
              <p>
                <strong>Hook:</strong> {territory.headlines?.[0]?.text || 'Dynamic opening'}
              </p>
            </div>
          </div>

          {/* Generation Form */}
          <div className="space-y-6">
            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video Prompt</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={4}
                placeholder="Describe the video you want to generate..."
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video Style</label>
                <select
                  value={videoStyle}
                  onChange={e => setVideoStyle(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="dynamic">Dynamic</option>
                  <option value="cinematic">Cinematic</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (seconds)
                </label>
                <select
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGeneratingVideo || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isGeneratingVideo ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating... {generationProgress}%
                </>
              ) : (
                <>
                  <span>🎬</span>
                  Generate Video
                </>
              )}
            </button>

            {/* Error Display */}
            {generationError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700">❌ {generationError}</p>
              </div>
            )}

            {/* Generated Video Display */}
            {generatedVideoUrl && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-semibold text-green-800 mb-2">
                    ✅ Video Generated Successfully!
                  </h4>
                  <p className="text-green-700 text-sm">
                    The video has been automatically added to your asset library.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <video
                    src={generatedVideoUrl}
                    controls
                    className="w-full rounded-lg"
                    style={{ maxHeight: '400px' }}
                  >
                    Your browser does not support the video tag.
                  </video>
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
                    onClick={() => setGeneratedVideoUrl(null)}
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

export default VideoGenerationModal;
