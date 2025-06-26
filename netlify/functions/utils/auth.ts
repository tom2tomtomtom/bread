import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { HandlerEvent } from '@netlify/functions';
import * as fs from 'fs';
import * as path from 'path';
import {
  checkRateLimit,
  checkLoginAttempts,
  recordFailedLogin,
  resetLoginAttempts,
  validatePasswordStrength,
  getSecurityHeaders,
  getClientIP,
  logSecurityEvent,
  hashForLogging,
} from './security';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  plan: 'free' | 'pro' | 'enterprise';
  usage: {
    totalRequests: number;
    monthlyRequests: number;
    lastResetDate: string;
  };
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  plan: string;
  iat: number;
  exp: number;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  error?: string;
  retryAfter?: number;
}

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Rate limiting configuration
const RATE_LIMITS = {
  free: { requests: 50, window: 24 * 60 * 60 * 1000 }, // 50 requests per day
  pro: { requests: 500, window: 24 * 60 * 60 * 1000 }, // 500 requests per day
  enterprise: { requests: 5000, window: 24 * 60 * 60 * 1000 }, // 5000 requests per day
};

// File-based storage for development (replace with database in production)
const STORAGE_DIR = path.join(process.cwd(), '.netlify', 'storage');
const USERS_FILE = path.join(STORAGE_DIR, 'users.json');
const TOKENS_FILE = path.join(STORAGE_DIR, 'tokens.json');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Storage helpers
const loadUsers = (): { users: Record<string, User>, usersByEmail: Record<string, string> } => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  return { users: {}, usersByEmail: {} };
};

const saveUsers = (users: Record<string, User>, usersByEmail: Record<string, string>) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users, usersByEmail }, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

const loadTokens = (): string[] => {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading tokens:', error);
  }
  return [];
};

const saveTokens = (tokens: string[]) => {
  try {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
  } catch (error) {
    console.error('Error saving tokens:', error);
  }
};

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// JWT utilities
export const generateTokens = (user: User): { token: string; refreshToken: string } => {
  const payload: Omit<AuthTokenPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    plan: user.plan,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN
  });

  // Save refresh token
  const tokens = loadTokens();
  tokens.push(refreshToken);
  saveTokens(tokens);

  return { token, refreshToken };
};

export const verifyToken = (token: string): AuthTokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (refreshToken: string): { userId: string } | null => {
  try {
    const tokens = loadTokens();
    if (!tokens.includes(refreshToken)) {
      return null;
    }
    return jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
};

export const revokeRefreshToken = (refreshToken: string): void => {
  const tokens = loadTokens();
  const filteredTokens = tokens.filter(token => token !== refreshToken);
  saveTokens(filteredTokens);
};

// User management
export const createUser = async (email: string, password: string, name: string): Promise<User> => {
  const { users, usersByEmail } = loadUsers();
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const hashedPassword = await hashPassword(password);

  const user: User = {
    id: userId,
    email,
    name,
    createdAt: new Date().toISOString(),
    isActive: true,
    plan: 'free',
    usage: {
      totalRequests: 0,
      monthlyRequests: 0,
      lastResetDate: new Date().toISOString(),
    },
  };

  users[userId] = user;
  usersByEmail[email] = userId;

  // Store password separately (in production, use proper database)
  users[`${userId}_password`] = hashedPassword as any;

  saveUsers(users, usersByEmail);
  return user;
};

export const getUserById = (userId: string): User | null => {
  const { users } = loadUsers();
  return users[userId] || null;
};

export const getUserByEmail = (email: string): User | null => {
  const { users, usersByEmail } = loadUsers();
  const userId = usersByEmail[email];
  return userId ? users[userId] || null : null;
};

export const getUserPassword = (userId: string): string | null => {
  const { users } = loadUsers();
  return users[`${userId}_password`] as string || null;
};

export const updateUserUsage = (userId: string): void => {
  const { users, usersByEmail } = loadUsers();
  const user = users[userId];
  if (user) {
    const now = new Date();
    const lastReset = new Date(user.usage.lastResetDate);
    const monthsDiff = (now.getFullYear() - lastReset.getFullYear()) * 12 +
                      (now.getMonth() - lastReset.getMonth());

    if (monthsDiff >= 1) {
      // Reset monthly usage
      user.usage.monthlyRequests = 1;
      user.usage.lastResetDate = now.toISOString();
    } else {
      user.usage.monthlyRequests += 1;
    }

    user.usage.totalRequests += 1;
    user.lastLogin = now.toISOString();
    users[userId] = user;
    saveUsers(users, usersByEmail);
  }
};

// Rate limiting
export const checkRateLimit = (user: User): boolean => {
  const limit = RATE_LIMITS[user.plan];
  return user.usage.monthlyRequests < limit.requests;
};

// Enhanced authentication middleware with security features
export const authenticateRequest = (event: HandlerEvent): AuthResult => {
  const clientIP = getClientIP(event);
  const userAgent = event.headers['user-agent'] || 'unknown';

  // Check rate limiting first
  const rateLimitResult = checkRateLimit(clientIP);
  if (!rateLimitResult.allowed) {
    logSecurityEvent('rate_limit_exceeded', undefined, clientIP, {
      remaining: rateLimitResult.remaining,
      retryAfter: rateLimitResult.retryAfter,
    }, 'medium');
    return {
      success: false,
      error: 'Rate limit exceeded',
      retryAfter: rateLimitResult.retryAfter,
    };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logSecurityEvent('missing_auth_header', undefined, clientIP, { userAgent }, 'low');
    return { success: false, error: 'No valid authorization header' };
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    logSecurityEvent('invalid_token', undefined, clientIP, {
      tokenHash: hashForLogging(token),
      userAgent
    }, 'medium');
    return { success: false, error: 'Invalid or expired token' };
  }

  const user = getUserById(payload.userId);
  if (!user || !user.isActive) {
    logSecurityEvent('user_not_found_or_inactive', payload.userId, clientIP, { userAgent }, 'medium');
    return { success: false, error: 'User not found or inactive' };
  }

  // Check legacy rate limiting (plan-based)
  if (!checkRateLimit(user)) {
    logSecurityEvent('plan_rate_limit_exceeded', user.id, clientIP, {
      plan: user.plan,
      usage: user.usage
    }, 'medium');
    return { success: false, error: 'Plan rate limit exceeded' };
  }

  // Log successful authentication
  logSecurityEvent('successful_auth', user.id, clientIP, {
    plan: user.plan,
    userAgent
  }, 'low');

  return { success: true, user };
};



// Input validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  // Use enhanced password validation from security module
  const result = validatePasswordStrength(password);
  return { valid: result.valid, errors: result.errors };
};
