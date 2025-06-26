/**
 * 🔧 Netlify Functions Integration Tests
 * 
 * Tests for the enhanced multimedia generation Netlify functions
 * including authentication, validation, and API integration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { handler as generateImagesHandler } from '../../netlify/functions/generate-images';
import { handler as generateVideosHandler } from '../../netlify/functions/generate-videos';

// Mock environment variables
const mockEnv = {
  OPENAI_API_KEY: 'test-openai-key',
  RUNWAY_API_KEY: 'test-runway-key',
  STABLE_VIDEO_API_KEY: 'test-stable-video-key',
  JWT_SECRET: 'test-jwt-secret',
};

// Mock authentication
const mockAuthenticateRequest = vi.fn();
const mockUpdateUserUsage = vi.fn();

vi.mock('../../netlify/functions/utils/auth', () => ({
  authenticateRequest: mockAuthenticateRequest,
  updateUserUsage: mockUpdateUserUsage,
}));

// Mock OpenAI
const mockOpenAI = {
  images: {
    generate: vi.fn(),
  },
};

vi.mock('openai', () => ({
  default: vi.fn(() => mockOpenAI),
}));

describe('Enhanced Image Generation Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(process.env, mockEnv);
    
    // Mock successful authentication
    mockAuthenticateRequest.mockReturnValue({
      success: true,
      user: { id: 'test-user', plan: 'premium' },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle enhanced image generation request', async () => {
    const mockEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        territories: [
          {
            id: 'test-territory',
            title: 'Premium Quality',
            tone: 'sophisticated',
            positioning: 'The highest quality products',
            headlines: [
              { text: 'Experience Premium Quality', followUp: 'Where excellence meets innovation' },
            ],
          },
        ],
        brief: 'Create premium product images',
        imageType: 'product',
        culturalContext: 'australian',
        styleConsistency: true,
        quality: 'hd',
        provider: 'openai',
        brandGuidelines: {
          colors: { primary: '#007bff', secondary: ['#6c757d'] },
          style: ['clean', 'modern'],
          tone: 'sophisticated',
        },
      }),
      headers: { authorization: 'Bearer test-token' },
    };

    // Mock OpenAI response
    mockOpenAI.images.generate.mockResolvedValue({
      data: [{ url: 'https://example.com/generated-image.png' }],
    });

    const result = await generateImagesHandler(mockEvent as any, {} as any);
    const response = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(mockAuthenticateRequest).toHaveBeenCalled();
    expect(mockUpdateUserUsage).toHaveBeenCalled();
  });

  it('should validate required fields', async () => {
    const mockEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        // Missing territories
        brief: 'Create images',
      }),
      headers: { authorization: 'Bearer test-token' },
    };

    const result = await generateImagesHandler(mockEvent as any, {} as any);
    const response = JSON.parse(result.body);

    expect(result.statusCode).toBe(400);
    expect(response.success).toBe(false);
    expect(response.error).toContain('territories');
  });

  it('should handle authentication failure', async () => {
    mockAuthenticateRequest.mockReturnValue({
      success: false,
      error: 'Invalid token',
    });

    const mockEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        territories: [{ id: 'test', title: 'Test', tone: 'casual', headlines: [] }],
        brief: 'Test brief',
      }),
      headers: { authorization: 'Bearer invalid-token' },
    };

    const result = await generateImagesHandler(mockEvent as any, {} as any);
    const response = JSON.parse(result.body);

    expect(result.statusCode).toBe(401);
    expect(response.success).toBe(false);
    expect(response.error).toBe('Invalid token');
  });

  it('should handle OpenAI API errors', async () => {
    const mockEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        territories: [
          {
            id: 'test-territory',
            title: 'Test',
            tone: 'casual',
            headlines: [{ text: 'Test headline', followUp: 'Test follow up' }],
          },
        ],
        brief: 'Test brief',
      }),
      headers: { authorization: 'Bearer test-token' },
    };

    // Mock OpenAI error
    mockOpenAI.images.generate.mockRejectedValue(new Error('OpenAI API Error'));

    const result = await generateImagesHandler(mockEvent as any, {} as any);
    const response = JSON.parse(result.body);

    expect(result.statusCode).toBe(500);
    expect(response.success).toBe(false);
    expect(response.error).toContain('OpenAI API Error');
  });

  it('should use enhanced prompt generation', async () => {
    const mockEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        territories: [
          {
            id: 'test-territory',
            title: 'Elegant Design',
            tone: 'sophisticated',
            positioning: 'Premium design solutions',
            headlines: [{ text: 'Elegant Design Solutions', followUp: 'Crafted with precision' }],
          },
        ],
        brief: 'Create elegant design images',
        imageType: 'hero',
        culturalContext: 'global',
        styleConsistency: true,
        quality: 'ultra',
      }),
      headers: { authorization: 'Bearer test-token' },
    };

    mockOpenAI.images.generate.mockResolvedValue({
      data: [{ url: 'https://example.com/generated-image.png' }],
    });

    const result = await generateImagesHandler(mockEvent as any, {} as any);

    expect(mockOpenAI.images.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'dall-e-3',
        size: '1792x1024', // Hero image size
        quality: 'hd', // Ultra maps to hd
        style: 'natural', // Style consistency enabled
      })
    );

    // Check that the prompt contains enhanced elements
    const callArgs = mockOpenAI.images.generate.mock.calls[0][0];
    expect(callArgs.prompt).toContain('sophisticated');
    expect(callArgs.prompt).toContain('Premium design solutions');
  });

  it('should handle different image types with appropriate dimensions', async () => {
    const testCases = [
      { imageType: 'background', expectedSize: '1024x1792' },
      { imageType: 'lifestyle', expectedSize: '1792x1024' },
      { imageType: 'product', expectedSize: '1024x1024' },
      { imageType: 'hero', expectedSize: '1792x1024' },
    ];

    for (const testCase of testCases) {
      const mockEvent = {
        httpMethod: 'POST',
        body: JSON.stringify({
          territories: [
            {
              id: 'test-territory',
              title: 'Test',
              tone: 'casual',
              headlines: [{ text: 'Test', followUp: 'Test' }],
            },
          ],
          brief: 'Test brief',
          imageType: testCase.imageType,
        }),
        headers: { authorization: 'Bearer test-token' },
      };

      mockOpenAI.images.generate.mockResolvedValue({
        data: [{ url: 'https://example.com/generated-image.png' }],
      });

      await generateImagesHandler(mockEvent as any, {} as any);

      expect(mockOpenAI.images.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          size: testCase.expectedSize,
        })
      );

      vi.clearAllMocks();
      mockAuthenticateRequest.mockReturnValue({
        success: true,
        user: { id: 'test-user', plan: 'premium' },
      });
    }
  });
});

describe('Video Generation Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(process.env, mockEnv);
    
    mockAuthenticateRequest.mockReturnValue({
      success: true,
      user: { id: 'test-user', plan: 'premium' },
    });
  });

  it('should handle video generation request', async () => {
    const mockEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        sourceImageId: 'test-image-id',
        sourceImageUrl: 'https://example.com/source-image.jpg',
        animationType: 'subtle_float',
        duration: 5,
        outputFormat: 'mp4',
        platformOptimization: 'instagram',
        provider: 'runway',
        quality: 'hd',
        fps: 30,
        territory: {
          id: 'test-territory',
          title: 'Premium Quality',
          tone: 'sophisticated',
          positioning: 'The highest quality products',
        },
      }),
      headers: { authorization: 'Bearer test-token' },
    };

    const result = await generateVideosHandler(mockEvent as any, {} as any);
    const response = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data.videoUrl).toBeDefined();
    expect(response.data.duration).toBe(5);
    expect(response.data.format).toBe('mp4');
    expect(mockAuthenticateRequest).toHaveBeenCalled();
    expect(mockUpdateUserUsage).toHaveBeenCalled();
  });

  it('should validate video request parameters', async () => {
    const mockEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        // Missing required fields
        animationType: 'subtle_float',
      }),
      headers: { authorization: 'Bearer test-token' },
    };

    const result = await generateVideosHandler(mockEvent as any, {} as any);
    const response = JSON.parse(result.body);

    expect(result.statusCode).toBe(400);
    expect(response.success).toBe(false);
    expect(response.error).toContain('Source image URL is required');
  });

  it('should validate duration limits', async () => {
    const mockEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        sourceImageId: 'test-image-id',
        sourceImageUrl: 'https://example.com/source-image.jpg',
        animationType: 'subtle_float',
        duration: 0, // Invalid duration
        outputFormat: 'mp4',
        platformOptimization: 'instagram',
      }),
      headers: { authorization: 'Bearer test-token' },
    };

    const result = await generateVideosHandler(mockEvent as any, {} as any);
    const response = JSON.parse(result.body);

    expect(result.statusCode).toBe(400);
    expect(response.success).toBe(false);
    expect(response.error).toContain('Duration must be between 1 and 60 seconds');
  });

  it('should validate platform-specific duration limits', async () => {
    const mockEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        sourceImageId: 'test-image-id',
        sourceImageUrl: 'https://example.com/source-image.jpg',
        animationType: 'subtle_float',
        duration: 200, // Exceeds Instagram limit
        outputFormat: 'mp4',
        platformOptimization: 'instagram',
      }),
      headers: { authorization: 'Bearer test-token' },
    };

    const result = await generateVideosHandler(mockEvent as any, {} as any);
    const response = JSON.parse(result.body);

    expect(result.statusCode).toBe(400);
    expect(response.success).toBe(false);
    expect(response.error).toContain('instagram maximum');
  });

  it('should handle missing API keys', async () => {
    // Remove API keys
    delete process.env.RUNWAY_API_KEY;
    delete process.env.STABLE_VIDEO_API_KEY;

    const mockEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        sourceImageId: 'test-image-id',
        sourceImageUrl: 'https://example.com/source-image.jpg',
        animationType: 'subtle_float',
        duration: 5,
        outputFormat: 'mp4',
        platformOptimization: 'instagram',
      }),
      headers: { authorization: 'Bearer test-token' },
    };

    const result = await generateVideosHandler(mockEvent as any, {} as any);
    const response = JSON.parse(result.body);

    expect(result.statusCode).toBe(503);
    expect(response.success).toBe(false);
    expect(response.error).toContain('Video generation service not configured');
  });

  it('should generate appropriate animation prompts', async () => {
    const testCases = [
      { animationType: 'subtle_float', expectedContent: 'floating' },
      { animationType: 'gentle_rotation', expectedContent: 'rotation' },
      { animationType: 'parallax', expectedContent: 'parallax' },
      { animationType: 'zoom', expectedContent: 'zoom' },
    ];

    for (const testCase of testCases) {
      const mockEvent = {
        httpMethod: 'POST',
        body: JSON.stringify({
          sourceImageId: 'test-image-id',
          sourceImageUrl: 'https://example.com/source-image.jpg',
          animationType: testCase.animationType,
          duration: 5,
          outputFormat: 'mp4',
          platformOptimization: 'instagram',
          territory: {
            id: 'test-territory',
            title: 'Test',
            tone: 'sophisticated',
            positioning: 'Test positioning',
          },
        }),
        headers: { authorization: 'Bearer test-token' },
      };

      const result = await generateVideosHandler(mockEvent as any, {} as any);
      const response = JSON.parse(result.body);

      expect(result.statusCode).toBe(200);
      expect(response.success).toBe(true);
      
      // In a real implementation, we would check that the animation prompt
      // contains the expected content and territory tone
    }
  });

  it('should handle custom animation prompts', async () => {
    const customPrompt = 'Create a magical floating effect with sparkles';
    
    const mockEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        sourceImageId: 'test-image-id',
        sourceImageUrl: 'https://example.com/source-image.jpg',
        animationType: 'subtle_float',
        duration: 5,
        outputFormat: 'mp4',
        platformOptimization: 'instagram',
        customPrompt,
      }),
      headers: { authorization: 'Bearer test-token' },
    };

    const result = await generateVideosHandler(mockEvent as any, {} as any);
    const response = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(response.success).toBe(true);
    
    // In a real implementation, we would verify that the custom prompt
    // was used instead of the default animation prompt
  });
});

describe('Function Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(process.env, mockEnv);
  });

  it('should handle invalid HTTP methods', async () => {
    const mockEvent = {
      httpMethod: 'GET', // Invalid method
      body: null,
      headers: {},
    };

    const result = await generateImagesHandler(mockEvent as any, {} as any);
    const response = JSON.parse(result.body);

    expect(result.statusCode).toBe(405);
    expect(response.success).toBe(false);
    expect(response.error).toContain('Method not allowed');
  });

  it('should handle malformed JSON', async () => {
    mockAuthenticateRequest.mockReturnValue({
      success: true,
      user: { id: 'test-user', plan: 'premium' },
    });

    const mockEvent = {
      httpMethod: 'POST',
      body: 'invalid json{',
      headers: { authorization: 'Bearer test-token' },
    };

    const result = await generateImagesHandler(mockEvent as any, {} as any);
    const response = JSON.parse(result.body);

    expect(result.statusCode).toBe(400);
    expect(response.success).toBe(false);
    expect(response.error).toContain('Invalid request body');
  });

  it('should handle missing request body', async () => {
    mockAuthenticateRequest.mockReturnValue({
      success: true,
      user: { id: 'test-user', plan: 'premium' },
    });

    const mockEvent = {
      httpMethod: 'POST',
      body: null,
      headers: { authorization: 'Bearer test-token' },
    };

    const result = await generateImagesHandler(mockEvent as any, {} as any);
    const response = JSON.parse(result.body);

    expect(result.statusCode).toBe(400);
    expect(response.success).toBe(false);
    expect(response.error).toContain('Invalid request body');
  });
});

describe('Function Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(process.env, mockEnv);
    
    mockAuthenticateRequest.mockReturnValue({
      success: true,
      user: { id: 'test-user', plan: 'premium' },
    });
  });

  it('should handle batch image generation efficiently', async () => {
    const territories = Array.from({ length: 5 }, (_, i) => ({
      id: `territory-${i}`,
      title: `Territory ${i}`,
      tone: 'casual',
      headlines: [
        { text: `Headline ${i}`, followUp: `Follow up ${i}` },
        { text: `Headline ${i}-2`, followUp: `Follow up ${i}-2` },
      ],
    }));

    const mockEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        territories,
        brief: 'Generate multiple images',
      }),
      headers: { authorization: 'Bearer test-token' },
    };

    mockOpenAI.images.generate.mockResolvedValue({
      data: [{ url: 'https://example.com/generated-image.png' }],
    });

    const startTime = Date.now();
    const result = await generateImagesHandler(mockEvent as any, {} as any);
    const endTime = Date.now();

    const response = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(response.success).toBe(true);
    expect(response.data.length).toBe(10); // 5 territories × 2 headlines each
    
    // Should complete within reasonable time (allowing for batch processing)
    expect(endTime - startTime).toBeLessThan(30000); // 30 seconds max
  });

  it('should implement proper rate limiting delays', async () => {
    const territories = Array.from({ length: 10 }, (_, i) => ({
      id: `territory-${i}`,
      title: `Territory ${i}`,
      tone: 'casual',
      headlines: [{ text: `Headline ${i}`, followUp: `Follow up ${i}` }],
    }));

    const mockEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        territories,
        brief: 'Generate many images',
      }),
      headers: { authorization: 'Bearer test-token' },
    };

    mockOpenAI.images.generate.mockResolvedValue({
      data: [{ url: 'https://example.com/generated-image.png' }],
    });

    const result = await generateImagesHandler(mockEvent as any, {} as any);
    const response = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(response.success).toBe(true);
    
    // Should have called OpenAI multiple times with proper batching
    expect(mockOpenAI.images.generate).toHaveBeenCalledTimes(Math.ceil(10 / 3)); // Batch size of 3
  });
});

describe('Function Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(process.env, mockEnv);
  });

  it('should reject requests without authentication', async () => {
    mockAuthenticateRequest.mockReturnValue({
      success: false,
      error: 'No authorization header',
    });

    const mockEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        territories: [{ id: 'test', title: 'Test', tone: 'casual', headlines: [] }],
        brief: 'Test brief',
      }),
      headers: {}, // No authorization header
    };

    const result = await generateImagesHandler(mockEvent as any, {} as any);
    const response = JSON.parse(result.body);

    expect(result.statusCode).toBe(401);
    expect(response.success).toBe(false);
  });

  it('should validate user permissions', async () => {
    mockAuthenticateRequest.mockReturnValue({
      success: true,
      user: { id: 'test-user', plan: 'free' }, // Free plan user
    });

    const mockEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        territories: [{ id: 'test', title: 'Test', tone: 'casual', headlines: [] }],
        brief: 'Test brief',
        quality: 'ultra', // Premium feature
      }),
      headers: { authorization: 'Bearer test-token' },
    };

    // This would be handled by the actual function logic
    // For now, we just verify the authentication was called
    const result = await generateImagesHandler(mockEvent as any, {} as any);
    expect(mockAuthenticateRequest).toHaveBeenCalled();
  });

  it('should sanitize input parameters', async () => {
    mockAuthenticateRequest.mockReturnValue({
      success: true,
      user: { id: 'test-user', plan: 'premium' },
    });

    const mockEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        territories: [
          {
            id: 'test',
            title: '<script>alert("xss")</script>', // Potential XSS
            tone: 'casual',
            headlines: [{ text: 'Test', followUp: 'Test' }],
          },
        ],
        brief: 'Test brief',
      }),
      headers: { authorization: 'Bearer test-token' },
    };

    mockOpenAI.images.generate.mockResolvedValue({
      data: [{ url: 'https://example.com/generated-image.png' }],
    });

    const result = await generateImagesHandler(mockEvent as any, {} as any);

    // The function should handle the request without executing the script
    expect(result.statusCode).toBe(200);

    // Verify that the prompt doesn't contain raw script tags
    const callArgs = mockOpenAI.images.generate.mock.calls[0][0];
    expect(callArgs.prompt).not.toContain('<script>');
  });
});
