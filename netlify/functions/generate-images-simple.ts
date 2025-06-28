import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

interface SimpleImageRequest {
  prompt: string;
  territory?: {
    id: string;
    title: string;
    positioning: string;
    tone: string;
  };
  imageType?: 'product' | 'lifestyle' | 'background' | 'hero' | 'icon' | 'pattern';
  quality?: 'standard' | 'hd' | 'ultra';
}

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    };
  }

  try {
    const requestBody: SimpleImageRequest = JSON.parse(event.body || '{}');
    
    if (!requestBody.prompt) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ success: false, error: 'Prompt is required' }),
      };
    }

    // Get API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ success: false, error: 'Service configuration error' }),
      };
    }

    console.log('🎨 Starting image generation with prompt:', requestBody.prompt);

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey
    });

    const imageType = requestBody.imageType || 'background';
    const quality = requestBody.quality || 'standard';

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
      prompt: requestBody.prompt,
      n: 1,
      size: (sizeMap[imageType] || "1024x1792") as "1024x1024" | "1792x1024" | "1024x1792",
      quality: quality === 'ultra' ? 'hd' : quality as 'standard' | 'hd',
      style: "natural"
    });

    const imageUrl = response.data?.[0]?.url;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from API');
    }

    console.log('✅ Image generated successfully');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        data: [{
          territoryIndex: 0,
          headlineIndex: 0,
          imageUrl,
          prompt: requestBody.prompt
        }],
        message: 'Image generated successfully'
      }),
    };

  } catch (error: any) {
    console.error('❌ Image generation error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate image'
      }),
    };
  }
};