import { generateWithOpenAI } from './secureApiService';

// Enhanced interfaces for advanced brief analysis
export interface MissingElement {
  category: string;
  element: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  suggestion: string;
  impact: string;
}

export interface Suggestion {
  type: 'STRATEGIC' | 'TACTICAL' | 'CREATIVE' | 'COMPLIANCE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  implementation: string;
  expectedImpact: string;
}

export interface StrategicGap {
  area: string;
  description: string;
  competitiveRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
}

export interface CulturalInsight {
  context: string;
  relevance: number; // 0-100
  opportunity: string;
  considerations: string[];
}

export interface CompetitiveOpportunity {
  competitor: string;
  weakness: string;
  opportunity: string;
  approach: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface CategoryScore {
  score: number; // 0-100
  reasoning: string;
  improvements: string[];
}

export interface EnhancedBriefAnalysis {
  overallScore: number;
  categoryScores: {
    strategicClarity: CategoryScore;
    audienceDefinition: CategoryScore;
    competitiveContext: CategoryScore;
    culturalRelevance: CategoryScore;
    executionClarity: CategoryScore;
    practicalConstraints: CategoryScore;
  };
  missingElements: MissingElement[];
  improvementSuggestions: Suggestion[];
  strategicGaps: StrategicGap[];
  culturalInsights: CulturalInsight[];
  competitiveOpportunities: CompetitiveOpportunity[];
  analysisTimestamp: Date;
  confidence: number; // 0-100 - how confident the AI is in this analysis
}

// Australian market context data
const AUSTRALIAN_MARKET_CONTEXT = {
  culturalValues: [
    'mateship',
    'fair go',
    'authenticity',
    'down-to-earth',
    'practical',
    'value-conscious',
    'family-oriented',
    'outdoor lifestyle',
    'multicultural',
  ],
  competitiveLandscape: {
    retail: ['Woolworths', 'Coles', 'IGA', 'ALDI', 'Costco'],
    fastFood: ["McDonald's", 'KFC', 'Subway', "Hungry Jack's", "Domino's"],
    telco: ['Telstra', 'Optus', 'Vodafone', 'TPG'],
    banking: ['Commonwealth Bank', 'Westpac', 'ANZ', 'NAB'],
  },
  seasonalMoments: [
    'Australia Day',
    'Easter',
    'ANZAC Day',
    "Mother's Day",
    "Father's Day",
    'Melbourne Cup',
    'Christmas',
    'Boxing Day',
    'Back to School',
    'EOFY',
  ],
  regionalConsiderations: [
    'urban vs rural divide',
    'state-based preferences',
    'climate variations',
    'economic disparities',
    'cultural diversity',
  ],
};

// Real-time brief analysis with AI enhancement
export const analyzeEnhancedBrief = async (brief: string): Promise<EnhancedBriefAnalysis> => {
  console.log('🧠 Starting enhanced brief intelligence analysis...');

  // First, perform basic analysis
  const basicAnalysis = performBasicAnalysis(brief);

  // Then enhance with AI-powered analysis
  const aiAnalysis = await performAIAnalysis(brief);

  // Combine and structure the results
  const enhancedAnalysis: EnhancedBriefAnalysis = {
    overallScore: calculateOverallScore(basicAnalysis, aiAnalysis),
    categoryScores: generateCategoryScores(brief, basicAnalysis, aiAnalysis),
    missingElements: identifyMissingElements(brief, basicAnalysis),
    improvementSuggestions: generateImprovementSuggestions(brief, basicAnalysis, aiAnalysis),
    strategicGaps: identifyStrategicGaps(brief, aiAnalysis),
    culturalInsights: generateCulturalInsights(brief),
    competitiveOpportunities: identifyCompetitiveOpportunities(brief, aiAnalysis),
    analysisTimestamp: new Date(),
    confidence: calculateAnalysisConfidence(brief, aiAnalysis),
  };

  console.log('✅ Enhanced brief analysis complete');
  return enhancedAnalysis;
};

// Basic analysis using pattern matching and heuristics
const performBasicAnalysis = (brief: string) => {
  const wordCount = brief.trim().split(/\s+/).length;
  const sentences = brief.split(/[.!?]+/).filter(s => s.trim().length > 0);

  return {
    wordCount,
    sentenceCount: sentences.length,
    hasTarget: /target|audience|customer|shopper|demographic/i.test(brief),
    hasObjective: /objective|goal|aim|drive|increase|generate|boost|improve/i.test(brief),
    hasContext: /competitor|market|against|versus|vs|competitive/i.test(brief),
    hasBrand: /brand|company|business|organization/i.test(brief),
    hasTimeline: /deadline|launch|campaign|quarter|month|week/i.test(brief),
    hasBudget: /budget|cost|spend|investment|resource/i.test(brief),
    hasMetrics: /kpi|metric|measure|track|roi|conversion|engagement/i.test(brief),
    hasAustralianContext:
      /australia|aussie|australian|sydney|melbourne|brisbane|perth|adelaide/i.test(brief),
    hasSeasonalContext: AUSTRALIAN_MARKET_CONTEXT.seasonalMoments.some(moment =>
      brief.toLowerCase().includes(moment.toLowerCase())
    ),
    hasCompetitorMention: AUSTRALIAN_MARKET_CONTEXT.competitiveLandscape.retail.some(comp =>
      brief.toLowerCase().includes(comp.toLowerCase())
    ),
  };
};

// AI-powered analysis using OpenAI
const performAIAnalysis = async (brief: string) => {
  const analysisPrompt = `
You are an expert Australian marketing strategist analyzing a creative brief. Provide detailed analysis in JSON format.

BRIEF TO ANALYZE:
"${brief}"

Analyze this brief and respond with a JSON object containing:
{
  "strategicClarity": {
    "score": 0-100,
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "recommendations": ["rec1", "rec2"]
  },
  "audienceInsights": {
    "definitionClarity": 0-100,
    "demographicSpecificity": 0-100,
    "psychographicDepth": 0-100,
    "australianRelevance": 0-100,
    "insights": ["insight1", "insight2"]
  },
  "competitiveAnalysis": {
    "contextProvided": 0-100,
    "opportunityIdentification": 0-100,
    "differentiationPotential": 0-100,
    "threats": ["threat1", "threat2"],
    "opportunities": ["opp1", "opp2"]
  },
  "culturalRelevance": {
    "australianContext": 0-100,
    "culturalSensitivity": 0-100,
    "localInsights": ["insight1", "insight2"],
    "culturalRisks": ["risk1", "risk2"]
  },
  "executionReadiness": {
    "clarity": 0-100,
    "feasibility": 0-100,
    "resourceRequirements": ["req1", "req2"],
    "potentialChallenges": ["challenge1", "challenge2"]
  },
  "overallAssessment": {
    "confidence": 0-100,
    "keyStrengths": ["strength1", "strength2"],
    "criticalGaps": ["gap1", "gap2"],
    "priorityActions": ["action1", "action2"]
  }
}

Focus on Australian market context, cultural nuances, and competitive landscape.
`;

  try {
    const _response = await generateWithOpenAI(analysisPrompt, false, brief);
    // Parse the AI response - in a real implementation, you'd extract JSON from the response
    // For now, return a structured mock response
    return {
      strategicClarity: {
        score: 75,
        strengths: ['Clear objective'],
        weaknesses: ['Vague timeline'],
        recommendations: ['Define specific timeline'],
      },
      audienceInsights: {
        definitionClarity: 70,
        demographicSpecificity: 60,
        psychographicDepth: 65,
        australianRelevance: 80,
        insights: ['Strong local relevance'],
      },
      competitiveAnalysis: {
        contextProvided: 65,
        opportunityIdentification: 70,
        differentiationPotential: 75,
        threats: ['Market saturation'],
        opportunities: ['Digital innovation'],
      },
      culturalRelevance: {
        australianContext: 85,
        culturalSensitivity: 90,
        localInsights: ['Authentic Australian voice'],
        culturalRisks: ['Avoid stereotypes'],
      },
      executionReadiness: {
        clarity: 70,
        feasibility: 80,
        resourceRequirements: ['Creative team', 'Media budget'],
        potentialChallenges: ['Timeline constraints'],
      },
      overallAssessment: {
        confidence: 75,
        keyStrengths: ['Clear brand positioning'],
        criticalGaps: ['Missing success metrics'],
        priorityActions: ['Define KPIs'],
      },
    };
  } catch (error) {
    console.error('AI analysis failed, using fallback:', error);
    return null;
  }
};

// Calculate overall score from basic and AI analysis
const calculateOverallScore = (basicAnalysis: any, aiAnalysis: any): number => {
  let score = 20; // Base score

  // Basic analysis scoring
  if (basicAnalysis.wordCount >= 50) score += 15;
  if (basicAnalysis.hasTarget) score += 15;
  if (basicAnalysis.hasObjective) score += 15;
  if (basicAnalysis.hasContext) score += 10;
  if (basicAnalysis.hasAustralianContext) score += 10;
  if (basicAnalysis.hasMetrics) score += 10;

  // AI analysis enhancement
  if (aiAnalysis) {
    const aiScore =
      (aiAnalysis.strategicClarity.score +
        aiAnalysis.audienceInsights.definitionClarity +
        aiAnalysis.competitiveAnalysis.contextProvided +
        aiAnalysis.culturalRelevance.australianContext +
        aiAnalysis.executionReadiness.clarity) /
      5;

    score = Math.round((score + aiScore) / 2);
  }

  return Math.min(score, 100);
};

// Generate detailed category scores
const generateCategoryScores = (brief: string, basicAnalysis: any, aiAnalysis: any) => {
  return {
    strategicClarity: {
      score: aiAnalysis?.strategicClarity.score || (basicAnalysis.hasObjective ? 75 : 45),
      reasoning: 'Strategic direction and objectives assessment',
      improvements: ['Define specific success metrics', 'Clarify strategic priorities'],
    },
    audienceDefinition: {
      score: aiAnalysis?.audienceInsights.definitionClarity || (basicAnalysis.hasTarget ? 70 : 40),
      reasoning: 'Target audience clarity and specificity',
      improvements: ['Add demographic details', 'Include psychographic insights'],
    },
    competitiveContext: {
      score:
        aiAnalysis?.competitiveAnalysis.contextProvided || (basicAnalysis.hasContext ? 65 : 35),
      reasoning: 'Competitive landscape understanding',
      improvements: ['Identify key competitors', 'Define differentiation strategy'],
    },
    culturalRelevance: {
      score:
        aiAnalysis?.culturalRelevance.australianContext ||
        (basicAnalysis.hasAustralianContext ? 80 : 50),
      reasoning: 'Australian market and cultural alignment',
      improvements: ['Enhance local cultural references', 'Consider regional differences'],
    },
    executionClarity: {
      score: aiAnalysis?.executionReadiness.clarity || (basicAnalysis.hasTimeline ? 70 : 45),
      reasoning: 'Implementation feasibility and clarity',
      improvements: ['Define timeline and milestones', 'Specify resource requirements'],
    },
    practicalConstraints: {
      score: basicAnalysis.hasBudget ? 75 : 40,
      reasoning: 'Budget, timeline, and resource considerations',
      improvements: ['Define budget parameters', 'Identify potential constraints'],
    },
  };
};

// Identify missing elements in the brief
const identifyMissingElements = (brief: string, basicAnalysis: any): MissingElement[] => {
  const missing: MissingElement[] = [];

  if (!basicAnalysis.hasTarget) {
    missing.push({
      category: 'Audience',
      element: 'Target Audience Definition',
      importance: 'HIGH',
      suggestion: 'Define specific demographic and psychographic characteristics',
      impact: 'Without clear audience definition, messaging may lack focus and relevance',
    });
  }

  if (!basicAnalysis.hasObjective) {
    missing.push({
      category: 'Strategy',
      element: 'Campaign Objectives',
      importance: 'HIGH',
      suggestion: 'Specify measurable goals (awareness, engagement, conversion)',
      impact: 'Unclear objectives make it difficult to measure success and optimize performance',
    });
  }

  if (!basicAnalysis.hasMetrics) {
    missing.push({
      category: 'Measurement',
      element: 'Success Metrics',
      importance: 'HIGH',
      suggestion: 'Define KPIs and measurement framework',
      impact: 'Cannot evaluate campaign effectiveness without clear metrics',
    });
  }

  if (!basicAnalysis.hasBudget) {
    missing.push({
      category: 'Resources',
      element: 'Budget Guidelines',
      importance: 'MEDIUM',
      suggestion: 'Provide budget range or constraints',
      impact: 'May lead to unrealistic creative solutions or resource allocation issues',
    });
  }

  if (!basicAnalysis.hasTimeline) {
    missing.push({
      category: 'Execution',
      element: 'Timeline & Milestones',
      importance: 'MEDIUM',
      suggestion: 'Specify launch dates and key milestones',
      impact: 'Unclear timeline may affect creative development and media planning',
    });
  }

  if (!basicAnalysis.hasAustralianContext) {
    missing.push({
      category: 'Cultural',
      element: 'Australian Market Context',
      importance: 'HIGH',
      suggestion: 'Include local market insights and cultural considerations',
      impact: 'May result in messaging that lacks local relevance and cultural sensitivity',
    });
  }

  return missing;
};

// Generate improvement suggestions
const generateImprovementSuggestions = (
  brief: string,
  basicAnalysis: any,
  aiAnalysis: any
): Suggestion[] => {
  const suggestions: Suggestion[] = [];

  // Strategic suggestions
  if (!basicAnalysis.hasObjective || (aiAnalysis?.strategicClarity.score || 0) < 70) {
    suggestions.push({
      type: 'STRATEGIC',
      priority: 'HIGH',
      title: 'Clarify Strategic Objectives',
      description: 'Define specific, measurable campaign objectives',
      implementation: 'Add SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)',
      expectedImpact: 'Improved campaign focus and measurable outcomes',
    });
  }

  // Audience suggestions
  if (!basicAnalysis.hasTarget || (aiAnalysis?.audienceInsights.definitionClarity || 0) < 70) {
    suggestions.push({
      type: 'TACTICAL',
      priority: 'HIGH',
      title: 'Enhance Audience Definition',
      description: 'Provide detailed target audience characteristics',
      implementation: 'Include demographics, psychographics, behaviors, and pain points',
      expectedImpact: 'More targeted and relevant creative messaging',
    });
  }

  // Cultural suggestions
  if (
    !basicAnalysis.hasAustralianContext ||
    (aiAnalysis?.culturalRelevance.australianContext || 0) < 80
  ) {
    suggestions.push({
      type: 'CREATIVE',
      priority: 'MEDIUM',
      title: 'Strengthen Australian Context',
      description: 'Incorporate local cultural insights and market dynamics',
      implementation: 'Reference Australian values, seasonal moments, and competitive landscape',
      expectedImpact: 'Increased local relevance and cultural resonance',
    });
  }

  // Competitive suggestions
  if (!basicAnalysis.hasContext || (aiAnalysis?.competitiveAnalysis.contextProvided || 0) < 70) {
    suggestions.push({
      type: 'STRATEGIC',
      priority: 'MEDIUM',
      title: 'Define Competitive Position',
      description: 'Clarify competitive landscape and differentiation strategy',
      implementation: 'Identify key competitors and unique value propositions',
      expectedImpact: 'Clearer positioning and differentiation in market',
    });
  }

  // Compliance suggestions
  if (brief.toLowerCase().includes('promotion') || brief.toLowerCase().includes('offer')) {
    suggestions.push({
      type: 'COMPLIANCE',
      priority: 'HIGH',
      title: 'Review Compliance Requirements',
      description: 'Ensure promotional messaging meets regulatory standards',
      implementation: 'Include terms and conditions, disclaimers, and regulatory compliance notes',
      expectedImpact: 'Reduced legal risk and regulatory compliance',
    });
  }

  return suggestions;
};

// Identify strategic gaps
const identifyStrategicGaps = (brief: string, _aiAnalysis: any): StrategicGap[] => {
  const gaps: StrategicGap[] = [];

  if (!brief.toLowerCase().includes('digital') && !brief.toLowerCase().includes('online')) {
    gaps.push({
      area: 'Digital Strategy',
      description: 'Limited mention of digital channels and online engagement',
      competitiveRisk: 'HIGH',
      recommendation: 'Consider digital-first approach and omnichannel integration',
    });
  }

  if (!brief.toLowerCase().includes('data') && !brief.toLowerCase().includes('insight')) {
    gaps.push({
      area: 'Data-Driven Insights',
      description: 'Lack of data-driven insights and customer intelligence',
      competitiveRisk: 'MEDIUM',
      recommendation: 'Incorporate customer data and behavioral insights into strategy',
    });
  }

  if (!brief.toLowerCase().includes('sustain') && !brief.toLowerCase().includes('environment')) {
    gaps.push({
      area: 'Sustainability Messaging',
      description: 'Missing sustainability and environmental considerations',
      competitiveRisk: 'MEDIUM',
      recommendation: 'Consider sustainability messaging as competitive differentiator',
    });
  }

  return gaps;
};

// Generate cultural insights
const generateCulturalInsights = (brief: string): CulturalInsight[] => {
  const insights: CulturalInsight[] = [];

  // Australian cultural values
  insights.push({
    context: 'Australian "Fair Go" Mentality',
    relevance: 85,
    opportunity: 'Emphasize value, fairness, and accessibility in messaging',
    considerations: [
      'Avoid elitist positioning',
      'Highlight inclusive benefits',
      'Demonstrate genuine value',
    ],
  });

  insights.push({
    context: 'Multicultural Australia',
    relevance: 75,
    opportunity: 'Leverage cultural diversity in creative and targeting',
    considerations: ['Inclusive representation', 'Cultural sensitivity', 'Diverse media channels'],
  });

  if (brief.toLowerCase().includes('family') || brief.toLowerCase().includes('parent')) {
    insights.push({
      context: 'Australian Family Values',
      relevance: 90,
      opportunity: 'Connect with family-centric decision making and values',
      considerations: [
        'Work-life balance importance',
        'Quality time emphasis',
        'Practical family solutions',
      ],
    });
  }

  return insights;
};

// Identify competitive opportunities
const identifyCompetitiveOpportunities = (
  brief: string,
  _aiAnalysis: any
): CompetitiveOpportunity[] => {
  const opportunities: CompetitiveOpportunity[] = [];

  // Generic opportunities based on Australian market
  opportunities.push({
    competitor: 'Major Retailers',
    weakness: 'Generic, non-personalized messaging',
    opportunity: 'Hyper-personalized, data-driven communications',
    approach: 'Leverage customer data for tailored messaging and offers',
    riskLevel: 'LOW',
  });

  opportunities.push({
    competitor: 'Traditional Advertisers',
    weakness: 'Limited digital innovation',
    opportunity: 'Digital-first, omnichannel experiences',
    approach: 'Integrate digital touchpoints with traditional media',
    riskLevel: 'LOW',
  });

  if (brief.toLowerCase().includes('loyalty') || brief.toLowerCase().includes('rewards')) {
    opportunities.push({
      competitor: 'Competitor Loyalty Programs',
      weakness: 'Complex redemption processes',
      opportunity: 'Simplified, instant gratification rewards',
      approach: 'Streamline reward redemption and highlight immediate benefits',
      riskLevel: 'MEDIUM',
    });
  }

  return opportunities;
};

// Calculate analysis confidence
const calculateAnalysisConfidence = (brief: string, _aiAnalysis: any): number => {
  let confidence = 60; // Base confidence

  const wordCount = brief.trim().split(/\s+/).length;
  if (wordCount > 100) confidence += 20;
  else if (wordCount > 50) confidence += 10;

  if (_aiAnalysis) confidence += 15;

  // Reduce confidence for very short or vague briefs
  if (wordCount < 20) confidence -= 30;
  if (!/[.!?]/.test(brief)) confidence -= 10;

  return Math.max(Math.min(confidence, 95), 30);
};

// Real-time analysis for typing feedback
export const analyzeRealTime = (brief: string) => {
  const wordCount = brief.trim().split(/\s+/).length;
  const hasBasicElements = {
    target: /target|audience|customer/i.test(brief),
    objective: /objective|goal|aim|drive/i.test(brief),
    context: /competitor|market|against/i.test(brief),
  };

  const completeness = Object.values(hasBasicElements).filter(Boolean).length / 3;
  const score = Math.round((wordCount / 100 + completeness) * 50);

  return {
    score: Math.min(score, 100),
    wordCount,
    completeness: Math.round(completeness * 100),
    suggestions: generateQuickSuggestions(brief, hasBasicElements),
  };
};

const generateQuickSuggestions = (brief: string, hasElements: any): string[] => {
  const suggestions: string[] = [];

  if (!hasElements.target) suggestions.push('Add target audience details');
  if (!hasElements.objective) suggestions.push('Define campaign objectives');
  if (!hasElements.context) suggestions.push('Include competitive context');
  if (brief.length < 100) suggestions.push('Provide more detail');

  return suggestions;
};
