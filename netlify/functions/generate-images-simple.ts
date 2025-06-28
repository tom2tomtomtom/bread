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
  console.log('📥 Function invoked:', event.httpMethod, event.path);
  
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('✅ Handling CORS preflight');
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
    console.log('❌ Invalid method:', event.httpMethod);
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
    console.log('📄 Parsing request body...');
    const requestBody: SimpleImageRequest = JSON.parse(event.body || '{}');
    console.log('📋 Request body parsed:', { prompt: requestBody.prompt?.substring(0, 50) + '...', imageType: requestBody.imageType });
    
    if (!requestBody.prompt) {
      console.log('❌ No prompt provided');
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
    console.log('🔑 Checking API key...');
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('🔑 API key status:', apiKey ? 'Present' : 'Missing');
    
    if (!apiKey) {
      console.log('❌ OpenAI API key not configured');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ success: false, error: 'Service configuration error - API key missing' }),
      };
    }

    console.log('🎨 Starting image generation with prompt:', requestBody.prompt);
    console.log('📏 Prompt length:', requestBody.prompt.length);

    // Truncate very long prompts (DALL-E 3 has limits)
    let finalPrompt = requestBody.prompt;
    if (finalPrompt.length > 1000) {
      finalPrompt = finalPrompt.substring(0, 1000);
      console.log('✂️ Truncated long prompt to 1000 characters');
    }

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

    console.log('🎯 Making OpenAI API call...');
    console.log('📋 Request params:', {
      model: "dall-e-3",
      prompt: requestBody.prompt.substring(0, 100) + '...',
      size: sizeMap[imageType] || "1024x1792",
      quality: quality === 'ultra' ? 'hd' : quality
    });

    // Add timeout specifically for OpenAI API call
    const openaiTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API timeout after 20 seconds')), 20000);
    });

    const openaiCall = openai.images.generate({
      model: "dall-e-3",
      prompt: finalPrompt,
      n: 1,
      size: (sizeMap[imageType] || "1024x1792") as "1024x1024" | "1792x1024" | "1024x1792",
      quality: quality === 'ultra' ? 'hd' : quality as 'standard' | 'hd',
      style: "natural"
    });

    console.log('⏰ Starting OpenAI API call with 20s timeout...');
    const response = await Promise.race([openaiCall, openaiTimeout]);
    console.log('✅ OpenAI API call completed');

    const imageUrl = response.data?.[0]?.url;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from API');
    }

    console.log('✅ Image generated successfully');
    console.log('📤 Sending response...');

    const responseBody = {
      success: true,
      data: [{
        territoryIndex: 0,
        headlineIndex: 0,
        imageUrl,
        prompt: finalPrompt
      }],
      message: 'Image generated successfully'
    };

    console.log('📋 Response body:', responseBody);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responseBody),
    };

  } catch (error: any) {
    console.error('❌ Image generation error:', error);
    console.error('❌ Error stack:', error.stack);
    
    const errorResponse = {
      success: false,
      error: error.message || 'Failed to generate image'
    };

    console.log('📤 Sending error response:', errorResponse);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorResponse),
    };
  }
};