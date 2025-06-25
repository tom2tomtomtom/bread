// Application configuration and constants
export const APP_CONFIG = {
  // Application metadata
  name: 'BREAD Creative Platform',
  version: '2.0.0',
  description: 'AI-powered creative territory and headline generation for Everyday Rewards',

  // API configuration
  api: {
    timeout: 30000, // 30 seconds
    retries: 3,
    baseUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://your-app.netlify.app/.netlify/functions'
        : '/.netlify/functions',
  },

  // Generation settings
  generation: {
    defaultTerritoryCount: 6,
    defaultHeadlinesPerTerritory: 3,
    maxBriefLength: 2000,
    minBriefLength: 10,
    progressBarDuration: {
      withImages: 45000, // 45 seconds
      withoutImages: 30000, // 30 seconds
    },
  },

  // UI configuration
  ui: {
    toastDuration: 3000, // 3 seconds
    animationDuration: 300, // 0.3 seconds
    debounceDelay: 500, // 0.5 seconds for search/input
    maxDisplayLines: 10, // For truncated content
  },

  // Storage configuration
  storage: {
    keys: {
      prompts: 'bread_prompts',
      apiKeys: 'bread_openai_key',
      generateImages: 'bread_generate_images',
      starredItems: 'bread_starred_items',
      appState: 'bread-app-storage',
    },
    version: '2.0', // For migration handling
  },

  // Feature flags
  features: {
    imageGeneration: true,
    briefAnalysis: true,
    starredItems: true,
    exportFunctionality: false, // Future feature
    collaborativeEditing: false, // Future feature
    templateLibrary: false, // Future feature
  },

  // Validation rules
  validation: {
    brief: {
      minLength: 10,
      maxLength: 2000,
      requiredKeywords: [], // Could add required terms
    },
    prompts: {
      maxLength: 10000, // Per prompt section
    },
  },

  // Error messages
  errors: {
    generation: {
      noBrief: 'Please enter a brief before generating.',
      apiError: 'Failed to generate content. Please try again.',
      timeout: 'Generation timed out. Please try again.',
      invalidResponse: 'Received invalid response from AI service.',
    },
    validation: {
      briefTooShort: 'Brief must be at least 10 characters long.',
      briefTooLong: 'Brief must be less than 2000 characters.',
      invalidApiKey: 'Please provide a valid API key.',
    },
    network: {
      offline: 'You appear to be offline. Please check your connection.',
      serverError: 'Server error occurred. Please try again later.',
    },
  },

  // Success messages
  success: {
    generation: 'Creative territories generated successfully! 🎉',
    save: 'Configuration saved successfully!',
    apiKey: 'API Key saved successfully!',
    export: 'Content exported successfully!',
  },
};

// Environment-specific configuration
export const ENV_CONFIG = {
  development: {
    debug: true,
    logLevel: 'debug',
    showDevTools: true,
  },
  production: {
    debug: false,
    logLevel: 'error',
    showDevTools: false,
  },
  test: {
    debug: false,
    logLevel: 'silent',
    showDevTools: false,
  },
};

// Get current environment configuration
export const getCurrentEnvConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return ENV_CONFIG[env as keyof typeof ENV_CONFIG] || ENV_CONFIG.development;
};

// Utility functions for configuration
export const getApiUrl = (endpoint: string) => {
  return `${APP_CONFIG.api.baseUrl}/${endpoint}`;
};

export const isFeatureEnabled = (feature: keyof typeof APP_CONFIG.features) => {
  return APP_CONFIG.features[feature];
};

export const getStorageKey = (key: keyof typeof APP_CONFIG.storage.keys) => {
  return APP_CONFIG.storage.keys[key];
};

// Campaign moment definitions
export const CAMPAIGN_MOMENTS = [
  {
    name: 'Christmas Shopping',
    date: 'December 2024',
    description: 'Holiday shopping season with focus on family and gifts',
    keywords: ['christmas', 'holiday', 'family', 'gifts', 'celebration'],
  },
  {
    name: 'Black Friday',
    date: 'November 2024',
    description: 'Counter flash sales with consistent everyday value',
    keywords: ['black friday', 'sales', 'deals', 'shopping', 'value'],
  },
  {
    name: 'Back to School',
    date: 'January 2025',
    description: 'Family preparation and budget management for school year',
    keywords: ['school', 'family', 'budget', 'preparation', 'routine'],
  },
  {
    name: "Mother's Day",
    date: 'May 2025',
    description: 'Celebrating mothers with thoughtful shopping',
    keywords: ['mothers day', 'family', 'celebration', 'gifts', 'appreciation'],
  },
  {
    name: "Father's Day",
    date: 'September 2025',
    description: 'Celebrating fathers with meaningful purchases',
    keywords: ['fathers day', 'family', 'celebration', 'gifts', 'appreciation'],
  },
  {
    name: 'EOFY Sales',
    date: 'June 2025',
    description: 'End of financial year shopping and tax time',
    keywords: ['eofy', 'tax', 'financial', 'savings', 'year end'],
  },
];

// Brand color palette and styling constants
export const BRAND_COLORS = {
  primary: {
    yellow: '#FFD700',
    orange: '#FF8C00',
    red: '#FF4444',
  },
  secondary: {
    blue: '#0066CC',
    green: '#00AA44',
    purple: '#8844CC',
  },
  neutral: {
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    gray: '#888888',
    darkGray: '#333333',
    black: '#000000',
  },
  status: {
    success: '#00AA44',
    warning: '#FF8C00',
    error: '#FF4444',
    info: '#0066CC',
  },
};

// Typography scale
export const TYPOGRAPHY = {
  fontFamilies: {
    logo: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    mono: 'Monaco, Consolas, monospace',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
};
