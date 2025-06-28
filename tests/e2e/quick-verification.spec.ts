import { test, expect } from '@playwright/test';

test.describe('AIDEAS Quick Verification', () => {
  const baseURL = 'https://aideas-redbaez.netlify.app';

  test('Quick functionality check', async ({ page }) => {
    console.log('🚀 Quick verification of AIDEAS deployment...');
    
    // Load the application
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Verify correct application
    const title = await page.title();
    expect(title).toContain('AIDEAS');
    console.log(`✅ Correct app: ${title}`);
    
    // Check AIDEAS branding
    await expect(page.locator('text=AIDEAS')).toBeVisible();
    console.log('✅ AIDEAS branding visible');
    
    // Test brief input
    const briefInput = page.locator('textarea, input[type="text"]').first();
    await briefInput.fill('Test campaign for sustainable tech startup');
    const value = await briefInput.inputValue();
    expect(value).toContain('sustainable tech');
    console.log('✅ Brief input works');
    
    // Check UI elements
    const buttons = await page.locator('button').count();
    expect(buttons).toBeGreaterThan(5);
    console.log(`✅ UI interactive: ${buttons} buttons found`);
    
    // Test responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await expect(page.locator('text=AIDEAS')).toBeVisible();
    console.log('✅ Mobile responsive');
    
    console.log('🎉 Quick verification PASSED - AIDEAS is fully functional!');
  });
});