import { Handler } from '@netlify/functions';

interface ParsedBrief {
  goal: string;
  targetAudience: string;
  keyBenefits: string[];
  brandPersonality: string;
  productDetails: string;
  campaignRequirements: string;
  toneMood: string;
  callToAction: string;
  competitiveContext: string;
  constraints: string;
}

interface MotivationGenerationRequest {
  // Legacy fields for backward compatibility
  brief?: string;
  targetAudience?: string;
  campaignGoal?: string;
  templateType?: string;
  
  // New comprehensive brief data
  parsedBrief?: ParsedBrief;
  briefText?: string;
}

interface Motivation {
  id: string;
  title: string;
  description: string;
  psychologyType: 'fear' | 'desire' | 'social_proof' | 'urgency' | 'authority' | 'reciprocity' | 'scarcity' | 'curiosity';
  targetEmotion: string;
  reasoning: string;
  confidenceScore: number;
}

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const request: MotivationGenerationRequest = JSON.parse(event.body || '{}');
    
    // Check if we have parsed brief or legacy fields
    const hasParsedBrief = request.parsedBrief && request.parsedBrief.goal && request.parsedBrief.targetAudience;
    const hasLegacyFields = request.brief && request.targetAudience && request.campaignGoal;
    
    if (!hasParsedBrief && !hasLegacyFields) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required fields. Need either parsedBrief with goal/targetAudience or legacy brief/targetAudience/campaignGoal' 
        }),
      };
    }

    // Call OpenAI API to generate real motivations
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.log('No OpenAI API key found, using mock data');
      // Fallback to mock data if no API key
      const mockMotivations: Motivation[] = [
      {
        id: 'mot-1',
        title: 'Fear of Missing Out',
        description: 'Create urgency by highlighting limited availability or time-sensitive opportunities',
        psychologyType: 'fear',
        targetEmotion: 'Anxiety about missing opportunities',
        reasoning: 'FOMO drives immediate action and reduces hesitation in purchase decisions',
        confidenceScore: 87
      },
      {
        id: 'mot-2',
        title: 'Social Validation',
        description: 'Leverage peer approval and social proof to build trust and desire',
        psychologyType: 'social_proof',
        targetEmotion: 'Desire for acceptance and status',
        reasoning: 'People follow others\' actions, especially those they admire or relate to',
        confidenceScore: 82
      },
      {
        id: 'mot-3',
        title: 'Aspirational Achievement',
        description: 'Connect the product to personal goals and future self-image',
        psychologyType: 'desire',
        targetEmotion: 'Ambition and self-improvement',
        reasoning: 'Appeals to intrinsic motivation for growth and success',
        confidenceScore: 79
      },
      {
        id: 'mot-4',
        title: 'Expert Endorsement',
        description: 'Use authority figures and expert opinions to build credibility',
        psychologyType: 'authority',
        targetEmotion: 'Trust and confidence',
        reasoning: 'People defer to expertise and established authority in decision-making',
        confidenceScore: 85
      },
      {
        id: 'mot-5',
        title: 'Exclusive Access',
        description: 'Make audience feel special with insider or VIP treatment',
        psychologyType: 'scarcity',
        targetEmotion: 'Pride and exclusivity',
        reasoning: 'Scarcity increases perceived value and creates urgency',
        confidenceScore: 81
      },
      {
        id: 'mot-6',
        title: 'Problem Solution',
        description: 'Address specific pain points and offer clear resolution',
        psychologyType: 'desire',
        targetEmotion: 'Relief and hope',
        reasoning: 'People are motivated to solve problems and reduce friction',
        confidenceScore: 88
      }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        motivations: mockMotivations,
        metadata: {
          generated_at: new Date().toISOString(),
          request_id: Math.random().toString(36).substring(7),
          source: 'mock_data'
        },
      }),
    };
  }

  // Real OpenAI API call
  try {
    // Prepare campaign data from either parsed brief or legacy fields
    let campaignData = '';
    
    if (request.parsedBrief) {
      const pb = request.parsedBrief;
      campaignData = `
CAMPAIGN GOAL: ${pb.goal}
TARGET AUDIENCE: ${pb.targetAudience}
PRODUCT/SERVICE: ${pb.productDetails || 'Not specified'}
KEY BENEFITS: ${pb.keyBenefits.length > 0 ? pb.keyBenefits.join(', ') : 'Not specified'}
BRAND PERSONALITY: ${pb.brandPersonality || 'Not specified'}
TONE & MOOD: ${pb.toneMood || 'Not specified'}
CALL TO ACTION: ${pb.callToAction || 'Not specified'}
COMPETITIVE CONTEXT: ${pb.competitiveContext || 'Not specified'}
CAMPAIGN REQUIREMENTS: ${pb.campaignRequirements || 'Not specified'}
CONSTRAINTS: ${pb.constraints || 'Not specified'}

RAW BRIEF: ${request.briefText || 'Not provided'}`;
    } else {
      // Legacy format
      campaignData = `
CAMPAIGN GOAL: ${request.campaignGoal}
TARGET AUDIENCE: ${request.targetAudience}
BRIEF: ${request.brief}`;
    }

    const prompt = `Generate 6 psychological motivations for an advertising campaign based on the following detailed campaign information:

${campaignData}

Analyze all the provided information to create highly targeted motivations. Consider:
- The specific goal and how to drive action toward it
- The target audience's psychology, needs, and pain points
- How the product/service benefits align with audience desires
- The brand personality and desired tone
- Any competitive context or market positioning
- Campaign constraints and requirements

For each motivation, provide:
1. A compelling title (max 30 characters)
2. A description of how to use this motivation (max 100 characters)
3. The psychology type (one of: fear, desire, social_proof, urgency, authority, reciprocity, scarcity, curiosity)
4. The target emotion this motivation triggers
5. Reasoning for why this works for this specific audience and goal
6. A confidence score (0-100) based on how well it fits the brief

Return the response as a JSON array with this exact structure:
[
  {
    "id": "unique-id",
    "title": "Motivation Title",
    "description": "How to use this motivation",
    "psychologyType": "fear|desire|social_proof|urgency|authority|reciprocity|scarcity|curiosity",
    "targetEmotion": "Primary emotion triggered",
    "reasoning": "Why this works for the target audience and campaign goal",
    "confidenceScore": 85
  }
]

Make the motivations highly specific to the campaign details provided.`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert advertising psychologist who creates compelling motivations for marketing campaigns. Always respond with valid JSON arrays only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const generatedContent = openaiData.choices[0].message.content;
    
    // Parse the JSON response
    let aiMotivations;
    try {
      aiMotivations = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', generatedContent);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Validate and format the response
    const formattedMotivations = aiMotivations.map((motivation: any, index: number) => ({
      id: motivation.id || `ai-mot-${index + 1}`,
      title: motivation.title || 'Generated Motivation',
      description: motivation.description || 'AI-generated motivation description',
      psychologyType: motivation.psychologyType || 'desire',
      targetEmotion: motivation.targetEmotion || 'Positive response',
      reasoning: motivation.reasoning || 'AI-generated reasoning',
      confidenceScore: motivation.confidenceScore || 80
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        motivations: formattedMotivations,
        metadata: {
          generated_at: new Date().toISOString(),
          request_id: Math.random().toString(36).substring(7),
          source: 'openai_api',
          model: 'gpt-4'
        },
      }),
    };

  } catch (apiError) {
    console.error('OpenAI API error:', apiError);
    
    // Fallback to mock data on API error
    const fallbackMotivations: Motivation[] = [
      {
        id: 'fallback-1',
        title: 'Innovation Appeal',
        description: 'Highlight cutting-edge technology and future-forward thinking',
        psychologyType: 'desire',
        targetEmotion: 'Excitement and anticipation',
        reasoning: 'Tech-savvy audience values being first to adopt new innovations',
        confidenceScore: 85
      }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        motivations: fallbackMotivations,
        metadata: {
          generated_at: new Date().toISOString(),
          request_id: Math.random().toString(36).substring(7),
          source: 'fallback_data',
          api_error: 'OpenAI call failed'
        },
      }),
    };
  }

  } catch (error) {
    console.error('Error generating motivations:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error generating motivations',
      }),
    };
  }
};