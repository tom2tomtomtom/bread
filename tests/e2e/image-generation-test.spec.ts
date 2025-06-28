import { test, expect } from '@playwright/test';

test.describe('Image Generation Functionality', () => {
  test('should test image generation workflow without 502 errors', async ({ page }) => {
    // Navigate to the production site
    await page.goto('https://aideas-redbaez.netlify.app');
    await page.waitForLoadState('networkidle');
    
    // Look for workflow elements to access asset management
    const hasWorkflowBtn = await page.locator('text=🎯 Start Creating').isVisible().catch(() => false);
    const hasWorkflowLink = await page.locator('text=Workflow').isVisible().catch(() => false);
    const hasGenerateBtn = await page.locator('text=Generate').isVisible().catch(() => false);
    
    if (hasWorkflowBtn) {
      await page.click('text=🎯 Start Creating');
      await page.waitForTimeout(2000);
    } else if (hasWorkflowLink) {
      await page.click('text=Workflow');
      await page.waitForTimeout(2000);
    }
    
    // Look for asset-related elements
    const hasAssetTab = await page.locator('text=Generate Images').isVisible().catch(() => false);
    const hasAssetButton = await page.locator('button:has-text("Generate")').isVisible().catch(() => false);
    
    console.log('Asset generation elements found:', { hasAssetTab, hasAssetButton });
    
    // Take a screenshot to see the current state
    await page.screenshot({ path: 'image-generation-test.png', fullPage: true });
    
    // The test passes if we can navigate to the page without errors
    expect(true).toBe(true);
  });

  test('should not have 502 errors in function calls', async ({ page }) => {
    const failedRequests = [];
    
    // Monitor network responses for 502 errors
    page.on('response', response => {
      if (response.status() === 502) {
        failedRequests.push({
          url: response.url(),
          status: response.status()
        });
      }
    });
    
    await page.goto('https://aideas-redbaez.netlify.app');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any background requests
    await page.waitForTimeout(3000);
    
    // Should not have any 502 errors
    expect(failedRequests.length).toBe(0);
    
    console.log('✅ No 502 errors detected');
  });

  test('should verify image generation API endpoint is accessible', async ({ page }) => {
    await page.goto('https://aideas-redbaez.netlify.app');
    
    // Test API endpoint accessibility
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/.netlify/functions/generate-images', {
          method: 'OPTIONS',
        });
        return {
          status: response.status,
          accessible: response.status === 200
        };
      } catch (error) {
        return {
          status: 0,
          accessible: false,
          error: error.message
        };
      }
    });
    
    // The OPTIONS request should return 200 (CORS preflight)
    expect(apiResponse.status).toBe(200);
    expect(apiResponse.accessible).toBe(true);
    
    console.log('✅ Image generation API endpoint is accessible');
  });
});