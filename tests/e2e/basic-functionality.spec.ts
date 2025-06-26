import { test, expect } from '@playwright/test';

test.describe('Basic App Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the main application', async ({ page }) => {
    // Check if main elements are present
    await expect(page.locator('text=AIDEAS')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("📁 ASSETS")')).toBeVisible();
    await expect(page.locator('button:has-text("⚙️ ADMIN")')).toBeVisible();
    
    // Check if brief input is present
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('should show authentication modal when clicking assets', async ({ page }) => {
    // Click the Assets button
    await page.click('button:has-text("📁 ASSETS")');
    
    // Should show authentication requirement
    await page.waitForTimeout(2000);
    
    // Look for sign in/up options
    const hasSignIn = await page.locator('text=Sign In').isVisible();
    const hasSignUp = await page.locator('text=Sign Up').isVisible();
    const hasAuthModal = await page.locator('[role="dialog"]').isVisible();
    
    expect(hasSignIn || hasSignUp || hasAuthModal).toBeTruthy();
  });

  test('should display registration form', async ({ page }) => {
    // Try to access assets to trigger auth
    await page.click('button:has-text("📁 ASSETS")');
    await page.waitForTimeout(1000);
    
    // Look for and click Sign Up
    const signUpButton = page.locator('text=Sign Up').first();
    if (await signUpButton.isVisible()) {
      await signUpButton.click();
      
      // Check for registration form elements
      await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('input[type="password"]')).toBeVisible();
    }
  });

  test('should handle brief input', async ({ page }) => {
    const briefText = 'Test creative brief for asset management';
    
    // Find and fill the brief textarea
    const textarea = page.locator('textarea').first();
    await textarea.fill(briefText);
    
    // Verify the text was entered
    await expect(textarea).toHaveValue(briefText);
  });

  test('should show asset integration in brief builder', async ({ page }) => {
    // Look for asset-related elements in the brief builder
    await expect(page.locator('text=Visual Assets')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("+ Add Assets")')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if main elements are still visible
    await expect(page.locator('text=AIDEAS')).toBeVisible();
    await expect(page.locator('button:has-text("📁 ASSETS")')).toBeVisible();
  });

  test('should handle admin panel access', async ({ page }) => {
    // Click admin button
    await page.click('button:has-text("⚙️ ADMIN")');
    
    // Should show admin panel or require authentication
    await page.waitForTimeout(1000);
    
    // Check if admin panel opened or auth is required
    const hasAdminPanel = await page.locator('text=Configuration').isVisible();
    const hasAuthRequired = await page.locator('text=Sign In').isVisible();
    
    expect(hasAdminPanel || hasAuthRequired).toBeTruthy();
  });

  test('should show proper error handling', async ({ page }) => {
    // Test error boundary by checking console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Interact with the app
    await page.click('button:has-text("📁 ASSETS")');
    await page.waitForTimeout(2000);
    
    // Should not have critical errors
    const criticalErrors = errors.filter(error => 
      error.includes('TypeError') || 
      error.includes('ReferenceError') ||
      error.includes('Cannot read property')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should load all required assets', async ({ page }) => {
    // Check if CSS and JS are loaded
    const responses = await Promise.all([
      page.waitForResponse(response => response.url().includes('.css')),
      page.waitForResponse(response => response.url().includes('.js'))
    ]);
    
    responses.forEach(response => {
      expect(response.status()).toBeLessThan(400);
    });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/.netlify/functions/**', route => {
      route.abort('failed');
    });
    
    // Try to interact with the app
    await page.click('button:has-text("📁 ASSETS")');
    await page.waitForTimeout(2000);
    
    // App should still be functional
    await expect(page.locator('text=AIDEAS')).toBeVisible();
  });
});

test.describe('Asset Management UI Tests', () => {
  test('should show asset management interface when authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Mock authentication state
    await page.addInitScript(() => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          isAuthenticated: true,
          user: { id: 'test-user', email: 'test@example.com', name: 'Test User' },
          accessToken: 'mock-token'
        }
      }));
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Click Assets button
    await page.click('button:has-text("📁 ASSETS")');
    
    // Should show asset management interface
    await expect(page.locator('text=Asset Management')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("📚 Library")')).toBeVisible();
    await expect(page.locator('button:has-text("⬆️ Upload")')).toBeVisible();
  });

  test('should switch between library and upload tabs', async ({ page }) => {
    await page.goto('/');
    
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          isAuthenticated: true,
          user: { id: 'test-user', email: 'test@example.com', name: 'Test User' },
          accessToken: 'mock-token'
        }
      }));
    });
    
    await page.reload();
    await page.click('button:has-text("📁 ASSETS")');
    
    // Test tab switching
    await page.click('button:has-text("⬆️ Upload")');
    await expect(page.locator('text=Drag & drop files here')).toBeVisible({ timeout: 5000 });
    
    await page.click('button:has-text("📚 Library")');
    await expect(page.locator('text=No assets')).toBeVisible({ timeout: 5000 });
  });

  test('should close asset management modal', async ({ page }) => {
    await page.goto('/');
    
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          isAuthenticated: true,
          user: { id: 'test-user', email: 'test@example.com', name: 'Test User' },
          accessToken: 'mock-token'
        }
      }));
    });
    
    await page.reload();
    await page.click('button:has-text("📁 ASSETS")');
    
    // Close the modal
    await page.click('button:has-text("Close")');
    
    // Should return to main interface
    await expect(page.locator('text=Asset Management')).not.toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
  });
});
