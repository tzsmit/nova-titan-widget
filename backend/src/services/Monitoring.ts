/**
 * Monitoring and Observability Service
 * 
 * Integrates with Sentry for error tracking and provides
 * custom metrics for business operations
 * 
 * Phase 5: Security & Performance
 */

import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { Request, Response, NextFunction } from 'express';

export interface MonitoringConfig {
  sentryDsn?: string;
  environment: string;
  release?: string;
  sampleRate?: number;
  tracesSampleRate?: number;
  profilesSampleRate?: number;
}

export class MonitoringService {
  private static initialized = false;

  /**
   * Initialize Sentry
   */
  static init(config: MonitoringConfig) {
    if (this.initialized) {
      return;
    }

    if (!config.sentryDsn) {
      console.warn('Sentry DSN not provided. Error tracking disabled.');
      return;
    }

    Sentry.init({
      dsn: config.sentryDsn,
      environment: config.environment,
      release: config.release,
      
      // Performance monitoring
      tracesSampleRate: config.tracesSampleRate || 0.1, // 10% of transactions
      profilesSampleRate: config.profilesSampleRate || 0.1, // 10% of transactions
      
      integrations: [
        new ProfilingIntegration(),
      ],

      // Filter out sensitive data
      beforeSend(event, hint) {
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['x-api-key'];
          delete event.request.headers['cookie'];
        }

        // Remove sensitive data from body
        if (event.request?.data) {
          const data = event.request.data as any;
          if (data.password) delete data.password;
          if (data.token) delete data.token;
          if (data.apiKey) delete data.apiKey;
        }

        return event;
      },
    });

    this.initialized = true;
    console.log('Sentry monitoring initialized');
  }

  /**
   * Express error handler middleware
   */
  static errorHandler() {
    return Sentry.Handlers.errorHandler({
      shouldHandleError(error) {
        // Capture all 5xx errors
        return true;
      },
    });
  }

  /**
   * Express request handler middleware
   */
  static requestHandler() {
    return Sentry.Handlers.requestHandler();
  }

  /**
   * Express tracing middleware
   */
  static tracingHandler() {
    return Sentry.Handlers.tracingHandler();
  }

  /**
   * Capture exception
   */
  static captureException(error: Error, context?: Record<string, any>) {
    if (context) {
      Sentry.setContext('custom', context);
    }
    Sentry.captureException(error);
  }

  /**
   * Capture message
   */
  static captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    Sentry.captureMessage(message, level);
  }

  /**
   * Add breadcrumb for debugging
   */
  static addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
    Sentry.addBreadcrumb(breadcrumb);
  }

  /**
   * Set user context
   */
  static setUser(user: { id?: string; email?: string; username?: string }) {
    Sentry.setUser(user);
  }

  /**
   * Set tags for filtering
   */
  static setTag(key: string, value: string) {
    Sentry.setTag(key, value);
  }

  /**
   * Start a transaction for performance monitoring
   */
  static startTransaction(name: string, op: string) {
    return Sentry.startTransaction({
      name,
      op,
    });
  }
}

/**
 * Custom Metrics Service
 */
export class MetricsService {
  private static metrics: Map<string, number> = new Map();

  /**
   * Increment a counter
   */
  static increment(metric: string, value: number = 1) {
    const current = this.metrics.get(metric) || 0;
    this.metrics.set(metric, current + value);
  }

  /**
   * Set a gauge value
   */
  static gauge(metric: string, value: number) {
    this.metrics.set(metric, value);
  }

  /**
   * Record a timing
   */
  static timing(metric: string, duration: number) {
    const key = `${metric}.timing`;
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + duration);
  }

  /**
   * Get all metrics
   */
  static getMetrics(): Record<string, number> {
    const obj: Record<string, number> = {};
    for (const [key, value] of this.metrics.entries()) {
      obj[key] = value;
    }
    return obj;
  }

  /**
   * Reset metrics
   */
  static reset() {
    this.metrics.clear();
  }

  /**
   * Track parlay conversion
   */
  static trackParlayConversion(success: boolean, amount?: number) {
    this.increment('parlay.conversions.total');
    if (success) {
      this.increment('parlay.conversions.success');
      if (amount) {
        this.gauge('parlay.conversions.amount', amount);
      }
    } else {
      this.increment('parlay.conversions.failed');
    }
  }

  /**
   * Track compliance check
   */
  static trackComplianceCheck(passed: boolean, reason?: string) {
    this.increment('compliance.checks.total');
    if (passed) {
      this.increment('compliance.checks.passed');
    } else {
      this.increment('compliance.checks.failed');
      if (reason) {
        this.increment(`compliance.checks.failed.${reason}`);
      }
    }
  }

  /**
   * Track API call
   */
  static trackAPICall(endpoint: string, method: string, statusCode: number, duration: number) {
    this.increment(`api.${endpoint}.${method}.count`);
    this.increment(`api.${endpoint}.${method}.${statusCode}`);
    this.timing(`api.${endpoint}.${method}`, duration);
  }

  /**
   * Track cache hit/miss
   */
  static trackCacheHit(hit: boolean) {
    this.increment('cache.total');
    if (hit) {
      this.increment('cache.hits');
    } else {
      this.increment('cache.misses');
    }
  }
}

/**
 * Performance monitoring middleware
 */
export const performanceMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Capture original end function
    const originalEnd = res.end;

    // Override end to capture metrics
    res.end = function (this: Response, ...args: any[]) {
      const duration = Date.now() - startTime;
      const endpoint = req.path.replace(/\/\d+/g, '/:id'); // Normalize IDs
      
      MetricsService.trackAPICall(
        endpoint,
        req.method,
        res.statusCode,
        duration
      );

      // Call original end
      return originalEnd.apply(this, args);
    };

    next();
  };
};

export default {
  MonitoringService,
  MetricsService,
  performanceMiddleware,
};
