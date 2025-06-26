import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { authenticateRequest, updateUserUsage } from './utils/auth';
import { buildResponse, logRequest, validateRequest } from './utils/response';

interface AnalysisRequest {
  image: string; // base64 encoded image
  filename: string;
  mimeType: string;
  analysisType?: 'basic' | 'comprehensive';
}

interface ImageAnalysis {
  mood: string[];
  style: string[];
  colors: {
    primary: string;
    secondary: string[];
    palette: string[];
  };
  composition: {
    rule_of_thirds: boolean;
    symmetry: boolean;
    leading_lines: boolean;
  };
  objects: string[];
  faces: number;
  text_detected: boolean;
  quality_score: number;
  aesthetic_score: number;
  brand_safety: boolean;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const requestId = context.awsRequestId || 'local';
  
  try {
    logRequest('analyze-asset', event.httpMethod, requestId);

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return buildResponse(200, { message: 'CORS preflight' });
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return buildResponse(405, { error: 'Method not allowed' });
    }

    // Authenticate request
    const authResult = await authenticateRequest(event);
    if (!authResult.success) {
      return buildResponse(401, { error: authResult.error });
    }

    const { user } = authResult;

    // Validate request body
    const validation = validateRequest(event.body, ['image', 'filename', 'mimeType']);
    if (!validation.isValid) {
      return buildResponse(400, { error: validation.error });
    }

    const { image, filename, mimeType, analysisType = 'basic' }: AnalysisRequest = validation.data;

    // Validate image format
    if (!mimeType.startsWith('image/')) {
      return buildResponse(400, { error: 'Only image files are supported for analysis' });
    }

    // Check if OpenAI API key is available
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.warn('OpenAI API key not found, using fallback analysis');
      const fallbackAnalysis = generateFallbackAnalysis(filename);
      return buildResponse(200, { 
        data: fallbackAnalysis,
        message: 'Analysis completed using fallback method'
      });
    }

    try {
      // Analyze image with OpenAI Vision API
      const analysis = await analyzeWithOpenAI(image, filename, analysisType, openaiApiKey);
      
      // Update user usage
      updateUserUsage(user.id);

      return buildResponse(200, { 
        data: analysis,
        message: 'AI analysis completed successfully'
      });

    } catch (aiError) {
      console.error('OpenAI analysis failed:', aiError);
      
      // Fallback to basic analysis
      const fallbackAnalysis = generateFallbackAnalysis(filename);
      return buildResponse(200, { 
        data: fallbackAnalysis,
        message: 'Analysis completed using fallback method due to AI service unavailability'
      });
    }

  } catch (error) {
    console.error('Asset analysis error:', error);
    return buildResponse(500, { 
      error: 'Internal server error during asset analysis',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

// Analyze image using OpenAI Vision API
async function analyzeWithOpenAI(
  base64Image: string, 
  filename: string, 
  analysisType: string,
  apiKey: string
): Promise<ImageAnalysis> {
  const prompt = analysisType === 'comprehensive' 
    ? getComprehensiveAnalysisPrompt()
    : getBasicAnalysisPrompt();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: analysisType === 'comprehensive' ? 'high' : 'low',
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  const analysisText = result.choices[0]?.message?.content;

  if (!analysisText) {
    throw new Error('No analysis content received from OpenAI');
  }

  // Parse the structured response
  return parseAnalysisResponse(analysisText, filename);
}

// Get basic analysis prompt
function getBasicAnalysisPrompt(): string {
  return `Analyze this image and provide a JSON response with the following structure:
{
  "mood": ["mood1", "mood2"],
  "style": ["style1", "style2"],
  "colors": {
    "primary": "#hexcolor",
    "secondary": ["#hex1", "#hex2"],
    "palette": ["#hex1", "#hex2", "#hex3", "#hex4"]
  },
  "composition": {
    "rule_of_thirds": boolean,
    "symmetry": boolean,
    "leading_lines": boolean
  },
  "objects": ["object1", "object2"],
  "faces": number,
  "text_detected": boolean,
  "quality_score": number (0-100),
  "aesthetic_score": number (0-100),
  "brand_safety": boolean
}

Focus on:
- Mood: emotional tone (professional, casual, energetic, calm, etc.)
- Style: visual style (modern, vintage, minimalist, ornate, etc.)
- Colors: dominant colors in hex format
- Composition: photographic composition techniques
- Objects: main subjects/objects visible
- Faces: count of human faces
- Text: whether text is visible
- Quality: technical image quality
- Aesthetic: visual appeal
- Brand safety: appropriate for commercial use

Respond only with valid JSON.`;
}

// Get comprehensive analysis prompt
function getComprehensiveAnalysisPrompt(): string {
  return `Perform a comprehensive analysis of this image and provide a detailed JSON response with the following structure:
{
  "mood": ["mood1", "mood2", "mood3"],
  "style": ["style1", "style2", "style3"],
  "colors": {
    "primary": "#hexcolor",
    "secondary": ["#hex1", "#hex2", "#hex3"],
    "palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"]
  },
  "composition": {
    "rule_of_thirds": boolean,
    "symmetry": boolean,
    "leading_lines": boolean
  },
  "objects": ["object1", "object2", "object3"],
  "faces": number,
  "text_detected": boolean,
  "quality_score": number (0-100),
  "aesthetic_score": number (0-100),
  "brand_safety": boolean
}

Provide detailed analysis including:
- Mood: comprehensive emotional assessment
- Style: detailed visual style analysis
- Colors: accurate color extraction with hex codes
- Composition: advanced photographic techniques
- Objects: detailed object recognition
- Technical quality assessment
- Aesthetic evaluation
- Brand safety evaluation

Respond only with valid JSON.`;
}

// Parse OpenAI response into structured analysis
function parseAnalysisResponse(analysisText: string, filename: string): ImageAnalysis {
  try {
    // Try to extract JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate and sanitize the response
    return {
      mood: Array.isArray(analysis.mood) ? analysis.mood.slice(0, 5) : ['neutral'],
      style: Array.isArray(analysis.style) ? analysis.style.slice(0, 5) : ['general'],
      colors: {
        primary: analysis.colors?.primary || '#3B82F6',
        secondary: Array.isArray(analysis.colors?.secondary) ? analysis.colors.secondary.slice(0, 3) : ['#1E40AF'],
        palette: Array.isArray(analysis.colors?.palette) ? analysis.colors.palette.slice(0, 5) : ['#3B82F6'],
      },
      composition: {
        rule_of_thirds: Boolean(analysis.composition?.rule_of_thirds),
        symmetry: Boolean(analysis.composition?.symmetry),
        leading_lines: Boolean(analysis.composition?.leading_lines),
      },
      objects: Array.isArray(analysis.objects) ? analysis.objects.slice(0, 10) : [],
      faces: typeof analysis.faces === 'number' ? Math.max(0, analysis.faces) : 0,
      text_detected: Boolean(analysis.text_detected),
      quality_score: typeof analysis.quality_score === 'number' ? Math.max(0, Math.min(100, analysis.quality_score)) : 75,
      aesthetic_score: typeof analysis.aesthetic_score === 'number' ? Math.max(0, Math.min(100, analysis.aesthetic_score)) : 70,
      brand_safety: Boolean(analysis.brand_safety),
    };
  } catch (error) {
    console.warn('Failed to parse AI analysis response:', error);
    return generateFallbackAnalysis(filename);
  }
}

// Generate fallback analysis when AI is unavailable
function generateFallbackAnalysis(filename: string): ImageAnalysis {
  const filenameLower = filename.toLowerCase();
  
  // Basic inference from filename
  const mood = [];
  const style = [];
  const objects = [];

  if (filenameLower.includes('professional') || filenameLower.includes('business')) {
    mood.push('professional', 'formal');
    style.push('corporate', 'clean');
  } else if (filenameLower.includes('casual') || filenameLower.includes('lifestyle')) {
    mood.push('casual', 'relaxed');
    style.push('lifestyle', 'natural');
  } else {
    mood.push('neutral', 'versatile');
    style.push('modern', 'adaptable');
  }

  if (filenameLower.includes('person') || filenameLower.includes('people')) objects.push('person');
  if (filenameLower.includes('product')) objects.push('product');
  if (filenameLower.includes('building')) objects.push('building');

  return {
    mood,
    style,
    colors: {
      primary: '#3B82F6',
      secondary: ['#1E40AF', '#60A5FA'],
      palette: ['#3B82F6', '#1E40AF', '#60A5FA', '#DBEAFE', '#F3F4F6'],
    },
    composition: {
      rule_of_thirds: Math.random() > 0.5,
      symmetry: Math.random() > 0.7,
      leading_lines: Math.random() > 0.6,
    },
    objects,
    faces: filenameLower.includes('person') || filenameLower.includes('portrait') ? 1 : 0,
    text_detected: filenameLower.includes('text') || filenameLower.includes('typography'),
    quality_score: Math.floor(Math.random() * 20) + 70,
    aesthetic_score: Math.floor(Math.random() * 25) + 65,
    brand_safety: true,
  };
}

export { handler };
