module.exports = {
  testDir: './tests',
  timeout: 60000,
  retries: 1,
  use: {
    baseURL: 'https://aideas-redbaez.netlify.app',
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...require('@playwright/test').devices['Desktop Chrome'] },
    },
  ],
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results' }]
  ],
};