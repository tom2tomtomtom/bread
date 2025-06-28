import { test, expect } from '@playwright/test';

test.describe('Shopping Moments with Brief Population', () => {
  const baseUrl = 'https://aideas-redbaez.netlify.app';

  // Helper function to set up authentication context
  async function setupAuthenticatedSession(page: any) {
    // Set localStorage to simulate authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          isAuthenticated: true,
          user: {
            id: 'test-user',
            email: 'test@example.com',
            name: 'Test User',
            plan: 'free',
            createdAt: '2024-01-01'
          },
          tokens: {
            token: 'mock-token',
            refreshToken: 'mock-refresh-token'
          }
        },
        version: 0
      }));
    });
  }

  test('Shopping moments should populate brief field when clicked', async ({ page }) => {
    console.log('🧪 Testing Shopping Moments Brief Population');
    
    // Set up authenticated session
    await setupAuthenticatedSession(page);
    
    // Navigate directly to brief page
    await page.goto(`${baseUrl}/brief`);
    await page.waitForTimeout(3000);
    
    // Check if shopping moments section is visible
    const shoppingMomentsTitle = page.locator('text=QUICK START: SHOPPING MOMENTS');
    await expect(shoppingMomentsTitle).toBeVisible({ timeout: 10000 });
    console.log('✅ Shopping Moments section is visible');
    
    // Check for the new description text
    const description = page.locator('text=Click any moment to populate your brief field');
    await expect(description).toBeVisible();
    console.log('✅ Description text explains the functionality');
    
    // Find the brief textarea
    const briefTextarea = page.locator('textarea');
    await expect(briefTextarea).toBeVisible();
    
    // Get initial brief content
    const initialBrief = await briefTextarea.inputValue();
    console.log(`Initial brief length: ${initialBrief.length}`);
    
    // Click on Black Friday moment
    const blackFridayButton = page.locator('button:has-text("Black Friday")');
    await expect(blackFridayButton).toBeVisible();
    await blackFridayButton.click();
    console.log('✅ Clicked Black Friday shopping moment');
    
    // Wait for brief to be populated
    await page.waitForTimeout(1000);
    
    // Check that brief has been populated
    const updatedBrief = await briefTextarea.inputValue();
    console.log(`Updated brief length: ${updatedBrief.length}`);
    
    // Verify the brief contains Black Friday content
    expect(updatedBrief).toContain('Black Friday');
    expect(updatedBrief).toContain('deal-seeking consumers');
    expect(updatedBrief).toContain('urgency, value, and limited-time offers');
    expect(updatedBrief.length).toBeGreaterThan(100);
    console.log('✅ Black Friday brief properly populated');
    
    // Test another shopping moment
    const christmasButton = page.locator('button:has-text("Christmas")');
    await christmasButton.click();
    console.log('✅ Clicked Christmas shopping moment');
    
    await page.waitForTimeout(1000);
    const christmasBrief = await briefTextarea.inputValue();
    
    // Verify Christmas brief replaced Black Friday brief
    expect(christmasBrief).toContain('Christmas');
    expect(christmasBrief).toContain('families and gift-givers');
    expect(christmasBrief).toContain('warmth, tradition, and magical moments');
    expect(christmasBrief).not.toContain('Black Friday');
    console.log('✅ Christmas brief properly replaced previous brief');
    
    // Test that brief preview is shown in shopping moment cards
    const momentCards = page.locator('button:has-text("Black Friday"), button:has-text("Christmas")');
    const cardCount = await momentCards.count();
    expect(cardCount).toBeGreaterThan(0);
    console.log(`✅ Found ${cardCount} shopping moment cards`);
    
    // Take screenshot showing the populated brief
    await page.screenshot({ path: 'test-results/shopping-moments-populated-brief.png' });
    
    console.log('✅ Shopping Moments brief population test completed successfully');
  });

  test('All shopping moments should have unique briefs', async ({ page }) => {
    console.log('🧪 Testing All Shopping Moments Have Unique Briefs');
    
    // Set up authenticated session
    await setupAuthenticatedSession(page);
    
    // Navigate directly to brief page
    await page.goto(`${baseUrl}/brief`);
    await page.waitForTimeout(3000);
    
    const briefTextarea = page.locator('textarea');
    await expect(briefTextarea).toBeVisible();
    
    const shoppingMoments = [
      'Black Friday',
      'Christmas', 
      'EOFY Sales',
      'Back to School',
      "Mother's Day",
      "Father's Day",
      'Australia Day',
      "Valentine's Day"
    ];
    
    const briefContents = new Map();
    
    for (const moment of shoppingMoments) {
      // Click the shopping moment
      const momentButton = page.locator(`button:has-text("${moment}")`);
      await expect(momentButton).toBeVisible();
      await momentButton.click();
      
      await page.waitForTimeout(500);
      
      // Get the brief content
      const briefContent = await briefTextarea.inputValue();
      briefContents.set(moment, briefContent);
      
      // Verify basic requirements
      expect(briefContent.length).toBeGreaterThan(50);
      expect(briefContent).toContain(moment);
      
      console.log(`✅ ${moment}: Brief length ${briefContent.length} characters`);
    }
    
    // Verify all briefs are unique
    const uniqueBriefs = new Set(briefContents.values());
    expect(uniqueBriefs.size).toBe(shoppingMoments.length);
    console.log('✅ All shopping moments have unique briefs');
    
    // Verify each brief contains campaign-specific terms
    expect(briefContents.get('Black Friday')).toContain('deal-seeking');
    expect(briefContents.get('Christmas')).toContain('gift-givers');
    expect(briefContents.get('EOFY Sales')).toContain('Financial Year');
    expect(briefContents.get('Back to School')).toContain('academic');
    expect(briefContents.get("Mother's Day")).toContain('mothers');
    expect(briefContents.get("Father's Day")).toContain('fathers');
    expect(briefContents.get('Australia Day')).toContain('Australian');
    expect(briefContents.get("Valentine's Day")).toContain('romance');
    
    console.log('✅ All briefs contain relevant campaign-specific content');
  });

  test('Shopping moment cards show preview text and enhanced styling', async ({ page }) => {
    console.log('🧪 Testing Shopping Moment Card Enhancements');
    
    // Set up authenticated session
    await setupAuthenticatedSession(page);
    
    // Navigate directly to brief page
    await page.goto(`${baseUrl}/brief`);
    await page.waitForTimeout(3000);
    
    // Check that shopping moment cards show preview text
    const blackFridayCard = page.locator('button:has-text("Black Friday")');
    await expect(blackFridayCard).toBeVisible();
    
    // Verify the card contains preview text
    const cardText = await blackFridayCard.textContent();
    expect(cardText).toContain('Black Friday');
    expect(cardText).toContain('November 24');
    // Should contain truncated brief text
    expect(cardText?.length || 0).toBeGreaterThan(50);
    
    console.log('✅ Shopping moment cards contain preview text');
    
    // Test hover effects by checking CSS classes
    const cardClasses = await blackFridayCard.getAttribute('class');
    expect(cardClasses).toContain('hover:border-yellow-400');
    expect(cardClasses).toContain('group');
    
    console.log('✅ Shopping moment cards have enhanced hover styling');
    
    // Verify responsive grid layout
    const gridContainer = page.locator('div.grid.grid-cols-2.lg\\:grid-cols-4');
    await expect(gridContainer).toBeVisible();
    
    console.log('✅ Shopping moments use responsive grid layout');
  });
});