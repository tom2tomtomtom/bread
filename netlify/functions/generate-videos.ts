import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { authenticateRequest, updateUserUsage } from './utils/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validateMethod,
  parseRequestBody,
  logRequest,
  logError,
  validationErrorResponse,
} from './utils/response';

interface VideoRequest {
  sourceImageId: string;
  sourceImageUrl: string;
  animationType: 'subtle_float' | 'gentle_rotation' | 'parallax' | 'zoom' | 'fade' | 'slide';
  duration: number; // in seconds
  outputFormat: 'mp4' | 'mov' | 'webm' | 'gif';
  platformOptimization: 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'linkedin' | 'twitter';
  provider?: 'runway' | 'stable-video' | 'openai';
  quality?: 'standard' | 'hd' | 'ultra';
  fps?: number;
  customPrompt?: string;
  territory?: {
    id: string;
    title: string;
    tone: string;
    positioning: string;
  };
}

interface VideoResponse {
  success: boolean;
  data?: {
    videoUrl: string;
    thumbnailUrl?: string;
    duration: number;
    format: string;
    size: number;
    generationTime: number;
    provider: string;
    metadata: {
      sourceImageId: string;
      animationType: string;
      quality: string;
      fps: number;
      platformOptimization: string;
    };
  };
  error?: string;
}

// Animation prompt templates for different types
const ANIMATION_PROMPTS = {
  SUBTLE_FLOAT: {
    template: `Create a gentle, ethereal floating animation for the image.
Movement: Soft, organic floating motion with subtle up and down movement
Duration: {duration} seconds
Style: Minimal, elegant, peaceful
Mood: {tone}

Animation characteristics:
- Smooth, natural floating motion
- Subtle depth perception and parallax
- Gentle breathing-like rhythm
- Professional, premium quality
- Seamless loop for continuous playback
- Brand-appropriate pacing and elegance`,
  },
  GENTLE_ROTATION: {
    template: `Generate a slow, graceful rotation animation.
Movement: Gentle 360-degree rotation around center axis
Duration: {duration} seconds
Style: Smooth, hypnotic, sophisticated
Mood: {tone}

Animation features:
- Consistent, steady rotation speed
- Perfect center-point rotation
- Seamless loop transition
- Professional presentation quality
- Brand-consistent timing and flow
- Elegant, mesmerizing effect`,
  },
  PARALLAX: {
    template: `Create a sophisticated parallax depth animation.
Movement: Multi-layer depth animation with foreground/background separation
Duration: {duration} seconds
Style: Modern, dynamic, cinematic
Mood: {tone}

Technical specifications:
- Layered depth movement simulation
- Smooth camera-like motion
- Professional cinematic quality
- Premium visual effects
- Brand-appropriate dynamics
- Engaging depth perception`,
  },
  ZOOM: {
    template: `Generate a smooth zoom animation effect.
Movement: Gradual zoom in/out with smooth scaling
Duration: {duration} seconds
Style: Cinematic, dramatic, engaging
Mood: {tone}

Animation details:
- Smooth scaling transformation
- Maintained image quality throughout
- Professional zoom timing
- Seamless loop capability
- Brand-consistent pacing
- High-quality visual presentation`,
  },
  FADE: {
    template: `Create an elegant fade transition animation.
Movement: Smooth opacity transitions with subtle effects
Duration: {duration} seconds
Style: Elegant, sophisticated, subtle
Mood: {tone}

Fade characteristics:
- Smooth opacity transitions
- Elegant timing curves
- Professional presentation
- Seamless loop capability
- Brand-appropriate subtlety
- Premium visual quality`,
  },
  SLIDE: {
    template: `Generate a smooth sliding animation effect.
Movement: Gentle sliding motion with smooth transitions
Duration: {duration} seconds
Style: Modern, clean, professional
Mood: {tone}

Slide features:
- Smooth directional movement
- Professional timing and easing
- Clean, modern aesthetic
- Seamless loop transition
- Brand-consistent motion
- High-quality presentation`,
  },
};

// Platform optimization settings
const PLATFORM_SPECS = {
  instagram: {
    aspectRatio: '9:16',
    maxDuration: 60,
    recommendedFps: 30,
    format: 'mp4',
    maxFileSize: 100 * 1024 * 1024, // 100MB
  },
  facebook: {
    aspectRatio: '16:9',
    maxDuration: 240,
    recommendedFps: 30,
    format: 'mp4',
    maxFileSize: 4 * 1024 * 1024 * 1024, // 4GB
  },
  tiktok: {
    aspectRatio: '9:16',
    maxDuration: 180,
    recommendedFps: 30,
    format: 'mp4',
    maxFileSize: 287 * 1024 * 1024, // 287MB
  },
  youtube: {
    aspectRatio: '16:9',
    maxDuration: 43200, // 12 hours
    recommendedFps: 60,
    format: 'mp4',
    maxFileSize: 256 * 1024 * 1024 * 1024, // 256GB
  },
  linkedin: {
    aspectRatio: '16:9',
    maxDuration: 600,
    recommendedFps: 30,
    format: 'mp4',
    maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
  },
  twitter: {
    aspectRatio: '16:9',
    maxDuration: 140,
    recommendedFps: 30,
    format: 'mp4',
    maxFileSize: 512 * 1024 * 1024, // 512MB
  },
};

// Helper function to create delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate animation prompt based on type and territory
const generateAnimationPrompt = (
  animationType: string,
  duration: number,
  territory?: { tone: string; positioning: string },
  customPrompt?: string
): string => {
  if (customPrompt) {
    return customPrompt;
  }

  const template = ANIMATION_PROMPTS[animationType.toUpperCase() as keyof typeof ANIMATION_PROMPTS];
  if (!template) {
    throw new Error(`Unsupported animation type: ${animationType}`);
  }

  const tone = territory?.tone || 'professional';
  
  return template.template
    .replace('{duration}', duration.toString())
    .replace('{tone}', tone);
};

// Validate video generation request
const validateVideoRequest = (request: VideoRequest): { valid: boolean; error?: string } => {
  if (!request.sourceImageUrl) {
    return { valid: false, error: 'Source image URL is required' };
  }

  if (!request.animationType) {
    return { valid: false, error: 'Animation type is required' };
  }

  if (!request.duration || request.duration < 1 || request.duration > 60) {
    return { valid: false, error: 'Duration must be between 1 and 60 seconds' };
  }

  const platformSpec = PLATFORM_SPECS[request.platformOptimization];
  if (platformSpec && request.duration > platformSpec.maxDuration) {
    return { 
      valid: false, 
      error: `Duration exceeds ${request.platformOptimization} maximum of ${platformSpec.maxDuration} seconds` 
    };
  }

  return { valid: true };
};

// Mock video generation (in production, this would call actual AI video services)
const generateVideoWithAI = async (
  sourceImageUrl: string,
  animationPrompt: string,
  options: {
    duration: number;
    quality: string;
    fps: number;
    format: string;
    provider: string;
  }
): Promise<{
  videoUrl: string;
  thumbnailUrl?: string;
  generationTime: number;
  fileSize: number;
}> => {
  console.log('🎬 Generating video with AI...', { sourceImageUrl, options });
  
  // Simulate AI video generation time
  const generationTime = options.duration * 1000 * (options.quality === 'ultra' ? 3 : options.quality === 'hd' ? 2 : 1);
  await delay(Math.min(generationTime, 10000)); // Cap at 10 seconds for demo

  // In production, this would:
  // 1. Call RunwayML API for video generation
  // 2. Call Stable Video Diffusion API
  // 3. Upload result to cloud storage
  // 4. Generate thumbnail
  // 5. Return actual URLs

  const mockVideoUrl = `https://generated-videos.example.com/video_${Date.now()}.${options.format}`;
  const mockThumbnailUrl = `https://generated-videos.example.com/thumb_${Date.now()}.jpg`;
  const mockFileSize = options.duration * 1024 * 1024 * (options.quality === 'ultra' ? 10 : options.quality === 'hd' ? 5 : 2);

  return {
    videoUrl: mockVideoUrl,
    thumbnailUrl: mockThumbnailUrl,
    generationTime,
    fileSize: mockFileSize,
  };
};

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const functionName = 'generate-videos';
  let authResult: any;
  let requestBody: VideoRequest | undefined;

  try {
    // Validate HTTP method
    const methodValidation = validateMethod(event.httpMethod, ['POST']);
    if (methodValidation) return methodValidation;

    logRequest(functionName, event.httpMethod);

    // Authenticate request
    authResult = authenticateRequest(event);
    if (!authResult.success || !authResult.user) {
      logRequest(functionName, event.httpMethod, undefined, {
        action: 'authentication_failed',
        reason: authResult.error || 'Unknown authentication error'
      });
      return unauthorizedResponse(authResult.error || 'Authentication failed');
    }

    const user = authResult.user;

    // Parse and validate request body
    const bodyParseResult = parseRequestBody<VideoRequest>(event.body);
    if (!bodyParseResult.success || !bodyParseResult.data) {
      return validationErrorResponse(bodyParseResult.error || 'Invalid request body');
    }

    requestBody = bodyParseResult.data;

    // Validate video request
    const validation = validateVideoRequest(requestBody);
    if (!validation.valid) {
      return validationErrorResponse(validation.error || 'Invalid video request');
    }

    // Get environment variables
    const runwayApiKey = process.env.RUNWAY_API_KEY;
    const stableVideoApiKey = process.env.STABLE_VIDEO_API_KEY;

    if (!runwayApiKey && !stableVideoApiKey) {
      return errorResponse('Video generation service not configured', 503);
    }

    logRequest(functionName, event.httpMethod, user.id, {
      action: 'video_generation_start',
      animationType: requestBody.animationType,
      duration: requestBody.duration,
      platform: requestBody.platformOptimization,
      plan: user.plan
    });

    // Generate animation prompt
    const animationPrompt = generateAnimationPrompt(
      requestBody.animationType,
      requestBody.duration,
      requestBody.territory,
      requestBody.customPrompt
    );

    // Set generation options
    const provider = requestBody.provider || 'runway';
    const quality = requestBody.quality || 'standard';
    const platformSpec = PLATFORM_SPECS[requestBody.platformOptimization];
    const fps = requestBody.fps || platformSpec?.recommendedFps || 30;

    console.log('🎬 Starting video generation...', {
      provider,
      quality,
      fps,
      duration: requestBody.duration,
      animationType: requestBody.animationType
    });

    // Generate video with AI
    const result = await generateVideoWithAI(
      requestBody.sourceImageUrl,
      animationPrompt,
      {
        duration: requestBody.duration,
        quality,
        fps,
        format: requestBody.outputFormat,
        provider,
      }
    );

    // Update user usage
    updateUserUsage(user.id);

    logRequest(functionName, event.httpMethod, user.id, {
      action: 'video_generation_success',
      duration: requestBody.duration,
      generationTime: result.generationTime,
      provider,
      plan: user.plan
    });

    console.log(`✅ Generated video successfully in ${result.generationTime}ms`);

    const responseData = {
      videoUrl: result.videoUrl,
      thumbnailUrl: result.thumbnailUrl,
      duration: requestBody.duration,
      format: requestBody.outputFormat,
      size: result.fileSize,
      generationTime: result.generationTime,
      provider,
      metadata: {
        sourceImageId: requestBody.sourceImageId,
        animationType: requestBody.animationType,
        quality,
        fps,
        platformOptimization: requestBody.platformOptimization,
      },
    };

    return successResponse(responseData, 'Video generated successfully');

  } catch (error: any) {
    const user = authResult?.user;
    logError(functionName, error, user?.id, {
      action: 'video_generation_failed',
      animationType: requestBody?.animationType,
      duration: requestBody?.duration,
      plan: user?.plan
    });

    return errorResponse(error.message || 'Failed to generate video', 500);
  }
};

export { handler };
