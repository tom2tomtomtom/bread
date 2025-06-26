import { ImageAnalysis } from '../types';

// AI-powered asset analysis service
export class AIAnalysisService {
  private static instance: AIAnalysisService;
  private apiBaseUrl: string;

  private constructor() {
    this.apiBaseUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:8888/.netlify/functions'
        : '/.netlify/functions';
  }

  public static getInstance(): AIAnalysisService {
    if (!AIAnalysisService.instance) {
      AIAnalysisService.instance = new AIAnalysisService();
    }
    return AIAnalysisService.instance;
  }

  // Analyze image using AI
  public async analyzeImage(file: File): Promise<ImageAnalysis> {
    try {
      // Convert file to base64 for API transmission
      const base64Image = await this.fileToBase64(file);

      const response = await fetch(`${this.apiBaseUrl}/analyze-asset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          image: base64Image,
          filename: file.name,
          mimeType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI analysis failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'AI analysis failed');
      }

      return result.data;
    } catch (error) {
      console.warn('AI analysis failed, using fallback:', error);
      return this.generateFallbackAnalysis(file);
    }
  }

  // Generate comprehensive analysis with multiple AI models
  public async generateComprehensiveAnalysis(file: File): Promise<ImageAnalysis> {
    try {
      const base64Image = await this.fileToBase64(file);

      const response = await fetch(`${this.apiBaseUrl}/analyze-asset-comprehensive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          image: base64Image,
          filename: file.name,
          mimeType: file.type,
          analysisType: 'comprehensive',
        }),
      });

      if (!response.ok) {
        throw new Error(`Comprehensive analysis failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Comprehensive analysis failed');
      }

      return result.data;
    } catch (error) {
      console.warn('Comprehensive analysis failed, using standard analysis:', error);
      return this.analyzeImage(file);
    }
  }

  // Analyze multiple images in batch
  public async analyzeBatch(files: File[]): Promise<ImageAnalysis[]> {
    const analyses = await Promise.allSettled(files.map(file => this.analyzeImage(file)));

    return analyses.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.warn(`Analysis failed for file ${files[index].name}:`, result.reason);
        return this.generateFallbackAnalysis(files[index]);
      }
    });
  }

  // Generate smart tags based on analysis
  public generateSmartTags(analysis: ImageAnalysis, filename: string): string[] {
    const tags = new Set<string>();

    // Add mood tags
    analysis.mood.forEach(mood => tags.add(mood.toLowerCase()));

    // Add style tags
    analysis.style.forEach(style => tags.add(style.toLowerCase()));

    // Add object tags
    analysis.objects.forEach(object => tags.add(object.toLowerCase()));

    // Add color-based tags
    if (analysis.colors.primary) {
      const colorName = this.getColorName(analysis.colors.primary);
      if (colorName) tags.add(colorName);
    }

    // Add composition tags
    if (analysis.composition.rule_of_thirds) tags.add('well-composed');
    if (analysis.composition.symmetry) tags.add('symmetric');
    if (analysis.composition.leading_lines) tags.add('dynamic');

    // Add quality tags
    if (analysis.quality_score > 80) tags.add('high-quality');
    if (analysis.aesthetic_score > 75) tags.add('aesthetic');

    // Add content tags
    if (analysis.faces > 0) {
      tags.add('people');
      if (analysis.faces === 1) tags.add('portrait');
      if (analysis.faces > 1) tags.add('group');
    }

    if (analysis.text_detected) {
      tags.add('text');
      tags.add('typography');
    }

    // Add filename-based tags
    const filenameLower = filename.toLowerCase();
    if (filenameLower.includes('logo')) tags.add('logo');
    if (filenameLower.includes('product')) tags.add('product');
    if (filenameLower.includes('lifestyle')) tags.add('lifestyle');
    if (filenameLower.includes('background')) tags.add('background');

    // Add brand safety tag
    if (analysis.brand_safety) tags.add('brand-safe');

    return Array.from(tags).slice(0, 15); // Limit to 15 tags
  }

  // Extract dominant colors from image
  public async extractColors(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = 100;
        canvas.height = 100;
        ctx?.drawImage(img, 0, 0, 100, 100);

        const imageData = ctx?.getImageData(0, 0, 100, 100);
        if (!imageData) {
          reject(new Error('Failed to get image data'));
          return;
        }

        const colors = this.quantizeColors(imageData.data);
        resolve(colors);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Generate fallback analysis when AI is unavailable
  private generateFallbackAnalysis(file: File): ImageAnalysis {
    const filename = file.name.toLowerCase();

    // Basic analysis based on filename and file properties
    const mood = [];
    const style = [];
    const objects = [];

    // Infer from filename
    if (filename.includes('professional') || filename.includes('business')) {
      mood.push('professional', 'formal');
      style.push('corporate', 'clean');
    } else if (filename.includes('casual') || filename.includes('lifestyle')) {
      mood.push('casual', 'relaxed');
      style.push('lifestyle', 'natural');
    } else if (filename.includes('modern') || filename.includes('minimal')) {
      mood.push('modern', 'sophisticated');
      style.push('minimalist', 'contemporary');
    } else {
      mood.push('neutral', 'versatile');
      style.push('general', 'adaptable');
    }

    // Infer objects from filename
    if (filename.includes('person') || filename.includes('people')) objects.push('person');
    if (filename.includes('product')) objects.push('product');
    if (filename.includes('building') || filename.includes('architecture'))
      objects.push('building');
    if (filename.includes('nature') || filename.includes('landscape')) objects.push('landscape');

    return {
      mood,
      style,
      colors: {
        primary: '#3B82F6',
        secondary: ['#1E40AF', '#60A5FA'],
        palette: ['#3B82F6', '#1E40AF', '#60A5FA', '#DBEAFE'],
      },
      composition: {
        rule_of_thirds: Math.random() > 0.5,
        symmetry: Math.random() > 0.7,
        leading_lines: Math.random() > 0.6,
      },
      objects,
      faces: filename.includes('person') || filename.includes('portrait') ? 1 : 0,
      text_detected: filename.includes('text') || filename.includes('typography'),
      quality_score: Math.floor(Math.random() * 20) + 70, // 70-90
      aesthetic_score: Math.floor(Math.random() * 25) + 65, // 65-90
      brand_safety: true,
    };
  }

  // Convert file to base64
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Get authentication token
  private getAuthToken(): string | null {
    // This would integrate with your auth system
    // For now, return null to use fallback analysis
    return null;
  }

  // Simple color quantization
  private quantizeColors(data: Uint8ClampedArray): string[] {
    const colors = new Map<string, number>();

    for (let i = 0; i < data.length; i += 16) {
      // Sample every 4th pixel
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      colors.set(hex, (colors.get(hex) || 0) + 1);
    }

    return Array.from(colors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color);
  }

  // Get color name from hex
  private getColorName(hex: string): string | null {
    const colorMap: Record<string, string> = {
      '#FF0000': 'red',
      '#00FF00': 'green',
      '#0000FF': 'blue',
      '#FFFF00': 'yellow',
      '#FF00FF': 'magenta',
      '#00FFFF': 'cyan',
      '#FFA500': 'orange',
      '#800080': 'purple',
      '#FFC0CB': 'pink',
      '#A52A2A': 'brown',
      '#808080': 'gray',
      '#000000': 'black',
      '#FFFFFF': 'white',
    };

    // Simple color matching (in production, use a proper color distance algorithm)
    const hexUpper = hex.toUpperCase();
    return colorMap[hexUpper] || null;
  }
}

// Export singleton instance
export const aiAnalysisService = AIAnalysisService.getInstance();
