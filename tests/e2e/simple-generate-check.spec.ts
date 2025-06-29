import { test, expect } from '@playwright/test';

test.describe('Simple Generate Page Check', () => {
  test('should inspect the generate page DOM structure', async ({ page }) => {
    console.log('🔍 Inspecting generate page DOM...');
    
    // Navigate directly to generate page
    await page.goto('https://aideas-redbaez.netlify.app/generate');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'generate-page-inspection.png', fullPage: true });
    
    // Get comprehensive DOM information
    const domInfo = await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const allDivs = Array.from(document.querySelectorAll('div'));
      const allSpans = Array.from(document.querySelectorAll('span'));
      
      return {
        // Button analysis
        totalButtons: allButtons.length,
        buttonTexts: allButtons.map(btn => btn.textContent?.trim()).filter(text => text && text.length > 0),
        buttonsWithImage: allButtons.filter(btn => 
          btn.textContent?.toLowerCase().includes('image') ||
          btn.textContent?.includes('🎨') ||
          btn.className.toLowerCase().includes('image')
        ).map(btn => ({
          text: btn.textContent?.trim(),
          className: btn.className,
          id: btn.id
        })),
        
        // Territory-related elements
        territoryElements: Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent?.toLowerCase().includes('territory') ||
          el.className.toLowerCase().includes('territory')
        ).length,
        
        // Look for specific classes we expect from our components
        territoryCards: Array.from(document.querySelectorAll('.territory, [class*="territory"], [class*="Territory"]')).length,
        territoryActions: Array.from(document.querySelectorAll('.territory-actions, [class*="TerritoryActions"], [class*="territory-actions"]')).length,
        
        // Look for any elements with our expected text content
        elementsWithImage: Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent?.includes('🎨') || 
          el.textContent?.toLowerCase().includes('generate image') ||
          el.textContent?.toLowerCase().includes('image')
        ).map(el => ({
          tagName: el.tagName,
          textContent: el.textContent?.trim().substring(0, 100),
          className: el.className
        })),
        
        // Check for our specific component classes
        connectedGenerationController: document.querySelector('.connected-generation-controller, [class*="ConnectedGenerationController"]') !== null,
        territoryOutput: document.querySelector('.territory-output, [class*="TerritoryOutput"]') !== null,
        territoryCard: document.querySelector('.territory-card, [class*="TerritoryCard"]') !== null,
        
        // Check for React components in the DOM
        reactComponents: Array.from(document.querySelectorAll('[data-reactroot], [data-react]')).length,
        
        // Current URL and basic page info
        currentUrl: window.location.href,
        pageTitle: document.title,
        bodyClasses: document.body.className,
        
        // Look for any error elements
        errorElements: Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent?.toLowerCase().includes('error') ||
          el.textContent?.toLowerCase().includes('404') ||
          el.textContent?.toLowerCase().includes('not found')
        ).length
      };
    });
    
    console.log('📊 DOM Analysis Results:');
    console.log('=========================');
    console.log(`🔘 Total buttons: ${domInfo.totalButtons}`);
    console.log(`🎨 Buttons with image text: ${domInfo.buttonsWithImage.length}`);
    console.log(`🏷️ Territory elements: ${domInfo.territoryElements}`);
    console.log(`📦 Territory cards: ${domInfo.territoryCards}`);
    console.log(`⚡ Territory actions: ${domInfo.territoryActions}`);
    console.log(`⚛️ React components: ${domInfo.reactComponents}`);
    console.log(`❌ Error elements: ${domInfo.errorElements}`);
    console.log('');
    
    console.log('🔘 Button texts found:');
    domInfo.buttonTexts.forEach((text, i) => console.log(`  ${i + 1}. "${text}"`));
    console.log('');
    
    if (domInfo.buttonsWithImage.length > 0) {
      console.log('🎨 Image-related buttons:');
      domInfo.buttonsWithImage.forEach(btn => console.log(`  - "${btn.text}" (class: ${btn.className})`));
    } else {
      console.log('❌ No image-related buttons found');
    }
    console.log('');
    
    if (domInfo.elementsWithImage.length > 0) {
      console.log('🖼️ Elements with image content:');
      domInfo.elementsWithImage.slice(0, 5).forEach(el => 
        console.log(`  - ${el.tagName}: "${el.textContent?.substring(0, 50)}..."`));
    }
    console.log('');
    
    console.log('🧩 Component Detection:');
    console.log(`  - ConnectedGenerationController: ${domInfo.connectedGenerationController}`);
    console.log(`  - TerritoryOutput: ${domInfo.territoryOutput}`);
    console.log(`  - TerritoryCard: ${domInfo.territoryCard}`);
    console.log('');
    
    console.log(`📄 Page Info:`);
    console.log(`  - URL: ${domInfo.currentUrl}`);
    console.log(`  - Title: ${domInfo.pageTitle}`);
    console.log(`  - Body classes: ${domInfo.bodyClasses}`);
    
    // Basic assertions
    expect(domInfo.errorElements).toBe(0); // Should not have error elements
    expect(domInfo.totalButtons).toBeGreaterThan(0); // Should have some buttons
    
    // Report findings
    if (domInfo.buttonsWithImage.length === 0) {
      console.log('🚨 ISSUE IDENTIFIED: No image generation buttons found on generate page');
      console.log('   This suggests the territory cards are not rendering the new Image buttons');
      console.log('   or the territories themselves are not being displayed.');
    } else {
      console.log('✅ Image generation buttons found!');
    }
    
    console.log('🎉 Generate page inspection completed');
  });
  
  test('should check for JavaScript console errors', async ({ page }) => {
    console.log('🔍 Checking for JavaScript errors on generate page...');
    
    const jsErrors: string[] = [];
    const consoleWarnings: string[] = [];
    
    page.on('pageerror', error => {
      jsErrors.push(error.message);
      console.error(`❌ JS Error: ${error.message}`);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
        console.error(`❌ Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
        console.warn(`⚠️ Console Warning: ${msg.text()}`);
      } else if (msg.text().includes('🎯') || msg.text().includes('✅') || msg.text().includes('❌')) {
        console.log(`🎯 App Log: ${msg.text()}`);
      }
    });
    
    await page.goto('https://aideas-redbaez.netlify.app/generate');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any async errors
    await page.waitForTimeout(5000);
    
    console.log(`📊 Error Summary:`);
    console.log(`  - JavaScript errors: ${jsErrors.length}`);
    console.log(`  - Console warnings: ${consoleWarnings.length}`);
    
    if (jsErrors.length > 0) {
      console.log('❌ JavaScript errors found:');
      jsErrors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Should not have critical JavaScript errors
    expect(jsErrors.length).toBe(0);
    
    console.log('✅ JavaScript error check completed');
  });
});