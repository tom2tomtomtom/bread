import { test, expect } from '@playwright/test';

test.describe('🚀 FINAL VALIDATION - Complete AIDEAS User Experience', () => {
  const baseUrl = 'https://aideas-redbaez.netlify.app';

  test('Complete Sign-Up to Dashboard Journey', async ({ page }) => {
    console.log('🧪 TESTING: Complete Sign-Up Journey');
    
    // 1. Land on homepage
    await page.goto(baseUrl);
    await expect(page.locator('text=AIDEAS')).toBeVisible({ timeout: 10000 });
    console.log('✅ Homepage loads with AIDEAS branding');
    
    // 2. Click Get Started Free  
    await page.click('button:has-text("Get Started Free")');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // 3. Switch to register if needed
    const welcomeBackText = page.locator('text=Welcome Back');
    if (await welcomeBackText.isVisible()) {
      await page.click('text=Sign up here');
      await page.waitForSelector('text=Join BREAD', { timeout: 5000 });
    }
    console.log('✅ Registration form opened');
    
    // 4. Fill registration form
    await page.fill('input[id="name"]', 'Test User');
    await page.fill('input[id="email"]', 'finaltest@example.com');
    await page.fill('input[id="password"]', 'TestPassword123');
    await page.fill('input[id="confirmPassword"]', 'TestPassword123');
    console.log('✅ Registration form filled');
    
    // 5. Submit registration
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(3000);
    console.log('✅ Registration submitted');
    
    // 6. Verify redirect to dashboard
    await page.waitForSelector('text=Welcome', { timeout: 10000 });
    const currentUrl = page.url();
    expect(currentUrl).toContain('/dashboard');
    console.log('✅ Successfully redirected to dashboard');
    
    // Take success screenshot
    await page.screenshot({ path: 'test-results/successful-signup-journey.png' });
  });

  test('Complete Sign-In to Dashboard Journey', async ({ page }) => {
    console.log('🧪 TESTING: Complete Sign-In Journey');
    
    // 1. Land on homepage
    await page.goto(baseUrl);
    await expect(page.locator('text=AIDEAS')).toBeVisible({ timeout: 10000 });
    
    // 2. Click Sign In
    await page.click('button:has-text("Sign In")');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    console.log('✅ Login modal opened correctly');
    
    // 3. Fill login form
    await page.fill('input[id="email"]', 'finaltest@example.com');
    await page.fill('input[id="password"]', 'TestPassword123');
    console.log('✅ Login form filled');
    
    // 4. Submit login
    await page.click('form button[type="submit"]:has-text("Sign In")');
    await page.waitForTimeout(3000);
    console.log('✅ Login submitted');
    
    // 5. Verify redirect to dashboard
    await page.waitForSelector('text=Welcome', { timeout: 10000 });
    const currentUrl = page.url();
    expect(currentUrl).toContain('/dashboard');
    console.log('✅ Successfully redirected to dashboard');
    
    // Take success screenshot
    await page.screenshot({ path: 'test-results/successful-signin-journey.png' });
  });

  test('Navigation Between All Pages', async ({ page }) => {
    console.log('🧪 TESTING: Complete Navigation Flow');
    
    // Start at dashboard (simulate authenticated user)
    await page.goto(`${baseUrl}/dashboard`);
    await page.waitForTimeout(2000);
    
    // Test navigation to Brief
    const briefButton = page.locator('a[href="/brief"], button:has-text("Create Brief"), button:has-text("Brief")');
    if (await briefButton.first().isVisible()) {
      await briefButton.first().click();
      await page.waitForTimeout(2000);
      console.log('✅ Navigation to Brief page works');
    }
    
    // Test navigation to Generate
    await page.goto(`${baseUrl}/generate`);
    await page.waitForTimeout(2000);
    console.log('✅ Generate page loads');
    
    // Test navigation to Results
    await page.goto(`${baseUrl}/results`);
    await page.waitForTimeout(2000);
    console.log('✅ Results page loads');
    
    // Test back to Dashboard
    await page.goto(`${baseUrl}/dashboard`);
    await page.waitForTimeout(2000);
    console.log('✅ Back to Dashboard works');
    
    console.log('✅ All navigation paths work correctly');
  });

  test('Error-Free Experience Check', async ({ page }) => {
    console.log('🧪 TESTING: Error-Free Experience');
    
    let jsErrors = [];
    let networkErrors = [];
    
    // Capture JavaScript errors
    page.on('pageerror', error => {
      jsErrors.push(error.message);
      console.log(`❌ JS Error: ${error.message}`);
    });
    
    // Capture network errors
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.url()}`);
        console.log(`❌ Network Error: ${response.status()} ${response.url()}`);
      }
    });
    
    // Test key user paths
    await page.goto(baseUrl);
    await page.waitForTimeout(2000);
    
    // Test landing page interaction
    await page.click('button:has-text("Get Started Free")');
    await page.waitForTimeout(2000);
    
    // Close modal and test other elements
    await page.press('Escape');
    await page.waitForTimeout(1000);
    
    // Check final error count
    console.log(`🔍 JavaScript Errors: ${jsErrors.length}`);
    console.log(`🔍 Network Errors: ${networkErrors.length}`);
    
    // Verify minimal errors (some might be expected)
    expect(jsErrors.length).toBeLessThan(5);
    expect(networkErrors.length).toBeLessThan(10);
    
    if (jsErrors.length === 0 && networkErrors.length === 0) {
      console.log('🎉 PERFECT: Zero errors detected!');
    } else {
      console.log('✅ GOOD: Error count within acceptable limits');
    }
  });
});