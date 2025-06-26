import { Territory, Headline } from '../types';
import { generateWithOpenAI } from './secureApiService';

// Evolution types and interfaces
export type EvolutionType =
  | 'TONE_SHIFT'
  | 'AUDIENCE_PIVOT'
  | 'COMPETITIVE_RESPONSE'
  | 'CULTURAL_ADAPTATION'
  | 'SEASONAL_OPTIMIZATION'
  | 'PERFORMANCE_ENHANCEMENT'
  | 'CREATIVE_EXPLORATION'
  | 'COMPLIANCE_ADJUSTMENT';

export interface TerritoryEvolution {
  id: string;
  originalTerritoryId: string;
  evolutionType: EvolutionType;
  evolutionPrompt: string;
  resultingTerritory: Territory;
  improvementScore: number; // 0-100
  evolutionReasoning: string;
  timestamp: Date;
  parentEvolutionId?: string; // For evolution chains
  metadata: {
    briefContext: string;
    targetAudience?: string;
    competitiveContext?: string;
    culturalContext?: string;
  };
}

export interface EvolutionSuggestion {
  type: EvolutionType;
  title: string;
  description: string;
  expectedImpact: string;
  confidence: number; // 0-100
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  prompt: string;
}

export interface EvolutionHistory {
  territoryId: string;
  evolutions: TerritoryEvolution[];
  bestPerformingEvolution?: TerritoryEvolution;
  evolutionTree: EvolutionNode[];
}

export interface EvolutionNode {
  evolution: TerritoryEvolution;
  children: EvolutionNode[];
  performance: {
    score: number;
    reasoning: string;
    metrics: { [key: string]: number };
  };
}

export interface PerformancePrediction {
  overallScore: number; // 0-100
  categoryScores: {
    audienceResonance: number;
    brandAlignment: number;
    marketFit: number;
    creativePotential: number;
    executionFeasibility: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  confidence: number;
}

// Evolution prompt templates
const EVOLUTION_PROMPTS = {
  TONE_SHIFT: {
    template: `Transform the following territory to have a {targetTone} tone while maintaining core messaging:
Original Territory: {territory}
Target Tone: {targetTone}
Brief Context: {briefContext}

Create a new territory with the same strategic positioning but adjusted tone. Maintain brand consistency while making the messaging more {targetTone}.`,
    variations: [
      'playful',
      'serious',
      'urgent',
      'aspirational',
      'conversational',
      'authoritative',
      'empathetic',
      'bold',
    ],
  },

  AUDIENCE_PIVOT: {
    template: `Adapt the following territory for a {targetAudience} audience:
Original Territory: {territory}
New Target Audience: {targetAudience}
Brief Context: {briefContext}

Modify the messaging, tone, and headlines to better resonate with {targetAudience} while keeping the core value proposition.`,
    variations: [
      'young families',
      'busy professionals',
      'retirees',
      'students',
      'small business owners',
      'health-conscious consumers',
    ],
  },

  COMPETITIVE_RESPONSE: {
    template: `Evolve this territory to better compete against {competitor}:
Original Territory: {territory}
Competitor Context: {competitor}
Brief Context: {briefContext}

Strengthen the territory's competitive positioning and differentiation against {competitor}. Highlight unique advantages and address competitive threats.`,
    variations: [
      'price leaders',
      'premium brands',
      'convenience players',
      'innovation leaders',
      'local competitors',
    ],
  },

  CULTURAL_ADAPTATION: {
    template: `Adapt this territory for stronger Australian cultural relevance:
Original Territory: {territory}
Cultural Context: {culturalContext}
Brief Context: {briefContext}

Enhance the territory with authentic Australian cultural references, values, and local market insights. Make it more culturally resonant for Australian audiences.`,
    variations: [
      'mateship values',
      'fair go mentality',
      'outdoor lifestyle',
      'multicultural celebration',
      'regional diversity',
    ],
  },

  SEASONAL_OPTIMIZATION: {
    template: `Optimize this territory for {season} relevance:
Original Territory: {territory}
Seasonal Context: {season}
Brief Context: {briefContext}

Adapt the messaging and headlines to be more relevant for {season}. Consider seasonal behaviors, needs, and cultural moments.`,
    variations: [
      'summer holidays',
      'back to school',
      'Christmas',
      'EOFY',
      "Mother's Day",
      "Father's Day",
      'Australia Day',
    ],
  },

  PERFORMANCE_ENHANCEMENT: {
    template: `Enhance this territory for better performance based on these insights:
Original Territory: {territory}
Performance Insights: {insights}
Brief Context: {briefContext}

Improve the territory's effectiveness by addressing performance gaps and amplifying successful elements. Focus on measurable improvements.`,
    variations: [
      'engagement optimization',
      'conversion focus',
      'awareness building',
      'brand recall',
      'emotional connection',
    ],
  },
};

// Generate evolution suggestions for a territory
export const generateEvolutionSuggestions = async (
  territory: Territory,
  briefContext: string,
  _performanceData?: any
): Promise<EvolutionSuggestion[]> => {
  console.log('🔄 Generating evolution suggestions for territory:', territory.id);

  const suggestions: EvolutionSuggestion[] = [];

  // Analyze territory for improvement opportunities
  const _analysisPrompt = `
Analyze this creative territory and suggest 5 specific evolution opportunities:

TERRITORY:
Title: ${territory.title}
Positioning: ${territory.positioning}
Tone: ${territory.tone}
Headlines: ${territory.headlines.map(h => h.text).join(', ')}

BRIEF CONTEXT:
${briefContext}

For each suggestion, provide:
1. Evolution type (TONE_SHIFT, AUDIENCE_PIVOT, COMPETITIVE_RESPONSE, CULTURAL_ADAPTATION, SEASONAL_OPTIMIZATION, PERFORMANCE_ENHANCEMENT)
2. Specific improvement opportunity
3. Expected impact
4. Implementation approach

Respond in JSON format with an array of suggestions.
`;

  try {
    // In a real implementation, this would parse AI response
    // For now, generating structured suggestions based on territory analysis

    // Tone evolution suggestions
    if (
      territory.tone.toLowerCase().includes('serious') ||
      territory.tone.toLowerCase().includes('formal')
    ) {
      suggestions.push({
        type: 'TONE_SHIFT',
        title: 'Make it More Conversational',
        description: 'Shift from formal tone to more approachable, conversational messaging',
        expectedImpact: 'Increased audience engagement and relatability',
        confidence: 75,
        priority: 'MEDIUM',
        prompt: EVOLUTION_PROMPTS.TONE_SHIFT.template
          .replace('{targetTone}', 'conversational')
          .replace('{territory}', JSON.stringify(territory))
          .replace('{briefContext}', briefContext),
      });
    }

    // Cultural adaptation suggestions
    if (
      !territory.positioning.toLowerCase().includes('australia') &&
      !territory.positioning.toLowerCase().includes('aussie')
    ) {
      suggestions.push({
        type: 'CULTURAL_ADAPTATION',
        title: 'Strengthen Australian Context',
        description: 'Add authentic Australian cultural references and local market insights',
        expectedImpact: 'Enhanced local relevance and cultural resonance',
        confidence: 85,
        priority: 'HIGH',
        prompt: EVOLUTION_PROMPTS.CULTURAL_ADAPTATION.template
          .replace('{culturalContext}', 'authentic Australian values and lifestyle')
          .replace('{territory}', JSON.stringify(territory))
          .replace('{briefContext}', briefContext),
      });
    }

    // Performance enhancement suggestions
    if (territory.headlines.length < 3) {
      suggestions.push({
        type: 'PERFORMANCE_ENHANCEMENT',
        title: 'Expand Creative Options',
        description: 'Generate additional headline variations for better testing and optimization',
        expectedImpact: 'More creative options for A/B testing and performance optimization',
        confidence: 80,
        priority: 'MEDIUM',
        prompt: EVOLUTION_PROMPTS.PERFORMANCE_ENHANCEMENT.template
          .replace('{insights}', 'need for more creative variations and testing options')
          .replace('{territory}', JSON.stringify(territory))
          .replace('{briefContext}', briefContext),
      });
    }

    // Competitive response suggestions
    if (
      briefContext.toLowerCase().includes('competitor') ||
      briefContext.toLowerCase().includes('vs')
    ) {
      suggestions.push({
        type: 'COMPETITIVE_RESPONSE',
        title: 'Strengthen Competitive Position',
        description: 'Enhance differentiation and competitive advantages in messaging',
        expectedImpact: 'Clearer competitive positioning and unique value proposition',
        confidence: 70,
        priority: 'HIGH',
        prompt: EVOLUTION_PROMPTS.COMPETITIVE_RESPONSE.template
          .replace('{competitor}', 'key market competitors')
          .replace('{territory}', JSON.stringify(territory))
          .replace('{briefContext}', briefContext),
      });
    }

    // Audience pivot suggestions
    suggestions.push({
      type: 'AUDIENCE_PIVOT',
      title: 'Optimize for Busy Families',
      description: 'Adapt messaging specifically for time-pressed family decision makers',
      expectedImpact: 'Better resonance with key Australian demographic segment',
      confidence: 75,
      priority: 'MEDIUM',
      prompt: EVOLUTION_PROMPTS.AUDIENCE_PIVOT.template
        .replace('{targetAudience}', 'busy families with children')
        .replace('{territory}', JSON.stringify(territory))
        .replace('{briefContext}', briefContext),
    });
  } catch (error) {
    console.error('Error generating evolution suggestions:', error);
  }

  return suggestions.slice(0, 5); // Return top 5 suggestions
};

// Execute territory evolution
export const evolveTerritoryWithAI = async (
  originalTerritory: Territory,
  evolutionType: EvolutionType,
  evolutionPrompt: string,
  briefContext: string,
  metadata: any = {}
): Promise<TerritoryEvolution> => {
  console.log('🧬 Evolving territory:', originalTerritory.id, 'Type:', evolutionType);

  try {
    // Generate evolved territory using AI
    const _response = await generateWithOpenAI(evolutionPrompt, false, briefContext);

    // In a real implementation, parse the AI response to extract the new territory
    // For now, creating a mock evolved territory
    const evolvedTerritory: Territory = {
      id: `evolved_${originalTerritory.id}_${Date.now()}`,
      title: `${originalTerritory.title} (Evolved)`,
      positioning: `Enhanced: ${originalTerritory.positioning}`,
      tone: getEvolvedTone(originalTerritory.tone, evolutionType),
      headlines: generateEvolvedHeadlines(originalTerritory.headlines, evolutionType),
      starred: false,
    };

    // Calculate improvement score
    const improvementScore = await calculateImprovementScore(
      originalTerritory,
      evolvedTerritory,
      briefContext
    );

    // Generate evolution reasoning
    const reasoning = generateEvolutionReasoning(evolutionType, improvementScore);

    const evolution: TerritoryEvolution = {
      id: `evolution_${Date.now()}`,
      originalTerritoryId: originalTerritory.id,
      evolutionType,
      evolutionPrompt,
      resultingTerritory: evolvedTerritory,
      improvementScore,
      evolutionReasoning: reasoning,
      timestamp: new Date(),
      metadata: {
        briefContext,
        ...metadata,
      },
    };

    console.log('✅ Territory evolution complete. Improvement score:', improvementScore);
    return evolution;
  } catch (error) {
    console.error('Error evolving territory:', error);
    throw new Error(
      `Failed to evolve territory: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

// Helper function to get evolved tone
const getEvolvedTone = (originalTone: string, evolutionType: EvolutionType): string => {
  switch (evolutionType) {
    case 'TONE_SHIFT':
      return originalTone.includes('serious')
        ? 'conversational and approachable'
        : 'confident and engaging';
    case 'CULTURAL_ADAPTATION':
      return `${originalTone} with authentic Australian character`;
    case 'AUDIENCE_PIVOT':
      return `${originalTone} tailored for target audience`;
    case 'COMPETITIVE_RESPONSE':
      return `${originalTone} with competitive edge`;
    default:
      return `enhanced ${originalTone}`;
  }
};

// Helper function to generate evolved headlines
const generateEvolvedHeadlines = (
  originalHeadlines: Headline[],
  evolutionType: EvolutionType
): Headline[] => {
  return originalHeadlines.map((headline, _index) => ({
    ...headline,
    text: `${headline.text} (${evolutionType.toLowerCase()})`,
    reasoning: `Evolved for ${evolutionType.toLowerCase().replace('_', ' ')}`,
    confidence: Math.min(headline.confidence + 5, 95), // Slight confidence boost for evolution
  }));
};

// Calculate improvement score for evolved territory
const calculateImprovementScore = async (
  originalTerritory: Territory,
  evolvedTerritory: Territory,
  _briefContext: string
): Promise<number> => {
  // In a real implementation, this would use AI to compare territories
  // For now, using heuristic scoring

  let score = 50; // Base score

  // Length and detail improvements
  if (evolvedTerritory.positioning.length > originalTerritory.positioning.length) {
    score += 10;
  }

  // Headline improvements
  if (evolvedTerritory.headlines.length >= originalTerritory.headlines.length) {
    score += 10;
  }

  // Cultural relevance improvements
  if (
    evolvedTerritory.positioning.toLowerCase().includes('australia') ||
    evolvedTerritory.positioning.toLowerCase().includes('aussie')
  ) {
    score += 15;
  }

  // Tone improvements
  if (evolvedTerritory.tone.includes('enhanced') || evolvedTerritory.tone.includes('authentic')) {
    score += 10;
  }

  // Random variation to simulate AI scoring
  score += Math.random() * 10 - 5;

  return Math.max(Math.min(Math.round(score), 95), 30);
};

// Generate evolution reasoning
const generateEvolutionReasoning = (
  evolutionType: EvolutionType,
  improvementScore: number
): string => {
  const reasoningMap = {
    TONE_SHIFT: `Tone evolution improved messaging approachability and audience connection. Score: ${improvementScore}/100`,
    AUDIENCE_PIVOT: `Audience adaptation enhanced relevance and targeting precision. Score: ${improvementScore}/100`,
    COMPETITIVE_RESPONSE: `Competitive positioning strengthened differentiation and market advantage. Score: ${improvementScore}/100`,
    CULTURAL_ADAPTATION: `Cultural enhancement increased local relevance and authenticity. Score: ${improvementScore}/100`,
    SEASONAL_OPTIMIZATION: `Seasonal optimization improved timing relevance and contextual fit. Score: ${improvementScore}/100`,
    PERFORMANCE_ENHANCEMENT: `Performance optimization enhanced effectiveness and measurable impact. Score: ${improvementScore}/100`,
    CREATIVE_EXPLORATION: `Creative exploration expanded messaging possibilities and innovation. Score: ${improvementScore}/100`,
    COMPLIANCE_ADJUSTMENT: `Compliance adjustment ensured regulatory adherence while maintaining impact. Score: ${improvementScore}/100`,
  };

  return (
    reasoningMap[evolutionType] ||
    `Evolution improved territory effectiveness. Score: ${improvementScore}/100`
  );
};

// Predict performance for evolved territory
export const predictTerritoryPerformance = async (
  territory: Territory,
  briefContext: string,
  _targetAudience?: string
): Promise<PerformancePrediction> => {
  console.log('📊 Predicting performance for territory:', territory.id);

  // Analyze territory components
  const positioningStrength = analyzePositioningStrength(territory.positioning);
  const headlineQuality = analyzeHeadlineQuality(territory.headlines);
  const toneAlignment = analyzeToneAlignment(territory.tone, briefContext);
  const culturalRelevance = analyzeCulturalRelevance(territory, briefContext);
  const brandAlignment = analyzeBrandAlignment(territory, briefContext);

  const categoryScores = {
    audienceResonance: Math.round((headlineQuality + toneAlignment) / 2),
    brandAlignment,
    marketFit: culturalRelevance,
    creativePotential: Math.round((headlineQuality + positioningStrength) / 2),
    executionFeasibility: Math.round((positioningStrength + brandAlignment) / 2),
  };

  const overallScore = Math.round(
    Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / 5
  );

  const prediction: PerformancePrediction = {
    overallScore,
    categoryScores,
    strengths: generateStrengths(territory, categoryScores),
    weaknesses: generateWeaknesses(territory, categoryScores),
    recommendations: generateRecommendations(territory, categoryScores),
    confidence: calculatePredictionConfidence(territory, briefContext),
  };

  return prediction;
};

// Analysis helper functions
const analyzePositioningStrength = (positioning: string): number => {
  let score = 40;

  if (positioning.length > 50) score += 15;
  if (positioning.includes('unique') || positioning.includes('different')) score += 10;
  if (positioning.includes('value') || positioning.includes('benefit')) score += 10;
  if (positioning.includes('customer') || positioning.includes('audience')) score += 10;
  if (/\b(because|why|how)\b/i.test(positioning)) score += 15;

  return Math.min(score, 95);
};

const analyzeHeadlineQuality = (headlines: Headline[]): number => {
  if (headlines.length === 0) return 20;

  let totalScore = 0;
  headlines.forEach(headline => {
    let score = 40;

    if (headline.text.length > 20 && headline.text.length < 80) score += 15;
    if (headline.text.includes('?') || headline.text.includes('!')) score += 10;
    if (/\b(you|your)\b/i.test(headline.text)) score += 10;
    if (headline.confidence > 70) score += 15;
    if (headline.reasoning && headline.reasoning.length > 20) score += 10;

    totalScore += Math.min(score, 95);
  });

  return Math.round(totalScore / headlines.length);
};

const analyzeToneAlignment = (tone: string, briefContext: string): number => {
  let score = 50;

  if (tone.includes('authentic') || tone.includes('genuine')) score += 15;
  if (tone.includes('conversational') || tone.includes('approachable')) score += 10;
  if (tone.includes('confident') || tone.includes('authoritative')) score += 10;
  if (briefContext.toLowerCase().includes('family') && tone.includes('warm')) score += 15;
  if (briefContext.toLowerCase().includes('professional') && tone.includes('professional'))
    score += 15;

  return Math.min(score, 95);
};

const analyzeCulturalRelevance = (territory: Territory, _briefContext: string): number => {
  let score = 50;

  const content =
    `${territory.positioning} ${territory.headlines.map(h => h.text).join(' ')}`.toLowerCase();

  if (content.includes('australia') || content.includes('aussie')) score += 20;
  if (content.includes('fair') || content.includes('value')) score += 10;
  if (content.includes('family') || content.includes('community')) score += 10;
  if (content.includes('local') || content.includes('home')) score += 5;

  return Math.min(score, 95);
};

const analyzeBrandAlignment = (territory: Territory, briefContext: string): number => {
  let score = 60;

  if (
    briefContext.toLowerCase().includes('everyday') &&
    territory.positioning.toLowerCase().includes('everyday')
  )
    score += 15;
  if (
    briefContext.toLowerCase().includes('rewards') &&
    territory.positioning.toLowerCase().includes('reward')
  )
    score += 15;
  if (
    briefContext.toLowerCase().includes('value') &&
    territory.positioning.toLowerCase().includes('value')
  )
    score += 10;

  return Math.min(score, 95);
};

// Generate insights based on scores
const generateStrengths = (territory: Territory, scores: any): string[] => {
  const strengths: string[] = [];

  if (scores.audienceResonance > 75)
    strengths.push('Strong audience connection and engagement potential');
  if (scores.brandAlignment > 75) strengths.push('Excellent brand consistency and alignment');
  if (scores.marketFit > 75) strengths.push('High cultural relevance and market fit');
  if (scores.creativePotential > 75) strengths.push('Strong creative execution and innovation');
  if (scores.executionFeasibility > 75) strengths.push('High implementation feasibility');

  if (territory.headlines.length > 3) strengths.push('Rich variety of creative options');
  if (territory.positioning.length > 100) strengths.push('Comprehensive strategic positioning');

  return strengths;
};

const generateWeaknesses = (territory: Territory, scores: any): string[] => {
  const weaknesses: string[] = [];

  if (scores.audienceResonance < 60) weaknesses.push('Limited audience engagement potential');
  if (scores.brandAlignment < 60) weaknesses.push('Weak brand alignment and consistency');
  if (scores.marketFit < 60) weaknesses.push('Poor cultural relevance and market fit');
  if (scores.creativePotential < 60) weaknesses.push('Limited creative potential and innovation');
  if (scores.executionFeasibility < 60) weaknesses.push('Implementation challenges likely');

  if (territory.headlines.length < 2) weaknesses.push('Insufficient creative variations');
  if (territory.positioning.length < 50) weaknesses.push('Underdeveloped strategic positioning');

  return weaknesses;
};

const generateRecommendations = (territory: Territory, scores: any): string[] => {
  const recommendations: string[] = [];

  if (scores.audienceResonance < 70)
    recommendations.push('Enhance audience targeting and personalization');
  if (scores.brandAlignment < 70) recommendations.push('Strengthen brand voice and consistency');
  if (scores.marketFit < 70) recommendations.push('Add more Australian cultural context');
  if (scores.creativePotential < 70)
    recommendations.push('Explore more creative and innovative approaches');
  if (scores.executionFeasibility < 70)
    recommendations.push('Simplify implementation requirements');

  return recommendations;
};

const calculatePredictionConfidence = (territory: Territory, briefContext: string): number => {
  let confidence = 60;

  if (territory.headlines.length > 2) confidence += 10;
  if (territory.positioning.length > 50) confidence += 10;
  if (briefContext.length > 100) confidence += 10;
  if (territory.headlines.some(h => h.confidence > 70)) confidence += 10;

  return Math.min(confidence, 90);
};

// Evolution history management
export const getEvolutionHistory = (territoryId: string): EvolutionHistory => {
  // In a real implementation, this would fetch from storage
  return {
    territoryId,
    evolutions: [],
    evolutionTree: [],
  };
};

export const saveEvolution = (evolution: TerritoryEvolution): void => {
  // In a real implementation, this would save to storage
  console.log('💾 Saving evolution:', evolution.id);
};

// Smart suggestion engine
export const generateSmartSuggestions = async (
  territories: Territory[],
  briefContext: string,
  performanceData?: any
): Promise<EvolutionSuggestion[]> => {
  const allSuggestions: EvolutionSuggestion[] = [];

  for (const territory of territories) {
    const suggestions = await generateEvolutionSuggestions(
      territory,
      briefContext,
      performanceData
    );
    allSuggestions.push(...suggestions);
  }

  // Sort by priority and confidence
  return allSuggestions
    .sort((a, b) => {
      const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const aPriority = priorityWeight[a.priority];
      const bPriority = priorityWeight[b.priority];

      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.confidence - a.confidence;
    })
    .slice(0, 10); // Return top 10 suggestions
};
