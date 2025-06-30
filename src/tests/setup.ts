/**
 * Vitest Test Setup File
 *
 * Global setup and configuration for all tests
 */

import '@testing-library/jest-dom';
import { vi, afterEach, beforeEach } from 'vitest';

// Mock environment variables
const mockEnv = {
  NODE_ENV: 'test',
  REACT_APP_API_URL: 'http://localhost:3000',
  REACT_APP_ENV: 'test',
};

Object.assign(process.env, mockEnv);

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  // Uncomment to silence console during tests
  // log: vi.fn(),
  // warn: vi.fn(),
  // error: vi.fn(),
};

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-object-url');
global.URL.revokeObjectURL = vi.fn();

// Mock File and FileReader for upload tests
global.File = vi.fn().mockImplementation((bits, name, options) => ({
  name,
  size: bits.length,
  type: options?.type || 'application/octet-stream',
  lastModified: Date.now(),
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
  text: vi.fn().mockResolvedValue(''),
  stream: vi.fn(),
  slice: vi.fn(),
}));

global.FileReader = vi.fn().mockImplementation(() => ({
  readAsDataURL: vi.fn(),
  readAsText: vi.fn(),
  readAsArrayBuffer: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  result: null,
  error: null,
  readyState: 0,
  onload: null,
  onerror: null,
  onabort: null,
  onloadstart: null,
  onloadend: null,
  onprogress: null,
  DONE: 2,
  EMPTY: 0,
  LOADING: 1,
})) as any;

// Mock fetch for API tests
global.fetch = vi.fn();

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Reset modules between tests to avoid state leakage
beforeEach(() => {
  vi.resetModules();
});
