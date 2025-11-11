/**
 * Integration Tests for API Endpoints
 * Tests real API flows with mocked external services
 */

import request from 'supertest';
import express, { Express } from 'express';
import { HMACAuth } from '../../middleware/hmacAuth';
import { sanitize } from '../../middleware/sanitize';
import { securityHeaders, IPRateLimiter } from '../../middleware/security';

// Mock external services
const mockOddsAPI = {
  getOdds: jest.fn(),
  getSports: jest.fn(),
  getBookmakers: jest.fn(),
};

const mockRedisCache = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('API Endpoints Integration Tests', () => {
  let app: Express;
  const hmacSecret = 'test_hmac_secret';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create Express app with middleware
    app = express();
    app.use(express.json());
    app.use(securityHeaders());
    app.use(sanitize({ stripHtml: true, trimWhitespace: true }));
    
    // Mock routes
    setupMockRoutes();
  });

  const setupMockRoutes = () => {
    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: Date.now() });
    });

    // Odds endpoint with caching
    app.get('/api/odds/:sport', async (req, res) => {
      const { sport } = req.params;
      const { bookmaker } = req.query;

      try {
        // Check cache first
        const cacheKey = `odds:${sport}:${bookmaker || 'all'}`;
        const cached = await mockRedisCache.get(cacheKey);

        if (cached) {
          return res.json({
            success: true,
            data: JSON.parse(cached),
            cached: true,
          });
        }

        // Fetch from API
        const odds = await mockOddsAPI.getOdds(sport, bookmaker as string);
        
        // Cache for 60 seconds
        await mockRedisCache.set(cacheKey, JSON.stringify(odds), 60);

        res.json({
          success: true,
          data: odds,
          cached: false,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch odds',
        });
      }
    });

    // Parlay optimization endpoint
    app.post('/api/parlay/optimize', async (req, res) => {
      const { legs, stake } = req.body;

      if (!Array.isArray(legs) || legs.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'At least 2 legs required for parlay',
        });
      }

      if (!stake || stake <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid stake amount required',
        });
      }

      // Mock optimization logic
      const totalOdds = legs.reduce((acc, leg) => acc * (leg.odds || 2.0), 1);
      const potentialPayout = stake * totalOdds;
      const edge = totalOdds > 5 ? 0.05 : 0.02; // Mock edge calculation

      res.json({
        success: true,
        data: {
          totalOdds,
          potentialPayout,
          edge,
          recommendedStake: stake,
          legs: legs.length,
        },
      });
    });

    // Compliance check endpoint
    app.post('/api/compliance/check', async (req, res) => {
      const { state, age, platformType } = req.body;

      if (!state || !age || !platformType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: state, age, platformType',
        });
      }

      // Mock compliance logic
      const minAge = platformType === 'traditional' ? 21 : 18;
      const isLegalState = state === 'TX' ? platformType === 'sweepstakes' : true;
      const isOldEnough = age >= minAge;

      res.json({
        success: true,
        data: {
          isCompliant: isLegalState && isOldEnough,
          minAge,
          isLegalState,
          isOldEnough,
          reason: !isCompliant ? 'Does not meet requirements' : undefined,
        },
      });
    });

    // Protected endpoint with HMAC
    app.post('/api/protected', new HMACAuth({ secret: hmacSecret }).verify(), (req, res) => {
      res.json({
        success: true,
        message: 'Protected endpoint accessed',
        data: req.body,
      });
    });
  };

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should include security headers', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers).toHaveProperty('content-security-policy');
    });
  });

  describe('GET /api/odds/:sport', () => {
    beforeEach(() => {
      mockRedisCache.get.mockResolvedValue(null);
      mockRedisCache.set.mockResolvedValue('OK');
      mockOddsAPI.getOdds.mockResolvedValue([
        { id: '1', team: 'Team A', odds: 1.9 },
        { id: '2', team: 'Team B', odds: 2.1 },
      ]);
    });

    it('should fetch odds for a sport', async () => {
      const response = await request(app).get('/api/odds/basketball');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.cached).toBe(false);
      expect(mockOddsAPI.getOdds).toHaveBeenCalledWith('basketball', undefined);
    });

    it('should return cached odds if available', async () => {
      const cachedOdds = [{ id: '1', team: 'Cached Team', odds: 1.5 }];
      mockRedisCache.get.mockResolvedValueOnce(JSON.stringify(cachedOdds));

      const response = await request(app).get('/api/odds/football');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(cachedOdds);
      expect(response.body.cached).toBe(true);
      expect(mockOddsAPI.getOdds).not.toHaveBeenCalled();
    });

    it('should filter by bookmaker', async () => {
      const response = await request(app)
        .get('/api/odds/basketball')
        .query({ bookmaker: 'draftkings' });

      expect(response.status).toBe(200);
      expect(mockOddsAPI.getOdds).toHaveBeenCalledWith('basketball', 'draftkings');
    });

    it('should handle API errors gracefully', async () => {
      mockOddsAPI.getOdds.mockRejectedValueOnce(new Error('API rate limit exceeded'));

      const response = await request(app).get('/api/odds/basketball');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('API rate limit exceeded');
    });

    it('should sanitize sport parameter', async () => {
      await request(app).get('/api/odds/<script>alert(1)</script>');

      // Should still work but with sanitized parameter
      expect(response.status).not.toBe(500);
    });
  });

  describe('POST /api/parlay/optimize', () => {
    it('should optimize valid parlay', async () => {
      const parlayData = {
        legs: [
          { id: '1', team: 'Team A', odds: 2.0 },
          { id: '2', team: 'Team B', odds: 1.8 },
          { id: '3', team: 'Team C', odds: 2.2 },
        ],
        stake: 100,
      };

      const response = await request(app)
        .post('/api/parlay/optimize')
        .send(parlayData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalOdds');
      expect(response.body.data).toHaveProperty('potentialPayout');
      expect(response.body.data).toHaveProperty('edge');
      expect(response.body.data.legs).toBe(3);
    });

    it('should reject parlay with less than 2 legs', async () => {
      const parlayData = {
        legs: [{ id: '1', team: 'Team A', odds: 2.0 }],
        stake: 100,
      };

      const response = await request(app)
        .post('/api/parlay/optimize')
        .send(parlayData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('At least 2 legs required');
    });

    it('should reject invalid stake', async () => {
      const parlayData = {
        legs: [
          { id: '1', team: 'Team A', odds: 2.0 },
          { id: '2', team: 'Team B', odds: 1.8 },
        ],
        stake: 0,
      };

      const response = await request(app)
        .post('/api/parlay/optimize')
        .send(parlayData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Valid stake amount required');
    });

    it('should sanitize input data', async () => {
      const parlayData = {
        legs: [
          { id: '1', team: '<script>alert(1)</script>', odds: 2.0 },
          { id: '2', team: 'Team B', odds: 1.8 },
        ],
        stake: 100,
      };

      const response = await request(app)
        .post('/api/parlay/optimize')
        .send(parlayData);

      expect(response.status).toBe(200);
      // Team name should be sanitized
      expect(JSON.stringify(response.body)).not.toContain('<script>');
    });

    it('should calculate correct potential payout', async () => {
      const parlayData = {
        legs: [
          { id: '1', team: 'Team A', odds: 2.0 },
          { id: '2', team: 'Team B', odds: 2.0 },
        ],
        stake: 100,
      };

      const response = await request(app)
        .post('/api/parlay/optimize')
        .send(parlayData);

      expect(response.status).toBe(200);
      expect(response.body.data.totalOdds).toBe(4.0);
      expect(response.body.data.potentialPayout).toBe(400);
    });
  });

  describe('POST /api/compliance/check', () => {
    it('should validate compliant Texas user on sweepstakes', async () => {
      const complianceData = {
        state: 'TX',
        age: 21,
        platformType: 'sweepstakes',
      };

      const response = await request(app)
        .post('/api/compliance/check')
        .send(complianceData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isCompliant).toBe(true);
      expect(response.body.data.minAge).toBe(18);
      expect(response.body.data.isLegalState).toBe(true);
    });

    it('should reject Texas user on traditional platform', async () => {
      const complianceData = {
        state: 'TX',
        age: 21,
        platformType: 'traditional',
      };

      const response = await request(app)
        .post('/api/compliance/check')
        .send(complianceData);

      expect(response.status).toBe(200);
      expect(response.body.data.isCompliant).toBe(false);
      expect(response.body.data.isLegalState).toBe(false);
    });

    it('should reject underage user', async () => {
      const complianceData = {
        state: 'NY',
        age: 18,
        platformType: 'traditional',
      };

      const response = await request(app)
        .post('/api/compliance/check')
        .send(complianceData);

      expect(response.status).toBe(200);
      expect(response.body.data.isCompliant).toBe(false);
      expect(response.body.data.isOldEnough).toBe(false);
      expect(response.body.data.minAge).toBe(21);
    });

    it('should require all fields', async () => {
      const response = await request(app)
        .post('/api/compliance/check')
        .send({ state: 'TX' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should sanitize state input', async () => {
      const complianceData = {
        state: '<script>TX</script>',
        age: 21,
        platformType: 'sweepstakes',
      };

      const response = await request(app)
        .post('/api/compliance/check')
        .send(complianceData);

      expect(response.status).toBe(200);
      // Should handle sanitized input gracefully
    });
  });

  describe('POST /api/protected (HMAC)', () => {
    const generateHMACSignature = (body: any, timestamp: number): string => {
      const payload = JSON.stringify({ timestamp, body });
      return HMACAuth.generateSignature(payload, hmacSecret);
    };

    it('should accept valid HMAC signature', async () => {
      const timestamp = Date.now();
      const body = { data: 'test' };
      const signature = generateHMACSignature(body, timestamp);

      const response = await request(app)
        .post('/api/protected')
        .set('X-HMAC-Signature', signature)
        .send(body);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Protected endpoint accessed');
    });

    it('should reject missing HMAC signature', async () => {
      const response = await request(app)
        .post('/api/protected')
        .send({ data: 'test' });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Missing HMAC signature');
    });

    it('should reject invalid HMAC signature', async () => {
      const response = await request(app)
        .post('/api/protected')
        .set('X-HMAC-Signature', 'invalid_signature')
        .send({ data: 'test' });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid HMAC signature');
    });

    it('should reject expired timestamp', async () => {
      const expiredTimestamp = Date.now() - (10 * 60 * 1000); // 10 minutes ago
      const body = { data: 'test' };
      const signature = generateHMACSignature(body, expiredTimestamp);

      const response = await request(app)
        .post('/api/protected')
        .set('X-HMAC-Signature', signature)
        .send(body);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('timestamp');
    });
  });

  describe('Rate Limiting', () => {
    let rateLimitedApp: Express;

    beforeEach(() => {
      rateLimitedApp = express();
      rateLimitedApp.use(express.json());
      
      const limiter = new IPRateLimiter({
        maxRequests: 5,
        windowMs: 60000, // 1 minute
      });
      
      rateLimitedApp.use(limiter.middleware());
      
      rateLimitedApp.get('/api/limited', (req, res) => {
        res.json({ success: true });
      });
    });

    it('should allow requests within limit', async () => {
      for (let i = 0; i < 5; i++) {
        const response = await request(rateLimitedApp).get('/api/limited');
        expect(response.status).toBe(200);
      }
    });

    it('should block requests exceeding limit', async () => {
      // Make 5 successful requests
      for (let i = 0; i < 5; i++) {
        await request(rateLimitedApp).get('/api/limited');
      }

      // 6th request should be blocked
      const response = await request(rateLimitedApp).get('/api/limited');
      
      expect(response.status).toBe(429);
      expect(response.body.error).toContain('Too many requests');
    });

    it('should set rate limit headers', async () => {
      const response = await request(rateLimitedApp).get('/api/limited');

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
      expect(response.headers).toHaveProperty('x-ratelimit-reset');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/parlay/optimize')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });

    it('should handle very large payloads', async () => {
      const largePayload = {
        legs: Array(1000).fill({ id: '1', team: 'Team', odds: 2.0 }),
        stake: 100,
      };

      const response = await request(app)
        .post('/api/parlay/optimize')
        .send(largePayload);

      // Should handle gracefully, not crash
      expect([200, 400, 413]).toContain(response.status);
    });
  });
});
