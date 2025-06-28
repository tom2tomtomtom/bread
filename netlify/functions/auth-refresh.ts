import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    };
  }

  // Mock successful token refresh
  const mockResponse = {
    user: {
      id: `user_${Date.now()}`,
      email: 'test@example.com',
      name: 'Test User',
      plan: 'free',
      createdAt: new Date().toISOString(),
    },
    token: `mock-jwt-token-${Date.now()}`,
    refreshToken: `mock-refresh-token-${Date.now()}`,
  };

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      success: true,
      data: mockResponse,
    }),
  };
};