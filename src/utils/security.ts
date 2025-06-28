/**
 * Client-Side Security Utilities
 *
 * Provides comprehensive security features for the frontend:
 * - Input sanitization and validation
 * - CSRF protection
 * - XSS prevention
 * - Content Security Policy helpers
 * - Secure data handling
 *
 * Complements the server-side security implemented in Netlify Functions.
 */

// Security configuration
const SECURITY_CONFIG = {
  // Input validation
  MAX_INPUT_LENGTH: 10000,
  MAX_BRIEF_LENGTH: 5000,
  ALLOWED_HTML_TAGS: [], // No HTML allowed in user inputs

  // Rate limiting (client-side)
  MAX_REQUESTS_PER_MINUTE: 30,
  REQUEST_WINDOW_MS: 60000,

  // Content Security Policy
  CSP_NONCE_LENGTH: 16,

  // File upload security
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
};

/**
 * Input Sanitization
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';

  return (
    input
      .trim()
      // Remove potential HTML/XML tags
      .replace(/<[^>]*>/g, '')
      // Remove potential script injections
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      // Remove potential SQL injection patterns
      .replace(/['";\\]/g, '')
      // Limit length
      .substring(0, SECURITY_CONFIG.MAX_INPUT_LENGTH)
  );
};

/**
 * Validate brief content
 */
export const validateBrief = (brief: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!brief || typeof brief !== 'string') {
    errors.push('Brief is required');
    return { valid: false, errors };
  }

  const sanitized = sanitizeInput(brief);

  if (sanitized.length === 0) {
    errors.push('Brief cannot be empty after sanitization');
  }

  if (sanitized.length > SECURITY_CONFIG.MAX_BRIEF_LENGTH) {
    errors.push(`Brief exceeds maximum length of ${SECURITY_CONFIG.MAX_BRIEF_LENGTH} characters`);
  }

  if (sanitized.length < 10) {
    errors.push('Brief must be at least 10 characters long');
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\b(script|iframe|object|embed)\b/gi,
    /\b(eval|function|constructor)\b/gi,
    /\b(document\.|window\.|location\.)/gi,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      errors.push('Brief contains potentially unsafe content');
      break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * CSRF Protection
 */
class CSRFProtection {
  private static token: string | null = null;
  private static tokenExpiry: number = 0;

  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

    this.token = token;
    this.tokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

    // Store in sessionStorage for persistence across page reloads
    sessionStorage.setItem('csrf_token', token);
    sessionStorage.setItem('csrf_expiry', this.tokenExpiry.toString());

    return token;
  }

  static getToken(): string | null {
    // Check memory first
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    // Check sessionStorage
    const storedToken = sessionStorage.getItem('csrf_token');
    const storedExpiry = sessionStorage.getItem('csrf_expiry');

    if (storedToken && storedExpiry && Date.now() < parseInt(storedExpiry)) {
      this.token = storedToken;
      this.tokenExpiry = parseInt(storedExpiry);
      return storedToken;
    }

    // Generate new token if none exists or expired
    return this.generateToken();
  }

  static validateToken(token: string): boolean {
    const currentToken = this.getToken();
    return currentToken === token && Date.now() < this.tokenExpiry;
  }

  static clearToken(): void {
    this.token = null;
    this.tokenExpiry = 0;
    sessionStorage.removeItem('csrf_token');
    sessionStorage.removeItem('csrf_expiry');
  }
}

export { CSRFProtection };

/**
 * Rate Limiting (Client-side)
 */
class ClientRateLimit {
  private static requests: number[] = [];

  static checkLimit(): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowStart = now - SECURITY_CONFIG.REQUEST_WINDOW_MS;

    // Remove old requests outside the window
    this.requests = this.requests.filter(time => time > windowStart);

    const allowed = this.requests.length < SECURITY_CONFIG.MAX_REQUESTS_PER_MINUTE;

    if (allowed) {
      this.requests.push(now);
    }

    return {
      allowed,
      remaining: Math.max(0, SECURITY_CONFIG.MAX_REQUESTS_PER_MINUTE - this.requests.length),
      resetTime: windowStart + SECURITY_CONFIG.REQUEST_WINDOW_MS,
    };
  }

  static reset(): void {
    this.requests = [];
  }
}

export { ClientRateLimit };

/**
 * Secure API Request Helper
 */
export const secureApiRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Check rate limit
  const rateLimit = ClientRateLimit.checkLimit();
  if (!rateLimit.allowed) {
    throw new Error(
      `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds.`
    );
  }

  // Add CSRF token
  const csrfToken = CSRFProtection.getToken();
  const headers = new Headers(options.headers);

  if (csrfToken) {
    headers.set('X-CSRF-Token', csrfToken);
  }

  // Add security headers
  headers.set('X-Requested-With', 'XMLHttpRequest');
  headers.set('Cache-Control', 'no-cache');

  // Sanitize request body if it's JSON
  let body = options.body;
  if (body && typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      // Sanitize string values in the JSON
      const sanitized = sanitizeObjectStrings(parsed);
      body = JSON.stringify(sanitized);
    } catch {
      // If not JSON, sanitize as string
      body = sanitizeInput(body);
    }
  }

  return fetch(url, {
    ...options,
    headers,
    body,
    credentials: 'same-origin', // Include cookies for same-origin requests
  });
};

/**
 * Sanitize string values in an object recursively
 */
const sanitizeObjectStrings = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectStrings);
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeInput(key)] = sanitizeObjectStrings(value);
    }
    return sanitized;
  }

  return obj;
};

/**
 * File Upload Security
 */
export const validateFileUpload = (file: File): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check file type
  if (!SECURITY_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Check file size
  if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
    errors.push(`File size exceeds maximum of ${SECURITY_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Check file name
  const sanitizedName = sanitizeInput(file.name);
  if (sanitizedName !== file.name) {
    errors.push('File name contains invalid characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Content Security Policy Helpers
 */
export const generateCSPNonce = (): string => {
  const array = new Uint8Array(SECURITY_CONFIG.CSP_NONCE_LENGTH);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};

/**
 * Secure Local Storage
 */
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    try {
      const sanitizedKey = sanitizeInput(key);
      const sanitizedValue = sanitizeInput(value);
      localStorage.setItem(sanitizedKey, sanitizedValue);
    } catch (error) {
      console.error('Failed to store item securely:', error);
    }
  },

  getItem: (key: string): string | null => {
    try {
      const sanitizedKey = sanitizeInput(key);
      const value = localStorage.getItem(sanitizedKey);
      return value ? sanitizeInput(value) : null;
    } catch (error) {
      console.error('Failed to retrieve item securely:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      const sanitizedKey = sanitizeInput(key);
      localStorage.removeItem(sanitizedKey);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to remove item securely:', error);
      }
    }
  },
};

/**
 * Security Event Logging (Client-side)
 */
export const logSecurityEvent = (
  event: string,
  details?: any,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: sanitizeInput(event),
    details: sanitizeObjectStrings(details),
    severity,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔒 Security Event [${severity.toUpperCase()}]:`, logEntry);
  }

  // In production, you might want to send this to a logging service
  // secureApiRequest('/api/security-log', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(logEntry),
  // }).catch(console.error);
};

/**
 * Initialize security features
 */
export const initializeSecurity = (): void => {
  // Generate initial CSRF token
  CSRFProtection.generateToken();

  // Set up security event listeners
  window.addEventListener('error', event => {
    logSecurityEvent(
      'javascript_error',
      {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
      },
      'medium'
    );
  });

  // Monitor for potential XSS attempts
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('script') || message.includes('eval')) {
      logSecurityEvent('potential_xss_attempt', { message }, 'high');
    }
    originalConsoleError.apply(console, args);
  };

  logSecurityEvent('security_initialized', { timestamp: Date.now() }, 'low');
};
