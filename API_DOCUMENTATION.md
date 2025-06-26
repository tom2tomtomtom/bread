# 📚 BREAD Platform - API Documentation

## 📋 Overview

The BREAD platform provides a comprehensive REST API for authentication, AI content generation, and system monitoring. All endpoints are secured with JWT authentication and include comprehensive error handling.

## 🔐 Authentication

### Base URL
```
Production: https://your-domain.com/.netlify/functions/
Development: http://localhost:3000/.netlify/functions/
```

### Authentication Header
```http
Authorization: Bearer <jwt_token>
```

## 🔑 Authentication Endpoints

### POST /auth-login
Authenticate user with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "plan": "pro",
      "createdAt": "2024-01-01T00:00:00Z",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful",
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "req_123456789"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid email or password",
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "req_123456789"
}
```

**Rate Limiting:**
- 20 requests per minute (burst)
- 100 requests per 15 minutes (sustained)
- Account lockout after 5 failed attempts

### POST /auth-register
Register new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as login endpoint

**Validation Rules:**
- Name: 2-50 characters
- Email: Valid email format
- Password: Minimum 8 characters, uppercase, lowercase, number

### POST /auth-refresh
Refresh JWT token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### GET /auth-me
Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "plan": "pro",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "usage": {
      "requests": 45,
      "limit": 1000,
      "resetDate": "2024-02-01T00:00:00Z"
    }
  }
}
```

## 🤖 AI Content Generation

### POST /generate-openai
Generate content using OpenAI GPT models.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "prompt": "Create a creative brief for a coffee brand",
  "model": "gpt-4",
  "maxTokens": 500,
  "temperature": 0.7
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "Generated content here...",
    "model": "gpt-4",
    "tokensUsed": 245,
    "finishReason": "stop"
  },
  "usage": {
    "remaining": 955,
    "limit": 1000
  }
}
```

### POST /generate-claude
Generate content using Anthropic Claude models.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "prompt": "Analyze this creative brief and provide insights",
  "model": "claude-3-sonnet",
  "maxTokens": 1000
}
```

**Response:** Similar to OpenAI endpoint

## 📊 Monitoring & Health

### GET /health
Get system health and performance metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "system": {
      "status": "healthy",
      "uptime": 86400000,
      "timestamp": "2024-01-01T00:00:00Z"
    },
    "performance": {
      "totalRequests": 1250,
      "successRate": 98.4,
      "averageResponseTime": 245,
      "p95ResponseTime": 890
    },
    "errors": {
      "last24h": 12,
      "critical": 0,
      "high": 2,
      "byFunction": {
        "auth-login": 3,
        "generate-openai": 1
      }
    },
    "security": {
      "rateLimitViolations": 5,
      "failedLogins": 8,
      "suspiciousActivity": 2
    }
  }
}
```

**Status Codes:**
- `200`: System healthy
- `200`: System degraded (but operational)
- `503`: System unhealthy

## 🚨 Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Human-readable error message",
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "req_123456789",
  "retryAfter": 60
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Invalid or missing authentication |
| 403 | Forbidden | Insufficient permissions |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | System unhealthy |

### Error Categories

| Category | Description | Retry Recommended |
|----------|-------------|-------------------|
| `authentication` | Login/token issues | Yes |
| `authorization` | Permission denied | No |
| `validation` | Input validation failed | Yes (after fixing input) |
| `network` | Connection issues | Yes (automatic) |
| `server` | Internal server error | Yes |
| `rate_limit` | Rate limit exceeded | Yes (after delay) |
| `unknown` | Unexpected error | Yes |

## 🔒 Security Features

### Rate Limiting
- **Burst Protection**: 20 requests per minute
- **Sustained Protection**: 100 requests per 15 minutes
- **Login Protection**: 5 attempts per IP, 15-minute lockout

### Security Headers
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

### Request Tracking
Every request includes:
- `X-Request-ID`: Unique request identifier
- `X-Rate-Limit-Remaining`: Remaining requests
- `X-Rate-Limit-Reset`: Rate limit reset time

## 📝 Request/Response Examples

### Successful Authentication Flow
```bash
# 1. Login
curl -X POST https://your-domain.com/.netlify/functions/auth-login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 2. Use token for authenticated request
curl -X POST https://your-domain.com/.netlify/functions/generate-openai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"prompt":"Create a tagline for a tech startup","maxTokens":100}'

# 3. Refresh token when needed
curl -X POST https://your-domain.com/.netlify/functions/auth-refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'
```

### Error Handling Example
```bash
# Request with invalid token
curl -X POST https://your-domain.com/.netlify/functions/generate-openai \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'

# Response:
{
  "success": false,
  "error": "Invalid or expired token",
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "req_123456789"
}
```

## 🔧 Development & Testing

### Environment Variables
```bash
# Development
NODE_ENV=development
JWT_SECRET=dev-jwt-secret
OPENAI_API_KEY=your-dev-key

# Production
NODE_ENV=production
JWT_SECRET=your-secure-production-secret
CORS_ORIGIN=https://your-domain.com
```

### Testing Endpoints
```bash
# Health check
curl https://your-domain.com/.netlify/functions/health

# Test authentication
curl -X POST https://your-domain.com/.netlify/functions/auth-login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📊 Usage Analytics

### Plan Limits

| Plan | Monthly Requests | Rate Limit | Features |
|------|------------------|------------|----------|
| Free | 100 | 10/min | Basic AI generation |
| Pro | 1,000 | 20/min | Enhanced features |
| Enterprise | 10,000 | 50/min | All features + priority |

### Usage Tracking
- Requests counted per user per month
- Rate limits enforced per IP and per user
- Usage resets on the first day of each month

---

**API Version**: v1.0  
**Last Updated**: December 2024  
**Support**: Contact technical team for API support
