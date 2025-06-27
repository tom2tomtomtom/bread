import React, { useState } from 'react';
import { ChannelFormat, ChannelSpecs } from '../../types';
import { CHANNEL_SPECIFICATIONS } from '../../services/layoutGenerationService';

interface FormatSelectorProps {
  selectedFormats: ChannelFormat[];
  onFormatsChange: (formats: ChannelFormat[]) => void;
  maxSelections?: number;
}

interface FormatCategory {
  name: string;
  icon: string;
  formats: {
    format: ChannelFormat;
    name: string;
    description: string;
    specs: ChannelSpecs;
  }[];
}

const FORMAT_CATEGORIES: FormatCategory[] = [
  {
    name: 'Social Media',
    icon: '📱',
    formats: [
      {
        format: 'instagram_post',
        name: 'Instagram Post',
        description: '1:1 Square format for Instagram feed',
        specs: CHANNEL_SPECIFICATIONS.instagram_post,
      },
      {
        format: 'instagram_story',
        name: 'Instagram Story',
        description: '9:16 Vertical format for Instagram Stories',
        specs: CHANNEL_SPECIFICATIONS.instagram_story,
      },
      {
        format: 'facebook_post',
        name: 'Facebook Post',
        description: '1.91:1 Landscape format for Facebook feed',
        specs: CHANNEL_SPECIFICATIONS.facebook_post,
      },
      {
        format: 'linkedin_post',
        name: 'LinkedIn Post',
        description: '1.91:1 Landscape format for LinkedIn feed',
        specs: CHANNEL_SPECIFICATIONS.linkedin_post,
      },
      {
        format: 'tiktok_video',
        name: 'TikTok Video',
        description: '9:16 Vertical format for TikTok',
        specs: CHANNEL_SPECIFICATIONS.tiktok_video,
      },
      {
        format: 'youtube_thumbnail',
        name: 'YouTube Thumbnail',
        description: '16:9 Landscape format for YouTube',
        specs: CHANNEL_SPECIFICATIONS.youtube_thumbnail,
      },
    ],
  },
  {
    name: 'Digital Advertising',
    icon: '💻',
    formats: [
      {
        format: 'banner_leaderboard',
        name: 'Leaderboard Banner',
        description: '728x90 Top banner format',
        specs: CHANNEL_SPECIFICATIONS.banner_leaderboard,
      },
      {
        format: 'banner_rectangle',
        name: 'Medium Rectangle',
        description: '300x250 Sidebar banner format',
        specs: CHANNEL_SPECIFICATIONS.banner_rectangle,
      },
      {
        format: 'banner_skyscraper',
        name: 'Wide Skyscraper',
        description: '160x600 Vertical banner format',
        specs: CHANNEL_SPECIFICATIONS.banner_skyscraper,
      },
      {
        format: 'email_header',
        name: 'Email Header',
        description: '600x200 Email newsletter header',
        specs: CHANNEL_SPECIFICATIONS.email_header,
      },
    ],
  },
  {
    name: 'Print & Outdoor',
    icon: '🖨️',
    formats: [
      {
        format: 'print_a4',
        name: 'A4 Print',
        description: 'Standard A4 print format',
        specs: CHANNEL_SPECIFICATIONS.print_a4,
      },
      {
        format: 'print_a3',
        name: 'A3 Print',
        description: 'Large A3 print format',
        specs: CHANNEL_SPECIFICATIONS.print_a3,
      },
      {
        format: 'billboard_landscape',
        name: 'Billboard Landscape',
        description: 'Large outdoor billboard format',
        specs: CHANNEL_SPECIFICATIONS.billboard_landscape,
      },
    ],
  },
  {
    name: 'Retail & In-Store',
    icon: '🏪',
    formats: [
      {
        format: 'pos_display',
        name: 'POS Display',
        description: 'Point of sale display format',
        specs: CHANNEL_SPECIFICATIONS.pos_display,
      },
      {
        format: 'shelf_talker',
        name: 'Shelf Talker',
        description: 'Product shelf signage',
        specs: CHANNEL_SPECIFICATIONS.shelf_talker,
      },
      {
        format: 'window_cling',
        name: 'Window Cling',
        description: 'Store window display',
        specs: CHANNEL_SPECIFICATIONS.window_cling,
      },
    ],
  },
];

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  selectedFormats,
  onFormatsChange,
  maxSelections = 5,
}) => {
  const [activeCategory, setActiveCategory] = useState(0);

  const handleFormatToggle = (format: ChannelFormat) => {
    if (selectedFormats.includes(format)) {
      // Remove format
      onFormatsChange(selectedFormats.filter(f => f !== format));
    } else {
      // Add format (check max limit)
      if (selectedFormats.length < maxSelections) {
        onFormatsChange([...selectedFormats, format]);
      }
    }
  };

  const formatAspectRatio = (specs: ChannelSpecs): string => {
    const ratio = specs.width / specs.height;
    if (ratio > 1.5) return 'Landscape';
    if (ratio < 0.75) return 'Portrait';
    return 'Square';
  };

  const formatDimensions = (specs: ChannelSpecs): string => {
    return `${specs.width}×${specs.height}`;
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {FORMAT_CATEGORIES.map((category, index) => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(index)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === index
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Selection Summary */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {selectedFormats.length} of {maxSelections} formats selected
        </span>
        {selectedFormats.length > 0 && (
          <button
            onClick={() => onFormatsChange([])}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Format Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {FORMAT_CATEGORIES[activeCategory]?.formats.map(({ format, name, description, specs }) => {
          const isSelected = selectedFormats.includes(format);
          const canSelect = selectedFormats.length < maxSelections || isSelected;

          return (
            <button
              key={format}
              onClick={() => handleFormatToggle(format)}
              disabled={!canSelect}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : canSelect
                  ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {name}
                    </h4>
                    {isSelected && (
                      <svg className="w-5 h-5 text-blue-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  <p className={`text-sm mb-3 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                    {description}
                  </p>
                  
                  <div className="space-y-1">
                    <div className="flex items-center text-xs">
                      <span className={`font-medium ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                        Dimensions:
                      </span>
                      <span className={`ml-2 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                        {formatDimensions(specs)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs">
                      <span className={`font-medium ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                        Ratio:
                      </span>
                      <span className={`ml-2 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                        {formatAspectRatio(specs)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs">
                      <span className={`font-medium ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                        Format:
                      </span>
                      <span className={`ml-2 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                        {specs.fileFormat} • {specs.colorSpace}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visual Ratio Indicator */}
                <div className="ml-4 flex-shrink-0">
                  <div
                    className={`border-2 ${isSelected ? 'border-blue-400' : 'border-gray-300'}`}
                    style={{
                      width: '32px',
                      height: `${32 * (specs.height / specs.width)}px`,
                      maxHeight: '48px',
                      minHeight: '16px',
                    }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Formats Summary */}
      {selectedFormats.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Selected Formats</h4>
          <div className="flex flex-wrap gap-2">
            {selectedFormats.map(format => {
              const formatInfo = FORMAT_CATEGORIES
                .flatMap(cat => cat.formats)
                .find(f => f.format === format);
              
              return (
                <span
                  key={format}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {formatInfo?.name || format}
                  <button
                    onClick={() => handleFormatToggle(format)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Select Presets */}
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Quick Select Presets</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFormatsChange(['instagram_post', 'instagram_story', 'facebook_post'])}
            className="px-3 py-2 bg-purple-100 text-purple-700 text-sm rounded-lg hover:bg-purple-200 transition-colors"
          >
            📱 Social Media Pack
          </button>
          
          <button
            onClick={() => onFormatsChange(['banner_leaderboard', 'banner_rectangle', 'email_header'])}
            className="px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors"
          >
            💻 Digital Ads Pack
          </button>
          
          <button
            onClick={() => onFormatsChange(['print_a4', 'billboard_landscape', 'pos_display'])}
            className="px-3 py-2 bg-orange-100 text-orange-700 text-sm rounded-lg hover:bg-orange-200 transition-colors"
          >
            🖨️ Print & Retail Pack
          </button>
        </div>
      </div>
    </div>
  );
};
