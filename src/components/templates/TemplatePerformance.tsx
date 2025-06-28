/**
 * 📊 Template Performance Tracking Component
 *
 * Comprehensive template effectiveness tracking and optimization recommendations
 * for campaign templates with real-time analytics and insights.
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { CampaignTemplate, CampaignTemplateType, ChannelFormat } from '../../types';

interface TemplatePerformanceProps {
  templateId?: string;
  showComparison?: boolean;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  benchmark: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
}

interface ChannelPerformance {
  channel: ChannelFormat;
  metrics: PerformanceMetric[];
  roi: number;
  engagement: number;
  conversion: number;
  reach: number;
}

interface OptimizationRecommendation {
  id: string;
  type: 'critical' | 'important' | 'suggested';
  category: 'messaging' | 'visual' | 'targeting' | 'timing' | 'channels';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  expectedImprovement: string;
  actionItems: string[];
}

export const TemplatePerformance: React.FC<TemplatePerformanceProps> = ({
  templateId,
  showComparison = false,
  timeRange = 'month',
}) => {
  const {
    availableTemplates,
    templatePerformanceData,
    templateUsageHistory,
    getTemplatePerformanceInsights,
  } = useAppStore();

  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'optimization' | 'history'>(
    'overview'
  );
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localTimeRange, setTimeRange] = useState(timeRange);

  useEffect(() => {
    if (templateId) {
      const template = availableTemplates.find(t => t.id === templateId);
      setSelectedTemplate(template || null);
    }
  }, [templateId, availableTemplates]);

  useEffect(() => {
    if (selectedTemplate) {
      loadPerformanceData();
    }
  }, [selectedTemplate, localTimeRange]);

  const loadPerformanceData = async () => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    try {
      const insights = getTemplatePerformanceInsights(selectedTemplate.id);
      setPerformanceData(insights);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricColor = (status: string): string => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-50';
      case 'good':
        return 'text-blue-600 bg-blue-50';
      case 'average':
        return 'text-yellow-600 bg-yellow-50';
      case 'poor':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '📊';
    }
  };

  const getRecommendationIcon = (type: string): string => {
    switch (type) {
      case 'critical':
        return '🚨';
      case 'important':
        return '⚠️';
      case 'suggested':
        return '💡';
      default:
        return '📝';
    }
  };

  const getRecommendationColor = (type: string): string => {
    switch (type) {
      case 'critical':
        return 'border-red-300 bg-red-50';
      case 'important':
        return 'border-yellow-300 bg-yellow-50';
      case 'suggested':
        return 'border-blue-300 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  // Mock data for demonstration
  const mockMetrics: PerformanceMetric[] = [
    {
      name: 'Overall ROI',
      value: 2.4,
      unit: 'x',
      change: 12,
      trend: 'up',
      benchmark: 2.1,
      status: 'good',
    },
    {
      name: 'Engagement Rate',
      value: 4.2,
      unit: '%',
      change: -5,
      trend: 'down',
      benchmark: 3.8,
      status: 'good',
    },
    {
      name: 'Conversion Rate',
      value: 3.1,
      unit: '%',
      change: 8,
      trend: 'up',
      benchmark: 2.8,
      status: 'excellent',
    },
    {
      name: 'Reach',
      value: 125000,
      unit: '',
      change: 15,
      trend: 'up',
      benchmark: 110000,
      status: 'excellent',
    },
  ];

  const mockChannelPerformance: ChannelPerformance[] = [
    {
      channel: 'instagram_post',
      metrics: mockMetrics,
      roi: 2.8,
      engagement: 5.1,
      conversion: 3.5,
      reach: 45000,
    },
    {
      channel: 'facebook_post',
      metrics: mockMetrics,
      roi: 2.2,
      engagement: 3.8,
      conversion: 2.9,
      reach: 38000,
    },
    {
      channel: 'linkedin_post',
      metrics: mockMetrics,
      roi: 1.9,
      engagement: 2.4,
      conversion: 2.1,
      reach: 22000,
    },
  ];

  const mockRecommendations: OptimizationRecommendation[] = [
    {
      id: 'rec_1',
      type: 'important',
      category: 'messaging',
      title: 'Strengthen Call-to-Action',
      description:
        'Current CTAs are performing below benchmark. Consider more action-oriented language.',
      impact: 'high',
      effort: 'low',
      expectedImprovement: '15-20% conversion increase',
      actionItems: [
        'Use stronger action verbs (Get, Claim, Discover)',
        'Add urgency indicators (Limited time, Today only)',
        'Test button colors and placement',
      ],
    },
    {
      id: 'rec_2',
      type: 'suggested',
      category: 'visual',
      title: 'Optimize Visual Hierarchy',
      description:
        'Eye-tracking data suggests users miss key information due to visual hierarchy issues.',
      impact: 'medium',
      effort: 'medium',
      expectedImprovement: '10-15% engagement increase',
      actionItems: [
        'Increase contrast for primary elements',
        'Reduce visual clutter in secondary areas',
        'Test different layout compositions',
      ],
    },
    {
      id: 'rec_3',
      type: 'critical',
      category: 'targeting',
      title: 'Refine Audience Targeting',
      description: 'High reach but low conversion suggests targeting misalignment.',
      impact: 'high',
      effort: 'high',
      expectedImprovement: '25-30% ROI improvement',
      actionItems: [
        'Analyze high-converting audience segments',
        'Create lookalike audiences from converters',
        'Exclude low-performing demographics',
      ],
    },
  ];

  if (!selectedTemplate && !templateId) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Template Performance</h2>
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-gray-600 text-lg font-medium">Select a Template</h3>
          <p className="text-gray-500 mt-2">
            Choose a template to view its performance analytics and optimization recommendations.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {availableTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all text-left"
              >
                <div className="text-2xl mb-2">
                  {template.type === 'launch' && '🚀'}
                  {template.type === 'promotional' && '🎯'}
                  {template.type === 'brand_building' && '💎'}
                  {template.type === 'retention_loyalty' && '🤝'}
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
                <p className="text-sm text-gray-600">{template.metadata.usageCount} uses</p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-yellow-500">⭐</span>
                  <span className="ml-1 text-gray-700">
                    {template.metadata.averageRating.toFixed(1)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading performance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Template Performance</h2>
          {selectedTemplate && (
            <p className="text-gray-600 mt-1">
              {selectedTemplate.name} • {localTimeRange} view
            </p>
          )}
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Time Range:</label>
          <select
            value={localTimeRange}
            onChange={e => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'channels', label: 'Channel Performance', icon: '📱' },
            { id: 'optimization', label: 'Optimization', icon: '🎯' },
            { id: 'history', label: 'Usage History', icon: '📈' },
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
        {activeTab === 'overview' && <OverviewTab metrics={mockMetrics} />}

        {activeTab === 'channels' && <ChannelsTab channelPerformance={mockChannelPerformance} />}

        {activeTab === 'optimization' && (
          <OptimizationTab
            recommendations={mockRecommendations}
            getRecommendationIcon={getRecommendationIcon}
            getRecommendationColor={getRecommendationColor}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            template={selectedTemplate}
            usageHistory={templateUsageHistory[selectedTemplate?.id || ''] || []}
          />
        )}
      </div>
    </div>
  );
};

// Tab Components

interface OverviewTabProps {
  metrics: PerformanceMetric[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ metrics }) => {
  const getMetricColor = (status: string): string => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-50';
      case 'good':
        return 'text-blue-600 bg-blue-50';
      case 'average':
        return 'text-yellow-600 bg-yellow-50';
      case 'poor':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '📊';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map(metric => (
          <div key={metric.name} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getMetricColor(metric.status)}`}
              >
                {metric.status}
              </span>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl font-bold text-gray-900">
                {metric.value.toLocaleString()}
                {metric.unit}
              </span>
              <span className="text-lg">{getTrendIcon(metric.trend)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span
                className={`font-medium ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {metric.change >= 0 ? '+' : ''}
                {metric.change}%
              </span>
              <span className="text-gray-500">
                vs {metric.benchmark.toLocaleString()}
                {metric.unit} benchmark
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Trend</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-2">📈</div>
            <p className="text-gray-600">Performance chart would be displayed here</p>
            <p className="text-gray-500 text-sm">Integration with analytics platform required</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ChannelsTabProps {
  channelPerformance: ChannelPerformance[];
}

const ChannelsTab: React.FC<ChannelsTabProps> = ({ channelPerformance }) => {
  const getChannelIcon = (channel: ChannelFormat): string => {
    const icons: Record<string, string> = {
      instagram_post: '📷',
      facebook_post: '📘',
      linkedin_post: '💼',
      youtube_thumbnail: '📺',
    };
    return icons[channel] || '📱';
  };

  const getChannelName = (channel: ChannelFormat): string => {
    return channel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Channel Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {channelPerformance.map(channel => (
          <div key={channel.channel} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-2xl">{getChannelIcon(channel.channel)}</div>
              <div>
                <h3 className="font-medium text-gray-900">{getChannelName(channel.channel)}</h3>
                <p className="text-sm text-gray-600">Channel Performance</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ROI</span>
                <span className="font-medium text-gray-900">{channel.roi}x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Engagement</span>
                <span className="font-medium text-gray-900">{channel.engagement}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conversion</span>
                <span className="font-medium text-gray-900">{channel.conversion}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Reach</span>
                <span className="font-medium text-gray-900">{channel.reach.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Channel Comparison Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Channel Comparison</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-2">📊</div>
            <p className="text-gray-600">Channel comparison chart would be displayed here</p>
            <p className="text-gray-500 text-sm">
              ROI, engagement, and conversion comparison across channels
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface OptimizationTabProps {
  recommendations: OptimizationRecommendation[];
  getRecommendationIcon: (type: string) => string;
  getRecommendationColor: (type: string) => string;
}

const OptimizationTab: React.FC<OptimizationTabProps> = ({
  recommendations,
  getRecommendationIcon,
  getRecommendationColor,
}) => {
  const getImpactColor = (impact: string): string => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getEffortColor = (effort: string): string => {
    switch (effort) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Optimization Score */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Optimization Score</h3>
          <span className="text-3xl font-bold text-blue-600">78/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div className="bg-blue-600 h-3 rounded-full" style={{ width: '78%' }}></div>
        </div>
        <p className="text-gray-600 text-sm">
          Your template is performing well but has room for improvement. Focus on the critical
          recommendations below.
        </p>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        {recommendations.map(rec => (
          <div key={rec.id} className={`border rounded-lg p-6 ${getRecommendationColor(rec.type)}`}>
            <div className="flex items-start space-x-4">
              <div className="text-2xl">{getRecommendationIcon(rec.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(rec.impact)}`}
                    >
                      {rec.impact} impact
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getEffortColor(rec.effort)}`}
                    >
                      {rec.effort} effort
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{rec.description}</p>
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-900">Expected Improvement: </span>
                  <span className="text-sm text-green-600 font-medium">
                    {rec.expectedImprovement}
                  </span>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Action Items:</h5>
                  <ul className="space-y-1">
                    {rec.actionItems.map((item, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <span className="text-blue-500 mr-2">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface HistoryTabProps {
  template: CampaignTemplate | null;
  usageHistory: any[];
}

const HistoryTab: React.FC<HistoryTabProps> = ({ template, usageHistory }) => {
  return (
    <div className="space-y-6">
      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Uses</h3>
          <span className="text-2xl font-bold text-gray-900">
            {template?.metadata.usageCount || 0}
          </span>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Average Rating</h3>
          <span className="text-2xl font-bold text-gray-900">
            {template?.metadata.averageRating.toFixed(1) || 'N/A'}
          </span>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Success Rate</h3>
          <span className="text-2xl font-bold text-gray-900">78%</span>
        </div>
      </div>

      {/* Usage Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Timeline</h3>
        {usageHistory.length > 0 ? (
          <div className="space-y-4">
            {usageHistory.slice(0, 10).map((usage, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-900">Campaign Generated</p>
                  <p className="text-sm text-gray-600">
                    {usage.channels?.join(', ') || 'Multiple channels'} •{' '}
                    {usage.customizations?.length || 0} customizations
                  </p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(usage.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📈</div>
            <p className="text-gray-600">No usage history available</p>
            <p className="text-gray-500 text-sm">
              Usage data will appear here as the template is used
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
