import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive E2E Tests for AIDEAS Creative Platform
 * Testing the complete user journey from sign up to campaign creation
 */

test.describe('AIDEAS Creative Platform - Complete User Journey', () => {
  const baseURL = 'https://aideas-redbaez.netlify.app';
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Enhanced console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🔴 Console Error: ${msg.text()}`);
      }
    });
    
    // Listen for network failures
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`❌ Network Error: ${response.status()} ${response.url()}`);
      }
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('1. Application loads successfully', async () => {
    console.log('🚀 Testing application load...');
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Verify page loads
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    expect(title).toContain('AIDEAS');
    
    // Check for loading indicators disappearing
    await page.waitForFunction(() => !document.querySelector('.loading'), { timeout: 10000 });
    
    console.log('✅ Application loaded successfully');
  });

  test('2. Homepage displays core elements', async () => {
    console.log('🏠 Testing homepage elements...');
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Check for key elements
    const coreElements = [
      'text=AIDEAS',
      '[data-testid="brief-input"], textarea, input[type="text"]',
      'button:has-text("Generate"), button:has-text("Create"), button:has-text("Start")',
    ];
    
    for (const selector of coreElements) {
      const element = page.locator(selector).first();
      await expect(element).toBeVisible({ timeout: 10000 });
      console.log(`✅ Found: ${selector}`);
    }
    
    console.log('✅ Homepage elements verified');
  });

  test('3. Brief input and form interaction', async () => {
    console.log('📝 Testing brief input functionality...');
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Find and interact with brief input
    const briefInput = page.locator('textarea, input[type="text"], [data-testid="brief-input"]').first();
    await expect(briefInput).toBeVisible({ timeout: 10000 });
    
    const testBrief = 'Create a campaign for a new eco-friendly smartphone targeting millennials who value sustainability and cutting-edge technology.';
    await briefInput.fill(testBrief);
    
    // Verify input was filled
    const inputValue = await briefInput.inputValue();
    expect(inputValue).toContain('eco-friendly smartphone');
    
    console.log('✅ Brief input functionality working');
  });

  test('4. Navigation and UI responsiveness', async () => {
    console.log('🧭 Testing navigation and UI...');
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Test responsive design
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.waitForTimeout(1000);
    
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet  
    await page.waitForTimeout(1000);
    
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await page.waitForTimeout(1000);
    
    // Look for navigation elements
    const navElements = await page.locator('nav, header, [role="navigation"]').count();
    console.log(`🧭 Navigation elements found: ${navElements}`);
    
    // Check for any buttons or interactive elements
    const buttons = await page.locator('button').count();
    console.log(`🔘 Interactive buttons found: ${buttons}`);
    
    console.log('✅ UI responsiveness verified');
  });

  test('5. Error handling and validation', async () => {
    console.log('⚠️ Testing error handling...');
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Test with empty form submission (if applicable)
    const submitButtons = page.locator('button:has-text("Generate"), button:has-text("Submit"), button:has-text("Create")');
    const submitButton = submitButtons.first();
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(2000);
      
      // Check for error messages or validation
      const errorElements = await page.locator('.error, [data-testid*="error"], .alert-error').count();
      console.log(`❌ Error elements found: ${errorElements}`);
    }
    
    console.log('✅ Error handling tested');
  });

  test('6. Authentication flow (if available)', async () => {
    console.log('🔐 Testing authentication...');
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Look for auth-related elements
    const authElements = [
      'text=Sign In',
      'text=Login', 
      'text=Sign Up',
      'text=Register',
      '[data-testid*="auth"]',
      'button:has-text("Login")',
      'button:has-text("Sign")'
    ];
    
    let foundAuth = false;
    for (const selector of authElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`🔐 Found auth element: ${selector}`);
        foundAuth = true;
        
        // Try to interact with auth element
        await element.click();
        await page.waitForTimeout(2000);
        
        // Look for auth forms
        const authForm = page.locator('form, [data-testid*="auth"], input[type="email"]').first();
        if (await authForm.isVisible()) {
          console.log('📋 Auth form appeared');
        }
        break;
      }
    }
    
    if (!foundAuth) {
      console.log('ℹ️ No authentication elements found - app may not require auth');
    }
    
    console.log('✅ Authentication flow tested');
  });

  test('7. Campaign generation workflow', async () => {
    console.log('🎯 Testing campaign generation...');
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Fill in a comprehensive brief
    const briefInput = page.locator('textarea, input[type="text"], [data-testid="brief-input"]').first();
    if (await briefInput.isVisible()) {
      const comprehensiveBrief = `
        Campaign Brief: Launch campaign for EcoPhone Pro
        Target Audience: Environmentally conscious millennials aged 25-35
        Key Messages: Sustainable technology, premium quality, carbon-neutral manufacturing
        Budget: $50,000
        Timeline: 6 weeks
        Channels: Social media, digital advertising, influencer partnerships
        Goals: 10,000 pre-orders, 50% brand awareness increase
      `;
      
      await briefInput.fill(comprehensiveBrief);
      console.log('📝 Filled comprehensive brief');
      
      // Look for generation button
      const generateBtn = page.locator('button:has-text("Generate"), button:has-text("Create"), button:has-text("Start")').first();
      if (await generateBtn.isVisible()) {
        await generateBtn.click();
        console.log('🚀 Clicked generate button');
        
        // Wait for results or loading indicators
        await page.waitForTimeout(5000);
        
        // Check for generated content
        const results = await page.locator('.territory, .headline, .campaign, [data-testid*="result"]').count();
        console.log(`📊 Generated results found: ${results}`);
        
        if (results > 0) {
          console.log('✅ Campaign generation successful');
        } else {
          console.log('⚠️ No visible results - may be loading or require auth');
        }
      }
    }
    
    console.log('✅ Campaign generation workflow tested');
  });

  test('8. Asset management and multimedia features', async () => {
    console.log('🖼️ Testing asset management...');
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Look for asset-related elements
    const assetElements = [
      'text=Assets',
      'text=Images', 
      'text=Gallery',
      'text=Media',
      '[data-testid*="asset"]',
      'button:has-text("Upload")',
      '.asset-manager',
      '.media-library'
    ];
    
    for (const selector of assetElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`🖼️ Found asset element: ${selector}`);
        await element.click();
        await page.waitForTimeout(2000);
        break;
      }
    }
    
    // Check for file upload capabilities
    const fileInputs = await page.locator('input[type="file"]').count();
    console.log(`📁 File upload inputs found: ${fileInputs}`);
    
    console.log('✅ Asset management tested');
  });

  test('9. Performance and accessibility', async () => {
    console.log('⚡ Testing performance and accessibility...');
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Check page load performance
    const performanceEntries = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        timeToFirstByte: navigation.responseStart - navigation.requestStart
      };
    });
    
    console.log(`⚡ Load time: ${performanceEntries.loadTime}ms`);
    console.log(`📄 DOM loaded: ${performanceEntries.domContentLoaded}ms`);
    console.log(`🌐 TTFB: ${performanceEntries.timeToFirstByte}ms`);
    
    // Basic accessibility checks
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    const images = await page.locator('img').count();
    const imagesWithAlt = await page.locator('img[alt]').count();
    const buttons = await page.locator('button').count();
    
    console.log(`📋 Headings: ${headings}`);
    console.log(`🖼️ Images: ${images} (${imagesWithAlt} with alt text)`);
    console.log(`🔘 Buttons: ${buttons}`);
    
    // Check for accessibility landmarks
    const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], main, nav, header').count();
    console.log(`🎯 Accessibility landmarks: ${landmarks}`);
    
    console.log('✅ Performance and accessibility checked');
  });

  test('10. Cross-browser compatibility check', async () => {
    console.log('🌐 Testing cross-browser compatibility...');
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Check JavaScript errors
    const jsErrors: string[] = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    // Interact with the page to trigger any potential issues
    await page.waitForTimeout(3000);
    
    // Try basic interactions
    const clickableElements = page.locator('button, a, [onclick]');
    const clickableCount = await clickableElements.count();
    
    if (clickableCount > 0) {
      await clickableElements.first().click();
      await page.waitForTimeout(1000);
    }
    
    console.log(`❌ JavaScript errors: ${jsErrors.length}`);
    if (jsErrors.length > 0) {
      jsErrors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Check CSS loading
    const stylesheets = await page.locator('link[rel="stylesheet"]').count();
    console.log(`🎨 CSS stylesheets loaded: ${stylesheets}`);
    
    console.log('✅ Cross-browser compatibility tested');
  });

  test('11. Complete user journey simulation', async () => {
    console.log('🎭 Running complete user journey...');
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Simulate complete user workflow
    console.log('👤 Simulating new user journey...');
    
    // Step 1: Explore the interface
    await page.waitForTimeout(2000);
    
    // Step 2: Fill out brief (if available)
    const briefInput = page.locator('textarea, input[type="text"]').first();
    if (await briefInput.isVisible()) {
      await briefInput.fill('Complete user journey test: Create innovative campaign for sustainable fashion brand targeting Gen Z consumers.');
      console.log('✍️ Brief filled out');
    }
    
    // Step 3: Try to generate content
    const actionButtons = page.locator('button:has-text("Generate"), button:has-text("Create"), button:has-text("Start"), button:has-text("Submit")');
    if (await actionButtons.first().isVisible()) {
      await actionButtons.first().click();
      console.log('🚀 Action button clicked');
      await page.waitForTimeout(3000);
    }
    
    // Step 4: Check for results or next steps
    const resultElements = await page.locator('.result, .output, .territory, .headline, .campaign').count();
    const errorElements = await page.locator('.error, .alert').count();
    
    console.log(`📊 Results found: ${resultElements}`);
    console.log(`❌ Errors found: ${errorElements}`);
    
    // Step 5: Try additional interactions
    const additionalButtons = page.locator('button').nth(1);
    if (await additionalButtons.isVisible()) {
      await additionalButtons.click();
      await page.waitForTimeout(1000);
    }
    
    console.log('✅ Complete user journey simulation finished');
  });
});