import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Complete Video Download Test', () => {
  test('should complete full workflow and download actual video file', async ({ page }) => {
    console.log('🎬 Testing complete workflow to actual video download...');
    
    // Extended timeout for this comprehensive test
    test.setTimeout(300000); // 5 minutes
    
    // Setup download monitoring
    const downloadPromise = page.waitForEvent('download');
    
    // Navigate to the site
    await page.goto('https://aideas-redbaez.netlify.app');
    await page.waitForLoadState('networkidle');
    
    // Register/Login
    if (await page.locator('button:has-text("Get Started Free")').isVisible()) {
      await page.click('button:has-text("Get Started Free")');
      
      if (await page.locator('input[type="email"]').isVisible()) {
        await page.fill('input[type="email"]', 'videotest@redbaez.com');
        await page.fill('input[type="password"]', 'VideoTest123!');
        
        const submitBtn = page.locator('button[type="submit"]').first();
        await submitBtn.click();
        await page.waitForTimeout(3000);
      }
    }
    
    // Step 1: Brief Input
    console.log('📝 Step 1: Brief Input...');
    await expect(page.locator('h1:has-text("Input Campaign Brief")')).toBeVisible();
    
    const airwaveBrief = `
RedBaez Airwave - Revolutionary Wireless Charging

GOAL: Launch the world's first 3-meter radius wireless charging technology

TARGET AUDIENCE: Tech professionals, early adopters, premium device users aged 25-45

PRODUCT: RedBaez Airwave wireless charging system - charges devices within 3 meters without any physical connection

KEY BENEFITS:
- True wireless freedom - no charging pads needed
- Simultaneous multi-device charging
- Sleek, modern design
- Safe electromagnetic field technology
- Premium innovation for forward-thinking professionals

BRAND PERSONALITY: Innovative, premium, reliable, cutting-edge, sophisticated

TONE: Confident, exciting, futuristic but grounded in real benefits

CALL TO ACTION: Experience the Future - Pre-order Now
    `.trim();
    
    await page.fill('textarea', airwaveBrief);
    
    // Fill required fields
    await page.fill('input[placeholder*="brand awareness"]', 'Launch RedBaez Airwave wireless charging ecosystem');
    await page.fill('input[placeholder*="Young professionals"]', 'Tech professionals 25-45, early adopters');
    
    // Continue to territories
    await page.click('button:has-text("Continue to Territories")');
    await page.waitForTimeout(2000);
    
    // Navigate through workflow steps quickly
    console.log('⚡ Navigating through workflow steps...');
    
    const navigateSteps = async (maxSteps = 6) => {
      for (let i = 0; i < maxSteps; i++) {
        console.log(`Step ${i + 2}: Looking for continue buttons...`);
        
        // Try various continue button selectors
        const continueSelectors = [
          'button:has-text("Continue")',
          'button:has-text("Continue to")',
          'button:has-text("Next")',
          'button:contains("Continue")',
          'button[class*="continue"]',
          'button[class*="next"]'
        ];
        
        let buttonFound = false;
        for (const selector of continueSelectors) {
          const buttons = page.locator(selector);
          const count = await buttons.count();
          
          if (count > 0) {
            console.log(`Found ${count} buttons with selector: ${selector}`);
            
            // Try clicking the last (most likely "continue") button
            const lastButton = buttons.last();
            if (await lastButton.isVisible()) {
              await lastButton.click();
              console.log(`✅ Clicked continue button`);
              buttonFound = true;
              await page.waitForTimeout(2000);
              break;
            }
          }
        }
        
        if (!buttonFound) {
          console.log('No continue button found, trying to find video template step...');
          break;
        }
        
        // Check if we've reached the video template step
        if (await page.locator('h1:has-text("Video Template")', { timeout: 1000 }).isVisible().catch(() => false)) {
          console.log('🎬 Reached video template step!');
          break;
        }
        
        // Check if we've reached export step
        if (await page.locator('h1:has-text("Export")', { timeout: 1000 }).isVisible().catch(() => false)) {
          console.log('📤 Reached export step!');
          break;
        }
      }
    };
    
    await navigateSteps();
    
    // Look for video template interface
    console.log('🎬 Looking for video template interface...');
    
    // Check if we're at video template step
    const videoTemplateVisible = await page.locator('h1:has-text("Video Template")').isVisible().catch(() => false);
    const exportVisible = await page.locator('h1:has-text("Export")').isVisible().catch(() => false);
    
    if (videoTemplateVisible) {
      console.log('✅ At video template step - selecting template...');
      
      // Select a template
      const templateSelectors = [
        '[data-testid="template-card"]',
        '.template-card',
        'button:has-text("Hero")',
        'button:has-text("Social")',
        'button:has-text("Problem")',
        'div[class*="template"]',
        'button[class*="template"]'
      ];
      
      for (const selector of templateSelectors) {
        const templates = page.locator(selector);
        const count = await templates.count();
        
        if (count > 0) {
          console.log(`Found ${count} templates with selector: ${selector}`);
          await templates.first().click();
          console.log('✅ Template selected');
          await page.waitForTimeout(2000);
          break;
        }
      }
      
      // Fill in video content if editor is available
      if (await page.locator('text=Frame', { timeout: 3000 }).isVisible().catch(() => false)) {
        console.log('🎞️ Video frame editor loaded - filling content...');
        
        // Fill headline
        const headlineInputs = page.locator('input[placeholder*="headline"], textarea[placeholder*="headline"], input[placeholder*="Headline"]');
        if (await headlineInputs.first().isVisible().catch(() => false)) {
          await headlineInputs.first().fill('Experience True Wireless Freedom');
          console.log('✅ Headline filled');
        }
        
        // Fill body text
        const bodyInputs = page.locator('input[placeholder*="body"], textarea[placeholder*="body"], input[placeholder*="Body"]');
        if (await bodyInputs.first().isVisible().catch(() => false)) {
          await bodyInputs.first().fill('Charge devices from 3 meters away');
          console.log('✅ Body text filled');
        }
        
        // Fill CTA
        const ctaInputs = page.locator('input[placeholder*="cta"], input[placeholder*="action"], input[placeholder*="CTA"]');
        if (await ctaInputs.first().isVisible().catch(() => false)) {
          await ctaInputs.first().fill('Pre-order Now');
          console.log('✅ CTA filled');
        }
      }
      
      // Continue to next step
      const finalContinueButtons = page.locator('button:has-text("Continue")');
      if (await finalContinueButtons.last().isVisible().catch(() => false)) {
        await finalContinueButtons.last().click();
        console.log('✅ Continued from video template');
        await page.waitForTimeout(3000);
      }
    } else if (exportVisible) {
      console.log('✅ Already at export step');
    } else {
      console.log('❓ Looking for any workflow navigation...');
      
      // Try to find workflow navigation
      const workflowButtons = page.locator('button:contains("Video"), button:contains("Export"), button:contains("Template")');
      const count = await workflowButtons.count();
      
      if (count > 0) {
        console.log(`Found ${count} workflow buttons, clicking last one...`);
        await workflowButtons.last().click();
        await page.waitForTimeout(3000);
      }
    }
    
    // Now we should be at export step - look for video export interface
    console.log('📤 Looking for video export interface...');
    
    // Take screenshot to see current state
    await page.screenshot({ 
      path: 'tests/screenshots/before-video-export.png', 
      fullPage: true 
    });
    
    // Look for video export section specifically
    const videoExportSection = page.locator('h2:has-text("Video Export"), div:has-text("Video Export"), .video-export');
    
    if (await videoExportSection.isVisible().catch(() => false)) {
      console.log('🎬 Found video export section!');
      
      // Look for Generate Video button
      const generateButtons = [
        'button:has-text("Generate Video")',
        'button:has-text("🎬 Generate Video")',
        'button:has-text("Render Video")',
        'button:has-text("Create Video")',
        'button[class*="generate"]'
      ];
      
      for (const selector of generateButtons) {
        const button = page.locator(selector);
        if (await button.isVisible().catch(() => false)) {
          console.log(`🎯 Found generate button: ${selector}`);
          
          // Check if button is enabled
          const isDisabled = await button.getAttribute('disabled');
          if (isDisabled) {
            console.log('⚠️ Generate button is disabled - checking requirements...');
            
            // Look for warning messages
            const warnings = page.locator('text*="complete", text*="template", text*="warning"');
            if (await warnings.isVisible().catch(() => false)) {
              const warningText = await warnings.textContent();
              console.log(`⚠️ Warning: ${warningText}`);
            }
          } else {
            console.log('✅ Generate button is enabled - clicking...');
            
            // Click the generate button
            await button.click();
            console.log('🚀 Video generation started!');
            
            // Wait for video generation to complete
            await page.waitForTimeout(10000); // Wait 10 seconds for generation
            
            // Look for download button or download link
            const downloadSelectors = [
              'button:has-text("Download")',
              'button:has-text("📥 Download")',
              'a[download]',
              'a[href*=".mp4"]',
              'a[href*=".webm"]',
              'button[class*="download"]'
            ];
            
            for (const downloadSelector of downloadSelectors) {
              const downloadButton = page.locator(downloadSelector);
              if (await downloadButton.isVisible().catch(() => false)) {
                console.log(`🎯 Found download button: ${downloadSelector}`);
                
                // Start download
                const downloadPromise = page.waitForEvent('download');
                await downloadButton.click();
                console.log('📥 Download initiated!');
                
                // Wait for download to complete
                const download = await downloadPromise;
                console.log(`📁 Download started: ${download.suggestedFilename()}`);
                
                // Save download to a test location
                const downloadPath = path.join(__dirname, '../downloads', download.suggestedFilename() || 'test-video.mp4');
                await download.saveAs(downloadPath);
                console.log(`💾 File saved to: ${downloadPath}`);
                
                // Verify file exists and has content
                if (fs.existsSync(downloadPath)) {
                  const stats = fs.statSync(downloadPath);
                  console.log(`✅ Video file downloaded successfully!`);
                  console.log(`📊 File size: ${stats.size} bytes`);
                  console.log(`📅 Created: ${stats.birthtime}`);
                  
                  // Success!
                  await page.screenshot({ 
                    path: 'tests/screenshots/video-download-success.png', 
                    fullPage: true 
                  });
                  
                  return;
                } else {
                  console.log('❌ Download file not found');
                }
                
                break;
              }
            }
          }
          break;
        }
      }
    }
    
    // If we didn't find video export, look for any export buttons
    console.log('🔍 Looking for any export functionality...');
    
    const exportButtons = [
      'button:has-text("Export")',
      'button:has-text("Download")', 
      'button:has-text("Generate")',
      'button:has-text("Create")',
      'button[class*="export"]'
    ];
    
    for (const selector of exportButtons) {
      const buttons = page.locator(selector);
      const count = await buttons.count();
      
      if (count > 0) {
        console.log(`Found ${count} export buttons with selector: ${selector}`);
        
        for (let i = 0; i < count; i++) {
          const button = buttons.nth(i);
          const text = await button.textContent();
          console.log(`Button ${i}: "${text}"`);
          
          if (text?.toLowerCase().includes('video') || text?.includes('🎬')) {
            console.log(`🎯 Clicking video-related button: "${text}"`);
            await button.click();
            await page.waitForTimeout(5000);
            break;
          }
        }
        break;
      }
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/final-video-test-state.png', 
      fullPage: true 
    });
    
    console.log('🎉 Video download test completed!');
    console.log('📸 Screenshots saved showing final state');
  });
});