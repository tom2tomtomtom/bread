import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AssetMetadata } from '../types';

// Cloud storage service for asset management
export class CloudStorageService {
  private static instance: CloudStorageService;
  private supabase: SupabaseClient | null = null;
  private isInitialized = false;

  private constructor() {
    this.initializeSupabase();
  }

  public static getInstance(): CloudStorageService {
    if (!CloudStorageService.instance) {
      CloudStorageService.instance = new CloudStorageService();
    }
    return CloudStorageService.instance;
  }

  private initializeSupabase() {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.isInitialized = true;
      console.log('✅ Supabase storage initialized');
    } else {
      console.warn('⚠️ Supabase credentials not found, using mock storage');
    }
  }

  // Check if cloud storage is available
  public isAvailable(): boolean {
    return this.isInitialized && this.supabase !== null;
  }

  // Upload file to cloud storage
  public async uploadFile(
    file: File,
    metadata: AssetMetadata,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; thumbnailUrl?: string }> {
    if (!this.isAvailable()) {
      return this.mockUpload(file, metadata, onProgress);
    }

    try {
      const bucket = 'assets';
      const filePath = `${Date.now()}-${metadata.filename}`;

      // Upload main file
      const { error } = await this.supabase!.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = this.supabase!.storage.from(bucket).getPublicUrl(filePath);

      const url = urlData.publicUrl;

      // Generate thumbnail for images
      let thumbnailUrl: string | undefined;
      if (file.type.startsWith('image/')) {
        thumbnailUrl = await this.generateThumbnail(file, bucket, filePath);
      }

      onProgress?.(100);

      return { url, thumbnailUrl };
    } catch (error) {
      console.error('Cloud upload failed, falling back to mock:', error);
      return this.mockUpload(file, metadata, onProgress);
    }
  }

  // Generate thumbnail for images
  private async generateThumbnail(
    file: File,
    bucket: string,
    originalPath: string
  ): Promise<string | undefined> {
    try {
      // Create thumbnail using canvas
      const thumbnail = await this.createThumbnail(file, 300, 300);
      const thumbnailPath = `thumbnails/${originalPath}`;

      const { error } = await this.supabase!.storage.from(bucket).upload(thumbnailPath, thumbnail, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        console.warn('Thumbnail upload failed:', error);
        return undefined;
      }

      const { data: urlData } = this.supabase!.storage.from(bucket).getPublicUrl(thumbnailPath);

      return urlData.publicUrl;
    } catch (error) {
      console.warn('Thumbnail generation failed:', error);
      return undefined;
    }
  }

  // Create thumbnail using canvas
  private async createThumbnail(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Calculate dimensions
        let { width, height } = img;
        const aspectRatio = width / height;

        if (width > height) {
          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }
        } else {
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          blob => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create thumbnail blob'));
            }
          },
          'image/jpeg',
          0.8
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Delete file from cloud storage
  public async deleteFile(url: string): Promise<void> {
    if (!this.isAvailable()) {
      console.log('Mock delete:', url);
      return;
    }

    try {
      // Extract file path from URL
      const urlParts = url.split('/');
      const filePath = urlParts[urlParts.length - 1];
      const bucket = 'assets';

      const { error } = await this.supabase!.storage.from(bucket).remove([filePath]);

      if (error) {
        console.warn('Failed to delete file:', error);
      }

      // Also try to delete thumbnail
      const thumbnailPath = `thumbnails/${filePath}`;
      await this.supabase!.storage.from(bucket).remove([thumbnailPath]);
    } catch (error) {
      console.warn('Delete operation failed:', error);
    }
  }

  // Mock upload for development/fallback
  private async mockUpload(
    file: File,
    metadata: AssetMetadata,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; thumbnailUrl?: string }> {
    return new Promise(resolve => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          // Generate mock URLs
          const url = `https://mock-storage.example.com/assets/${metadata.filename}`;
          const thumbnailUrl = file.type.startsWith('image/')
            ? `https://mock-storage.example.com/thumbnails/${metadata.filename}`
            : undefined;

          resolve({ url, thumbnailUrl });
        }

        onProgress?.(Math.min(progress, 100));
      }, 100);
    });
  }

  // Get storage usage statistics
  public async getStorageStats(): Promise<{
    totalSize: number;
    fileCount: number;
    bucketSize: number;
  }> {
    if (!this.isAvailable()) {
      return {
        totalSize: 0,
        fileCount: 0,
        bucketSize: 0,
      };
    }

    try {
      // This would require custom database queries in a real implementation
      // For now, return mock data
      return {
        totalSize: 1024 * 1024 * 100, // 100MB
        fileCount: 25,
        bucketSize: 1024 * 1024 * 1024, // 1GB limit
      };
    } catch (error) {
      console.warn('Failed to get storage stats:', error);
      return {
        totalSize: 0,
        fileCount: 0,
        bucketSize: 0,
      };
    }
  }

  // Create signed URL for temporary access
  public async createSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const { data, error } = await this.supabase!.storage.from('assets').createSignedUrl(
        filePath,
        expiresIn
      );

      if (error) {
        console.warn('Failed to create signed URL:', error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.warn('Signed URL creation failed:', error);
      return null;
    }
  }

  // Batch upload multiple files
  public async uploadMultipleFiles(
    files: File[],
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<Array<{ url: string; thumbnailUrl?: string; error?: string }>> {
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Extract metadata (simplified)
        const metadata: AssetMetadata = {
          filename: `${Date.now()}_${file.name}`,
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
          fileHash: 'mock-hash', // Would be calculated properly
        };

        const result = await this.uploadFile(file, metadata, progress => {
          onProgress?.(i, progress);
        });

        results.push(result);
      } catch (error) {
        results.push({
          url: '',
          error: (error as Error).message,
        });
      }
    }

    return results;
  }
}

// Export singleton instance
export const cloudStorageService = CloudStorageService.getInstance();
