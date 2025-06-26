#!/usr/bin/env node

/**
 * 🔐 AIDEAS Security Secret Generator
 * 
 * Generates cryptographically secure secrets for JWT authentication
 * and other security-sensitive configuration values.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  header: (msg) => console.log(`${colors.bright}${colors.cyan}🔐 ${msg}${colors.reset}`),
};

/**
 * Generate a cryptographically secure random string
 */
function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Generate a secure UUID v4
 */
function generateSecureUUID() {
  return crypto.randomUUID();
}

/**
 * Validate existing environment configuration
 */
function validateEnvironment() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    log.warning('.env file not found');
    return { valid: false, issues: ['.env file missing'] };
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const issues = [];

  // Check for weak JWT secrets
  if (envContent.includes('dev-jwt-secret') || envContent.includes('your-super-secret-jwt-key')) {
    issues.push('Weak JWT_SECRET detected');
  }

  if (envContent.includes('dev-refresh-secret') || envContent.includes('your-refresh-secret-key')) {
    issues.push('Weak JWT_REFRESH_SECRET detected');
  }

  // Check for placeholder API keys
  if (envContent.includes('your-openai-key-here')) {
    issues.push('Placeholder OPENAI_API_KEY detected');
  }

  if (envContent.includes('your-claude-key-here')) {
    issues.push('Placeholder ANTHROPIC_API_KEY detected');
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Generate production-ready environment configuration
 */
function generateProductionEnv() {
  const jwtSecret = generateSecureSecret(64);
  const jwtRefreshSecret = generateSecureSecret(64);
  const sessionSecret = generateSecureSecret(32);
  const encryptionKey = generateSecureSecret(32);
  const apiKeyHash = generateSecureSecret(16);

  return {
    JWT_SECRET: jwtSecret,
    JWT_REFRESH_SECRET: jwtRefreshSecret,
    JWT_EXPIRES_IN: '1h',
    JWT_REFRESH_EXPIRES_IN: '7d',
    SESSION_SECRET: sessionSecret,
    ENCRYPTION_KEY: encryptionKey,
    API_KEY_HASH: apiKeyHash,
    SECURE_COOKIE: 'true',
    CORS_ORIGIN: 'https://your-domain.com',
    RATE_LIMIT_WINDOW: '900000', // 15 minutes
    RATE_LIMIT_MAX: '100',
    LOG_LEVEL: 'info',
  };
}

/**
 * Create secure .env.production template
 */
function createProductionTemplate(secrets) {
  const template = `# 🔐 AIDEAS® Creative Platform - Production Environment
# Generated on: ${new Date().toISOString()}
# 
# ⚠️  CRITICAL SECURITY NOTICE:
# - These secrets are cryptographically generated and unique
# - Never commit this file to version control
# - Store securely in your deployment platform's environment variables
# - Rotate secrets regularly (every 90 days recommended)

# 🔑 JWT Authentication Secrets (CRITICAL)
JWT_SECRET=${secrets.JWT_SECRET}
JWT_REFRESH_SECRET=${secrets.JWT_REFRESH_SECRET}
JWT_EXPIRES_IN=${secrets.JWT_EXPIRES_IN}
JWT_REFRESH_EXPIRES_IN=${secrets.JWT_REFRESH_EXPIRES_IN}

# 🛡️ Additional Security Secrets
SESSION_SECRET=${secrets.SESSION_SECRET}
ENCRYPTION_KEY=${secrets.ENCRYPTION_KEY}
API_KEY_HASH=${secrets.API_KEY_HASH}

# 🌐 CORS and Security Configuration
CORS_ORIGIN=${secrets.CORS_ORIGIN}
SECURE_COOKIE=${secrets.SECURE_COOKIE}

# 📊 Rate Limiting Configuration
RATE_LIMIT_WINDOW=${secrets.RATE_LIMIT_WINDOW}
RATE_LIMIT_MAX=${secrets.RATE_LIMIT_MAX}

# 🔍 Logging Configuration
LOG_LEVEL=${secrets.LOG_LEVEL}

# 🤖 AI API Keys (Set these manually)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-production-openai-key-here

# Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-your-production-claude-key-here

# 🗄️ Database Configuration (Set these manually)
# Get from: https://supabase.com/dashboard/project/[your-project]/settings/api
REACT_APP_SUPABASE_URL=your-production-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-production-supabase-anon-key

# 📧 Email Service Configuration (Optional)
# For email verification and password reset
EMAIL_SERVICE_API_KEY=your-email-service-key-here
EMAIL_FROM_ADDRESS=noreply@your-domain.com

# 🚀 Production Settings
NODE_ENV=production
`;

  return template;
}

/**
 * Main execution function
 */
function main() {
  log.header('AIDEAS Security Secret Generator');
  console.log();

  // Validate current environment
  log.info('Validating current environment configuration...');
  const validation = validateEnvironment();
  
  if (validation.valid) {
    log.success('Current environment configuration is secure');
  } else {
    log.warning('Environment security issues detected:');
    validation.issues.forEach(issue => {
      console.log(`  • ${issue}`);
    });
    console.log();
  }

  // Generate new secrets
  log.info('Generating cryptographically secure secrets...');
  const secrets = generateProductionEnv();
  
  // Create production template
  const productionTemplate = createProductionTemplate(secrets);
  
  // Write to file
  const outputPath = path.join(process.cwd(), '.env.production.template');
  fs.writeFileSync(outputPath, productionTemplate);
  
  log.success(`Production environment template created: ${outputPath}`);
  console.log();
  
  // Display security recommendations
  log.header('Security Recommendations');
  console.log();
  console.log('📋 Next Steps:');
  console.log('  1. Review the generated .env.production.template file');
  console.log('  2. Set your actual API keys in the template');
  console.log('  3. Configure your production deployment with these environment variables');
  console.log('  4. Never commit the production .env file to version control');
  console.log('  5. Rotate secrets every 90 days');
  console.log();
  
  console.log('🔐 Secret Strength:');
  console.log(`  • JWT Secret: ${secrets.JWT_SECRET.length} characters (base64url)`);
  console.log(`  • Refresh Secret: ${secrets.JWT_REFRESH_SECRET.length} characters (base64url)`);
  console.log(`  • Session Secret: ${secrets.SESSION_SECRET.length} characters (base64url)`);
  console.log();
  
  console.log('⚠️  Security Reminders:');
  console.log('  • Use HTTPS in production');
  console.log('  • Set CORS_ORIGIN to your actual domain');
  console.log('  • Enable secure cookies');
  console.log('  • Monitor authentication logs');
  console.log('  • Implement rate limiting');
  console.log();
  
  log.success('Secret generation completed successfully!');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  generateSecureSecret,
  generateSecureUUID,
  validateEnvironment,
  generateProductionEnv,
};
