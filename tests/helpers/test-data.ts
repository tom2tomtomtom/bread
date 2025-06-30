export interface TestScenario {
  id: string;
  name: string;
  brief: {
    product: string;
    audience: string;
    goal: string;
    keyMessage: string;
    brandPersonality: string;
    fullBrief: string;
  };
  expectedOutputs: {
    minTerritories: number;
    expectedKeywords: string[];
    videoFormat: string;
    duration: number;
  };
}

export const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'everyday-rewards-premium',
    name: 'Everyday Rewards Premium Membership Campaign',
    brief: {
      product: 'Everyday Rewards Premium Membership',
      audience: 'Busy Australian families with household income $80k+',
      goal: 'Drive membership upgrades during Q4 holiday shopping',
      keyMessage: 'Save more on everything you buy for the holidays',
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
    },
    expectedOutputs: {
      minTerritories: 3,
      expectedKeywords: ['premium', 'rewards', 'family', 'savings', 'holiday'],
      videoFormat: '9:16',
      duration: 8
    }
  },
  {
    id: 'nike-running-shoes',
    name: 'Nike Performance Running Campaign',
    brief: {
      product: 'Nike Air Zoom Pegasus 40',
      audience: 'Amateur runners aged 25-40 who run 3-5 times per week',
      goal: 'Increase sales of the new Pegasus 40 model',
      keyMessage: 'Your daily run just got an upgrade',
      brandPersonality: 'Motivational, innovative, performance-focused',
      fullBrief: `
Launch campaign for Nike Air Zoom Pegasus 40 targeting committed amateur runners who prioritize consistency and performance improvement.

Campaign Goal: Drive sales of the new Pegasus 40 during the peak running season (spring/fall).

Key Message: "Your daily run just got an upgrade" - focusing on how the new technology enhances every training session.

Target Audience:
- Amateur runners aged 25-40
- Run 3-5 times per week consistently  
- Value performance and comfort over fashion
- Willing to invest in quality running gear
- Active on fitness apps and social media

Brand Personality: Motivational, innovative, performance-focused, empowering, and technically superior.

Format Requirements: 15-second video for YouTube pre-roll and Instagram Reels.

Success Metrics: Increase Pegasus 40 sales, boost brand consideration among serious runners, drive engagement with Nike Run Club app.
      `.trim()
    },
    expectedOutputs: {
      minTerritories: 3,
      expectedKeywords: ['performance', 'running', 'upgrade', 'training', 'comfort'],
      videoFormat: '16:9',
      duration: 15
    }
  }
];

export const TEST_CONFIG = {
  baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://aideas-redbaez.netlify.app',
  timeout: 120000, // 2 minutes for AI operations
  retries: 2,
  screenshotPath: 'tests/screenshots',
  downloadPath: 'tests/downloads',
  
  // Performance thresholds
  performance: {
    maxLoadTime: 10000, // 10 seconds
    maxDOMReady: 5000,  // 5 seconds
    maxFirstPaint: 3000  // 3 seconds
  },
  
  // Accessibility thresholds
  accessibility: {
    maxIssues: 5,
    requiredElements: ['h1', 'nav', 'main']
  },
  
  // AI generation timeouts
  aiTimeouts: {
    territories: 60000,    // 1 minute
    images: 120000,       // 2 minutes
    videos: 180000,       // 3 minutes
    copy: 90000          // 1.5 minutes
  }
};

export const generateTestUser = () => ({
  email: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@aideas.test`,
  password: 'TestPassword123!',
  name: `Test User ${Date.now()}`
});

export const SELECTORS = {
  // Navigation
  authButtons: {
    getStarted: 'button:has-text("Get Started Free")',
    signIn: 'button:has-text("Sign In")',
    signUp: 'button:has-text("Sign Up")'
  },
  
  // Forms
  auth: {
    nameInput: 'input[placeholder*="name"], input[type="text"]',
    emailInput: 'input[type="email"]',
    passwordInput: 'input[type="password"]',
    confirmPasswordInput: 'input[placeholder*="confirm"], input[name*="confirm"]',
    submitButton: 'button:has-text("Sign Up"), button:has-text("Create Account")'
  },
  
  // Brief input
  brief: {
    textarea: 'textarea[placeholder*="brief"], textarea',
    generateButton: 'button:has-text("GENERATE TERRITORIES"), button:has-text("Generate")'
  },
  
  // Territory generation
  territories: {
    cards: '.territory-card, [data-testid="territory-card"]',
    imageButton: 'button:has-text("Image"), button:has-text("🎨")',
    videoButton: 'button:has-text("Video"), button:has-text("🎬")'
  },
  
  // Modals
  modals: {
    imageGeneration: '[data-testid="image-generation-modal"], .modal',
    videoGeneration: '[data-testid="video-generation-modal"], .modal',
    generateButton: 'button:has-text("Generate Image"), button:has-text("Generate Video"), button:has-text("🎨 Generate"), button:has-text("🎬 Generate")',
    closeButton: 'button:has-text("Close"), [aria-label="Close"]'
  },
  
  // Assets
  assets: {
    managerButton: 'button:has-text("📁 ASSETS"), button:has-text("ASSETS")',
    manager: '[data-testid="asset-manager"], .asset-manager',
    cards: '[data-testid="asset-card"], .asset-card, .asset',
    preview: '[data-testid="asset-preview"], .asset-preview'
  },
  
  // Generated content
  content: {
    images: 'img[src*="data:"], img[src*="blob:"], img[src*="https://"]',
    videos: 'video, [data-testid="generated-video"]',
    loadingSpinners: '.animate-spin',
    errorMessages: '.error, .text-red, [data-testid="error"]'
  }
};

export const WAIT_CONDITIONS = {
  // Wait for AI generation to complete
  aiGenerationComplete: (page: any) => page.waitForFunction(() => {
    const loadingTexts = ['Generating...', 'Processing...', 'Creating...'];
    return !loadingTexts.some(text => 
      document.body.textContent?.includes(text)
    );
  }),
  
  // Wait for images to load
  imagesLoaded: (page: any) => page.waitForFunction(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.every(img => img.complete && img.naturalHeight !== 0);
  }),
  
  // Wait for network idle
  networkIdle: (page: any) => page.waitForLoadState('networkidle')
};