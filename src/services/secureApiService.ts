// Secure API service that calls server-side functions instead of exposing API keys in browser
import { GeneratedOutput, Territory, StarredItems, BrandGuidelines } from '../types';
import { useAuthStore } from '../stores/authStore';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
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
const getMockResponse = (endpoint: string): ApiResponse => {
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
      return mockResponse.data as GeneratedOutput;
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
      return result.data as GeneratedOutput;
    }

    const result: ApiResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error from API');
    }

    console.log('✅ Secure OpenAI API response received');
    let generatedOutput = result.data as GeneratedOutput;

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
  } catch (error: unknown) {
    console.error('❌ Secure OpenAI API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate content: ${errorMessage}`);
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
      return result.data as GeneratedOutput;
    }

    const result: ApiResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error from API');
    }

    console.log('✅ Secure Claude API response received');
    return result.data as GeneratedOutput;
  } catch (error: unknown) {
    console.error('❌ Secure Claude API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate content: ${errorMessage}`);
  }
};

// Generate images via secure server-side function
const generateImages_API = async (territories: Territory[], brief: string): Promise<string[]> => {
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
      return (result.data as string[]) || [];
    }

    const result: ApiResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error from image API');
    }

    console.log('✅ Secure image generation completed');
    return (result.data as string[]) || [];
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

// ===== MULTIMEDIA GENERATION API FUNCTIONS =====

// Enhanced image generation via secure server-side function
// Simple image generation API for asset management workflow
export const generateSimpleImage_API = async (
  prompt: string,
  options: {
    imageType?: string;
    quality?: string;
    territory?: any;
  } = {}
): Promise<any[]> => {
  console.log('🎨 Starting simple image generation...', { prompt, options });

  const makeRequest = async (): Promise<Response> => {
    const apiUrl = `${getApiBaseUrl()}/generate-images-simple`;
    console.log('📡 Making request to:', apiUrl);
    return fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        territory: options.territory,
        imageType: options.imageType,
        quality: options.quality,
      }),
    });
  };

  try {
    console.log('🔄 Sending API request...');

    // Add timeout to the request  
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout after 40 seconds')), 40000);
    });

    const response = await Promise.race([makeRequest(), timeoutPromise]);
    console.log('📥 Response received:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const result: ApiResponse = await response.json();
    console.log('📊 Parsed result:', result);

    if (!result.success) {
      console.error('❌ API returned error:', result.error);
      throw new Error(result.error || 'Unknown error from simple image API');
    }

    console.log('✅ Simple image generation completed successfully');
    console.log('🖼️ Generated image data:', result.data);
    return (result.data as any[]) || [];
  } catch (error: any) {
    console.error('❌ Simple image generation error:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

export const generateEnhancedImages_API = async (
  territories: any[],
  brief: string,
  options: {
    imageType?: string;
    culturalContext?: string;
    styleConsistency?: boolean;
    quality?: string;
    provider?: string;
    brandGuidelines?: any;
  } = {}
): Promise<any[]> => {
  console.log('🎨 Starting enhanced image generation...');

  const makeRequest = async (): Promise<Response> => {
    const apiUrl = `${getApiBaseUrl()}/generate-images`;
    return fetch(apiUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        territories,
        brief,
        ...options,
      }),
    });
  };

  try {
    const response = await makeRequest();

    if (!response.ok) {
      const result = await handleApiError(response, makeRequest);
      return (result.data as any[]) || [];
    }

    const result: ApiResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error from enhanced image API');
    }

    console.log('✅ Enhanced image generation completed');
    return (result.data as any[]) || [];
  } catch (error: any) {
    console.error('❌ Enhanced image generation error:', error);
    throw error;
  }
};

// Video generation via secure server-side function
export const generateVideo_API = async (
  sourceImageId: string,
  sourceImageUrl: string,
  animationType: string,
  duration: number,
  options: {
    outputFormat?: string;
    platformOptimization?: string;
    provider?: string;
    quality?: string;
    fps?: number;
    customPrompt?: string;
    territory?: any;
  } = {}
): Promise<any> => {
  console.log('🎬 Starting video generation...');

  const makeRequest = async (): Promise<Response> => {
    const apiUrl = `${getApiBaseUrl()}/generate-videos`;
    return fetch(apiUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        sourceImageId,
        sourceImageUrl,
        animationType,
        duration,
        ...options,
      }),
    });
  };

  try {
    const response = await makeRequest();

    if (!response.ok) {
      const result = await handleApiError(response, makeRequest);
      return (result.data as any[]) || [];
    }

    const result: ApiResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error from video API');
    }

    console.log('✅ Video generation completed');
    return result.data;
  } catch (error: any) {
    console.error('❌ Video generation error:', error);
    throw error;
  }
};

// Batch multimedia generation
export const batchGenerateMultimedia_API = async (
  requests: Array<{
    type: 'image' | 'video';
    data: any;
  }>,
  options: {
    priority?: string;
    callback?: string;
  } = {}
): Promise<any> => {
  console.log('📦 Starting batch multimedia generation...');

  try {
    // Process requests in parallel with rate limiting
    const batchSize = 3;
    const results = [];

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);

      const batchPromises = batch.map(async request => {
        if (request.type === 'image') {
          return await generateEnhancedImages_API(
            request.data.territories,
            request.data.brief,
            request.data.options
          );
        } else if (request.type === 'video') {
          return await generateVideo_API(
            request.data.sourceImageId,
            request.data.sourceImageUrl,
            request.data.animationType,
            request.data.duration,
            request.data.options
          );
        }
        return null;
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result !== null));

      // Small delay between batches to respect rate limits
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('✅ Batch multimedia generation completed');
    return {
      batchId: `batch_${Date.now()}`,
      totalRequests: requests.length,
      completedRequests: results.length,
      results,
    };
  } catch (error: any) {
    console.error('❌ Batch multimedia generation error:', error);
    throw error;
  }
};
