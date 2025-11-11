/**
 * Vitest Setup File
 * Runs before all tests to set up the testing environment
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock environment variables
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3000/api');
vi.stubEnv('VITE_ODDS_API_KEY', 'test_odds_api_key');
vi.stubEnv('VITE_SENTRY_DSN', '');

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  writable: true,
  value: mockGeolocation,
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock fetch
global.fetch = vi.fn();

// Helper to mock successful fetch
export const mockFetchSuccess = (data: any) => {
  (global.fetch as any).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => data,
    text: async () => JSON.stringify(data),
  });
};

// Helper to mock failed fetch
export const mockFetchError = (status: number = 500, message: string = 'Internal Server Error') => {
  (global.fetch as any).mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ error: message }),
    text: async () => JSON.stringify({ error: message }),
  });
};

// Helper to create mock store
export const createMockStore = (initialState: any = {}) => {
  return {
    getState: () => initialState,
    setState: vi.fn(),
    subscribe: vi.fn(),
    destroy: vi.fn(),
  };
};

// Export test utilities
export const testUtils = {
  createMockStore,
  mockFetchSuccess,
  mockFetchError,
  
  // Wait for async updates
  waitForNextUpdate: () => new Promise((resolve) => setTimeout(resolve, 0)),
  
  // Flush all promises
  flushPromises: () => new Promise((resolve) => setImmediate(resolve)),
};

// Extend Vitest matchers with custom ones
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      message: () =>
        pass
          ? `expected ${received} not to be within range ${floor} - ${ceiling}`
          : `expected ${received} to be within range ${floor} - ${ceiling}`,
      pass,
    };
  },
});

// Global test timeout
vi.setConfig({ testTimeout: 10000 });

// Mock console methods to reduce noise
console.error = vi.fn();
console.warn = vi.fn();
console.log = vi.fn();
console.info = vi.fn();
