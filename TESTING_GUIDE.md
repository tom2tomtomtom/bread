# 🧪 AIDEAS Platform - Testing Guide

## 📋 Overview

Comprehensive testing strategy for the AIDEAS platform covering unit tests, integration tests, end-to-end tests, security tests, and performance tests.

## 🏗️ Testing Architecture

### Testing Stack
- **Unit Tests**: Vitest + React Testing Library
- **Integration Tests**: Vitest + MSW (Mock Service Worker)
- **E2E Tests**: Playwright
- **Security Tests**: Custom security test suite
- **Performance Tests**: Artillery + Lighthouse

### Test Structure
```
src/
├── tests/
│   ├── auth/                 # Authentication tests
│   ├── components/           # Component tests
│   ├── utils/               # Utility function tests
│   └── integration/         # Integration tests
tests/
├── e2e/                     # End-to-end tests
├── security/                # Security tests
└── performance/             # Performance tests
```

## 🔧 Setup & Configuration

### Install Dependencies
```bash
# Testing dependencies (already included)
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
npm install --save-dev @playwright/test artillery
```

### Test Configuration

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
});
```

**playwright.config.ts:**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 🧪 Unit Tests

### Running Unit Tests
```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- authStore.test.ts
```

### Test Examples

**Authentication Store Test:**
```typescript
describe('AuthStore', () => {
  it('should login successfully with valid credentials', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { user: mockUser } }),
    });

    const { login } = useAuthStore.getState();
    await login({ email: 'test@example.com', password: 'password123' });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
  });
});
```

**Error Handler Test:**
```typescript
describe('Error Handler', () => {
  it('should categorize authentication errors correctly', () => {
    const error = 'Invalid email or password';
    const result = handleError(error);

    expect(result.category).toBe(ErrorCategory.AUTHENTICATION);
    expect(result.userMessage).toBe('The email or password you entered is incorrect. Please try again.');
    expect(result.retryable).toBe(true);
  });
});
```

## 🔗 Integration Tests

### Running Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run with specific environment
NODE_ENV=test npm run test:integration
```

### Mock Service Worker Setup
```typescript
// src/tests/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.post('/.netlify/functions/auth-login', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          token: 'mock-token',
        },
      })
    );
  }),
];
```

## 🎭 End-to-End Tests

### Running E2E Tests
```bash
# Install Playwright browsers
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run tests in headed mode
npm run test:e2e:headed

# Run tests with UI
npm run test:e2e:ui

# Run specific test file
npx playwright test auth.spec.ts
```

### E2E Test Examples

**Authentication Flow:**
```typescript
test('should successfully login with valid credentials', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="login-button"]');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="login-submit"]');
  
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
});
```

**Error Handling:**
```typescript
test('should show error for invalid credentials', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="login-button"]');
  await page.fill('[data-testid="email-input"]', 'invalid@example.com');
  await page.fill('[data-testid="password-input"]', 'wrongpassword');
  await page.click('[data-testid="login-submit"]');
  
  await expect(page.locator('text=The email or password you entered is incorrect')).toBeVisible();
});
```

## 🔒 Security Tests

### Running Security Tests
```bash
# Run security test suite
npm run test:security

# Test specific security features
npm run test:security -- --grep "rate limiting"
```

### Security Test Examples

**Rate Limiting Test:**
```typescript
describe('Rate Limiting', () => {
  it('should enforce rate limits', async () => {
    const requests = Array(25).fill(null).map(() =>
      fetch('/.netlify/functions/auth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'wrong' }),
      })
    );

    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});
```

**Authentication Security:**
```typescript
describe('Authentication Security', () => {
  it('should reject invalid JWT tokens', async () => {
    const response = await fetch('/.netlify/functions/auth-me', {
      headers: { 'Authorization': 'Bearer invalid-token' },
    });
    
    expect(response.status).toBe(401);
  });
});
```

## ⚡ Performance Tests

### Running Performance Tests
```bash
# Install Artillery
npm install -g artillery

# Run performance tests
npm run test:performance

# Run load test
artillery run tests/performance/load-test.yml

# Run stress test
artillery run tests/performance/stress-test.yml
```

### Performance Test Configuration

**load-test.yml:**
```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 20
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: "Authentication Flow"
    weight: 70
    requests:
      - post:
          url: "/.netlify/functions/auth-login"
          json:
            email: "test@example.com"
            password: "password123"
  
  - name: "Health Check"
    weight: 30
    requests:
      - get:
          url: "/.netlify/functions/health"
```

### Lighthouse Performance Testing
```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run Lighthouse audit
lhci autorun --upload.target=temporary-public-storage
```

## 📊 Test Coverage

### Coverage Requirements
- **Unit Tests**: > 80% coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: User journeys covered
- **Security Tests**: All security features tested

### Generating Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/index.html
```

### Coverage Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

## 🚀 CI/CD Testing

### GitHub Actions Workflow
```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Run security tests
        run: npm run test:security
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 🐛 Debugging Tests

### Debug Unit Tests
```bash
# Run tests in debug mode
npm test -- --inspect-brk

# Run specific test with debugging
npm test -- --inspect-brk authStore.test.ts
```

### Debug E2E Tests
```bash
# Run with browser visible
npm run test:e2e:headed

# Run with debugging
npx playwright test --debug

# Record test execution
npx playwright test --trace on
```

### Debug Performance Issues
```bash
# Profile test execution
npm test -- --reporter=verbose

# Analyze bundle size impact
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

## 📝 Test Data Management

### Test Data Setup
```typescript
// src/tests/fixtures/users.ts
export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  },
  adminUser: {
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
  },
};
```

### Database Seeding (Future)
```typescript
// tests/setup/seed.ts
export const seedTestData = async () => {
  // Seed test database with known data
  await createTestUser(testUsers.validUser);
  await createTestUser(testUsers.adminUser);
};
```

## 🔄 Test Maintenance

### Regular Tasks
- **Weekly**: Review test failures and flaky tests
- **Monthly**: Update test dependencies and configurations
- **Quarterly**: Review test coverage and add missing tests

### Best Practices
1. **Write tests first** (TDD approach)
2. **Keep tests isolated** and independent
3. **Use descriptive test names** and clear assertions
4. **Mock external dependencies** appropriately
5. **Test error conditions** as well as success paths
6. **Maintain test data** and fixtures

---

**Testing Status**: 🟢 **Comprehensive Coverage**  
**Automation**: 🤖 **Fully Automated**  
**CI/CD Integration**: ✅ **Complete**

Your AIDEAS platform now has enterprise-grade testing coverage! 🧪
