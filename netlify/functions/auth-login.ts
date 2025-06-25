import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import {
  getUserByEmail,
  getUserPassword,
  comparePassword,
  generateTokens,
  validateEmail,
} from './utils/auth';
import {
  successResponse,
  errorResponse,
  validateMethod,
  parseRequestBody,
  logRequest,
  logError,
  validationErrorResponse,
} from './utils/response';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    plan: string;
    lastLogin?: string;
  };
  token: string;
  refreshToken: string;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const functionName = 'auth-login';
  
  try {
    // Validate HTTP method
    const methodValidation = validateMethod(event.httpMethod, ['POST']);
    if (methodValidation) return methodValidation;

    logRequest(functionName, event.httpMethod);

    // Parse and validate request body
    let requestBody: LoginRequest;
    try {
      requestBody = parseRequestBody<LoginRequest>(event.body);
    } catch (error: any) {
      logError(functionName, error);
      return errorResponse('Invalid request body', 400);
    }

    const { email, password } = requestBody;

    // Validate required fields
    const validationErrors: string[] = [];
    
    if (!email) {
      validationErrors.push('Email is required');
    } else if (!validateEmail(email)) {
      validationErrors.push('Invalid email format');
    }

    if (!password) {
      validationErrors.push('Password is required');
    }

    if (validationErrors.length > 0) {
      return validationErrorResponse(validationErrors);
    }

    // Find user by email
    const user = getUserByEmail(email.toLowerCase());
    if (!user) {
      logRequest(functionName, event.httpMethod, undefined, { 
        action: 'login_failed', 
        reason: 'user_not_found',
        email: email.toLowerCase() 
      });
      return errorResponse('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      logRequest(functionName, event.httpMethod, user.id, { 
        action: 'login_failed', 
        reason: 'user_inactive' 
      });
      return errorResponse('Account is deactivated', 403);
    }

    // Verify password
    const storedPassword = getUserPassword(user.id);
    if (!storedPassword) {
      logError(functionName, new Error('Password not found for user'), user.id);
      return errorResponse('Authentication failed', 500);
    }

    const isPasswordValid = await comparePassword(password, storedPassword);
    if (!isPasswordValid) {
      logRequest(functionName, event.httpMethod, user.id, { 
        action: 'login_failed', 
        reason: 'invalid_password' 
      });
      return errorResponse('Invalid email or password', 401);
    }

    // Generate tokens
    try {
      const { token, refreshToken } = generateTokens(user);

      // Update last login time
      user.lastLogin = new Date().toISOString();

      const response: LoginResponse = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          lastLogin: user.lastLogin,
        },
        token,
        refreshToken,
      };

      logRequest(functionName, event.httpMethod, user.id, { 
        action: 'login_success',
        plan: user.plan 
      });

      return successResponse(response, 'Login successful');

    } catch (error: any) {
      logError(functionName, error, user.id, { action: 'token_generation_failed' });
      return errorResponse('Authentication failed', 500);
    }

  } catch (error: any) {
    logError(functionName, error);
    return errorResponse('Internal server error', 500);
  }
};

export { handler };
