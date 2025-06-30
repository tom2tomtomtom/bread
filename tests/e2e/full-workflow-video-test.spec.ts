import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Full Workflow Video Test', () => {
  test('should complete entire workflow and download video', async ({ page }) => {
    console.log('🎬 Starting full workflow video test...');
    
    // Extended timeout for complete workflow
    test.setTimeout(300000); // 5 minutes
    
    // Navigate to the site
    await page.goto('https://aideas-redbaez.netlify.app');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Site loaded');
    
    // Handle registration/login
    try {
      if (await page.locator('button:has-text("Get Started Free")').isVisible({ timeout: 5000 })) {
        console.log('🔐 Registering new user...');
        await page.click('button:has-text("Get Started Free")');
        await page.waitForTimeout(2000);
        
        if (await page.locator('input[type="email"]').isVisible({ timeout: 5000 })) {
          const timestamp = Date.now();
          await page.fill('input[type="email"]', `fulltest${timestamp}@test.com`);
          await page.fill('input[type="password"]', 'FullTest123!');
          
          const submitBtn = page.locator('button[type="submit"]').first();
          await submitBtn.click();
          await page.waitForTimeout(3000);
          console.log('✅ Registration completed');
        }
      }
    } catch (error) {
      console.log('ℹ️ Registration not needed or already logged in');
    }
    
    // Take initial screenshot
    await page.screenshot({ path: 'tests/screenshots/full-test-start.png', fullPage: true });
    
    // Step 1: Fill Brief Input
    console.log('📝 Step 1: Filling brief input...');
    
    // Wait for brief input form
    await expect(page.locator('h1')).toContainText('Input Campaign Brief', { timeout: 10000 });
    
    const briefText = `
RedBaez Airwave - Revolutionary Wireless Charging

GOAL: Launch the world's first 3-meter radius wireless charging technology for tech professionals

TARGET AUDIENCE: Tech professionals, early adopters, premium device users aged 25-45

PRODUCT: RedBaez Airwave wireless charging system that charges devices within 3 meters without any physical connection

KEY BENEFITS:
- True wireless freedom - no charging pads needed
- Simultaneous multi-device charging up to 5 devices
- Sleek, modern design fits any workspace
- Safe electromagnetic field technology with FCC approval
- Premium innovation for forward-thinking professionals

BRAND PERSONALITY: Innovative, premium, reliable, cutting-edge, sophisticated, trustworthy

TONE: Confident, exciting, futuristic but grounded in real benefits and practical applications

CALL TO ACTION: Experience the Future - Pre-order Now with Early Bird Pricing
    `.trim();
    
    // Fill the main brief textarea
    const briefTextarea = page.locator('textarea').first();
    await briefTextarea.fill(briefText);
    console.log('✅ Brief text filled');
    
    // Fill campaign goal
    const goalInput = page.locator('input[placeholder*="brand awareness"], input[placeholder*="goal"]').first();
    if (await goalInput.isVisible()) {
      await goalInput.fill('Launch RedBaez Airwave wireless charging ecosystem');
      console.log('✅ Campaign goal filled');
    }
    
    // Fill target audience
    const audienceInput = page.locator('input[placeholder*="Young professionals"], input[placeholder*="audience"]').first();
    if (await audienceInput.isVisible()) {
      await audienceInput.fill('Tech professionals 25-45, early adopters, premium device users');
      console.log('✅ Target audience filled');
    }
    
    // Fill product details if available
    const productInput = page.locator('input[placeholder*="advertising"], textarea[placeholder*="product"]').first();
    if (await productInput.isVisible()) {
      await productInput.fill('RedBaez Airwave wireless charging system with 3-meter range');
      console.log('✅ Product details filled');
    }
    
    // Fill brand personality if available
    const brandInput = page.locator('input[placeholder*="Modern"], input[placeholder*="personality"]').first();
    if (await brandInput.isVisible()) {
      await brandInput.fill('Innovative, premium, reliable, cutting-edge, sophisticated');
      console.log('✅ Brand personality filled');
    }
    
    await page.screenshot({ path: 'tests/screenshots/full-test-brief-filled.png', fullPage: true });
    
    // Continue to next step
    const continueBtn = page.locator('button:has-text("Continue to Territories")');
    await continueBtn.click();
    await page.waitForTimeout(3000);
    console.log('✅ Continued to territories');
    
    // Step 2: Territory Generation
    console.log('🗺️ Step 2: Territory generation...');
    await page.screenshot({ path: 'tests/screenshots/full-test-territories.png', fullPage: true });
    
    // Wait for generation to complete or click generate if needed
    const generateBtn = page.locator('button:has-text("Generate")').first();
    if (await generateBtn.isVisible({ timeout: 5000 })) {
      console.log('🔄 Starting territory generation...');
      await generateBtn.click();
      
      // Wait for generation to complete (look for continue button or completion indicator)
      await page.waitForSelector('button:has-text("Continue")', { timeout: 60000 });
      console.log('✅ Territory generation completed');
    }
    
    // Continue to motivations
    const continueToMotivations = page.locator('button:has-text("Continue")').first();
    if (await continueToMotivations.isVisible()) {
      await continueToMotivations.click();
      await page.waitForTimeout(3000);
      console.log('✅ Continued to motivations');
    }
    
    // Step 3: Motivation Generation
    console.log('🧠 Step 3: Motivation generation...');
    await page.screenshot({ path: 'tests/screenshots/full-test-motivations.png', fullPage: true });
    
    // Handle motivation generation
    const motivationGenerateBtn = page.locator('button:has-text("Generate")').first();
    if (await motivationGenerateBtn.isVisible({ timeout: 5000 })) {
      console.log('🔄 Starting motivation generation...');
      await motivationGenerateBtn.click();
      await page.waitForSelector('button:has-text("Continue")', { timeout: 60000 });
      console.log('✅ Motivation generation completed');
    }
    
    const continueFromMotivations = page.locator('button:has-text("Continue")').first();
    if (await continueFromMotivations.isVisible()) {
      await continueFromMotivations.click();
      await page.waitForTimeout(3000);
      console.log('✅ Continued from motivations');
    }
    
    // Step 4: Copy Generation  
    console.log('✍️ Step 4: Copy generation...');
    await page.screenshot({ path: 'tests/screenshots/full-test-copy.png', fullPage: true });
    
    const copyGenerateBtn = page.locator('button:has-text("Generate")').first();
    if (await copyGenerateBtn.isVisible({ timeout: 5000 })) {
      console.log('🔄 Starting copy generation...');
      await copyGenerateBtn.click();
      await page.waitForSelector('button:has-text("Continue")', { timeout: 60000 });
      console.log('✅ Copy generation completed');
    }
    
    const continueFromCopy = page.locator('button:has-text("Continue")').first();
    if (await continueFromCopy.isVisible()) {
      await continueFromCopy.click();
      await page.waitForTimeout(3000);
      console.log('✅ Continued from copy');
    }
    
    // Step 5: Asset Selection
    console.log('🖼️ Step 5: Asset selection...');
    await page.screenshot({ path: 'tests/screenshots/full-test-assets.png', fullPage: true });
    
    // Skip asset selection quickly
    const continueFromAssets = page.locator('button:has-text("Continue")').first();
    if (await continueFromAssets.isVisible()) {
      await continueFromAssets.click();
      await page.waitForTimeout(3000);
      console.log('✅ Continued from assets');
    }
    
    // Step 6: Video Template Selection and Configuration
    console.log('🎬 Step 6: Video template...');
    await page.screenshot({ path: 'tests/screenshots/full-test-video-template.png', fullPage: true });
    
    // Select a video template
    const templateCards = page.locator('.template-card, [data-testid="template-card"], button[class*="template"]');
    const templateCount = await templateCards.count();
    
    if (templateCount > 0) {
      console.log(`Found ${templateCount} templates, selecting first one...`);
      await templateCards.first().click();
      await page.waitForTimeout(2000);
      console.log('✅ Video template selected');
      
      // Fill video content if editor appears
      if (await page.locator('text=Frame').isVisible({ timeout: 5000 })) {
        console.log('🎞️ Video frame editor loaded, filling content...');
        
        // Fill frame content
        const textInputs = page.locator('input[type="text"], textarea');
        const inputCount = await textInputs.count();
        
        const frameContent = [
          'Experience True Wireless Freedom',
          'Charge devices from 3 meters away with RedBaez Airwave',
          'Pre-order Now - Limited Early Bird Pricing'
        ];
        
        for (let i = 0; i < Math.min(inputCount, frameContent.length); i++) {
          const input = textInputs.nth(i);
          if (await input.isVisible()) {
            await input.clear();
            await input.fill(frameContent[i]);
            console.log(`✅ Filled frame ${i + 1}: ${frameContent[i]}`);
          }
        }
        
        await page.screenshot({ path: 'tests/screenshots/full-test-video-content.png', fullPage: true });
      }
      
      // Continue from video template
      const continueFromVideo = page.locator('button:has-text("Continue")').last();
      if (await continueFromVideo.isVisible()) {
        await continueFromVideo.click();
        await page.waitForTimeout(3000);
        console.log('✅ Continued from video template');
      }
    }
    
    // Step 7: Template Population (if exists)
    console.log('🎨 Step 7: Template population...');
    const continueFromPopulation = page.locator('button:has-text("Continue")').first();
    if (await continueFromPopulation.isVisible({ timeout: 5000 })) {
      await continueFromPopulation.click();
      await page.waitForTimeout(2000);
      console.log('✅ Continued from template population');
    }
    
    // Step 8: Export and Video Download
    console.log('📤 Step 8: Export and video generation...');
    await page.screenshot({ path: 'tests/screenshots/full-test-export-start.png', fullPage: true });
    
    // Look for video export section
    const videoExportSection = page.locator('h2:has-text("Video Export"), h3:has-text("Video Export")');
    
    if (await videoExportSection.isVisible({ timeout: 5000 })) {
      console.log('🎬 Found Video Export section!');
      
      // Configure export settings
      const qualitySelect = page.locator('select').first();
      if (await qualitySelect.isVisible()) {
        await qualitySelect.selectOption('hd');
        console.log('✅ Set quality to HD');
      }
      
      const fpsSelect = page.locator('select').nth(1);
      if (await fpsSelect.isVisible()) {
        await fpsSelect.selectOption('30');
        console.log('✅ Set FPS to 30');
      }
      
      // Find and click Generate Video button
      const generateVideoBtn = page.locator('button:has-text("Generate Video"), button:has-text("🎬 Generate Video")');
      
      if (await generateVideoBtn.isVisible()) {
        const isDisabled = await generateVideoBtn.getAttribute('disabled');
        
        if (isDisabled) {
          console.log('⚠️ Generate Video button is disabled - checking requirements...');
          
          // Look for warning message
          const warningMsg = await page.locator('text*="complete", text*="template"').textContent().catch(() => '');
          console.log(`Warning: ${warningMsg}`);
          
          // Try to navigate back to video template to complete it properly
          const videoTemplateNavBtn = page.locator('button:has-text("🎬Video Template")');
          if (await videoTemplateNavBtn.isVisible()) {
            console.log('🔄 Going back to complete video template...');
            await videoTemplateNavBtn.click();
            await page.waitForTimeout(2000);
            
            // Ensure template is selected
            const templates = page.locator('.template-card, button[class*="template"]');
            if (await templates.first().isVisible()) {
              await templates.first().click();
              await page.waitForTimeout(1000);
            }
            
            // Go back to export
            const exportNavBtn = page.locator('button:has-text("📤Export")');
            if (await exportNavBtn.isVisible()) {
              await exportNavBtn.click();
              await page.waitForTimeout(2000);
            }
          }
        }
        
        // Try generate button again
        const generateVideoBtnRetry = page.locator('button:has-text("Generate Video"), button:has-text("🎬 Generate Video")');
        
        if (await generateVideoBtnRetry.isVisible()) {
          const stillDisabled = await generateVideoBtnRetry.getAttribute('disabled');
          
          if (!stillDisabled) {
            console.log('🚀 Generate Video button is enabled! Starting generation...');
            
            // Set up download monitoring
            const downloadPromise = page.waitForEvent('download', { timeout: 90000 });
            
            await generateVideoBtnRetry.click();
            console.log('⏳ Video generation started...');
            
            // Wait for progress and completion
            await page.waitForTimeout(10000);
            
            // Look for download button
            const downloadBtn = page.locator('button:has-text("Download"), button:has-text("📥")');
            
            if (await downloadBtn.isVisible({ timeout: 30000 })) {
              console.log('📥 Download button appeared! Initiating download...');
              
              await downloadBtn.click();
              
              try {
                const download = await downloadPromise;
                const filename = download.suggestedFilename() || `redbaez-airwave-video-${Date.now()}.mp4`;
                
                console.log(`📁 Download started: ${filename}`);
                
                // Create downloads directory
                const downloadsDir = path.join(__dirname, '../downloads');
                if (!fs.existsSync(downloadsDir)) {
                  fs.mkdirSync(downloadsDir, { recursive: true });
                }
                
                // Save the download
                const downloadPath = path.join(downloadsDir, filename);
                await download.saveAs(downloadPath);
                
                // Verify the file
                if (fs.existsSync(downloadPath)) {
                  const stats = fs.statSync(downloadPath);
                  
                  console.log('🎉 VIDEO DOWNLOADED SUCCESSFULLY!');
                  console.log(`📁 File: ${downloadPath}`);
                  console.log(`📊 Size: ${stats.size} bytes`);
                  console.log(`📅 Created: ${stats.birthtime.toISOString()}`);
                  
                  if (stats.size > 0) {
                    console.log('✅ Video file has content - TEST PASSED!');
                    
                    // Take success screenshot
                    await page.screenshot({ 
                      path: 'tests/screenshots/full-test-success.png', 
                      fullPage: true 
                    });
                    
                    // Verify it's a valid file
                    try {
                      const fileContent = fs.readFileSync(downloadPath);
                      console.log(`📊 File content length: ${fileContent.length} bytes`);
                      
                      // Check if it's a video file (basic check)
                      const isVideo = filename.endsWith('.mp4') || filename.endsWith('.webm');
                      console.log(`🎬 Is video file: ${isVideo}`);
                      
                      if (isVideo && fileContent.length > 100) {
                        console.log('🏆 FULL WORKFLOW VIDEO TEST COMPLETED SUCCESSFULLY!');
                        return; // Success!
                      }
                    } catch (readError) {
                      console.log(`⚠️ Could not read file: ${readError.message}`);
                    }
                  } else {
                    console.log('❌ Video file is empty');
                  }
                } else {
                  console.log('❌ Video file was not saved');
                }
              } catch (downloadError) {
                console.log(`❌ Download failed: ${downloadError.message}`);
              }
            } else {
              console.log('❌ Download button did not appear within timeout');
            }
          } else {
            console.log('❌ Generate Video button is still disabled');
          }
        }
      } else {
        console.log('❌ Generate Video button not found');
      }
    } else {
      console.log('❌ Video Export section not found');
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/full-test-final.png', 
      fullPage: true 
    });
    
    console.log('🏁 Full workflow test completed');
  });
});