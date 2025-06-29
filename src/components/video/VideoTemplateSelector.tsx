import React, { useState, useMemo } from 'react';
import { VideoTemplate, VIDEO_TEMPLATE_CATEGORIES } from '../../types/videoTemplates';
import {
  PREDEFINED_VIDEO_TEMPLATES,
  getTemplatesByCategory,
  searchTemplates,
} from '../../data/videoTemplates';

interface VideoTemplateSelectorProps {
  onTemplateSelected: (template: VideoTemplate) => void;
  selectedCategory?: string;
  className?: string;
}

export const VideoTemplateSelector: React.FC<VideoTemplateSelectorProps> = ({
  onTemplateSelected,
  selectedCategory,
  className = '',
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(selectedCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);

  const filteredTemplates = useMemo(() => {
    let templates = PREDEFINED_VIDEO_TEMPLATES;

    // Apply category filter
    if (activeCategory !== 'all') {
      templates = getTemplatesByCategory(activeCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery);
    }

    return templates;
  }, [activeCategory, searchQuery]);

  const handleTemplateSelect = (template: VideoTemplate) => {
    setSelectedTemplate(template);
    onTemplateSelected(template);
  };

  const renderFramePreview = (template: VideoTemplate) => (
    <div className="flex gap-1 mb-3">
      {template.frames.map((frame, index) => (
        <div
          key={frame.frameNumber}
          className="flex-1 h-16 rounded-lg border-2 border-white/20 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden"
          style={{ backgroundColor: frame.backgroundColor }}
        >
          {/* Frame number indicator */}
          <div className="absolute top-1 left-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">{frame.frameNumber}</span>
          </div>

          {/* Frame content preview */}
          <div className="absolute inset-2 flex flex-col justify-center items-center">
            {Object.entries(frame.elements).map(([key, element]) => (
              <div
                key={key}
                className="text-[6px] text-white/60 text-center truncate w-full"
                title={`${key}: ${element.slot}`}
              >
                {element.slot === 'text' && key.includes('headline') && '📰'}
                {element.slot === 'text' && key.includes('body') && '📝'}
                {element.slot === 'text' && key.includes('cta') && '🔥'}
                {element.slot === 'image' && '🖼️'}
                {element.slot === 'logo' && '🏷️'}
                {element.slot === 'button' && '📱'}
                {element.slot === 'background' && '🎨'}
              </div>
            ))}
          </div>

          {/* Duration indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-orange-500 transition-all duration-300"
              style={{ width: `${(frame.duration / 3000) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`video-template-selector ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">📱 Video Ad Templates</h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Choose from our collection of 3-frame video templates designed for maximum engagement
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50">🔍</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeCategory === 'all'
                ? 'bg-orange-500 text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            🎬 All Templates
          </button>
          {Object.entries(VIDEO_TEMPLATE_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeCategory === key
                  ? 'bg-orange-500 text-black'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              {category.icon} {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div
            key={template.templateId}
            className={`template-card bg-white/5 backdrop-blur-xl border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              selectedTemplate?.templateId === template.templateId
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-white/10 hover:border-white/30'
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            {/* Template Preview - 3 Frame Layout */}
            {renderFramePreview(template)}

            {/* Template Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{template.name}</h3>
                <span className="text-sm text-orange-400">
                  {VIDEO_TEMPLATE_CATEGORIES[template.category].icon}
                </span>
              </div>

              <p className="text-sm text-gray-400 line-clamp-2">{template.description}</p>

              {/* Template Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>⏱️ {template.totalDuration / 1000}s</span>
                <span>📱 {template.aspectRatio}</span>
                <span>🎞️ 3 frames</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
                {template.tags.length > 3 && (
                  <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-400">
                    +{template.tags.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedTemplate?.templateId === template.templateId && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-bold text-white mb-2">No templates found</h3>
          <p className="text-gray-400">
            {searchQuery ? 'Try a different search term' : 'No templates in this category'}
          </p>
        </div>
      )}

      {/* Selected Template Details */}
      {selectedTemplate && (
        <div className="mt-8 p-6 bg-orange-500/10 border border-orange-500/30 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-orange-400">Selected Template</h3>
            <button
              onClick={() => onTemplateSelected(selectedTemplate)}
              className="px-6 py-2 bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-black font-semibold rounded-lg transition-all duration-300"
            >
              Continue with {selectedTemplate.name}
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Category:</span>
              <p className="text-white font-medium">
                {VIDEO_TEMPLATE_CATEGORIES[selectedTemplate.category].icon}{' '}
                {VIDEO_TEMPLATE_CATEGORIES[selectedTemplate.category].label}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Duration:</span>
              <p className="text-white font-medium">
                {selectedTemplate.totalDuration / 1000} seconds
              </p>
            </div>
            <div>
              <span className="text-gray-400">Format:</span>
              <p className="text-white font-medium">{selectedTemplate.aspectRatio} (Mobile)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
