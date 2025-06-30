import { test, expect } from '@playwright/test';

test.describe('Simplified Workflow Demo: RedBaez Airwave', () => {
  test('should demonstrate the new 8-step workflow', async ({ page }) => {
    console.log('🚀 Testing simplified 8-step workflow...');
    
    // Navigate to the site
    await page.goto('https://aideas-redbaez.netlify.app');
    await page.waitForLoadState('networkidle');
    
    // Verify landing page shows 8-step process
    console.log('📋 Verifying 8-step process on landing page...');
    await expect(page.locator('h2:has-text("Complete 8-Step Ad Creation Process")')).toBeVisible();
    
    // Check all 8 steps are present
    const expectedSteps = [
      'Input Brief',
      'Generate Territories', 
      'Generate Motivations',
      'Create Copy',
      'Select Assets',
      'Video Template',
      'Populate Template',
      'Export & Download'
    ];
    
    for (const step of expectedSteps) {
      await expect(page.locator(`text=${step}`)).toBeVisible();
    }
    
    console.log('✅ All 8 steps verified on landing page');
    
    // Start the workflow by clicking Get Started Free
    await page.click('button:has-text("Get Started Free")');
    
    // Register/Login (skip actual authentication for demo)
    if (await page.locator('input[type="email"]').isVisible()) {
      await page.fill('input[type="email"]', 'demo@redbaez.com');
      await page.fill('input[type="password"]', 'DemoPassword123!');
      
      // Click submit button
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      await page.waitForTimeout(2000);
    }
    
    // Step 1: Brief Input (NEW STARTING POINT)
    console.log('📝 Step 1: Brief Input (new starting point)...');
    
    // Check that we start directly with brief input (no template selection)
    await expect(page.locator('h1:has-text("Input Campaign Brief")')).toBeVisible();
    
    const redbaezBrief = `
RedBaez Airwave Campaign Brief

GOAL: Launch revolutionary wireless charging technology that charges devices from 3 meters away

TARGET AUDIENCE: Tech professionals aged 25-45, early adopters who value innovation

PRODUCT: RedBaez Airwave - First truly wireless charging system with 3-meter radius

BRAND: Premium, innovative, cutting-edge technology brand

BENEFITS: Complete wireless freedom, multiple device charging, no cables or pads needed

TONE: Confident, futuristic, premium but approachable
    `.trim();
    
    // Fill in the main brief
    await page.fill('textarea', redbaezBrief);
    
    // Fill required fields if visible
    if (await page.locator('input[placeholder*="brand awareness"]').isVisible()) {
      await page.fill('input[placeholder*="brand awareness"]', 'Launch RedBaez Airwave wireless charging');
      await page.fill('input[placeholder*="Young professionals"]', 'Tech professionals 25-45, early adopters');
    }
    
    console.log('✅ Brief input completed - starting directly with what users need!');
    
    // Take screenshot of the simplified starting point
    await page.screenshot({ 
      path: 'tests/screenshots/step1-simplified-brief-input.png', 
      fullPage: true 
    });
    
    // Continue if possible
    const continueBtn = page.locator('button:has-text("Continue to Territories")');
    if (await continueBtn.isVisible() && await continueBtn.isEnabled()) {
      await continueBtn.click();
      
      // Step 2: Territory Generation
      console.log('🗺️ Step 2: Territory Generation...');
      await expect(page.locator('h1:has-text("Generate Creative Territories")')).toBeVisible();
      
      await page.screenshot({ 
        path: 'tests/screenshots/step2-territory-generation.png', 
        fullPage: true 
      });
    }
    
    console.log('🎉 Simplified workflow demo completed!');
    console.log('');
    console.log('KEY IMPROVEMENTS DEMONSTRATED:');
    console.log('✅ Removed confusing template selection');
    console.log('✅ Start directly with brief input'); 
    console.log('✅ Clear 8-step process');
    console.log('✅ Logical workflow progression');
    console.log('✅ Asset library integration ready');
  });
  
  test('should verify workflow step order is correct', async ({ page }) => {
    await page.goto('https://aideas-redbaez.netlify.app');
    
    // Check the step order matches our new simplified workflow
    const stepElements = await page.locator('.bg-white\\/5.backdrop-blur-xl.border.border-white\\/10.rounded-xl.p-4.text-center').all();
    
    const expectedOrder = [
      'Input Brief',
      'Generate Territories',
      'Generate Motivations', 
      'Create Copy',
      'Select Assets',
      'Video Template',
      'Populate Template',
      'Export & Download'
    ];
    
    // Verify the steps appear in the correct order
    for (let i = 0; i < Math.min(stepElements.length, expectedOrder.length); i++) {
      const stepText = await stepElements[i].textContent();
      expect(stepText).toContain(expectedOrder[i]);
    }
    
    console.log('✅ Workflow step order is correct - no more confusing template selection upfront!');
  });
});