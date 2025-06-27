import { HandlerResponse } from '@netlify/functions';
import { logError, trackUsage, generateRequestId } from './monitoring';
import { getSecurityHeaders } from './security';

// Enhanced CORS headers with security
const getCorsHeaders = () => {
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Expose-Headers': 'X-Request-ID, X-Rate-Limit-Remaining',
  };
};

// Enhanced response interface with monitoring
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  requestId?: string;
  retryAfter?: number;
  rateLimit?: {
    remaining: number;
    resetTime: number;
  };
}

// Enhanced response builders with monitoring
export const successResponse = <T>(
  data: T,
  message?: string,
  requestId?: string,
  rateLimit?: { remaining: number; resetTime: number }
): HandlerResponse => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    requestId,
    rateLimit,
  };

  const headers = {
    'Content-Type': 'application/json',
    ...getCorsHeaders(),
    ...getSecurityHeaders(),
  };

  if (requestId) {
    headers['X-Request-ID'] = requestId;
  }

  if (rateLimit) {
    headers['X-Rate-Limit-Remaining'] = rateLimit.remaining.toString();
    headers['X-Rate-Limit-Reset'] = new Date(rateLimit.resetTime).toISOString();
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(response),
  };
};

export const errorResponse = (
  error: string,
  statusCode: number = 400,
  details?: any,
  requestId?: string,
  retryAfter?: number,
  functionName?: string
): HandlerResponse => {
  // Log error for monitoring
  if (functionName && statusCode >= 500) {
    logError(functionName, error, undefined, details, 'high', requestId);
  } else if (functionName && statusCode >= 400) {
    logError(functionName, error, undefined, details, 'medium', requestId);
  }

  const response: ApiResponse = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
    requestId,
    retryAfter,
    ...(details && { data: details }),
  };

  const headers = {
    'Content-Type': 'application/json',
    ...getCorsHeaders(),
    ...getSecurityHeaders(),
  };

  if (requestId) {
    headers['X-Request-ID'] = requestId;
  }

  if (retryAfter) {
    headers['Retry-After'] = retryAfter.toString();
  }

  return {
    statusCode,
    headers,
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

// Removed duplicate rateLimitResponse - using the enhanced version below

export const validationErrorResponse = (
  errors: string[],
  requestId?: string,
  functionName?: string
): HandlerResponse => {
  if (functionName) {
    logError(functionName, `Validation failed: ${errors.join(', ')}`, undefined, { validationErrors: errors }, 'low', requestId);
  }

  return errorResponse('Validation failed', 422, { validationErrors: errors }, requestId, undefined, functionName);
};

export const corsResponse = (): HandlerResponse => {
  return {
    statusCode: 200,
    headers: {
      ...getCorsHeaders(),
      ...getSecurityHeaders(),
    },
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

// Generic response builder
export const buildResponse = (
  statusCode: number,
  data: any,
  headers: Record<string, string> = {}
): HandlerResponse => {
  const isSuccess = statusCode >= 200 && statusCode < 300;
  const response: ApiResponse = {
    success: isSuccess,
    ...(isSuccess ? { data } : { error: data.error || data }),
    timestamp: new Date().toISOString(),
  };

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...headers,
    },
    body: JSON.stringify(response),
  };
};

// Request validation helper
export const validateRequest = (
  body: string | null,
  requiredFields: string[]
): { isValid: boolean; data?: any; error?: string } => {
  if (!body) {
    return { isValid: false, error: 'Request body is required' };
  }

  let parsedBody;
  try {
    parsedBody = JSON.parse(body);
  } catch (error) {
    return { isValid: false, error: 'Invalid JSON in request body' };
  }

  const missingFields = requiredFields.filter(field => !parsedBody[field]);
  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    };
  }

  return { isValid: true, data: parsedBody };
};

// Enhanced monitoring utilities
export const withRequestMonitoring = <T>(
  functionName: string,
  handler: (requestId: string) => Promise<T>
): Promise<T> => {
  const requestId = generateRequestId();
  const startTime = Date.now();

  return handler(requestId)
    .then(result => {
      trackUsage(functionName, functionName, Date.now() - startTime, true);
      return result;
    })
    .catch(error => {
      trackUsage(functionName, functionName, Date.now() - startTime, false);
      throw error;
    });
};

// Rate limit response helper
export const rateLimitResponse = (
  retryAfter: number,
  remaining: number = 0,
  requestId?: string,
  functionName?: string
): HandlerResponse => {
  if (functionName) {
    logError(functionName, 'Rate limit exceeded', undefined, { retryAfter, remaining }, 'medium', requestId);
  }

  return {
    statusCode: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': retryAfter.toString(),
      'X-Rate-Limit-Remaining': remaining.toString(),
      ...getCorsHeaders(),
      ...getSecurityHeaders(),
      ...(requestId && { 'X-Request-ID': requestId }),
    },
    body: JSON.stringify({
      success: false,
      error: 'Rate limit exceeded',
      retryAfter,
      remaining,
      timestamp: new Date().toISOString(),
      requestId,
    }),
  };
};
