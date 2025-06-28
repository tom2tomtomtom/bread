import { test, expect } from '@playwright/test';

test.describe('Production Site Verification', () => {
  test('should load the application without 404 errors', async ({ page }) => {
    // Navigate to the production site
    await page.goto('https://aideas-redbaez.netlify.app');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that we don't have a 404 page
    const pageTitle = await page.title();
    expect(pageTitle).toContain('AIDEAS');
    
    // Check if main app elements are present (adjust based on actual content)
    await expect(page.locator('text=AIDEAS')).toBeVisible({ timeout: 10000 });
    
    // Take a screenshot for manual verification
    await page.screenshot({ path: 'production-test-result.png', fullPage: true });
    
    console.log('✅ Site loads successfully');
  });

  test('should not show 404 error page', async ({ page }) => {
    await page.goto('https://aideas-redbaez.netlify.app');
    await page.waitForLoadState('networkidle');
    
    // Check that page doesn't contain 404 error text
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Page not found');
    expect(pageContent).not.toContain('404');
    expect(pageContent).not.toContain('broken link');
    
    console.log('✅ No 404 errors detected');
  });

  test('should have working JavaScript and CSS', async ({ page }) => {
    const responses = [];
    
    // Monitor network responses
    page.on('response', response => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        responses.push({
          url: response.url(),
          status: response.status()
        });
      }
    });
    
    await page.goto('https://aideas-redbaez.netlify.app');
    await page.waitForLoadState('networkidle');
    
    // Check that CSS and JS assets loaded successfully
    const failedAssets = responses.filter(r => r.status >= 400);
    expect(failedAssets.length).toBe(0);
    
    console.log('✅ All assets loaded successfully');
  });

  test('should show interactive elements', async ({ page }) => {
    await page.goto('https://aideas-redbaez.netlify.app');
    await page.waitForLoadState('networkidle');
    
    // Look for any buttons or interactive elements (adjust based on actual UI)
    const buttons = await page.locator('button').count();
    expect(buttons).toBeGreaterThan(0);
    
    console.log(`✅ Found ${buttons} interactive buttons`);
  });

  test('should test the new asset management workflow', async ({ page }) => {
    await page.goto('https://aideas-redbaez.netlify.app');
    await page.waitForLoadState('networkidle');
    
    // Look for workflow elements
    const hasWorkflow = await page.locator('text=Workflow').isVisible().catch(() => false);
    const hasAssets = await page.locator('text=Asset').isVisible().catch(() => false);
    const hasGenerate = await page.locator('text=Generate').isVisible().catch(() => false);
    
    // At least one of these should be present
    expect(hasWorkflow || hasAssets || hasGenerate).toBe(true);
    
    console.log('✅ Asset management elements present');
  });
});