import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import Anthropic from '@anthropic-ai/sdk';
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

interface GenerateRequest {
  prompt: string;
}

interface GenerateResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const functionName = 'generate-claude';
  let authResult: any;
  let requestBody: GenerateRequest | undefined;

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
      requestBody = parseRequestBody<GenerateRequest>(event.body);
    } catch (error: any) {
      logError(functionName, error, user.id);
      return errorResponse('Invalid request body', 400);
    }

    const { prompt } = requestBody;

    // Validate required fields
    const validationErrors: string[] = [];
    if (!prompt || prompt.trim().length === 0) {
      validationErrors.push('Prompt is required');
    }
    if (prompt && prompt.length > 10000) {
      validationErrors.push('Prompt is too long (max 10,000 characters)');
    }

    if (validationErrors.length > 0) {
      return validationErrorResponse(validationErrors);
    }

    // Get API key from environment variables
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      logError(functionName, new Error('Claude API key not configured'), user.id);
      return errorResponse('Service configuration error', 500);
    }

    logRequest(functionName, event.httpMethod, user.id, {
      action: 'claude_generation_start',
      promptLength: prompt.length,
      plan: user.plan
    });

    // Initialize Claude client securely on server-side
    const anthropic = new Anthropic({
      apiKey: apiKey
    });

    // Generate content with Claude
    console.log('🚀 Making Claude API request...');
    const startTime = Date.now();
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

    // Update user usage
    updateUserUsage(user.id);

    // Log successful generation
    const endTime = Date.now();
    const duration = endTime - startTime;

    logRequest(functionName, event.httpMethod, user.id, {
      action: 'claude_generation_success',
      duration,
      territoriesGenerated: parsed.territories?.length || 0,
      plan: user.plan
    });

    return successResponse(parsed, 'Content generated successfully');

  } catch (error: any) {
    const user = authResult?.user;
    logError(functionName, error, user?.id, {
      action: 'claude_generation_failed',
      promptLength: requestBody?.prompt?.length,
      plan: user?.plan
    });

    return errorResponse(error.message || 'Failed to generate content', 500);
  }
};

export { handler };
