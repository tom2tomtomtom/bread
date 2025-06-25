import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import OpenAI from 'openai';

interface GenerateRequest {
  prompt: string;
  generateImages: boolean;
  brief: string;
}

interface GenerateResponse {
  success: boolean;
  data?: any;
  error?: string;
}

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
    const body: GenerateRequest = JSON.parse(event.body || '{}');
    const { prompt, generateImages, brief } = body;

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log('🔄 Starting OpenAI API call...');
    console.log('Prompt length:', prompt.length);
    console.log('Generate images:', generateImages);

    // Initialize OpenAI client securely on server-side
    const openai = new OpenAI({
      apiKey: apiKey
      // No dangerouslyAllowBrowser needed on server-side
    });

    // Generate text content
    console.log('🚀 Making OpenAI API request...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Always respond with structured JSON containing territories and compliance data. 

Structure your response exactly like this:
{
  "territories": [
    {
      "id": "001",
      "title": "Territory Name",
      "positioning": "Clear positioning statement...",
      "tone": "Tone description",
      "headlines": [
        {
          "text": "Main headline text",
          "followUp": "Supporting follow-up line",
          "reasoning": "Why this headline works strategically",
          "confidence": 85
        }
      ]
    }
  ],
  "compliance": {
    "overallRisk": "LOW",
    "recommendations": ["Recommendation 1", "Recommendation 2"],
    "flaggedContent": []
  }
}

Generate exactly 6 territories, each with 3 headlines. For each headline, provide:
- text: The main headline
- followUp: A supporting line that reinforces the message
- reasoning: Strategic explanation of why this headline works
- confidence: Numerical score 1-100 based on market fit and effectiveness`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 4000
    });

    const response = completion.choices[0]?.message?.content;
    console.log('✅ OpenAI API response received:', !!response);
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the AI response
    let parsed;
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI response');
    }

    // TODO: Add image generation logic here if generateImages is true
    // This will be implemented in a separate function to keep this one focused

    const result: GenerateResponse = {
      success: true,
      data: parsed
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify(result)
    };

  } catch (error: any) {
    console.error('❌ OpenAI API Error:', error);
    
    const errorResponse: GenerateResponse = {
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
