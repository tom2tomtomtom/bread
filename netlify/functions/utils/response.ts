import { HandlerResponse } from '@netlify/functions';

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Standard response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Response builders
export const successResponse = <T>(data: T, message?: string): HandlerResponse => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
    body: JSON.stringify(response),
  };
};

export const errorResponse = (
  error: string,
  statusCode: number = 400,
  details?: any
): HandlerResponse => {
  const response: ApiResponse = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
    ...(details && { data: details }),
  };

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
    body: JSON.stringify(response),
  };
};

export const unauthorizedResponse = (error: string = 'Unauthorized'): HandlerResponse => {
  return errorResponse(error, 401);
};

export const forbiddenResponse = (error: string = 'Forbidden'): HandlerResponse => {
  return errorResponse(error, 403);
};

export const notFoundResponse = (error: string = 'Not found'): HandlerResponse => {
  return errorResponse(error, 404);
};

export const methodNotAllowedResponse = (allowedMethods: string[] = []): HandlerResponse => {
  return {
    statusCode: 405,
    headers: {
      'Content-Type': 'application/json',
      'Allow': allowedMethods.join(', '),
      ...CORS_HEADERS,
    },
    body: JSON.stringify({
      success: false,
      error: 'Method not allowed',
      allowedMethods,
      timestamp: new Date().toISOString(),
    }),
  };
};

export const rateLimitResponse = (
  limit: number,
  resetTime: string
): HandlerResponse => {
  return {
    statusCode: 429,
    headers: {
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Reset': resetTime,
      'Retry-After': '3600', // 1 hour
      ...CORS_HEADERS,
    },
    body: JSON.stringify({
      success: false,
      error: 'Rate limit exceeded',
      limit,
      resetTime,
      timestamp: new Date().toISOString(),
    }),
  };
};

export const validationErrorResponse = (errors: string[]): HandlerResponse => {
  return errorResponse('Validation failed', 422, { validationErrors: errors });
};

export const corsResponse = (): HandlerResponse => {
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: '',
  };
};

// Method validation helper
export const validateMethod = (
  actualMethod: string,
  allowedMethods: string[]
): HandlerResponse | null => {
  if (actualMethod === 'OPTIONS') {
    return corsResponse();
  }
  
  if (!allowedMethods.includes(actualMethod)) {
    return methodNotAllowedResponse(allowedMethods);
  }
  
  return null;
};

// Request body parser with validation
export const parseRequestBody = <T>(body: string | null): T => {
  if (!body) {
    throw new Error('Request body is required');
  }
  
  try {
    return JSON.parse(body) as T;
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
};

// Logging helper
export const logRequest = (
  functionName: string,
  method: string,
  userId?: string,
  additionalInfo?: any
): void => {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    function: functionName,
    method,
    userId: userId || 'anonymous',
    ...additionalInfo,
  };
  
  console.log(`[${functionName}]`, JSON.stringify(logData));
};

// Error logging helper
export const logError = (
  functionName: string,
  error: any,
  userId?: string,
  additionalContext?: any
): void => {
  const timestamp = new Date().toISOString();
  const errorData = {
    timestamp,
    function: functionName,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    userId: userId || 'anonymous',
    ...additionalContext,
  };
  
  console.error(`[${functionName}] ERROR:`, JSON.stringify(errorData));
};
