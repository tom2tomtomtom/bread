import React, { useState } from 'react';
import { BriefAnalyzer, TerritoryEvolver, SmartSuggestions, EvolutionHistory } from '../generation';
import {
  EnhancedBriefAnalysis,
  TerritoryEvolution,
  EvolutionSuggestion,
  Territory,
  PerformancePrediction,
} from '../../types';

// Mock data for demonstration
const mockEnhancedAnalysis: EnhancedBriefAnalysis = {
  overallScore: 78,
  categoryScores: {
    strategicClarity: {
      score: 85,
      reasoning: 'Clear strategic direction with well-defined objectives',
      improvements: ['Add specific timeline milestones', 'Define success metrics'],
    },
    audienceDefinition: {
      score: 72,
      reasoning: 'Good audience targeting but could be more specific',
      improvements: ['Include demographic details', 'Add psychographic insights'],
    },
    competitiveContext: {
      score: 68,
      reasoning: 'Some competitive awareness but lacks depth',
      improvements: ['Identify key competitors', 'Define differentiation strategy'],
    },
    culturalRelevance: {
      score: 90,
      reasoning: 'Strong Australian cultural alignment',
      improvements: ['Consider regional differences', 'Add seasonal relevance'],
    },
    executionClarity: {
      score: 75,
      reasoning: 'Clear execution path with some gaps',
      improvements: ['Define resource requirements', 'Add timeline details'],
    },
    practicalConstraints: {
      score: 60,
      reasoning: 'Limited constraint consideration',
      improvements: ['Define budget parameters', 'Identify potential risks'],
    },
  },
  missingElements: [
    {
      category: 'Measurement',
      element: 'Success Metrics',
      importance: 'HIGH',
      suggestion: 'Define specific KPIs and measurement framework',
      impact: 'Cannot evaluate campaign effectiveness without clear metrics',
    },
    {
      category: 'Resources',
      element: 'Budget Guidelines',
      importance: 'MEDIUM',
      suggestion: 'Provide budget range or constraints',
      impact: 'May lead to unrealistic creative solutions',
    },
  ],
  improvementSuggestions: [
    {
      type: 'STRATEGIC',
      priority: 'HIGH',
      title: 'Define Success Metrics',
      description: 'Establish clear, measurable KPIs for campaign success',
      implementation:
        'Add specific metrics like brand awareness lift, engagement rates, conversion targets',
      expectedImpact: 'Improved campaign measurement and optimization capabilities',
    },
    {
      type: 'TACTICAL',
      priority: 'MEDIUM',
      title: 'Enhance Audience Segmentation',
      description: 'Provide more detailed audience characteristics',
      implementation: 'Include demographics, psychographics, and behavioral insights',
      expectedImpact: 'More targeted and relevant creative messaging',
    },
  ],
  strategicGaps: [
    {
      area: 'Digital Strategy',
      description: 'Limited mention of digital channels and online engagement',
      competitiveRisk: 'HIGH',
      recommendation: 'Consider digital-first approach and omnichannel integration',
    },
  ],
  culturalInsights: [
    {
      context: 'Australian "Fair Go" Mentality',
      relevance: 85,
      opportunity: 'Emphasize value, fairness, and accessibility in messaging',
      considerations: ['Avoid elitist positioning', 'Highlight inclusive benefits'],
    },
  ],
  competitiveOpportunities: [
    {
      competitor: 'Major Retailers',
      weakness: 'Generic, non-personalized messaging',
      opportunity: 'Hyper-personalized, data-driven communications',
      approach: 'Leverage customer data for tailored messaging',
      riskLevel: 'LOW',
    },
  ],
  analysisTimestamp: new Date(),
  confidence: 82,
};

const mockTerritory: Territory = {
  id: 'territory_1',
  title: 'Everyday Value Champions',
  positioning:
    'Position Everyday Rewards as the champion of consistent, everyday value for Australian families',
  tone: 'Warm, authentic, and genuinely helpful',
  headlines: [
    {
      text: 'Every day deserves everyday rewards',
      followUp: 'Join millions of Aussie families saving every day',
      reasoning: 'Emphasizes consistency and community',
      confidence: 85,
    },
    {
      text: 'Your everyday hero for everyday savings',
      followUp: 'Because every dollar counts in your household',
      reasoning: 'Positions as helpful and family-focused',
      confidence: 78,
    },
  ],
};

const mockEvolutionSuggestions: EvolutionSuggestion[] = [
  {
    type: 'CULTURAL_ADAPTATION',
    title: 'Strengthen Australian Context',
    description: 'Add authentic Australian cultural references and local market insights',
    expectedImpact: 'Enhanced local relevance and cultural resonance',
    confidence: 85,
    priority: 'HIGH',
    prompt: 'Adapt territory for stronger Australian cultural relevance...',
  },
  {
    type: 'TONE_SHIFT',
    title: 'Make it More Conversational',
    description: 'Shift from formal tone to more approachable, conversational messaging',
    expectedImpact: 'Increased audience engagement and relatability',
    confidence: 75,
    priority: 'MEDIUM',
    prompt: 'Transform territory to have conversational tone...',
  },
];

const mockPerformancePrediction: PerformancePrediction = {
  overallScore: 82,
  categoryScores: {
    audienceResonance: 85,
    brandAlignment: 78,
    marketFit: 88,
    creativePotential: 80,
    executionFeasibility: 84,
  },
  strengths: [
    'Strong cultural relevance and market fit',
    'Excellent brand consistency and alignment',
    'High implementation feasibility',
  ],
  weaknesses: [
    'Limited creative potential for innovation',
    'Moderate audience engagement potential',
  ],
  recommendations: [
    'Explore more creative and innovative approaches',
    'Enhance audience targeting and personalization',
  ],
  confidence: 78,
};

export const EnhancedFeaturesDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<
    'analyzer' | 'evolver' | 'suggestions' | 'history' | null
  >(null);

  const demoButtons = [
    {
      id: 'analyzer',
      title: 'Brief Analyzer',
      description: 'AI-powered brief intelligence with detailed scoring',
      icon: '🧠',
      color: 'purple',
    },
    {
      id: 'evolver',
      title: 'Territory Evolver',
      description: 'Evolve territories with AI-powered variations',
      icon: '🧬',
      color: 'blue',
    },
    {
      id: 'suggestions',
      title: 'Smart Suggestions',
      description: 'AI recommendations for territory optimization',
      icon: '🤖',
      color: 'green',
    },
    {
      id: 'history',
      title: 'Evolution History',
      description: 'Track and compare territory evolution progress',
      icon: '📜',
      color: 'orange',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      purple: 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30 text-purple-400',
      blue: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30 text-blue-400',
      green: 'bg-green-500/20 hover:bg-green-500/30 border-green-500/30 text-green-400',
      orange: 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/30 text-orange-400',
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Enhanced Brief Intelligence & Territory Evolution
          </h1>
          <p className="text-xl text-white/70 mb-8">
            Experience the next generation of AI-powered creative brief analysis and territory
            optimization
          </p>

          {/* Demo Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoButtons.map(button => (
              <button
                key={button.id}
                onClick={() => setActiveDemo(button.id as any)}
                className={`p-6 border rounded-2xl transition-all hover:scale-105 ${getColorClasses(button.color)}`}
              >
                <div className="text-4xl mb-3">{button.icon}</div>
                <h3 className="font-bold text-lg mb-2">{button.title}</h3>
                <p className="text-sm opacity-80">{button.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-white mb-3">Real-time Analysis</h3>
            <p className="text-white/70">
              Get instant feedback as you type with AI-powered brief analysis and scoring
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="text-3xl mb-4">🇦🇺</div>
            <h3 className="text-xl font-bold text-white mb-3">Australian Context</h3>
            <p className="text-white/70">
              Built-in Australian market intelligence and cultural insights for local relevance
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-3">Smart Evolution</h3>
            <p className="text-white/70">
              AI-powered territory variations with performance prediction and optimization
            </p>
          </div>
        </div>

        {/* Demo Components */}
        {activeDemo === 'analyzer' && (
          <BriefAnalyzer
            analysis={mockEnhancedAnalysis}
            isVisible={true}
            isAnalyzing={false}
            onClose={() => setActiveDemo(null)}
            onApplySuggestion={suggestion => console.log('Applied suggestion:', suggestion)}
          />
        )}

        {activeDemo === 'evolver' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <TerritoryEvolver
              territory={mockTerritory}
              suggestions={mockEvolutionSuggestions}
              evolutions={[]}
              performancePrediction={mockPerformancePrediction}
              isEvolving={false}
              onEvolveTerritoryWithAI={suggestion => console.log('Evolving with:', suggestion)}
              onGenerateSuggestions={() => console.log('Generating suggestions')}
              onPredictPerformance={() => console.log('Predicting performance')}
              onClose={() => setActiveDemo(null)}
            />
          </div>
        )}

        {activeDemo === 'suggestions' && (
          <SmartSuggestions
            territories={[mockTerritory]}
            suggestions={mockEvolutionSuggestions}
            isVisible={true}
            onApplySuggestion={(territoryId, suggestion) =>
              console.log('Applying suggestion:', suggestion)
            }
            onGenerateSuggestions={() => console.log('Generating suggestions')}
            onClose={() => setActiveDemo(null)}
          />
        )}

        {activeDemo === 'history' && (
          <EvolutionHistory
            territories={[mockTerritory]}
            evolutions={{}}
            isVisible={true}
            onClose={() => setActiveDemo(null)}
            onApplyEvolution={evolution => console.log('Applying evolution:', evolution)}
            onCompareEvolutions={(e1, e2) => console.log('Comparing:', e1, e2)}
          />
        )}

        {/* Instructions */}
        {!activeDemo && (
          <div className="text-center">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Explore?</h2>
            <p className="text-white/70 text-lg">
              Click on any feature above to see it in action with sample data
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
