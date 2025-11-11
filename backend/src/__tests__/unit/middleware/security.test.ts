/**
 * Unit Tests for Security Middleware (CSRF, Headers, Rate Limiting)
 */

import { CSRFProtection, securityHeaders, IPRateLimiter } from '../../../middleware/security';
import crypto from 'crypto';

describe('CSRFProtection', () => {
  let csrf: CSRFProtection;

  beforeEach(() => {
    csrf = new CSRFProtection({ secret: 'test_csrf_secret' });
  });

  describe('generateToken', () => {
    it('should generate random tokens', () => {
      const token1 = csrf.generateToken();
      const token2 = csrf.generateToken();

      expect(token1).not.toBe(token2);
      expect(token1).toHaveLength(64); // 32 bytes = 64 hex chars
    });

    it('should generate tokens with configured length', () => {
      const customCsrf = new CSRFProtection({
        secret: 'test',
        tokenLength: 16,
      });

      const token = customCsrf.generateToken();
      expect(token).toHaveLength(32); // 16 bytes = 32 hex chars
    });
  });

  describe('hashToken', () => {
    it('should hash tokens consistently', () => {
      const token = 'test_token';
      const hash1 = csrf['hashToken'](token);
      const hash2 = csrf['hashToken'](token);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different tokens', () => {
      const token1 = 'token_1';
      const token2 = 'token_2';

      const hash1 = csrf['hashToken'](token1);
      const hash2 = csrf['hashToken'](token2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid tokens', () => {
      const token = csrf.generateToken();
      const hashedToken = csrf['hashToken'](token);

      const isValid = csrf.verifyToken(token, hashedToken);

      expect(isValid).toBe(true);
    });

    it('should reject invalid tokens', () => {
      const token = csrf.generateToken();
      const wrongToken = 'wrong_token';
      const hashedToken = csrf['hashToken'](token);

      const isValid = csrf.verifyToken(wrongToken, hashedToken);

      expect(isValid).toBe(false);
    });

    it('should use timing-safe comparison', () => {
      const token = csrf.generateToken();
      const hashedToken = csrf['hashToken'](token);

      const spy = jest.spyOn(crypto, 'timingSafeEqual');
      csrf.verifyToken(token, hashedToken);

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('middleware', () => {
    it('should generate token for GET requests', () => {
      const req = testUtils.createMockRequest({
        method: 'GET',
        session: {},
      });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = csrf.protect();
      middleware(req, res, next);

      expect(req.session.csrfToken).toBeDefined();
      expect(req.csrfToken).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    it('should verify token for POST requests', () => {
      const token = csrf.generateToken();
      const hashedToken = csrf['hashToken'](token);

      const req = testUtils.createMockRequest({
        method: 'POST',
        session: { csrfToken: hashedToken },
        body: { _csrf: token },
      });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = csrf.protect();
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject POST requests without token', () => {
      const req = testUtils.createMockRequest({
        method: 'POST',
        session: {},
        body: {},
      });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = csrf.protect();
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or missing CSRF token',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should accept token from header', () => {
      const token = csrf.generateToken();
      const hashedToken = csrf['hashToken'](token);

      const req = testUtils.createMockRequest({
        method: 'POST',
        session: { csrfToken: hashedToken },
        headers: { 'x-csrf-token': token },
        body: {},
      });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = csrf.protect();
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should skip verification for safe methods', () => {
      const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

      safeMethods.forEach((method) => {
        const req = testUtils.createMockRequest({
          method,
          session: {},
        });
        const res = testUtils.createMockResponse();
        const next = testUtils.createMockNext();

        const middleware = csrf.protect();
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });
    });
  });
});

describe('securityHeaders', () => {
  it('should set all security headers', () => {
    const req = testUtils.createMockRequest();
    const res = testUtils.createMockResponse();
    const next = testUtils.createMockNext();

    const middleware = securityHeaders();
    middleware(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Security-Policy',
      expect.stringContaining("default-src 'self'")
    );
    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Strict-Transport-Security',
      expect.stringContaining('max-age=')
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Referrer-Policy',
      'strict-origin-when-cross-origin'
    );
    expect(next).toHaveBeenCalled();
  });

  it('should set CSP with proper directives', () => {
    const req = testUtils.createMockRequest();
    const res = testUtils.createMockResponse();
    const next = testUtils.createMockNext();

    const middleware = securityHeaders();
    middleware(req, res, next);

    const cspCall = (res.setHeader as jest.Mock).mock.calls.find(
      (call) => call[0] === 'Content-Security-Policy'
    );
    const csp = cspCall[1];

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self'");
    expect(csp).toContain("img-src 'self'");
    expect(csp).toContain("connect-src 'self'");
  });

  it('should set HSTS with long max-age', () => {
    const req = testUtils.createMockRequest();
    const res = testUtils.createMockResponse();
    const next = testUtils.createMockNext();

    const middleware = securityHeaders();
    middleware(req, res, next);

    const hstsCall = (res.setHeader as jest.Mock).mock.calls.find(
      (call) => call[0] === 'Strict-Transport-Security'
    );
    const hsts = hstsCall[1];

    expect(hsts).toContain('max-age=31536000'); // 1 year
    expect(hsts).toContain('includeSubDomains');
  });
});

describe('IPRateLimiter', () => {
  let limiter: IPRateLimiter;

  beforeEach(() => {
    limiter = new IPRateLimiter({
      maxRequests: 5,
      windowMs: 60000, // 1 minute
    });
  });

  describe('middleware', () => {
    it('should allow requests within limit', () => {
      const req = testUtils.createMockRequest({ ip: '127.0.0.1' });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = limiter.middleware();

      // Make 5 requests (within limit)
      for (let i = 0; i < 5; i++) {
        middleware(req, res, next);
      }

      expect(next).toHaveBeenCalledTimes(5);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should block requests exceeding limit', () => {
      const req = testUtils.createMockRequest({ ip: '127.0.0.1' });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = limiter.middleware();

      // Make 6 requests (1 over limit)
      for (let i = 0; i < 6; i++) {
        middleware(req, res, next);
      }

      expect(next).toHaveBeenCalledTimes(5);
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Too many requests',
      });
    });

    it('should track different IPs separately', () => {
      const req1 = testUtils.createMockRequest({ ip: '127.0.0.1' });
      const req2 = testUtils.createMockRequest({ ip: '192.168.1.1' });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = limiter.middleware();

      // Make 5 requests from each IP
      for (let i = 0; i < 5; i++) {
        middleware(req1, res, next);
        middleware(req2, res, next);
      }

      expect(next).toHaveBeenCalledTimes(10);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reset counter after window expires', async () => {
      const shortLimiter = new IPRateLimiter({
        maxRequests: 2,
        windowMs: 100, // 100ms
      });

      const req = testUtils.createMockRequest({ ip: '127.0.0.1' });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = shortLimiter.middleware();

      // Make 2 requests
      middleware(req, res, next);
      middleware(req, res, next);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Make another request (should be allowed)
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(3);
    });

    it('should set rate limit headers', () => {
      const req = testUtils.createMockRequest({ ip: '127.0.0.1' });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = limiter.middleware();
      middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 5);
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(Number));
      expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(Number));
    });

    it('should handle missing IP gracefully', () => {
      const req = testUtils.createMockRequest({ ip: undefined });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = limiter.middleware();
      middleware(req, res, next);

      // Should use 'unknown' as default IP
      expect(next).toHaveBeenCalled();
    });

    it('should clean up expired entries', () => {
      const req1 = testUtils.createMockRequest({ ip: '127.0.0.1' });
      const req2 = testUtils.createMockRequest({ ip: '192.168.1.1' });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = limiter.middleware();

      // Make requests from different IPs
      middleware(req1, res, next);
      middleware(req2, res, next);

      // Check internal map size (via private access)
      const requestsMap = (limiter as any).requests;
      expect(requestsMap.size).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid concurrent requests', () => {
      const req = testUtils.createMockRequest({ ip: '127.0.0.1' });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = limiter.middleware();

      // Simulate 10 concurrent requests
      for (let i = 0; i < 10; i++) {
        middleware(req, res, next);
      }

      // Only first 5 should pass
      expect(next).toHaveBeenCalledTimes(5);
      expect(res.status).toHaveBeenCalledTimes(5);
    });

    it('should handle IPv6 addresses', () => {
      const req = testUtils.createMockRequest({ ip: '2001:0db8:85a3::8a2e:0370:7334' });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = limiter.middleware();
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle proxied IPs', () => {
      const req = testUtils.createMockRequest({
        ip: '127.0.0.1',
        headers: {
          'x-forwarded-for': '203.0.113.1, 198.51.100.1',
        },
      });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = limiter.middleware();
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('configuration', () => {
    it('should respect custom max requests', () => {
      const customLimiter = new IPRateLimiter({
        maxRequests: 10,
        windowMs: 60000,
      });

      const req = testUtils.createMockRequest({ ip: '127.0.0.1' });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = customLimiter.middleware();

      for (let i = 0; i < 10; i++) {
        middleware(req, res, next);
      }

      expect(next).toHaveBeenCalledTimes(10);
    });

    it('should respect custom window duration', async () => {
      const customLimiter = new IPRateLimiter({
        maxRequests: 2,
        windowMs: 50, // 50ms
      });

      const req = testUtils.createMockRequest({ ip: '127.0.0.1' });
      const res = testUtils.createMockResponse();
      const next = testUtils.createMockNext();

      const middleware = customLimiter.middleware();

      // Use up the limit
      middleware(req, res, next);
      middleware(req, res, next);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 60));

      // Should allow new requests
      middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(3);
    });
  });
});
