import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import Anthropic from '@anthropic-ai/sdk';

interface GenerateRequest {
  prompt: string;
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
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('Claude API key not configured');
    }

    // Parse request body
    const body: GenerateRequest = JSON.parse(event.body || '{}');
    const { prompt } = body;

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log('🔄 Starting Claude API call...');
    console.log('Prompt length:', prompt.length);

    // Initialize Claude client securely on server-side
    const anthropic = new Anthropic({
      apiKey: apiKey
    });

    // Generate content with Claude
    console.log('🚀 Making Claude API request...');
    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4000,
      temperature: 0.8,
      messages: [
        {
          role: "user",
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
- confidence: Numerical score 1-100 based on market fit and effectiveness

${prompt}`
        }
      ]
    });

    const response = message.content[0]?.type === 'text' ? message.content[0].text : '';
    console.log('✅ Claude API response received:', !!response);
    
    if (!response) {
      throw new Error('No response from Claude');
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
    console.error('❌ Claude API Error:', error);
    
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
