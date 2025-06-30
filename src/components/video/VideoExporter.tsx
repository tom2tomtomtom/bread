import React, { useState } from 'react';
import { renderVideo } from '../../api/video-renderer';
import { useVideoTemplateStore } from '../../stores/videoTemplateStore';
import { useAssetStore } from '../../stores/assetStore';
import { VideoExportSettings } from '../../types/videoTemplates';

export const VideoExporter: React.FC = () => {
  const { selectedTemplate, videoContent } = useVideoTemplateStore();
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [exportSettings, setExportSettings] = useState<VideoExportSettings>({
    format: 'mp4',
    quality: 'hd',
    fps: 30,
    compression: 'medium',
    watermark: false,
  });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleExportVideo = async () => {
    if (!selectedTemplate || !videoContent) {
      alert('Please complete the video template step first');
      return;
    }

    setIsRendering(true);
    setRenderProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const result = await renderVideo({
        template: selectedTemplate,
        content: videoContent,
        exportSettings,
      });

      if (result.success && result.videoUrl) {
        setDownloadUrl(result.videoUrl);
        setRenderProgress(100);
        console.log('🎉 Video rendered successfully!');
      } else {
        throw new Error(result.error || 'Failed to render video');
      }
    } catch (error) {
      console.error('❌ Video export failed:', error);
      alert('Video export failed. Please try again.');
    } finally {
      setIsRendering(false);
      clearInterval(progressInterval);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `aideas-video-${Date.now()}.${exportSettings.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          🎬
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Video Export</h2>
          <p className="text-gray-400">Render and download your final video</p>
        </div>
      </div>

      {/* Export Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
          <select
            value={exportSettings.format}
            onChange={e =>
              setExportSettings(prev => ({
                ...prev,
                format: e.target.value as VideoExportSettings['format'],
              }))
            }
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="mp4">MP4</option>
            <option value="webm">WebM</option>
            <option value="gif">GIF</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Quality</label>
          <select
            value={exportSettings.quality}
            onChange={e =>
              setExportSettings(prev => ({
                ...prev,
                quality: e.target.value as VideoExportSettings['quality'],
              }))
            }
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="standard">Standard (720p)</option>
            <option value="hd">HD (1080p)</option>
            <option value="ultra">Ultra (1440p)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Frame Rate</label>
          <select
            value={exportSettings.fps}
            onChange={e =>
              setExportSettings(prev => ({
                ...prev,
                fps: parseInt(e.target.value) as VideoExportSettings['fps'],
              }))
            }
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="30">30 FPS</option>
            <option value="60">60 FPS</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Compression</label>
          <select
            value={exportSettings.compression}
            onChange={e =>
              setExportSettings(prev => ({
                ...prev,
                compression: e.target.value as VideoExportSettings['compression'],
              }))
            }
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="high">High (Smaller file)</option>
            <option value="medium">Medium</option>
            <option value="low">Low (Better quality)</option>
          </select>
        </div>
      </div>

      {/* Video Preview Info */}
      {selectedTemplate && videoContent && (
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Video Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Duration</div>
              <div className="text-white font-medium">{selectedTemplate.totalDuration / 1000}s</div>
            </div>
            <div>
              <div className="text-gray-400">Aspect Ratio</div>
              <div className="text-white font-medium">{selectedTemplate.aspectRatio}</div>
            </div>
            <div>
              <div className="text-gray-400">Template</div>
              <div className="text-white font-medium">{selectedTemplate.name}</div>
            </div>
          </div>
        </div>
      )}

      {/* Render Progress */}
      {isRendering && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Rendering video...</span>
            <span>{renderProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${renderProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Export Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleExportVideo}
          disabled={isRendering || !selectedTemplate || !videoContent}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isRendering ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              Rendering...
            </>
          ) : (
            <>🎬 Generate Video</>
          )}
        </button>

        {downloadUrl && (
          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            📥 Download
          </button>
        )}
      </div>

      {/* Status Messages */}
      {!selectedTemplate && (
        <p className="text-yellow-400 text-sm mt-4">
          ⚠️ Please complete the video template step to enable video export
        </p>
      )}

      {downloadUrl && (
        <p className="text-green-400 text-sm mt-4">
          ✅ Video rendered successfully! Click download to save your video.
        </p>
      )}
    </div>
  );
};
