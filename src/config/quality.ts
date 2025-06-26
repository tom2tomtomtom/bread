/**
 * A+ Code Quality Configuration
 * 
 * Comprehensive quality gates and standards for production-ready code
 */

export const QUALITY_STANDARDS = {
  // Performance Thresholds
  performance: {
    componentRenderTime: 16, // 60fps threshold in ms
    apiResponseTime: 2000, // Max API response time in ms
    bundleSize: 1500000, // Max bundle size in bytes (1.5MB)
    memoryUsage: 80, // Max memory usage percentage
    lighthouseScore: 95, // Minimum Lighthouse score
  },

  // Code Quality Metrics
  codeQuality: {
    testCoverage: 90, // Minimum test coverage percentage
    cyclomaticComplexity: 10, // Max cyclomatic complexity
    maxFunctionLength: 50, // Max lines per function
    maxFileLength: 300, // Max lines per file
    maxComponentProps: 10, // Max props per component
    duplicateCodeThreshold: 5, // Max duplicate code percentage
  },

  // Accessibility Standards
  accessibility: {
    wcagLevel: 'AA', // WCAG compliance level
    colorContrast: 4.5, // Minimum color contrast ratio
    keyboardNavigation: true, // Must support keyboard navigation
    screenReaderSupport: true, // Must support screen readers
    semanticHTML: true, // Must use semantic HTML elements
  },

  // Security Requirements
  security: {
    noHardcodedSecrets: true, // No hardcoded API keys or secrets
    csrfProtection: true, // CSRF protection enabled
    xssProtection: true, // XSS protection enabled
    httpsOnly: true, // HTTPS only in production
    secureHeaders: true, // Security headers configured
  },

  // Browser Support
  browserSupport: {
    chrome: '90+',
    firefox: '88+',
    safari: '14+',
    edge: '90+',
    mobile: true, // Mobile browser support required
  },
} as const;

export const QUALITY_GATES = {
  // Pre-commit checks
  preCommit: [
    'lint',
    'typecheck',
    'test:unit',
    'format',
    'security-scan',
  ],

  // Pre-push checks
  prePush: [
    'test:integration',
    'test:e2e',
    'build',
    'bundle-analysis',
    'performance-audit',
  ],

  // Pre-deployment checks
  preDeployment: [
    'lighthouse-audit',
    'accessibility-audit',
    'security-audit',
    'load-testing',
    'smoke-tests',
  ],
} as const;

export const CODE_REVIEW_CHECKLIST = {
  architecture: [
    'Single Responsibility Principle followed',
    'Proper separation of concerns',
    'Clean architecture patterns used',
    'No circular dependencies',
    'Appropriate design patterns applied',
  ],

  performance: [
    'React.memo used where appropriate',
    'useMemo/useCallback for expensive operations',
    'No unnecessary re-renders',
    'Lazy loading implemented',
    'Bundle size optimized',
  ],

  security: [
    'No sensitive data in client code',
    'Input validation implemented',
    'Output sanitization applied',
    'Authentication/authorization checked',
    'Error messages don\'t leak information',
  ],

  testing: [
    'Unit tests cover all business logic',
    'Integration tests for user flows',
    'Edge cases tested',
    'Error scenarios covered',
    'Performance tests included',
  ],

  accessibility: [
    'Semantic HTML used',
    'ARIA labels where needed',
    'Keyboard navigation works',
    'Color contrast meets standards',
    'Screen reader compatible',
  ],

  maintainability: [
    'Code is self-documenting',
    'Complex logic has comments',
    'Consistent naming conventions',
    'No code duplication',
    'Easy to extend and modify',
  ],
} as const;

export const MONITORING_ALERTS = {
  performance: {
    slowComponentRender: {
      threshold: QUALITY_STANDARDS.performance.componentRenderTime,
      severity: 'warning',
      action: 'Optimize component rendering',
    },
    slowAPIResponse: {
      threshold: QUALITY_STANDARDS.performance.apiResponseTime,
      severity: 'error',
      action: 'Investigate API performance',
    },
    highMemoryUsage: {
      threshold: QUALITY_STANDARDS.performance.memoryUsage,
      severity: 'warning',
      action: 'Check for memory leaks',
    },
  },

  errors: {
    errorRate: {
      threshold: 1, // 1% error rate
      severity: 'critical',
      action: 'Immediate investigation required',
    },
    crashRate: {
      threshold: 0.1, // 0.1% crash rate
      severity: 'critical',
      action: 'Emergency response required',
    },
  },

  user: {
    bounceRate: {
      threshold: 40, // 40% bounce rate
      severity: 'warning',
      action: 'Review user experience',
    },
    loadTime: {
      threshold: 3000, // 3 seconds
      severity: 'warning',
      action: 'Optimize loading performance',
    },
  },
} as const;

export const DEVELOPMENT_STANDARDS = {
  // Git workflow
  git: {
    branchNaming: /^(feature|bugfix|hotfix|release)\/[a-z0-9-]+$/,
    commitMessage: /^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}/,
    maxCommitSize: 100, // Max files changed per commit
    requirePR: true, // All changes must go through PR
    requireReview: true, // All PRs must be reviewed
  },

  // Code organization
  codeOrganization: {
    maxDirectoryDepth: 5,
    fileNamingConvention: 'kebab-case',
    componentNamingConvention: 'PascalCase',
    hookNamingConvention: 'camelCase',
    constantNamingConvention: 'SCREAMING_SNAKE_CASE',
  },

  // Documentation requirements
  documentation: {
    apiDocumentation: true, // All APIs must be documented
    componentDocumentation: true, // All components must have JSDoc
    readmeUpToDate: true, // README must be current
    changelogMaintained: true, // CHANGELOG must be updated
    architectureDocumented: true, // Architecture decisions documented
  },
} as const;

export const PRODUCTION_READINESS_CHECKLIST = [
  // Performance
  '✅ Lighthouse score ≥ 95',
  '✅ Bundle size < 1.5MB',
  '✅ Load time < 3 seconds',
  '✅ Memory usage < 80%',
  
  // Quality
  '✅ Test coverage ≥ 90%',
  '✅ No TypeScript errors',
  '✅ No ESLint errors',
  '✅ No security vulnerabilities',
  
  // Accessibility
  '✅ WCAG AA compliance',
  '✅ Keyboard navigation',
  '✅ Screen reader support',
  '✅ Color contrast ≥ 4.5:1',
  
  // Monitoring
  '✅ Error tracking configured',
  '✅ Performance monitoring active',
  '✅ Analytics implemented',
  '✅ Health checks working',
  
  // Security
  '✅ HTTPS enforced',
  '✅ Security headers configured',
  '✅ No hardcoded secrets',
  '✅ Input validation implemented',
  
  // Documentation
  '✅ API documentation complete',
  '✅ Deployment guide updated',
  '✅ Runbook available',
  '✅ Architecture documented',
] as const;

export default {
  QUALITY_STANDARDS,
  QUALITY_GATES,
  CODE_REVIEW_CHECKLIST,
  MONITORING_ALERTS,
  DEVELOPMENT_STANDARDS,
  PRODUCTION_READINESS_CHECKLIST,
};
