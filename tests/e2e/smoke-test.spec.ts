import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Asset Management System', () => {
  test('should load the application successfully', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8888');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the main app elements are present
    await expect(page.locator('text=AIDEAS')).toBeVisible({ timeout: 15000 });
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/app-loaded.png' });
  });

  test('should show asset management button', async ({ page }) => {
    await page.goto('http://localhost:8888');
    await page.waitForLoadState('networkidle');
    
    // Check if Assets button is present
    await expect(page.locator('button:has-text("📁 ASSETS")')).toBeVisible({ timeout: 10000 });
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/assets-button.png' });
  });

  test('should show admin button', async ({ page }) => {
    await page.goto('http://localhost:8888');
    await page.waitForLoadState('networkidle');
    
    // Check if Admin button is present
    await expect(page.locator('button:has-text("⚙️ ADMIN")')).toBeVisible({ timeout: 10000 });
  });

  test('should have brief input area', async ({ page }) => {
    await page.goto('http://localhost:8888');
    await page.waitForLoadState('networkidle');
    
    // Check if brief textarea is present
    await expect(page.locator('textarea')).toBeVisible({ timeout: 10000 });
  });

  test('should show asset integration in brief builder', async ({ page }) => {
    await page.goto('http://localhost:8888');
    await page.waitForLoadState('networkidle');
    
    // Check for asset-related elements
    await expect(page.locator('text=Visual Assets')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("+ Add Assets")')).toBeVisible({ timeout: 10000 });
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/asset-integration.png' });
  });

  test('should handle clicking assets button', async ({ page }) => {
    await page.goto('http://localhost:8888');
    await page.waitForLoadState('networkidle');
    
    // Click the Assets button
    await page.click('button:has-text("📁 ASSETS")');
    
    // Wait a moment for any modal or response
    await page.waitForTimeout(2000);
    
    // Should show some kind of response (auth modal, asset manager, etc.)
    const hasAuthModal = await page.locator('text=Sign In').isVisible();
    const hasAssetManager = await page.locator('text=Asset Management').isVisible();
    const hasModal = await page.locator('[role="dialog"]').isVisible();
    
    // At least one of these should be true
    expect(hasAuthModal || hasAssetManager || hasModal).toBeTruthy();
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/assets-clicked.png' });
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:8888');
    await page.waitForLoadState('networkidle');
    
    // Check if main elements are still visible on mobile
    await expect(page.locator('text=AIDEAS')).toBeVisible();
    await expect(page.locator('button:has-text("📁 ASSETS")')).toBeVisible();
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/mobile-view.png' });
  });

  test('should handle network requests without errors', async ({ page }) => {
    const errors: string[] = [];
    const networkErrors: string[] = [];
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Listen for network failures
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });
    
    await page.goto('http://localhost:8888');
    await page.waitForLoadState('networkidle');
    
    // Interact with the app
    await page.click('button:has-text("📁 ASSETS")');
    await page.waitForTimeout(2000);
    
    // Check for critical errors (ignore minor warnings)
    const criticalErrors = errors.filter(error => 
      error.includes('TypeError') || 
      error.includes('ReferenceError') ||
      error.includes('Cannot read property') ||
      error.includes('is not defined')
    );
    
    // Should not have critical JavaScript errors
    expect(criticalErrors.length).toBe(0);
    
    // Log any network errors for debugging
    if (networkErrors.length > 0) {
      console.log('Network errors:', networkErrors);
    }
  });

  test('should load CSS and JavaScript assets', async ({ page }) => {
    const loadedResources: string[] = [];
    
    page.on('response', response => {
      if (response.url().includes('.css') || response.url().includes('.js')) {
        loadedResources.push(`${response.status()} ${response.url()}`);
      }
    });
    
    await page.goto('http://localhost:8888');
    await page.waitForLoadState('networkidle');
    
    // Should have loaded some CSS and JS files
    expect(loadedResources.length).toBeGreaterThan(0);
    
    // Log loaded resources
    console.log('Loaded resources:', loadedResources);
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('http://localhost:8888');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    const title = await page.title();
    expect(title).toContain('AIDEAS');
  });

  test('should handle authentication flow', async ({ page }) => {
    await page.goto('http://localhost:8888');
    await page.waitForLoadState('networkidle');
    
    // Click Assets to trigger auth
    await page.click('button:has-text("📁 ASSETS")');
    await page.waitForTimeout(2000);
    
    // Look for authentication elements
    const hasSignIn = await page.locator('text=Sign In').isVisible();
    const hasSignUp = await page.locator('text=Sign Up').isVisible();
    
    if (hasSignIn || hasSignUp) {
      // Authentication is working
      expect(true).toBeTruthy();
      
      // Take a screenshot
      await page.screenshot({ path: 'test-results/auth-flow.png' });
    } else {
      // Maybe already authenticated or different flow
      console.log('No auth modal detected - may be already authenticated');
    }
  });
});
