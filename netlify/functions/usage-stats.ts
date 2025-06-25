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

interface UsageStatsResponse {
  user: {
    id: string;
    email: string;
    plan: string;
  };
  usage: {
    totalRequests: number;
    monthlyRequests: number;
    lastResetDate: string;
  };
  limits: {
    monthlyLimit: number;
    remaining: number;
    resetDate: string;
  };
  analytics: {
    averageRequestsPerDay: number;
    daysUntilReset: number;
    usagePercentage: number;
  };
}

// Rate limits by plan
const PLAN_LIMITS = {
  free: 50,
  pro: 500,
  enterprise: 5000,
};

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const functionName = 'usage-stats';
  
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

    // Calculate analytics
    const monthlyLimit = PLAN_LIMITS[user.plan];
    const remaining = Math.max(0, monthlyLimit - user.usage.monthlyRequests);
    const usagePercentage = Math.round((user.usage.monthlyRequests / monthlyLimit) * 100);

    // Calculate days until reset
    const lastReset = new Date(user.usage.lastResetDate);
    const nextReset = new Date(lastReset);
    nextReset.setMonth(nextReset.getMonth() + 1);
    const now = new Date();
    const daysUntilReset = Math.ceil((nextReset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate average requests per day
    const daysSinceReset = Math.max(1, Math.ceil((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24)));
    const averageRequestsPerDay = Math.round(user.usage.monthlyRequests / daysSinceReset);

    const response: UsageStatsResponse = {
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
      },
      usage: user.usage,
      limits: {
        monthlyLimit,
        remaining,
        resetDate: nextReset.toISOString(),
      },
      analytics: {
        averageRequestsPerDay,
        daysUntilReset,
        usagePercentage,
      },
    };

    logRequest(functionName, event.httpMethod, user.id, { 
      action: 'usage_stats_retrieved',
      plan: user.plan,
      usagePercentage 
    });

    return successResponse(response, 'Usage statistics retrieved successfully');

  } catch (error: any) {
    logError(functionName, error);
    return errorResponse('Internal server error', 500);
  }
};

export { handler };
