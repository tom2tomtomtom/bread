/**
 * 🧪 Multimedia Generation System Tests
 * 
 * Comprehensive test suite for the multimedia generation pipeline
 * including unit tests, integration tests, and end-to-end scenarios.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAssetStore } from '../stores/assetStore';
import { multimediaGenerationService } from '../services/multimediaGenerationService';
import { aiProviderService } from '../services/aiProviderService';
import {
  TextToImageRequest,
  ImageToVideoRequest,
  Territory,
  BrandGuidelines,
  GenerationQueue,
  GeneratedAsset,
} from '../types';

// Mock data
const mockTerritory: Territory = {
  id: 'test-territory-1',
  title: 'Premium Quality',
  positioning: 'The highest quality products for discerning customers',
  tone: 'sophisticated',
  headlines: [
    {
      text: 'Experience Premium Quality',
      followUp: 'Where excellence meets innovation',
      reasoning: 'Appeals to quality-conscious consumers',
      confidence: 92,
    },
  ],
  starred: false,
};

const mockBrandGuidelines: BrandGuidelines = {
  colors: {
    primary: '#007bff',
    secondary: ['#6c757d'],
    accent: ['#28a745'],
    neutral: ['#f8f9fa', '#e9ecef', '#dee2e6'],
    background: '#ffffff',
    text: '#212529',
  },
  fonts: {
    primary: 'Inter',
    secondary: 'Arial',
    fallbacks: ['sans-serif'],
  },
  logoUsage: {
    minSize: 24,
    clearSpace: 16,
    placement: 'top-right',
    variations: ['primary', 'white', 'black'],
  },
  spacing: {
    grid: 8,
    margins: 16,
    padding: 12,
  },
  imagery: {
    style: ['clean', 'modern'],
    filters: ['none', 'subtle'],
    overlayOpacity: 0.3,
  },
  compliance: {
    requiredElements: ['logo'],
    prohibitedElements: [],
    legalText: [],
  },
};

const mockTextToImageRequest: TextToImageRequest = {
  prompt: 'A beautiful premium product showcase',
  territory: mockTerritory,
  brandGuidelines: mockBrandGuidelines,
  imageType: 'product',
  styleConsistency: true,
  culturalContext: 'australian',
  provider: 'openai',
  quality: 'hd',
  dimensions: { width: 1024, height: 1024 },
};

const mockImageToVideoRequest: ImageToVideoRequest = {
  sourceImageId: 'test-image-1',
  sourceImageUrl: 'https://example.com/test-image.jpg',
  animationType: 'subtle_float',
  duration: 5,
  outputFormat: 'mp4',
  platformOptimization: 'instagram',
  provider: 'runway',
  quality: 'hd',
  fps: 30,
};

describe('Multimedia Generation Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Prompt Enhancement', () => {
    it('should enhance prompts with territory context', async () => {
      const enhancement = await multimediaGenerationService.enhancePromptForTerritory(
        'A product image',
        mockTerritory,
        mockBrandGuidelines,
        'product',
        'australian'
      );

      expect(enhancement.originalPrompt).toBe('A product image');
      expect(enhancement.enhancedPrompt).toContain('sophisticated');
      expect(enhancement.enhancedPrompt).toContain('premium');
      expect(enhancement.styleKeywords).toContain('refined');
      expect(enhancement.culturalAdaptations).toContain('Australian landscape');
      expect(enhancement.brandConsistencyElements).toContain('#007bff');
    });

    it('should adapt prompts for different cultural contexts', async () => {
      const australianEnhancement = await multimediaGenerationService.enhancePromptForTerritory(
        'A lifestyle image',
        mockTerritory,
        mockBrandGuidelines,
        'lifestyle',
        'australian'
      );

      const globalEnhancement = await multimediaGenerationService.enhancePromptForTerritory(
        'A lifestyle image',
        mockTerritory,
        mockBrandGuidelines,
        'lifestyle',
        'global'
      );

      expect(australianEnhancement.culturalAdaptations).toContain('Australian landscape');
      expect(globalEnhancement.culturalAdaptations).toContain('universal appeal');
    });

    it('should generate appropriate style keywords for different tones', () => {
      const service = multimediaGenerationService as any;
      
      const sophisticatedKeywords = service.extractStyleKeywords('sophisticated');
      const playfulKeywords = service.extractStyleKeywords('playful');
      const professionalKeywords = service.extractStyleKeywords('professional');

      expect(sophisticatedKeywords).toContain('refined');
      expect(playfulKeywords).toContain('vibrant');
      expect(professionalKeywords).toContain('clean');
    });
  });

  describe('Generation Queue Management', () => {
    it('should queue image generation requests', async () => {
      const queueId = await multimediaGenerationService.queueGeneration(mockTextToImageRequest, 'high');
      
      expect(queueId).toBeDefined();
      expect(queueId).toMatch(/^gen_\d+_[a-z0-9]+$/);
      
      const queueItem = multimediaGenerationService.getQueueStatus(queueId);
      expect(queueItem).toBeDefined();
      expect(queueItem?.type).toBe('image');
      expect(queueItem?.status).toBe('queued');
      expect(queueItem?.priority).toBe('high');
    });

    it('should queue video generation requests', async () => {
      const queueId = await multimediaGenerationService.queueGeneration(mockImageToVideoRequest, 'normal');
      
      expect(queueId).toBeDefined();
      
      const queueItem = multimediaGenerationService.getQueueStatus(queueId);
      expect(queueItem).toBeDefined();
      expect(queueItem?.type).toBe('video');
      expect(queueItem?.status).toBe('queued');
      expect(queueItem?.priority).toBe('normal');
    });

    it('should estimate generation time correctly', () => {
      const service = multimediaGenerationService as any;
      
      const imageTime = service.estimateGenerationTime(mockTextToImageRequest);
      const videoTime = service.estimateGenerationTime(mockImageToVideoRequest);
      
      expect(imageTime).toBeGreaterThan(30000); // At least 30 seconds
      expect(videoTime).toBeGreaterThan(imageTime); // Videos take longer
    });

    it('should return all queue items', () => {
      const queueItems = multimediaGenerationService.getAllQueueItems();
      expect(Array.isArray(queueItems)).toBe(true);
    });
  });

  describe('Video Animation Prompts', () => {
    it('should generate appropriate animation prompts', async () => {
      const floatPrompt = await multimediaGenerationService.enhanceVideoPrompt(
        { ...mockImageToVideoRequest, animationType: 'subtle_float' },
        mockTerritory
      );

      const rotationPrompt = await multimediaGenerationService.enhanceVideoPrompt(
        { ...mockImageToVideoRequest, animationType: 'gentle_rotation' },
        mockTerritory
      );

      expect(floatPrompt).toContain('floating');
      expect(floatPrompt).toContain('sophisticated');
      expect(rotationPrompt).toContain('rotation');
      expect(rotationPrompt).toContain('sophisticated');
    });

    it('should use custom prompts when provided', async () => {
      const customPrompt = 'Custom animation with special effects';
      const result = await multimediaGenerationService.enhanceVideoPrompt(
        { ...mockImageToVideoRequest, customPrompt },
        mockTerritory
      );

      expect(result).toBe(customPrompt);
    });
  });
});

describe('AI Provider Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Provider Fallback', () => {
    it('should use preferred provider first', async () => {
      const request = { ...mockTextToImageRequest, provider: 'midjourney' as const };
      
      // Mock successful generation
      vi.spyOn(aiProviderService as any, 'generateWithMidjourney').mockResolvedValue({
        id: 'test-asset',
        type: 'image',
        provider: 'midjourney',
      });

      const result = await aiProviderService.generateImage(request);
      expect(result.provider).toBe('midjourney');
    });

    it('should fallback to alternative providers on failure', async () => {
      const request = { ...mockTextToImageRequest, provider: 'midjourney' as const };
      
      // Mock midjourney failure and openai success
      vi.spyOn(aiProviderService as any, 'generateWithMidjourney').mockRejectedValue(new Error('API Error'));
      vi.spyOn(aiProviderService as any, 'generateWithOpenAI').mockResolvedValue({
        id: 'test-asset',
        type: 'image',
        provider: 'openai',
      });

      const result = await aiProviderService.generateImage(request);
      expect(result.provider).toBe('openai');
    });
  });

  describe('Rate Limiting', () => {
    it('should respect rate limits', () => {
      const rateLimiter = new (aiProviderService as any).constructor.prototype.constructor.RateLimiter();
      const mockConfig = {
        rateLimit: { requestsPerMinute: 2, requestsPerHour: 10 }
      };

      expect(rateLimiter.canMakeRequest('openai', mockConfig)).toBe(true);
      
      rateLimiter.recordRequest('openai');
      rateLimiter.recordRequest('openai');
      
      expect(rateLimiter.canMakeRequest('openai', mockConfig)).toBe(false);
    });

    it('should calculate next available time correctly', () => {
      const rateLimiter = new (aiProviderService as any).constructor.prototype.constructor.RateLimiter();
      const mockConfig = {
        rateLimit: { requestsPerMinute: 1, requestsPerHour: 10 }
      };

      rateLimiter.recordRequest('openai');
      const nextTime = rateLimiter.getNextAvailableTime('openai', mockConfig);
      
      expect(nextTime.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Provider Statistics', () => {
    it('should return provider statistics', () => {
      const stats = aiProviderService.getProviderStats();
      
      expect(stats).toHaveProperty('openai');
      expect(stats).toHaveProperty('midjourney');
      expect(stats).toHaveProperty('stable-diffusion');
      expect(stats).toHaveProperty('runway');
      expect(stats).toHaveProperty('stable-video');
      
      expect(stats.openai).toHaveProperty('requests');
      expect(stats.openai).toHaveProperty('cost');
      expect(stats.openai).toHaveProperty('successRate');
    });
  });
});

describe('Asset Store Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should integrate image generation with asset store', async () => {
    const { result } = renderHook(() => useAssetStore());

    await act(async () => {
      const queueId = await result.current.generateImage(mockTextToImageRequest);
      expect(queueId).toBeDefined();
    });

    expect(result.current.isGeneratingImage).toBe(false);
    expect(result.current.generationQueue.length).toBeGreaterThan(0);
  });

  it('should integrate video generation with asset store', async () => {
    const { result } = renderHook(() => useAssetStore());

    await act(async () => {
      const queueId = await result.current.generateVideo(mockImageToVideoRequest);
      expect(queueId).toBeDefined();
    });

    expect(result.current.isGeneratingVideo).toBe(false);
    expect(result.current.generationQueue.length).toBeGreaterThan(0);
  });

  it('should handle generation errors gracefully', async () => {
    const { result } = renderHook(() => useAssetStore());

    // Mock service to throw error
    vi.spyOn(multimediaGenerationService, 'queueGeneration').mockRejectedValue(new Error('Generation failed'));

    await act(async () => {
      try {
        await result.current.generateImage(mockTextToImageRequest);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    expect(result.current.generationError).toBeDefined();
    expect(result.current.isGeneratingImage).toBe(false);
  });

  it('should clear generation errors', async () => {
    const { result } = renderHook(() => useAssetStore());

    // Set an error first
    await act(async () => {
      result.current.clearGenerationError();
    });

    expect(result.current.generationError).toBeNull();
  });

  it('should manage generation queue operations', async () => {
    const { result } = renderHook(() => useAssetStore());

    // Add items to queue
    await act(async () => {
      await result.current.generateImage(mockTextToImageRequest);
      await result.current.generateVideo(mockImageToVideoRequest);
    });

    expect(result.current.generationQueue.length).toBe(2);

    // Clear queue
    await act(async () => {
      result.current.clearGenerationQueue();
    });

    expect(result.current.generationQueue.length).toBe(0);
  });
});

describe('End-to-End Multimedia Generation', () => {
  it('should complete full image generation workflow', async () => {
    // 1. Enhance prompt
    const enhancement = await multimediaGenerationService.enhancePromptForTerritory(
      mockTextToImageRequest.prompt,
      mockTerritory,
      mockBrandGuidelines,
      'product',
      'australian'
    );

    expect(enhancement.enhancedPrompt).toBeDefined();

    // 2. Queue generation
    const queueId = await multimediaGenerationService.queueGeneration(mockTextToImageRequest);
    expect(queueId).toBeDefined();

    // 3. Check queue status
    const queueItem = multimediaGenerationService.getQueueStatus(queueId);
    expect(queueItem).toBeDefined();
    expect(queueItem?.status).toBe('queued');
  });

  it('should complete full video generation workflow', async () => {
    // 1. Generate animation prompt
    const animationPrompt = await multimediaGenerationService.enhanceVideoPrompt(
      mockImageToVideoRequest,
      mockTerritory
    );

    expect(animationPrompt).toContain('floating');

    // 2. Queue generation
    const queueId = await multimediaGenerationService.queueGeneration(mockImageToVideoRequest);
    expect(queueId).toBeDefined();

    // 3. Check queue status
    const queueItem = multimediaGenerationService.getQueueStatus(queueId);
    expect(queueItem).toBeDefined();
    expect(queueItem?.type).toBe('video');
  });

  it('should handle batch generation requests', async () => {
    const batchRequest = {
      requests: [mockTextToImageRequest, mockImageToVideoRequest],
      priority: 'normal' as const,
    };

    const batchId = await multimediaGenerationService.batchGenerate(batchRequest);
    expect(batchId).toBeDefined();
  });
});

describe('Quality Assessment', () => {
  it('should assess generated asset quality', async () => {
    const { result } = renderHook(() => useAssetStore());

    await act(async () => {
      const assessment = await result.current.assessQuality(
        'test-asset-id',
        mockTerritory,
        mockBrandGuidelines
      );

      expect(assessment.score).toBeGreaterThan(0);
      expect(assessment.score).toBeLessThanOrEqual(100);
      expect(assessment.brandCompliance).toBeDefined();
      expect(assessment.technicalQuality).toBeDefined();
      expect(assessment.creativityScore).toBeDefined();
      expect(assessment.territoryAlignment).toBeDefined();
    });
  });
});

describe('Error Handling and Resilience', () => {
  it('should handle network errors gracefully', async () => {
    // Mock network failure
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    try {
      await multimediaGenerationService.queueGeneration(mockTextToImageRequest);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should retry failed generations', async () => {
    const { result } = renderHook(() => useAssetStore());

    // Mock initial failure
    const queueId = await multimediaGenerationService.queueGeneration(mockTextToImageRequest);
    
    await act(async () => {
      await result.current.retryGeneration(queueId);
    });

    const queueItem = result.current.getGenerationStatus(queueId);
    expect(queueItem?.retryCount).toBeGreaterThan(0);
  });

  it('should cancel ongoing generations', async () => {
    const { result } = renderHook(() => useAssetStore());

    const queueId = await multimediaGenerationService.queueGeneration(mockTextToImageRequest);
    
    await act(async () => {
      await result.current.cancelGeneration(queueId);
    });

    const queueItem = result.current.getGenerationStatus(queueId);
    expect(queueItem?.status).toBe('cancelled');
  });
});
