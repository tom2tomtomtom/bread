import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  console.log('🔍 Testing API key availability...');
  
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: '',
    };
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('🔑 API key check:', apiKey ? 'Present' : 'Missing');
    console.log('🔑 API key length:', apiKey?.length || 0);
    console.log('🔑 API key prefix:', apiKey?.substring(0, 8) || 'N/A');
    
    const response = {
      success: true,
      data: {
        apiKeyPresent: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        apiKeyPrefix: apiKey?.substring(0, 8) || 'N/A',
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          AWS_REGION: process.env.AWS_REGION,
          NETLIFY: process.env.NETLIFY,
        }
      }
    };

    console.log('📋 Test response:', response);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    };
  } catch (error: any) {
    console.error('❌ Test error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};