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
    headlines: Array<{
      text: string;
      followUp: string;
    }>;
  }>;
  brief: string;
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

// Generate beautiful scenery background image prompts
const generateImagePrompt = (headline: { text: string; followUp: string }, territory: { title: string; tone: string }, brief: string): string => {
  const briefContext = brief.toLowerCase();
  
  // Define beautiful scenery options
  const sceneryOptions = [
    {
      concept: 'serene mountain landscape',
      elements: 'rolling hills, distant mountains, soft clouds, peaceful valley',
      colors: 'soft blues, gentle greens, warm earth tones, golden light'
    },
    {
      concept: 'tranquil ocean scene',
      elements: 'calm ocean waves, sandy beach, horizon line, gentle surf',
      colors: 'ocean blues, sandy beiges, soft whites, sunset oranges'
    },
    {
      concept: 'peaceful forest setting',
      elements: 'tall trees, dappled sunlight, forest path, natural greenery',
      colors: 'forest greens, warm browns, golden sunlight, natural earth tones'
    },
    {
      concept: 'beautiful sky and clouds',
      elements: 'fluffy clouds, open sky, soft light, atmospheric depth',
      colors: 'sky blues, cloud whites, sunset pinks, gentle purples'
    },
    {
      concept: 'gentle countryside',
      elements: 'rolling fields, distant trees, open landscape, natural beauty',
      colors: 'field greens, sky blues, earth browns, natural tones'
    }
  ];
  
  // Select scenery based on simple rotation
  const sceneryIndex = Math.abs(headline.text.length + territory.title.length) % sceneryOptions.length;
  const selectedScenery = sceneryOptions[sceneryIndex];
  
  // Add seasonal context from brief if present
  let seasonalModifier = '';
  if (briefContext.includes('christmas') || briefContext.includes('holiday')) {
    seasonalModifier = ' with subtle winter atmosphere and cozy warmth';
  } else if (briefContext.includes('summer')) {
    seasonalModifier = ' with bright, fresh summer lighting';
  } else if (briefContext.includes('winter')) {
    seasonalModifier = ' with soft winter light and peaceful atmosphere';
  }
  
  return `Create a beautiful, peaceful scenery background image.

SCENERY CONCEPT: ${selectedScenery.concept}${seasonalModifier}
VISUAL ELEMENTS: ${selectedScenery.elements}
COLOR PALETTE: ${selectedScenery.colors}

STYLE REQUIREMENTS:
- Clean, professional nature photography style
- Mobile-friendly vertical composition (9:16 ratio)
- Soft, subtle imagery perfect for text overlay
- Peaceful, calming, and inspiring atmosphere
- High-quality, beautiful natural scenery
- Gentle lighting and soft focus areas

STRICT REQUIREMENTS - MUST AVOID:
- NO text, letters, words, or writing of any kind
- NO people, faces, or human figures
- NO buildings, structures, or man-made objects
- NO busy patterns or overwhelming details
- NO logos, brands, or commercial signage
- NO vehicles, technology, or modern elements

FOCUS: Create a beautiful, peaceful natural scenery background that provides a calming, inspiring backdrop perfect for text overlay.`;
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
          const imagePrompt = generateImagePrompt(request.headline, request.territory, brief);
          
          const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: imagePrompt,
            n: 1,
            size: "1024x1792", // Tall mobile aspect ratio
            quality: "standard",
            style: "natural"
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
