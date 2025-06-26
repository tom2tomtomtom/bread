import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import {
  getHealthStatus,
  getErrorAnalytics,
  getPerformanceAnalytics,
  cleanupMonitoringData,
} from './utils/monitoring';
import {
  successResponse,
  errorResponse,
  validateMethod,
  corsResponse,
  withRequestMonitoring,
} from './utils/response';

/**
 * 🔍 Health Monitoring Endpoint
 * 
 * Provides comprehensive system health, error analytics, and performance metrics
 * for the BREAD platform authentication and API systems.
 */

interface HealthResponse {
  system: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    timestamp: string;
  };
  performance: {
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    p95ResponseTime: number;
  };
  errors: {
    last24h: number;
    critical: number;
    high: number;
    byFunction: Record<string, number>;
  };
  security: {
    rateLimitViolations: number;
    failedLogins: number;
    suspiciousActivity: number;
  };
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const functionName = 'health';

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return corsResponse();
    }

    // Validate HTTP method
    const methodValidation = validateMethod(event.httpMethod, ['GET']);
    if (methodValidation) return methodValidation;

    return withRequestMonitoring(functionName, async (requestId: string) => {
      // Clean up old monitoring data
      cleanupMonitoringData();

      // Get system health status
      const healthStatus = getHealthStatus();
      
      // Get error analytics
      const errorAnalytics = getErrorAnalytics(24);
      
      // Get performance analytics
      const performanceAnalytics = getPerformanceAnalytics(24);

      // Compile health response
      const healthResponse: HealthResponse = {
        system: {
          status: healthStatus.status,
          uptime: healthStatus.uptime,
          timestamp: healthStatus.timestamp,
        },
        performance: {
          totalRequests: performanceAnalytics.totalRequests,
          successRate: performanceAnalytics.successRate,
          averageResponseTime: performanceAnalytics.averageResponseTime,
          p95ResponseTime: performanceAnalytics.p95ResponseTime,
        },
        errors: {
          last24h: errorAnalytics.total,
          critical: errorAnalytics.bySeverity.critical || 0,
          high: errorAnalytics.bySeverity.high || 0,
          byFunction: errorAnalytics.byFunction,
        },
        security: {
          rateLimitViolations: errorAnalytics.byFunction['rate_limit_exceeded'] || 0,
          failedLogins: errorAnalytics.byFunction['login_failed'] || 0,
          suspiciousActivity: (errorAnalytics.bySeverity.critical || 0) + (errorAnalytics.bySeverity.high || 0),
        },
      };

      // Determine appropriate HTTP status based on health
      let statusCode = 200;
      if (healthStatus.status === 'degraded') {
        statusCode = 200; // Still operational
      } else if (healthStatus.status === 'unhealthy') {
        statusCode = 503; // Service unavailable
      }

      return {
        statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Request-ID': requestId,
        },
        body: JSON.stringify({
          success: true,
          data: healthResponse,
          message: `System is ${healthStatus.status}`,
          timestamp: new Date().toISOString(),
          requestId,
        }),
      };
    });

  } catch (error: any) {
    console.error('Health check error:', error);
    return errorResponse('Health check failed', 500, undefined, undefined, undefined, functionName);
  }
};

export { handler };
