import { Handler, HandlerEvent } from '@netlify/functions';

interface ErrorLog {
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info';
}

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const errorData: ErrorLog = JSON.parse(event.body || '{}');
    
    // Log the error (in production you'd send to a logging service)
    console.error('Client Error:', {
      message: errorData.message,
      stack: errorData.stack,
      url: errorData.url,
      userAgent: errorData.userAgent,
      timestamp: errorData.timestamp,
      level: errorData.level || 'error'
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Error logged successfully' 
      }),
    };
  } catch (error) {
    console.error('Failed to log error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to log error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};