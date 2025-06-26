import {
  UploadedAsset,
  AssetMetadata,
  ImageAnalysis,
  RightsInformation,
  AssetType,
  AssetFormat,
  AssetUploadConfig,
} from '../types';
import { cloudStorageService } from './cloudStorageService';
import { aiAnalysisService } from './aiAnalysisService';

// Asset processing and upload service
export class AssetService {
  private static instance: AssetService;
  private uploadConfig: AssetUploadConfig;

  private constructor() {
    this.uploadConfig = {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedFormats: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml',
        'video/mp4',
        'video/webm',
        'audio/mp3',
        'audio/wav',
        'application/pdf',
      ],
      maxFilesPerUpload: 10,
      enableAIAnalysis: true,
      autoGenerateThumbnails: true,
      compressionQuality: 0.8,
    };
  }

  public static getInstance(): AssetService {
    if (!AssetService.instance) {
      AssetService.instance = new AssetService();
    }
    return AssetService.instance;
  }

  // File validation
  public validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.uploadConfig.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.formatFileSize(this.uploadConfig.maxFileSize)}`,
      };
    }

    if (!this.uploadConfig.allowedFormats.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not supported`,
      };
    }

    return { valid: true };
  }

  // Extract metadata from file
  public async extractMetadata(file: File): Promise<AssetMetadata> {
    const metadata: AssetMetadata = {
      filename: this.generateUniqueFilename(file.name),
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
      fileHash: await this.calculateFileHash(file),
    };

    // Extract dimensions for images
    if (file.type.startsWith('image/')) {
      try {
        const dimensions = await this.getImageDimensions(file);
        metadata.dimensions = dimensions;

        // Extract color palette
        const colorPalette = await this.extractColorPalette(file);
        metadata.colorPalette = colorPalette.palette;
        metadata.dominantColor = colorPalette.dominant;
      } catch (error) {
        console.warn('Failed to extract image metadata:', error);
      }
    }

    // Extract duration for video/audio
    if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
      try {
        const duration = await this.getMediaDuration(file);
        metadata.duration = duration;
      } catch (error) {
        console.warn('Failed to extract media duration:', error);
      }
    }

    return metadata;
  }

  // Determine asset type from file
  public determineAssetType(file: File): AssetType {
    const filename = file.name.toLowerCase();

    // Check for specific patterns in filename
    if (filename.includes('logo') || filename.includes('brand')) {
      return 'logo';
    }

    if (filename.includes('product') || filename.includes('item')) {
      return 'product';
    }

    if (filename.includes('lifestyle') || filename.includes('scene')) {
      return 'lifestyle';
    }

    if (filename.includes('background') || filename.includes('bg')) {
      return 'background';
    }

    if (filename.includes('texture') || filename.includes('pattern')) {
      return 'texture';
    }

    if (filename.includes('icon') || filename.includes('ico')) {
      return 'icon';
    }

    // Default based on file type
    if (file.type.startsWith('image/')) {
      return 'other';
    }

    return 'other';
  }

  // Determine asset format from file
  public determineAssetFormat(file: File): AssetFormat {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type === 'application/pdf') return 'document';
    if (file.type.includes('zip') || file.type.includes('archive')) return 'archive';
    return 'document';
  }

  // Generate AI analysis for images
  public async generateAIAnalysis(file: File): Promise<ImageAnalysis | undefined> {
    if (!file.type.startsWith('image/') || !this.uploadConfig.enableAIAnalysis) {
      return undefined;
    }

    try {
      return await aiAnalysisService.analyzeImage(file);
    } catch (error) {
      console.warn('Failed to generate AI analysis:', error);
      return undefined;
    }
  }

  // Generate default rights information
  public generateDefaultRights(): RightsInformation {
    return {
      license: 'proprietary',
      usage_rights: ['internal_use'],
      attribution_required: false,
      commercial_use: true,
      modification_allowed: true,
    };
  }

  // Generate auto tags based on file and analysis
  public generateAutoTags(file: File, analysis?: ImageAnalysis): string[] {
    if (analysis) {
      // Use AI service for smart tag generation
      return aiAnalysisService.generateSmartTags(analysis, file.name);
    }

    // Fallback to basic filename-based tags
    const tags: string[] = [];
    const filename = file.name.toLowerCase();

    if (filename.includes('logo')) tags.push('logo', 'branding');
    if (filename.includes('product')) tags.push('product', 'commercial');
    if (filename.includes('lifestyle')) tags.push('lifestyle', 'people');
    if (filename.includes('background')) tags.push('background', 'texture');

    if (file.type.startsWith('image/')) {
      tags.push('image');
      if (file.type.includes('png')) tags.push('transparent');
      if (file.type.includes('svg')) tags.push('vector', 'scalable');
    }

    return Array.from(new Set(tags));
  }

  // Upload file to cloud storage
  public async uploadToCloud(
    file: File,
    metadata: AssetMetadata,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; thumbnailUrl?: string }> {
    return cloudStorageService.uploadFile(file, metadata, onProgress);
  }

  // Process complete asset upload
  public async processAssetUpload(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadedAsset> {
    // Validate file
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Extract metadata
    onProgress?.(10);
    const metadata = await this.extractMetadata(file);

    // Generate AI analysis
    onProgress?.(30);
    const aiAnalysis = await this.generateAIAnalysis(file);

    // Upload to cloud storage
    onProgress?.(50);
    const { url, thumbnailUrl } = await this.uploadToCloud(file, metadata, uploadProgress => {
      onProgress?.(50 + uploadProgress * 0.4); // 50-90%
    });

    // Create asset object
    onProgress?.(95);
    const asset: UploadedAsset = {
      id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      filename: metadata.filename,
      type: this.determineAssetType(file),
      format: this.determineAssetFormat(file),
      status: 'ready',
      url,
      thumbnailUrl,
      metadata,
      aiAnalysis,
      usageRights: this.generateDefaultRights(),
      tags: this.generateAutoTags(file, aiAnalysis),
      uploadedAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      collections: [],
      isPublic: false,
      isFavorite: false,
    };

    onProgress?.(100);
    return asset;
  }

  // Utility methods
  private generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const extension = originalName.split('.').pop();
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');

    return `${sanitizedName}_${timestamp}_${random}.${extension}`;
  }

  private async calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private async extractColorPalette(file: File): Promise<{ palette: string[]; dominant: string }> {
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

        // Simple color extraction (in production, use a proper color quantization algorithm)
        const colors = new Map<string, number>();
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 16) {
          // Sample every 4th pixel
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          colors.set(hex, (colors.get(hex) || 0) + 1);
        }

        const sortedColors = Array.from(colors.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([color]) => color);

        resolve({
          palette: sortedColors,
          dominant: sortedColors[0] || '#000000',
        });
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private async getMediaDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const media = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio');
      media.onloadedmetadata = () => {
        resolve(media.duration);
      };
      media.onerror = reject;
      media.src = URL.createObjectURL(file);
    });
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
  }
}

// Export singleton instance
export const assetService = AssetService.getInstance();
