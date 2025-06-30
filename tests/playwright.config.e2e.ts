import { defineConfig, devices } from '@playwright/test';

/**
 * Comprehensive E2E Test Configuration for AIDEAS Platform
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  
  /* Parallel execution for faster testing */
  fullyParallel: false, // Disabled for AI API rate limiting
  
  /* Fail the build on CI if test.only is accidentally left */
  forbidOnly: !!process.env.CI,
  
  /* Retry configuration for flaky AI operations */
  retries: process.env.CI ? 2 : 1,
  
  /* Limit workers to avoid API rate limits */
  workers: process.env.CI ? 2 : 1,
  
  /* Reporter configuration */
  reporter: [
    ['html', { outputFolder: 'playwright-report-e2e' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  /* Global test configuration */
  use: {
    /* Base URL for the application */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://aideas-redbaez.netlify.app',
    
    /* Collect trace on first retry for debugging */
    trace: 'retain-on-failure',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Extended timeout for AI operations */
    actionTimeout: 30000,
    navigationTimeout: 30000,
    
    /* Ignore HTTPS errors for local testing */
    ignoreHTTPSErrors: true,
    
    /* User agent */
    userAgent: 'AIDEAS-E2E-Test-Suite/1.0',
    
    /* Extra HTTP headers */
    extraHTTPHeaders: {
      'X-Test-Suite': 'AIDEAS-E2E',
    },
  },

  /* Test project configurations for different browsers and scenarios */
  projects: [
    {
      name: 'chromium-comprehensive',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
      testMatch: 'comprehensive-aideas-workflow.spec.ts',
    },

    {
      name: 'firefox-comprehensive', 
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
      testMatch: 'comprehensive-aideas-workflow.spec.ts',
    },

    {
      name: 'webkit-comprehensive',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
      testMatch: 'comprehensive-aideas-workflow.spec.ts',
    },

    /* Advanced scenarios testing */
    {
      name: 'advanced-scenarios',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
      testMatch: 'advanced-aideas-scenarios.spec.ts',
    },

    /* Mobile testing */
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
      },
      testMatch: 'comprehensive-aideas-workflow.spec.ts',
    },

    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
      },
      testMatch: 'comprehensive-aideas-workflow.spec.ts',
    },

    /* Tablet testing */
    {
      name: 'Tablet',
      use: { 
        ...devices['iPad Pro'],
      },
      testMatch: 'comprehensive-aideas-workflow.spec.ts',
    },

    /* Performance testing with slower 3G network */
    {
      name: 'performance-3g',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Simulate slower network
        launchOptions: {
          args: ['--enable-features=NetworkService,NetworkServiceLogging'],
        },
      },
      testMatch: 'comprehensive-aideas-workflow.spec.ts',
    },
  ],

  /* Global setup and teardown */
  globalSetup: require.resolve('./global-setup.ts'),
  globalTeardown: require.resolve('./global-teardown.ts'),

  /* Output directories */
  outputDir: 'test-results/',
  
  /* Test timeout configuration */
  timeout: 300000, // 5 minutes for comprehensive tests with AI generation
  
  /* Expect timeout for assertions */
  expect: {
    timeout: 30000, // 30 seconds for element expectations
  },
});