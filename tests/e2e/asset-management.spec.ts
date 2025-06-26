import { test, expect } from '@playwright/test';
import path from 'path';

// Test data
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User'
};

test.describe('Asset Management System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForSelector('text=BREAD', { timeout: 10000 });
  });

  test('should display the main app with Assets button', async ({ page }) => {
    // Check if the main elements are present
    await expect(page.locator('text=BREAD')).toBeVisible();
    await expect(page.locator('button:has-text("📁 ASSETS")')).toBeVisible();
    await expect(page.locator('button:has-text("⚙️ ADMIN")')).toBeVisible();
  });

  test('should require authentication to access assets', async ({ page }) => {
    // Click the Assets button without being logged in
    await page.click('button:has-text("📁 ASSETS")');
    
    // Should show authentication modal or redirect
    await expect(page.locator('text=Sign In')).toBeVisible({ timeout: 5000 });
  });

  test('should allow user registration and login', async ({ page }) => {
    // Click Sign Up
    await page.click('text=Sign Up');
    
    // Wait for registration form
    await page.waitForSelector('input[type="email"]');
    
    // Fill registration form
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.fill('input[placeholder*="name" i]', testUser.name);
    
    // Submit registration
    await page.click('button:has-text("Create Account")');
    
    // Wait for success or redirect
    await page.waitForTimeout(2000);
    
    // Should be logged in now
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 10000 });
  });

  test('should open asset management interface', async ({ page }) => {
    // First register and login
    await registerAndLogin(page, testUser);
    
    // Click Assets button
    await page.click('button:has-text("📁 ASSETS")');
    
    // Wait for asset management interface
    await page.waitForSelector('text=Asset Management', { timeout: 10000 });
    
    // Check if main asset management elements are present
    await expect(page.locator('text=Asset Management')).toBeVisible();
    await expect(page.locator('button:has-text("📚 Library")')).toBeVisible();
    await expect(page.locator('button:has-text("⬆️ Upload")')).toBeVisible();
  });

  test('should display upload interface', async ({ page }) => {
    await registerAndLogin(page, testUser);
    await openAssetManager(page);
    
    // Switch to upload tab
    await page.click('button:has-text("⬆️ Upload")');
    
    // Check upload interface elements
    await expect(page.locator('text=Drag & drop files here')).toBeVisible();
    await expect(page.locator('text=or click to browse')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeAttached();
  });

  test('should handle file upload', async ({ page }) => {
    await registerAndLogin(page, testUser);
    await openAssetManager(page);
    
    // Switch to upload tab
    await page.click('button:has-text("⬆️ Upload")');
    
    // Create a test image file
    const testImagePath = await createTestImage();
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);
    
    // Wait for upload to start
    await expect(page.locator('text=Uploading')).toBeVisible({ timeout: 5000 });
    
    // Wait for upload to complete
    await expect(page.locator('text=Upload complete')).toBeVisible({ timeout: 15000 });
  });

  test('should display uploaded assets in library', async ({ page }) => {
    await registerAndLogin(page, testUser);
    await openAssetManager(page);
    
    // Upload a test file first
    await uploadTestFile(page);
    
    // Switch to library tab
    await page.click('button:has-text("📚 Library")');
    
    // Check if assets are displayed
    await expect(page.locator('[data-testid="asset-card"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should allow asset search and filtering', async ({ page }) => {
    await registerAndLogin(page, testUser);
    await openAssetManager(page);
    
    // Upload test files
    await uploadTestFile(page);
    
    // Go to library
    await page.click('button:has-text("📚 Library")');
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search" i]');
    await searchInput.fill('test');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Test filter buttons
    await page.click('button:has-text("All")');
    await page.click('button:has-text("Images")');
  });

  test('should open asset preview modal', async ({ page }) => {
    await registerAndLogin(page, testUser);
    await openAssetManager(page);
    
    // Upload and view asset
    await uploadTestFile(page);
    await page.click('button:has-text("📚 Library")');
    
    // Click on first asset
    await page.click('[data-testid="asset-card"]');
    
    // Check if preview modal opens
    await expect(page.locator('[data-testid="asset-preview"]')).toBeVisible({ timeout: 5000 });
    
    // Check preview elements
    await expect(page.locator('button:has-text("Close")')).toBeVisible();
    await expect(page.locator('text=File Information')).toBeVisible();
  });

  test('should integrate with brief creation', async ({ page }) => {
    await registerAndLogin(page, testUser);
    
    // Close asset manager if open
    const closeButton = page.locator('button:has-text("Close")');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
    
    // Start creating a brief
    const briefTextarea = page.locator('textarea[placeholder*="creative vision" i]');
    await briefTextarea.fill('Test creative brief');
    
    // Look for asset integration
    await expect(page.locator('text=Visual Assets')).toBeVisible();
    await expect(page.locator('button:has-text("+ Add Assets")')).toBeVisible();
  });

  test('should handle asset selection in brief builder', async ({ page }) => {
    await registerAndLogin(page, testUser);
    
    // First upload an asset
    await openAssetManager(page);
    await uploadTestFile(page);
    
    // Close asset manager
    await page.click('button:has-text("Close")');
    
    // Start brief creation
    const briefTextarea = page.locator('textarea[placeholder*="creative vision" i]');
    await briefTextarea.fill('Test brief with assets');
    
    // Click Add Assets
    await page.click('button:has-text("+ Add Assets")');
    
    // Asset selector should open
    await expect(page.locator('text=Select Assets')).toBeVisible({ timeout: 5000 });
    
    // Select an asset
    await page.click('[data-testid="asset-card"]');
    
    // Confirm selection
    await page.click('button:has-text("Use Selected Assets")');
    
    // Brief should be enhanced
    await expect(page.locator('text=🎨 SELECTED ASSETS')).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await registerAndLogin(page, testUser);
    await openAssetManager(page);
    
    // Check if interface adapts to mobile
    await expect(page.locator('text=Asset Management')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('text=Asset Management')).toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    await registerAndLogin(page, testUser);
    await openAssetManager(page);
    
    // Switch to upload
    await page.click('button:has-text("⬆️ Upload")');
    
    // Try to upload an invalid file type
    const invalidFile = await createTestFile('test.txt', 'text/plain');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(invalidFile);
    
    // Should show error message
    await expect(page.locator('text=Invalid file type')).toBeVisible({ timeout: 5000 });
  });
});

// Helper functions
async function registerAndLogin(page: any, user: any) {
  try {
    // Try to click Sign Up
    await page.click('text=Sign Up', { timeout: 5000 });
    
    // Fill registration form
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.fill('input[placeholder*="name" i]', user.name);
    
    // Submit
    await page.click('button:has-text("Create Account")');
    
    // Wait for login success
    await page.waitForTimeout(3000);
  } catch (error) {
    // If registration fails, try login
    try {
      await page.click('text=Sign In');
      await page.fill('input[type="email"]', user.email);
      await page.fill('input[type="password"]', user.password);
      await page.click('button:has-text("Sign In")');
      await page.waitForTimeout(2000);
    } catch (loginError) {
      console.log('Login/registration failed, continuing with test');
    }
  }
}

async function openAssetManager(page: any) {
  await page.click('button:has-text("📁 ASSETS")');
  await page.waitForSelector('text=Asset Management', { timeout: 10000 });
}

async function uploadTestFile(page: any) {
  await page.click('button:has-text("⬆️ Upload")');
  
  const testImagePath = await createTestImage();
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(testImagePath);
  
  // Wait for upload to complete
  await page.waitForSelector('text=Upload complete', { timeout: 15000 });
}

async function createTestImage(): Promise<string> {
  // Create a minimal PNG file for testing
  const fs = require('fs');

  // Minimal 1x1 PNG file (base64 decoded)
  const pngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    'base64'
  );

  const testImagePath = path.join(__dirname, 'test-image.png');
  fs.writeFileSync(testImagePath, pngBuffer);

  return testImagePath;
}

async function createTestFile(filename: string, mimeType: string): Promise<string> {
  const fs = require('fs');
  const testFilePath = path.join(__dirname, filename);
  fs.writeFileSync(testFilePath, 'Test file content');
  return testFilePath;
}
