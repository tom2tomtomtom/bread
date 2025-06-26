/**
 * 🔐 Enhanced Security Utilities for BREAD Authentication System
 * 
 * Provides additional security features including:
 * - Enhanced rate limiting
 * - Security headers
 * - Input sanitization
 * - Session management
 * - Audit logging
 */

import { HandlerEvent } from '@netlify/functions';
import crypto from 'crypto';

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  RATE_LIMIT_BURST_MAX: parseInt(process.env.RATE_LIMIT_BURST_MAX || '20'),
  RATE_LIMIT_BURST_WINDOW: parseInt(process.env.RATE_LIMIT_BURST_WINDOW || '60000'), // 1 minute
  
  // Password policy
  PASSWORD_MIN_LENGTH: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
  PASSWORD_REQUIRE_UPPERCASE: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
  PASSWORD_REQUIRE_LOWERCASE: process.env.PASSWORD_REQUIRE_LOWERCASE === 'true',
  PASSWORD_REQUIRE_NUMBERS: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
  PASSWORD_REQUIRE_SYMBOLS: process.env.PASSWORD_REQUIRE_SYMBOLS === 'true',
  
  // Security features
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
  LOCKOUT_DURATION: parseInt(process.env.LOCKOUT_DURATION || '900000'), // 15 minutes
  ENABLE_AUDIT_LOGGING: process.env.ENABLE_AUDIT_LOGGING === 'true',
  ENABLE_SECURITY_HEADERS: process.env.ENABLE_SECURITY_HEADERS === 'true',
};

// In-memory stores for rate limiting and security tracking
const rateLimitStore = new Map<string, { count: number; resetTime: number; burstCount: number; burstResetTime: number }>();
const loginAttemptStore = new Map<string, { attempts: number; lockedUntil?: number }>();
const auditLogStore: AuditLogEntry[] = [];

// Types
interface AuditLogEntry {
  timestamp: string;
  event: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  details?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityHeaders {
  [key: string]: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Enhanced rate limiting with burst protection
 */
export const checkRateLimit = (identifier: string): RateLimitResult => {
  const now = Date.now();
  const current = rateLimitStore.get(identifier) || {
    count: 0,
    resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW,
    burstCount: 0,
    burstResetTime: now + SECURITY_CONFIG.RATE_LIMIT_BURST_WINDOW,
  };

  // Reset counters if windows have expired
  if (now > current.resetTime) {
    current.count = 0;
    current.resetTime = now + SECURITY_CONFIG.RATE_LIMIT_WINDOW;
  }

  if (now > current.burstResetTime) {
    current.burstCount = 0;
    current.burstResetTime = now + SECURITY_CONFIG.RATE_LIMIT_BURST_WINDOW;
  }

  // Check burst limit first
  if (current.burstCount >= SECURITY_CONFIG.RATE_LIMIT_BURST_MAX) {
    rateLimitStore.set(identifier, current);
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.burstResetTime,
      retryAfter: Math.ceil((current.burstResetTime - now) / 1000),
    };
  }

  // Check main rate limit
  if (current.count >= SECURITY_CONFIG.RATE_LIMIT_MAX) {
    rateLimitStore.set(identifier, current);
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
      retryAfter: Math.ceil((current.resetTime - now) / 1000),
    };
  }

  // Increment counters
  current.count++;
  current.burstCount++;
  rateLimitStore.set(identifier, current);

  return {
    allowed: true,
    remaining: SECURITY_CONFIG.RATE_LIMIT_MAX - current.count,
    resetTime: current.resetTime,
  };
};

/**
 * Track and manage login attempts
 */
export const checkLoginAttempts = (identifier: string): { allowed: boolean; attemptsRemaining: number; lockedUntil?: number } => {
  const now = Date.now();
  const attempts = loginAttemptStore.get(identifier) || { attempts: 0 };

  // Check if account is locked
  if (attempts.lockedUntil && now < attempts.lockedUntil) {
    return {
      allowed: false,
      attemptsRemaining: 0,
      lockedUntil: attempts.lockedUntil,
    };
  }

  // Reset if lock period has expired
  if (attempts.lockedUntil && now >= attempts.lockedUntil) {
    attempts.attempts = 0;
    attempts.lockedUntil = undefined;
  }

  return {
    allowed: attempts.attempts < SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
    attemptsRemaining: Math.max(0, SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - attempts.attempts),
  };
};

/**
 * Record failed login attempt
 */
export const recordFailedLogin = (identifier: string): void => {
  const now = Date.now();
  const attempts = loginAttemptStore.get(identifier) || { attempts: 0 };
  
  attempts.attempts++;
  
  if (attempts.attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
    attempts.lockedUntil = now + SECURITY_CONFIG.LOCKOUT_DURATION;
    logSecurityEvent('account_locked', undefined, identifier, {
      attempts: attempts.attempts,
      lockedUntil: attempts.lockedUntil,
    }, 'high');
  }
  
  loginAttemptStore.set(identifier, attempts);
};

/**
 * Reset login attempts on successful login
 */
export const resetLoginAttempts = (identifier: string): void => {
  loginAttemptStore.delete(identifier);
};

/**
 * Enhanced password validation
 */
export const validatePasswordStrength = (password: string): { valid: boolean; errors: string[]; strength: number } => {
  const errors: string[] = [];
  let strength = 0;

  // Length check
  if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long`);
  } else {
    strength += 20;
  }

  // Character type checks
  if (SECURITY_CONFIG.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (/[A-Z]/.test(password)) {
    strength += 20;
  }

  if (SECURITY_CONFIG.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (/[a-z]/.test(password)) {
    strength += 20;
  }

  if (SECURITY_CONFIG.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (/\d/.test(password)) {
    strength += 20;
  }

  if (SECURITY_CONFIG.PASSWORD_REQUIRE_SYMBOLS && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    strength += 20;
  }

  // Additional strength checks
  if (password.length >= 12) strength += 10;
  if (password.length >= 16) strength += 10;
  if (/(.)\1{2,}/.test(password)) strength -= 10; // Repeated characters
  if (/^(.+)\1+$/.test(password)) strength -= 20; // Pattern repetition

  return {
    valid: errors.length === 0,
    errors,
    strength: Math.max(0, Math.min(100, strength)),
  };
};

/**
 * Generate security headers
 */
export const getSecurityHeaders = (): SecurityHeaders => {
  if (!SECURITY_CONFIG.ENABLE_SECURITY_HEADERS) {
    return {};
  }

  const corsOrigin = process.env.CORS_ORIGIN || '*';
  
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.openai.com https://api.anthropic.com",
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
};

/**
 * Sanitize input to prevent injection attacks
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes that could break SQL
    .replace(/[\\]/g, '') // Remove backslashes
    .substring(0, 1000); // Limit length
};

/**
 * Extract client IP address
 */
export const getClientIP = (event: HandlerEvent): string => {
  return event.headers['x-forwarded-for'] || 
         event.headers['x-real-ip'] || 
         event.headers['cf-connecting-ip'] || 
         'unknown';
};

/**
 * Log security events for audit trail
 */
export const logSecurityEvent = (
  event: string,
  userId?: string,
  identifier?: string,
  details?: any,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): void => {
  if (!SECURITY_CONFIG.ENABLE_AUDIT_LOGGING) return;

  const logEntry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    event,
    userId,
    ip: identifier,
    details,
    severity,
  };

  auditLogStore.push(logEntry);

  // Keep only recent entries (last 1000)
  if (auditLogStore.length > 1000) {
    auditLogStore.splice(0, auditLogStore.length - 1000);
  }

  // Log critical events to console
  if (severity === 'critical') {
    console.error('🚨 CRITICAL SECURITY EVENT:', logEntry);
  }
};

/**
 * Get audit logs (for admin interface)
 */
export const getAuditLogs = (limit: number = 100): AuditLogEntry[] => {
  return auditLogStore.slice(-limit);
};

/**
 * Generate secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('base64url');
};

/**
 * Hash sensitive data for logging
 */
export const hashForLogging = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 8);
};
