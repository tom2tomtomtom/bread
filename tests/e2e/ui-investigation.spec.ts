import { test, expect } from '@playwright/test';

test.describe('AIDEAS UI Investigation', () => {
  const baseURL = 'https://aideas-redbaez.netlify.app';

  test('Investigate actual UI state and flow', async ({ page }) => {
    console.log('🔍 Investigating actual UI and user flow...');
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of current state
    await page.screenshot({ path: 'current-ui-state.png', fullPage: true });
    console.log('📸 Screenshot saved as current-ui-state.png');
    
    // Check what's actually visible
    const pageContent = await page.content();
    console.log('📄 Page loaded successfully');
    
    // Look for main content areas
    const mainElements = await page.locator('main, #root > *, [class*="app"], [class*="container"]').all();
    console.log(`🏗️ Main content areas found: ${mainElements.length}`);
    
    // Check for any visible text content
    const bodyText = await page.locator('body').textContent();
    console.log(`📝 Page contains text: ${bodyText ? bodyText.substring(0, 200) + '...' : 'No text found'}`);
    
    // Look for form elements specifically
    const inputs = await page.locator('input, textarea, select').all();
    console.log(`⌨️ Form inputs found: ${inputs.length}`);
    
    for (let i = 0; i < Math.min(inputs.length, 5); i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type') || 'unknown';
      const placeholder = await input.getAttribute('placeholder') || 'no placeholder';
      const id = await input.getAttribute('id') || 'no id';
      console.log(`  Input ${i+1}: type="${type}", placeholder="${placeholder}", id="${id}"`);
    }
    
    // Look for buttons and their text
    const buttons = await page.locator('button').all();
    console.log(`🔘 Buttons found: ${buttons.length}`);
    
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const visible = await button.isVisible();
      console.log(`  Button ${i+1}: "${text}" (visible: ${visible})`);
    }
    
    // Check for navigation or menu items
    const navItems = await page.locator('nav a, [role="navigation"] a, header a, .nav a').all();
    console.log(`🧭 Navigation items found: ${navItems.length}`);
    
    for (let i = 0; i < Math.min(navItems.length, 10); i++) {
      const navItem = navItems[i];
      const text = await navItem.textContent();
      const href = await navItem.getAttribute('href');
      console.log(`  Nav item ${i+1}: "${text}" -> ${href}`);
    }
    
    // Check for error states or loading states
    const errors = await page.locator('.error, [class*="error"], .alert, [class*="alert"]').all();
    console.log(`❌ Error elements found: ${errors.length}`);
    
    const loading = await page.locator('.loading, [class*="loading"], .spinner, [class*="spinner"]').all();
    console.log(`⏳ Loading elements found: ${loading.length}`);
    
    // Check for any modals or overlays
    const modals = await page.locator('.modal, [class*="modal"], .overlay, [class*="overlay"], [role="dialog"]').all();
    console.log(`📦 Modals/overlays found: ${modals.length}`);
    
    // Check console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    console.log(`🔴 Console errors: ${consoleErrors.length}`);
    consoleErrors.forEach(error => console.log(`  - ${error}`));
    
    // Check network requests
    const responses: string[] = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        responses.push(`${response.status()} ${response.url()}`);
      }
    });
    
    await page.waitForTimeout(1000);
    console.log(`🌐 Network errors: ${responses.length}`);
    responses.forEach(response => console.log(`  - ${response}`));
    
    console.log('🔍 UI investigation complete');
  });

  test('Try to find and use the actual interface', async ({ page }) => {
    console.log('🎯 Attempting to interact with the actual interface...');
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Try to find any input that looks like a brief input
    const possibleBriefInputs = await page.locator(`
      textarea,
      input[type="text"],
      input[placeholder*="brief"],
      input[placeholder*="campaign"],
      input[placeholder*="describe"],
      [data-testid*="brief"],
      [class*="brief"]
    `).all();
    
    console.log(`📝 Possible brief inputs found: ${possibleBriefInputs.length}`);
    
    if (possibleBriefInputs.length > 0) {
      const input = possibleBriefInputs[0];
      try {
        await input.fill('Test campaign for eco-friendly products targeting young professionals');
        console.log('✅ Successfully filled brief input');
        
        // Look for submit/generate buttons near the input
        const submitButtons = await page.locator(`
          button:has-text("Generate"),
          button:has-text("Create"),
          button:has-text("Submit"),
          button:has-text("Start"),
          input[type="submit"],
          [role="button"]
        `).all();
        
        console.log(`🔘 Submit buttons found: ${submitButtons.length}`);
        
        if (submitButtons.length > 0) {
          await submitButtons[0].click();
          console.log('🚀 Clicked submit button');
          
          // Wait and check for results
          await page.waitForTimeout(5000);
          
          const results = await page.locator(`
            .result, .results, .output, .territory, .headline, .campaign,
            [class*="result"], [class*="output"], [class*="territory"]
          `).all();
          
          console.log(`📊 Results found: ${results.length}`);
          
          if (results.length === 0) {
            console.log('⚠️ No results appeared - checking for errors or auth requirements');
            
            // Check for auth/login prompts
            const authElements = await page.locator(`
              text=login, text=sign, text=auth, text=account,
              .login, .auth, .signin, .signup,
              [class*="login"], [class*="auth"]
            `).all();
            
            console.log(`🔐 Auth elements found: ${authElements.length}`);
          }
        }
      } catch (error) {
        console.log(`❌ Error interacting with input: ${error}`);
      }
    }
    
    console.log('🎯 Interface interaction attempt complete');
  });
});