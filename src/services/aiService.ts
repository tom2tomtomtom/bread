import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GeneratedOutput } from '../App';

// Mock response for demo purposes - enhanced with more realistic data
const mockResponse = (): GeneratedOutput => ({
  territories: [
    {
      id: '001',
      title: 'Everyday Advantage',
      positioning: 'While others wait for sales events, Everyday Rewards members enjoy benefits year-round with consistent value.',
      tone: 'Confident, relatable',
      headlines: [
        'Every day is your day with Everyday Rewards.',
        'Why wait for sales when savings happen daily?',
        'Everyday Rewards: Making ordinary shopping extraordinary.'
      ]
    },
    {
      id: '002',
      title: 'Smart Shoppers Club',
      positioning: 'Everyday Rewards turns every shop into a win for savvy Australians who value consistency over chaos.',
      tone: 'Premium, self-aware',
      headlines: [
        'Join the club where every shop counts.',
        'Smart shopping, everyday rewards.',
        'Your everyday essentials, properly rewarded.'
      ]
    },
    {
      id: '003',
      title: 'No FOMO Zone',
      positioning: 'Skip the sales pressure and enjoy consistent rewards without the rush, stress, or limited-time anxiety.',
      tone: 'Calm, anti-FOMO',
      headlines: [
        'No countdown clocks. Just everyday savings.',
        'Rewards without the rush or pressure.',
        'Shop at your pace, earn at every place.'
      ]
    },
    {
      id: '004',
      title: 'True Blue Value',
      positioning: 'Celebrating Australian shoppers with rewards that reflect our values of fairness and community.',
      tone: 'Patriotic, inclusive',
      headlines: [
        'Rewards as reliable as a true blue mate.',
        'Fair dinkum savings for fair dinkum people.',
        'Everyday value for everyday Australians.'
      ]
    },
    {
      id: '005',
      title: 'Steady Wins',
      positioning: 'Smart members quietly accumulate genuine value while others chase one-off deals and flash sales.',
      tone: 'Wry, confident',
      headlines: [
        'They saved twenty dollars once. You save every time.',
        'Stacking rewards while others chase sales.',
        'The maths always works in your favour.'
      ]
    },
    {
      id: '006',
      title: 'Any Day Advantage',
      positioning: 'Every day is the perfect day to earn rewards with Everyday Rewards - no special occasion required.',
      tone: 'Direct, everyday',
      headlines: [
        'Today\'s deal? The same as every day.',
        'Great value today. And every day after.',
        'Every day is rewards day with us.'
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
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Only for demo - use server-side in production
    });

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
      "headlines": ["Headline 1", "Headline 2", "Headline 3"]
    }
  ],
  "compliance": {
    "powerBy": ["Item 1", "Item 2", "Item 3"],
    "output": "Compliance summary...",
    "notes": ["Note 1", "Note 2", "Note 3"]
  }
}

Generate exactly 6 territories, each with 3 headlines. Focus on Australian market relevance and ensure compliance with ACCC standards.`
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
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return parseAIResponse(response);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // Return mock response for demo - in production, you'd handle this differently
    return mockResponse();
  }
};

export const generateWithClaude = async (prompt: string, apiKey: string): Promise<GeneratedOutput> => {
  try {
    const anthropic = new Anthropic({
      apiKey: apiKey,
      // Note: Anthropic SDK doesn't support browser usage by default
      // This is for demo purposes only - in production, use server-side
    });

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
    if (!response) {
      throw new Error('No response from Claude');
    }

    return parseAIResponse(response);
  } catch (error) {
    console.error('Claude API Error:', error);
    // Return mock response for demo - in production, you'd handle this differently
    return mockResponse();
  }
};