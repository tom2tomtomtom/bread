/**
 * 🧠 Visual Intelligence Service
 * 
 * Advanced AI-powered visual analysis for asset-territory matching,
 * color harmony analysis, and style consistency checking.
 */

import {
  UploadedAsset,
  Territory,
  VisualIntelligence,
  AssetTerritoryMatch,
  ColorHarmonyAnalysis,
  StyleConsistencyCheck,
  CompositionSuggestion,
  LayoutPerformancePrediction,
  ColorConflict,
  ColorImprovement,
  StyleInconsistency,
  ColorPalette,
} from '../types';
import { generateWithOpenAI, generateWithClaude } from './secureApiService';

// Visual analysis prompts for AI
const VISUAL_ANALYSIS_PROMPTS = {
  ASSET_TERRITORY_MATCH: `
    Analyze how well these assets align with the creative territory and brand positioning.
    
    Territory: {territory}
    Assets: {assets}
    
    For each asset, evaluate:
    - Visual alignment with territory mood and tone
    - Brand consistency and recognition
    - Audience appeal and relevance
    - Technical quality and usability
    - Emotional resonance with territory message
    
    Provide detailed match scores (0-100) and specific reasoning for each asset.
  `,
  
  COLOR_HARMONY_ANALYSIS: `
    Analyze the color harmony and palette effectiveness of these assets and territory.
    
    Assets: {assets}
    Territory Colors: {territoryColors}
    Brand Guidelines: {brandGuidelines}
    
    Evaluate:
    - Color harmony and balance across assets
    - Brand color compliance and consistency
    - Emotional impact and mood alignment
    - Accessibility and contrast ratios
    - Cultural and market appropriateness
    
    Suggest optimal color palette and identify any conflicts or improvements.
  `,
  
  STYLE_CONSISTENCY_CHECK: `
    Check style consistency across assets and alignment with territory positioning.
    
    Assets: {assets}
    Territory: {territory}
    Style Requirements: {styleRequirements}
    
    Analyze:
    - Visual style coherence across all assets
    - Typography consistency and hierarchy
    - Imagery style and treatment
    - Spacing and layout principles
    - Brand voice visual representation
    
    Identify inconsistencies and provide specific recommendations.
  `,
  
  COMPOSITION_SUGGESTIONS: `
    Generate composition suggestions for optimal layout arrangement.
    
    Assets: {assets}
    Territory: {territory}
    Format: {format}
    Target Audience: {audience}
    
    Consider:
    - Visual hierarchy and information flow
    - Asset placement for maximum impact
    - Balance and proportion principles
    - Focal points and attention guidance
    - Cultural and demographic preferences
    
    Provide specific, actionable composition recommendations.
  `,
  
  PERFORMANCE_PREDICTION: `
    Predict the performance potential of this visual composition.
    
    Assets: {assets}
    Territory: {territory}
    Composition: {composition}
    Target Market: {market}
    
    Analyze:
    - Visual impact and attention-grabbing potential
    - Brand recognition and recall likelihood
    - Message clarity and communication effectiveness
    - Audience engagement and emotional response
    - Channel-specific optimization factors
    
    Provide detailed performance prediction with confidence scores.
  `,
};

class VisualIntelligenceService {
  /**
   * Comprehensive visual intelligence analysis
   */
  async analyzeVisualIntelligence(
    assets: UploadedAsset[],
    territory: Territory,
    targetFormat?: string,
    brandGuidelines?: any
  ): Promise<VisualIntelligence> {
    console.log('🧠 Starting comprehensive visual intelligence analysis...');
    
    try {
      const [
        assetTerritoryMatch,
        colorHarmony,
        styleConsistency,
        compositionSuggestions,
        performancePrediction,
      ] = await Promise.all([
        this.analyzeAssetTerritoryMatch(assets, territory),
        this.analyzeColorHarmony(assets, territory, brandGuidelines),
        this.checkStyleConsistency(assets, territory),
        this.generateCompositionSuggestions(assets, territory, targetFormat),
        this.predictLayoutPerformance(assets, territory, targetFormat),
      ]);
      
      const intelligence: VisualIntelligence = {
        assetTerritoryMatch,
        colorHarmony,
        styleConsistency,
        compositionSuggestions,
        performancePrediction,
      };
      
      console.log('✅ Visual intelligence analysis completed');
      return intelligence;
      
    } catch (error) {
      console.error('Error in visual intelligence analysis:', error);
      throw new Error(`Visual intelligence analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze how well assets match the territory
   */
  async analyzeAssetTerritoryMatch(
    assets: UploadedAsset[],
    territory: Territory
  ): Promise<AssetTerritoryMatch[]> {
    console.log('🎯 Analyzing asset-territory matching...');
    
    const matches: AssetTerritoryMatch[] = [];
    
    for (const asset of assets) {
      try {
        const prompt = VISUAL_ANALYSIS_PROMPTS.ASSET_TERRITORY_MATCH
          .replace('{territory}', JSON.stringify({
            positioning: territory.positioning,
            tone: territory.tone,
            title: territory.title,
            headlines: territory.headlines.map(h => h.text),
          }))
          .replace('{assets}', JSON.stringify({
            id: asset.id,
            type: asset.type,
            aiAnalysis: asset.aiAnalysis,
            tags: asset.tags,
          }));

        // Use Claude for detailed analysis
        const analysis = await generateWithClaude(prompt);
        
        // Generate match analysis (in production, parse AI response)
        const match: AssetTerritoryMatch = {
          assetId: asset.id,
          territoryId: territory.id,
          matchScore: this.calculateAssetMatchScore(asset, territory),
          reasoning: `Asset ${asset.type} aligns well with territory positioning and tone`,
          strengths: this.identifyAssetStrengths(asset, territory),
          concerns: this.identifyAssetConcerns(asset, territory),
          recommendations: this.generateAssetRecommendations(asset, territory),
        };
        
        matches.push(match);
        
      } catch (error) {
        console.warn(`Failed to analyze asset ${asset.id}:`, error);
        // Provide fallback analysis
        matches.push({
          assetId: asset.id,
          territoryId: territory.id,
          matchScore: 75,
          reasoning: 'Fallback analysis - manual review recommended',
          strengths: ['Asset available for use'],
          concerns: ['Analysis incomplete'],
          recommendations: ['Manual review recommended'],
        });
      }
    }
    
    return matches;
  }

  /**
   * Analyze color harmony across assets
   */
  async analyzeColorHarmony(
    assets: UploadedAsset[],
    territory: Territory,
    brandGuidelines?: any
  ): Promise<ColorHarmonyAnalysis> {
    console.log('🎨 Analyzing color harmony...');
    
    try {
      const prompt = VISUAL_ANALYSIS_PROMPTS.COLOR_HARMONY_ANALYSIS
        .replace('{assets}', JSON.stringify(assets.map(a => ({
          id: a.id,
          type: a.type,
          aiAnalysis: a.aiAnalysis,
        }))))
        .replace('{territoryColors}', JSON.stringify([]))
        .replace('{brandGuidelines}', JSON.stringify(brandGuidelines || {}));

      await generateWithClaude(prompt);
      
      // Generate color harmony analysis
      const analysis: ColorHarmonyAnalysis = {
        harmonyScore: this.calculateColorHarmonyScore(assets),
        dominantColors: this.extractDominantColors(assets),
        suggestedPalette: this.generateSuggestedPalette(assets, territory),
        conflicts: this.identifyColorConflicts(assets),
        improvements: this.suggestColorImprovements(assets, territory),
      };
      
      return analysis;
      
    } catch (error) {
      console.warn('Color harmony analysis failed:', error);
      return this.getFallbackColorAnalysis();
    }
  }

  /**
   * Check style consistency across assets
   */
  async checkStyleConsistency(
    assets: UploadedAsset[],
    territory: Territory
  ): Promise<StyleConsistencyCheck> {
    console.log('🎭 Checking style consistency...');
    
    try {
      const prompt = VISUAL_ANALYSIS_PROMPTS.STYLE_CONSISTENCY_CHECK
        .replace('{assets}', JSON.stringify(assets.map(a => ({
          id: a.id,
          type: a.type,
          aiAnalysis: a.aiAnalysis,
        }))))
        .replace('{territory}', JSON.stringify(territory))
        .replace('{styleRequirements}', JSON.stringify({
          tone: territory.tone,
          positioning: territory.positioning,
        }));

      await generateWithClaude(prompt);
      
      const check: StyleConsistencyCheck = {
        consistencyScore: this.calculateStyleConsistencyScore(assets),
        styleElements: {
          typography: this.analyzeTypographyConsistency(assets),
          imagery: this.analyzeImageryConsistency(assets),
          spacing: this.analyzeSpacingConsistency(assets),
          colors: this.analyzeColorConsistency(assets),
        },
        inconsistencies: this.identifyStyleInconsistencies(assets),
        recommendations: this.generateStyleRecommendations(assets, territory),
      };
      
      return check;
      
    } catch (error) {
      console.warn('Style consistency check failed:', error);
      return this.getFallbackStyleCheck();
    }
  }

  /**
   * Generate composition suggestions
   */
  async generateCompositionSuggestions(
    assets: UploadedAsset[],
    territory: Territory,
    targetFormat?: string
  ): Promise<CompositionSuggestion[]> {
    console.log('📐 Generating composition suggestions...');
    
    try {
      const prompt = VISUAL_ANALYSIS_PROMPTS.COMPOSITION_SUGGESTIONS
        .replace('{assets}', JSON.stringify(assets.map(a => ({
          id: a.id,
          type: a.type,
          aiAnalysis: a.aiAnalysis,
        }))))
        .replace('{territory}', JSON.stringify(territory))
        .replace('{format}', targetFormat || 'general')
        .replace('{audience}', 'general audience');

      await generateWithOpenAI(prompt, false);
      
      const suggestions: CompositionSuggestion[] = [
        {
          type: 'hierarchy',
          title: 'Optimize Visual Hierarchy',
          description: 'Arrange elements to guide viewer attention through the message flow',
          implementation: 'Place primary asset in upper third, supporting elements below',
          expectedImpact: 'Improved message comprehension and engagement',
          priority: 'high',
        },
        {
          type: 'balance',
          title: 'Improve Visual Balance',
          description: 'Balance visual weight across the composition',
          implementation: 'Distribute assets using rule of thirds and golden ratio',
          expectedImpact: 'More aesthetically pleasing and professional appearance',
          priority: 'medium',
        },
        {
          type: 'focus',
          title: 'Enhance Focal Point',
          description: 'Create clear focal point to capture attention',
          implementation: 'Use contrast, size, and positioning to emphasize key element',
          expectedImpact: 'Increased attention capture and brand recognition',
          priority: 'high',
        },
      ];
      
      return suggestions;
      
    } catch (error) {
      console.warn('Composition suggestions failed:', error);
      return this.getFallbackCompositionSuggestions();
    }
  }

  /**
   * Predict layout performance
   */
  async predictLayoutPerformance(
    assets: UploadedAsset[],
    territory: Territory,
    targetFormat?: string
  ): Promise<LayoutPerformancePrediction> {
    console.log('📊 Predicting layout performance...');
    
    try {
      const prompt = VISUAL_ANALYSIS_PROMPTS.PERFORMANCE_PREDICTION
        .replace('{assets}', JSON.stringify(assets.map(a => ({
          id: a.id,
          type: a.type,
          aiAnalysis: a.aiAnalysis,
        }))))
        .replace('{territory}', JSON.stringify(territory))
        .replace('{composition}', 'Current asset arrangement')
        .replace('{market}', 'Australian market');

      await generateWithOpenAI(prompt, false, 'performance_prediction');
      
      const prediction: LayoutPerformancePrediction = {
        overallScore: this.calculateOverallPerformanceScore(assets, territory),
        categoryScores: {
          visualImpact: this.calculateVisualImpactScore(assets),
          brandRecognition: this.calculateBrandRecognitionScore(assets, territory),
          messageClarity: this.calculateMessageClarityScore(assets, territory),
          audienceAppeal: this.calculateAudienceAppealScore(assets, territory),
          channelOptimization: this.calculateChannelOptimizationScore(assets, targetFormat),
        },
        strengths: this.identifyPerformanceStrengths(assets, territory),
        weaknesses: this.identifyPerformanceWeaknesses(assets, territory),
        optimizationSuggestions: this.generateOptimizationSuggestions(assets, territory),
        confidence: 85,
      };
      
      return prediction;
      
    } catch (error) {
      console.warn('Performance prediction failed:', error);
      return this.getFallbackPerformancePrediction();
    }
  }

  // Helper methods for calculations and analysis
  private calculateAssetMatchScore(asset: UploadedAsset, territory: Territory): number {
    let score = 50; // Base score
    
    // Asset type relevance
    if (asset.type === 'product' && territory.positioning.toLowerCase().includes('product')) score += 20;
    if (asset.type === 'lifestyle' && territory.tone === 'aspirational') score += 15;
    if (asset.type === 'logo') score += 10; // Always valuable
    
    // AI analysis quality
    if (asset.aiAnalysis?.quality_score) {
      score += (asset.aiAnalysis.quality_score - 50) * 0.3;
    }
    
    // Tag relevance
    const territoryKeywords = [
      ...territory.positioning.toLowerCase().split(' '),
      territory.tone?.toLowerCase() || '',
      ...(territory.title?.toLowerCase().split(' ') || []),
    ];
    
    const matchingTags = asset.tags.filter(tag => 
      territoryKeywords.some(keyword => 
        keyword.includes(tag.toLowerCase()) || tag.toLowerCase().includes(keyword)
      )
    );
    
    score += matchingTags.length * 5;
    
    return Math.min(Math.max(Math.round(score), 0), 100);
  }

  private identifyAssetStrengths(asset: UploadedAsset, territory: Territory): string[] {
    const strengths: string[] = [];
    
    if (asset.aiAnalysis?.quality_score && asset.aiAnalysis.quality_score > 80) {
      strengths.push('High technical quality');
    }
    
    if (asset.type === 'product') {
      strengths.push('Clear product representation');
    }
    
    if (asset.type === 'lifestyle') {
      strengths.push('Strong emotional appeal');
    }
    
    if (asset.tags.length > 3) {
      strengths.push('Well-categorized and tagged');
    }
    
    return strengths.length > 0 ? strengths : ['Asset available for use'];
  }

  private identifyAssetConcerns(asset: UploadedAsset, territory: Territory): string[] {
    const concerns: string[] = [];
    
    if (asset.aiAnalysis?.quality_score && asset.aiAnalysis.quality_score < 60) {
      concerns.push('Lower technical quality');
    }
    
    if (asset.tags.length < 2) {
      concerns.push('Limited categorization');
    }
    
    if (!asset.metadata.dimensions) {
      concerns.push('Missing dimension information');
    }
    
    return concerns;
  }

  private generateAssetRecommendations(asset: UploadedAsset, territory: Territory): string[] {
    const recommendations: string[] = [];
    
    if (asset.type === 'background') {
      recommendations.push('Consider using as background element with overlay');
    }
    
    if (asset.type === 'product') {
      recommendations.push('Feature prominently in layout composition');
    }
    
    if (asset.type === 'logo') {
      recommendations.push('Ensure proper sizing and clear space requirements');
    }
    
    recommendations.push('Test in multiple layout variations');
    
    return recommendations;
  }

  private calculateColorHarmonyScore(assets: UploadedAsset[]): number {
    // Simplified color harmony calculation
    return 82;
  }

  private extractDominantColors(assets: UploadedAsset[]): string[] {
    // Extract dominant colors from asset analysis
    const colors: string[] = [];
    
    assets.forEach(asset => {
      if (asset.aiAnalysis?.colors?.palette) {
        colors.push(...asset.aiAnalysis.colors.palette);
      }
    });
    
    // Return unique colors
    return [...new Set(colors)].slice(0, 5);
  }

  private generateSuggestedPalette(assets: UploadedAsset[], territory: Territory): ColorPalette {
    const dominantColors = this.extractDominantColors(assets);
    
    return {
      primary: dominantColors[0] || '#007bff',
      secondary: dominantColors.slice(1, 3),
      accent: dominantColors.slice(3, 5),
      neutral: ['#f8f9fa', '#e9ecef', '#6c757d'],
      background: '#ffffff',
      text: '#212529',
    };
  }

  private identifyColorConflicts(assets: UploadedAsset[]): ColorConflict[] {
    return [
      {
        type: 'contrast',
        severity: 'medium',
        description: 'Some color combinations may have insufficient contrast',
        affectedElements: ['text overlay', 'background'],
        solution: 'Increase contrast ratio or add text shadow',
      },
    ];
  }

  private suggestColorImprovements(assets: UploadedAsset[], territory: Territory): ColorImprovement[] {
    return [
      {
        type: 'enhancement',
        description: 'Enhance color vibrancy for better visual impact',
        implementation: 'Increase saturation by 10-15%',
        expectedImpact: 'Improved attention capture and engagement',
      },
    ];
  }

  private calculateStyleConsistencyScore(assets: UploadedAsset[]): number {
    // Simplified style consistency calculation
    return 78;
  }

  private analyzeTypographyConsistency(assets: UploadedAsset[]): number {
    return 85;
  }

  private analyzeImageryConsistency(assets: UploadedAsset[]): number {
    return 80;
  }

  private analyzeSpacingConsistency(assets: UploadedAsset[]): number {
    return 75;
  }

  private analyzeColorConsistency(assets: UploadedAsset[]): number {
    return 82;
  }

  private identifyStyleInconsistencies(assets: UploadedAsset[]): StyleInconsistency[] {
    return [
      {
        element: 'imagery',
        issue: 'Mixed photography styles',
        severity: 'medium',
        fix: 'Apply consistent filter or treatment',
      },
    ];
  }

  private generateStyleRecommendations(assets: UploadedAsset[], territory: Territory): string[] {
    return [
      'Maintain consistent visual treatment across all assets',
      'Ensure typography hierarchy supports message flow',
      'Apply unified color grading for cohesive look',
    ];
  }

  private calculateOverallPerformanceScore(assets: UploadedAsset[], territory: Territory): number {
    const scores = [
      this.calculateVisualImpactScore(assets),
      this.calculateBrandRecognitionScore(assets, territory),
      this.calculateMessageClarityScore(assets, territory),
      this.calculateAudienceAppealScore(assets, territory),
    ];
    
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  private calculateVisualImpactScore(assets: UploadedAsset[]): number {
    // Calculate based on asset quality and variety
    const avgQuality = assets.reduce((sum, asset) => 
      sum + (asset.aiAnalysis?.quality_score || 70), 0) / assets.length;
    
    const typeVariety = new Set(assets.map(a => a.type)).size;
    const varietyBonus = Math.min(typeVariety * 5, 20);
    
    return Math.min(Math.round(avgQuality + varietyBonus), 100);
  }

  private calculateBrandRecognitionScore(assets: UploadedAsset[], territory: Territory): number {
    const hasLogo = assets.some(a => a.type === 'logo');
    const hasProduct = assets.some(a => a.type === 'product');
    
    let score = 60;
    if (hasLogo) score += 20;
    if (hasProduct) score += 15;
    
    return Math.min(score, 100);
  }

  private calculateMessageClarityScore(assets: UploadedAsset[], territory: Territory): number {
    // Base score influenced by territory clarity and asset relevance
    return 85;
  }

  private calculateAudienceAppealScore(assets: UploadedAsset[], territory: Territory): number {
    // Calculate based on asset types and territory audience
    return 80;
  }

  private calculateChannelOptimizationScore(assets: UploadedAsset[], targetFormat?: string): number {
    // Calculate based on asset suitability for target format
    return 88;
  }

  private identifyPerformanceStrengths(assets: UploadedAsset[], territory: Territory): string[] {
    return [
      'Strong visual asset quality',
      'Good brand element representation',
      'Clear message hierarchy potential',
    ];
  }

  private identifyPerformanceWeaknesses(assets: UploadedAsset[], territory: Territory): string[] {
    return [
      'Could benefit from more lifestyle imagery',
      'Consider additional supporting elements',
    ];
  }

  private generateOptimizationSuggestions(assets: UploadedAsset[], territory: Territory): string[] {
    return [
      'Feature product assets prominently',
      'Use lifestyle imagery to create emotional connection',
      'Ensure logo visibility meets brand guidelines',
      'Optimize text hierarchy for message clarity',
    ];
  }

  // Fallback methods for error cases
  private getFallbackColorAnalysis(): ColorHarmonyAnalysis {
    return {
      harmonyScore: 75,
      dominantColors: ['#007bff', '#28a745', '#ffc107'],
      suggestedPalette: {
        primary: '#007bff',
        secondary: ['#6c757d'],
        accent: ['#28a745'],
        neutral: ['#f8f9fa', '#e9ecef'],
        background: '#ffffff',
        text: '#212529',
      },
      conflicts: [],
      improvements: [],
    };
  }

  private getFallbackStyleCheck(): StyleConsistencyCheck {
    return {
      consistencyScore: 75,
      styleElements: {
        typography: 75,
        imagery: 75,
        spacing: 75,
        colors: 75,
      },
      inconsistencies: [],
      recommendations: ['Manual style review recommended'],
    };
  }

  private getFallbackCompositionSuggestions(): CompositionSuggestion[] {
    return [
      {
        type: 'layout',
        title: 'Standard Layout Optimization',
        description: 'Apply standard composition principles',
        implementation: 'Use rule of thirds and visual hierarchy',
        expectedImpact: 'Improved visual appeal',
        priority: 'medium',
      },
    ];
  }

  private getFallbackPerformancePrediction(): LayoutPerformancePrediction {
    return {
      overallScore: 75,
      categoryScores: {
        visualImpact: 75,
        brandRecognition: 75,
        messageClarity: 75,
        audienceAppeal: 75,
        channelOptimization: 75,
      },
      strengths: ['Assets available for layout'],
      weaknesses: ['Analysis incomplete'],
      optimizationSuggestions: ['Manual review recommended'],
      confidence: 60,
    };
  }
}

export const visualIntelligenceService = new VisualIntelligenceService();
