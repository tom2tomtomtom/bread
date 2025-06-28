import React, { useState } from 'react';
import { LayoutVariation, ExportConfiguration, ChannelFormat } from '../../types';
import { exportService } from '../../services/exportService';
import { useAssetStore } from '../../stores/assetStore';

interface ExportManagerProps {
  layout?: LayoutVariation;
  layouts?: LayoutVariation[];
  onExportComplete?: (results: any) => void;
  onClose?: () => void;
}

export const ExportManager: React.FC<ExportManagerProps> = ({
  layout,
  layouts = [],
  onExportComplete,
  onClose,
}) => {
  const { exportLayout } = useAssetStore();
  const [selectedPreset, setSelectedPreset] = useState<string>('social_media_pack');
  const [customConfig, setCustomConfig] = useState<Partial<ExportConfiguration>>({
    quality: 'production',
    includeBleed: false,
    includeMarks: false,
    compression: 85,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportResults, setExportResults] = useState<any>(null);
  const [exportMode, setExportMode] = useState<'preset' | 'custom' | 'single'>('preset');

  const presets = exportService.getExportPresets();
  const targetLayout = layout || layouts[0];

  const handlePresetExport = async () => {
    if (!targetLayout) return;

    setIsExporting(true);
    try {
      const configs = presets[selectedPreset];
      if (!configs) {
        throw new Error('Invalid preset configuration');
      }
      const results = await exportService.exportMultipleFormats(targetLayout, configs);
      setExportResults(results);
      onExportComplete?.(results);
    } catch (error) {
      console.error('Preset export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCustomExport = async () => {
    if (!targetLayout || !customConfig.format) return;

    setIsExporting(true);
    try {
      const config: ExportConfiguration = {
        format: customConfig.format,
        quality: customConfig.quality || 'production',
        includeBleed: customConfig.includeBleed || false,
        includeMarks: customConfig.includeMarks || false,
        colorProfile: 'sRGB',
        compression: customConfig.compression || 85,
        metadata: {
          title: targetLayout.name,
          description: targetLayout.description,
          keywords: [targetLayout.metadata.territoryId],
          copyright: '© AIDEAS Platform',
        },
      };

      const result = await exportService.exportLayout(targetLayout, config);
      setExportResults({ results: [result], successCount: result.success ? 1 : 0 });
      onExportComplete?.(result);
    } catch (error) {
      console.error('Custom export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleProjectExport = async () => {
    if (layouts.length === 0 || !customConfig.format) return;

    setIsExporting(true);
    try {
      const results = await exportService.exportProject(
        layouts,
        customConfig.format,
        customConfig.quality
      );
      setExportResults(results);
      onExportComplete?.(results);
    } catch (error) {
      console.error('Project export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📤 Export Manager</h2>
          <p className="text-gray-600 mt-1">
            Export layouts to production-ready files across multiple formats
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

      {/* Export Mode Selection */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setExportMode('preset')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              exportMode === 'preset'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📦 Preset Packs
          </button>
          <button
            onClick={() => setExportMode('custom')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              exportMode === 'custom'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ⚙️ Custom Export
          </button>
          {layouts.length > 1 && (
            <button
              onClick={() => setExportMode('single')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                exportMode === 'single'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🗂️ Project Export
            </button>
          )}
        </div>
      </div>

      {/* Preset Export */}
      {exportMode === 'preset' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Choose Export Pack</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(presets).map(([key, configs]) => (
              <button
                key={key}
                onClick={() => setSelectedPreset(key)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedPreset === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="font-medium text-gray-900 mb-2">
                  {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="text-sm text-gray-600 mb-3">{configs.length} formats included</div>
                <div className="space-y-1">
                  {configs.slice(0, 3).map((config, index) => (
                    <div key={index} className="text-xs text-gray-500">
                      • {config.format.replace('_', ' ')}
                    </div>
                  ))}
                  {configs.length > 3 && (
                    <div className="text-xs text-gray-500">• +{configs.length - 3} more</div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handlePresetExport}
            disabled={!targetLayout || isExporting}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
              targetLayout && !isExporting
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isExporting ? 'Exporting...' : `Export ${selectedPreset.replace('_', ' ')}`}
          </button>
        </div>
      )}

      {/* Custom Export */}
      {exportMode === 'custom' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Custom Export Settings</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select
                value={customConfig.format || ''}
                onChange={e =>
                  setCustomConfig(prev => ({ ...prev, format: e.target.value as ChannelFormat }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select format...</option>
                <option value="instagram_post">Instagram Post</option>
                <option value="instagram_story">Instagram Story</option>
                <option value="facebook_post">Facebook Post</option>
                <option value="linkedin_post">LinkedIn Post</option>
                <option value="print_a4">A4 Print</option>
                <option value="banner_leaderboard">Leaderboard Banner</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
              <select
                value={customConfig.quality || 'production'}
                onChange={e =>
                  setCustomConfig(prev => ({ ...prev, quality: e.target.value as any }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="preview">Preview</option>
                <option value="production">Production</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compression (%)
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={customConfig.compression || 85}
                onChange={e =>
                  setCustomConfig(prev => ({ ...prev, compression: parseInt(e.target.value) }))
                }
                className="w-full"
              />
              <div className="text-sm text-gray-500 text-center">
                {customConfig.compression || 85}%
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={customConfig.includeBleed || false}
                  onChange={e =>
                    setCustomConfig(prev => ({ ...prev, includeBleed: e.target.checked }))
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Include Bleed</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={customConfig.includeMarks || false}
                  onChange={e =>
                    setCustomConfig(prev => ({ ...prev, includeMarks: e.target.checked }))
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Include Crop Marks</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleCustomExport}
            disabled={!targetLayout || !customConfig.format || isExporting}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
              targetLayout && customConfig.format && !isExporting
                ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isExporting ? 'Exporting...' : 'Export Custom Format'}
          </button>
        </div>
      )}

      {/* Project Export */}
      {exportMode === 'single' && layouts.length > 1 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Project Export</h3>
          <p className="text-gray-600">Export all {layouts.length} layouts to the same format</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select
                value={customConfig.format || ''}
                onChange={e =>
                  setCustomConfig(prev => ({ ...prev, format: e.target.value as ChannelFormat }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select format...</option>
                <option value="instagram_post">Instagram Post</option>
                <option value="facebook_post">Facebook Post</option>
                <option value="print_a4">A4 Print</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
              <select
                value={customConfig.quality || 'production'}
                onChange={e =>
                  setCustomConfig(prev => ({ ...prev, quality: e.target.value as any }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="preview">Preview</option>
                <option value="production">Production</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleProjectExport}
            disabled={!customConfig.format || isExporting}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
              customConfig.format && !isExporting
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isExporting ? 'Exporting Project...' : 'Export All Layouts'}
          </button>
        </div>
      )}

      {/* Export Results */}
      {exportResults && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">📋 Export Results</h3>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {exportResults.successCount || 0}
              </div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {exportResults.failureCount || 0}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatFileSize(exportResults.totalSize || 0)}
              </div>
              <div className="text-sm text-gray-600">Total Size</div>
            </div>
          </div>

          {exportResults.results && (
            <div className="space-y-2">
              {exportResults.results.map((result: any, index: number) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.success
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{result.success ? '✅' : '❌'}</span>
                    <div>
                      <div className="font-medium">{result.filename || result.format}</div>
                      <div className="text-sm text-gray-600">{formatFileSize(result.size)}</div>
                    </div>
                  </div>

                  {result.success && result.url && (
                    <button
                      onClick={() => handleDownload(result.url, result.filename)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      Download
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {exportResults.downloadUrl && (
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => handleDownload(exportResults.downloadUrl, 'export_batch.zip')}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                📦 Download All as ZIP
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
