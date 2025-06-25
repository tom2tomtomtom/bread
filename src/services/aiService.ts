import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GeneratedOutput } from '../App';

// Set to false to disable mock responses and force real API calls
const ENABLE_MOCK_FALLBACK = false;

// Helper function to add delay between requests
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

  // Select scenery based on simple rotation or random selection
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
  } else if (briefContext.includes('spring')) {
    seasonalModifier = ' with fresh spring colors and new growth';
  } else if (briefContext.includes('autumn') || briefContext.includes('fall')) {
    seasonalModifier = ' with warm autumn colors and golden light';
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

// Generate a simpler fallback scenery prompt if the main one fails
const generateFallbackPrompt = (headline: { text: string; followUp: string }): string => {
  return `Create a simple, beautiful natural scenery background image suitable for mobile advertising.

SCENERY: Peaceful natural landscape - could be gentle hills, calm water, soft sky, or simple forest scene
STYLE: Clean, minimalist, natural photography
COLORS: Soft natural tones - gentle blues, warm earth colors, peaceful greens, soft whites
ELEMENTS: Simple natural scenery, subtle gradients, peaceful atmosphere
LIGHTING: Soft, natural lighting perfect for text overlay

AVOID: Text, logos, people, buildings, vehicles, technology, busy patterns, man-made objects
FOCUS: Simple, calming natural scenery background perfect for text overlay.`;
};

// Generate a single image with retry logic
const generateSingleImage = async (
  openai: OpenAI, 
  headline: { text: string; followUp: string }, 
  territory: { title: string; tone: string }, 
  brief: string,
  territoryIndex: number,
  headlineIndex: number,
  maxRetries: number = 3
): Promise<any> => {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🎨 Generating image for Territory ${territoryIndex + 1}, Headline ${headlineIndex + 1} (Attempt ${attempt}/${maxRetries})`);
      
      // Use main prompt on first attempt, fallback on subsequent attempts
      const imagePrompt = attempt === 1 
        ? generateImagePrompt(headline, territory, brief)
        : generateFallbackPrompt(headline);
      
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
        console.log(`✅ Image generated successfully for Territory ${territoryIndex + 1}, Headline ${headlineIndex + 1} on attempt ${attempt}`);
        return {
          territoryIndex,
          headlineIndex,
          imageUrl,
          prompt: imagePrompt,
          attempt
        };
      } else {
        throw new Error('No image URL returned from API');
      }
      
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Attempt ${attempt} failed for Territory ${territoryIndex + 1}, Headline ${headlineIndex + 1}:`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff: wait longer between retries
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
      }
    }
  }
  
  // All attempts failed
  console.error(`💥 All ${maxRetries} attempts failed for Territory ${territoryIndex + 1}, Headline ${headlineIndex + 1}:`, lastError?.message);
  return {
    territoryIndex,
    headlineIndex,
    imageUrl: null,
    error: lastError?.message || 'Unknown error',
    attempts: maxRetries
  };
};

// Generate images for all headlines with batched processing and retry logic
const generateHeadlineImages = async (territories: any[], brief: string, openai: OpenAI): Promise<any[]> => {
  console.log('🎨 Starting enhanced image generation for all headlines...');
  
  const allImageRequests: Array<{
    headline: any;
    territory: any;
    territoryIndex: number;
    headlineIndex: number;
  }> = [];
  
  // Collect all image requests
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
  
  console.log(`🎨 Processing ${allImageRequests.length} images in batches of 6...`);
  
  const results: any[] = [];
  const batchSize = 6; // Process 6 images at a time to avoid rate limits
  
  for (let i = 0; i < allImageRequests.length; i += batchSize) {
    const batch = allImageRequests.slice(i, i + batchSize);
    console.log(`🎨 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allImageRequests.length / batchSize)}...`);
    
    // Process batch in parallel
    const batchPromises = batch.map(request => 
      generateSingleImage(
        openai,
        request.headline,
        request.territory,
        brief,
        request.territoryIndex,
        request.headlineIndex
      )
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Small delay between batches to be nice to the API
    if (i + batchSize < allImageRequests.length) {
      console.log('⏳ Waiting 2s before next batch...');
      await delay(2000);
    }
  }
  
  // Log final results
  const successCount = results.filter(r => r.imageUrl).length;
  const failCount = results.filter(r => !r.imageUrl).length;
  
  console.log(`✅ Enhanced image generation complete:`);
  console.log(`   🎉 ${successCount} images generated successfully`);
  console.log(`   ❌ ${failCount} images failed after all retries`);
  
  if (failCount > 0) {
    console.log('Failed images:', results.filter(r => !r.imageUrl).map(r => 
      `Territory ${r.territoryIndex + 1}, Headline ${r.headlineIndex + 1}: ${r.error}`
    ));
  }
  
  return results;
};

// Apply generated images to territories
const applyImagesToTerritories = (territories: any[], imageResults: any[]): any[] => {
  const updatedTerritories = [...territories];
  
  imageResults.forEach(result => {
    if (result.imageUrl && updatedTerritories[result.territoryIndex]?.headlines[result.headlineIndex]) {
      updatedTerritories[result.territoryIndex].headlines[result.headlineIndex].imageUrl = result.imageUrl;
      console.log(`🖼️ Applied image to Territory ${result.territoryIndex + 1}, Headline ${result.headlineIndex + 1}`);
    }
  });
  
  return updatedTerritories;
};

// Mock response for demo purposes - enhanced with more realistic data
const mockResponse = (): GeneratedOutput => ({
  territories: [
    {
      id: '001',
      title: 'Everyday Advantage',
      positioning: 'While others wait for sales events, Everyday Rewards members enjoy benefits year-round with consistent value.',
      tone: 'Confident, relatable',
      headlines: [
        {
          text: 'Every day is your day with Everyday Rewards.',
          followUp: 'Because great rewards shouldn\'t wait for special occasions.',
          reasoning: 'Positions everyday shopping as personally beneficial, contrasting with event-driven competitors.',
          confidence: 85
        },
        {
          text: 'Why wait for sales when savings happen daily?',
          followUp: 'Join millions who save on every shop.',
          reasoning: 'Direct challenge to sale-focused retailers, emphasizing consistent value over sporadic discounts.',
          confidence: 78
        },
        {
          text: 'Everyday Rewards: Making ordinary shopping extraordinary.',
          followUp: 'Turn your weekly shop into weekly wins.',
          reasoning: 'Elevates mundane shopping experience while maintaining approachable, everyday positioning.',
          confidence: 82
        }
      ]
    },
    {
      id: '002',
      title: 'Smart Shoppers Club',
      positioning: 'Everyday Rewards turns every shop into a win for savvy Australians who value consistency over chaos.',
      tone: 'Premium, self-aware',
      headlines: [
        {
          text: 'Join the club where every shop counts.',
          followUp: 'Smart shoppers choose consistent rewards.',
          reasoning: 'Creates exclusivity while emphasizing the value of regular shopping behavior.',
          confidence: 80
        },
        {
          text: 'Smart shopping, everyday rewards.',
          followUp: 'The smarter way to shop at Woolworths.',
          reasoning: 'Positions members as intelligent consumers making strategic choices.',
          confidence: 75
        },
        {
          text: 'Your everyday essentials, properly rewarded.',
          followUp: 'Because regular shopping deserves regular rewards.',
          reasoning: 'Validates necessity purchases while promising fair compensation.',
          confidence: 83
        }
      ]
    },
    {
      id: '003',
      title: 'No FOMO Zone',
      positioning: 'Skip the sales pressure and enjoy consistent rewards without the rush, stress, or limited-time anxiety.',
      tone: 'Calm, anti-FOMO',
      headlines: [
        {
          text: 'No countdown clocks. Just everyday savings.',
          followUp: 'Relax and shop when it suits you.',
          reasoning: 'Directly counters urgency-driven sales tactics, promoting stress-free shopping.',
          confidence: 88
        },
        {
          text: 'Rewards without the rush or pressure.',
          followUp: 'Good rewards come to those who shop.',
          reasoning: 'Appeals to consumers tired of high-pressure sales environments.',
          confidence: 84
        },
        {
          text: 'Shop at your pace, earn at every place.',
          followUp: 'Your schedule, your rewards.',
          reasoning: 'Emphasizes personal control and convenience over forced urgency.',
          confidence: 81
        }
      ]
    },
    {
      id: '004',
      title: 'True Blue Value',
      positioning: 'Celebrating Australian shoppers with rewards that reflect our values of fairness and community.',
      tone: 'Patriotic, inclusive',
      headlines: [
        {
          text: 'Rewards as reliable as a true blue mate.',
          followUp: 'Always there when you need them.',
          reasoning: 'Uses distinctly Australian language to build trust and reliability.',
          confidence: 86
        },
        {
          text: 'Fair dinkum savings for fair dinkum people.',
          followUp: 'Honest rewards for honest shoppers.',
          reasoning: 'Appeals to Australian values of honesty and straightforwardness.',
          confidence: 79
        },
        {
          text: 'Everyday value for everyday Australians.',
          followUp: 'Because every Australian deserves great rewards.',
          reasoning: 'Inclusive messaging that speaks to all Australians regardless of background.',
          confidence: 87
        }
      ]
    },
    {
      id: '005',
      title: 'Steady Wins',
      positioning: 'Smart members quietly accumulate genuine value while others chase one-off deals and flash sales.',
      tone: 'Wry, confident',
      headlines: [
        {
          text: 'They saved twenty dollars once. You save every time.',
          followUp: 'Consistent beats sporadic. Every time.',
          reasoning: 'Competitive comparison highlighting superior long-term value proposition.',
          confidence: 92
        },
        {
          text: 'Stacking rewards while others chase sales.',
          followUp: 'Smart shoppers stack. Smart shoppers win.',
          reasoning: 'Positions members as strategic thinkers vs impulsive sale-chasers.',
          confidence: 85
        },
        {
          text: 'The maths always works in your favour.',
          followUp: 'Every shop. Every time. Every reward.',
          reasoning: 'Confidence in program value with mathematical certainty appeal.',
          confidence: 89
        }
      ]
    },
    {
      id: '006',
      title: 'Any Day Advantage',
      positioning: 'Every day is the perfect day to earn rewards with Everyday Rewards - no special occasion required.',
      tone: 'Direct, everyday',
      headlines: [
        {
          text: 'Today\'s deal? The same as every day.',
          followUp: 'No waiting. No wondering. Just rewards.',
          reasoning: 'Contrasts reliability with competitor deal unpredictability.',
          confidence: 83
        },
        {
          text: 'Great value today. And every day after.',
          followUp: 'Consistency you can count on.',
          reasoning: 'Promise of sustained value rather than temporary offers.',
          confidence: 86
        },
        {
          text: 'Every day is rewards day with us.',
          followUp: 'Making every shop count.',
          reasoning: 'Transforms ordinary shopping into rewarding experiences.',
          confidence: 81
        }
      ]
    }
  ],
  compliance: {
    powerBy: [
      'Everyday Rewards Messaging Matrix',
      'Terms and Conditions on owned assets',
      'Relevant ACCC advertising obligations'
    ],
    output: 'All messaging complies with Australian Consumer Law and ACCC advertising guidelines. Claims are substantiated with program benefits and terms are clearly disclosed where required.',
    notes: [
      'Claims substantiated with actual program benefits',
      'Terms clearly disclosed in all marketing materials',
      'ACCC guidelines followed for comparative advertising claims',
      'No misleading or deceptive statements identified',
      'Australian cultural references used appropriately',
      'Value propositions align with program offerings'
    ]
  }
});

// Parse AI response into structured format
const parseAIResponse = (text: string): GeneratedOutput => {
  console.log('🔍 Attempting to parse AI response...');
  console.log('Response type:', typeof text);
  console.log('Response length:', text?.length);
  
  try {
    // Clean the text - sometimes AI includes markdown code blocks
    let cleanText = text.trim();
    
    // Remove markdown code blocks if present
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\s*/, '').replace(/\s*```$/, '');
    }
    
    console.log('🧹 Cleaned text for parsing:', cleanText.substring(0, 200) + '...');
    
    // Try to parse as JSON
    const parsed = JSON.parse(cleanText);
    console.log('✅ Successfully parsed JSON');
    console.log('📊 Parsed structure:', {
      hasTerritories: !!parsed.territories,
      territoriesLength: parsed.territories?.length,
      hasCompliance: !!parsed.compliance,
      keys: Object.keys(parsed)
    });
    
    // Validate the structure
    if (parsed.territories && Array.isArray(parsed.territories) && parsed.compliance) {
      console.log('✅ Structure validation passed');
      return parsed;
    }
    
    console.warn('⚠️ Structure validation failed - using mock response');
    console.log('Expected: territories array + compliance object');
    console.log('Got:', {
      territories: parsed.territories ? `${parsed.territories.length} items` : 'missing',
      compliance: parsed.compliance ? 'present' : 'missing'
    });
    
    // If structure is invalid, throw error to see what's happening
    throw new Error(`Invalid structure from OpenAI. Got: ${JSON.stringify({
      territories: parsed.territories ? `${parsed.territories.length} items` : 'missing',
      compliance: parsed.compliance ? 'present' : 'missing',
      keys: Object.keys(parsed)
    })}`);
  } catch (error) {
    console.error('❌ JSON parsing failed:', error);
    console.log('Raw text that failed to parse:', text.substring(0, 500) + '...');
    // Throw error to see what OpenAI actually returned
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to parse OpenAI response: ${errorMessage}. Raw response: ${text.substring(0, 200)}...`);
  }
};

export const generateWithOpenAI = async (prompt: string, apiKey: string, generateImages: boolean = false, brief: string = ''): Promise<GeneratedOutput> => {
  console.log('🔄 Starting OpenAI API call...');
  console.log('API Key present:', !!apiKey);
  console.log('Prompt length:', prompt.length);
  console.log('Generate images:', generateImages);
  console.log('📄 Full prompt being sent to OpenAI:');
  console.log('='.repeat(80));
  console.log(prompt);
  console.log('='.repeat(80));
  
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Only for demo - use server-side in production
    });

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
    "powerBy": ["Item 1", "Item 2", "Item 3"],
    "output": "Compliance summary...",
    "notes": ["Note 1", "Note 2", "Note 3"]
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
    console.log('📄 Raw OpenAI response:');
    console.log('='.repeat(80));
    console.log(response);
    console.log('='.repeat(80));
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    console.log('📝 Parsing OpenAI response...');
    const parsed = parseAIResponse(response);
    console.log('✅ Successfully parsed OpenAI response');
    
    // Generate images if requested
    if (generateImages && parsed.territories) {
      console.log('🎨 Enhanced image generation enabled...');
      try {
        const imageResults = await generateHeadlineImages(parsed.territories, brief || prompt, openai);
        const territoriesWithImages = applyImagesToTerritories(parsed.territories, imageResults);
        
        return {
          ...parsed,
          territories: territoriesWithImages
        };
      } catch (imageError) {
        console.error('❌ Image generation failed, continuing without images:', imageError);
        // Return original parsed response if image generation fails
        return parsed;
      }
    }
    
    return parsed;
  } catch (error) {
    console.error('❌ OpenAI API Error:', error);
    if (ENABLE_MOCK_FALLBACK) {
      console.log('🎭 Falling back to mock response');
      return mockResponse();
    } else {
      console.log('🚫 Mock fallback disabled, throwing error');
      throw error;
    }
  }
};

export const generateWithClaude = async (prompt: string, apiKey: string): Promise<GeneratedOutput> => {
  console.log('🔄 Starting Claude API call...');
  console.log('API Key present:', !!apiKey);
  console.log('Prompt length:', prompt.length);
  
  try {
    const anthropic = new Anthropic({
      apiKey: apiKey,
      // Note: Anthropic SDK doesn't support browser usage by default
      // This is for demo purposes only - in production, use server-side
    });

    console.log('🚀 Making Claude API request...');

    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4000,
      temperature: 0.8,
      messages: [
        {
          role: "user",
          content: `You are BREAD®, a creative AI platform. Always respond with structured JSON containing territories and compliance data.

Structure your response exactly like this:
{
  "territories": [
    {
      "id": "001",
      "title": "Territory Name",
      "positioning": "Clear positioning statement...",
      "tone": "Tone description",
      "headlines": ["Headline 1", "Headline 2", "Headline 3"]
    }
  ],
  "compliance": {
    "powerBy": ["Item 1", "Item 2", "Item 3"],
    "output": "Compliance summary...",
    "notes": ["Note 1", "Note 2", "Note 3"]
  }
}

Generate exactly 6 territories, each with 3 headlines. Focus on Australian market relevance and ensure compliance with ACCC standards.

${prompt}`
        }
      ]
    });

    const response = message.content[0]?.type === 'text' ? message.content[0].text : '';
    console.log('✅ Claude API response received:', !!response);
    
    if (!response) {
      throw new Error('No response from Claude');
    }

    console.log('📝 Parsing Claude response...');
    const parsed = parseAIResponse(response);
    console.log('✅ Successfully parsed Claude response');
    return parsed;
  } catch (error) {
    console.error('❌ Claude API Error:', error);
    if (ENABLE_MOCK_FALLBACK) {
      console.log('🎭 Falling back to mock response');
      return mockResponse();
    } else {
      console.log('🚫 Mock fallback disabled, throwing error');
      throw error;
    }
  }
};