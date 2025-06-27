import { test, expect } from '@playwright/test';

/**
 * End-to-End Tests for Critical User Paths
 * 
 * Test Coverage:
 * - Complete user journeys in real browser
 * - Cross-browser compatibility
 * - Performance under realistic conditions
 * - Accessibility in real environments
 * - Mobile responsiveness
 */

test.describe('Critical User Paths E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 });
  });

  test.describe('Brief Generation Flow', () => {
    test('completes full brief generation journey', async ({ page }) => {
      // Step 1: Enter brief content
      const briefInput = page.locator('textarea[placeholder*="brief"]');
      await briefInput.fill('Launch premium coffee brand targeting health-conscious millennials in urban markets');
      
      // Step 2: Click generate
      const generateButton = page.locator('button:has-text("Generate")');
      await generateButton.click();
      
      // Step 3: Wait for loading state
      await expect(page.locator('text=Generating')).toBeVisible();
      
      // Step 4: Wait for results (with timeout for API call)
      await expect(page.locator('text=territories generated')).toBeVisible({ timeout: 30000 });
      
      // Step 5: Verify territories are displayed
      const territoryCards = page.locator('[data-testid^="territory-card"]');
      await expect(territoryCards).toHaveCount(3); // Expecting 3 territories
      
      // Step 6: Verify territory content
      const firstTerritory = territoryCards.first();
      await expect(firstTerritory).toContainText('Premium');
      await expect(firstTerritory).toContainText('confidence');
      
      // Step 7: Test territory interaction
      const starButton = firstTerritory.locator('button[title*="Star"]');
      await starButton.click();
      await expect(starButton).toContainText('⭐');
    });

    test('handles brief validation', async ({ page }) => {
      // Try to generate without brief
      const generateButton = page.locator('button:has-text("Generate")');
      await generateButton.click();
      
      // Should show validation error
      await expect(page.locator('text=Brief is required')).toBeVisible();
      
      // Enter too short brief
      const briefInput = page.locator('textarea[placeholder*="brief"]');
      await briefInput.fill('Short');
      await generateButton.click();
      
      // Should show minimum length error
      await expect(page.locator('text=Brief must be at least')).toBeVisible();
    });

    test('supports keyboard shortcuts', async ({ page }) => {
      const briefInput = page.locator('textarea[placeholder*="brief"]');
      await briefInput.fill('Test brief for keyboard shortcut');
      
      // Focus textarea and use Ctrl+Enter
      await briefInput.focus();
      await page.keyboard.press('Control+Enter');
      
      // Should start generation
      await expect(page.locator('text=Generating')).toBeVisible();
    });
  });

  test.describe('Authentication Flow', () => {
    test('completes sign-up and sign-in flow', async ({ page }) => {
      // Open auth modal
      const signInButton = page.locator('button:has-text("Sign In")');
      await signInButton.click();
      
      // Verify modal is open
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      
      // Switch to sign-up
      const signUpTab = page.locator('button:has-text("Sign Up")');
      await signUpTab.click();
      
      // Fill sign-up form
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'securepassword123');
      await page.fill('input[placeholder*="name"]', 'Test User');
      
      // Submit form
      const createAccountButton = page.locator('button:has-text("Create Account")');
      await createAccountButton.click();
      
      // Should show success and close modal
      await expect(page.locator('text=Welcome')).toBeVisible();
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
      
      // Should show user name in header
      await expect(page.locator('text=Test User')).toBeVisible();
    });

    test('handles authentication errors', async ({ page }) => {
      const signInButton = page.locator('button:has-text("Sign In")');
      await signInButton.click();
      
      // Enter invalid credentials
      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      
      const submitButton = page.locator('button:has-text("Sign In")');
      await submitButton.click();
      
      // Should show error
      await expect(page.locator('text=Invalid credentials')).toBeVisible();
      
      // Modal should remain open
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    });
  });

  test.describe('Export Functionality', () => {
    test('exports PDF successfully', async ({ page }) => {
      // Generate territories first
      const briefInput = page.locator('textarea[placeholder*="brief"]');
      await briefInput.fill('Test brief for PDF export');
      
      const generateButton = page.locator('button:has-text("Generate")');
      await generateButton.click();
      
      await expect(page.locator('text=territories generated')).toBeVisible({ timeout: 30000 });
      
      // Star a territory
      const starButton = page.locator('button[title*="Star territory"]').first();
      await starButton.click();
      
      // Start PDF export
      const exportButton = page.locator('button:has-text("Export PDF")');
      
      // Set up download handler
      const downloadPromise = page.waitForDownload();
      await exportButton.click();
      
      // Wait for download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.pdf');
      
      // Verify success message
      await expect(page.locator('text=PDF exported successfully')).toBeVisible();
    });

    test('exports CSV successfully', async ({ page }) => {
      // Generate and star content
      const briefInput = page.locator('textarea[placeholder*="brief"]');
      await briefInput.fill('Test brief for CSV export');
      
      const generateButton = page.locator('button:has-text("Generate")');
      await generateButton.click();
      
      await expect(page.locator('text=territories generated')).toBeVisible({ timeout: 30000 });
      
      // Star territory and headline
      await page.locator('button[title*="Star territory"]').first().click();
      await page.locator('button[title*="Star headline"]').first().click();
      
      // Export CSV
      const downloadPromise = page.waitForDownload();
      await page.locator('button:has-text("Export CSV")').click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.csv');
    });
  });

  test.describe('Responsive Design', () => {
    test('works on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Should show mobile navigation
      await expect(page.locator('button[aria-label="Menu"]')).toBeVisible();
      
      // Test mobile menu
      await page.locator('button[aria-label="Menu"]').click();
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      
      // Test brief generation on mobile
      const briefInput = page.locator('textarea[placeholder*="brief"]');
      await briefInput.fill('Mobile test brief');
      
      const generateButton = page.locator('button:has-text("Generate")');
      await generateButton.click();
      
      await expect(page.locator('text=Generating')).toBeVisible();
    });

    test('adapts to tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Should show adapted layout
      const briefInput = page.locator('textarea[placeholder*="brief"]');
      await expect(briefInput).toBeVisible();
      
      // Test functionality
      await briefInput.fill('Tablet test brief');
      await page.locator('button:has-text("Generate")').click();
      
      await expect(page.locator('text=Generating')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('loads quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForSelector('[data-testid="app-loaded"]');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // 3 second threshold
    });

    test('handles large datasets efficiently', async ({ page }) => {
      // Mock large dataset response
      await page.route('**/api/generate', async route => {
        const largeResponse = {
          territories: Array(50).fill(null).map((_, i) => ({
            id: `T${i}`,
            title: `Territory ${i}`,
            positioning: `Positioning for territory ${i}`,
            tone: 'Professional',
            headlines: [
              { text: `Headline ${i}`, confidence: 85, followUp: 'Follow up', reasoning: 'Reasoning' }
            ],
            confidence: {
              marketFit: 85,
              complianceConfidence: 90,
              audienceResonance: 80,
              riskLevel: 'LOW'
            }
          })),
          compliance: { output: 'Compliant', powerBy: ['Framework'], notes: [] },
          overallConfidence: 85
        };
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(largeResponse)
        });
      });
      
      const briefInput = page.locator('textarea[placeholder*="brief"]');
      await briefInput.fill('Large dataset test');
      
      const startTime = Date.now();
      await page.locator('button:has-text("Generate")').click();
      
      await expect(page.locator('text=territories generated')).toBeVisible({ timeout: 30000 });
      
      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(5000); // 5 second threshold for large dataset
      
      // Verify all territories are rendered
      const territoryCards = page.locator('[data-testid^="territory-card"]');
      await expect(territoryCards).toHaveCount(50);
    });
  });

  test.describe('Accessibility', () => {
    test('supports keyboard navigation', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await expect(page.locator('button:has-text("Sign In")')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('textarea[placeholder*="brief"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('button:has-text("Generate")')).toBeFocused();
    });

    test('has proper ARIA labels', async ({ page }) => {
      // Check for essential ARIA landmarks
      await expect(page.locator('[role="banner"]')).toBeVisible(); // Header
      await expect(page.locator('[role="main"]')).toBeVisible(); // Main content
      await expect(page.locator('[role="navigation"]')).toBeVisible(); // Navigation
      
      // Check for proper labeling
      const briefInput = page.locator('textarea[placeholder*="brief"]');
      await expect(briefInput).toHaveAttribute('aria-label');
    });

    test('works with screen readers', async ({ page }) => {
      // Test that important content has proper semantic markup
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      await expect(headings.first()).toBeVisible();
      
      // Test that form controls are properly labeled
      const formControls = page.locator('input, textarea, select, button');
      const count = await formControls.count();
      
      for (let i = 0; i < count; i++) {
        const control = formControls.nth(i);
        const hasLabel = await control.evaluate(el => {
          return el.hasAttribute('aria-label') || 
                 el.hasAttribute('aria-labelledby') || 
                 document.querySelector(`label[for="${el.id}"]`) !== null ||
                 el.textContent?.trim() !== '';
        });
        expect(hasLabel).toBeTruthy();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('handles network errors gracefully', async ({ page }) => {
      // Mock network error
      await page.route('**/api/generate', route => route.abort('failed'));
      
      const briefInput = page.locator('textarea[placeholder*="brief"]');
      await briefInput.fill('Network error test');
      
      await page.locator('button:has-text("Generate")').click();
      
      // Should show error message
      await expect(page.locator('text=network error')).toBeVisible();
      
      // Should have retry option
      await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
    });

    test('recovers from errors', async ({ page }) => {
      // Mock error then success
      let callCount = 0;
      await page.route('**/api/generate', async route => {
        callCount++;
        if (callCount === 1) {
          await route.abort('failed');
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              territories: [{
                id: 'T1',
                title: 'Recovery Test',
                positioning: 'Test positioning',
                tone: 'Professional',
                headlines: [{ text: 'Test headline', confidence: 85, followUp: '', reasoning: '' }],
                confidence: { marketFit: 85, complianceConfidence: 90, audienceResonance: 80, riskLevel: 'LOW' }
              }],
              compliance: { output: 'Compliant', powerBy: [], notes: [] },
              overallConfidence: 85
            })
          });
        }
      });
      
      const briefInput = page.locator('textarea[placeholder*="brief"]');
      await briefInput.fill('Error recovery test');
      
      // First attempt - should fail
      await page.locator('button:has-text("Generate")').click();
      await expect(page.locator('text=network error')).toBeVisible();
      
      // Retry - should succeed
      await page.locator('button:has-text("Try Again")').click();
      await expect(page.locator('text=territories generated')).toBeVisible({ timeout: 30000 });
    });
  });
});
