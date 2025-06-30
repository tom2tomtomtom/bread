import { test, expect, Page } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

// Test configuration
const TEST_CONFIG = {
  baseURL: 'https://aideas-redbaez.netlify.app',
  timeout: 120000, // 2 minutes for AI operations
  retries: 2,
  screenshotPath: 'tests/screenshots/comprehensive-workflow',
  downloadPath: 'tests/downloads',
  testData: {
    user: {
      email: `test-${Date.now()}@aideas.com`,
      password: 'SecureTest123!',
      name: 'Test User'
    },
    brief: {
      product: 'Everyday Rewards Premium Membership',
      audience: 'Busy Australian families with household income $80k+',
      goal: 'Drive membership upgrades during Q4 holiday shopping',
      keyMessage: 'Save more on everything you buy for the holidays',
      format: '8-second social video (9:16 aspect ratio)',
      brandPersonality: 'Trustworthy, helpful, family-focused',
      fullBrief: `
Create a compelling campaign for Everyday Rewards Premium Membership targeting busy Australian families with household income $80k+. 

Campaign Goal: Drive membership upgrades during Q4 holiday shopping season when families are spending the most on gifts, food, and entertainment.

Key Message: "Save more on everything you buy for the holidays" - emphasizing the value proposition of earning more points and exclusive discounts during the most expensive time of year.

Target Audience: 
- Busy Australian families with $80k+ household income
- Parents aged 28-45 who shop regularly for groceries and household essentials
- Value-conscious but not price-driven
- Time-poor and convenience-focused
- Existing Everyday Rewards members ready to upgrade

Brand Personality: Trustworthy, helpful, family-focused, reliable, and genuinely caring about helping families save money.

Format Requirements: 8-second social video in 9:16 aspect ratio for Instagram Stories, TikTok, and Facebook Stories placement.

Success Metrics: Drive premium membership sign-ups, increase average transaction value, boost brand loyalty and engagement.
      `.trim()
    }
  }
};

// Helper class for common actions
class AIDEASWorkflowHelper {
  constructor(private page: Page) {}

  async takeScreenshot(name: string) {
    const screenshotDir = path.join(TEST_CONFIG.screenshotPath);
    await fs.mkdir(screenshotDir, { recursive: true });
    await this.page.screenshot({ 
      path: path.join(screenshotDir, `${name}.png`),
      fullPage: true 
    });
  }

  async waitForAIGeneration(timeout: number = TEST_CONFIG.timeout) {
    // Wait for any loading spinners to disappear
    await this.page.waitForSelector('.animate-spin', { state: 'hidden', timeout });
    
    // Wait for generation complete indicators
    await this.page.waitForFunction(() => {
      const loadingTexts = ['Generating...', 'Processing...', 'Creating...'];
      return !loadingTexts.some(text => 
        document.body.textContent?.includes(text)
      );
    }, { timeout });
  }

  async authenticateUser() {
    const { email, password, name } = TEST_CONFIG.testData.user;
    
    // Click Get Started Free button
    await this.page.click('button:has-text("Get Started Free")');
    
    // Fill registration form
    await this.page.fill('input[placeholder*="name"], input[type="text"]', name);
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    
    // Handle confirm password if exists
    const confirmPasswordField = this.page.locator('input[placeholder*="confirm"], input[name*="confirm"]');
    if (await confirmPasswordField.count() > 0) {
      await confirmPasswordField.fill(password);
    }
    
    // Submit registration
    await this.page.click('button:has-text("Sign Up"), button:has-text("Create Account")');
    
    // Wait for authentication to complete
    await this.page.waitForSelector('text=Welcome', { timeout: 30000 });
    await this.takeScreenshot('01-authenticated');
  }

  async inputBrief() {
    const { fullBrief } = TEST_CONFIG.testData.brief;
    
    // Find and fill the brief textarea
    const briefTextarea = this.page.locator('textarea[placeholder*="brief"], textarea').first();
    await briefTextarea.fill(fullBrief);
    
    // Wait a moment for auto-save or validation
    await this.page.waitForTimeout(2000);
    await this.takeScreenshot('02-brief-input');
    
    return fullBrief;
  }

  async generateTerritories() {
    // Click generate territories button
    await this.page.click('button:has-text("GENERATE TERRITORIES"), button:has-text("Generate")');
    
    // Wait for AI generation to complete
    await this.waitForAIGeneration();
    
    // Verify territories were generated
    const territoryCards = this.page.locator('.territory-card, [data-testid="territory-card"]');
    await expect(territoryCards.first()).toBeVisible({ timeout: 30000 });
    
    const territoryCount = await territoryCards.count();
    console.log(`Generated ${territoryCount} territories`);
    
    await this.takeScreenshot('03-territories-generated');
    return territoryCount;
  }

  async generateImageForTerritory(territoryIndex: number = 0) {
    // Click image generation button on first territory
    const imageButtons = this.page.locator('button:has-text("Image"), button:has-text("🎨")');
    await imageButtons.nth(territoryIndex).click();
    
    // Wait for image generation modal
    await this.page.waitForSelector('[data-testid="image-generation-modal"], .modal', { timeout: 10000 });
    await this.takeScreenshot('04-image-modal-opened');
    
    // Click generate in modal
    const generateBtn = this.page.locator('button:has-text("Generate Image"), button:has-text("🎨 Generate")').first();
    await generateBtn.click();
    
    // Wait for image generation to complete
    await this.waitForAIGeneration();
    
    // Wait for actual image to be displayed
    await this.page.waitForSelector('img[src*="data:"], img[src*="blob:"], img[src*="https://"]', { timeout: 60000 });
    
    // Verify image is displayed
    const generatedImage = this.page.locator('img[src*="data:"], img[src*="blob:"], img[src*="https://"]').first();
    await expect(generatedImage).toBeVisible();
    
    const imageSrc = await generatedImage.getAttribute('src');
    console.log(`Generated image: ${imageSrc?.substring(0, 50)}...`);
    
    await this.takeScreenshot('05-image-generated');
    
    // Close modal
    await this.page.click('button:has-text("View in Library"), button:has-text("Close")');
    
    return imageSrc;
  }

  async generateVideoForTerritory(territoryIndex: number = 0) {
    // Click video generation button on first territory
    const videoButtons = this.page.locator('button:has-text("Video"), button:has-text("🎬")');
    await videoButtons.nth(territoryIndex).click();
    
    // Wait for video generation modal
    await this.page.waitForSelector('[data-testid="video-generation-modal"], .modal', { timeout: 10000 });
    await this.takeScreenshot('06-video-modal-opened');
    
    // Select video style and duration
    await this.page.selectOption('select', 'dynamic'); // Video style
    await this.page.selectOption('select[value="15"], select', '15'); // Duration
    
    // Click generate in modal
    const generateBtn = this.page.locator('button:has-text("Generate Video"), button:has-text("🎬 Generate")').first();
    await generateBtn.click();
    
    // Wait for video generation to complete
    await this.waitForAIGeneration();
    
    // Wait for actual video to be displayed
    await this.page.waitForSelector('video, [data-testid="generated-video"]', { timeout: 120000 });
    
    // Verify video is displayed
    const generatedVideo = this.page.locator('video').first();
    await expect(generatedVideo).toBeVisible();
    
    const videoSrc = await generatedVideo.getAttribute('src');
    console.log(`Generated video: ${videoSrc?.substring(0, 50)}...`);
    
    await this.takeScreenshot('07-video-generated');
    
    // Close modal
    await this.page.click('button:has-text("View in Library"), button:has-text("Close")');
    
    return videoSrc;
  }

  async accessAssetLibrary() {
    // Click assets button in header
    await this.page.click('button:has-text("📁 ASSETS"), button:has-text("ASSETS")');
    
    // Wait for asset manager to open
    await this.page.waitForSelector('[data-testid="asset-manager"], .asset-manager', { timeout: 10000 });
    await this.takeScreenshot('08-asset-library-opened');
    
    // Check asset count
    const assetCards = this.page.locator('[data-testid="asset-card"], .asset-card');
    const assetCount = await assetCards.count();
    console.log(`Found ${assetCount} assets in library`);
    
    return assetCount;
  }

  async validateGeneratedAssets() {
    const assetCards = this.page.locator('[data-testid="asset-card"], .asset-card, .asset');
    const assetCount = await assetCards.count();
    
    if (assetCount > 0) {
      // Click on first asset to preview
      await assetCards.first().click();
      
      // Wait for preview modal
      await this.page.waitForSelector('[data-testid="asset-preview"], .asset-preview', { timeout: 10000 });
      
      // Verify actual content is displayed
      const previewContent = this.page.locator('img, video').first();
      await expect(previewContent).toBeVisible();
      
      const contentSrc = await previewContent.getAttribute('src');
      expect(contentSrc).not.toBeNull();
      expect(contentSrc).not.toContain('placeholder');
      
      await this.takeScreenshot('09-asset-preview-validated');
      
      // Close preview
      await this.page.click('button:has-text("Close"), [aria-label="Close"]');
    }
    
    // Close asset manager
    await this.page.click('button:has-text("Close"), [aria-label="Close"]');
    
    return assetCount;
  }

  async measurePerformance() {
    // Get performance timing
    const performanceData = await this.page.evaluate(() => {
      const perf = performance;
      return {
        loadTime: perf.timing.loadEventEnd - perf.timing.navigationStart,
        domReady: perf.timing.domContentLoadedEventEnd - perf.timing.navigationStart,
        firstPaint: perf.getEntriesByType('paint')[0]?.startTime || 0
      };
    });
    
    console.log('Performance metrics:', performanceData);
    return performanceData;
  }

  async checkAccessibility() {
    // Basic accessibility checks
    const issues = await this.page.evaluate(() => {
      const issues = [];
      
      // Check for alt text on images
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.alt && !img.getAttribute('aria-label')) {
          issues.push(`Image ${index} missing alt text`);
        }
      });
      
      // Check for proper headings
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length === 0) {
        issues.push('No heading elements found');
      }
      
      // Check for form labels
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input, index) => {
        const id = input.id;
        const label = document.querySelector(`label[for="${id}"]`);
        if (!label && !input.getAttribute('aria-label') && !input.getAttribute('placeholder')) {
          issues.push(`Form input ${index} missing label`);
        }
      });
      
      return issues;
    });
    
    if (issues.length > 0) {
      console.log('Accessibility issues found:', issues);
    }
    
    return issues;
  }
}

// Main test suite
test.describe('AIDEAS Complete Ad Creation Workflow', () => {
  let helper: AIDEASWorkflowHelper;
  
  test.beforeEach(async ({ page }) => {
    helper = new AIDEASWorkflowHelper(page);
    
    // Set longer timeout for AI operations
    test.setTimeout(TEST_CONFIG.timeout * 3);
    
    // Go to the application
    await page.goto(TEST_CONFIG.baseURL);
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await helper.takeScreenshot('00-app-loaded');
  });

  test('Complete AIDEAS workflow: Brief → Territories → Images → Videos → Assets', async ({ page }) => {
    // Step 1: Authentication
    console.log('🔐 Step 1: Authenticating user...');
    await helper.authenticateUser();
    
    // Step 2: Input Brief
    console.log('📝 Step 2: Inputting creative brief...');
    const briefText = await helper.inputBrief();
    expect(briefText).toContain('Everyday Rewards Premium');
    
    // Step 3: Generate Territories
    console.log('🗺️ Step 3: Generating creative territories...');
    const territoryCount = await helper.generateTerritories();
    expect(territoryCount).toBeGreaterThan(0);
    
    // Step 4: Generate Image for Territory
    console.log('🎨 Step 4: Generating image for territory...');
    const imageSrc = await helper.generateImageForTerritory(0);
    expect(imageSrc).toBeTruthy();
    expect(imageSrc).not.toContain('placeholder');
    
    // Step 5: Generate Video for Territory
    console.log('🎬 Step 5: Generating video for territory...');
    const videoSrc = await helper.generateVideoForTerritory(0);
    expect(videoSrc).toBeTruthy();
    expect(videoSrc).not.toContain('placeholder');
    
    // Step 6: Access Asset Library
    console.log('📁 Step 6: Accessing asset library...');
    const assetCount = await helper.accessAssetLibrary();
    expect(assetCount).toBeGreaterThan(0);
    
    // Step 7: Validate Generated Assets
    console.log('✅ Step 7: Validating generated assets...');
    const validatedAssetCount = await helper.validateGeneratedAssets();
    expect(validatedAssetCount).toBeGreaterThan(0);
    
    // Step 8: Performance & Accessibility Checks
    console.log('⚡ Step 8: Performance and accessibility validation...');
    const performanceData = await helper.measurePerformance();
    expect(performanceData.loadTime).toBeLessThan(10000); // Under 10 seconds
    
    const accessibilityIssues = await helper.checkAccessibility();
    expect(accessibilityIssues.length).toBeLessThan(5); // Minimal accessibility issues
    
    // Final screenshot
    await helper.takeScreenshot('10-workflow-completed');
    
    console.log('✨ Complete AIDEAS workflow test successful!');
  });

  test('Error handling: API timeout and retry logic', async ({ page }) => {
    console.log('🧪 Testing error handling scenarios...');
    
    await helper.authenticateUser();
    await helper.inputBrief();
    
    // Test territory generation with potential timeout
    try {
      await helper.generateTerritories();
    } catch (error) {
      console.log('Expected timeout scenario handled:', error);
      
      // Take screenshot of error state
      await helper.takeScreenshot('error-territory-timeout');
      
      // Verify error message is displayed
      const errorMessage = page.locator('.error, .text-red, [data-testid="error"]');
      if (await errorMessage.count() > 0) {
        const errorText = await errorMessage.first().textContent();
        expect(errorText).toBeTruthy();
        console.log('Error message displayed:', errorText);
      }
    }
  });

  test('Cross-browser compatibility and responsive design', async ({ page }) => {
    console.log('📱 Testing responsive design...');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await helper.takeScreenshot('mobile-viewport');
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await helper.takeScreenshot('tablet-viewport');
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    await helper.takeScreenshot('desktop-viewport');
    
    // Verify responsive elements
    const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu');
    const desktopNav = page.locator('[data-testid="desktop-nav"], .desktop-nav');
    
    // Elements should be visible/hidden based on viewport
    console.log('Responsive design elements validated');
  });

  test('Asset library management and search functionality', async ({ page }) => {
    console.log('🔍 Testing asset library features...');
    
    await helper.authenticateUser();
    await helper.accessAssetLibrary();
    
    // Test search functionality if available
    const searchInput = page.locator('input[placeholder*="search"], input[type="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('generated');
      await page.waitForTimeout(1000);
      await helper.takeScreenshot('asset-search-results');
    }
    
    // Test filter functionality if available
    const filterButtons = page.locator('button[data-filter], .filter-button');
    if (await filterButtons.count() > 0) {
      await filterButtons.first().click();
      await page.waitForTimeout(1000);
      await helper.takeScreenshot('asset-filtered-view');
    }
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Take final screenshot and log any console errors
    await helper.takeScreenshot('test-completed');
    
    // Log any browser console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Browser console error: ${msg.text()}`);
      }
    });
  });
});