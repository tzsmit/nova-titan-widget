/**
 * API Routes for Nova Titan Real-Time Odds Platform
 * All endpoints return live data with timestamps
 */

import { Router, Request, Response, NextFunction } from 'express';
import { OddsAPIService } from '../services/OddsAPI';
import { ParlayEngine, ParlayLeg } from '../services/ParlayEngine';
import { RedisCacheService, CacheKeys, CacheTTL } from '../services/RedisCache';
import config from '../config/env';

const router = Router();

// Initialize services
const oddsAPI = new OddsAPIService({
  apiKey: config.ODDS_API_KEY,
  baseURL: config.ODDS_API_BASE_URL,
});

const cache = config.CACHE_ENABLED 
  ? new RedisCacheService({
      url: config.UPSTASH_REDIS_REST_URL,
      token: config.UPSTASH_REDIS_REST_TOKEN,
      defaultTTL: config.CACHE_DEFAULT_TTL,
    })
  : null;

/**
 * Error handler wrapper
 */
function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * GET /api/sports
 * Get list of available sports
 */
router.get('/sports', asyncHandler(async (req: Request, res: Response) => {
  const cacheKey = CacheKeys.sports();
  
  // Try cache first
  if (cache) {
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Fetch from API
  const sports = await oddsAPI.getSports();
  
  // Cache the result
  if (cache) {
    await cache.set(cacheKey, sports, CacheTTL.LONG); // 1 hour TTL
  }

  res.json({
    success: true,
    data: sports,
    cached: false,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * GET /api/events
 * Get live and upcoming events for a sport
 * Query params: sport (required), regions, markets
 */
router.get('/events', asyncHandler(async (req: Request, res: Response) => {
  const { sport = 'basketball_nba', regions, markets } = req.query;
  
  if (!sport || typeof sport !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Sport parameter is required',
      timestamp: new Date().toISOString(),
    });
  }

  const cacheKey = CacheKeys.events(sport);
  
  // Try cache first
  if (cache) {
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Fetch from API
  const events = await oddsAPI.getEvents(sport);
  
  // Cache the result
  if (cache) {
    await cache.set(cacheKey, events, CacheTTL.REALTIME); // 30 seconds TTL
  }

  res.json({
    success: true,
    data: events,
    count: events.length,
    sport,
    cached: false,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * GET /api/events/:eventId
 * Get odds for a specific event
 * URL params: eventId (required)
 * Query params: sport (required)
 */
router.get('/events/:eventId', asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { sport = 'basketball_nba' } = req.query;
  
  if (!sport || typeof sport !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Sport parameter is required',
      timestamp: new Date().toISOString(),
    });
  }

  const cacheKey = CacheKeys.event(sport, eventId);
  
  // Try cache first
  if (cache) {
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Fetch from API
  const eventOdds = await oddsAPI.getEventOdds(sport, eventId);
  
  // Cache the result
  if (cache) {
    await cache.set(cacheKey, eventOdds, CacheTTL.REALTIME); // 30 seconds TTL
  }

  res.json({
    success: true,
    data: eventOdds,
    cached: false,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * GET /api/bookmakers
 * Get available bookmakers by region
 * Query params: region (optional)
 */
router.get('/bookmakers', asyncHandler(async (req: Request, res: Response) => {
  const { region } = req.query;
  
  const bookmakers = {
    us: [
      { id: 'draftkings', name: 'DraftKings', states: ['NY', 'NJ', 'PA', 'MI', 'CO', 'IN', 'IL', 'VA', 'TN', 'AZ', 'WV', 'IA', 'LA'] },
      { id: 'fanduel', name: 'FanDuel', states: ['NY', 'NJ', 'PA', 'MI', 'CO', 'IN', 'IL', 'VA', 'TN', 'AZ', 'WV', 'IA', 'LA'] },
      { id: 'betmgm', name: 'BetMGM', states: ['NY', 'NJ', 'PA', 'MI', 'CO', 'IN', 'IL', 'VA', 'TN', 'AZ', 'WV', 'IA', 'LA'] },
      { id: 'caesars', name: 'Caesars Sportsbook', states: ['NY', 'NJ', 'PA', 'MI', 'CO', 'IN', 'IL', 'VA', 'TN', 'AZ', 'LA'] },
      { id: 'pointsbet', name: 'PointsBet', states: ['NJ', 'PA', 'MI', 'CO', 'IN', 'IL', 'VA', 'WV', 'IA'] },
      { id: 'betrivers', name: 'BetRivers', states: ['NY', 'NJ', 'PA', 'MI', 'CO', 'IN', 'IL', 'VA', 'WV', 'IA', 'LA'] },
      { id: 'unibet', name: 'Unibet', states: ['NJ', 'PA', 'IN', 'VA', 'AZ', 'IA'] },
    ],
    uk: [
      { id: 'williamhill', name: 'William Hill' },
      { id: 'bet365', name: 'Bet365' },
      { id: 'skybet', name: 'Sky Bet' },
      { id: 'paddypower', name: 'Paddy Power' },
    ],
    au: [
      { id: 'sportsbet', name: 'Sportsbet' },
      { id: 'tab', name: 'TAB' },
      { id: 'neds', name: 'Neds' },
    ],
  };

  const selectedRegion = region as keyof typeof bookmakers || 'us';
  const data = bookmakers[selectedRegion] || bookmakers.us;

  res.json({
    success: true,
    data,
    region: selectedRegion,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * GET /api/props/:eventId
 * Get player props for a specific event
 * URL params: eventId (required)
 * Query params: sport (required)
 */
router.get('/props/:eventId', asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { sport = 'basketball_nba' } = req.query;
  
  const cacheKey = CacheKeys.props(eventId);
  
  // Try cache first
  if (cache) {
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // For now, return empty array (props would come from extended API call)
  // This would be enhanced with actual player props from The Odds API
  const props: any[] = [];
  
  // Cache the result
  if (cache) {
    await cache.set(cacheKey, props, CacheTTL.REALTIME); // 30 seconds TTL
  }

  res.json({
    success: true,
    data: props,
    eventId,
    cached: false,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * POST /api/price/parlay
 * Calculate parlay odds, EV, Kelly Criterion
 * Body: { legs: ParlayLeg[], bankroll?: number }
 */
router.post('/price/parlay', asyncHandler(async (req: Request, res: Response) => {
  const { legs, bankroll = 1000 } = req.body;

  if (!legs || !Array.isArray(legs) || legs.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Parlay must have at least 2 legs',
      timestamp: new Date().toISOString(),
    });
  }

  if (legs.length > 15) {
    return res.status(400).json({
      success: false,
      error: 'Parlay cannot exceed 15 legs',
      timestamp: new Date().toISOString(),
    });
  }

  // Calculate parlay
  const result = ParlayEngine.calculate(legs, bankroll);

  res.json({
    success: true,
    data: result,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * GET /api/insights
 * Get market insights and +EV opportunities
 * Query params: sport (optional)
 */
router.get('/insights', asyncHandler(async (req: Request, res: Response) => {
  const { sport = 'basketball_nba' } = req.query;
  
  const cacheKey = CacheKeys.insights(sport as string);
  
  // Try cache first
  if (cache) {
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Fetch events and analyze for +EV opportunities
  const events = await oddsAPI.getEvents(sport as string);
  
  // Calculate insights
  const insights = {
    totalEvents: events.length,
    totalBookmakers: new Set(events.map(e => e.bookmaker)).size,
    averageHold: events.reduce((sum, e) => sum + (e.hold || 0), 0) / events.length,
    lowHoldMarkets: events.filter(e => (e.hold || 0) < 0.03), // < 3% hold
    timestamp: new Date().toISOString(),
  };

  // Cache the result
  if (cache) {
    await cache.set(cacheKey, insights, CacheTTL.SHORT); // 1 minute TTL
  }

  res.json({
    success: true,
    data: insights,
    cached: false,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * GET /api/quota
 * Get API quota information
 */
router.get('/quota', asyncHandler(async (req: Request, res: Response) => {
  const quota = await oddsAPI.getQuota();
  
  res.json({
    success: true,
    data: quota,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cache: {
      enabled: config.CACHE_ENABLED,
      connected: cache ? await cache.ping() : false,
      stats: cache ? cache.getStats() : null,
    },
    api: {
      oddsAPI: 'connected', // Could add actual health check
    },
  };

  res.json({
    success: true,
    data: health,
  });
}));

/**
 * GET /api/cache/stats
 * Get cache statistics
 */
router.get('/cache/stats', asyncHandler(async (req: Request, res: Response) => {
  if (!cache) {
    return res.status(503).json({
      success: false,
      error: 'Cache is disabled',
      timestamp: new Date().toISOString(),
    });
  }

  const stats = cache.getStats();

  res.json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * POST /api/cache/invalidate
 * Invalidate cache by pattern
 * Body: { pattern: string }
 */
router.post('/cache/invalidate', asyncHandler(async (req: Request, res: Response) => {
  if (!cache) {
    return res.status(503).json({
      success: false,
      error: 'Cache is disabled',
      timestamp: new Date().toISOString(),
    });
  }

  const { pattern } = req.body;

  if (!pattern) {
    return res.status(400).json({
      success: false,
      error: 'Pattern is required',
      timestamp: new Date().toISOString(),
    });
  }

  const deletedCount = await cache.invalidatePattern(pattern);

  res.json({
    success: true,
    data: {
      pattern,
      deletedCount,
    },
    timestamp: new Date().toISOString(),
  });
}));

export default router;
