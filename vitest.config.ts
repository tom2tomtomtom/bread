/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // Mock environment variables for testing
    env: {
      NODE_ENV: 'test',
      REACT_APP_SUPABASE_URL: 'https://test.supabase.co',
      REACT_APP_SUPABASE_ANON_KEY: 'test-key'
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
