import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { authenticateRequest } from './utils/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validateMethod,
  logRequest,
  logError,
} from './utils/response';

interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  plan: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  usage: {
    totalRequests: number;
    monthlyRequests: number;
    lastResetDate: string;
  };
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const functionName = 'auth-me';
  
  try {
    // Validate HTTP method
    const methodValidation = validateMethod(event.httpMethod, ['GET']);
    if (methodValidation) return methodValidation;

    logRequest(functionName, event.httpMethod);

    // Authenticate request
    const authResult = authenticateRequest(event);
    if (!authResult.success || !authResult.user) {
      logRequest(functionName, event.httpMethod, undefined, { 
        action: 'authentication_failed',
        error: authResult.error 
      });
      return unauthorizedResponse(authResult.error);
    }

    const user = authResult.user;

    const response: UserProfileResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      isActive: user.isActive,
      usage: user.usage,
    };

    logRequest(functionName, event.httpMethod, user.id, { 
      action: 'profile_retrieved',
      plan: user.plan 
    });

    return successResponse(response, 'User profile retrieved successfully');

  } catch (error: any) {
    logError(functionName, error);
    return errorResponse('Internal server error', 500);
  }
};

export { handler };
