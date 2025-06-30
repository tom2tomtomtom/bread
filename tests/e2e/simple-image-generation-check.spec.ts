import { test, expect } from '@playwright/test';

test.describe('Simple Image Generation Check', () => {
  test('should load the app and check for image generation capabilities', async ({ page }) => {
    // Go to the application
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'tests/screenshots/app-initial-load.png', fullPage: true });
    
    // Check what's actually displayed on the page
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    // Look for main elements
    const mainHeading = page.locator('h1').first();
    const headingText = await mainHeading.textContent();
    console.log('Main heading:', headingText);
    
    // Check if this is AIDEAS or BREAD interface
    if (headingText?.includes('AIDEAS')) {
      console.log('Found AIDEAS interface');
      
      // Look for auth buttons
      const signInBtn = page.locator('button:has-text("Sign In")');
      const signUpBtn = page.locator('button:has-text("Get Started Free"), button:has-text("Sign Up")');
      
      if (await signInBtn.isVisible() || await signUpBtn.isVisible()) {
        console.log('Authentication required - trying to sign in');
        
        // Try to sign in with existing account first
        if (await signInBtn.isVisible()) {
          await signInBtn.click();
          await page.waitForTimeout(2000);
          
          // Fill basic credentials
          const emailInput = page.locator('input[type="email"]').first();
          const passwordInput = page.locator('input[type="password"]').first();
          
          if (await emailInput.isVisible()) {
            await emailInput.fill('test@example.com');
            await passwordInput.fill('password123');
            
            const loginSubmitBtn = page.locator('button:has-text("Sign In"), button:has-text("Login")').first();
            await loginSubmitBtn.click();
            await page.waitForTimeout(3000);
          }
        }
      }
      
      // Take screenshot after potential auth
      await page.screenshot({ path: 'tests/screenshots/after-auth-attempt.png', fullPage: true });
      
      // Check if we can access the main workflow
      const briefTextarea = page.locator('textarea, input[placeholder*="brief"], [data-testid="brief-input"]');
      const generateBtn = page.locator('button:has-text("GENERATE"), button:has-text("Generate")');
      const assetsBtn = page.locator('button:has-text("ASSETS"), button:has-text("📁")');
      
      console.log('Brief textarea visible:', await briefTextarea.isVisible());
      console.log('Generate button visible:', await generateBtn.isVisible());
      console.log('Assets button visible:', await assetsBtn.isVisible());
      
      // If we can see the main interface, try a simple workflow
      if (await briefTextarea.isVisible()) {
        console.log('Found workflow interface - testing brief input');
        await briefTextarea.fill('Test luxury watch campaign for young professionals');
        await page.screenshot({ path: 'tests/screenshots/brief-entered.png', fullPage: true });
        
        if (await generateBtn.isVisible()) {
          await generateBtn.click();
          console.log('Clicked generate button');
          await page.waitForTimeout(5000);
          await page.screenshot({ path: 'tests/screenshots/after-generate-click.png', fullPage: true });
          
          // Look for generated content or loading states
          const territoryCards = page.locator('[data-testid="territory-card"], .territory-card, .territory');
          const loadingIndicators = page.locator('.loading, .spinner, [data-testid="loading"]');
          const generateImageBtns = page.locator('button:has-text("Generate Image")');
          
          console.log('Territory cards found:', await territoryCards.count());
          console.log('Loading indicators:', await loadingIndicators.count());
          console.log('Generate image buttons:', await generateImageBtns.count());
          
          if (await generateImageBtns.first().isVisible()) {
            console.log('Found image generation option - testing');
            await generateImageBtns.first().click();
            await page.waitForTimeout(3000);
            await page.screenshot({ path: 'tests/screenshots/image-generation-modal.png', fullPage: true });
            
            // Look for actual image generation interface
            const imageGenerateBtn = page.locator('button:has-text("Generate"), .generate-image-btn');
            if (await imageGenerateBtn.isVisible()) {
              await imageGenerateBtn.click();
              console.log('Triggered image generation');
              
              // Wait and check for results
              await page.waitForTimeout(10000);
              await page.screenshot({ path: 'tests/screenshots/image-generation-result.png', fullPage: true });
              
              // Check if actual images are displayed
              const generatedImages = page.locator('img[src*="data:"], img[src*="blob:"], img[src*="https://"]');
              const imageCount = await generatedImages.count();
              console.log('Generated images found:', imageCount);
              
              if (imageCount > 0) {
                console.log('SUCCESS: Found generated images');
                const firstImageSrc = await generatedImages.first().getAttribute('src');
                console.log('First image src:', firstImageSrc?.substring(0, 50) + '...');
              } else {
                console.log('WARNING: No generated images found - might be loading or placeholder');
              }
            }
          }
        }
      }
      
      // Check assets functionality
      if (await assetsBtn.isVisible()) {
        console.log('Testing assets functionality');
        await assetsBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'tests/screenshots/assets-modal.png', fullPage: true });
        
        // Look for asset library content
        const assetCards = page.locator('[data-testid="asset-card"], .asset-card, .asset');
        console.log('Asset cards found:', await assetCards.count());
      }
      
    } else {
      console.log('This appears to be BREAD interface, not AIDEAS');
      console.log('Current heading:', headingText);
    }
    
    // Final screenshot
    await page.screenshot({ path: 'tests/screenshots/final-state.png', fullPage: true });
  });
});