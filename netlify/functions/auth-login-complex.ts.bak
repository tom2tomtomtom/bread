import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import {
  getUserByEmail,
  getUserPassword,
  comparePassword,
  generateTokens,
  validateEmail,
} from './utils/auth';
import {
  checkLoginAttempts,
  recordFailedLogin,
  resetLoginAttempts,
  getClientIP,
  logSecurityEvent,
  getSecurityHeaders,
} from './utils/security';
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

    // Get client information for security tracking
    const clientIP = getClientIP(event);
    const userAgent = event.headers['user-agent'] || 'unknown';

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

    // Check login attempts before proceeding
    const loginAttemptCheck = checkLoginAttempts(clientIP);
    if (!loginAttemptCheck.allowed) {
      const lockedUntil = loginAttemptCheck.lockedUntil;
      const retryAfter = lockedUntil ? Math.ceil((lockedUntil - Date.now()) / 1000) : 900;

      logSecurityEvent('login_attempt_blocked', undefined, clientIP, {
        attemptsRemaining: loginAttemptCheck.attemptsRemaining,
        lockedUntil,
        userAgent,
      }, 'high');

      return {
        statusCode: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          ...getSecurityHeaders(),
        },
        body: JSON.stringify({
          success: false,
          error: 'Too many failed login attempts. Account temporarily locked.',
          retryAfter,
        }),
      };
    }

    // Find user by email
    const user = getUserByEmail(email.toLowerCase());
    if (!user) {
      recordFailedLogin(clientIP);
      logSecurityEvent('login_failed', undefined, clientIP, {
        reason: 'user_not_found',
        email: email.toLowerCase(),
        userAgent,
      }, 'medium');
      return errorResponse('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      recordFailedLogin(clientIP);
      logSecurityEvent('login_failed', user.id, clientIP, {
        reason: 'user_inactive',
        userAgent,
      }, 'medium');
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
      recordFailedLogin(clientIP);
      logSecurityEvent('login_failed', user.id, clientIP, {
        reason: 'invalid_password',
        userAgent,
      }, 'medium');
      return errorResponse('Invalid email or password', 401);
    }

    // Reset login attempts on successful password verification
    resetLoginAttempts(clientIP);

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

      logSecurityEvent('login_success', user.id, clientIP, {
        plan: user.plan,
        userAgent,
      }, 'low');

      // Return response with security headers
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getSecurityHeaders(),
        },
        body: JSON.stringify({
          success: true,
          data: response,
          message: 'Login successful',
          timestamp: new Date().toISOString(),
        }),
      };

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
