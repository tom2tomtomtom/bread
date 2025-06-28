import { Handler } from '@netlify/functions';

interface BriefParsingRequest {
  briefText: string;
  fileName?: string;
}

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
    const request: BriefParsingRequest = JSON.parse(event.body || '{}');
    
    if (!request.briefText || request.briefText.trim().length < 10) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Brief text is required and must be at least 10 characters long' 
        }),
      };
    }

    // Call OpenAI API to parse the brief
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.log('No OpenAI API key found, using simple parsing');
      
      // Fallback to basic parsing if no API key
      const basicParsed: ParsedBrief = {
        goal: extractBasicField(request.briefText, ['goal', 'objective', 'purpose', 'aim']) || '',
        targetAudience: extractBasicField(request.briefText, ['audience', 'target', 'demographic', 'customer']) || '',
        keyBenefits: extractListItems(request.briefText, ['benefit', 'advantage', 'feature']) || [],
        brandPersonality: extractBasicField(request.briefText, ['personality', 'tone', 'voice', 'brand']) || '',
        productDetails: extractBasicField(request.briefText, ['product', 'service', 'offering']) || '',
        campaignRequirements: extractBasicField(request.briefText, ['requirement', 'specification', 'constraint']) || '',
        toneMood: extractBasicField(request.briefText, ['tone', 'mood', 'feeling', 'emotion']) || '',
        callToAction: extractBasicField(request.briefText, ['cta', 'call to action', 'action', 'button']) || '',
        competitiveContext: extractBasicField(request.briefText, ['competitor', 'competition', 'market']) || '',
        constraints: extractBasicField(request.briefText, ['constraint', 'limitation', 'restriction']) || ''
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          parsedBrief: basicParsed,
          metadata: {
            generated_at: new Date().toISOString(),
            request_id: Math.random().toString(36).substring(7),
            source: 'basic_parsing',
            fileName: request.fileName
          },
        }),
      };
    }

    // Real OpenAI API call for intelligent parsing
    try {
      const prompt = `Parse the following advertising brief and extract structured information. Be thorough and intelligent in your extraction.

Brief Text:
"${request.briefText}"

Extract the following fields from the brief. If a field is not explicitly mentioned, make reasonable inferences based on context or leave empty if no inference is possible:

1. goal: The main campaign objective or business goal
2. targetAudience: Who is the primary audience for this campaign
3. keyBenefits: List of product/service benefits or value propositions (as array)
4. brandPersonality: The brand's personality, voice, or positioning
5. productDetails: What product or service is being advertised
6. campaignRequirements: Specific campaign requirements, channels, or specifications
7. toneMood: The desired tone, mood, or emotional feeling for the campaign
8. callToAction: What action should the audience take
9. competitiveContext: Any mention of competitors or market positioning
10. constraints: Budget, timeline, or other constraints mentioned

Return ONLY a valid JSON object with this exact structure:
{
  "goal": "string",
  "targetAudience": "string", 
  "keyBenefits": ["string", "string"],
  "brandPersonality": "string",
  "productDetails": "string",
  "campaignRequirements": "string",
  "toneMood": "string",
  "callToAction": "string",
  "competitiveContext": "string",
  "constraints": "string"
}

Do not include any explanatory text, just the JSON object.`;

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
              content: 'You are an expert marketing strategist who specializes in parsing advertising briefs and extracting structured information. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.3, // Lower temperature for more consistent parsing
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const openaiData = await openaiResponse.json();
      const generatedContent = openaiData.choices[0].message.content;
      
      // Parse the JSON response
      let aiParsedBrief;
      try {
        aiParsedBrief = JSON.parse(generatedContent);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response as JSON:', generatedContent);
        throw new Error('Invalid JSON response from OpenAI');
      }

      // Validate and format the response
      const formattedBrief: ParsedBrief = {
        goal: aiParsedBrief.goal || '',
        targetAudience: aiParsedBrief.targetAudience || '',
        keyBenefits: Array.isArray(aiParsedBrief.keyBenefits) ? aiParsedBrief.keyBenefits : [],
        brandPersonality: aiParsedBrief.brandPersonality || '',
        productDetails: aiParsedBrief.productDetails || '',
        campaignRequirements: aiParsedBrief.campaignRequirements || '',
        toneMood: aiParsedBrief.toneMood || '',
        callToAction: aiParsedBrief.callToAction || '',
        competitiveContext: aiParsedBrief.competitiveContext || '',
        constraints: aiParsedBrief.constraints || ''
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          parsedBrief: formattedBrief,
          metadata: {
            generated_at: new Date().toISOString(),
            request_id: Math.random().toString(36).substring(7),
            source: 'openai_api',
            model: 'gpt-4',
            fileName: request.fileName
          },
        }),
      };

    } catch (apiError) {
      console.error('OpenAI API error:', apiError);
      
      // Fallback to basic parsing on API error
      const fallbackParsed: ParsedBrief = {
        goal: extractBasicField(request.briefText, ['goal', 'objective', 'purpose', 'aim']) || 'Goal extraction failed - please fill manually',
        targetAudience: extractBasicField(request.briefText, ['audience', 'target', 'demographic', 'customer']) || 'Audience extraction failed - please fill manually',
        keyBenefits: extractListItems(request.briefText, ['benefit', 'advantage', 'feature']) || [],
        brandPersonality: extractBasicField(request.briefText, ['personality', 'tone', 'voice', 'brand']) || '',
        productDetails: extractBasicField(request.briefText, ['product', 'service', 'offering']) || '',
        campaignRequirements: extractBasicField(request.briefText, ['requirement', 'specification', 'constraint']) || '',
        toneMood: extractBasicField(request.briefText, ['tone', 'mood', 'feeling', 'emotion']) || '',
        callToAction: extractBasicField(request.briefText, ['cta', 'call to action', 'action', 'button']) || '',
        competitiveContext: extractBasicField(request.briefText, ['competitor', 'competition', 'market']) || '',
        constraints: extractBasicField(request.briefText, ['constraint', 'limitation', 'restriction']) || ''
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          parsedBrief: fallbackParsed,
          metadata: {
            generated_at: new Date().toISOString(),
            request_id: Math.random().toString(36).substring(7),
            source: 'fallback_parsing',
            api_error: 'OpenAI call failed',
            fileName: request.fileName
          },
        }),
      };
    }

  } catch (error) {
    console.error('Error parsing brief:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error parsing brief',
      }),
    };
  }
};

// Helper functions for basic parsing
function extractBasicField(text: string, keywords: string[]): string | null {
  const lines = text.split('\n').map(line => line.trim());
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    for (const keyword of keywords) {
      if (lowerLine.includes(keyword.toLowerCase())) {
        // Look for content after a colon
        if (line.includes(':')) {
          const parts = line.split(':');
          if (parts.length > 1) {
            return parts.slice(1).join(':').trim();
          }
        }
        // If no colon, return the whole line if it's substantial
        if (line.length > keyword.length + 10) {
          return line.replace(new RegExp(keyword, 'gi'), '').trim();
        }
      }
    }
  }
  
  return null;
}

function extractListItems(text: string, keywords: string[]): string[] {
  const lines = text.split('\n').map(line => line.trim());
  const items: string[] = [];
  
  let inListMode = false;
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Check if this line mentions one of our keywords
    const hasKeyword = keywords.some(keyword => lowerLine.includes(keyword.toLowerCase()));
    
    if (hasKeyword) {
      inListMode = true;
      // Extract content after colon if present
      if (line.includes(':')) {
        const parts = line.split(':');
        if (parts.length > 1) {
          const content = parts.slice(1).join(':').trim();
          if (content) items.push(content);
        }
      }
      continue;
    }
    
    if (inListMode) {
      // Look for list indicators
      if (line.match(/^[-•*]\s+/) || line.match(/^\d+\.\s+/) || line.startsWith('- ')) {
        const cleaned = line.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, '').trim();
        if (cleaned) items.push(cleaned);
      } else if (line.length === 0) {
        // Empty line might end the list
        inListMode = false;
      } else if (line.length > 10 && !line.includes(':')) {
        // Substantial line without colon might be a benefit
        items.push(line);
      } else {
        // Non-matching line ends list mode
        inListMode = false;
      }
    }
  }
  
  return items.slice(0, 5); // Limit to 5 items
}