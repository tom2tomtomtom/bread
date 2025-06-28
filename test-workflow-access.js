const { chromium } = require('playwright');

(async () => {
  console.log('🎯 TESTING WORKFLOW ACCESS AFTER AUTH FIX');
  console.log('==========================================');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();

  try {
    // Test 1: Direct workflow access
    console.log('\n🔓 TESTING DIRECT WORKFLOW ACCESS');
    console.log('----------------------------------');
    
    await page.goto('https://aideas-redbaez.netlify.app/workflow');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Allow React to render
    
    const currentUrl = page.url();
    console.log(`✅ Current URL: ${currentUrl}`);
    console.log(`✅ Successfully accessed workflow: ${currentUrl.includes('/workflow')}`);
    
    // Take a screenshot to see what's rendered
    await page.screenshot({ path: 'workflow-access-test.png', fullPage: true });
    console.log('✅ Screenshot saved: workflow-access-test.png');
    
    // Check page content
    const pageContent = await page.textContent('body');
    console.log(`✅ Page loaded with content: ${!!pageContent && pageContent.length > 100}`);
    
    // Look for workflow-specific elements
    const workflowKeywords = [
      'Template', 'Brief', 'Motivation', 'Copy', 'Asset', 'Export', 
      'Step', 'workflow', 'Generate', 'Select'
    ];
    
    console.log('\n🔍 WORKFLOW CONTENT ANALYSIS:');
    workflowKeywords.forEach(keyword => {
      const found = pageContent.toLowerCase().includes(keyword.toLowerCase());
      console.log(`  ${found ? '✅' : '❌'} "${keyword}": ${found}`);
    });
    
    // Check for specific workflow elements
    const workflowElements = {
      'Progress Bar': '.progress, .step-indicator, .workflow-progress',
      'Step Circles': '.step-circle, [class*="step"]',
      'Template Selection': 'h1:has-text("Template"), h1:has-text("Select")',
      'Workflow Steps': '.workflow-step, [data-testid*="step"]',
      'Navigation Buttons': 'button:has-text("Continue"), button:has-text("Back")',
      'Form Elements': 'input, textarea, select'
    };
    
    console.log('\n🎨 UI ELEMENTS FOUND:');
    for (const [name, selector] of Object.entries(workflowElements)) {
      try {
        const count = await page.locator(selector).count();
        console.log(`  ✅ ${name}: ${count} elements`);
      } catch (error) {
        console.log(`  ❌ ${name}: Error checking`);
      }
    }
    
    // Test 2: Check for authentication modal/redirect
    console.log('\n🔐 AUTHENTICATION CHECK:');
    const hasAuthModal = await page.locator('text=Sign In, text=Login, text=Register').count();
    const hasAuthRedirect = !currentUrl.includes('/workflow');
    
    console.log(`  ❌ Auth Modal Present: ${hasAuthModal > 0}`);
    console.log(`  ❌ Auth Redirect: ${hasAuthRedirect}`);
    console.log(`  ✅ Direct Access Success: ${!hasAuthModal && !hasAuthRedirect}`);
    
    // Test 3: Try to interact with workflow elements
    console.log('\n🎮 WORKFLOW INTERACTION TEST:');
    
    // Look for any clickable workflow elements
    const interactiveElements = await page.locator('button:visible, .cursor-pointer:visible, [role="button"]:visible').all();
    console.log(`  ✅ Interactive elements found: ${interactiveElements.length}`);
    
    if (interactiveElements.length > 0) {
      console.log(`  🎯 Testing first interactive element...`);
      try {
        await interactiveElements[0].click({ timeout: 5000 });
        await page.waitForTimeout(2000);
        console.log(`  ✅ Successfully clicked workflow element`);
      } catch (error) {
        console.log(`  ⚠️ Click intercepted (possibly auth): ${error.message.substring(0, 50)}`);
      }
    }
    
    // Test 4: Check for workflow state management
    console.log('\n🔄 WORKFLOW STATE CHECK:');
    
    // Check if we can access the browser's localStorage for workflow state
    const workflowState = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const workflowKeys = keys.filter(key => 
        key.includes('workflow') || 
        key.includes('template') || 
        key.includes('motivation') ||
        key.includes('copy')
      );
      return workflowKeys.map(key => ({ key, value: localStorage.getItem(key) }));
    });
    
    console.log(`  ✅ Workflow state keys found: ${workflowState.length}`);
    workflowState.forEach(({ key, value }) => {
      console.log(`    • ${key}: ${value ? 'Has data' : 'Empty'}`);
    });
    
    // Final summary
    console.log('\n🎉 WORKFLOW ACCESS TEST RESULTS');
    console.log('===============================');
    
    const accessSuccessful = currentUrl.includes('/workflow') && !hasAuthModal;
    const contentLoaded = pageContent && pageContent.length > 100;
    const hasWorkflowElements = interactiveElements.length > 0;
    
    console.log(`✅ Direct Access: ${accessSuccessful ? 'SUCCESS' : 'BLOCKED'}`);
    console.log(`✅ Content Loading: ${contentLoaded ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ Workflow UI: ${hasWorkflowElements ? 'PRESENT' : 'MISSING'}`);
    
    if (accessSuccessful && contentLoaded && hasWorkflowElements) {
      console.log('\n🚀 WORKFLOW IS NOW ACCESSIBLE! Authentication bypass successful.');
      console.log('🎯 Ready for full end-to-end workflow testing.');
    } else {
      console.log('\n⚠️ Some issues remain - see details above for debugging.');
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  } finally {
    await browser.close();
  }
})();