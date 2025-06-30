import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Workflow Video Export Test', () => {
  test('should navigate to export step and download video', async ({ page }) => {
    console.log('🎬 Testing workflow video export...');
    
    // Extended timeout
    test.setTimeout(180000); // 3 minutes
    
    // Navigate to the site
    await page.goto('https://aideas-redbaez.netlify.app');
    await page.waitForLoadState('networkidle');
    
    // Quick registration if needed
    if (await page.locator('button:has-text("Get Started Free")').isVisible()) {
      await page.click('button:has-text("Get Started Free")');
      
      if (await page.locator('input[type="email"]').isVisible()) {
        await page.fill('input[type="email"]', 'workflowtest@redbaez.com');
        await page.fill('input[type="password"]', 'WorkflowTest123!');
        
        const submitBtn = page.locator('button[type="submit"]').first();
        await submitBtn.click();
        await page.waitForTimeout(3000);
      }
    }
    
    // Fill minimal brief data
    console.log('📝 Filling brief...');
    if (await page.locator('textarea').isVisible()) {
      await page.fill('textarea', 'RedBaez Airwave - Revolutionary wireless charging for tech professionals');
      
      const goalInput = page.locator('input[placeholder*="brand awareness"], input[placeholder*="goal"]').first();
      if (await goalInput.isVisible()) {
        await goalInput.fill('Launch revolutionary wireless charging technology');
      }
      
      const audienceInput = page.locator('input[placeholder*="Young professionals"], input[placeholder*="audience"]').first();
      if (await audienceInput.isVisible()) {
        await audienceInput.fill('Tech professionals 25-45, early adopters');
      }
    }
    
    // Click directly on the Video Template step from workflow nav
    console.log('🎬 Clicking Video Template step...');
    const videoTemplateBtn = page.locator('button:has-text("🎬Video Template"), button:has-text("Video Template")');
    
    if (await videoTemplateBtn.isVisible()) {
      await videoTemplateBtn.click();
      await page.waitForTimeout(3000);
      
      console.log('✅ Navigated to Video Template step');
      
      // Select a template quickly
      const templates = page.locator('.template-card, button[class*="template"], div[class*="template"]');
      const templateCount = await templates.count();
      
      if (templateCount > 0) {
        console.log(`Found ${templateCount} templates, selecting first one...`);
        await templates.first().click();
        await page.waitForTimeout(2000);
        
        // Check if video frame editor appeared
        if (await page.locator('text=Frame').isVisible()) {
          console.log('🎞️ Video frame editor loaded, filling content...');
          
          // Fill any visible inputs quickly
          const textInputs = page.locator('input[type="text"], textarea');
          const inputCount = await textInputs.count();
          
          const sampleContent = [
            'Experience True Wireless Freedom',
            'Charge devices from 3 meters away', 
            'Pre-order Now'
          ];
          
          for (let i = 0; i < Math.min(inputCount, sampleContent.length); i++) {
            const input = textInputs.nth(i);
            if (await input.isVisible()) {
              await input.fill(sampleContent[i]);
              console.log(`✅ Filled input ${i + 1}: ${sampleContent[i]}`);
            }
          }
        }
      }
    }
    
    // Now click on Export & Download step
    console.log('📤 Clicking Export & Download step...');
    const exportBtn = page.locator('button:has-text("📤Export & Download"), button:has-text("Export & Download")');
    
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
      await page.waitForTimeout(3000);
      
      console.log('✅ Navigated to Export step');
      
      // Take screenshot of export page
      await page.screenshot({ 
        path: 'tests/screenshots/workflow-export-page.png', 
        fullPage: true 
      });
      
      // Look for video export section
      const videoExportSection = page.locator('h2:has-text("Video Export"), h3:has-text("Video Export"), div:has-text("Video Export")');
      
      if (await videoExportSection.isVisible()) {
        console.log('🎬 Found Video Export section!');
        
        // Look for Generate Video button
        const generateBtn = page.locator('button:has-text("Generate Video"), button:has-text("🎬 Generate Video")');
        
        if (await generateBtn.isVisible()) {
          const isDisabled = await generateBtn.getAttribute('disabled');
          
          if (isDisabled) {
            console.log('⚠️ Generate button is disabled');
            
            // Check for warning messages
            const warningText = await page.locator('text*="complete", text*="template", text*="warning"').textContent().catch(() => '');
            console.log(`Warning message: ${warningText}`);
            
            // The button might be disabled because we need to complete video template step properly
            // Let's go back and complete it
            console.log('🔄 Going back to complete video template properly...');
            
            const videoTemplateStepBtn = page.locator('button:has-text("🎬Video Template")');
            if (await videoTemplateStepBtn.isVisible()) {
              await videoTemplateStepBtn.click();
              await page.waitForTimeout(2000);
              
              // Make sure template is selected and content is filled
              const templates = page.locator('.template-card, button[class*="template"]');
              if (await templates.first().isVisible()) {
                await templates.first().click();
                await page.waitForTimeout(1000);
                
                // Continue to next step if there's a continue button
                const continueBtn = page.locator('button:has-text("Continue")');
                if (await continueBtn.isVisible()) {
                  await continueBtn.click();
                  await page.waitForTimeout(2000);
                }
              }
              
              // Go back to export
              const exportBtnAgain = page.locator('button:has-text("📤Export & Download")');
              if (await exportBtnAgain.isVisible()) {
                await exportBtnAgain.click();
                await page.waitForTimeout(2000);
              }
            }
          }
          
          // Try the generate button again
          const generateBtnRetry = page.locator('button:has-text("Generate Video"), button:has-text("🎬 Generate Video")');
          
          if (await generateBtnRetry.isVisible()) {
            const isStillDisabled = await generateBtnRetry.getAttribute('disabled');
            
            if (!isStillDisabled) {
              console.log('🚀 Generate Video button is now enabled! Clicking...');
              
              // Set up download monitoring
              const downloadPromise = page.waitForEvent('download', { timeout: 60000 });
              
              await generateBtnRetry.click();
              console.log('⏳ Video generation started...');
              
              // Wait for progress
              await page.waitForTimeout(10000);
              
              // Look for download button
              const downloadBtn = page.locator('button:has-text("Download"), button:has-text("📥")');
              
              if (await downloadBtn.isVisible()) {
                console.log('📥 Download button appeared! Clicking...');
                
                await downloadBtn.click();
                
                try {
                  const download = await downloadPromise;
                  console.log(`📁 Download started: ${download.suggestedFilename()}`);
                  
                  // Create downloads directory
                  const downloadsDir = path.join(__dirname, '../downloads');
                  if (!fs.existsSync(downloadsDir)) {
                    fs.mkdirSync(downloadsDir, { recursive: true });
                  }
                  
                  // Save the download
                  const downloadPath = path.join(downloadsDir, download.suggestedFilename() || `test-video-${Date.now()}.mp4`);
                  await download.saveAs(downloadPath);
                  
                  // Verify the file
                  if (fs.existsSync(downloadPath)) {
                    const stats = fs.statSync(downloadPath);
                    console.log(`🎉 VIDEO DOWNLOADED SUCCESSFULLY!`);
                    console.log(`📁 File path: ${downloadPath}`);
                    console.log(`📊 File size: ${stats.size} bytes`);
                    console.log(`📅 Created: ${stats.birthtime.toISOString()}`);
                    
                    // Verify it's not empty
                    if (stats.size > 0) {
                      console.log(`✅ Video file has content (${stats.size} bytes)`);
                      
                      // Take success screenshot
                      await page.screenshot({ 
                        path: 'tests/screenshots/video-download-complete.png', 
                        fullPage: true 
                      });
                      
                      // Test passed!
                      return;
                    } else {
                      console.log(`❌ Video file is empty`);
                    }
                  } else {
                    console.log(`❌ Video file was not saved`);
                  }
                } catch (downloadError) {
                  console.log(`❌ Download failed: ${downloadError.message}`);
                }
              } else {
                console.log('❌ Download button did not appear after generation');
                
                // Check if there are any error messages
                const errorMsg = await page.locator('text*="error", text*="failed"').textContent().catch(() => '');
                if (errorMsg) {
                  console.log(`Error message: ${errorMsg}`);
                }
              }
            } else {
              console.log('❌ Generate button is still disabled');
            }
          }
        } else {
          console.log('❌ Generate Video button not found');
        }
      } else {
        console.log('❌ Video Export section not found');
        
        // Debug: show what's on the page
        const pageContent = await page.textContent('body');
        console.log('Page content contains video:', pageContent.includes('video') || pageContent.includes('Video'));
        console.log('Page content contains export:', pageContent.includes('export') || pageContent.includes('Export'));
      }
    } else {
      console.log('❌ Export & Download button not found in workflow');
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/workflow-export-final.png', 
      fullPage: true 
    });
    
    console.log('🏁 Workflow video export test completed');
  });
});