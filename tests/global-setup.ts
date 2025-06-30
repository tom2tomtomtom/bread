import { chromium, FullConfig } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting AIDEAS E2E Test Suite Global Setup');
  
  // Create necessary directories
  const directories = [
    'test-results',
    'tests/screenshots',
    'tests/downloads',
    'tests/screenshots/comprehensive-workflow',
    'tests/screenshots/error-recovery',
    'tests/screenshots/accessibility',
    'tests/screenshots/stress-test'
  ];
  
  for (const dir of directories) {
    await fs.mkdir(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
  
  // Check if the application is accessible
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('🌐 Checking application accessibility...');
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || config.use?.baseURL || 'https://aideas-redbaez.netlify.app';
    
    const response = await page.goto(baseURL, { waitUntil: 'networkidle' });
    
    if (response?.status() !== 200) {
      throw new Error(`Application not accessible. Status: ${response?.status()}`);
    }
    
    // Verify key elements are present
    const title = await page.title();
    console.log(`📄 Application title: ${title}`);
    
    // Check for AIDEAS branding
    const aideasElement = page.locator('text=AIDEAS');
    if (await aideasElement.count() === 0) {
      console.warn('⚠️ AIDEAS branding not found on landing page');
    }
    
    console.log('✅ Application is accessible and responsive');
    
  } catch (error) {
    console.error('❌ Application accessibility check failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  // Set up environment variables for tests
  process.env.E2E_SETUP_COMPLETE = 'true';
  process.env.E2E_START_TIME = Date.now().toString();
  
  console.log('✅ Global setup completed successfully');
}

export default globalSetup;