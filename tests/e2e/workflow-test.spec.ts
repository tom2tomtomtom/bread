import { test, expect } from '@playwright/test';

test.describe('Complete Workflow: Brief to Video Template', () => {
  test('should complete full workflow from brief input to video template selection', async ({ page }) => {
    console.log('🚀 Starting complete workflow test...');
    
    // Navigate to the site
    await page.goto('https://aideas-redbaez.netlify.app');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we need to sign in first
    const getStartedButton = page.locator('button:has-text("Get Started Free")');
    if (await getStartedButton.isVisible()) {
      console.log('📝 Need to register/login first...');
      await getStartedButton.click();
      
      // Fill registration form (assuming we need to register)
      await page.fill('input[type="email"]', 'test@redbaez.com');
      await page.fill('input[type="password"]', 'TestPassword123!');
      
      // Click register or login button
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Wait for redirect to workflow
      await page.waitForLoadState('networkidle');
    }
    
    // Step 1: Brief Input (should be the first step now)
    console.log('📝 Step 1: Inputting campaign brief...');
    
    await expect(page.locator('h1:has-text("Input Campaign Brief")')).toBeVisible();
    
    const briefText = `
RedBaez Airwave - Revolutionary Wireless Charging Campaign

CAMPAIGN GOAL: Launch RedBaez Airwave, the world's first truly wireless charging ecosystem that charges devices within a 3-meter radius without any physical connection.

TARGET AUDIENCE: Tech-savvy professionals aged 25-45 who value innovation, convenience, and cutting-edge technology. Early adopters who are willing to invest in premium tech solutions.

PRODUCT DETAILS: RedBaez Airwave is a revolutionary wireless charging system that creates an invisible charging field, allowing smartphones, tablets, and other devices to charge simply by being in the same room. No charging pads, no cables, no contact required.

KEY BENEFITS:
- True wireless freedom - charge anywhere within 3 meters
- Simultaneous charging of multiple devices
- No physical wear on device ports
- Sleek, modern design that complements any space
- Energy-efficient and safe electromagnetic field

BRAND PERSONALITY: Innovative, premium, reliable, forward-thinking, sophisticated yet approachable.

TONE & MOOD: Confident, exciting, premium, slightly futuristic but grounded in real benefits.

CALL TO ACTION: "Experience the Future" - Pre-order now for early bird pricing.

COMPETITIVE CONTEXT: Traditional wireless charging requires exact placement on pads. We're the only solution offering true spatial freedom.
    `.trim();
    
    // Fill in the brief text
    await page.fill('textarea[placeholder*="brief"]', briefText);
    
    // Fill in parsed fields using exact placeholder text
    await page.fill('input[placeholder="e.g., Increase brand awareness, Drive sales..."]', 'Launch RedBaez Airwave wireless charging ecosystem');
    await page.fill('input[placeholder="e.g., Young professionals aged 25-35..."]', 'Tech-savvy professionals aged 25-45, early adopters');
    await page.fill('input[placeholder="What are you advertising?"]', 'Revolutionary 3-meter radius wireless charging system');
    await page.fill('input[placeholder="e.g., Modern, trustworthy, innovative..."]', 'Innovative, premium, reliable, forward-thinking');
    
    // Continue to next step
    await page.click('button:has-text("Continue to Territories")');
    
    // Step 2: Territory Generation
    console.log('🗺️ Step 2: Generating territories...');
    
    await expect(page.locator('h1:has-text("Generate Creative Territories")')).toBeVisible();
    
    // Wait for generation to complete (this might take a while)
    await page.waitForSelector('button:has-text("Continue to Motivations")', { timeout: 60000 });
    await page.click('button:has-text("Continue to Motivations")');
    
    // Step 3: Motivation Generation  
    console.log('🧠 Step 3: Generating motivations...');
    
    await expect(page.locator('text=motivations')).toBeVisible();
    
    // Wait for motivations and continue
    await page.waitForTimeout(3000);
    const continueMotivationButton = page.locator('button:has-text("Continue")').first();
    if (await continueMotivationButton.isVisible()) {
      await continueMotivationButton.click();
    }
    
    // Step 4: Copy Generation
    console.log('✍️ Step 4: Generating copy...');
    
    await expect(page.locator('text=copy')).toBeVisible();
    
    // Wait for copy generation and continue
    await page.waitForTimeout(5000);
    const continueCopyButton = page.locator('button:has-text("Continue")').first();
    if (await continueCopyButton.isVisible()) {
      await continueCopyButton.click();
    }
    
    // Step 5: Asset Selection (new step before video templates)
    console.log('🖼️ Step 5: Selecting assets...');
    
    await expect(page.locator('h1:has-text("Select Assets")')).toBeVisible();
    
    // Continue to video templates
    await page.click('button:has-text("Continue to Video Template")');
    
    // Step 6: Video Template Selection
    console.log('🎬 Step 6: Selecting video template...');
    
    await expect(page.locator('h2:has-text("Video Content Editor")')).toBeVisible();
    
    // Look for template cards
    const templateCards = page.locator('[data-testid="template-card"], .template-card, button:has(text="Hero Product"), button:has(text="Social Proof")');
    await expect(templateCards.first()).toBeVisible({ timeout: 10000 });
    
    // Click on the first available template
    await templateCards.first().click();
    
    // Should now be in the video frame editor
    await expect(page.locator('text=Frame 1')).toBeVisible();
    await expect(page.locator('text=Hook')).toBeVisible();
    
    console.log('✅ Video template editor loaded successfully!');
    
    // Test frame navigation
    await page.click('button:has-text("Frame 2")');
    await expect(page.locator('text=Value')).toBeVisible();
    
    await page.click('button:has-text("Frame 3")');
    await expect(page.locator('text=Action')).toBeVisible();
    
    // Test asset library integration
    if (await page.locator('button:has-text("Select Copy from Library")').isVisible()) {
      console.log('📚 Testing asset library integration...');
      await page.click('button:has-text("Select Copy from Library")');
      
      // Check if asset library modal opens
      await expect(page.locator('text=Select Copy from Asset Library')).toBeVisible();
      
      // Close modal
      await page.press('body', 'Escape');
    }
    
    // Test image selection
    if (await page.locator('text=Select from Asset Library').isVisible()) {
      console.log('🖼️ Testing image asset selection...');
      await page.locator('text=Select from Asset Library').click();
      
      // Check if image library opens
      await expect(page.locator('text=Select Image from Asset Library')).toBeVisible();
      
      // Close modal
      await page.press('body', 'Escape');
    }
    
    console.log('🎉 Complete workflow test passed! From brief to video template in 6 clean steps.');
    
    // Take a screenshot of the final state
    await page.screenshot({ path: 'tests/screenshots/complete-workflow-final.png', fullPage: true });
  });
  
  test('should show 8-step process on landing page', async ({ page }) => {
    await page.goto('https://aideas-redbaez.netlify.app');
    
    // Check that landing page shows 8-step process
    await expect(page.locator('h2:has-text("Complete 8-Step Ad Creation Process")')).toBeVisible();
    
    // Verify the steps are correctly labeled
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
    
    console.log('✅ Landing page correctly shows 8-step simplified process');
  });
});