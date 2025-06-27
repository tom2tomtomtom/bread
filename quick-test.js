const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting Playwright UI test...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📱 Navigating to AIDEAS Creative Platform...');
    await page.goto('https://aideas-redbaez.netlify.app', { waitUntil: 'networkidle' });
    
    // Take a screenshot
    await page.screenshot({ path: 'ui-test-result.png' });
    console.log('📸 Screenshot saved as ui-test-result.png');
    
    // Check if the main app loads
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Look for AIDEAS text
    const aideasText = await page.locator('text=AIDEAS').first();
    if (await aideasText.isVisible()) {
      console.log('✅ AIDEAS branding found - app loaded successfully!');
    } else {
      console.log('❌ AIDEAS branding not found');
    }
    
    // Check for any visible errors
    const errorElements = await page.locator('text=Error').count();
    console.log('🔍 Error elements found:', errorElements);
    
    // Check for basic UI elements
    const buttons = await page.locator('button').count();
    console.log('🔘 Buttons found:', buttons);
    
    const inputs = await page.locator('input,textarea').count();
    console.log('⌨️ Input fields found:', inputs);
    
    // Wait a bit to see the app
    await page.waitForTimeout(3000);
    
    console.log('✅ UI test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'ui-test-error.png' });
  }
  
  await browser.close();
})();