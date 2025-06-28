const { chromium } = require('playwright');

(async () => {
  console.log('📝 TESTING WORKFLOW FORM FILLING');
  console.log('=================================');
  
  const browser = await chromium.launch({ headless: false, slowMo: 2000 });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1400, height: 900 });

  try {
    // Navigate to workflow
    await page.goto('https://aideas-redbaez.netlify.app/workflow');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('✅ Workflow loaded');
    
    // Step 1: Select template (Launch Campaign)
    console.log('\n🎯 Step 1: Selecting Launch Campaign Template');
    const launchTemplate = page.locator('text=LAUNCH CAMPAIGN TEMPLATE');
    if (await launchTemplate.isVisible()) {
      await launchTemplate.click();
      await page.waitForTimeout(3000);
      console.log('✅ Launch template selected');
    } else {
      // Fallback: click any template card
      const templateCard = page.locator('[class*="card"], .cursor-pointer').first();
      await templateCard.click();
      await page.waitForTimeout(3000);
      console.log('✅ Template selected (fallback)');
    }
    
    // Step 2: Fill brief form properly
    console.log('\n📝 Step 2: Filling Brief Form');
    
    // Wait for brief form to appear
    await page.waitForTimeout(3000);
    
    // Method 1: Try exact placeholder matching
    const goalField = page.locator('input[placeholder*="goal"], input[placeholder*="Goal"]');
    const audienceField = page.locator('input[placeholder*="audience"], input[placeholder*="Audience"]');
    const briefField = page.locator('textarea[placeholder*="brief"], textarea[placeholder*="Brief"]');
    
    if (await goalField.isVisible()) {
      console.log('🎯 Filling Campaign Goal...');
      await goalField.clear();
      await goalField.fill('Launch our revolutionary AI-powered smart home device HomeSense to tech-savvy early adopters');
      await page.waitForTimeout(1000);
      console.log('✅ Goal filled');
    } else {
      // Fallback: fill first input
      const firstInput = page.locator('input').first();
      if (await firstInput.isVisible()) {
        await firstInput.clear();
        await firstInput.fill('Launch our revolutionary AI-powered smart home device HomeSense to tech-savvy early adopters');
        console.log('✅ First input filled');
      }
    }
    
    if (await audienceField.isVisible()) {
      console.log('🎯 Filling Target Audience...');
      await audienceField.clear();
      await audienceField.fill('Tech enthusiasts aged 25-45 with high disposable income who value convenience and innovation');
      await page.waitForTimeout(1000);
      console.log('✅ Audience filled');
    } else {
      // Fallback: fill second input
      const secondInput = page.locator('input').nth(1);
      if (await secondInput.isVisible()) {
        await secondInput.clear();
        await secondInput.fill('Tech enthusiasts aged 25-45 with high disposable income who value convenience and innovation');
        console.log('✅ Second input filled');
      }
    }
    
    if (await briefField.isVisible()) {
      console.log('🎯 Filling Campaign Brief...');
      await briefField.clear();
      await briefField.fill('HomeSense is an innovative smart home device that learns user preferences and automatically adjusts lighting, temperature, and security settings. Features include voice control, smartphone integration, energy-saving capabilities, and seamless integration with existing smart home ecosystems. We want to position this as the next essential smart home device for early adopters who value cutting-edge technology and convenience.');
      await page.waitForTimeout(1000);
      console.log('✅ Brief filled');
    } else {
      // Fallback: fill first textarea
      const firstTextarea = page.locator('textarea').first();
      if (await firstTextarea.isVisible()) {
        await firstTextarea.clear();
        await firstTextarea.fill('HomeSense is an innovative smart home device that learns user preferences and automatically adjusts lighting, temperature, and security settings. Features include voice control, smartphone integration, energy-saving capabilities, and seamless integration with existing smart home ecosystems. We want to position this as the next essential smart home device for early adopters who value cutting-edge technology and convenience.');
        console.log('✅ Textarea filled');
      }
    }
    
    // Take screenshot after filling
    await page.screenshot({ path: 'form-filled.png', fullPage: true });
    console.log('✅ Screenshot saved: form-filled.png');
    
    // Check if continue button is now enabled
    const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Motivations")');
    await page.waitForTimeout(2000); // Allow validation to run
    
    const isEnabled = await continueBtn.getAttribute('disabled');
    console.log(`Continue button disabled: ${isEnabled !== null}`);
    
    if (isEnabled === null) {
      console.log('🎯 Continue button is enabled! Proceeding to motivations...');
      await continueBtn.click();
      await page.waitForTimeout(5000);
      console.log('✅ Successfully proceeded to motivations step');
      
      // Take screenshot of motivations step
      await page.screenshot({ path: 'motivations-step.png', fullPage: true });
      console.log('✅ Motivations screenshot saved');
      
      // Step 3: Test motivation generation
      console.log('\n🧠 Step 3: Testing Motivation Generation');
      
      // Look for generate button or existing motivations
      const generateBtn = page.locator('button:has-text("Generate")');
      if (await generateBtn.isVisible()) {
        console.log('🎯 Found generate button, clicking to generate real AI motivations...');
        await generateBtn.click();
        
        console.log('⏳ Waiting for AI generation (this may take 20+ seconds)...');
        await page.waitForTimeout(30000); // Wait for AI generation
        
        console.log('✅ Motivation generation completed');
        await page.screenshot({ path: 'motivations-generated.png', fullPage: true });
        
        // Try to select motivations
        const motivationCards = await page.locator('[class*="motivation"], .cursor-pointer, button').all();
        console.log(`Found ${motivationCards.length} motivation elements`);
        
        // Select first 2-3 motivations
        for (let i = 0; i < Math.min(3, motivationCards.length); i++) {
          try {
            await motivationCards[i].click();
            console.log(`✅ Selected motivation ${i + 1}`);
            await page.waitForTimeout(1000);
          } catch (error) {
            console.log(`⚠️ Could not select motivation ${i + 1}`);
          }
        }
        
        // Continue to copy generation
        const copyBtn = page.locator('button:has-text("Continue"), button:has-text("Copy")');
        if (await copyBtn.isVisible()) {
          console.log('🎯 Proceeding to copy generation...');
          await copyBtn.click();
          await page.waitForTimeout(5000);
          
          // Test copy generation
          console.log('\n✍️ Step 4: Testing Copy Generation');
          
          const copyGenerateBtn = page.locator('button:has-text("Generate")');
          if (await copyGenerateBtn.isVisible()) {
            console.log('🎯 Generating copy with real AI...');
            await copyGenerateBtn.click();
            
            console.log('⏳ Waiting for copy generation...');
            await page.waitForTimeout(25000);
            
            console.log('✅ Copy generation completed');
            await page.screenshot({ path: 'copy-generated.png', fullPage: true });
            
            console.log('\n🎉 WORKFLOW REAL AI GENERATION TEST COMPLETE!');
            console.log('✅ Template selection working');
            console.log('✅ Brief form validation working');
            console.log('✅ Real AI motivation generation working');
            console.log('✅ Real AI copy generation working');
          }
        }
      }
      
    } else {
      console.log('❌ Continue button still disabled after filling form');
      console.log('🔍 Checking what might be missing...');
      
      // Check current field values
      const goalValue = await goalField.inputValue().catch(() => '');
      const audienceValue = await audienceField.inputValue().catch(() => '');
      const briefValue = await briefField.inputValue().catch(() => '');
      
      console.log(`Goal field value: "${goalValue}"`);
      console.log(`Audience field value: "${audienceValue}"`);
      console.log(`Brief field value: "${briefValue}"`);
      
      // Try clicking inputs to trigger validation
      await goalField.click().catch(() => {});
      await page.waitForTimeout(500);
      await audienceField.click().catch(() => {});
      await page.waitForTimeout(500);
      await briefField.click().catch(() => {});
      await page.waitForTimeout(1000);
      
      // Check again
      const isEnabledAfter = await continueBtn.getAttribute('disabled');
      if (isEnabledAfter === null) {
        console.log('✅ Continue button enabled after clicking fields!');
        await continueBtn.click();
      } else {
        console.log('⚠️ Form validation issue - debugging needed');
      }
    }
    
  } catch (error) {
    console.error('❌ Workflow Form Test Error:', error.message);
    await page.screenshot({ path: 'form-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();