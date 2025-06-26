import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import OpenAI from 'openai';
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

interface ImageRequest {
  territories: Array<{
    id: string;
    title: string;
    tone: string;
    positioning?: string;
    headlines: Array<{
      text: string;
      followUp: string;
    }>;
  }>;
  brief: string;
  // Enhanced generation options
  imageType?: 'product' | 'lifestyle' | 'background' | 'hero' | 'icon' | 'pattern';
  culturalContext?: 'australian' | 'global' | 'regional';
  styleConsistency?: boolean;
  quality?: 'standard' | 'hd' | 'ultra';
  provider?: 'openai' | 'midjourney' | 'stable-diffusion';
  brandGuidelines?: {
    colors: {
      primary: string;
      secondary: string[];
      accent: string[];
      neutral: string[];
    };
    style: string[];
    tone: string;
  };
}

interface ImageResponse {
  success: boolean;
  data?: Array<{
    territoryIndex: number;
    headlineIndex: number;
    imageUrl: string;
    prompt: string;
  }>;
  error?: string;
}

// Helper function to create delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Extract style keywords from territory tone
const extractStyleKeywords = (tone: string): string[] => {
  const toneKeywords: Record<string, string[]> = {
    professional: ['clean', 'minimal', 'sophisticated', 'corporate'],
    friendly: ['warm', 'approachable', 'inviting', 'casual'],
    bold: ['dynamic', 'striking', 'powerful', 'confident'],
    elegant: ['refined', 'luxurious', 'graceful', 'premium'],
    playful: ['vibrant', 'energetic', 'fun', 'creative'],
    serious: ['formal', 'authoritative', 'trustworthy', 'reliable'],
    innovative: ['modern', 'cutting-edge', 'futuristic', 'tech-forward'],
    authentic: ['genuine', 'natural', 'honest', 'real'],
  };

  const lowerTone = tone.toLowerCase();
  for (const [key, keywords] of Object.entries(toneKeywords)) {
    if (lowerTone.includes(key)) {
      return keywords;
    }
  }

  return ['professional', 'high-quality', 'polished'];
};

// Enhanced AI-powered image generation with territory-driven prompts
const generateEnhancedImagePrompt = (
  headline: { text: string; followUp: string },
  territory: { title: string; tone: string; positioning?: string },
  brief: string,
  options: {
    imageType?: string;
    culturalContext?: string;
    styleConsistency?: boolean;
    brandGuidelines?: any;
  } = {}
): string => {
  const briefContext = brief.toLowerCase();
  const imageType = options.imageType || 'background';
  const culturalContext = options.culturalContext || 'australian';
  const positioning = territory.positioning || territory.title;
  
  // Enhanced prompt templates based on image type and cultural context
  const promptTemplates = {
    background: {
      australian: [
        {
          concept: 'serene Australian beach at golden hour',
          elements: 'gentle waves, native coastal vegetation, warm sand, endless horizon',
          colors: 'golden sunset, ocean blues, sandy beiges, natural earth tones'
        },
        {
          concept: 'peaceful eucalyptus forest',
          elements: 'ancient gum trees, dappled sunlight, native undergrowth, natural textures',
          colors: 'forest greens, warm browns, golden light, natural bark tones'
        },
        {
          concept: 'stunning Blue Mountains vista',
          elements: 'dramatic rock formations, morning mist, native bushland, distant valleys',
          colors: 'misty blues, green vegetation, warm rock tones, atmospheric depth'
        },
        {
          concept: 'tranquil Australian countryside',
          elements: 'rolling green hills, scattered gum trees, open landscapes, rural beauty',
          colors: 'pastoral greens, sky blues, earth browns, natural harmony'
        }
      ],
      global: [
        {
          concept: 'minimalist modern landscape',
          elements: 'clean geometric elements, subtle textures, professional composition',
          colors: 'neutral palette, sophisticated grays, premium whites, accent tones'
        },
        {
          concept: 'abstract gradient background',
          elements: 'smooth color transitions, professional depth, subtle patterns',
          colors: 'brand-appropriate gradients, modern aesthetics, premium feel'
        }
      ]
    },
    lifestyle: {
      australian: [
        {
          concept: 'authentic Australian lifestyle moment',
          elements: 'natural outdoor setting, relaxed atmosphere, genuine interactions',
          colors: 'warm natural lighting, authentic tones, lifestyle aesthetics'
        },
        {
          concept: 'modern Australian home environment',
          elements: 'contemporary design, natural materials, indoor-outdoor living',
          colors: 'modern neutrals, natural textures, sophisticated palette'
        }
      ],
      global: [
        {
          concept: 'contemporary lifestyle scene',
          elements: 'universal appeal, diverse representation, modern aesthetics',
          colors: 'globally relevant palette, contemporary styling, inclusive design'
        }
      ]
    },
    product: [
      {
        concept: 'clean product photography setup',
        elements: 'professional studio lighting, minimalist background, premium presentation',
        colors: 'neutral backdrop, perfect lighting, commercial quality'
      },
      {
        concept: 'elegant product showcase',
        elements: 'sophisticated styling, brand-consistent presentation, premium feel',
        colors: 'brand-appropriate palette, luxury aesthetics, professional quality'
      }
    ],
    hero: [
      {
        concept: 'powerful hero composition',
        elements: 'dramatic lighting, strong visual impact, emotional resonance',
        colors: 'bold palette, striking contrasts, premium aesthetics'
      },
      {
        concept: 'premium brand hero shot',
        elements: 'sophisticated composition, brand excellence, professional quality',
        colors: 'brand-consistent palette, luxury feel, impactful presentation'
      }
    ]
  };

  // Select appropriate template based on image type and cultural context
  let selectedTemplates = promptTemplates[imageType as keyof typeof promptTemplates];
  if (typeof selectedTemplates === 'object' && culturalContext in selectedTemplates) {
    selectedTemplates = selectedTemplates[culturalContext as keyof typeof selectedTemplates];
  }
  if (!Array.isArray(selectedTemplates)) {
    selectedTemplates = promptTemplates.background.australian;
  }

  const templateIndex = Math.abs(headline.text.length + territory.title.length) % selectedTemplates.length;
  const selectedTemplate = selectedTemplates[templateIndex];
  
  // Add seasonal context from brief if present
  let seasonalModifier = '';
  if (briefContext.includes('christmas') || briefContext.includes('holiday')) {
    seasonalModifier = ' with subtle winter atmosphere and cozy warmth';
  } else if (briefContext.includes('summer')) {
    seasonalModifier = ' with bright, fresh summer lighting';
  } else if (briefContext.includes('winter')) {
    seasonalModifier = ' with soft winter light and peaceful atmosphere';
  }

  // Extract style keywords from territory tone
  const styleKeywords = extractStyleKeywords(territory.tone);

  // Brand consistency elements
  const brandElements = options.brandGuidelines ? [
    `primary color ${options.brandGuidelines.colors.primary}`,
    `style elements: ${options.brandGuidelines.style.join(', ')}`,
    `brand tone: ${options.brandGuidelines.tone}`
  ].join(', ') : '';

  // Build enhanced prompt based on image type
  const basePrompt = imageType === 'background'
    ? `Create a beautiful, peaceful ${imageType} image for ${positioning}.`
    : `Create a stunning ${imageType} image that embodies "${positioning}".`;

  return `${basePrompt}

CONCEPT: ${selectedTemplate.concept}${seasonalModifier}
VISUAL ELEMENTS: ${selectedTemplate.elements}
COLOR PALETTE: ${selectedTemplate.colors}
TERRITORY TONE: ${territory.tone}
STYLE KEYWORDS: ${styleKeywords.join(', ')}
CULTURAL CONTEXT: ${culturalContext}
${brandElements ? `BRAND ELEMENTS: ${brandElements}` : ''}

STYLE REQUIREMENTS:
- ${imageType === 'background' ? 'Mobile-friendly vertical composition (9:16 ratio)' : 'Professional composition optimized for purpose'}
- ${imageType === 'background' ? 'Soft, subtle imagery perfect for text overlay' : 'Bold, impactful visual design'}
- High-quality, professional ${imageType === 'product' ? 'product photography' : 'creative imagery'}
- ${territory.tone} atmosphere and mood
- ${culturalContext === 'australian' ? 'Authentic Australian context and elements' : 'Universal appeal with global relevance'}
- Premium quality and sophisticated aesthetics

STRICT REQUIREMENTS - MUST AVOID:
- NO text, letters, words, or writing of any kind
- NO logos, brands, or commercial signage (unless specifically requested)
${imageType === 'background' ? '- NO busy patterns or overwhelming details that would interfere with text overlay' : ''}
${imageType === 'lifestyle' ? '- Ensure authentic, natural moments without staged appearance' : ''}
${imageType === 'product' ? '- Focus on clean, professional product presentation' : ''}

FOCUS: Create a ${territory.tone}, high-quality ${imageType} image that perfectly supports the territory positioning "${positioning}" with ${culturalContext} cultural relevance.`;
};

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const functionName = 'generate-images';
  let authResult: any;
  let requestBody: ImageRequest | undefined;

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
        error: authResult.error
      });
      return unauthorizedResponse(authResult.error);
    }

    const user = authResult.user;

    // Parse and validate request body
    try {
      requestBody = parseRequestBody<ImageRequest>(event.body);
    } catch (error: any) {
      logError(functionName, error, user.id);
      return errorResponse('Invalid request body', 400);
    }

    const { territories, brief } = requestBody;

    // Validate required fields
    const validationErrors: string[] = [];
    if (!territories || territories.length === 0) {
      validationErrors.push('Territories are required');
    }
    if (territories && territories.length > 10) {
      validationErrors.push('Too many territories (max 10)');
    }

    if (validationErrors.length > 0) {
      return validationErrorResponse(validationErrors);
    }

    // Get API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      logError(functionName, new Error('OpenAI API key not configured'), user.id);
      return errorResponse('Service configuration error', 500);
    }

    logRequest(functionName, event.httpMethod, user.id, {
      action: 'image_generation_start',
      territoriesCount: territories.length,
      plan: user.plan
    });

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey
    });

    const results = [];
    const batchSize = 3; // Process 3 images at a time to avoid rate limits

    // Collect all image requests
    const allImageRequests: Array<{
      headline: any;
      territory: any;
      territoryIndex: number;
      headlineIndex: number;
    }> = [];

    territories.forEach((territory, territoryIndex) => {
      territory.headlines.forEach((headline: any, headlineIndex: number) => {
        allImageRequests.push({
          headline,
          territory,
          territoryIndex,
          headlineIndex
        });
      });
    });

    // Process in batches
    for (let i = 0; i < allImageRequests.length; i += batchSize) {
      const batch = allImageRequests.slice(i, i + batchSize);
      console.log(`🎨 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allImageRequests.length / batchSize)}...`);
      
      // Process batch in parallel
      const batchPromises = batch.map(async (request) => {
        try {
          const imagePrompt = generateEnhancedImagePrompt(request.headline, request.territory, brief, {
            imageType: requestBody.imageType,
            culturalContext: requestBody.culturalContext,
            styleConsistency: requestBody.styleConsistency,
            brandGuidelines: requestBody.brandGuidelines
          });
          
          // Enhanced generation parameters based on request options
          const quality = requestBody.quality || 'standard';
          const imageType = requestBody.imageType || 'background';

          // Determine optimal size based on image type
          const sizeMap = {
            background: "1024x1792", // Tall mobile aspect ratio for backgrounds
            lifestyle: "1792x1024", // Landscape for lifestyle
            product: "1024x1024", // Square for products
            hero: "1792x1024", // Landscape for hero images
            icon: "1024x1024", // Square for icons
            pattern: "1024x1024" // Square for patterns
          };

          const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: imagePrompt,
            n: 1,
            size: sizeMap[imageType as keyof typeof sizeMap] || "1024x1792",
            quality: quality === 'ultra' ? 'hd' : quality as 'standard' | 'hd',
            style: requestBody.styleConsistency ? "natural" : "vivid"
          });

          const imageUrl = response.data?.[0]?.url;
          
          if (imageUrl) {
            return {
              territoryIndex: request.territoryIndex,
              headlineIndex: request.headlineIndex,
              imageUrl,
              prompt: imagePrompt
            };
          } else {
            throw new Error('No image URL returned from API');
          }
        } catch (error: any) {
          console.error(`❌ Failed to generate image for Territory ${request.territoryIndex + 1}, Headline ${request.headlineIndex + 1}:`, error.message);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result !== null));
      
      // Small delay between batches
      if (i + batchSize < allImageRequests.length) {
        await delay(2000);
      }
    }

    // Update user usage
    updateUserUsage(user.id);

    logRequest(functionName, event.httpMethod, user.id, {
      action: 'image_generation_success',
      imagesGenerated: results.length,
      territoriesProcessed: territories.length,
      plan: user.plan
    });

    console.log(`✅ Generated ${results.length} images successfully`);

    return successResponse(results, `Generated ${results.length} images successfully`);

  } catch (error: any) {
    const user = authResult?.user;
    logError(functionName, error, user?.id, {
      action: 'image_generation_failed',
      territoriesCount: requestBody?.territories?.length,
      plan: user?.plan
    });

    return errorResponse(error.message || 'Failed to generate images', 500);
  }
};

export { handler };
