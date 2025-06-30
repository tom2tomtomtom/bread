import { FullConfig } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting AIDEAS E2E Test Suite Global Teardown');
  
  const startTime = process.env.E2E_START_TIME;
  if (startTime) {
    const duration = Date.now() - parseInt(startTime);
    console.log(`⏱️ Total test suite duration: ${Math.round(duration / 1000)}s`);
  }
  
  // Generate test summary
  try {
    const testResultsPath = 'test-results/results.json';
    const resultsExist = await fs.access(testResultsPath).then(() => true).catch(() => false);
    
    if (resultsExist) {
      const resultsData = await fs.readFile(testResultsPath, 'utf-8');
      const results = JSON.parse(resultsData);
      
      console.log('📊 Test Results Summary:');
      console.log(`  Total tests: ${results.stats?.total || 'N/A'}`);
      console.log(`  Passed: ${results.stats?.passed || 'N/A'}`);
      console.log(`  Failed: ${results.stats?.failed || 'N/A'}`);
      console.log(`  Skipped: ${results.stats?.skipped || 'N/A'}`);
      console.log(`  Duration: ${results.stats?.duration || 'N/A'}ms`);
    }
  } catch (error) {
    console.log('📊 Test results summary not available');
  }
  
  // Clean up temporary files older than 1 day
  try {
    const tempDirs = ['tests/downloads', 'test-results'];
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    for (const dir of tempDirs) {
      try {
        const files = await fs.readdir(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime.getTime() < oneDayAgo) {
            await fs.rm(filePath, { recursive: true, force: true });
            console.log(`🗑️ Cleaned up old file: ${filePath}`);
          }
        }
      } catch (error) {
        // Directory might not exist or be empty
      }
    }
  } catch (error) {
    console.log('🗑️ Cleanup completed with warnings');
  }
  
  // Archive screenshots if tests failed
  try {
    const screenshotDirs = await fs.readdir('tests/screenshots');
    let hasScreenshots = false;
    
    for (const dir of screenshotDirs) {
      const dirPath = path.join('tests/screenshots', dir);
      const files = await fs.readdir(dirPath).catch(() => []);
      if (files.length > 0) {
        hasScreenshots = true;
        break;
      }
    }
    
    if (hasScreenshots) {
      const archiveDir = `test-archives/${new Date().toISOString().split('T')[0]}`;
      await fs.mkdir(archiveDir, { recursive: true });
      
      // Move screenshots to archive
      await fs.rename('tests/screenshots', path.join(archiveDir, 'screenshots'));
      console.log(`📦 Archived screenshots to: ${archiveDir}`);
    }
  } catch (error) {
    console.log('📦 Screenshot archiving completed with warnings');
  }
  
  // Generate performance report
  const performanceData = {
    testSuiteCompleted: new Date().toISOString(),
    duration: startTime ? Date.now() - parseInt(startTime) : null,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      baseURL: process.env.PLAYWRIGHT_BASE_URL || config.use?.baseURL,
    }
  };
  
  await fs.writeFile(
    'test-results/performance-summary.json', 
    JSON.stringify(performanceData, null, 2)
  );
  
  console.log('📈 Performance summary saved to test-results/performance-summary.json');
  console.log('✅ Global teardown completed successfully');
}

export default globalTeardown;