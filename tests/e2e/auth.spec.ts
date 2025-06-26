import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Login', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
      // Open login modal
      await page.click('[data-testid="login-button"]');
      
      // Fill login form
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      
      // Submit form
      await page.click('[data-testid="login-submit"]');
      
      // Wait for successful login
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page.locator('text=Welcome back')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      // Open login modal
      await page.click('[data-testid="login-button"]');
      
      // Fill login form with invalid credentials
      await page.fill('[data-testid="email-input"]', 'invalid@example.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      
      // Submit form
      await page.click('[data-testid="login-submit"]');
      
      // Wait for error message
      await expect(page.locator('text=The email or password you entered is incorrect')).toBeVisible();
      
      // Should show retry button
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    test('should show loading state during login', async ({ page }) => {
      // Open login modal
      await page.click('[data-testid="login-button"]');
      
      // Fill login form
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      
      // Submit form
      await page.click('[data-testid="login-submit"]');
      
      // Check loading state
      await expect(page.locator('[data-testid="login-submit"]')).toContainText('Signing in...');
      await expect(page.locator('[data-testid="login-submit"]')).toBeDisabled();
    });

    test('should validate email format', async ({ page }) => {
      // Open login modal
      await page.click('[data-testid="login-button"]');
      
      // Fill invalid email
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.fill('[data-testid="password-input"]', 'password123');
      
      // Try to submit
      await page.click('[data-testid="login-submit"]');
      
      // Should show validation error
      await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    });

    test('should validate password requirements', async ({ page }) => {
      // Open login modal
      await page.click('[data-testid="login-button"]');
      
      // Fill short password
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', '123');
      
      // Try to submit
      await page.click('[data-testid="login-submit"]');
      
      // Should show validation error
      await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
    });
  });

  test.describe('Registration', () => {
    test('should successfully register new user', async ({ page }) => {
      // Open register modal
      await page.click('[data-testid="register-button"]');
      
      // Fill registration form
      await page.fill('[data-testid="name-input"]', 'Test User');
      await page.fill('[data-testid="email-input"]', 'newuser@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.fill('[data-testid="confirm-password-input"]', 'password123');
      
      // Submit form
      await page.click('[data-testid="register-submit"]');
      
      // Wait for successful registration
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page.locator('text=Welcome to BREAD')).toBeVisible();
    });

    test('should show error for existing email', async ({ page }) => {
      // Open register modal
      await page.click('[data-testid="register-button"]');
      
      // Fill registration form with existing email
      await page.fill('[data-testid="name-input"]', 'Test User');
      await page.fill('[data-testid="email-input"]', 'existing@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.fill('[data-testid="confirm-password-input"]', 'password123');
      
      // Submit form
      await page.click('[data-testid="register-submit"]');
      
      // Wait for error message
      await expect(page.locator('text=An account with this email already exists')).toBeVisible();
    });

    test('should validate password confirmation', async ({ page }) => {
      // Open register modal
      await page.click('[data-testid="register-button"]');
      
      // Fill form with mismatched passwords
      await page.fill('[data-testid="name-input"]', 'Test User');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.fill('[data-testid="confirm-password-input"]', 'different123');
      
      // Try to submit
      await page.click('[data-testid="register-submit"]');
      
      // Should show validation error
      await expect(page.locator('text=Passwords do not match')).toBeVisible();
    });

    test('should show password strength indicator', async ({ page }) => {
      // Open register modal
      await page.click('[data-testid="register-button"]');
      
      // Start typing password
      await page.fill('[data-testid="password-input"]', 'weak');
      
      // Should show weak strength
      await expect(page.locator('[data-testid="password-strength"]')).toContainText('Weak');
      
      // Type stronger password
      await page.fill('[data-testid="password-input"]', 'StrongPassword123!');
      
      // Should show strong strength
      await expect(page.locator('[data-testid="password-strength"]')).toContainText('Strong');
    });
  });

  test.describe('User Onboarding', () => {
    test('should show onboarding for new users', async ({ page }) => {
      // Register new user
      await page.click('[data-testid="register-button"]');
      await page.fill('[data-testid="name-input"]', 'New User');
      await page.fill('[data-testid="email-input"]', 'newuser@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.fill('[data-testid="confirm-password-input"]', 'password123');
      await page.click('[data-testid="register-submit"]');
      
      // Should show onboarding
      await expect(page.locator('[data-testid="onboarding-modal"]')).toBeVisible();
      await expect(page.locator('text=Welcome to BREAD')).toBeVisible();
    });

    test('should navigate through onboarding steps', async ({ page }) => {
      // Trigger onboarding (assuming user is logged in)
      await page.evaluate(() => {
        localStorage.removeItem('onboarding-user123');
      });
      await page.reload();
      
      // Should show first step
      await expect(page.locator('text=Welcome to BREAD')).toBeVisible();
      
      // Navigate to next step
      await page.click('[data-testid="onboarding-next"]');
      await expect(page.locator('text=Your Plan & Usage')).toBeVisible();
      
      // Navigate to next step
      await page.click('[data-testid="onboarding-next"]');
      await expect(page.locator('text=Key Features')).toBeVisible();
      
      // Complete onboarding
      await page.click('[data-testid="onboarding-next"]');
      await page.click('[data-testid="onboarding-next"]');
      await page.click('[data-testid="onboarding-next"]');
      await page.click('[data-testid="onboarding-complete"]');
      
      // Should close onboarding
      await expect(page.locator('[data-testid="onboarding-modal"]')).not.toBeVisible();
    });

    test('should allow skipping onboarding', async ({ page }) => {
      // Trigger onboarding
      await page.evaluate(() => {
        localStorage.removeItem('onboarding-user123');
      });
      await page.reload();
      
      // Skip onboarding
      await page.click('[data-testid="onboarding-skip"]');
      
      // Should close onboarding
      await expect(page.locator('[data-testid="onboarding-modal"]')).not.toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should show network error with retry option', async ({ page }) => {
      // Simulate network failure
      await page.route('**/.netlify/functions/auth-login', route => {
        route.abort('failed');
      });
      
      // Try to login
      await page.click('[data-testid="login-button"]');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-submit"]');
      
      // Should show network error
      await expect(page.locator('text=Unable to connect to our servers')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    test('should auto-retry network errors', async ({ page }) => {
      let requestCount = 0;
      
      // Simulate network failure then success
      await page.route('**/.netlify/functions/auth-login', route => {
        requestCount++;
        if (requestCount === 1) {
          route.abort('failed');
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                user: { id: '1', email: 'test@example.com', name: 'Test User', plan: 'free' },
                token: 'mock-token',
                refreshToken: 'mock-refresh',
              },
            }),
          });
        }
      });
      
      // Try to login
      await page.click('[data-testid="login-button"]');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-submit"]');
      
      // Should show auto-retry countdown
      await expect(page.locator('text=Auto-retrying in')).toBeVisible();
      
      // Should eventually succeed
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible({ timeout: 10000 });
    });

    test('should show rate limit error with wait time', async ({ page }) => {
      // Simulate rate limit error
      await page.route('**/.netlify/functions/auth-login', route => {
        route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Rate limit exceeded',
            retryAfter: 60,
          }),
        });
      });
      
      // Try to login
      await page.click('[data-testid="login-button"]');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-submit"]');
      
      // Should show rate limit error
      await expect(page.locator('text=Too many requests')).toBeVisible();
      await expect(page.locator('text=Rate limit will reset in 1 minutes')).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test('should successfully logout', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-button"]');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-submit"]');
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      
      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');
      
      // Should return to logged out state
      await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // Tab to login button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // Should open login modal
      await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
      
      // Tab through form fields
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="email-input"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="password-input"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="login-submit"]')).toBeFocused();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.click('[data-testid="login-button"]');
      
      // Check ARIA labels
      await expect(page.locator('[data-testid="email-input"]')).toHaveAttribute('aria-label', 'Email address');
      await expect(page.locator('[data-testid="password-input"]')).toHaveAttribute('aria-label', 'Password');
      await expect(page.locator('[data-testid="login-submit"]')).toHaveAttribute('aria-label', 'Sign in to your account');
    });
  });
});
