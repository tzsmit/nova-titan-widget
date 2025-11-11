/**
 * Jest Setup File
 * Runs before all tests to set up the testing environment
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.UPSTASH_REDIS_URL = 'redis://localhost:6379';
process.env.UPSTASH_REDIS_TOKEN = 'test_token';
process.env.ODDS_API_KEY = 'test_odds_api_key';
process.env.ESPN_API_KEY = 'test_espn_api_key';
process.env.HMAC_SECRET = 'test_hmac_secret_key_for_testing_purposes';
process.env.CSRF_SECRET = 'test_csrf_secret_key_for_testing_purposes';
process.env.SENTRY_DSN = ''; // Disable Sentry in tests

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Extend Jest matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Global test utilities
global.testUtils = {
  createMockRequest: (overrides = {}) => ({
    body: {},
    query: {},
    params: {},
    headers: {},
    ip: '127.0.0.1',
    ...overrides,
  }),
  
  createMockResponse: () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  },
  
  createMockNext: () => jest.fn(),
};

// Type declarations for global utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
  
  var testUtils: {
    createMockRequest: (overrides?: any) => any;
    createMockResponse: () => any;
    createMockNext: () => jest.Mock;
  };
}

// Clean up after all tests
afterAll(() => {
  // Close any open connections, clean up resources
  jest.clearAllMocks();
  jest.restoreAllMocks();
});
