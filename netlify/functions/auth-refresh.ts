import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import {
  verifyRefreshToken,
  getUserById,
  generateTokens,
  revokeRefreshToken,
} from './utils/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validateMethod,
  parseRequestBody,
  logRequest,
  logError,
  validationErrorResponse,
} from './utils/response';

interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    plan: string;
  };
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const functionName = 'auth-refresh';
  
  try {
    // Validate HTTP method
    const methodValidation = validateMethod(event.httpMethod, ['POST']);
    if (methodValidation) return methodValidation;

    logRequest(functionName, event.httpMethod);

    // Parse and validate request body
    let requestBody: RefreshRequest;
    try {
      requestBody = parseRequestBody<RefreshRequest>(event.body);
    } catch (error: any) {
      logError(functionName, error);
      return errorResponse('Invalid request body', 400);
    }

    const { refreshToken } = requestBody;

    // Validate required fields
    if (!refreshToken) {
      return validationErrorResponse(['Refresh token is required']);
    }

    // Verify refresh token
    const tokenPayload = verifyRefreshToken(refreshToken);
    if (!tokenPayload) {
      logRequest(functionName, event.httpMethod, undefined, { 
        action: 'refresh_failed', 
        reason: 'invalid_refresh_token' 
      });
      return unauthorizedResponse('Invalid or expired refresh token');
    }

    // Get user
    const user = getUserById(tokenPayload.userId);
    if (!user || !user.isActive) {
      logRequest(functionName, event.httpMethod, tokenPayload.userId, { 
        action: 'refresh_failed', 
        reason: 'user_not_found_or_inactive' 
      });
      return unauthorizedResponse('User not found or inactive');
    }

    try {
      // Revoke old refresh token
      revokeRefreshToken(refreshToken);

      // Generate new tokens
      const { token: newToken, refreshToken: newRefreshToken } = generateTokens(user);

      const response: RefreshResponse = {
        token: newToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
        },
      };

      logRequest(functionName, event.httpMethod, user.id, { 
        action: 'refresh_success',
        plan: user.plan 
      });

      return successResponse(response, 'Tokens refreshed successfully');

    } catch (error: any) {
      logError(functionName, error, user.id, { action: 'token_refresh_failed' });
      return errorResponse('Failed to refresh tokens', 500);
    }

  } catch (error: any) {
    logError(functionName, error);
    return errorResponse('Internal server error', 500);
  }
};

export { handler };
