import { test, expect } from '@playwright/test';

test('Simple video download test', async ({ page }) => {
  // Set longer timeout
  test.setTimeout(120000);
  
  console.log('🎬 Starting simple video download test...');
  
  // Go to site
  await page.goto('https://aideas-redbaez.netlify.app');
  await page.waitForLoadState('networkidle');
  
  // Quick registration
  if (await page.locator('text=Get Started Free').isVisible()) {
    await page.click('text=Get Started Free');
    await page.waitForTimeout(1000);
    
    if (await page.locator('input[type="email"]').isVisible()) {
      await page.fill('input[type="email"]', 'simpletest@test.com');
      await page.fill('input[type="password"]', 'Test123!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
  }
  
  console.log('✅ Logged in, looking for workflow...');
  
  // Take screenshot to see current state
  await page.screenshot({ path: 'simple-test-start.png', fullPage: true });
  
  // Try to click on Export directly from workflow nav
  const exportBtn = page.locator('text=📤Export & Download');
  if (await exportBtn.isVisible()) {
    console.log('📤 Found Export button, clicking...');
    await exportBtn.click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'simple-test-export.png', fullPage: true });
    
    // Look for video export
    const videoSection = page.locator('text=Video Export');
    if (await videoSection.isVisible()) {
      console.log('🎬 Found Video Export section!');
      
      const generateBtn = page.locator('text=Generate Video');
      if (await generateBtn.isVisible()) {
        console.log('🎯 Found Generate Video button!');
        
        // Check if enabled
        const disabled = await generateBtn.getAttribute('disabled');
        console.log(`Button disabled: ${disabled}`);
        
        if (!disabled) {
          console.log('🚀 Clicking Generate Video...');
          
          // Set up download listener
          const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
          
          await generateBtn.click();
          await page.waitForTimeout(5000);
          
          // Look for download button
          const downloadBtn = page.locator('text=Download');
          if (await downloadBtn.isVisible()) {
            console.log('📥 Clicking Download...');
            await downloadBtn.click();
            
            try {
              const download = await downloadPromise;
              console.log(`🎉 VIDEO DOWNLOADED: ${download.suggestedFilename()}`);
              
              // Save it
              await download.saveAs(`./test-video-${Date.now()}.mp4`);
              console.log('💾 Video saved successfully!');
              
            } catch (e) {
              console.log(`❌ Download failed: ${e.message}`);
            }
          }
        } else {
          console.log('⚠️ Generate button is disabled');
        }
      }
    }
  }
  
  await page.screenshot({ path: 'simple-test-final.png', fullPage: true });
  console.log('🏁 Simple test completed');
});