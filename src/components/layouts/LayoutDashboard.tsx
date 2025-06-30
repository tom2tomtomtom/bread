import React, { useState, useEffect } from 'react';
import { useAssetStore } from '../../stores/assetStore';
import { LayoutGenerator } from './LayoutGenerator';
import { LayoutPreview } from './LayoutPreview';
import { ExportManager } from './ExportManager';
import { BrandComplianceChecker } from './BrandComplianceChecker';
import { LayoutVariation } from '../../types';

interface LayoutDashboardProps {
  onClose?: () => void;
}

export const LayoutDashboard: React.FC<LayoutDashboardProps> = ({ onClose }) => {
  const {
    layouts,
    currentLayout,
    visualIntelligence,
    isGeneratingLayouts,
    layoutGenerationError,
    selectLayout,
    updateLayout,
    deleteLayout,
    duplicateLayout,
    clearLayouts,
  } = useAssetStore();

  // Note: currentTerritory not available in app store, using current layout instead

  const [activeTab, setActiveTab] = useState<'generate' | 'preview' | 'export' | 'manage'>(
    'generate'
  );
  const [selectedLayouts, setSelectedLayouts] = useState<string[]>([]);
  const [showExportManager, setShowExportManager] = useState(false);

  // Auto-select first layout when layouts are generated
  useEffect(() => {
    if (layouts.length > 0 && !currentLayout && layouts[0]) {
      selectLayout(layouts[0]);
    }
  }, [layouts, currentLayout, selectLayout]);

  const handleLayoutGenerated = (newLayouts: LayoutVariation[]) => {
    setActiveTab('preview');
  };

  const handleLayoutSelect = (layout: LayoutVariation) => {
    selectLayout(layout);
    setActiveTab('preview');
  };

  const handleLayoutUpdate = (layoutId: string, updates: Partial<LayoutVariation>) => {
    updateLayout(layoutId, updates);
  };

  const handleLayoutDelete = (layoutId: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Are you sure you want to delete this layout?')) {
      deleteLayout(layoutId);
      if (currentLayout?.id === layoutId && layouts.length > 1) {
        const remainingLayouts = layouts.filter(l => l.id !== layoutId);
        if (remainingLayouts[0]) {
          selectLayout(remainingLayouts[0]);
        }
      }
    }
  };

  const handleLayoutDuplicate = (layoutId: string) => {
    const duplicated = duplicateLayout(layoutId);
    selectLayout(duplicated);
  };

  const handleBulkAction = (action: 'delete' | 'export') => {
    if (action === 'delete') {
      // eslint-disable-next-line no-restricted-globals
      if (confirm(`Delete ${selectedLayouts.length} selected layouts?`)) {
        selectedLayouts.forEach(id => deleteLayout(id));
        setSelectedLayouts([]);
      }
    } else if (action === 'export') {
      setShowExportManager(true);
    }
  };

  const toggleLayoutSelection = (layoutId: string) => {
    setSelectedLayouts(prev =>
      prev.includes(layoutId) ? prev.filter(id => id !== layoutId) : [...prev, layoutId]
    );
  };

  const getPerformanceColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (score: number): string => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 75) return 'bg-yellow-100 text-yellow-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🎨 Layout Studio</h1>
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {layouts.length} layout{layouts.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {layouts.length > 0 && (
                <button
                  onClick={() => setShowExportManager(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  📤 Export
                </button>
              )}

              {layouts.length > 0 && (
                <button
                  onClick={() => {
                    // eslint-disable-next-line no-restricted-globals
                    if (confirm('Clear all layouts? This cannot be undone.')) {
                      clearLayouts();
                      setActiveTab('generate');
                    }
                  }}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                >
                  🗑️ Clear All
                </button>
              )}

              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
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
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'generate', label: '🎨 Generate', count: null },
              { id: 'preview', label: '👁️ Preview', count: currentLayout ? 1 : 0 },
              { id: 'manage', label: '📋 Manage', count: layouts.length },
              { id: 'export', label: '📤 Export', count: null },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Generate Tab */}
        {activeTab === 'generate' && <LayoutGenerator onLayoutGenerated={handleLayoutGenerated} />}

        {/* Preview Tab */}
        {activeTab === 'preview' && currentLayout && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <LayoutPreview
                layout={currentLayout}
                interactive={true}
                showControls={true}
                onLayoutUpdate={updates => handleLayoutUpdate(currentLayout.id, updates)}
              />
            </div>
            <div>
              <BrandComplianceChecker
                compliance={currentLayout.brandCompliance}
                showDetails={true}
              />
            </div>
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            {/* Bulk Actions */}
            {selectedLayouts.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">
                    {selectedLayouts.length} layout{selectedLayouts.length !== 1 ? 's' : ''}{' '}
                    selected
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleBulkAction('export')}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm font-medium"
                    >
                      Export Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Delete Selected
                    </button>
                    <button
                      onClick={() => setSelectedLayouts([])}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {layouts.map(layout => (
                <div
                  key={layout.id}
                  className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                    currentLayout?.id === layout.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : selectedLayouts.includes(layout.id)
                        ? 'border-green-500 ring-2 ring-green-200'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div className="p-4 pb-0">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedLayouts.includes(layout.id)}
                        onChange={() => toggleLayoutSelection(layout.id)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">Select</span>
                    </label>
                  </div>

                  {/* Layout Preview */}
                  <div className="p-4">
                    <div className="cursor-pointer" onClick={() => handleLayoutSelect(layout)}>
                      <LayoutPreview
                        layout={layout}
                        width={250}
                        height={200}
                        interactive={false}
                        showControls={false}
                      />
                    </div>

                    {/* Layout Info */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">{layout.name}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getPerformanceBadge(layout.performancePrediction)}`}
                        >
                          {layout.performancePrediction}%
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">{layout.description}</p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{layout.channelOptimization[0]}</span>
                        <span>{new Date(layout.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleLayoutSelect(layout)}
                        className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleLayoutDuplicate(layout.id)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => handleLayoutDelete(layout.id)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {layouts.length === 0 && (
              <div className="text-center py-12">
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No layouts yet</h3>
                <p className="text-gray-600 mb-4">
                  Generate your first AI-powered layout to get started
                </p>
                <button
                  onClick={() => setActiveTab('generate')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  🎨 Generate Layouts
                </button>
              </div>
            )}
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <ExportManager
            layout={currentLayout || undefined}
            layouts={layouts}
            onExportComplete={results => {
              console.log('Export completed:', results);
            }}
          />
        )}
      </div>

      {/* Export Manager Modal */}
      {showExportManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-screen overflow-y-auto">
            <ExportManager
              layout={currentLayout || undefined}
              layouts={
                selectedLayouts.length > 0
                  ? layouts.filter(l => selectedLayouts.includes(l.id))
                  : layouts
              }
              onExportComplete={results => {
                console.log('Export completed:', results);
                setShowExportManager(false);
              }}
              onClose={() => setShowExportManager(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
