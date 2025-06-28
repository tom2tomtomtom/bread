import { test, expect } from '@playwright/test';

test.describe('Comprehensive AIDEAS User Flow Testing', () => {
  const baseUrl = 'https://aideas-redbaez.netlify.app';
  
  test.beforeEach(async ({ page }) => {
    // Enable console logging to catch JavaScript errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      }
    });
    
    // Enable request/response logging to catch API errors
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`❌ HTTP Error: ${response.status()} ${response.url()}`);
      }
    });
  });

  test('Complete User Registration Flow', async ({ page }) => {
    console.log('🧪 Testing Complete User Registration Flow');
    
    // Step 1: Navigate to landing page
    await page.goto(baseUrl);
    await expect(page.locator('text=AIDEAS')).toBeVisible({ timeout: 10000 });
    console.log('✅ Landing page loaded');
    
    // Step 2: Click "Get Started Free"
    const getStartedButton = page.locator('button:has-text("Get Started Free")');
    await expect(getStartedButton).toBeVisible();
    await getStartedButton.click();
    console.log('✅ Clicked Get Started Free');
    
    // Step 3: Wait for modal and check initial state
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Check if we're in login mode (need to switch to register)
    const welcomeBackText = page.locator('text=Welcome Back');
    if (await welcomeBackText.isVisible()) {
      console.log('ℹ️ Modal opened in login mode, switching to register');
      await page.click('text=Sign up here');
      await page.waitForSelector('text=Join BREAD', { timeout: 5000 });
      console.log('✅ Switched to registration form');
    }
    
    // Step 4: Fill registration form
    await page.fill('input[id="name"]', 'Test User');
    await page.fill('input[id="email"]', 'test@example.com');
    await page.fill('input[id="password"]', 'TestPassword123');
    await page.fill('input[id="confirmPassword"]', 'TestPassword123');
    console.log('✅ Filled registration form');
    
    // Step 5: Submit registration
    const createAccountButton = page.locator('button:has-text("Create Account")');
    await expect(createAccountButton).toBeVisible();
    await createAccountButton.click();
    console.log('✅ Clicked Create Account');
    
    // Step 6: Wait for response and check for errors
    await page.waitForTimeout(3000); // Allow API call to complete
    
    // Check for error messages
    const errorMessages = await page.locator('[class*="error"], [class*="Error"], .text-red').allTextContents();
    if (errorMessages.length > 0) {
      console.log('❌ Registration errors found:', errorMessages);
    }
    
    // Step 7: Check if registration succeeded
    const currentUrl = page.url();
    console.log(`Current URL after registration: ${currentUrl}`);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/registration-result.png' });
    
    // Check if user is on dashboard or still on landing
    const dashboardIndicators = [
      'text=Dashboard',
      'text=Welcome',
      'text=Create Brief',
      'text=Projects'
    ];
    
    let foundDashboard = false;
    for (const indicator of dashboardIndicators) {
      if (await page.locator(indicator).isVisible()) {
        foundDashboard = true;
        console.log(`✅ Found dashboard indicator: ${indicator}`);
        break;
      }
    }
    
    if (!foundDashboard) {
      console.log('⚠️ User not redirected to dashboard after registration');
      // Try navigating to dashboard manually
      await page.goto(`${baseUrl}/dashboard`);
      await page.waitForTimeout(2000);
      
      const dashboardAfterNavigation = await page.locator('text=Dashboard').isVisible();
      if (dashboardAfterNavigation) {
        console.log('✅ Dashboard accessible after manual navigation');
      } else {
        console.log('❌ Dashboard not accessible even after manual navigation');
      }
    }
  });

  test('Complete User Login Flow', async ({ page }) => {
    console.log('🧪 Testing Complete User Login Flow');
    
    // Step 1: Navigate to landing page
    await page.goto(baseUrl);
    await expect(page.locator('text=AIDEAS')).toBeVisible({ timeout: 10000 });
    
    // Step 2: Click "Sign In"
    const signInButton = page.locator('button:has-text("Sign In")');
    await expect(signInButton).toBeVisible();
    await signInButton.click();
    console.log('✅ Clicked Sign In button');
    
    // Step 3: Wait for login modal
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Verify we're in login mode
    const welcomeBackText = page.locator('text=Welcome Back');
    await expect(welcomeBackText).toBeVisible();
    console.log('✅ Login modal opened correctly');
    
    // Step 4: Fill login form
    await page.fill('input[id="email"]', 'test@example.com');
    await page.fill('input[id="password"]', 'TestPassword123');
    console.log('✅ Filled login form');
    
    // Step 5: Submit login (use the form submit button specifically)
    const signInFormButton = page.locator('form button[type="submit"]:has-text("Sign In")');
    await expect(signInFormButton).toBeVisible();
    await signInFormButton.click();
    console.log('✅ Clicked Sign In form button');
    
    // Step 6: Wait for response and capture any errors
    await page.waitForTimeout(5000);
    
    // Check for any error messages
    const errorElements = page.locator('[class*="error"], [class*="Error"], .text-red, [role="alert"]');
    const errorCount = await errorElements.count();
    
    if (errorCount > 0) {
      console.log(`❌ Found ${errorCount} error elements`);
      for (let i = 0; i < errorCount; i++) {
        const errorText = await errorElements.nth(i).textContent();
        console.log(`   Error ${i + 1}: ${errorText}`);
      }
    }
    
    // Check for "Unexpected Error" specifically
    const unexpectedError = page.locator('text=Unexpected Error');
    if (await unexpectedError.isVisible()) {
      console.log('❌ FOUND "Unexpected Error" message');
      
      // Get more context around the error
      const errorContainer = unexpectedError.locator('..').first();
      const fullErrorText = await errorContainer.textContent();
      console.log(`   Full error context: ${fullErrorText}`);
    }
    
    // Step 7: Check authentication state
    const currentUrl = page.url();
    console.log(`Current URL after login attempt: ${currentUrl}`);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/login-result.png' });
    
    // Check if modal closed (successful login) or still open (failed login)
    const modalStillOpen = await page.locator('[class*="modal"], [class*="Modal"], .fixed.inset-0').isVisible();
    console.log(`Modal still open after login: ${modalStillOpen}`);
  });

  test('API Endpoint Testing', async ({ page }) => {
    console.log('🧪 Testing API Endpoints Directly');
    
    // Test registration endpoint
    const registrationResponse = await page.request.post(`${baseUrl}/.netlify/functions/auth-register`, {
      data: {
        email: 'api-test@example.com',
        password: 'TestPassword123',
        name: 'API Test User'
      }
    });
    
    console.log(`Registration API Status: ${registrationResponse.status()}`);
    const registrationBody = await registrationResponse.json();
    console.log('Registration Response:', registrationBody);
    
    // Test login endpoint if it exists
    try {
      const loginResponse = await page.request.post(`${baseUrl}/.netlify/functions/auth-login`, {
        data: {
          email: 'api-test@example.com',
          password: 'TestPassword123'
        }
      });
      
      console.log(`Login API Status: ${loginResponse.status()}`);
      const loginBody = await loginResponse.json();
      console.log('Login Response:', loginBody);
    } catch (error) {
      console.log('❌ Login API Error:', error.message);
    }
  });

  test('Navigation and Routing Test', async ({ page }) => {
    console.log('🧪 Testing Navigation and Routing');
    
    const routes = ['/', '/dashboard', '/brief', '/generate', '/results'];
    
    for (const route of routes) {
      console.log(`Testing route: ${route}`);
      await page.goto(`${baseUrl}${route}`);
      
      // Wait for page to load
      await page.waitForTimeout(2000);
      
      // Check for errors
      const errorPage = page.locator('text=Page not found, text=404, text=Error');
      const hasError = await errorPage.isVisible();
      
      if (hasError) {
        console.log(`❌ Route ${route} shows error page`);
      } else {
        console.log(`✅ Route ${route} loads successfully`);
      }
      
      // Check for JavaScript errors
      const jsErrors = [];
      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });
      
      if (jsErrors.length > 0) {
        console.log(`❌ JavaScript errors on ${route}:`, jsErrors);
      }
    }
  });

  test('Authentication State Management', async ({ page }) => {
    console.log('🧪 Testing Authentication State Management');
    
    await page.goto(baseUrl);
    
    // Check localStorage for authentication data
    const authData = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const authKeys = keys.filter(key => 
        key.includes('auth') || 
        key.includes('token') || 
        key.includes('user')
      );
      
      const data = {};
      authKeys.forEach(key => {
        try {
          data[key] = JSON.parse(localStorage.getItem(key));
        } catch {
          data[key] = localStorage.getItem(key);
        }
      });
      
      return data;
    });
    
    console.log('localStorage auth data:', authData);
    
    // Check if authentication store is working
    const storeData = await page.evaluate(() => {
      // Try to access Zustand store data
      return window.__ZUSTAND__ || 'No Zustand data found';
    });
    
    console.log('Zustand store data:', storeData);
  });

  test('Error Handling and User Feedback', async ({ page }) => {
    console.log('🧪 Testing Error Handling and User Feedback');
    
    await page.goto(baseUrl);
    
    // Test with invalid registration data
    const getStartedButton = page.locator('button:has-text("Get Started Free")');
    await getStartedButton.click();
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Switch to register if needed
    const welcomeBackText = page.locator('text=Welcome Back');
    if (await welcomeBackText.isVisible()) {
      await page.click('text=Sign up here');
      await page.waitForSelector('text=Join BREAD', { timeout: 5000 });
    }
    
    // Test with invalid email
    await page.fill('input[id="name"]', 'Test User');
    await page.fill('input[id="email"]', 'invalid-email');
    await page.fill('input[id="password"]', 'weak');
    await page.fill('input[id="confirmPassword"]', 'different');
    
    const createAccountButton = page.locator('button:has-text("Create Account")');
    await createAccountButton.click();
    
    // Check for validation errors
    await page.waitForTimeout(2000);
    const validationErrors = await page.locator('[class*="error"], .text-red').allTextContents();
    console.log('Validation errors found:', validationErrors);
    
    // Take screenshot of error state
    await page.screenshot({ path: 'test-results/validation-errors.png' });
  });
});