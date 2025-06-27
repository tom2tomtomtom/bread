/**
 * 🎯 Template Selector Component
 * 
 * Strategic campaign template selection interface with AI-powered recommendations
 * and preview capabilities for the four campaign frameworks.
 */

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import {
  CampaignTemplate,
  CampaignTemplateType,
  TemplateRecommendation,
} from '../../types';

interface TemplateSelectorProps {
  onTemplateSelected?: (template: CampaignTemplate) => void;
  onClose?: () => void;
}

const TEMPLATE_TYPE_LABELS: Record<CampaignTemplateType, string> = {
  launch: 'Launch Campaign',
  promotional: 'Promotional Campaign',
  brand_building: 'Brand Building Campaign',
  retention_loyalty: 'Retention & Loyalty Campaign',
};

const TEMPLATE_TYPE_DESCRIPTIONS: Record<CampaignTemplateType, string> = {
  launch: 'Perfect for new product announcements, market entry, and feature launches',
  promotional: 'Ideal for sales events, seasonal promotions, and limited-time offers',
  brand_building: 'Designed for awareness, emotional connection, and brand differentiation',
  retention_loyalty: 'Focused on member benefits, community building, and re-engagement',
};

const TEMPLATE_TYPE_ICONS: Record<CampaignTemplateType, string> = {
  launch: '🚀',
  promotional: '🎯',
  brand_building: '💎',
  retention_loyalty: '🤝',
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onTemplateSelected,
  onClose,
}) => {
  const {
    availableTemplates,
    templateRecommendations,
    isLoadingTemplates,
    isGeneratingRecommendations,
    templateError,
    brief,
    enhancedBriefAnalysis,
    loadAvailableTemplates,
    generateTemplateRecommendations,
    selectTemplate,
  } = useAppStore();

  const [selectedType, setSelectedType] = useState<CampaignTemplateType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showRecommendations, setShowRecommendations] = useState(true);

  useEffect(() => {
    // Load templates on mount
    if (availableTemplates.length === 0) {
      loadAvailableTemplates();
    }

    // Generate recommendations if we have a brief
    if (brief && enhancedBriefAnalysis && templateRecommendations.length === 0) {
      generateTemplateRecommendations();
    }
  }, [brief, enhancedBriefAnalysis]);

  const handleTemplateSelect = (template: CampaignTemplate) => {
    selectTemplate(template.id);
    onTemplateSelected?.(template);
  };

  const getRecommendationForTemplate = (templateId: string): TemplateRecommendation | null => {
    return templateRecommendations.find(r => r.templateId === templateId) || null;
  };

  const getFilteredTemplates = (): CampaignTemplate[] => {
    let filtered = availableTemplates;
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(template => template.type === selectedType);
    }

    // Sort by recommendation score if available
    if (templateRecommendations.length > 0) {
      filtered.sort((a, b) => {
        const aRec = getRecommendationForTemplate(a.id);
        const bRec = getRecommendationForTemplate(b.id);
        const aScore = aRec?.confidenceScore || 0;
        const bScore = bRec?.confidenceScore || 0;
        return bScore - aScore;
      });
    }

    return filtered;
  };

  const getConfidenceColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getComplexityColor = (complexity: string): string => {
    switch (complexity) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-blue-600 bg-blue-50';
      case 'advanced': return 'text-purple-600 bg-purple-50';
      case 'expert': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoadingTemplates) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading campaign templates...</span>
      </div>
    );
  }

  if (templateError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <div className="text-red-600 text-xl mr-3">⚠️</div>
          <div>
            <h3 className="text-red-800 font-medium">Template Loading Error</h3>
            <p className="text-red-600 text-sm mt-1">{templateError}</p>
          </div>
        </div>
        <button
          onClick={loadAvailableTemplates}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry Loading Templates
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Choose Campaign Template</h2>
          <p className="text-gray-600 mt-1">
            Select a strategic framework that aligns with your campaign objectives
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* AI Recommendations Banner */}
      {templateRecommendations.length > 0 && showRecommendations && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="text-blue-600 text-xl mr-3">🤖</div>
              <div>
                <h3 className="text-blue-800 font-medium">AI Recommendations</h3>
                <p className="text-blue-600 text-sm mt-1">
                  Based on your brief analysis, we recommend these templates for optimal performance
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRecommendations(false)}
              className="text-blue-400 hover:text-blue-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Template Type Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as CampaignTemplateType | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Templates</option>
              <option value="launch">Launch Campaigns</option>
              <option value="promotional">Promotional Campaigns</option>
              <option value="brand_building">Brand Building</option>
              <option value="retention_loyalty">Retention & Loyalty</option>
            </select>
          </div>

          {/* Generate Recommendations Button */}
          {brief && enhancedBriefAnalysis && (
            <button
              onClick={() => generateTemplateRecommendations()}
              disabled={isGeneratingRecommendations}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isGeneratingRecommendations ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>🤖 Get AI Recommendations</>
              )}
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Templates Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {getFilteredTemplates().map((template) => {
          const recommendation = getRecommendationForTemplate(template.id);
          
          return (
            <TemplateCard
              key={template.id}
              template={template}
              recommendation={recommendation}
              viewMode={viewMode}
              onSelect={() => handleTemplateSelect(template)}
              getConfidenceColor={getConfidenceColor}
              getComplexityColor={getComplexityColor}
            />
          );
        })}
      </div>

      {getFilteredTemplates().length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-gray-600 text-lg font-medium">No templates found</h3>
          <p className="text-gray-500 mt-2">
            {selectedType === 'all' 
              ? 'No templates are available at the moment.'
              : `No ${TEMPLATE_TYPE_LABELS[selectedType as CampaignTemplateType]} templates found.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

interface TemplateCardProps {
  template: CampaignTemplate;
  recommendation: TemplateRecommendation | null;
  viewMode: 'grid' | 'list';
  onSelect: () => void;
  getConfidenceColor: (score: number) => string;
  getComplexityColor: (complexity: string) => string;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  recommendation,
  viewMode,
  onSelect,
  getConfidenceColor,
  getComplexityColor,
}) => {
  const isRecommended = recommendation && recommendation.confidenceScore >= 70;

  if (viewMode === 'list') {
    return (
      <div className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer ${
        isRecommended ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`} onClick={onSelect}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">{TEMPLATE_TYPE_ICONS[template.type]}</div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                {isRecommended && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mt-1">{template.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(template.metadata.complexity)}`}>
                  {template.metadata.complexity}
                </span>
                <span className="text-gray-500 text-xs">
                  ~{template.metadata.estimatedSetupTime} min setup
                </span>
                <span className="text-gray-500 text-xs">
                  ⭐ {template.metadata.averageRating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {recommendation && (
            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(recommendation.confidenceScore)}`}>
                {Math.round(recommendation.confidenceScore)}% match
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Expected ROI: {recommendation.expectedPerformance.expectedROI.toFixed(1)}x
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 border rounded-lg hover:shadow-lg transition-all cursor-pointer ${
      isRecommended ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`} onClick={onSelect}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{TEMPLATE_TYPE_ICONS[template.type]}</div>
        {isRecommended && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
            AI Recommended
          </span>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{template.description}</p>
      </div>

      {/* Metrics */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Complexity:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(template.metadata.complexity)}`}>
            {template.metadata.complexity}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Setup Time:</span>
          <span className="text-gray-700">~{template.metadata.estimatedSetupTime} min</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Rating:</span>
          <span className="text-gray-700">⭐ {template.metadata.averageRating.toFixed(1)}</span>
        </div>
      </div>

      {/* AI Recommendation Details */}
      {recommendation && (
        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">AI Match Score:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(recommendation.confidenceScore)}`}>
              {Math.round(recommendation.confidenceScore)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Expected ROI:</span>
            <span className="text-sm font-medium text-green-600">
              {recommendation.expectedPerformance.expectedROI.toFixed(1)}x
            </span>
          </div>
          {recommendation.reasoning.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 italic">
                "{recommendation.reasoning[0]}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Key Features */}
      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Features:</h4>
        <div className="flex flex-wrap gap-1">
          {template.metadata.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Supported Channels */}
      <div className="mt-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Channels:</h4>
        <div className="flex items-center space-x-1">
          {template.channelSpecs.supportedChannels.slice(0, 4).map((channel) => (
            <div key={channel} className="w-6 h-6 bg-gray-200 rounded text-xs flex items-center justify-center">
              {channel === 'instagram_post' && '📷'}
              {channel === 'facebook_post' && '📘'}
              {channel === 'linkedin_post' && '💼'}
              {channel === 'youtube_thumbnail' && '📺'}
              {!['instagram_post', 'facebook_post', 'linkedin_post', 'youtube_thumbnail'].includes(channel) && '📱'}
            </div>
          ))}
          {template.channelSpecs.supportedChannels.length > 4 && (
            <span className="text-xs text-gray-500">
              +{template.channelSpecs.supportedChannels.length - 4} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
