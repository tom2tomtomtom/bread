# 🚀 AIDEAS Platform - Production Deployment Guide

## 📋 Overview

This guide provides step-by-step instructions for deploying the AIDEAS platform to production with enterprise-grade security, monitoring, and performance optimization.

## 🔧 Prerequisites

### Required Accounts & Services
- **Netlify Account**: For hosting and serverless functions
- **OpenAI API Key**: For AI content generation
- **Anthropic API Key**: For Claude AI integration
- **Domain Name**: For production deployment (optional but recommended)
- **Email Service**: For notifications (optional)

### Development Environment
- **Node.js**: v18 or higher
- **npm**: v8 or higher
- **Git**: Latest version

## 🔐 Security Configuration

### 1. Generate Secure Secrets

```bash
# Generate cryptographically secure secrets
npm run generate-secrets

# This creates .env.production.template with secure defaults
```

### 2. Configure Production Environment

```bash
# Copy template to production environment file
cp .env.production.template .env.production

# Edit with your actual values
nano .env.production
```

### 3. Required Environment Variables

```bash
# JWT Authentication (CRITICAL - Use generated values)
JWT_SECRET=your-generated-64-char-secret
JWT_REFRESH_SECRET=your-generated-64-char-refresh-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Security Configuration
CORS_ORIGIN=https://your-production-domain.com
SECURE_COOKIE=true
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# AI API Keys
OPENAI_API_KEY=sk-your-production-openai-key
ANTHROPIC_API_KEY=sk-ant-your-production-claude-key

# Production Settings
NODE_ENV=production
LOG_LEVEL=info
```

## 🌐 Netlify Deployment

### 1. Build Configuration

Create `netlify.toml` in project root:

```toml
[build]
  publish = "build"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 2. Deploy to Netlify

#### Option A: Git Integration (Recommended)

1. **Connect Repository**:
   ```bash
   # Push to GitHub/GitLab
   git add .
   git commit -m "Production deployment setup"
   git push origin main
   ```

2. **Configure Netlify**:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your repository
   - Set build command: `npm run build`
   - Set publish directory: `build`

3. **Configure Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add all variables from `.env.production`
   - **Never commit `.env.production` to version control**

#### Option B: Manual Deploy

```bash
# Build for production
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=build
```

### 3. Custom Domain Setup

1. **Add Custom Domain**:
   - Go to Site Settings → Domain Management
   - Add your custom domain
   - Configure DNS records as instructed

2. **Enable HTTPS**:
   - Netlify automatically provisions SSL certificates
   - Verify HTTPS is working: `https://your-domain.com`

3. **Update CORS Configuration**:
   ```bash
   # Update environment variable
   CORS_ORIGIN=https://your-production-domain.com
   ```

## 📊 Monitoring Setup

### 1. Health Monitoring

The platform includes a built-in health endpoint:

```bash
# Check system health
curl https://your-domain.com/.netlify/functions/health

# Response includes:
# - System status (healthy/degraded/unhealthy)
# - Performance metrics
# - Error analytics
# - Security monitoring
```

### 2. External Monitoring (Recommended)

#### Uptime Monitoring
- **UptimeRobot**: Free tier available
- **Pingdom**: Professional monitoring
- **StatusCake**: Comprehensive monitoring

#### Error Tracking
- **Sentry**: Real-time error tracking
- **LogRocket**: Session replay and monitoring
- **Bugsnag**: Error monitoring and alerting

#### Performance Monitoring
- **Google Analytics**: User behavior tracking
- **Hotjar**: User experience insights
- **New Relic**: Application performance monitoring

### 3. Monitoring Configuration

```bash
# Enable monitoring features
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_ERROR_TRACKING=true
ENABLE_USAGE_ANALYTICS=true
ENABLE_AUDIT_LOGGING=true

# Configure retention
ERROR_RETENTION_HOURS=24
PERFORMANCE_SAMPLE_RATE=0.1
```

## 🔒 Security Hardening

### 1. Security Headers

Already configured in `netlify.toml`, but verify:

```bash
# Test security headers
curl -I https://your-domain.com

# Should include:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Strict-Transport-Security: max-age=31536000
```

### 2. Rate Limiting

Configure rate limiting based on your needs:

```bash
# Burst protection (requests per minute)
RATE_LIMIT_BURST_MAX=20
RATE_LIMIT_BURST_WINDOW=60000

# Sustained protection (requests per 15 minutes)
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# Login attempt protection
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900000
```

### 3. Security Monitoring

```bash
# Enable security features
ENABLE_SECURITY_HEADERS=true
ENABLE_CSRF_PROTECTION=true
ENABLE_XSS_PROTECTION=true
ENABLE_AUDIT_LOGGING=true
```

## 🧪 Testing in Production

### 1. Smoke Tests

```bash
# Test critical endpoints
curl https://your-domain.com/
curl https://your-domain.com/.netlify/functions/health

# Test authentication
curl -X POST https://your-domain.com/.netlify/functions/auth-login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Load Testing

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test configuration
cat > load-test.yml << EOF
config:
  target: 'https://your-domain.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Homepage"
    requests:
      - get:
          url: "/"
  - name: "Health Check"
    requests:
      - get:
          url: "/.netlify/functions/health"
EOF

# Run load test
artillery run load-test.yml
```

### 3. Security Testing

```bash
# Test rate limiting
for i in {1..25}; do
  curl -X POST https://your-domain.com/.netlify/functions/auth-login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' &
done

# Should receive 429 responses after limit exceeded
```

## 📈 Performance Optimization

### 1. CDN Configuration

Netlify automatically provides CDN, but optimize:

```bash
# Configure caching headers in netlify.toml
[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/.netlify/functions/*"
  [headers.values]
    Cache-Control = "no-cache"
```

### 2. Bundle Optimization

```bash
# Analyze bundle size
npm run build
npx webpack-bundle-analyzer build/static/js/*.js

# Optimize if needed
npm install --save-dev @craco/craco
```

### 3. Database Optimization (Future)

When migrating from file storage:

```bash
# Supabase configuration
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# Connection pooling
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT=30000
```

## 🔄 Continuous Deployment

### 1. GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './build'
          production-branch: main
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### 2. Deployment Checklist

Before each deployment:

- [ ] Run all tests: `npm test`
- [ ] Build successfully: `npm run build`
- [ ] Security audit: `npm audit`
- [ ] Environment variables updated
- [ ] Backup current deployment
- [ ] Monitor deployment health

## 🚨 Incident Response

### 1. Monitoring Alerts

Set up alerts for:
- **Health endpoint failures**
- **High error rates (>5%)**
- **Slow response times (>5s)**
- **Security events (failed logins, rate limits)**

### 2. Rollback Procedure

```bash
# Netlify automatic rollback
netlify sites:list
netlify api listSiteDeploys --data='{"site_id":"YOUR_SITE_ID"}'
netlify api restoreSiteDeploy --data='{"site_id":"YOUR_SITE_ID","deploy_id":"PREVIOUS_DEPLOY_ID"}'
```

### 3. Emergency Contacts

Document:
- **Technical lead contact**
- **Netlify support**
- **Domain registrar support**
- **API provider support (OpenAI, Anthropic)**

## 📚 Maintenance

### 1. Regular Tasks

**Weekly**:
- Review error logs and health metrics
- Check security audit logs
- Monitor performance trends

**Monthly**:
- Update dependencies: `npm update`
- Security audit: `npm audit`
- Review and rotate secrets (if needed)

**Quarterly**:
- Full security review
- Performance optimization review
- Backup and disaster recovery testing

### 2. Updates and Patches

```bash
# Update dependencies
npm update
npm audit fix

# Test updates
npm test
npm run build

# Deploy updates
git add .
git commit -m "Update dependencies"
git push origin main
```

---

**Deployment Status**: 🟢 **Production Ready**  
**Security Level**: 🔒 **Enterprise Grade**  
**Monitoring**: 📊 **Comprehensive**  

Your AIDEAS platform is now ready for enterprise production deployment! 🚀

## 📖 Additional Documentation

- **[API Documentation](API_DOCUMENTATION.md)**: Complete API reference
- **[Security Guide](SECURITY_GUIDE.md)**: Detailed security implementation
- **[Monitoring Guide](MONITORING_GUIDE.md)**: Comprehensive monitoring setup
- **[Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)**: Common issues and solutions
