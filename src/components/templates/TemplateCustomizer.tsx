/**
 * 🎨 Template Customizer Component
 *
 * Brand adaptation and template-specific configuration tools for campaign templates.
 * Provides intuitive interface for customizing templates while maintaining brand compliance.
 */

import React, { useState, useEffect } from 'react';
import { useTemplateStore } from '../../stores/templateStore';
import {
  CampaignTemplate,
  TemplateCustomization,
  ValidationResult,
  RequiredInput,
  OptionalInput,
  ChannelFormat,
} from '../../types';

interface TemplateCustomizerProps {
  onCustomizationComplete?: (customizations: TemplateCustomization[]) => void;
  onPreviewGenerated?: () => void;
  onBack?: () => void;
}

export const TemplateCustomizer: React.FC<TemplateCustomizerProps> = ({
  onCustomizationComplete,
  onPreviewGenerated,
  onBack,
}) => {
  const {
    templateSelection,
    updateTemplateCustomization,
    validateTemplateCustomizations,
    generateTemplatePreview,
    saveTemplateConfiguration,
  } = useTemplateStore();

  const [activeTab, setActiveTab] = useState<'basic' | 'brand' | 'channels' | 'preview'>('basic');
  const [selectedChannels, setSelectedChannels] = useState<ChannelFormat[]>(['instagram_post']);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

  const template = templateSelection.selectedTemplate;

  useEffect(() => {
    if (template) {
      // Set default channels based on template
      setSelectedChannels(template.channelSpecs.supportedChannels.slice(0, 3));
    }
  }, [template]);

  useEffect(() => {
    // Validate customizations when they change
    const results = validateTemplateCustomizations();
    setValidationResults(results);
  }, [templateSelection.customizations]);

  if (!template) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-400 text-6xl mb-4">🎨</div>
        <h3 className="text-gray-600 text-lg font-medium">No Template Selected</h3>
        <p className="text-gray-500 mt-2">Please select a template first to customize it.</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Templates
          </button>
        )}
      </div>
    );
  }

  const handleInputChange = (field: string, value: any) => {
    updateTemplateCustomization(field, value);
  };

  const handleChannelToggle = (channel: ChannelFormat) => {
    setSelectedChannels(prev =>
      prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
    );
  };

  const handleGeneratePreview = async () => {
    if (selectedChannels.length === 0) return;

    setIsGeneratingPreview(true);
    try {
      await generateTemplatePreview(selectedChannels);
      setActiveTab('preview');
      onPreviewGenerated?.();
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleSaveConfiguration = async () => {
    try {
      await saveTemplateConfiguration();
      onCustomizationComplete?.(templateSelection.customizations);
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  };

  const getValidationError = (field: string): string | null => {
    const error = validationResults.find(r => r.field === field && !r.isValid);
    return error?.message || null;
  };

  const isFormValid = validationResults.every(r => r.isValid);
  const completionPercentage = templateSelection.customizationProgress;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customize Template</h2>
            <p className="text-gray-600 mt-1">{template.name}</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">{Math.round(completionPercentage)}% Complete</div>
          <div className="w-24 h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'basic', label: 'Basic Info', icon: '📝' },
            { id: 'brand', label: 'Brand Adaptation', icon: '🎨' },
            { id: 'channels', label: 'Channels', icon: '📱' },
            { id: 'preview', label: 'Preview', icon: '👁️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'basic' && (
          <BasicInfoTab
            template={template}
            customizations={templateSelection.customizations}
            onInputChange={handleInputChange}
            getValidationError={getValidationError}
          />
        )}

        {activeTab === 'brand' && (
          <BrandAdaptationTab
            template={template}
            customizations={templateSelection.customizations}
            onInputChange={handleInputChange}
            getValidationError={getValidationError}
          />
        )}

        {activeTab === 'channels' && (
          <ChannelsTab
            template={template}
            selectedChannels={selectedChannels}
            onChannelToggle={handleChannelToggle}
          />
        )}

        {activeTab === 'preview' && (
          <PreviewTab
            template={template}
            previewAssets={templateSelection.previewAssets}
            selectedChannels={selectedChannels}
            isGenerating={isGeneratingPreview}
            onGeneratePreview={handleGeneratePreview}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          {validationResults.length > 0 && (
            <div className="text-sm">
              {validationResults.filter(r => !r.isValid).length > 0 ? (
                <span className="text-red-600">
                  ⚠️ {validationResults.filter(r => !r.isValid).length} validation errors
                </span>
              ) : (
                <span className="text-green-600">✅ All validations passed</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {activeTab !== 'preview' && (
            <button
              onClick={handleGeneratePreview}
              disabled={!isFormValid || selectedChannels.length === 0 || isGeneratingPreview}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGeneratingPreview ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                  Generating...
                </>
              ) : (
                'Generate Preview'
              )}
            </button>
          )}

          <button
            onClick={handleSaveConfiguration}
            disabled={!isFormValid}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

// Tab Components

interface BasicInfoTabProps {
  template: CampaignTemplate;
  customizations: TemplateCustomization[];
  onInputChange: (field: string, value: any) => void;
  getValidationError: (field: string) => string | null;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  template,
  customizations,
  onInputChange,
  getValidationError,
}) => {
  const getCustomizationValue = (field: string) => {
    const customization = customizations.find(c => c.field === field);
    return customization?.value || '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Required Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {template.templateConfiguration.requiredInputs.map(input => (
            <div key={input.field}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {input.field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type={input.type === 'number' ? 'number' : 'text'}
                value={getCustomizationValue(input.field)}
                onChange={e => onInputChange(input.field, e.target.value)}
                placeholder={input.examples?.[0] || input.description}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  getValidationError(input.field) ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {getValidationError(input.field) && (
                <p className="text-red-600 text-sm mt-1">{getValidationError(input.field)}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">{input.description}</p>
            </div>
          ))}
        </div>
      </div>

      {template.templateConfiguration.optionalInputs.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Optional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {template.templateConfiguration.optionalInputs.map(input => (
              <div key={input.field}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {input.field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <input
                  type={input.type === 'number' ? 'number' : 'text'}
                  value={getCustomizationValue(input.field) || input.defaultValue}
                  onChange={e => onInputChange(input.field, e.target.value)}
                  placeholder={input.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-gray-500 text-sm mt-1">{input.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface BrandAdaptationTabProps {
  template: CampaignTemplate;
  customizations: TemplateCustomization[];
  onInputChange: (field: string, value: any) => void;
  getValidationError: (field: string) => string | null;
}

const BrandAdaptationTab: React.FC<BrandAdaptationTabProps> = ({
  template,
  customizations,
  onInputChange,
  getValidationError,
}) => {
  const getCustomizationValue = (field: string) => {
    const customization = customizations.find(c => c.field === field);
    return customization?.value || '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Customization</h3>
        <div className="space-y-6">
          {template.brandAdaptation.customizationOptions.map(option => (
            <div key={option.name}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{option.name}</label>
              <p className="text-gray-500 text-sm mb-3">{option.description}</p>

              {option.type === 'color' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {option.options.map(choice => (
                    <button
                      key={String(choice.value)}
                      onClick={() =>
                        onInputChange(option.name.toLowerCase().replace(' ', '_'), choice.value)
                      }
                      className={`p-3 border rounded-lg text-left hover:shadow-md transition-all ${
                        getCustomizationValue(option.name.toLowerCase().replace(' ', '_')) ===
                        choice.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div
                        className="w-full h-8 rounded mb-2"
                        style={{ backgroundColor: String(choice.value) }}
                      />
                      <div className="text-sm font-medium">{choice.label}</div>
                      <div className="text-xs text-gray-500">
                        {choice.brandAlignment}% brand alignment
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {option.type === 'typography' && (
                <select
                  value={getCustomizationValue(option.name.toLowerCase().replace(' ', '_'))}
                  onChange={e =>
                    onInputChange(option.name.toLowerCase().replace(' ', '_'), e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select {option.name}</option>
                  {option.options.map(choice => (
                    <option key={String(choice.value)} value={String(choice.value)}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              )}

              <p className="text-gray-500 text-sm mt-2">{option.impact}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Compliance</h3>
        <div className="space-y-4">
          {template.brandAdaptation.brandConsistency.map((rule, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <div
                  className={`mt-1 w-3 h-3 rounded-full ${
                    rule.enforcement === 'strict'
                      ? 'bg-red-500'
                      : rule.enforcement === 'flexible'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                />
                <div>
                  <h4 className="font-medium text-gray-900">{rule.rule}</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Enforcement: <span className="font-medium">{rule.enforcement}</span>
                  </p>
                  {rule.exceptions.length > 0 && (
                    <p className="text-gray-500 text-sm mt-1">
                      Exceptions: {rule.exceptions.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ChannelsTabProps {
  template: CampaignTemplate;
  selectedChannels: ChannelFormat[];
  onChannelToggle: (channel: ChannelFormat) => void;
}

const ChannelsTab: React.FC<ChannelsTabProps> = ({
  template,
  selectedChannels,
  onChannelToggle,
}) => {
  const getChannelIcon = (channel: ChannelFormat): string => {
    const icons: Record<string, string> = {
      instagram_post: '📷',
      facebook_post: '📘',
      linkedin_post: '💼',
      youtube_thumbnail: '📺',
      email: '📧',
      display_ad: '🖼️',
      app_notification: '📱',
    };
    return icons[channel] || '📱';
  };

  const getChannelName = (channel: ChannelFormat): string => {
    return channel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Channels</h3>
        <p className="text-gray-600 mb-6">
          Choose the channels where you want to deploy this campaign. Each channel will be optimized
          according to the template's specifications.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {template.channelSpecs.supportedChannels.map(channel => {
            const isSelected = selectedChannels.includes(channel);
            const priority = template.channelSpecs.channelPriority.find(p => p.channel === channel);

            return (
              <button
                key={channel}
                onClick={() => onChannelToggle(channel)}
                className={`p-4 border rounded-lg text-left hover:shadow-md transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl">{getChannelIcon(channel)}</div>
                  {priority && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        priority.priority === 'primary'
                          ? 'bg-green-100 text-green-800'
                          : priority.priority === 'secondary'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {priority.priority}
                    </span>
                  )}
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{getChannelName(channel)}</h4>
                {priority && <p className="text-gray-600 text-sm">{priority.reasoning}</p>}
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Expected Impact:</span>
                  <span className="font-medium text-gray-700">
                    {priority?.expectedImpact || 70}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedChannels.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Channel Strategy</h3>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Cross-Channel Coordination</h4>
            <p className="text-blue-800 text-sm mb-3">
              Consistency Level:{' '}
              <span className="font-medium">
                {template.channelSpecs.crossChannelStrategy.consistencyLevel}
              </span>
            </p>
            <div className="space-y-2">
              {template.channelSpecs.crossChannelStrategy.messagingAlignment.map(
                (alignment, index) => (
                  <div key={index} className="flex items-center text-sm text-blue-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                    {alignment}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface PreviewTabProps {
  template: CampaignTemplate;
  previewAssets: any[];
  selectedChannels: ChannelFormat[];
  isGenerating: boolean;
  onGeneratePreview: () => void;
}

const PreviewTab: React.FC<PreviewTabProps> = ({
  template,
  previewAssets,
  selectedChannels,
  isGenerating,
  onGeneratePreview,
}) => {
  if (previewAssets.length === 0 && !isGenerating) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">👁️</div>
        <h3 className="text-gray-600 text-lg font-medium mb-2">No Preview Generated</h3>
        <p className="text-gray-500 mb-6">
          Generate a preview to see how your customized template will look across selected channels.
        </p>
        <button
          onClick={onGeneratePreview}
          disabled={selectedChannels.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Generate Preview
        </button>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-gray-600 text-lg font-medium mb-2">Generating Preview...</h3>
        <p className="text-gray-500">
          Creating optimized assets for {selectedChannels.length} channel
          {selectedChannels.length !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preview Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {previewAssets.map(asset => (
            <div key={asset.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {asset.type === 'image' ? (
                  <img
                    src={asset.url}
                    alt={`Preview for ${asset.channel}`}
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk3YTNiNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIFByZXZpZXc8L3RleHQ+PC9zdmc+';
                    }}
                  />
                ) : (
                  <div className="text-gray-400 text-4xl">🎬</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {asset.channel
                      .replace('_', ' ')
                      .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      asset.status === 'ready'
                        ? 'bg-green-100 text-green-800'
                        : asset.status === 'generating'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {asset.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Quality Score:</span>
                    <span className="font-medium">{asset.metadata.qualityScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Brand Compliance:</span>
                    <span className="font-medium">{asset.metadata.brandCompliance}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
