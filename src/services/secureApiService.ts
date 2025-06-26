// Secure API service that calls server-side functions instead of exposing API keys in browser
import { GeneratedOutput } from '../App';
import { useAuthStore } from '../stores/authStore';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Get the base URL for API calls
const getApiBaseUrl = (): string => {
  // In development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8888/.netlify/functions';
  }
  // In production, use the current domain
  return '/.netlify/functions';
};

// Check if we're in development mode without backend
const isDevelopmentMode = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

// Mock responses for development mode
const getMockResponse = (endpoint: string): any => {
  switch (endpoint) {
    case 'auth-login':
    case 'auth-register':
      return {
        success: true,
        data: {
          user: { id: 'dev-user', email: 'dev@example.com', name: 'Development User' },
          accessToken: 'dev-token',
          refreshToken: 'dev-refresh-token',
        },
      };
    case 'auth-me':
      return {
        success: true,
        data: { id: 'dev-user', email: 'dev@example.com', name: 'Development User' },
      };
    case 'generate-openai':
    case 'generate-claude':
      return {
        success: true,
        data: {
          territories: [
            { id: '1', content: 'Sample Territory 1 - Development Mode', starred: false },
            { id: '2', content: 'Sample Territory 2 - Development Mode', starred: false },
            { id: '3', content: 'Sample Territory 3 - Development Mode', starred: false },
          ],
          headlines: [
            { id: '1', content: 'Sample Headline 1 - Development Mode', starred: false },
            { id: '2', content: 'Sample Headline 2 - Development Mode', starred: false },
            { id: '3', content: 'Sample Headline 3 - Development Mode', starred: false },
          ],
        },
      };
    default:
      return { success: true, data: { message: 'Mock response for development' } };
  }
};

// Get authentication headers
const getAuthHeaders = (): Record<string, string> => {
  const token = useAuthStore.getState().getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Handle API errors with authentication retry
const handleApiError = async (
  response: Response,
  retryFn?: () => Promise<Response>
): Promise<ApiResponse> => {
  if (response.status === 401 && retryFn) {
    // Try to refresh token and retry
    try {
      await useAuthStore.getState().refreshToken();
      const retryResponse = await retryFn();
      if (retryResponse.ok) {
        return await retryResponse.json();
      }
    } catch (refreshError) {
      // If refresh fails, logout user
      useAuthStore.getState().logout();
      throw new Error('Authentication failed. Please log in again.');
    }
  }

  const result: ApiResponse = await response.json();
  throw new Error(result.error || `HTTP error! status: ${response.status}`);
};

// Generate content using OpenAI via secure server-side function
export const generateWithOpenAI = async (
  prompt: string,
  generateImages: boolean = false,
  brief: string = ''
): Promise<GeneratedOutput> => {
  console.log('🔄 Starting secure OpenAI API call...');
  console.log('Prompt length:', prompt.length);
  console.log('Generate images:', generateImages);

  // Use mock response in development mode when backend is not available
  if (isDevelopmentMode()) {
    try {
      const testResponse = await fetch(`${getApiBaseUrl()}/generate-openai`, { method: 'HEAD' });
      if (!testResponse.ok) {
        throw new Error('Backend not available');
      }
    } catch (error) {
      console.log('🔧 Backend not available, using mock response');
      const mockResponse = getMockResponse('generate-openai');
      return mockResponse.data;
    }
  }

  const makeRequest = async (): Promise<Response> => {
    const apiUrl = `${getApiBaseUrl()}/generate-openai`;
    return fetch(apiUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        prompt,
        generateImages,
        brief,
      }),
    });
  };

  try {
    const response = await makeRequest();

    if (!response.ok) {
      const result = await handleApiError(response, makeRequest);
      return result.data;
    }

    const result: ApiResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error from API');
    }

    console.log('✅ Secure OpenAI API response received');
    let generatedOutput = result.data;

    // Generate images if requested
    if (generateImages && generatedOutput.territories) {
      console.log('🎨 Starting image generation...');
      try {
        const imageResults = await generateImages_API(generatedOutput.territories, brief);
        generatedOutput = applyImagesToTerritories(generatedOutput, imageResults);
        console.log('✅ Images applied successfully');
      } catch (imageError) {
        console.error('❌ Image generation failed, continuing without images:', imageError);
        // Continue without images rather than failing completely
      }
    }

    return generatedOutput;
  } catch (error: any) {
    console.error('❌ Secure OpenAI API Error:', error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
};

// Generate content using Claude via secure server-side function
export const generateWithClaude = async (prompt: string): Promise<GeneratedOutput> => {
  console.log('🔄 Starting secure Claude API call...');
  console.log('Prompt length:', prompt.length);

  const makeRequest = async (): Promise<Response> => {
    const apiUrl = `${getApiBaseUrl()}/generate-claude`;
    return fetch(apiUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        prompt,
      }),
    });
  };

  try {
    const response = await makeRequest();

    if (!response.ok) {
      const result = await handleApiError(response, makeRequest);
      return result.data;
    }

    const result: ApiResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error from API');
    }

    console.log('✅ Secure Claude API response received');
    return result.data;
  } catch (error: any) {
    console.error('❌ Secure Claude API Error:', error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
};

// Generate images via secure server-side function
const generateImages_API = async (territories: any[], brief: string): Promise<any[]> => {
  console.log('🎨 Starting secure image generation...');

  const makeRequest = async (): Promise<Response> => {
    const apiUrl = `${getApiBaseUrl()}/generate-images`;
    return fetch(apiUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        territories,
        brief,
      }),
    });
  };

  try {
    const response = await makeRequest();

    if (!response.ok) {
      const result = await handleApiError(response, makeRequest);
      return result.data || [];
    }

    const result: ApiResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error from image API');
    }

    console.log('✅ Secure image generation completed');
    return result.data || [];
  } catch (error: any) {
    console.error('❌ Secure image generation error:', error);
    throw error;
  }
};

// Apply generated images to territories
const applyImagesToTerritories = (
  generatedOutput: GeneratedOutput,
  imageResults: any[]
): GeneratedOutput => {
  const updatedTerritories = [...generatedOutput.territories];

  imageResults.forEach(result => {
    if (
      result.imageUrl &&
      updatedTerritories[result.territoryIndex]?.headlines[result.headlineIndex]
    ) {
      updatedTerritories[result.territoryIndex].headlines[result.headlineIndex].imageUrl =
        result.imageUrl;
      console.log(
        `🖼️ Applied image to Territory ${result.territoryIndex + 1}, Headline ${result.headlineIndex + 1}`
      );
    }
  });

  return {
    ...generatedOutput,
    territories: updatedTerritories,
  };
};

// Mock response for development/testing
export const mockResponse = (): GeneratedOutput => ({
  territories: [
    {
      id: '001',
      title: 'Everyday Advantage',
      positioning:
        'While others wait for sales events, Everyday Rewards members enjoy benefits year-round with consistent value.',
      tone: 'Confident, relatable',
      headlines: [
        {
          text: 'Every day is your day with Everyday Rewards.',
          followUp: "Because great rewards shouldn't wait for special occasions.",
          reasoning:
            'Positions everyday shopping as personally beneficial, contrasting with event-driven competitors.',
          confidence: 85,
        },
        {
          text: "Why wait for sales when you're already saving?",
          followUp: 'Everyday Rewards delivers value every single day.',
          reasoning:
            'Challenges the traditional sale-waiting behavior while highlighting consistent benefits.',
          confidence: 82,
        },
        {
          text: 'Your everyday shop, elevated.',
          followUp: 'Discover the rewards hiding in your regular routine.',
          reasoning: 'Transforms mundane shopping into something special and rewarding.',
          confidence: 78,
        },
      ],
    },
  ],
  compliance: {
    powerBy: [
      'All headlines comply with advertising standards',
      'Claims are substantiated and truthful',
      'No misleading or deceptive content identified',
    ],
    output: 'LOW RISK - All content meets compliance requirements',
    notes: [
      'Content reviewed for accuracy and truthfulness',
      'No regulatory concerns identified',
      'Suitable for all advertising channels',
    ],
  },
});

// Enhanced output processing (keeping existing functionality)
export const enhanceGeneratedOutput = (
  output: GeneratedOutput,
  _brief: string
): GeneratedOutput => {
  // Add any enhancement logic here
  return output;
};

export const mergeWithStarredContent = (
  newOutput: GeneratedOutput,
  _existingOutput: GeneratedOutput,
  _starredItems: any
): GeneratedOutput => {
  // Add merge logic here
  return newOutput;
};
