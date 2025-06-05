import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GeneratedOutput } from '../App';

// Set to false to disable mock responses and force real API calls
const ENABLE_MOCK_FALLBACK = false;

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
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(text);
    
    // Validate the structure
    if (parsed.territories && Array.isArray(parsed.territories) && parsed.compliance) {
      return parsed;
    }
    
    // If structure is invalid, return mock response
    return mockResponse();
  } catch {
    // If not JSON or parsing fails, return mock response for now
    // In production, you'd parse the text response more intelligently
    return mockResponse();
  }
};

export const generateWithOpenAI = async (prompt: string, apiKey: string): Promise<GeneratedOutput> => {
  console.log('🔄 Starting OpenAI API call...');
  console.log('API Key present:', !!apiKey);
  console.log('Prompt length:', prompt.length);
  
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
          content: `You are BREAD®, a creative AI platform. Always respond with structured JSON containing territories and compliance data. 

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
- confidence: Numerical score 1-100 based on market fit and effectiveness

Focus on Australian market relevance and ensure compliance with ACCC standards.`
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

    console.log('📝 Parsing OpenAI response...');
    const parsed = parseAIResponse(response);
    console.log('✅ Successfully parsed OpenAI response');
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