# AIDEAS Comprehensive E2E Test Suite

## Overview
This comprehensive Playwright test suite validates the complete AIDEAS Creative Platform workflow from start to finish using real API calls and actual content generation.

## Test Coverage

### 🎯 Primary Test Scenarios
1. **Everyday Rewards Premium Membership Campaign** - Full workflow testing
2. **Nike Performance Running Campaign** - Alternative business scenario
3. **Stress Testing** - Multiple parallel generations
4. **Error Recovery** - Network failures and retry logic
5. **Accessibility & Performance** - Compliance and speed validation

### 🔧 Technical Validations
- ✅ Real OpenAI/Claude API integrations
- ✅ Actual DALL-E image generation
- ✅ Genuine video creation and export
- ✅ Cross-browser compatibility (Chrome, Firefox, Safari)
- ✅ Responsive design (Desktop, Tablet, Mobile)
- ✅ Performance metrics and thresholds
- ✅ Accessibility compliance
- ✅ Error handling and recovery

## Quick Start

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

**Single comprehensive test:**
```bash
# Run the main workflow test
npx playwright test tests/e2e/comprehensive-aideas-workflow.spec.ts --headed

# Run with specific browser
npx playwright test tests/e2e/comprehensive-aideas-workflow.spec.ts --project=chromium-comprehensive
```

**All advanced scenarios:**
```bash
# Run all business scenarios
npx playwright test tests/e2e/advanced-aideas-scenarios.spec.ts

# Run with custom configuration
npx playwright test --config=tests/playwright.config.e2e.ts
```

**Cross-browser testing:**
```bash
# Test across all browsers
npx playwright test tests/e2e/comprehensive-aideas-workflow.spec.ts --project=chromium-comprehensive --project=firefox-comprehensive --project=webkit-comprehensive
```

**Mobile testing:**
```bash
# Test mobile responsiveness
npx playwright test tests/e2e/comprehensive-aideas-workflow.spec.ts --project="Mobile Chrome" --project="Mobile Safari"
```

## Test Configuration

### Environment Variables
```bash
# Application URL (defaults to production)
PLAYWRIGHT_BASE_URL=https://aideas-redbaez.netlify.app

# For local testing
PLAYWRIGHT_BASE_URL=http://localhost:3000

# Extended timeouts for AI operations
PLAYWRIGHT_TIMEOUT=300000
```

### Performance Thresholds
- **Load Time**: < 10 seconds
- **DOM Ready**: < 5 seconds  
- **First Paint**: < 3 seconds
- **Accessibility Issues**: < 5 maximum

### AI Operation Timeouts
- **Territory Generation**: 60 seconds
- **Image Generation**: 120 seconds (2 minutes)
- **Video Generation**: 180 seconds (3 minutes)
- **Copy Generation**: 90 seconds

## Test Structure

### Main Workflow Test
`comprehensive-aideas-workflow.spec.ts`
- Complete user journey from brief to final assets
- Real API integrations with OpenAI/Claude
- Actual image and video generation
- Asset library validation
- Performance and accessibility checks

### Advanced Scenarios Test  
`advanced-aideas-scenarios.spec.ts`
- Multiple business use cases
- Parallel generation stress testing
- Error recovery and retry mechanisms
- Content quality validation
- Cross-browser compatibility

### Helper Classes
`helpers/test-data.ts`
- Predefined test scenarios
- Configuration constants
- Selector definitions
- Wait condition helpers

## Expected Test Flow

### 1. Authentication (30s)
- User registration/login
- Account verification
- Landing page validation

### 2. Brief Input (10s)
- Creative brief entry
- Auto-save validation
- Form state management

### 3. Territory Generation (60s)
- AI-powered territory creation
- Multiple territory validation
- Content relevance checking

### 4. Image Generation (120s)
- DALL-E image creation
- Real image display validation
- Asset library integration

### 5. Video Generation (180s)
- Video creation with territory context
- Style and duration options
- Preview functionality

### 6. Asset Management (30s)
- Asset library access
- Preview and organization
- Search and filter testing

### 7. Quality Validation (10s)
- Content relevance scoring
- Keyword presence validation
- Brand compliance checking

## Debugging Failed Tests

### View Test Results
```bash
# Open HTML report
npx playwright show-report

# View specific test artifacts
ls test-results/
ls tests/screenshots/
```

### Common Issues

**Authentication Failures:**
- Check if app is accessible at baseURL
- Verify registration form fields
- Confirm email/password validation

**AI Generation Timeouts:**
- Check API rate limits
- Verify OpenAI/Claude API keys
- Monitor network connectivity

**Content Validation Failures:**
- Review screenshot artifacts
- Check console errors in browser
- Validate expected vs actual content

### Debug Mode
```bash
# Run with debug mode
npx playwright test --debug tests/e2e/comprehensive-aideas-workflow.spec.ts

# Run with trace viewer
npx playwright test --trace on tests/e2e/comprehensive-aideas-workflow.spec.ts
npx playwright show-trace trace.zip
```

## Performance Monitoring

### Metrics Collected
- Page load times
- API response times  
- Image/video generation duration
- Memory usage
- Network resource counts

### Thresholds
```typescript
performance: {
  maxLoadTime: 10000,    // 10 seconds
  maxDOMReady: 5000,     // 5 seconds  
  maxFirstPaint: 3000    // 3 seconds
}
```

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run E2E Tests
  run: |
    npx playwright install
    npx playwright test --config=tests/playwright.config.e2e.ts
    
- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report-e2e/
```

### Test Reports
- **HTML Report**: `playwright-report-e2e/index.html`
- **JSON Results**: `test-results/results.json`
- **JUnit XML**: `test-results/junit.xml`
- **Screenshots**: `tests/screenshots/[scenario]/`

## Maintenance

### Updating Test Data
Edit `helpers/test-data.ts` to add new scenarios:
```typescript
{
  id: 'new-scenario',
  name: 'New Business Campaign',
  brief: { /* campaign details */ },
  expectedOutputs: { /* validation criteria */ }
}
```

### Selector Updates
Update `SELECTORS` object in `test-data.ts` when UI changes:
```typescript
SELECTORS = {
  newElement: 'button:has-text("New Button")',
  // ...
}
```

### Performance Tuning
Adjust timeouts in `TEST_CONFIG`:
```typescript
aiTimeouts: {
  territories: 60000,    // Increase if needed
  images: 120000,       // Adjust for API speed
  videos: 180000        // Account for generation time
}
```

## Support

For test failures or configuration issues:
1. Check the HTML report for detailed failure information
2. Review screenshots in `tests/screenshots/`
3. Examine console logs in test output
4. Verify API connectivity and rate limits
5. Ensure all environment variables are set correctly

---

**Note**: These tests use real AI APIs and will generate actual content. Ensure proper API quotas and rate limits are configured for your testing environment.