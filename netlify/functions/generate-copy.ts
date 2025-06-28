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

interface CopyGenerationRequest {
  // Legacy fields for backward compatibility
  brief?: string;
  selectedMotivations: string[];
  templateType: string;
  targetAudience?: string;
  additionalRequirements?: string;
  
  // New comprehensive brief data
  parsedBrief?: ParsedBrief;
  briefText?: string;
}

interface CopyVariation {
  id: string;
  headline: string;
  bodyText: string;
  callToAction: string;
  subheadline?: string;
  motivationId: string;
  confidenceScore: number;
  reasoning: string;
  tone: 'urgent' | 'friendly' | 'professional' | 'emotional' | 'playful' | 'authoritative';
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
    const request: CopyGenerationRequest = JSON.parse(event.body || '{}');
    
    // Check if we have required data
    const hasParsedBrief = request.parsedBrief && request.parsedBrief.goal;
    const hasLegacyBrief = request.brief;
    const hasMotivations = request.selectedMotivations && request.selectedMotivations.length > 0;
    
    if (!hasMotivations) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required field: selectedMotivations' 
        }),
      };
    }
    
    if (!hasParsedBrief && !hasLegacyBrief) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required brief data. Need either parsedBrief or legacy brief field' 
        }),
      };
    }

    // Call OpenAI API to generate real copy
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.log('No OpenAI API key found, using mock data');
      // Fallback to mock data if no API key
      const mockCopyVariations: CopyVariation[] = [
      {
        id: 'copy-1',
        headline: 'Don\'t Miss Out - Limited Time Only!',
        bodyText: 'Join thousands who\'ve already discovered the secret to [benefit]. Available for a limited time only.',
        callToAction: 'Claim Yours Now',
        subheadline: 'Only 48 hours left',
        motivationId: 'mot-1', // FOMO
        confidenceScore: 89,
        reasoning: 'Creates immediate urgency while highlighting social proof and scarcity',
        tone: 'urgent'
      },
      {
        id: 'copy-2',
        headline: 'Join 50,000+ Happy Customers',
        bodyText: 'See why industry leaders and everyday heroes choose [product] to achieve their goals. Trusted by professionals worldwide.',
        callToAction: 'Join the Community',
        subheadline: 'Rated #1 by customers',
        motivationId: 'mot-2', // Social Proof
        confidenceScore: 85,
        reasoning: 'Leverages social validation and peer approval to build trust',
        tone: 'professional'
      },
      {
        id: 'copy-3',
        headline: 'Transform Your [Goal] in 30 Days',
        bodyText: 'Unlock your potential and achieve the results you\'ve always dreamed of. Your future self will thank you.',
        callToAction: 'Start Your Journey',
        subheadline: 'Results guaranteed',
        motivationId: 'mot-3', // Aspirational
        confidenceScore: 82,
        reasoning: 'Appeals to personal growth and future-focused thinking',
        tone: 'emotional'
      },
      {
        id: 'copy-4',
        headline: 'Recommended by Top Experts',
        bodyText: 'Leading professionals trust [product] for their most important projects. Experience the difference expertise makes.',
        callToAction: 'Get Expert Results',
        subheadline: 'Professionally endorsed',
        motivationId: 'mot-4', // Authority
        confidenceScore: 87,
        reasoning: 'Builds credibility through expert endorsement and authority',
        tone: 'authoritative'
      },
      {
        id: 'copy-5',
        headline: 'Exclusive Access for VIP Members',
        bodyText: 'You\'re invited to experience [product] before anyone else. This exclusive offer is reserved for select individuals.',
        callToAction: 'Access VIP Offer',
        subheadline: 'Invitation only',
        motivationId: 'mot-5', // Exclusivity
        confidenceScore: 83,
        reasoning: 'Creates sense of exclusivity and special treatment',
        tone: 'professional'
      },
      {
        id: 'copy-6',
        headline: 'Finally, A Solution That Actually Works',
        bodyText: 'Stop struggling with [problem]. Our proven solution eliminates the frustration and delivers real results.',
        callToAction: 'Solve This Today',
        subheadline: 'End the struggle now',
        motivationId: 'mot-6', // Problem Solution
        confidenceScore: 91,
        reasoning: 'Directly addresses pain points and offers clear resolution',
        tone: 'friendly'
      }
    ];

    // Filter variations based on selected motivations
    const filteredVariations = mockCopyVariations.filter(variation => 
      request.selectedMotivations.includes(variation.motivationId)
    );

    // If no motivations match, return a few general variations
    const finalVariations = filteredVariations.length > 0 
      ? filteredVariations 
      : mockCopyVariations.slice(0, 3);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        copyVariations: finalVariations,
        metadata: {
          generated_at: new Date().toISOString(),
          request_id: Math.random().toString(36).substring(7),
          selected_motivations: request.selectedMotivations,
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
DESIRED TONE & MOOD: ${pb.toneMood || 'Not specified'}
PREFERRED CALL TO ACTION: ${pb.callToAction || 'Not specified'}
COMPETITIVE CONTEXT: ${pb.competitiveContext || 'Not specified'}
CAMPAIGN REQUIREMENTS: ${pb.campaignRequirements || 'Not specified'}
CONSTRAINTS: ${pb.constraints || 'Not specified'}

RAW BRIEF: ${request.briefText || 'Not provided'}`;
    } else {
      // Legacy format
      campaignData = `
BRIEF: ${request.brief}
TARGET AUDIENCE: ${request.targetAudience || 'Not specified'}`;
    }

    const prompt = `Generate 3-4 compelling advertising copy variations based on the following detailed campaign information:

${campaignData}

SELECTED MOTIVATIONS: ${request.selectedMotivations.join(', ')}
TEMPLATE TYPE: ${request.templateType || 'general'}

Analyze all the provided campaign details to create highly targeted copy that:
- Aligns with the specific campaign goal and drives the desired action
- Resonates deeply with the target audience's psychology and needs
- Incorporates the key benefits and product details naturally
- Matches the desired brand personality and tone
- Uses the preferred call-to-action or creates appropriate alternatives
- Leverages the selected psychological motivations effectively
- Considers competitive context and positioning
- Adheres to any specified constraints or requirements

For each copy variation, provide:
1. A compelling headline (max 60 characters)
2. Body text that expands on the headline (max 150 characters)  
3. A strong call-to-action (max 20 characters)
4. An optional subheadline (max 40 characters)
5. The tone that best fits the brief (urgent, friendly, professional, emotional, playful, authoritative)
6. A confidence score (0-100) based on how well it fits the brief
7. Reasoning for why this copy works for the specific campaign
8. Which motivation ID it relates to most strongly

Return the response as a JSON array with this exact structure:
[
  {
    "id": "unique-id",
    "headline": "Compelling Headline",
    "bodyText": "Expanded body text that sells the benefit",
    "callToAction": "Action Text", 
    "subheadline": "Optional subheadline",
    "motivationId": "related-motivation",
    "confidenceScore": 85,
    "reasoning": "Why this copy works for this specific campaign and audience",
    "tone": "urgent|friendly|professional|emotional|playful|authoritative"
  }
]

Make the copy highly specific to the campaign details and motivations provided.`;

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
            content: 'You are an expert copywriter who creates compelling advertising copy. Always respond with valid JSON arrays only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.8,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const generatedContent = openaiData.choices[0].message.content;
    
    // Parse the JSON response
    let aiCopyVariations;
    try {
      aiCopyVariations = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', generatedContent);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Validate and format the response
    const formattedCopyVariations = aiCopyVariations.map((copy: any, index: number) => ({
      id: copy.id || `ai-copy-${index + 1}`,
      headline: copy.headline || 'Generated Headline',
      bodyText: copy.bodyText || 'AI-generated body text',
      callToAction: copy.callToAction || 'Learn More',
      subheadline: copy.subheadline || '',
      motivationId: copy.motivationId || request.selectedMotivations[0] || 'general',
      confidenceScore: copy.confidenceScore || 80,
      reasoning: copy.reasoning || 'AI-generated reasoning',
      tone: copy.tone || 'professional'
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        copyVariations: formattedCopyVariations,
        metadata: {
          generated_at: new Date().toISOString(),
          request_id: Math.random().toString(36).substring(7),
          selected_motivations: request.selectedMotivations,
          source: 'openai_api',
          model: 'gpt-4'
        },
      }),
    };

  } catch (apiError) {
    console.error('OpenAI API error:', apiError);
    
    // Fallback to a custom copy based on brief
    const fallbackCopy: CopyVariation[] = [
      {
        id: 'fallback-1',
        headline: 'Revolutionary Smart Technology',
        bodyText: 'Experience the future of home automation with AI-powered convenience.',
        callToAction: 'Pre-Order Now',
        subheadline: 'Early Bird Special',
        motivationId: request.selectedMotivations[0] || 'innovation',
        confidenceScore: 80,
        reasoning: 'Appeals to tech-savvy early adopters with innovation focus',
        tone: 'professional'
      }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        copyVariations: fallbackCopy,
        metadata: {
          generated_at: new Date().toISOString(),
          request_id: Math.random().toString(36).substring(7),
          selected_motivations: request.selectedMotivations,
          source: 'fallback_data',
          api_error: 'OpenAI call failed'
        },
      }),
    };
  }

  } catch (error) {
    console.error('Error generating copy:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error generating copy',
      }),
    };
  }
};