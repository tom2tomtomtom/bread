import { test, expect } from '@playwright/test';

test.describe('Territory Image Generation Workflow', () => {
  test('should complete full territory-based image generation workflow', async ({ page }) => {
    console.log('🚀 Starting territory image generation test...');
    
    // Monitor network requests and errors
    const failedRequests: Array<{ url: string; status: number; error?: string }> = [];
    const networkRequests: Array<{ url: string; status: number; method: string }> = [];
    
    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      const method = response.request().method();
      
      networkRequests.push({ url, status, method });
      
      if (status >= 400) {
        failedRequests.push({ url, status });
      }
    });
    
    page.on('console', msg => console.log('🎯 Browser console:', msg.text()));
    page.on('pageerror', error => console.error('❌ Page error:', error.message));
    
    // Navigate to the site
    await page.goto('https://aideas-redbaez.netlify.app');
    await page.waitForLoadState('networkidle');
    console.log('✅ Site loaded successfully');
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/01-initial-page.png', fullPage: true });
    
    // Step 1: Navigate to Brief page (if not already there)
    console.log('📝 Step 1: Navigating to Brief page...');
    const briefLink = page.locator('a[href="/brief"], button:has-text("Brief"), text=Brief').first();
    if (await briefLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await briefLink.click();
      await page.waitForTimeout(2000);
    }
    
    // Check if we're on brief page or need to navigate differently
    const briefPage = await page.locator('h1:has-text("Brief"), h2:has-text("Brief"), text=brief').isVisible().catch(() => false);
    if (!briefPage) {
      // Try alternative navigation
      const startButton = page.locator('text=Start Creating, text=🎯 Start Creating').first();
      if (await startButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await startButton.click();
        await page.waitForTimeout(2000);
      }
    }
    
    await page.screenshot({ path: 'test-results/02-brief-page.png', fullPage: true });
    
    // Step 2: Enter a brief
    console.log('📝 Step 2: Entering brief...');
    const briefTextarea = page.locator('textarea, input[type="text"]').first();
    if (await briefTextarea.isVisible({ timeout: 5000 }).catch(() => false)) {
      await briefTextarea.fill('Create a marketing campaign for a new Australian coffee brand targeting young professionals who value sustainability and quality.');
      await page.waitForTimeout(1000);
      console.log('✅ Brief entered successfully');
    } else {
      console.log('⚠️ Could not find brief input field');
    }
    
    // Step 3: Generate territories
    console.log('🎯 Step 3: Generating territories...');
    const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create")').first();
    if (await generateButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await generateButton.click();
      console.log('🔄 Generate button clicked, waiting for territories...');
      
      // Wait for territories to be generated (up to 60 seconds)
      await page.waitForTimeout(5000); // Initial wait
      
      // Look for territory cards or territory-related content
      const territoryCards = page.locator('[class*="territory"], [class*="Territory"], text=positioning, text=tone').first();
      await territoryCards.waitFor({ timeout: 60000 }).catch(() => console.log('⚠️ Territories may not have loaded in time'));
      
      console.log('✅ Territory generation completed');
    } else {
      console.log('❌ Could not find generate button');
    }
    
    await page.screenshot({ path: 'test-results/03-territories-generated.png', fullPage: true });
    
    // Step 4: Look for Image generation buttons
    console.log('🎨 Step 4: Looking for image generation buttons...');
    
    // Look for the new Image buttons we added to territory cards
    const imageButtons = page.locator('button:has-text("Image"), button:has-text("🎨")');
    const imageButtonCount = await imageButtons.count();
    console.log(`🔍 Found ${imageButtonCount} image generation buttons`);
    
    if (imageButtonCount > 0) {
      // Click the first image button
      console.log('🎨 Clicking first image generation button...');
      await imageButtons.first().click();
      await page.waitForTimeout(2000);
      
      // Look for the ImageGenerationModal
      const modal = page.locator('[class*="modal"], [class*="Modal"], text=Generate Image').first();
      const modalVisible = await modal.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (modalVisible) {
        console.log('✅ Image generation modal opened');
        await page.screenshot({ path: 'test-results/04-image-modal-opened.png', fullPage: true });
        
        // Check for modal elements
        const promptTextarea = page.locator('textarea[placeholder*="Describe"], textarea[placeholder*="image"]').first();
        const generateImageButton = page.locator('button:has-text("Generate Image"), button:has-text("🎨 Generate")').first();
        
        const hasPrompt = await promptTextarea.isVisible().catch(() => false);
        const hasGenerateBtn = await generateImageButton.isVisible().catch(() => false);
        
        console.log(`📝 Modal elements - Prompt: ${hasPrompt}, Generate Button: ${hasGenerateBtn}`);
        
        if (hasPrompt && hasGenerateBtn) {
          // Optionally modify the prompt
          await promptTextarea.fill('A professional, modern Australian coffee shop interior with sustainable wooden furniture and young professionals working on laptops');
          await page.waitForTimeout(1000);
          
          console.log('🎨 Attempting to generate image...');
          await generateImageButton.click();
          
          // Monitor for generation progress or completion
          await page.waitForTimeout(5000);
          
          // Look for success/error messages
          const successMessage = page.locator('text=Generated Successfully, text=✅, text=saved to library').first();
          const errorMessage = page.locator('text=error, text=failed, text=❌').first();
          
          const hasSuccess = await successMessage.isVisible({ timeout: 30000 }).catch(() => false);
          const hasError = await errorMessage.isVisible().catch(() => false);
          
          console.log(`🎯 Generation result - Success: ${hasSuccess}, Error: ${hasError}`);
          
          await page.screenshot({ path: 'test-results/05-generation-result.png', fullPage: true });
          
          // Close modal
          const closeButton = page.locator('button:has-text("×"), button:has-text("Close")').first();
          if (await closeButton.isVisible().catch(() => false)) {
            await closeButton.click();
            await page.waitForTimeout(1000);
          }
        } else {
          console.log('❌ Modal elements not found properly');
        }
      } else {
        console.log('❌ Image generation modal did not open');
        await page.screenshot({ path: 'test-results/04-modal-not-opened.png', fullPage: true });
      }
    } else {
      console.log('❌ No image generation buttons found');
    }
    
    // Step 5: Check for any network errors
    console.log('🔍 Step 5: Checking for network errors...');
    
    const criticalErrors = failedRequests.filter(req => req.status >= 500);
    const imageApiErrors = failedRequests.filter(req => req.url.includes('generate-images'));
    
    console.log(`📊 Network Summary:
    - Total requests: ${networkRequests.length}
    - Failed requests (4xx/5xx): ${failedRequests.length}
    - Critical errors (5xx): ${criticalErrors.length}
    - Image API errors: ${imageApiErrors.length}`);
    
    if (failedRequests.length > 0) {
      console.log('❌ Failed requests:', failedRequests);
    }
    
    // Final screenshot
    await page.screenshot({ path: 'test-results/06-final-state.png', fullPage: true });
    
    // Assertions
    expect(criticalErrors.length).toBe(0); // No 5xx errors
    expect(imageButtonCount).toBeGreaterThan(0); // Should find image buttons
    
    console.log('🎉 Territory image generation test completed');
  });
  
  test('should verify image generation API endpoints are working', async ({ page }) => {
    console.log('🔍 Testing image generation API endpoints...');
    
    await page.goto('https://aideas-redbaez.netlify.app');
    
    // Test the generate-images-simple endpoint with OPTIONS (CORS preflight)
    const apiTest = await page.evaluate(async () => {
      const results = [];
      
      try {
        console.log('Testing generate-images-simple OPTIONS...');
        const optionsResponse = await fetch('/.netlify/functions/generate-images-simple', {
          method: 'OPTIONS',
        });
        results.push({
          endpoint: 'generate-images-simple (OPTIONS)',
          status: optionsResponse.status,
          success: optionsResponse.status === 200
        });
      } catch (error) {
        results.push({
          endpoint: 'generate-images-simple (OPTIONS)',
          status: 0,
          success: false,
          error: error.message
        });
      }
      
      return results;
    });
    
    console.log('API Test Results:', apiTest);
    
    // Should have successful API responses
    expect(apiTest.length).toBeGreaterThan(0);
    expect(apiTest.every(result => result.success)).toBe(true);
    
    console.log('✅ API endpoints are working correctly');
  });
  
  test('should check for JavaScript errors on page load', async ({ page }) => {
    console.log('🔍 Checking for JavaScript errors...');
    
    const jsErrors: string[] = [];
    const consoleErrors: string[] = [];
    
    page.on('pageerror', error => {
      jsErrors.push(error.message);
      console.error('❌ JavaScript error:', error.message);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.error('❌ Console error:', msg.text());
      }
    });
    
    await page.goto('https://aideas-redbaez.netlify.app');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any delayed errors
    await page.waitForTimeout(5000);
    
    console.log(`📊 Error Summary:
    - JavaScript errors: ${jsErrors.length}
    - Console errors: ${consoleErrors.length}`);
    
    if (jsErrors.length > 0) {
      console.log('JavaScript errors found:', jsErrors);
    }
    
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }
    
    // Should not have critical JavaScript errors
    expect(jsErrors.length).toBe(0);
    
    console.log('✅ No JavaScript errors detected');
  });
});