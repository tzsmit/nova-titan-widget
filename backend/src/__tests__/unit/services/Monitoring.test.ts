/**
 * Unit Tests for Monitoring Service (Sentry & Metrics)
 */

import { MonitoringService, MetricsService } from '../../../services/Monitoring';
import * as Sentry from '@sentry/node';

// Mock Sentry
jest.mock('@sentry/node', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setContext: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  addBreadcrumb: jest.fn(),
  Severity: {
    Info: 'info',
    Warning: 'warning',
    Error: 'error',
  },
}));

describe('MonitoringService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('init', () => {
    it('should initialize Sentry with configuration', () => {
      const config = {
        sentryDsn: 'https://test@sentry.io/123',
        environment: 'test',
        tracesSampleRate: 0.1,
        profilesSampleRate: 0.1,
      };

      MonitoringService.init(config);

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: config.sentryDsn,
          tracesSampleRate: 0.1,
          profilesSampleRate: 0.1,
        })
      );
    });

    it('should not initialize Sentry without DSN', () => {
      const config = {
        sentryDsn: '',
        environment: 'test',
      };

      MonitoringService.init(config);

      expect(Sentry.init).not.toHaveBeenCalled();
    });

    it('should scrub sensitive data in beforeSend hook', () => {
      const config = {
        sentryDsn: 'https://test@sentry.io/123',
        environment: 'test',
      };

      MonitoringService.init(config);

      const initCall = (Sentry.init as jest.Mock).mock.calls[0][0];
      const beforeSend = initCall.beforeSend;

      const event = {
        request: {
          headers: {
            authorization: 'Bearer token',
            cookie: 'session=abc123',
            'x-api-key': 'secret',
          },
          data: {
            password: 'secret123',
            creditCard: '1234-5678-9012-3456',
          },
        },
      };

      const scrubbedEvent = beforeSend(event, {});

      expect(scrubbedEvent.request.headers.authorization).toBeUndefined();
      expect(scrubbedEvent.request.headers.cookie).toBeUndefined();
      expect(scrubbedEvent.request.data.password).toBeUndefined();
    });
  });

  describe('captureException', () => {
    it('should capture exceptions with Sentry', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'test' };

      MonitoringService.captureException(error, context);

      expect(Sentry.setContext).toHaveBeenCalledWith('custom', context);
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it('should capture exceptions without context', () => {
      const error = new Error('Test error');

      MonitoringService.captureException(error);

      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it('should handle non-Error objects', () => {
      const errorString = 'String error';

      MonitoringService.captureException(errorString as any);

      expect(Sentry.captureException).toHaveBeenCalled();
    });
  });

  describe('captureMessage', () => {
    it('should capture messages with default severity', () => {
      const message = 'Test message';

      MonitoringService.captureMessage(message);

      expect(Sentry.captureMessage).toHaveBeenCalledWith(message, 'info');
    });

    it('should capture messages with custom severity', () => {
      const message = 'Warning message';

      MonitoringService.captureMessage(message, 'warning');

      expect(Sentry.captureMessage).toHaveBeenCalledWith(message, 'warning');
    });

    it('should capture messages with context', () => {
      const message = 'Test message';
      const context = { feature: 'parlay' };

      MonitoringService.captureMessage(message, 'info', context);

      expect(Sentry.setContext).toHaveBeenCalledWith('custom', context);
      expect(Sentry.captureMessage).toHaveBeenCalledWith(message, 'info');
    });
  });

  describe('setUser', () => {
    it('should set user context in Sentry', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
      };

      MonitoringService.setUser(user);

      expect(Sentry.setUser).toHaveBeenCalledWith(user);
    });

    it('should clear user context with null', () => {
      MonitoringService.setUser(null);

      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });
  });

  describe('addBreadcrumb', () => {
    it('should add breadcrumbs to Sentry', () => {
      const breadcrumb = {
        category: 'action',
        message: 'User clicked button',
        level: 'info' as any,
      };

      MonitoringService.addBreadcrumb(breadcrumb);

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(breadcrumb);
    });

    it('should add breadcrumbs with data', () => {
      const breadcrumb = {
        category: 'api',
        message: 'API request',
        level: 'info' as any,
        data: {
          endpoint: '/api/odds',
          method: 'GET',
        },
      };

      MonitoringService.addBreadcrumb(breadcrumb);

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(breadcrumb);
    });
  });
});

describe('MetricsService', () => {
  let metrics: Map<string, number>;

  beforeEach(() => {
    // Reset internal metrics map
    metrics = new Map();
    (MetricsService as any).metrics = metrics;
  });

  describe('increment', () => {
    it('should increment counter by 1', () => {
      MetricsService.increment('test.counter');

      const value = metrics.get('test.counter');
      expect(value).toBe(1);
    });

    it('should increment counter by custom value', () => {
      MetricsService.increment('test.counter', 5);

      const value = metrics.get('test.counter');
      expect(value).toBe(5);
    });

    it('should accumulate increments', () => {
      MetricsService.increment('test.counter');
      MetricsService.increment('test.counter');
      MetricsService.increment('test.counter', 3);

      const value = metrics.get('test.counter');
      expect(value).toBe(5);
    });
  });

  describe('gauge', () => {
    it('should set gauge value', () => {
      MetricsService.gauge('test.gauge', 42);

      const value = metrics.get('test.gauge');
      expect(value).toBe(42);
    });

    it('should overwrite previous gauge value', () => {
      MetricsService.gauge('test.gauge', 10);
      MetricsService.gauge('test.gauge', 20);

      const value = metrics.get('test.gauge');
      expect(value).toBe(20);
    });

    it('should support decimal values', () => {
      MetricsService.gauge('test.gauge', 3.14159);

      const value = metrics.get('test.gauge');
      expect(value).toBe(3.14159);
    });
  });

  describe('timing', () => {
    it('should record timing metric', () => {
      MetricsService.timing('api.request.duration', 123);

      const value = metrics.get('api.request.duration');
      expect(value).toBe(123);
    });

    it('should support multiple timing recordings', () => {
      MetricsService.timing('api.request.duration', 100);
      MetricsService.timing('api.request.duration', 200);

      // Last timing should be recorded
      const value = metrics.get('api.request.duration');
      expect(value).toBe(200);
    });
  });

  describe('trackParlayConversion', () => {
    it('should track successful parlay conversion', () => {
      MetricsService.trackParlayConversion(true, 100);

      expect(metrics.get('parlay.conversions.total')).toBe(1);
      expect(metrics.get('parlay.conversions.success')).toBe(1);
      expect(metrics.get('parlay.conversions.amount')).toBe(100);
    });

    it('should track failed parlay conversion', () => {
      MetricsService.trackParlayConversion(false);

      expect(metrics.get('parlay.conversions.total')).toBe(1);
      expect(metrics.get('parlay.conversions.failed')).toBe(1);
    });

    it('should accumulate multiple conversions', () => {
      MetricsService.trackParlayConversion(true, 100);
      MetricsService.trackParlayConversion(true, 200);
      MetricsService.trackParlayConversion(false);

      expect(metrics.get('parlay.conversions.total')).toBe(3);
      expect(metrics.get('parlay.conversions.success')).toBe(2);
      expect(metrics.get('parlay.conversions.failed')).toBe(1);
    });
  });

  describe('trackComplianceCheck', () => {
    it('should track passed compliance check', () => {
      MetricsService.trackComplianceCheck(true);

      expect(metrics.get('compliance.checks.total')).toBe(1);
      expect(metrics.get('compliance.checks.passed')).toBe(1);
    });

    it('should track failed compliance check with reason', () => {
      MetricsService.trackComplianceCheck(false, 'age_verification');

      expect(metrics.get('compliance.checks.total')).toBe(1);
      expect(metrics.get('compliance.checks.failed')).toBe(1);
      expect(metrics.get('compliance.checks.failed.age_verification')).toBe(1);
    });

    it('should track multiple compliance checks', () => {
      MetricsService.trackComplianceCheck(true);
      MetricsService.trackComplianceCheck(false, 'geo_blocked');
      MetricsService.trackComplianceCheck(false, 'age_verification');

      expect(metrics.get('compliance.checks.total')).toBe(3);
      expect(metrics.get('compliance.checks.passed')).toBe(1);
      expect(metrics.get('compliance.checks.failed')).toBe(2);
    });
  });

  describe('trackAPICall', () => {
    it('should track successful API call', () => {
      MetricsService.trackAPICall('/api/odds', 'GET', 200, 150);

      expect(metrics.get('api.calls.total')).toBe(1);
      expect(metrics.get('api.calls.success')).toBe(1);
      expect(metrics.get('api.calls.GET./api/odds.total')).toBe(1);
      expect(metrics.get('api.calls.GET./api/odds.duration')).toBe(150);
    });

    it('should track failed API call', () => {
      MetricsService.trackAPICall('/api/odds', 'POST', 500, 200);

      expect(metrics.get('api.calls.total')).toBe(1);
      expect(metrics.get('api.calls.error')).toBe(1);
      expect(metrics.get('api.calls.POST./api/odds.total')).toBe(1);
    });

    it('should differentiate between endpoints', () => {
      MetricsService.trackAPICall('/api/odds', 'GET', 200, 100);
      MetricsService.trackAPICall('/api/parlay', 'POST', 200, 200);

      expect(metrics.get('api.calls.GET./api/odds.total')).toBe(1);
      expect(metrics.get('api.calls.POST./api/parlay.total')).toBe(1);
    });
  });

  describe('trackCacheOperation', () => {
    it('should track cache hit', () => {
      MetricsService.trackCacheOperation('get', true);

      expect(metrics.get('cache.operations.total')).toBe(1);
      expect(metrics.get('cache.operations.hit')).toBe(1);
      expect(metrics.get('cache.operations.get.hit')).toBe(1);
    });

    it('should track cache miss', () => {
      MetricsService.trackCacheOperation('get', false);

      expect(metrics.get('cache.operations.total')).toBe(1);
      expect(metrics.get('cache.operations.miss')).toBe(1);
      expect(metrics.get('cache.operations.get.miss')).toBe(1);
    });

    it('should track different operations', () => {
      MetricsService.trackCacheOperation('get', true);
      MetricsService.trackCacheOperation('set', true);
      MetricsService.trackCacheOperation('delete', true);

      expect(metrics.get('cache.operations.get.hit')).toBe(1);
      expect(metrics.get('cache.operations.set.hit')).toBe(1);
      expect(metrics.get('cache.operations.delete.hit')).toBe(1);
    });
  });

  describe('getMetrics', () => {
    it('should return all metrics', () => {
      MetricsService.increment('test.counter', 5);
      MetricsService.gauge('test.gauge', 10);
      MetricsService.timing('test.timing', 100);

      const allMetrics = MetricsService.getMetrics();

      expect(allMetrics.size).toBe(3);
      expect(allMetrics.get('test.counter')).toBe(5);
      expect(allMetrics.get('test.gauge')).toBe(10);
      expect(allMetrics.get('test.timing')).toBe(100);
    });

    it('should return empty map when no metrics', () => {
      const allMetrics = MetricsService.getMetrics();

      expect(allMetrics.size).toBe(0);
    });
  });

  describe('reset', () => {
    it('should clear all metrics', () => {
      MetricsService.increment('test.counter');
      MetricsService.gauge('test.gauge', 10);

      MetricsService.reset();

      const allMetrics = MetricsService.getMetrics();
      expect(allMetrics.size).toBe(0);
    });

    it('should allow new metrics after reset', () => {
      MetricsService.increment('test.counter');
      MetricsService.reset();
      MetricsService.increment('test.counter');

      const value = metrics.get('test.counter');
      expect(value).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle negative increment values', () => {
      MetricsService.increment('test.counter', -5);

      const value = metrics.get('test.counter');
      expect(value).toBe(-5);
    });

    it('should handle very large numbers', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER;
      MetricsService.gauge('test.gauge', largeNumber);

      const value = metrics.get('test.gauge');
      expect(value).toBe(largeNumber);
    });

    it('should handle metric names with special characters', () => {
      MetricsService.increment('api.request.GET./api/odds?sport=football');

      const value = metrics.get('api.request.GET./api/odds?sport=football');
      expect(value).toBe(1);
    });

    it('should handle concurrent metric updates', () => {
      // Simulate concurrent increments
      for (let i = 0; i < 100; i++) {
        MetricsService.increment('concurrent.counter');
      }

      const value = metrics.get('concurrent.counter');
      expect(value).toBe(100);
    });
  });

  describe('performance', () => {
    it('should handle high-frequency metrics efficiently', () => {
      const startTime = Date.now();

      // Record 10,000 metrics
      for (let i = 0; i < 10000; i++) {
        MetricsService.increment('perf.counter');
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
      expect(metrics.get('perf.counter')).toBe(10000);
    });

    it('should handle many different metric names', () => {
      // Create 1000 different metrics
      for (let i = 0; i < 1000; i++) {
        MetricsService.increment(`metric.${i}`);
      }

      const allMetrics = MetricsService.getMetrics();
      expect(allMetrics.size).toBe(1000);
    });
  });
});
