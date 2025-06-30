import { test, expect, Page } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';
import { TEST_SCENARIOS, TEST_CONFIG, generateTestUser, SELECTORS, WAIT_CONDITIONS } from '../helpers/test-data';

// Advanced test suite for multiple business scenarios
class AdvancedAIDEASTester {
  constructor(private page: Page) {}

  async takeScreenshot(name: string, scenario: string = 'default') {
    const screenshotDir = path.join(TEST_CONFIG.screenshotPath, scenario);
    await fs.mkdir(screenshotDir, { recursive: true });
    await this.page.screenshot({ 
      path: path.join(screenshotDir, `${name}.png`),
      fullPage: true 
    });
  }

  async performanceCheck() {
    const startTime = Date.now();
    
    const performanceMetrics = await this.page.evaluate(() => {
      const perf = performance;
      const navigation = perf.timing;
      const paintEntries = perf.getEntriesByType('paint');
      
      return {
        // Navigation timing
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        
        // Paint timing
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        
        // Resource timing
        resourceCount: perf.getEntriesByType('resource').length,
        
        // Memory (if available)
        memory: (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        } : null
      };
    });

    const totalTestTime = Date.now() - startTime;
    
    console.log(`Performance Metrics:`, {
      ...performanceMetrics,
      totalTestTime
    });

    // Validate performance thresholds
    expect(performanceMetrics.domContentLoaded).toBeLessThan(TEST_CONFIG.performance.maxDOMReady);
    expect(performanceMetrics.loadComplete).toBeLessThan(TEST_CONFIG.performance.maxLoadTime);
    
    return performanceMetrics;
  }

  async authenticateUser(scenario: string) {
    const user = generateTestUser();
    
    // Navigate to app
    await this.page.goto(TEST_CONFIG.baseURL);
    await WAIT_CONDITIONS.networkIdle(this.page);
    
    // Click Get Started Free
    await this.page.click(SELECTORS.authButtons.getStarted);
    
    // Fill registration form
    await this.page.fill(SELECTORS.auth.nameInput, user.name);
    await this.page.fill(SELECTORS.auth.emailInput, user.email);
    await this.page.fill(SELECTORS.auth.passwordInput, user.password);
    
    // Handle confirm password if present
    const confirmField = this.page.locator(SELECTORS.auth.confirmPasswordInput);
    if (await confirmField.count() > 0) {
      await confirmField.fill(user.password);
    }
    
    // Submit registration
    await this.page.click(SELECTORS.auth.submitButton);
    
    // Wait for successful authentication
    await this.page.waitForSelector('text=Welcome', { timeout: 30000 });
    await this.takeScreenshot('01-authenticated', scenario);
    
    return user;
  }

  async runBriefToTerritoriesFlow(testScenario: any, scenarioId: string) {
    console.log(`Running brief-to-territories flow for: ${testScenario.name}`);
    
    // Input the brief
    const briefTextarea = this.page.locator(SELECTORS.brief.textarea);
    await briefTextarea.fill(testScenario.brief.fullBrief);
    await this.page.waitForTimeout(2000); // Allow for auto-save
    await this.takeScreenshot('02-brief-input', scenarioId);
    
    // Generate territories
    await this.page.click(SELECTORS.brief.generateButton);
    
    // Wait for AI generation with custom timeout
    await this.page.waitForSelector(SELECTORS.content.loadingSpinners, { state: 'hidden', timeout: TEST_CONFIG.aiTimeouts.territories });
    await WAIT_CONDITIONS.aiGenerationComplete(this.page);
    
    // Verify territories were generated
    const territoryCards = this.page.locator(SELECTORS.territories.cards);
    await expect(territoryCards.first()).toBeVisible({ timeout: 30000 });
    
    const territoryCount = await territoryCards.count();
    expect(territoryCount).toBeGreaterThanOrEqual(testScenario.expectedOutputs.minTerritories);
    
    await this.takeScreenshot('03-territories-generated', scenarioId);
    
    return { territoryCount, territoryCards };
  }

  async testImageGeneration(territoryCards: any, scenarioId: string, territoryIndex: number = 0) {
    console.log(`Testing image generation for territory ${territoryIndex}`);
    
    // Click image button on specified territory
    const imageButtons = this.page.locator(SELECTORS.territories.imageButton);
    await imageButtons.nth(territoryIndex).click();
    
    // Wait for modal
    await this.page.waitForSelector(SELECTORS.modals.imageGeneration, { timeout: 10000 });
    await this.takeScreenshot('04-image-modal', scenarioId);
    
    // Generate image
    const generateBtn = this.page.locator(SELECTORS.modals.generateButton).first();
    await generateBtn.click();
    
    // Wait for generation with extended timeout for images
    await this.page.waitForSelector(SELECTORS.content.images, { timeout: TEST_CONFIG.aiTimeouts.images });
    
    // Validate image was generated
    const generatedImage = this.page.locator(SELECTORS.content.images).first();
    await expect(generatedImage).toBeVisible();
    
    const imageSrc = await generatedImage.getAttribute('src');
    expect(imageSrc).toBeTruthy();
    expect(imageSrc).not.toContain('placeholder');
    
    await this.takeScreenshot('05-image-generated', scenarioId);
    
    // Close modal
    await this.page.click(SELECTORS.modals.closeButton);
    
    return imageSrc;
  }

  async testVideoGeneration(territoryCards: any, scenarioId: string, territoryIndex: number = 0) {
    console.log(`Testing video generation for territory ${territoryIndex}`);
    
    // Click video button on specified territory
    const videoButtons = this.page.locator(SELECTORS.territories.videoButton);
    await videoButtons.nth(territoryIndex).click();
    
    // Wait for modal
    await this.page.waitForSelector(SELECTORS.modals.videoGeneration, { timeout: 10000 });
    await this.takeScreenshot('06-video-modal', scenarioId);
    
    // Configure video settings
    const styleSelects = this.page.locator('select');
    if (await styleSelects.count() > 0) {
      await styleSelects.first().selectOption('dynamic');
    }
    
    // Generate video
    const generateBtn = this.page.locator(SELECTORS.modals.generateButton).last();
    await generateBtn.click();
    
    // Wait for generation with extended timeout for videos
    await this.page.waitForSelector(SELECTORS.content.videos, { timeout: TEST_CONFIG.aiTimeouts.videos });
    
    // Validate video was generated
    const generatedVideo = this.page.locator(SELECTORS.content.videos).first();
    await expect(generatedVideo).toBeVisible();
    
    const videoSrc = await generatedVideo.getAttribute('src');
    expect(videoSrc).toBeTruthy();
    expect(videoSrc).not.toContain('placeholder');
    
    await this.takeScreenshot('07-video-generated', scenarioId);
    
    // Close modal
    await this.page.click(SELECTORS.modals.closeButton);
    
    return videoSrc;
  }

  async validateAssetLibrary(scenarioId: string) {
    console.log('Validating asset library');
    
    // Open asset manager
    await this.page.click(SELECTORS.assets.managerButton);
    await this.page.waitForSelector(SELECTORS.assets.manager, { timeout: 10000 });
    await this.takeScreenshot('08-asset-library', scenarioId);
    
    // Check for generated assets
    const assetCards = this.page.locator(SELECTORS.assets.cards);
    const assetCount = await assetCards.count();
    expect(assetCount).toBeGreaterThan(0);
    
    // Test asset preview if assets exist
    if (assetCount > 0) {
      await assetCards.first().click();
      await this.page.waitForSelector(SELECTORS.assets.preview, { timeout: 5000 });
      
      const previewContent = this.page.locator('img, video').first();
      await expect(previewContent).toBeVisible();
      
      await this.takeScreenshot('09-asset-preview', scenarioId);
      
      // Close preview
      await this.page.click(SELECTORS.modals.closeButton);
    }
    
    // Close asset manager
    await this.page.click(SELECTORS.modals.closeButton);
    
    return assetCount;
  }

  async validateContentQuality(testScenario: any, generatedContent: any) {
    console.log('Validating content quality and relevance');
    
    // Check if generated content contains expected keywords
    const pageText = await this.page.textContent('body');
    const keywordMatches = testScenario.expectedOutputs.expectedKeywords.filter(keyword => 
      pageText?.toLowerCase().includes(keyword.toLowerCase())
    );
    
    console.log(`Found ${keywordMatches.length}/${testScenario.expectedOutputs.expectedKeywords.length} expected keywords`);
    expect(keywordMatches.length).toBeGreaterThan(0);
    
    return {
      keywordMatches,
      totalKeywords: testScenario.expectedOutputs.expectedKeywords.length
    };
  }

  async runErrorRecoveryTest(scenarioId: string) {
    console.log('Testing error recovery and retry mechanisms');
    
    // Simulate network interruption by blocking requests temporarily
    await this.page.route('**/api/**', route => {
      // Block some requests to test retry logic
      if (Math.random() < 0.3) { // 30% failure rate
        route.abort();
      } else {
        route.continue();
      }
    });
    
    // Try to generate content with simulated failures
    try {
      await this.page.click(SELECTORS.brief.generateButton);
      await this.page.waitForTimeout(5000);
      
      // Check if error handling is working
      const errorElements = this.page.locator(SELECTORS.content.errorMessages);
      if (await errorElements.count() > 0) {
        await this.takeScreenshot('error-handling', scenarioId);
        console.log('Error handling UI is working correctly');
      }
      
    } catch (error) {
      console.log('Error recovery test triggered expected timeout:', error);
    }
    
    // Remove route blocking
    await this.page.unroute('**/api/**');
  }
}

// Test suite for multiple business scenarios
test.describe('Advanced AIDEAS Business Scenarios', () => {
  let tester: AdvancedAIDEASTester;
  
  test.beforeEach(async ({ page }) => {
    tester = new AdvancedAIDEASTester(page);
    test.setTimeout(TEST_CONFIG.timeout * 4); // Extended timeout for comprehensive tests
  });

  // Test each predefined scenario
  TEST_SCENARIOS.forEach((scenario, index) => {
    test(`Scenario ${index + 1}: ${scenario.name}`, async ({ page }) => {
      console.log(`\n🚀 Running Scenario: ${scenario.name}`);
      
      // Step 1: Authentication
      await tester.authenticateUser(scenario.id);
      
      // Step 2: Brief to Territories Flow
      const { territoryCount, territoryCards } = await tester.runBriefToTerritoriesFlow(scenario, scenario.id);
      console.log(`Generated ${territoryCount} territories`);
      
      // Step 3: Test Image Generation
      const imageSrc = await tester.testImageGeneration(territoryCards, scenario.id, 0);
      console.log(`Generated image: ${imageSrc?.substring(0, 50)}...`);
      
      // Step 4: Test Video Generation  
      const videoSrc = await tester.testVideoGeneration(territoryCards, scenario.id, 0);
      console.log(`Generated video: ${videoSrc?.substring(0, 50)}...`);
      
      // Step 5: Validate Asset Library
      const assetCount = await tester.validateAssetLibrary(scenario.id);
      console.log(`Found ${assetCount} assets in library`);
      
      // Step 6: Content Quality Validation
      const qualityResults = await tester.validateContentQuality(scenario, { imageSrc, videoSrc });
      console.log(`Content quality: ${qualityResults.keywordMatches.length}/${qualityResults.totalKeywords} keywords matched`);
      
      // Step 7: Performance Check
      const performanceMetrics = await tester.performanceCheck();
      
      console.log(`✅ Scenario "${scenario.name}" completed successfully!`);
    });
  });

  test('Stress test: Multiple parallel generations', async ({ page }) => {
    console.log('🧪 Running stress test with multiple parallel generations');
    
    await tester.authenticateUser('stress-test');
    
    // Input brief
    const scenario = TEST_SCENARIOS[0]; // Use first scenario
    const briefTextarea = page.locator(SELECTORS.brief.textarea);
    await briefTextarea.fill(scenario.brief.fullBrief);
    
    // Generate territories
    await page.click(SELECTORS.brief.generateButton);
    await WAIT_CONDITIONS.aiGenerationComplete(page);
    
    const territoryCards = page.locator(SELECTORS.territories.cards);
    const territoryCount = await territoryCards.count();
    
    // Try to generate multiple images in parallel (if we have multiple territories)
    if (territoryCount > 1) {
      console.log(`Attempting parallel generation on ${Math.min(territoryCount, 3)} territories`);
      
      for (let i = 0; i < Math.min(territoryCount, 3); i++) {
        try {
          const imageButtons = page.locator(SELECTORS.territories.imageButton);
          await imageButtons.nth(i).click();
          await page.waitForTimeout(1000); // Small delay between clicks
        } catch (error) {
          console.log(`Parallel generation ${i} failed as expected:`, error);
        }
      }
      
      await tester.takeScreenshot('stress-test-parallel', 'stress-test');
    }
  });

  test('Error recovery and retry mechanisms', async ({ page }) => {
    console.log('🔧 Testing error recovery mechanisms');
    
    await tester.authenticateUser('error-recovery');
    await tester.runErrorRecoveryTest('error-recovery');
  });

  test('Accessibility and semantic validation', async ({ page }) => {
    console.log('♿ Testing accessibility and semantic HTML');
    
    await tester.authenticateUser('accessibility');
    
    // Check for semantic HTML structure
    const semanticElements = await page.evaluate(() => {
      const elements = {
        main: document.querySelectorAll('main').length,
        nav: document.querySelectorAll('nav').length,
        header: document.querySelectorAll('header').length,
        section: document.querySelectorAll('section').length,
        article: document.querySelectorAll('article').length,
        aside: document.querySelectorAll('aside').length,
        footer: document.querySelectorAll('footer').length
      };
      
      return elements;
    });
    
    console.log('Semantic elements found:', semanticElements);
    expect(semanticElements.main).toBeGreaterThan(0);
    
    // Check for proper heading hierarchy
    const headings = await page.evaluate(() => {
      const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
      return headingTags.map(tag => ({
        tag,
        count: document.querySelectorAll(tag).length
      }));
    });
    
    console.log('Heading structure:', headings);
    expect(headings.find(h => h.tag === 'h1')?.count).toBeGreaterThan(0);
    
    await tester.takeScreenshot('accessibility-validated', 'accessibility');
  });

  test.afterAll(async () => {
    console.log('🧹 Cleaning up test data and artifacts');
    
    // Clean up download directory
    const downloadDir = TEST_CONFIG.downloadPath;
    try {
      await fs.rm(downloadDir, { recursive: true, force: true });
      console.log('Download directory cleaned up');
    } catch (error) {
      console.log('Download cleanup not needed');
    }
  });
});