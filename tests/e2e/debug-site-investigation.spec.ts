import { test, expect } from '@playwright/test';

test.describe('Site Investigation', () => {
  test('should investigate current site state and navigation', async ({ page }) => {
    console.log('🔍 Starting site investigation...');
    
    // Navigate to the site
    await page.goto('https://aideas-redbaez.netlify.app');
    await page.waitForLoadState('networkidle');
    console.log('✅ Site loaded');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'debug-initial.png', fullPage: true });
    
    // Get page title and URL
    const title = await page.title();
    const url = page.url();
    console.log(`📄 Page title: ${title}`);
    console.log(`🔗 Current URL: ${url}`);
    
    // Check for main navigation elements
    const navElements = await page.locator('nav, [role="navigation"], header a, .nav, .navigation').all();
    console.log(`🧭 Found ${navElements.length} navigation elements`);
    
    // Look for main page elements
    const pageElements = {
      headings: await page.locator('h1, h2, h3').count(),
      buttons: await page.locator('button').count(),
      links: await page.locator('a').count(),
      inputs: await page.locator('input, textarea').count(),
      forms: await page.locator('form').count(),
    };
    
    console.log('📊 Page elements count:', pageElements);
    
    // Get all button texts to see what's available
    const buttons = await page.locator('button').all();
    const buttonTexts = [];
    for (const button of buttons) {
      const text = await button.textContent();
      if (text?.trim()) {
        buttonTexts.push(text.trim());
      }
    }
    console.log('🔘 Button texts found:', buttonTexts);
    
    // Get all link texts
    const links = await page.locator('a').all();
    const linkTexts = [];
    for (const link of links) {
      const text = await link.textContent();
      if (text?.trim()) {
        linkTexts.push(text.trim());
      }
    }
    console.log('🔗 Link texts found:', linkTexts.slice(0, 10)); // First 10 to avoid clutter
    
    // Get all heading texts
    const headings = await page.locator('h1, h2, h3').all();
    const headingTexts = [];
    for (const heading of headings) {
      const text = await heading.textContent();
      if (text?.trim()) {
        headingTexts.push(text.trim());
      }
    }
    console.log('📝 Heading texts found:', headingTexts);
    
    // Check if we're on a landing page that needs different navigation
    const hasStartButton = buttonTexts.some(text => 
      text.toLowerCase().includes('start') || 
      text.toLowerCase().includes('begin') ||
      text.toLowerCase().includes('create')
    );
    
    const hasBriefElements = headingTexts.some(text => 
      text.toLowerCase().includes('brief')
    ) || buttonTexts.some(text => 
      text.toLowerCase().includes('brief')
    );
    
    console.log(`🎯 Analysis:
    - Has start/create button: ${hasStartButton}
    - Has brief elements: ${hasBriefElements}
    - Looks like landing page: ${!hasBriefElements && hasStartButton}`);
    
    // Try to navigate to the actual app workflow
    if (!hasBriefElements && hasStartButton) {
      console.log('🚀 Attempting to enter the app workflow...');
      
      // Look for start buttons
      const startButton = page.locator('button').filter({ hasText: /start|begin|create/i }).first();
      if (await startButton.isVisible().catch(() => false)) {
        await startButton.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'debug-after-start.png', fullPage: true });
        
        // Check new state
        const newUrl = page.url();
        const newTitle = await page.title();
        console.log(`📄 After start - URL: ${newUrl}, Title: ${newTitle}`);
        
        // Look for brief elements now
        const briefElements = await page.locator('textarea, input').filter({ hasText: /brief|description|prompt/i }).count();
        const generateButtons = await page.locator('button').filter({ hasText: /generate|create/i }).count();
        
        console.log(`📝 After navigation:
        - Brief elements: ${briefElements}
        - Generate buttons: ${generateButtons}`);
      }
    }
    
    // Look specifically for any elements with "territory" or "image" in them
    const territoryElements = await page.locator('*').filter({ hasText: /territory|territories/i }).count();
    const imageElements = await page.locator('*').filter({ hasText: /image|generate.*image/i }).count();
    
    console.log(`🎯 Specific elements:
    - Territory elements: ${territoryElements}
    - Image elements: ${imageElements}`);
    
    // Final screenshot
    await page.screenshot({ path: 'debug-final.png', fullPage: true });
    
    console.log('🎉 Site investigation completed');
    
    // Basic assertion - site should load without errors
    expect(pageElements.headings).toBeGreaterThan(0);
  });
  
  test('should check for specific workflow paths', async ({ page }) => {
    console.log('🛤️ Checking workflow paths...');
    
    await page.goto('https://aideas-redbaez.netlify.app');
    await page.waitForLoadState('networkidle');
    
    // Test different potential routes
    const routes = ['/brief', '/generate', '/workflow', '/create'];
    
    for (const route of routes) {
      try {
        console.log(`🔍 Testing route: ${route}`);
        await page.goto(`https://aideas-redbaez.netlify.app${route}`);
        await page.waitForTimeout(2000);
        
        const status = await page.evaluate(() => {
          return {
            url: window.location.href,
            hasContent: document.body.children.length > 0,
            title: document.title
          };
        });
        
        console.log(`📄 Route ${route}:`, status);
        await page.screenshot({ path: `debug-route-${route.replace('/', '')}.png`, fullPage: true });
        
      } catch (error) {
        console.log(`❌ Route ${route} failed:`, error.message);
      }
    }
    
    console.log('✅ Route testing completed');
  });
});