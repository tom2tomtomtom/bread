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
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
