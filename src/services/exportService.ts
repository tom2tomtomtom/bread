/**
 * 📤 Multi-Format Export Service
 * 
 * Handles export of layouts to production-ready files across multiple channels
 * including social media, traditional advertising, digital ads, and retail formats.
 */

import {
  LayoutVariation,
  ExportConfiguration,
  ChannelFormat,
  ChannelSpecs,
} from '../types';
import { CHANNEL_SPECIFICATIONS } from './layoutGenerationService';

interface ExportResult {
  success: boolean;
  url?: string;
  filename?: string;
  format: ChannelFormat;
  size: number;
  error?: string;
}

interface BatchExportResult {
  results: ExportResult[];
  totalSize: number;
  successCount: number;
  failureCount: number;
  downloadUrl?: string; // ZIP file for batch downloads
}

class ExportService {
  /**
   * Export a single layout to specified format
   */
  async exportLayout(
    layout: LayoutVariation,
    config: ExportConfiguration
  ): Promise<ExportResult> {
    console.log('📤 Exporting layout:', layout.id, 'to format:', config.format);
    
    try {
      const specs = CHANNEL_SPECIFICATIONS[config.format];
      const filename = this.generateFilename(layout, config);
      
      // Generate the export based on format
      const exportData = await this.generateExport(layout, config, specs);
      
      // Create download URL
      const url = this.createDownloadUrl(exportData, config);
      
      const result: ExportResult = {
        success: true,
        url,
        filename,
        format: config.format,
        size: this.calculateFileSize(exportData),
      };
      
      console.log('✅ Layout exported successfully:', filename);
      return result;
      
    } catch (error) {
      console.error('Export failed:', error);
      return {
        success: false,
        format: config.format,
        size: 0,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }

  /**
   * Export layout to multiple formats
   */
  async exportMultipleFormats(
    layout: LayoutVariation,
    configs: ExportConfiguration[]
  ): Promise<BatchExportResult> {
    console.log('📦 Batch exporting layout to', configs.length, 'formats');
    
    const results: ExportResult[] = [];
    
    // Export to each format
    for (const config of configs) {
      const result = await this.exportLayout(layout, config);
      results.push(result);
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    const totalSize = results.reduce((sum, r) => sum + r.size, 0);
    
    // Create ZIP file for batch download if multiple successful exports
    let downloadUrl: string | undefined;
    if (successCount > 1) {
      downloadUrl = await this.createBatchDownload(results.filter(r => r.success));
    }
    
    const batchResult: BatchExportResult = {
      results,
      totalSize,
      successCount,
      failureCount,
      downloadUrl,
    };
    
    console.log(`✅ Batch export completed: ${successCount}/${results.length} successful`);
    return batchResult;
  }

  /**
   * Export all layouts in a project
   */
  async exportProject(
    layouts: LayoutVariation[],
    format: ChannelFormat,
    quality: ExportConfiguration['quality'] = 'production'
  ): Promise<BatchExportResult> {
    console.log('🗂️ Exporting project with', layouts.length, 'layouts');
    
    const results: ExportResult[] = [];
    
    for (const layout of layouts) {
      const config: ExportConfiguration = {
        format,
        quality,
        includeBleed: format.includes('print'),
        includeMarks: format.includes('print'),
        colorProfile: CHANNEL_SPECIFICATIONS[format].colorSpace === 'CMYK' ? 'CMYK' : 'sRGB',
        compression: quality === 'production' ? 90 : 75,
        metadata: {
          title: layout.name,
          description: layout.description,
          keywords: [layout.metadata.territoryId, format],
          copyright: '© AIDEAS Platform',
        },
      };
      
      const result = await this.exportLayout(layout, config);
      results.push(result);
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    const totalSize = results.reduce((sum, r) => sum + r.size, 0);
    
    // Create project ZIP
    const downloadUrl = await this.createProjectDownload(results.filter(r => r.success), format);
    
    return {
      results,
      totalSize,
      successCount,
      failureCount,
      downloadUrl,
    };
  }

  /**
   * Generate export data based on format
   */
  private async generateExport(
    layout: LayoutVariation,
    config: ExportConfiguration,
    specs: ChannelSpecs
  ): Promise<any> {
    switch (specs.fileFormat) {
      case 'PNG':
      case 'JPG':
        return this.generateImageExport(layout, config, specs);
      
      case 'PDF':
        return this.generatePDFExport(layout, config, specs);
      
      case 'SVG':
        return this.generateSVGExport(layout, config, specs);
      
      case 'MP4':
        return this.generateVideoExport(layout, config, specs);
      
      default:
        throw new Error(`Unsupported format: ${specs.fileFormat}`);
    }
  }

  /**
   * Generate image export (PNG/JPG)
   */
  private async generateImageExport(
    layout: LayoutVariation,
    config: ExportConfiguration,
    specs: ChannelSpecs
  ): Promise<string> {
    // In production, this would use Canvas API or server-side image generation
    const canvas = document.createElement('canvas');
    canvas.width = specs.width;
    canvas.height = specs.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');
    
    // Set background
    ctx.fillStyle = layout.colorScheme.background;
    ctx.fillRect(0, 0, specs.width, specs.height);
    
    // Render images (simplified - in production would load actual images)
    for (const image of layout.imageComposition) {
      ctx.fillStyle = '#e5e7eb'; // Placeholder color
      ctx.fillRect(image.x, image.y, image.width, image.height);
    }
    
    // Render text
    for (const text of layout.textPlacement) {
      ctx.fillStyle = text.color;
      ctx.font = `${text.fontWeight} ${text.fontSize}px ${text.fontFamily}`;
      ctx.textAlign = text.textAlign as CanvasTextAlign;
      ctx.fillText(text.content, text.x, text.y + text.fontSize);
    }
    
    // Convert to data URL
    const quality = config.compression / 100;
    return canvas.toDataURL(`image/${specs.fileFormat.toLowerCase()}`, quality);
  }

  /**
   * Generate PDF export
   */
  private async generatePDFExport(
    layout: LayoutVariation,
    config: ExportConfiguration,
    specs: ChannelSpecs
  ): Promise<string> {
    // In production, this would use a PDF generation library like jsPDF or PDFKit
    const pdfData = {
      layout,
      config,
      specs,
      generatedAt: new Date().toISOString(),
    };
    
    return `data:application/pdf;base64,${btoa(JSON.stringify(pdfData))}`;
  }

  /**
   * Generate SVG export
   */
  private async generateSVGExport(
    layout: LayoutVariation,
    config: ExportConfiguration,
    specs: ChannelSpecs
  ): Promise<string> {
    let svg = `<svg width="${specs.width}" height="${specs.height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Background
    svg += `<rect width="100%" height="100%" fill="${layout.colorScheme.background}"/>`;
    
    // Images (simplified)
    for (const image of layout.imageComposition) {
      svg += `<rect x="${image.x}" y="${image.y}" width="${image.width}" height="${image.height}" fill="#e5e7eb" opacity="${image.opacity}"/>`;
    }
    
    // Text
    for (const text of layout.textPlacement) {
      svg += `<text x="${text.x}" y="${text.y + text.fontSize}" font-family="${text.fontFamily}" font-size="${text.fontSize}" font-weight="${text.fontWeight}" fill="${text.color}" text-anchor="${text.textAlign === 'center' ? 'middle' : text.textAlign}">${text.content}</text>`;
    }
    
    svg += '</svg>';
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Generate video export (for animated formats)
   */
  private async generateVideoExport(
    layout: LayoutVariation,
    config: ExportConfiguration,
    specs: ChannelSpecs
  ): Promise<string> {
    // In production, this would generate actual video content
    // For now, return a placeholder
    const videoData = {
      layout,
      config,
      specs,
      type: 'video',
      generatedAt: new Date().toISOString(),
    };
    
    return `data:video/mp4;base64,${btoa(JSON.stringify(videoData))}`;
  }

  /**
   * Generate filename for export
   */
  private generateFilename(layout: LayoutVariation, config: ExportConfiguration): string {
    const sanitizedName = layout.name.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().slice(0, 10);
    const extension = CHANNEL_SPECIFICATIONS[config.format].fileFormat.toLowerCase();
    
    return `${sanitizedName}_${config.format}_${timestamp}.${extension}`;
  }

  /**
   * Create download URL from export data
   */
  private createDownloadUrl(exportData: string, config: ExportConfiguration): string {
    // In production, this would upload to CDN and return public URL
    return exportData;
  }

  /**
   * Calculate file size estimate
   */
  private calculateFileSize(exportData: string): number {
    // Rough estimate based on data URL length
    return Math.round(exportData.length * 0.75); // Base64 overhead
  }

  /**
   * Create batch download ZIP
   */
  private async createBatchDownload(results: ExportResult[]): Promise<string> {
    // In production, this would create an actual ZIP file
    const zipData = {
      type: 'batch_export',
      files: results.map(r => ({
        filename: r.filename,
        format: r.format,
        size: r.size,
      })),
      totalSize: results.reduce((sum, r) => sum + r.size, 0),
      createdAt: new Date().toISOString(),
    };
    
    return `data:application/zip;base64,${btoa(JSON.stringify(zipData))}`;
  }

  /**
   * Create project download ZIP
   */
  private async createProjectDownload(results: ExportResult[], format: ChannelFormat): Promise<string> {
    const projectData = {
      type: 'project_export',
      format,
      files: results.map(r => ({
        filename: r.filename,
        size: r.size,
      })),
      totalSize: results.reduce((sum, r) => sum + r.size, 0),
      createdAt: new Date().toISOString(),
    };
    
    return `data:application/zip;base64,${btoa(JSON.stringify(projectData))}`;
  }

  /**
   * Get export presets for different use cases
   */
  getExportPresets(): Record<string, ExportConfiguration[]> {
    return {
      'social_media_pack': [
        {
          format: 'instagram_post',
          quality: 'production',
          includeBleed: false,
          includeMarks: false,
          colorProfile: 'sRGB',
          compression: 85,
          metadata: {
            title: 'Instagram Post',
            description: 'Optimized for Instagram feed',
            keywords: ['social', 'instagram'],
            copyright: '© AIDEAS Platform',
          },
        },
        {
          format: 'instagram_story',
          quality: 'production',
          includeBleed: false,
          includeMarks: false,
          colorProfile: 'sRGB',
          compression: 85,
          metadata: {
            title: 'Instagram Story',
            description: 'Optimized for Instagram Stories',
            keywords: ['social', 'instagram', 'story'],
            copyright: '© AIDEAS Platform',
          },
        },
        {
          format: 'facebook_post',
          quality: 'production',
          includeBleed: false,
          includeMarks: false,
          colorProfile: 'sRGB',
          compression: 85,
          metadata: {
            title: 'Facebook Post',
            description: 'Optimized for Facebook feed',
            keywords: ['social', 'facebook'],
            copyright: '© AIDEAS Platform',
          },
        },
      ],
      
      'digital_ads_pack': [
        {
          format: 'banner_leaderboard',
          quality: 'production',
          includeBleed: false,
          includeMarks: false,
          colorProfile: 'sRGB',
          compression: 90,
          metadata: {
            title: 'Leaderboard Banner',
            description: 'Web banner advertisement',
            keywords: ['digital', 'banner', 'web'],
            copyright: '© AIDEAS Platform',
          },
        },
        {
          format: 'banner_rectangle',
          quality: 'production',
          includeBleed: false,
          includeMarks: false,
          colorProfile: 'sRGB',
          compression: 90,
          metadata: {
            title: 'Rectangle Banner',
            description: 'Medium rectangle web banner',
            keywords: ['digital', 'banner', 'web'],
            copyright: '© AIDEAS Platform',
          },
        },
      ],
      
      'print_pack': [
        {
          format: 'print_a4',
          quality: 'production',
          includeBleed: true,
          includeMarks: true,
          colorProfile: 'CMYK',
          compression: 100,
          metadata: {
            title: 'A4 Print',
            description: 'Print-ready A4 format',
            keywords: ['print', 'a4'],
            copyright: '© AIDEAS Platform',
          },
        },
        {
          format: 'billboard_landscape',
          quality: 'production',
          includeBleed: true,
          includeMarks: true,
          colorProfile: 'CMYK',
          compression: 95,
          metadata: {
            title: 'Billboard',
            description: 'Large format billboard',
            keywords: ['print', 'billboard', 'outdoor'],
            copyright: '© AIDEAS Platform',
          },
        },
      ],
    };
  }

  /**
   * Validate export configuration
   */
  validateExportConfig(config: ExportConfiguration): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!CHANNEL_SPECIFICATIONS[config.format]) {
      errors.push(`Unsupported format: ${config.format}`);
    }
    
    if (config.compression < 0 || config.compression > 100) {
      errors.push('Compression must be between 0 and 100');
    }
    
    if (!config.metadata.title) {
      errors.push('Title is required in metadata');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const exportService = new ExportService();
