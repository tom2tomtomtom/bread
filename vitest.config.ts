/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    css: true,
    clearMocks: true,
    restoreMocks: true,

    // Test timeout and performance
    testTimeout: 10000, // 10 seconds for unit tests
    hookTimeout: 10000, // 10 seconds for setup/teardown

    // Retry flaky tests
    retry: 2,

    // Reporter configuration for A+ quality
    reporter: ['verbose', 'json', 'html'],
    // Mock environment variables for testing
    env: {
      NODE_ENV: 'test',
      REACT_APP_SUPABASE_URL: 'https://test.supabase.co',
      REACT_APP_SUPABASE_ANON_KEY: 'test-key'
    },
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'coverage/',
        'public/',
        'netlify/'
      ],
      // A+ Coverage thresholds (90%+ requirement)
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        // Critical components need 95%+
        './src/components/providers/': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        './src/utils/': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        './src/components/generation/': {
          branches: 92,
          functions: 92,
          lines: 92,
          statements: 92,
        },
      },

      // Include all source files for accurate coverage
      include: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/tests/**',
        '!src/**/*.test.{ts,tsx}',
        '!src/**/*.spec.{ts,tsx}',
      ],

      skipFull: false,
      all: true
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
