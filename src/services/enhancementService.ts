import { Territory, GeneratedOutput } from '../App';

export interface BriefAnalysis {
  score: number; // 0-100
  suggestions: string[];
  strengths: string[];
  warnings: string[];
  marketInsights: string[];
}

export interface TerritoryConfidence {
  marketFit: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  complianceConfidence: number; // 0-100
  audienceResonance: number; // 0-100
  reasoning: string;
}

// Enhanced territory with confidence scoring
export interface EnhancedTerritory extends Territory {
  confidence: TerritoryConfidence;
}

export interface EnhancedGeneratedOutput extends Omit<GeneratedOutput, 'territories'> {
  territories: EnhancedTerritory[];
  overallConfidence: number;
}

// Analyze brief quality and provide suggestions
export const analyzeBrief = (brief: string): BriefAnalysis => {
  const wordCount = brief.trim().split(/\s+/).length;
  const hasTarget = /target|audience|customer|shopper/i.test(brief);
  const hasObjective = /objective|goal|aim|drive|increase|generate/i.test(brief);
  const hasContext = /competitor|market|against|versus|vs/i.test(brief);
  const hasEverydayRewards = /everyday rewards/i.test(brief);
  const hasShoppingMoment = /black friday|christmas|mother|father|valentine|australia day|eofy/i.test(brief);
  
  let score = 20; // Base score
  const suggestions: string[] = [];
  const strengths: string[] = [];
  const warnings: string[] = [];
  const marketInsights: string[] = [];

  // Scoring logic
  if (wordCount >= 20) {
    score += 20;
    strengths.push('Good detail level in brief');
  } else {
    suggestions.push('Add more detail about campaign objectives and target audience');
  }

  if (hasTarget) {
    score += 15;
    strengths.push('Target audience mentioned');
  } else {
    suggestions.push('Specify target audience (e.g., "busy families", "value-conscious shoppers")');
  }

  if (hasObjective) {
    score += 15;
    strengths.push('Clear campaign objective identified');
  } else {
    suggestions.push('Define specific campaign objective (awareness, engagement, conversion)');
  }

  if (hasContext) {
    score += 15;
    strengths.push('Competitive context provided');
  } else {
    suggestions.push('Add competitive context (e.g., "position against Coles/Woolworths one-day sales")');
  }

  if (hasEverydayRewards) {
    score += 10;
    strengths.push('Brand-specific context included');
  } else {
    suggestions.push('Reference Everyday Rewards brand values and positioning');
  }

  if (hasShoppingMoment) {
    score += 15;
    strengths.push('Shopping moment context provided');
    marketInsights.push('Current consumer sentiment favors consistent value over flash sales');
  }

  // Australian market insights
  if (/value|saving|deal/i.test(brief)) {
    marketInsights.push('Australian consumers prioritize long-term value over short-term discounts');
  }

  if (/family|families/i.test(brief)) {
    marketInsights.push('Australian families respond well to inclusive, community-focused messaging');
  }

  // Warnings
  if (wordCount > 200) {
    warnings.push('Brief may be too detailed - consider focusing on key objectives');
  }

  if (/urgent|asap|rush/i.test(brief)) {
    warnings.push('Rushed timelines may impact creative quality');
  }

  // Additional suggestions based on brief content
  if (!hasShoppingMoment && !suggestions.includes('Specify timing/shopping moment')) {
    suggestions.push('Consider timing context (seasonal moment, competitive response, etc.)');
  }

  if (!/australian|aussie|australia/i.test(brief) && !suggestions.includes('Add Australian context')) {
    suggestions.push('Include Australian cultural context for local relevance');
  }

  return {
    score: Math.min(score, 100),
    suggestions,
    strengths,
    warnings,
    marketInsights
  };
};

// Generate confidence scoring for territories
export const generateTerritoryConfidence = (territory: Territory, brief: string): TerritoryConfidence => {
  // Market fit analysis
  let marketFit = 60; // Base score
  
  // Check for Australian cultural relevance
  if (/aussie|mate|fair dinkum|true blue/i.test(territory.headlines.join(' '))) {
    marketFit += 15;
  }
  
  // Check for everyday value messaging
  if (/everyday|daily|consistent|regular/i.test(territory.positioning)) {
    marketFit += 10;
  }
  
  // Check brief alignment
  const briefWords = brief.toLowerCase().split(/\s+/);
  const territoryText = (territory.positioning + ' ' + territory.headlines.join(' ')).toLowerCase();
  const keywordOverlap = briefWords.filter(word => territoryText.includes(word)).length;
  marketFit += Math.min(keywordOverlap * 2, 15);
  
  // Risk assessment
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  const hasSuperlatives = /best|amazing|incredible|unbeatable|revolutionary/i.test(territory.headlines.join(' '));
  const hasUnsubstantiatedClaims = /guarantee|promise|always|never|100%/i.test(territory.headlines.join(' '));
  
  if (hasSuperlatives || hasUnsubstantiatedClaims) {
    riskLevel = 'MEDIUM';
    marketFit -= 10;
  }
  
  if (hasUnsubstantiatedClaims && hasSuperlatives) {
    riskLevel = 'HIGH';
    marketFit -= 20;
  }
  
  // Compliance confidence
  let complianceConfidence = 85; // Base compliance score
  
  if (hasUnsubstantiatedClaims) {
    complianceConfidence -= 25;
  }
  
  if (/terms apply|conditions apply|\*/i.test(territory.headlines.join(' '))) {
    complianceConfidence += 10;
  }
  
  // Audience resonance
  let audienceResonance = 70; // Base resonance
  
  // Check emotional appeal
  if (/smart|clever|savvy|wise/i.test(territory.headlines.join(' '))) {
    audienceResonance += 10;
  }
  
  if (/family|community|together|belong/i.test(territory.headlines.join(' '))) {
    audienceResonance += 15;
  }
  
  // Generate reasoning
  const reasoning = `Market fit ${marketFit}% based on brand alignment and cultural relevance. Risk level ${riskLevel.toLowerCase()} due to ${riskLevel === 'LOW' ? 'careful claim substantiation' : 'potential compliance concerns'}. Strong audience resonance through ${audienceResonance > 80 ? 'emotional and cultural connection' : 'value-focused messaging'}.`;
  
  return {
    marketFit: Math.min(Math.max(marketFit, 0), 100),
    riskLevel,
    complianceConfidence: Math.min(Math.max(complianceConfidence, 0), 100),
    audienceResonance: Math.min(Math.max(audienceResonance, 0), 100),
    reasoning
  };
};

// Enhanced AI service functions
export const enhanceGeneratedOutput = (output: GeneratedOutput, brief: string): EnhancedGeneratedOutput => {
  const enhancedTerritories = output.territories.map(territory => ({
    ...territory,
    confidence: generateTerritoryConfidence(territory, brief)
  }));
  
  // Calculate overall confidence
  const overallConfidence = enhancedTerritories.reduce((sum, territory) => {
    return sum + (territory.confidence.marketFit + territory.confidence.complianceConfidence + territory.confidence.audienceResonance) / 3;
  }, 0) / enhancedTerritories.length;
  
  return {
    ...output,
    territories: enhancedTerritories,
    overallConfidence: Math.round(overallConfidence)
  };
};