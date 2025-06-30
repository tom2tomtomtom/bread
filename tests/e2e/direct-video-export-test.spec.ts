import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Direct Video Export Test', () => {
  test('should access video export directly and download video', async ({ page }) => {
    console.log('🎬 Testing direct video export...');
    
    // Extended timeout for this test
    test.setTimeout(180000); // 3 minutes
    
    // Navigate to the site
    await page.goto('https://aideas-redbaez.netlify.app');
    await page.waitForLoadState('networkidle');
    
    // Register/Login quickly
    if (await page.locator('button:has-text("Get Started Free")').isVisible()) {
      await page.click('button:has-text("Get Started Free")');
      
      if (await page.locator('input[type="email"]').isVisible()) {
        await page.fill('input[type="email"]', 'quicktest@redbaez.com');
        await page.fill('input[type="password"]', 'QuickTest123!');
        
        const submitBtn = page.locator('button[type="submit"]').first();
        await submitBtn.click();
        await page.waitForTimeout(3000);
      }
    }
    
    // Fill minimal brief to get started
    console.log('📝 Quick brief input...');
    if (await page.locator('textarea').isVisible()) {
      await page.fill('textarea', 'RedBaez Airwave wireless charging - revolutionary technology for tech professionals');
      await page.fill('input[placeholder*="brand awareness"]', 'Launch wireless charging');
      await page.fill('input[placeholder*="Young professionals"]', 'Tech professionals 25-45');
    }
    
    // Use workflow navigation to jump to export
    console.log('🚀 Navigating to export step...');
    
    // Look for workflow navigation
    const workflowNav = page.locator('.workflow-step, [data-step], .step-nav');
    if (await workflowNav.isVisible()) {
      // Look for export or video template steps
      const exportStep = page.locator('button:has-text("Export"), [data-step="export"], .step:has-text("Export")');
      const videoStep = page.locator('button:has-text("Video"), [data-step="video"], .step:has-text("Video")');
      
      if (await exportStep.isVisible()) {
        console.log('📤 Clicking export step...');
        await exportStep.click();
        await page.waitForTimeout(2000);
      } else if (await videoStep.isVisible()) {
        console.log('🎬 Clicking video step...');
        await videoStep.click();
        await page.waitForTimeout(2000);
      }
    }
    
    // If we can't navigate directly, try URL manipulation
    const currentUrl = page.url();
    if (!currentUrl.includes('export') && !currentUrl.includes('video')) {
      console.log('🔗 Trying URL navigation...');
      
      // Try various URLs
      const testUrls = [
        currentUrl.replace(/step=.*/, 'step=export'),
        currentUrl.replace(/step=.*/, 'step=video-template'),
        currentUrl + '?step=export',
        currentUrl + '#export'
      ];
      
      for (const testUrl of testUrls) {
        try {
          await page.goto(testUrl);
          await page.waitForTimeout(2000);
          
          if (await page.locator('h1:has-text("Export"), h2:has-text("Video Export")').isVisible()) {
            console.log(`✅ Successfully navigated via URL: ${testUrl}`);
            break;
          }
        } catch (e) {
          console.log(`❌ URL failed: ${testUrl}`);
        }
      }
    }
    
    // Look for video template selection first
    console.log('🎬 Looking for video template...');
    
    // Check if we need to select a video template first
    if (await page.locator('h1:has-text("Video Template"), .template-selector').isVisible()) {
      console.log('✅ Found video template selector');
      
      // Select any available template
      const templates = page.locator('.template-card, [data-testid="template-card"], button[class*="template"]');
      const templateCount = await templates.count();
      
      if (templateCount > 0) {
        console.log(`Found ${templateCount} templates, selecting first one...`);
        await templates.first().click();
        await page.waitForTimeout(2000);
        
        // Continue from template to export
        const continueBtn = page.locator('button:has-text("Continue")').last();
        if (await continueBtn.isVisible()) {
          await continueBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }
    
    // Now look for video export interface
    console.log('📤 Looking for video export interface...');
    
    // Take screenshot to see current state
    await page.screenshot({ 
      path: 'tests/screenshots/direct-export-state.png', 
      fullPage: true 
    });
    
    // Look for video export section
    const videoExportHeading = page.locator('h2:has-text("Video Export"), h3:has-text("Video Export")');
    const generateVideoBtn = page.locator('button:has-text("Generate Video"), button:has-text("🎬")');
    
    if (await videoExportHeading.isVisible()) {
      console.log('🎬 Found video export section!');
      
      // Check export settings
      const qualitySelect = page.locator('select').first();
      if (await qualitySelect.isVisible()) {
        console.log('⚙️ Setting video quality to HD...');
        await qualitySelect.selectOption('hd');
      }
      
      // Look for generate button
      if (await generateVideoBtn.isVisible()) {
        const isDisabled = await generateVideoBtn.getAttribute('disabled');
        
        if (isDisabled) {
          console.log('⚠️ Generate button is disabled, checking requirements...');
          
          // Look for warning messages
          const warning = await page.locator('text*="complete", text*="template"').textContent().catch(() => '');
          console.log(`Warning: ${warning}`);
          
          // Try to fulfill requirements - go back to video template
          const videoTemplateStep = page.locator('button:has-text("Video Template"), [data-step="video-template"]');
          if (await videoTemplateStep.isVisible()) {
            console.log('🔄 Going back to complete video template...');
            await videoTemplateStep.click();
            await page.waitForTimeout(2000);
            
            // Quick template selection and content
            const templates = page.locator('.template-card, button[class*="template"]');
            if (await templates.first().isVisible()) {
              await templates.first().click();
              await page.waitForTimeout(1000);
              
              // Fill any required fields quickly
              const inputs = page.locator('input[type="text"], textarea');
              const inputCount = await inputs.count();
              
              for (let i = 0; i < Math.min(inputCount, 3); i++) {
                const input = inputs.nth(i);
                if (await input.isVisible()) {
                  await input.fill('Test content');
                }
              }
              
              // Continue back to export
              const continueBtn = page.locator('button:has-text("Continue")').last();
              if (await continueBtn.isVisible()) {
                await continueBtn.click();
                await page.waitForTimeout(2000);
              }
            }
          }
        }
        
        // Try generate button again
        if (await generateVideoBtn.isVisible() && !(await generateVideoBtn.getAttribute('disabled'))) {
          console.log('🚀 Clicking Generate Video button...');
          
          // Setup download listener
          const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
          
          await generateVideoBtn.click();
          console.log('⏳ Video generation started...');
          
          // Wait for progress or completion
          await page.waitForTimeout(8000);
          
          // Look for download button
          const downloadBtn = page.locator('button:has-text("Download"), button:has-text("📥")');
          
          if (await downloadBtn.isVisible()) {
            console.log('📥 Download button appeared! Clicking...');
            
            await downloadBtn.click();
            
            try {
              const download = await downloadPromise;
              console.log(`📁 Download started: ${download.suggestedFilename()}`);
              
              // Create downloads directory if it doesn't exist
              const downloadsDir = path.join(__dirname, '../downloads');
              if (!fs.existsSync(downloadsDir)) {
                fs.mkdirSync(downloadsDir, { recursive: true });
              }
              
              // Save the download
              const downloadPath = path.join(downloadsDir, download.suggestedFilename() || 'test-video.mp4');
              await download.saveAs(downloadPath);
              
              // Verify the file
              if (fs.existsSync(downloadPath)) {
                const stats = fs.statSync(downloadPath);
                console.log(`✅ VIDEO DOWNLOADED SUCCESSFULLY!`);
                console.log(`📊 File: ${downloadPath}`);
                console.log(`📊 Size: ${stats.size} bytes`);
                console.log(`📅 Created: ${stats.birthtime}`);
                
                // Take success screenshot
                await page.screenshot({ 
                  path: 'tests/screenshots/video-download-success.png', 
                  fullPage: true 
                });
                
                return; // Success!
              }
            } catch (downloadError) {
              console.log(`❌ Download failed: ${downloadError}`);
            }
          } else {
            console.log('❌ No download button appeared after generation');
          }
        } else {
          console.log('❌ Generate button still disabled or not found');
        }
      } else {
        console.log('❌ No generate video button found');
      }
    } else {
      console.log('❌ Video export section not found');
      
      // List all visible buttons for debugging
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`Found ${buttonCount} buttons on page:`);
      
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const buttonText = await allButtons.nth(i).textContent();
        console.log(`  ${i}: "${buttonText}"`);
      }
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/direct-export-final.png', 
      fullPage: true 
    });
    
    console.log('🏁 Direct video export test completed');
  });
});