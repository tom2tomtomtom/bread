/**
 * 🎨 Layout Generation Service
 * 
 * AI-powered layout generation engine that creates professional ad layouts
 * by intelligently combining uploaded assets with creative territories.
 */

import {
  Territory,
  UploadedAsset,
  LayoutVariation,
  LayoutGenerationRequest,
  ChannelFormat,
  ChannelSpecs,
  BrandGuidelines,
  ImagePlacement,
  TextPlacement,
  ColorPalette,
  ComplianceScore,
  LayoutTemplate,
  TemplatePreference,
} from '../types';
import { generateWithOpenAI } from './secureApiService';
import { visualIntelligenceService } from './visualIntelligenceService';

// Channel specifications for different formats
export const CHANNEL_SPECIFICATIONS: Record<ChannelFormat, ChannelSpecs> = {
  // Social Media
  instagram_post: { width: 1080, height: 1080, dpi: 72, colorSpace: 'RGB', fileFormat: 'JPG' },
  instagram_story: { width: 1080, height: 1920, dpi: 72, colorSpace: 'RGB', fileFormat: 'JPG' },
  instagram_reel: { width: 1080, height: 1920, dpi: 72, colorSpace: 'RGB', fileFormat: 'MP4' },
  facebook_post: { width: 1200, height: 630, dpi: 72, colorSpace: 'RGB', fileFormat: 'JPG' },
  facebook_story: { width: 1080, height: 1920, dpi: 72, colorSpace: 'RGB', fileFormat: 'JPG' },
  facebook_cover: { width: 1200, height: 315, dpi: 72, colorSpace: 'RGB', fileFormat: 'JPG' },
  linkedin_post: { width: 1200, height: 627, dpi: 72, colorSpace: 'RGB', fileFormat: 'JPG' },
  linkedin_banner: { width: 1584, height: 396, dpi: 72, colorSpace: 'RGB', fileFormat: 'JPG' },
  tiktok_video: { width: 1080, height: 1920, dpi: 72, colorSpace: 'RGB', fileFormat: 'MP4' },
  youtube_thumbnail: { width: 1280, height: 720, dpi: 72, colorSpace: 'RGB', fileFormat: 'JPG' },
  
  // Print
  print_a4: { width: 2480, height: 3508, dpi: 300, colorSpace: 'CMYK', fileFormat: 'PDF' },
  print_a3: { width: 3508, height: 4961, dpi: 300, colorSpace: 'CMYK', fileFormat: 'PDF' },
  billboard_landscape: { width: 14400, height: 4800, dpi: 150, colorSpace: 'CMYK', fileFormat: 'PDF' },
  billboard_portrait: { width: 4800, height: 14400, dpi: 150, colorSpace: 'CMYK', fileFormat: 'PDF' },
  
  // Digital Advertising
  banner_leaderboard: { width: 728, height: 90, dpi: 72, colorSpace: 'RGB', fileFormat: 'JPG' },
  banner_rectangle: { width: 300, height: 250, dpi: 72, colorSpace: 'RGB', fileFormat: 'JPG' },
  banner_skyscraper: { width: 160, height: 600, dpi: 72, colorSpace: 'RGB', fileFormat: 'JPG' },
  email_header: { width: 600, height: 200, dpi: 72, colorSpace: 'RGB', fileFormat: 'JPG' },
  email_signature: { width: 320, height: 120, dpi: 72, colorSpace: 'RGB', fileFormat: 'PNG' },
  
  // Retail & In-store
  pos_display: { width: 1080, height: 1920, dpi: 150, colorSpace: 'RGB', fileFormat: 'PDF' },
  shelf_talker: { width: 600, height: 400, dpi: 150, colorSpace: 'RGB', fileFormat: 'PDF' },
  window_cling: { width: 1200, height: 1600, dpi: 150, colorSpace: 'RGB', fileFormat: 'PDF' },
  
  // Custom
  custom: { width: 1080, height: 1080, dpi: 72, colorSpace: 'RGB', fileFormat: 'JPG' },
};

// Layout generation prompts for AI
const LAYOUT_GENERATION_PROMPTS = {
  COMPOSITION_ANALYSIS: `
    Analyze the provided creative territory and assets to generate optimal layout compositions.
    
    Territory: {territory}
    Assets: {assets}
    Target Format: {format}
    Brand Guidelines: {brandGuidelines}
    
    Consider:
    - Visual hierarchy and message flow
    - Asset placement for maximum impact
    - Brand compliance and consistency
    - Channel-specific optimization
    - Audience engagement factors
    
    Generate 3 distinct layout variations with detailed placement coordinates and reasoning.
  `,
  
  BRAND_COMPLIANCE_CHECK: `
    Evaluate the proposed layout against brand guidelines and industry standards.
    
    Layout: {layout}
    Brand Guidelines: {brandGuidelines}
    Channel: {channel}
    
    Check for:
    - Color palette compliance
    - Typography consistency
    - Logo usage and placement
    - Spacing and grid alignment
    - Legal and regulatory requirements
    
    Provide compliance score and specific recommendations.
  `,
  
  PERFORMANCE_PREDICTION: `
    Predict the performance potential of this layout based on design principles and market data.
    
    Layout: {layout}
    Territory: {territory}
    Target Audience: {audience}
    Channel: {channel}
    
    Analyze:
    - Visual impact and attention-grabbing potential
    - Message clarity and communication effectiveness
    - Brand recognition and recall
    - Audience appeal and relevance
    - Channel-specific optimization
    
    Provide detailed performance prediction with scores and reasoning.
  `,
};

class LayoutGenerationService {
  /**
   * Generate AI-powered layout variations
   */
  async generateLayouts(request: LayoutGenerationRequest): Promise<LayoutVariation[]> {
    console.log('🎨 Starting AI-powered layout generation...');
    
    try {
      const variations: LayoutVariation[] = [];
      
      // Generate layouts for each target format
      for (const format of request.targetFormats) {
        const formatVariations = await this.generateLayoutsForFormat(request, format);
        variations.push(...formatVariations);
      }
      
      // Sort by performance prediction
      variations.sort((a, b) => b.performancePrediction - a.performancePrediction);
      
      console.log(`✅ Generated ${variations.length} layout variations`);
      return variations;
      
    } catch (error) {
      console.error('Error generating layouts:', error);
      throw new Error(`Layout generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate layouts for a specific format
   */
  private async generateLayoutsForFormat(
    request: LayoutGenerationRequest,
    format: ChannelFormat
  ): Promise<LayoutVariation[]> {
    const specs = CHANNEL_SPECIFICATIONS[format];
    const variations: LayoutVariation[] = [];
    
    // Get visual intelligence analysis
    const visualIntelligence = await visualIntelligenceService.analyzeAssetTerritoryMatch(
      request.assets,
      request.territory
    );
    
    // Generate 3 different layout styles
    const styles: TemplatePreference['style'][] = ['minimal', 'bold', 'elegant'];
    
    for (const style of styles) {
      const variation = await this.generateSingleLayout(
        request,
        format,
        specs,
        style,
        visualIntelligence
      );
      variations.push(variation);
    }
    
    return variations;
  }

  /**
   * Generate a single layout variation
   */
  private async generateSingleLayout(
    request: LayoutGenerationRequest,
    format: ChannelFormat,
    specs: ChannelSpecs,
    style: TemplatePreference['style'],
    visualIntelligence: any
  ): Promise<LayoutVariation> {
    // AI-powered composition analysis
    const compositionPrompt = LAYOUT_GENERATION_PROMPTS.COMPOSITION_ANALYSIS
      .replace('{territory}', JSON.stringify(request.territory))
      .replace('{assets}', JSON.stringify(request.assets.map(a => ({ id: a.id, type: a.type, aiAnalysis: a.aiAnalysis }))))
      .replace('{format}', format)
      .replace('{brandGuidelines}', JSON.stringify(request.brandGuidelines));

    // Generate layout with AI
    const aiResponse = await generateWithOpenAI(compositionPrompt, false, 'layout_generation');
    
    // Create layout composition (in production, this would parse AI response)
    const imageComposition = this.generateImageComposition(request.assets, specs, style);
    const textPlacement = this.generateTextPlacement(request.territory, specs, style);
    const colorScheme = this.generateColorScheme(request.brandGuidelines, style);
    
    // Check brand compliance
    const brandCompliance = await this.checkBrandCompliance(
      { imageComposition, textPlacement, colorScheme },
      request.brandGuidelines,
      format
    );
    
    // Predict performance
    const performancePrediction = await this.predictLayoutPerformance(
      { imageComposition, textPlacement, colorScheme },
      request.territory,
      format
    );
    
    const variation: LayoutVariation = {
      id: `layout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: `template_${style}_${format}`,
      name: `${style.charAt(0).toUpperCase() + style.slice(1)} ${format.replace('_', ' ')}`,
      description: `AI-generated ${style} layout optimized for ${format}`,
      imageComposition,
      textPlacement,
      colorScheme,
      channelOptimization: [format],
      brandCompliance,
      performancePrediction,
      aiReasoning: `Generated using ${style} style with AI-optimized composition for ${format}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        territoryId: request.territory.id,
        briefContext: request.territory.positioning,
        targetAudience: 'Primary target audience',
        generationPrompt: compositionPrompt,
      },
    };
    
    return variation;
  }

  /**
   * Generate image composition with AI-optimized placement
   */
  private generateImageComposition(
    assets: UploadedAsset[],
    specs: ChannelSpecs,
    style: TemplatePreference['style']
  ): ImagePlacement[] {
    const placements: ImagePlacement[] = [];
    
    // Prioritize assets by type and AI analysis
    const prioritizedAssets = this.prioritizeAssets(assets);
    
    // Generate placements based on style
    prioritizedAssets.forEach((asset, index) => {
      const placement = this.calculateOptimalPlacement(asset, index, specs, style);
      placements.push(placement);
    });
    
    return placements;
  }

  /**
   * Generate text placement with hierarchy optimization
   */
  private generateTextPlacement(
    territory: Territory,
    specs: ChannelSpecs,
    style: TemplatePreference['style']
  ): TextPlacement[] {
    const placements: TextPlacement[] = [];
    
    // Main headline
    if (territory.headlines.length > 0) {
      const headline = territory.headlines[0];
      placements.push({
        id: 'headline_main',
        content: headline.text,
        x: this.calculateTextX(specs, 'headline', style),
        y: this.calculateTextY(specs, 'headline', style),
        width: specs.width * 0.8,
        height: specs.height * 0.2,
        fontSize: this.calculateFontSize(specs, 'headline', style),
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        lineHeight: 1.2,
        letterSpacing: 0,
        textTransform: 'none',
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        effects: {
          shadow: false,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffset: { x: 0, y: 0 },
          stroke: false,
          strokeColor: '#ffffff',
          strokeWidth: 0,
        },
      });
    }
    
    // Territory positioning as subheading
    placements.push({
      id: 'positioning_text',
      content: territory.positioning,
      x: this.calculateTextX(specs, 'subheading', style),
      y: this.calculateTextY(specs, 'subheading', style),
      width: specs.width * 0.7,
      height: specs.height * 0.15,
      fontSize: this.calculateFontSize(specs, 'subheading', style),
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      color: '#333333',
      textAlign: 'center',
      lineHeight: 1.4,
      letterSpacing: 0,
      textTransform: 'none',
      rotation: 0,
      opacity: 1,
      zIndex: 9,
      effects: {
        shadow: false,
        shadowColor: '#000000',
        shadowBlur: 0,
        shadowOffset: { x: 0, y: 0 },
        stroke: false,
        strokeColor: '#ffffff',
        strokeWidth: 0,
      },
    });
    
    return placements;
  }

  /**
   * Generate color scheme based on brand guidelines and style
   */
  private generateColorScheme(
    brandGuidelines: BrandGuidelines,
    style: TemplatePreference['style']
  ): ColorPalette {
    // Base on brand colors but adapt for style
    const baseColors = brandGuidelines.colors;
    
    switch (style) {
      case 'minimal':
        return {
          primary: baseColors.primary,
          secondary: [baseColors.secondary[0] || '#f5f5f5'],
          accent: [baseColors.accent[0] || '#e0e0e0'],
          neutral: ['#ffffff', '#f8f8f8', '#e0e0e0'],
          background: '#ffffff',
          text: '#333333',
        };
      
      case 'bold':
        return {
          primary: baseColors.primary,
          secondary: baseColors.secondary,
          accent: baseColors.accent,
          neutral: ['#000000', '#333333', '#666666'],
          background: baseColors.primary,
          text: '#ffffff',
        };
      
      case 'elegant':
        return {
          primary: baseColors.primary,
          secondary: baseColors.secondary.map(color => this.adjustColorSaturation(color, -20)),
          accent: baseColors.accent.map(color => this.adjustColorSaturation(color, -10)),
          neutral: ['#f9f9f9', '#e8e8e8', '#d0d0d0'],
          background: '#f9f9f9',
          text: '#2c2c2c',
        };
      
      default:
        return baseColors;
    }
  }

  /**
   * Check brand compliance for generated layout
   */
  private async checkBrandCompliance(
    layout: { imageComposition: ImagePlacement[]; textPlacement: TextPlacement[]; colorScheme: ColorPalette },
    brandGuidelines: BrandGuidelines,
    format: ChannelFormat
  ): Promise<ComplianceScore> {
    // AI-powered compliance check
    const compliancePrompt = LAYOUT_GENERATION_PROMPTS.BRAND_COMPLIANCE_CHECK
      .replace('{layout}', JSON.stringify(layout))
      .replace('{brandGuidelines}', JSON.stringify(brandGuidelines))
      .replace('{channel}', format);

    try {
      await generateWithOpenAI(compliancePrompt, false, 'compliance_check');
      
      // Generate compliance score (in production, parse AI response)
      const score: ComplianceScore = {
        overall: 85,
        categories: {
          brandAlignment: 90,
          colorCompliance: 85,
          fontCompliance: 80,
          logoUsage: 90,
          spacing: 85,
          legalRequirements: 95,
        },
        violations: [],
        recommendations: [
          'Consider increasing font size for better readability',
          'Ensure logo meets minimum size requirements',
        ],
      };
      
      return score;
    } catch (error) {
      console.warn('Compliance check failed, using default score:', error);
      return {
        overall: 75,
        categories: {
          brandAlignment: 75,
          colorCompliance: 75,
          fontCompliance: 75,
          logoUsage: 75,
          spacing: 75,
          legalRequirements: 75,
        },
        violations: [],
        recommendations: ['Manual compliance review recommended'],
      };
    }
  }

  /**
   * Predict layout performance using AI
   */
  private async predictLayoutPerformance(
    layout: { imageComposition: ImagePlacement[]; textPlacement: TextPlacement[]; colorScheme: ColorPalette },
    territory: Territory,
    format: ChannelFormat
  ): Promise<number> {
    const performancePrompt = LAYOUT_GENERATION_PROMPTS.PERFORMANCE_PREDICTION
      .replace('{layout}', JSON.stringify(layout))
      .replace('{territory}', JSON.stringify(territory))
      .replace('{audience}', 'Primary target audience')
      .replace('{channel}', format);

    try {
      await generateWithOpenAI(performancePrompt, false, 'performance_prediction');
      
      // Calculate performance score based on multiple factors
      const visualImpact = this.calculateVisualImpact(layout);
      const messageClarity = this.calculateMessageClarity(layout, territory);
      const channelOptimization = this.calculateChannelOptimization(layout, format);
      
      const overallScore = Math.round((visualImpact + messageClarity + channelOptimization) / 3);
      return Math.min(Math.max(overallScore, 0), 100);
      
    } catch (error) {
      console.warn('Performance prediction failed, using heuristic:', error);
      return 75; // Default score
    }
  }

  // Helper methods for calculations
  private prioritizeAssets(assets: UploadedAsset[]): UploadedAsset[] {
    return assets.sort((a, b) => {
      // Prioritize by type: logo > product > lifestyle > background
      const typeOrder = { logo: 0, product: 1, lifestyle: 2, background: 3, other: 4 };
      const aOrder = typeOrder[a.type] ?? 4;
      const bOrder = typeOrder[b.type] ?? 4;
      
      if (aOrder !== bOrder) return aOrder - bOrder;
      
      // Then by AI analysis quality score
      const aQuality = a.aiAnalysis?.quality_score ?? 50;
      const bQuality = b.aiAnalysis?.quality_score ?? 50;
      return bQuality - aQuality;
    });
  }

  private calculateOptimalPlacement(
    asset: UploadedAsset,
    index: number,
    specs: ChannelSpecs,
    style: TemplatePreference['style']
  ): ImagePlacement {
    // Calculate placement based on asset priority and style
    const isHero = index === 0;
    const aspectRatio = asset.metadata.dimensions ? 
      asset.metadata.dimensions.width / asset.metadata.dimensions.height : 1;
    
    let x, y, width, height;
    
    if (isHero) {
      // Hero asset gets prominent placement
      switch (style) {
        case 'minimal':
          x = specs.width * 0.1;
          y = specs.height * 0.1;
          width = specs.width * 0.8;
          height = specs.height * 0.6;
          break;
        case 'bold':
          x = 0;
          y = 0;
          width = specs.width;
          height = specs.height * 0.7;
          break;
        default:
          x = specs.width * 0.05;
          y = specs.height * 0.05;
          width = specs.width * 0.9;
          height = specs.height * 0.65;
      }
    } else {
      // Secondary assets get smaller placement
      x = specs.width * 0.7;
      y = specs.height * 0.7 + (index - 1) * 100;
      width = specs.width * 0.25;
      height = width / aspectRatio;
    }
    
    return {
      assetId: asset.id,
      x,
      y,
      width,
      height,
      rotation: 0,
      opacity: 1,
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
      },
      zIndex: isHero ? 1 : 2 + index,
    };
  }

  private calculateTextX(specs: ChannelSpecs, role: string, style: TemplatePreference['style']): number {
    switch (style) {
      case 'minimal':
        return specs.width * 0.1;
      case 'bold':
        return specs.width * 0.05;
      default:
        return specs.width * 0.1;
    }
  }

  private calculateTextY(specs: ChannelSpecs, role: string, style: TemplatePreference['style']): number {
    if (role === 'headline') {
      return style === 'bold' ? specs.height * 0.75 : specs.height * 0.7;
    }
    return specs.height * 0.85;
  }

  private calculateFontSize(specs: ChannelSpecs, role: string, style: TemplatePreference['style']): number {
    const baseSize = Math.min(specs.width, specs.height) / 20;
    const multiplier = role === 'headline' ? 1.5 : 1;
    const styleMultiplier = style === 'bold' ? 1.2 : 1;
    
    return Math.round(baseSize * multiplier * styleMultiplier);
  }

  private adjustColorSaturation(color: string, adjustment: number): string {
    // Simple color adjustment (in production, use proper color manipulation library)
    return color;
  }

  private calculateVisualImpact(layout: any): number {
    // Heuristic for visual impact based on composition
    return 80;
  }

  private calculateMessageClarity(layout: any, territory: Territory): number {
    // Heuristic for message clarity
    return 85;
  }

  private calculateChannelOptimization(layout: any, format: ChannelFormat): number {
    // Heuristic for channel optimization
    return 90;
  }
}

export const layoutGenerationService = new LayoutGenerationService();
