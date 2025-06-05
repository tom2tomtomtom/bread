import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GeneratedOutput } from '../App';

// Mock response for demo purposes
const mockResponse = (): GeneratedOutput => ({
  territories: [
    {
      id: '001',
      title: 'Everyday Advantage',
      positioning: 'While others wait for sales events, Everyday Rewards members enjoy benefits year-round.',
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
      positioning: 'Everyday Rewards turns every shop into a win for savvy Australians.',
      tone: 'Premium, self-aware',
      headlines: [
        'Join the club where every shop counts.',
        'Smart shopping, everyday rewards.',
        'Your everyday essentials, rewarded.'
      ]
    },
    {
      id: '003',
      title: 'No FOMO Zone',
      positioning: 'Skip the sales pressure and enjoy consistent rewards without the rush.',
      tone: 'Calm, anti-FOMO',
      headlines: [
        'No countdown clocks. Just everyday savings.',
        'Rewards without the rush or pressure.',
        'Shop at your pace, earn at every place.'
      ]
    },
    {
      id: '004',
      title: 'Aussie Value',
      positioning: 'Celebrating Australian shoppers with rewards that reflect our values.',
      tone: 'Patriotic, inclusive',
      headlines: [
        'Rewards as reliable as a true blue mate.',
        'Fair dinkum savings for fair dinkum people.',
        'Everyday value for everyday Australians.'
      ]
    },
    {
      id: '005',
      title: 'Stack & Save',
      positioning: 'Smart members quietly accumulate value while others chase one-off deals.',
      tone: 'Wry, confident',
      headlines: [
        'They saved $20 once. You save every time.',
        'Stacking rewards while others chase sales.',
        'The maths always works in your favour.'
      ]
    },
    {
      id: '006',
      title: 'Any Day Advantage',
      positioning: 'Every day is the perfect day to earn rewards with Everyday Rewards.',
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
      'T&Cs on owned assets',
      'Relevant ACCC obligations'
    ],
    output: 'All messaging complies with Australian Consumer Law and ACCC advertising guidelines. Claims are substantiated and terms clearly disclosed.',
    notes: [
      'Claims substantiated with program benefits',
      'Terms clearly disclosed in all materials',
      'ACCC guidelines followed for comparative claims',
      'No misleading or deceptive statements identified'
    ]
  }
});

// Parse AI response into structured format
const parseAIResponse = (text: string): GeneratedOutput => {
  try {
    // Try to parse as JSON first
    return JSON.parse(text);
  } catch {
    // If not JSON, return mock response for now
    // In production, you'd parse the text response
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
          content: "You are BREAD®, a creative AI platform. Always respond with structured JSON containing territories and compliance data. Each territory should have: id, title, positioning, tone, and headlines array with 3 items."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 3000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return parseAIResponse(response);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // Return mock response for demo
    return mockResponse();
  }
};

export const generateWithClaude = async (prompt: string, apiKey: string): Promise<GeneratedOutput> => {
  try {
    const anthropic = new Anthropic({
      apiKey: apiKey,
      // Note: Anthropic SDK doesn't support browser usage by default
      // This is for demo purposes only
    });

    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 3000,
      temperature: 0.8,
      messages: [
        {
          role: "user",
          content: `You are BREAD®, a creative AI platform. Always respond with structured JSON containing territories and compliance data. Each territory should have: id, title, positioning, tone, and headlines array with 3 items.\n\n${prompt}`
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
    // Return mock response for demo
    return mockResponse();
  }
};