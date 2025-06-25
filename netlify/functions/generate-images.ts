import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import OpenAI from 'openai';

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
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Get API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Parse request body
    const body: ImageRequest = JSON.parse(event.body || '{}');
    const { territories, brief } = body;

    if (!territories || territories.length === 0) {
      throw new Error('Territories are required');
    }

    console.log('🎨 Starting image generation for', territories.length, 'territories...');

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

    console.log(`✅ Generated ${results.length} images successfully`);

    const response: ImageResponse = {
      success: true,
      data: results
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify(response)
    };

  } catch (error: any) {
    console.error('❌ Image generation error:', error);
    
    const errorResponse: ImageResponse = {
      success: false,
      error: error.message || 'Unknown error occurred'
    };

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify(errorResponse)
    };
  }
};

export { handler };
