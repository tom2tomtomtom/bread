/**
 * 🔍 Enhanced Monitoring and Error Handling for BREAD Platform
 * 
 * Provides comprehensive monitoring, error tracking, and performance analytics
 * for the authentication system and API functions.
 */

import { HandlerEvent } from '@netlify/functions';

// Monitoring configuration
const MONITORING_CONFIG = {
  ENABLE_PERFORMANCE_MONITORING: process.env.ENABLE_PERFORMANCE_MONITORING === 'true',
  ENABLE_ERROR_TRACKING: process.env.ENABLE_ERROR_TRACKING === 'true',
  ENABLE_USAGE_ANALYTICS: process.env.ENABLE_USAGE_ANALYTICS === 'true',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ERROR_RETENTION_HOURS: parseInt(process.env.ERROR_RETENTION_HOURS || '24'),
  PERFORMANCE_SAMPLE_RATE: parseFloat(process.env.PERFORMANCE_SAMPLE_RATE || '0.1'),
};

// In-memory stores for monitoring data
const errorStore: ErrorEntry[] = [];
const performanceStore: PerformanceEntry[] = [];
const usageStore: UsageEntry[] = [];
const healthMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  lastHealthCheck: new Date().toISOString(),
};

// Types
interface ErrorEntry {
  id: string;
  timestamp: string;
  functionName: string;
  errorType: string;
  message: string;
  stack?: string;
  userId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: any;
}

interface PerformanceEntry {
  id: string;
  timestamp: string;
  functionName: string;
  duration: number;
  memoryUsage?: number;
  userId?: string;
  requestId?: string;
  success: boolean;
  context?: any;
}

interface UsageEntry {
  timestamp: string;
  functionName: string;
  userId?: string;
  plan?: string;
  endpoint: string;
  responseTime: number;
  success: boolean;
  ip?: string;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errors: {
    last24h: number;
    critical: number;
    high: number;
  };
  timestamp: string;
}

/**
 * Generate unique request ID for tracking
 */
export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Enhanced error logging with context and categorization
 */
export const logError = (
  functionName: string,
  error: Error | string,
  userId?: string,
  context?: any,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  requestId?: string
): void => {
  if (!MONITORING_CONFIG.ENABLE_ERROR_TRACKING) return;

  const errorEntry: ErrorEntry = {
    id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    functionName,
    errorType: error instanceof Error ? error.constructor.name : 'StringError',
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    userId,
    requestId,
    severity,
    context,
  };

  errorStore.push(errorEntry);

  // Keep only recent errors
  const cutoff = Date.now() - (MONITORING_CONFIG.ERROR_RETENTION_HOURS * 60 * 60 * 1000);
  const recentErrors = errorStore.filter(e => new Date(e.timestamp).getTime() > cutoff);
  errorStore.length = 0;
  errorStore.push(...recentErrors);

  // Log to console based on severity and log level
  const shouldLog = 
    severity === 'critical' ||
    (severity === 'high' && ['debug', 'info', 'warn', 'error'].includes(MONITORING_CONFIG.LOG_LEVEL)) ||
    (severity === 'medium' && ['debug', 'info', 'warn'].includes(MONITORING_CONFIG.LOG_LEVEL)) ||
    (severity === 'low' && ['debug', 'info'].includes(MONITORING_CONFIG.LOG_LEVEL));

  if (shouldLog) {
    const logMethod = severity === 'critical' ? console.error : 
                     severity === 'high' ? console.error :
                     severity === 'medium' ? console.warn : console.info;
    
    logMethod(`🚨 [${severity.toUpperCase()}] ${functionName}:`, {
      error: errorEntry.message,
      userId,
      requestId,
      context,
    });
  }

  // Update health metrics
  healthMetrics.failedRequests++;
};

/**
 * Performance monitoring with sampling
 */
export const trackPerformance = (
  functionName: string,
  startTime: number,
  success: boolean,
  userId?: string,
  context?: any,
  requestId?: string
): void => {
  if (!MONITORING_CONFIG.ENABLE_PERFORMANCE_MONITORING) return;

  // Sample based on configured rate
  if (Math.random() > MONITORING_CONFIG.PERFORMANCE_SAMPLE_RATE) return;

  const duration = Date.now() - startTime;
  const memoryUsage = process.memoryUsage ? process.memoryUsage().heapUsed : undefined;

  const performanceEntry: PerformanceEntry = {
    id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    functionName,
    duration,
    memoryUsage,
    userId,
    requestId,
    success,
    context,
  };

  performanceStore.push(performanceEntry);

  // Keep only recent entries (last 1000)
  if (performanceStore.length > 1000) {
    performanceStore.splice(0, performanceStore.length - 1000);
  }

  // Update health metrics
  healthMetrics.totalRequests++;
  if (success) {
    healthMetrics.successfulRequests++;
  }

  // Update average response time (rolling average)
  const alpha = 0.1; // Smoothing factor
  healthMetrics.averageResponseTime = 
    (alpha * duration) + ((1 - alpha) * healthMetrics.averageResponseTime);
};

/**
 * Usage analytics tracking
 */
export const trackUsage = (
  functionName: string,
  endpoint: string,
  responseTime: number,
  success: boolean,
  userId?: string,
  plan?: string,
  ip?: string
): void => {
  if (!MONITORING_CONFIG.ENABLE_USAGE_ANALYTICS) return;

  const usageEntry: UsageEntry = {
    timestamp: new Date().toISOString(),
    functionName,
    userId,
    plan,
    endpoint,
    responseTime,
    success,
    ip,
  };

  usageStore.push(usageEntry);

  // Keep only recent entries (last 10000)
  if (usageStore.length > 10000) {
    usageStore.splice(0, usageStore.length - 10000);
  }
};

/**
 * Get system health status
 */
export const getHealthStatus = (): HealthStatus => {
  const now = Date.now();
  const last24h = now - (24 * 60 * 60 * 1000);
  
  const recentErrors = errorStore.filter(e => new Date(e.timestamp).getTime() > last24h);
  const criticalErrors = recentErrors.filter(e => e.severity === 'critical').length;
  const highErrors = recentErrors.filter(e => e.severity === 'high').length;
  
  const successRate = healthMetrics.totalRequests > 0 ? 
    (healthMetrics.successfulRequests / healthMetrics.totalRequests) * 100 : 100;

  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (criticalErrors > 0 || successRate < 90) {
    status = 'unhealthy';
  } else if (highErrors > 5 || successRate < 95 || healthMetrics.averageResponseTime > 5000) {
    status = 'degraded';
  }

  return {
    status,
    uptime: now - new Date(healthMetrics.lastHealthCheck).getTime(),
    totalRequests: healthMetrics.totalRequests,
    successRate: Math.round(successRate * 100) / 100,
    averageResponseTime: Math.round(healthMetrics.averageResponseTime),
    errors: {
      last24h: recentErrors.length,
      critical: criticalErrors,
      high: highErrors,
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * Get error analytics
 */
export const getErrorAnalytics = (hours: number = 24): {
  total: number;
  bySeverity: Record<string, number>;
  byFunction: Record<string, number>;
  recent: ErrorEntry[];
} => {
  const cutoff = Date.now() - (hours * 60 * 60 * 1000);
  const recentErrors = errorStore.filter(e => new Date(e.timestamp).getTime() > cutoff);

  const bySeverity = recentErrors.reduce((acc, error) => {
    acc[error.severity] = (acc[error.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byFunction = recentErrors.reduce((acc, error) => {
    acc[error.functionName] = (acc[error.functionName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: recentErrors.length,
    bySeverity,
    byFunction,
    recent: recentErrors.slice(-10), // Last 10 errors
  };
};

/**
 * Get performance analytics
 */
export const getPerformanceAnalytics = (hours: number = 24): {
  averageResponseTime: number;
  p95ResponseTime: number;
  totalRequests: number;
  successRate: number;
  byFunction: Record<string, { avg: number; count: number; successRate: number }>;
} => {
  const cutoff = Date.now() - (hours * 60 * 60 * 1000);
  const recentPerformance = performanceStore.filter(p => new Date(p.timestamp).getTime() > cutoff);

  if (recentPerformance.length === 0) {
    return {
      averageResponseTime: 0,
      p95ResponseTime: 0,
      totalRequests: 0,
      successRate: 100,
      byFunction: {},
    };
  }

  const durations = recentPerformance.map(p => p.duration).sort((a, b) => a - b);
  const p95Index = Math.floor(durations.length * 0.95);
  const p95ResponseTime = durations[p95Index] || 0;

  const averageResponseTime = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  const successfulRequests = recentPerformance.filter(p => p.success).length;
  const successRate = (successfulRequests / recentPerformance.length) * 100;

  const byFunction = recentPerformance.reduce((acc, perf) => {
    if (!acc[perf.functionName]) {
      acc[perf.functionName] = { total: 0, count: 0, successful: 0 };
    }
    acc[perf.functionName].total += perf.duration;
    acc[perf.functionName].count++;
    if (perf.success) acc[perf.functionName].successful++;
    return acc;
  }, {} as Record<string, { total: number; count: number; successful: number }>);

  const functionStats = Object.entries(byFunction).reduce((acc, [func, stats]) => {
    acc[func] = {
      avg: Math.round(stats.total / stats.count),
      count: stats.count,
      successRate: Math.round((stats.successful / stats.count) * 100),
    };
    return acc;
  }, {} as Record<string, { avg: number; count: number; successRate: number }>);

  return {
    averageResponseTime: Math.round(averageResponseTime),
    p95ResponseTime: Math.round(p95ResponseTime),
    totalRequests: recentPerformance.length,
    successRate: Math.round(successRate * 100) / 100,
    byFunction: functionStats,
  };
};

/**
 * Enhanced request wrapper with monitoring
 */
export const withMonitoring = <T>(
  functionName: string,
  handler: (event: HandlerEvent, requestId: string) => Promise<T>,
  event: HandlerEvent
): Promise<T> => {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  return handler(event, requestId)
    .then(result => {
      trackPerformance(functionName, startTime, true, undefined, undefined, requestId);
      return result;
    })
    .catch(error => {
      logError(functionName, error, undefined, { event: event.httpMethod }, 'high', requestId);
      trackPerformance(functionName, startTime, false, undefined, undefined, requestId);
      throw error;
    });
};

/**
 * Clear old monitoring data
 */
export const cleanupMonitoringData = (): void => {
  const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
  
  // Clean errors
  const recentErrors = errorStore.filter(e => new Date(e.timestamp).getTime() > cutoff);
  errorStore.length = 0;
  errorStore.push(...recentErrors);
  
  // Clean performance data (keep last 1000 entries)
  if (performanceStore.length > 1000) {
    performanceStore.splice(0, performanceStore.length - 1000);
  }
  
  // Clean usage data (keep last 10000 entries)
  if (usageStore.length > 10000) {
    usageStore.splice(0, usageStore.length - 10000);
  }
};
