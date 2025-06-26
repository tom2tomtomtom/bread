/**
 * 🚨 Enhanced Error Handling and User Feedback System
 * 
 * Provides comprehensive error handling, user-friendly error messages,
 * and automatic error reporting for the BREAD platform frontend.
 */

// Error categories for better user experience
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NETWORK = 'network',
  SERVER = 'server',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN = 'unknown',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Enhanced error interface
export interface EnhancedError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  technicalDetails?: string;
  timestamp: string;
  requestId?: string;
  retryable: boolean;
  retryAfter?: number;
  context?: any;
}

// Error message mappings for user-friendly display
const ERROR_MESSAGES: Record<string, { category: ErrorCategory; userMessage: string; retryable: boolean }> = {
  // Authentication errors
  'Invalid email or password': {
    category: ErrorCategory.AUTHENTICATION,
    userMessage: 'The email or password you entered is incorrect. Please try again.',
    retryable: true,
  },
  'User with this email already exists': {
    category: ErrorCategory.VALIDATION,
    userMessage: 'An account with this email already exists. Try signing in instead.',
    retryable: false,
  },
  'Account is deactivated': {
    category: ErrorCategory.AUTHORIZATION,
    userMessage: 'Your account has been deactivated. Please contact support for assistance.',
    retryable: false,
  },
  'Invalid or expired token': {
    category: ErrorCategory.AUTHENTICATION,
    userMessage: 'Your session has expired. Please sign in again.',
    retryable: true,
  },
  'Too many failed login attempts': {
    category: ErrorCategory.RATE_LIMIT,
    userMessage: 'Too many failed login attempts. Please wait a few minutes before trying again.',
    retryable: true,
  },

  // Rate limiting errors
  'Rate limit exceeded': {
    category: ErrorCategory.RATE_LIMIT,
    userMessage: 'You\'ve made too many requests. Please wait a moment before trying again.',
    retryable: true,
  },
  'Plan rate limit exceeded': {
    category: ErrorCategory.RATE_LIMIT,
    userMessage: 'You\'ve reached your plan\'s usage limit. Consider upgrading for more requests.',
    retryable: false,
  },

  // Validation errors
  'Validation failed': {
    category: ErrorCategory.VALIDATION,
    userMessage: 'Please check your input and try again.',
    retryable: true,
  },
  'Invalid request body': {
    category: ErrorCategory.VALIDATION,
    userMessage: 'There was an error with your request. Please try again.',
    retryable: true,
  },

  // Network errors
  'Failed to fetch': {
    category: ErrorCategory.NETWORK,
    userMessage: 'Unable to connect to our servers. Please check your internet connection and try again.',
    retryable: true,
  },
  'Network error': {
    category: ErrorCategory.NETWORK,
    userMessage: 'Network connection error. Please try again.',
    retryable: true,
  },

  // Server errors
  'Internal server error': {
    category: ErrorCategory.SERVER,
    userMessage: 'Something went wrong on our end. We\'re working to fix it. Please try again in a few minutes.',
    retryable: true,
  },
  'Service unavailable': {
    category: ErrorCategory.SERVER,
    userMessage: 'Our service is temporarily unavailable. Please try again in a few minutes.',
    retryable: true,
  },
};

/**
 * Generate unique error ID for tracking
 */
const generateErrorId = (): string => {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Determine error severity based on category and message
 */
const determineErrorSeverity = (category: ErrorCategory, message: string): ErrorSeverity => {
  if (category === ErrorCategory.SERVER || message.includes('Internal server error')) {
    return ErrorSeverity.HIGH;
  }
  if (category === ErrorCategory.NETWORK || category === ErrorCategory.RATE_LIMIT) {
    return ErrorSeverity.MEDIUM;
  }
  if (category === ErrorCategory.AUTHENTICATION || category === ErrorCategory.AUTHORIZATION) {
    return ErrorSeverity.MEDIUM;
  }
  return ErrorSeverity.LOW;
};

/**
 * Enhanced error handler that converts raw errors into user-friendly format
 */
export const handleError = (
  error: any,
  context?: any,
  requestId?: string
): EnhancedError => {
  const errorId = generateErrorId();
  const timestamp = new Date().toISOString();
  
  let message = 'An unexpected error occurred';
  let category = ErrorCategory.UNKNOWN;
  let userMessage = 'Something went wrong. Please try again.';
  let retryable = true;
  let retryAfter: number | undefined;
  let technicalDetails: string | undefined;

  // Extract error information
  if (typeof error === 'string') {
    message = error;
  } else if (error?.message) {
    message = error.message;
  } else if (error?.error) {
    message = error.error;
  }

  // Extract retry information
  if (error?.retryAfter) {
    retryAfter = error.retryAfter;
  }

  // Extract technical details
  if (error?.stack) {
    technicalDetails = error.stack;
  } else if (error?.details) {
    technicalDetails = JSON.stringify(error.details);
  }

  // Map to user-friendly error
  const errorMapping = ERROR_MESSAGES[message];
  if (errorMapping) {
    category = errorMapping.category;
    userMessage = errorMapping.userMessage;
    retryable = errorMapping.retryable;
  } else {
    // Try to categorize based on HTTP status or error type
    if (error?.status === 401 || message.includes('unauthorized') || message.includes('token')) {
      category = ErrorCategory.AUTHENTICATION;
      userMessage = 'Please sign in again to continue.';
    } else if (error?.status === 403) {
      category = ErrorCategory.AUTHORIZATION;
      userMessage = 'You don\'t have permission to perform this action.';
    } else if (error?.status === 429) {
      category = ErrorCategory.RATE_LIMIT;
      userMessage = 'Too many requests. Please wait a moment before trying again.';
    } else if (error?.status >= 500) {
      category = ErrorCategory.SERVER;
      userMessage = 'Server error. We\'re working to fix it. Please try again in a few minutes.';
    } else if (error?.status >= 400) {
      category = ErrorCategory.VALIDATION;
      userMessage = 'Please check your input and try again.';
    } else if (message.includes('fetch') || message.includes('network')) {
      category = ErrorCategory.NETWORK;
      userMessage = 'Network connection error. Please check your internet connection and try again.';
    }
  }

  const severity = determineErrorSeverity(category, message);

  const enhancedError: EnhancedError = {
    id: errorId,
    category,
    severity,
    message,
    userMessage,
    technicalDetails,
    timestamp,
    requestId,
    retryable,
    retryAfter,
    context,
  };

  // Log error for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Enhanced Error:', enhancedError);
  }

  // Report critical errors (in production, this could send to error tracking service)
  if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
    reportError(enhancedError);
  }

  return enhancedError;
};

/**
 * Report error to monitoring service (placeholder for production implementation)
 */
const reportError = (error: EnhancedError): void => {
  // In production, this would send to error tracking service like Sentry
  console.error('🔴 Critical Error Reported:', {
    id: error.id,
    category: error.category,
    severity: error.severity,
    message: error.message,
    timestamp: error.timestamp,
    requestId: error.requestId,
  });
};

/**
 * Get user-friendly error message with retry information
 */
export const getErrorMessage = (error: EnhancedError): string => {
  let message = error.userMessage;
  
  if (error.retryAfter) {
    const minutes = Math.ceil(error.retryAfter / 60);
    message += ` Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
  } else if (error.retryable) {
    message += ' Please try again.';
  }
  
  return message;
};

/**
 * Check if error should trigger automatic retry
 */
export const shouldRetry = (error: EnhancedError, attemptCount: number = 0): boolean => {
  if (!error.retryable || attemptCount >= 3) {
    return false;
  }
  
  // Retry network errors and some server errors
  return error.category === ErrorCategory.NETWORK || 
         (error.category === ErrorCategory.SERVER && error.severity !== ErrorSeverity.CRITICAL);
};

/**
 * Get retry delay in milliseconds (exponential backoff)
 */
export const getRetryDelay = (attemptCount: number, baseDelay: number = 1000): number => {
  return Math.min(baseDelay * Math.pow(2, attemptCount), 30000); // Max 30 seconds
};

/**
 * Error boundary helper for React components
 */
export const createErrorBoundary = (componentName: string) => {
  return (error: Error, errorInfo: any) => {
    const enhancedError = handleError(error, { componentName, errorInfo });
    console.error(`Error in ${componentName}:`, enhancedError);
    return enhancedError;
  };
};
