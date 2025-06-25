import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import {
  createUser,
  getUserByEmail,
  generateTokens,
  validateEmail,
  validatePassword,
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

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    plan: string;
    createdAt: string;
  };
  token: string;
  refreshToken: string;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const functionName = 'auth-register';
  
  try {
    // Validate HTTP method
    const methodValidation = validateMethod(event.httpMethod, ['POST']);
    if (methodValidation) return methodValidation;

    logRequest(functionName, event.httpMethod);

    // Parse and validate request body
    let requestBody: RegisterRequest;
    try {
      requestBody = parseRequestBody<RegisterRequest>(event.body);
    } catch (error: any) {
      logError(functionName, error);
      return errorResponse('Invalid request body', 400);
    }

    const { email, password, name } = requestBody;

    // Validate required fields
    const validationErrors: string[] = [];
    
    if (!email) {
      validationErrors.push('Email is required');
    } else if (!validateEmail(email)) {
      validationErrors.push('Invalid email format');
    }

    if (!password) {
      validationErrors.push('Password is required');
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        validationErrors.push(...passwordValidation.errors);
      }
    }

    if (!name || name.trim().length < 2) {
      validationErrors.push('Name must be at least 2 characters long');
    }

    if (validationErrors.length > 0) {
      return validationErrorResponse(validationErrors);
    }

    // Check if user already exists
    const existingUser = getUserByEmail(email.toLowerCase());
    if (existingUser) {
      logRequest(functionName, event.httpMethod, undefined, { 
        action: 'registration_failed', 
        reason: 'email_exists',
        email: email.toLowerCase() 
      });
      return errorResponse('User with this email already exists', 409);
    }

    // Create new user
    try {
      const newUser = await createUser(email.toLowerCase(), password, name.trim());
      const { token, refreshToken } = generateTokens(newUser);

      const response: RegisterResponse = {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          plan: newUser.plan,
          createdAt: newUser.createdAt,
        },
        token,
        refreshToken,
      };

      logRequest(functionName, event.httpMethod, newUser.id, { 
        action: 'registration_success',
        plan: newUser.plan 
      });

      return successResponse(response, 'User registered successfully');

    } catch (error: any) {
      logError(functionName, error, undefined, { 
        action: 'user_creation_failed',
        email: email.toLowerCase() 
      });
      return errorResponse('Failed to create user account', 500);
    }

  } catch (error: any) {
    logError(functionName, error);
    return errorResponse('Internal server error', 500);
  }
};

export { handler };
