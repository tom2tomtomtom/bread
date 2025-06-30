import { test, expect } from '@playwright/test';

test.describe('Image and Video Generation Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the application
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    
    // Check if we need to authenticate
    const getStartedButton = page.locator('button:has-text("Get Started Free")');
    if (await getStartedButton.isVisible()) {
      // Click Get Started Free to open auth modal
      await getStartedButton.click();
      
      // Fill in registration form (assuming it opens in register mode)
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button:has-text("Sign Up")');
      
      // Wait for authentication to complete
      await page.waitForLoadState('networkidle');
    }
  });

  test('should complete full workflow and display actual generated images', async ({ page }) => {
    // Step 1: Input Brief
    const briefTextarea = page.locator('textarea[placeholder*="brief"]').first();
    await briefTextarea.fill('Create a luxury watch campaign targeting young professionals who value precision and style. The brand personality is sophisticated, innovative, and aspirational.');
    
    // Continue to territory generation
    await page.click('button:has-text("GENERATE TERRITORIES")');
    
    // Wait for territories to generate
    await page.waitForSelector('.territory-card, [data-testid="territory-output"]', { timeout: 30000 });
    
    // Step 2: Generate Image from Territory
    const generateImageBtn = page.locator('button:has-text("Generate Image")').first();
    await expect(generateImageBtn).toBeVisible({ timeout: 15000 });
    await generateImageBtn.click();
    
    // Wait for image generation modal
    await page.waitForSelector('[data-testid="image-generation-modal"], .modal', { timeout: 10000 });
    
    // Start image generation
    const generateBtn = page.locator('button:has-text("Generate"), button[class*="generate"]').first();
    await generateBtn.click();
    
    // Wait for image to be generated and displayed (not just loading state)
    await page.waitForSelector('img[src*="data:"], img[src*="blob:"], img[src*="https://"], [data-testid="generated-image"]', { timeout: 60000 });
    
    // Verify actual image is displayed, not placeholder
    const generatedImage = page.locator('img[src*="data:"], img[src*="blob:"], img[src*="https://"]').first();
    await expect(generatedImage).toBeVisible();
    
    // Check that the image has actual content (not placeholder/loading icon)
    const imageSrc = await generatedImage.getAttribute('src');
    expect(imageSrc).not.toBeNull();
    expect(imageSrc).not.toContain('placeholder');
    expect(imageSrc).not.toContain('loading');
    
    // Take screenshot of generated image
    await page.screenshot({ path: 'tests/screenshots/generated-image-display.png' });
    
    // Close image modal
    await page.click('button:has-text("Close"), [aria-label="Close"]');
    
    // Step 3: Navigate to Video Template Selection
    await page.click('button:has-text("Continue"), button:has-text("Next")');
    await page.waitForLoadState('networkidle');
    
    // Select a video template
    const videoTemplate = page.locator('[data-testid="video-template"], .template-card').first();
    await videoTemplate.click();
    
    // Continue to video population
    await page.click('button:has-text("Continue"), button:has-text("Next")');
    
    // Step 4: Generate/Populate Video
    const populateVideoBtn = page.locator('button:has-text("Populate"), button:has-text("Generate Video")').first();
    if (await populateVideoBtn.isVisible()) {
      await populateVideoBtn.click();
      
      // Wait for video to be generated and displayed
      await page.waitForSelector('video, [data-testid="generated-video"]', { timeout: 60000 });
      
      // Verify actual video is displayed
      const generatedVideo = page.locator('video').first();
      await expect(generatedVideo).toBeVisible();
      
      // Check video has actual source
      const videoSrc = await generatedVideo.getAttribute('src');
      expect(videoSrc).not.toBeNull();
      expect(videoSrc).not.toContain('placeholder');
      
      // Take screenshot of video display
      await page.screenshot({ path: 'tests/screenshots/generated-video-display.png' });
    }
  });

  test('should show actual generated content in asset library', async ({ page }) => {
    // Open asset manager
    await page.click('button:has-text("📁 ASSETS")');
    
    // Wait for asset manager to open
    await page.waitForSelector('[data-testid="asset-manager"], .asset-manager', { timeout: 10000 });
    
    // Check if there are assets displayed
    const assetCards = page.locator('[data-testid="asset-card"], .asset-card');
    const assetCount = await assetCards.count();
    
    if (assetCount > 0) {
      // Click on first asset to preview
      await assetCards.first().click();
      
      // Wait for preview modal
      await page.waitForSelector('[data-testid="asset-preview"], .asset-preview', { timeout: 10000 });
      
      // Verify actual asset content is displayed
      const previewContent = page.locator('img, video').first();
      await expect(previewContent).toBeVisible();
      
      const contentSrc = await previewContent.getAttribute('src');
      expect(contentSrc).not.toBeNull();
      expect(contentSrc).not.toContain('placeholder');
      
      // Take screenshot of asset preview
      await page.screenshot({ path: 'tests/screenshots/asset-preview-display.png' });
    }
    
    // Close asset manager
    await page.click('button:has-text("Close"), [aria-label="Close"]');
  });

  test('should handle image generation errors gracefully', async ({ page }) => {
    // Go through workflow to territory generation
    const briefTextarea = page.locator('textarea[placeholder*="brief"]').first();
    await briefTextarea.fill('Test campaign brief');
    await page.click('button:has-text("GENERATE TERRITORIES")');
    await page.waitForSelector('.territory-card', { timeout: 30000 });
    
    // Try to generate image
    const generateImageBtn = page.locator('button:has-text("Generate Image")').first();
    await generateImageBtn.click();
    
    // Wait for modal and try generation
    await page.waitForSelector('[data-testid="image-generation-modal"], .modal', { timeout: 10000 });
    const generateBtn = page.locator('button:has-text("Generate")').first();
    await generateBtn.click();
    
    // Wait for either success or error state
    await Promise.race([
      page.waitForSelector('img[src*="data:"], img[src*="blob:"], img[src*="https://"]', { timeout: 30000 }),
      page.waitForSelector('[data-testid="error-message"], .error', { timeout: 30000 })
    ]);
    
    // Check if error is displayed properly (not just hanging loading state)
    const errorMessage = page.locator('[data-testid="error-message"], .error, .text-red');
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      expect(errorText).not.toBe('');
      console.log('Error displayed:', errorText);
    }
    
    // Take screenshot of final state
    await page.screenshot({ path: 'tests/screenshots/image-generation-final-state.png' });
  });
});