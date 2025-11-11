/**
 * Advanced Parlay API Routes - Phase 2
 * Optimization, live tracking, edge detection, bet sizing
 */

import { Router, Request, Response } from 'express';
import { OddsAPIService } from '../services/OddsAPI';
import { ParlayOptimizer } from '../services/ParlayOptimizer';
import { RedisCacheService, CacheKeys, CacheTTL } from '../services/RedisCache';
import config from '../config/env';

const router = Router();

const oddsAPI = new OddsAPIService({
  apiKey: config.ODDS_API_KEY,
  baseURL: config.ODDS_API_BASE_URL,
});

const cache = config.CACHE_ENABLED 
  ? new RedisCacheService({
      url: config.UPSTASH_REDIS_REST_URL,
      token: config.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * POST /api/parlay/optimize
 * Find best odds across all bookmakers for parlay legs
 */
router.post('/optimize', asyncHandler(async (req: Request, res: Response) => {
  const { legs, sport = 'basketball_nba' } = req.body;

  if (!legs || !Array.isArray(legs) || legs.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Legs array is required',
      timestamp: new Date().toISOString(),
    });
  }

  // Validate leg structure
  for (const leg of legs) {
    if (!leg.eventId || !leg.market || !leg.selection || !leg.currentOdds || !leg.currentBookmaker) {
      return res.status(400).json({
        success: false,
        error: 'Each leg must have eventId, market, selection, currentOdds, and currentBookmaker',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Fetch all available markets for these events
  const eventIds = [...new Set(legs.map((l: any) => l.eventId))];
  const allMarkets = [];

  for (const eventId of eventIds) {
    try {
      const cacheKey = CacheKeys.event(sport, eventId);
      let eventMarkets;

      if (cache) {
        eventMarkets = await cache.get(cacheKey);
      }

      if (!eventMarkets) {
        eventMarkets = await oddsAPI.getEventOdds(sport, eventId);
        if (cache) {
          await cache.set(cacheKey, eventMarkets, CacheTTL.REALTIME);
        }
      }

      allMarkets.push(...eventMarkets);
    } catch (error) {
      console.error(`Error fetching odds for event ${eventId}:`, error);
    }
  }

  // Run optimization
  const optimization = ParlayOptimizer.optimizeParlay(legs, allMarkets);

  res.json({
    success: true,
    data: optimization,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * POST /api/parlay/live-recalculate
 * Recalculate parlay with current live odds
 */
router.post('/live-recalculate', asyncHandler(async (req: Request, res: Response) => {
  const { originalLegs, sport = 'basketball_nba' } = req.body;

  if (!originalLegs || !Array.isArray(originalLegs) || originalLegs.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'originalLegs array is required',
      timestamp: new Date().toISOString(),
    });
  }

  // Fetch current odds for all legs
  const currentLegs = [];
  
  for (const leg of originalLegs) {
    try {
      const cacheKey = CacheKeys.event(sport, leg.eventId);
      const eventMarkets = cache 
        ? await cache.get(cacheKey) || await oddsAPI.getEventOdds(sport, leg.eventId)
        : await oddsAPI.getEventOdds(sport, leg.eventId);

      // Find current odds for this leg
      const market = eventMarkets.find((m: any) => 
        m.eventId === leg.eventId && m.bookmaker === leg.bookmaker
      );

      let currentOdds = leg.odds; // Default to original if not found

      if (market) {
        switch (leg.market) {
          case 'moneyline':
            currentOdds = leg.selection === 'home' ? market.moneyline?.home : market.moneyline?.away;
            break;
          case 'spread':
            currentOdds = leg.selection === 'home' ? market.spread?.home : market.spread?.away;
            break;
          case 'total':
            currentOdds = leg.selection === 'over' ? market.total?.over : market.total?.under;
            break;
        }
      }

      currentLegs.push({
        legId: leg.legId,
        odds: currentOdds || leg.odds,
      });
    } catch (error) {
      console.error(`Error fetching current odds for leg ${leg.legId}:`, error);
      // Use original odds if fetch fails
      currentLegs.push({
        legId: leg.legId,
        odds: leg.odds,
      });
    }
  }

  // Run live recalculation
  const recalculation = ParlayOptimizer.liveRecalculation(originalLegs, currentLegs);

  res.json({
    success: true,
    data: recalculation,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * POST /api/parlay/edge-detection
 * Detect edge opportunities for each leg
 */
router.post('/edge-detection', asyncHandler(async (req: Request, res: Response) => {
  const { legs, sport = 'basketball_nba' } = req.body;

  if (!legs || !Array.isArray(legs) || legs.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Legs array is required',
      timestamp: new Date().toISOString(),
    });
  }

  // Fetch all available markets
  const eventIds = [...new Set(legs.map((l: any) => l.eventId))];
  const allMarkets = [];

  for (const eventId of eventIds) {
    try {
      const eventMarkets = await oddsAPI.getEventOdds(sport, eventId);
      allMarkets.push(...eventMarkets);
    } catch (error) {
      console.error(`Error fetching odds for event ${eventId}:`, error);
    }
  }

  // Detect edges
  const edgeAnalysis = ParlayOptimizer.detectEdgePerLeg(legs, allMarkets);

  res.json({
    success: true,
    data: {
      legs: edgeAnalysis,
      summary: {
        totalLegs: legs.length,
        legsWithEdge: edgeAnalysis.filter(e => e.hasEdge).length,
        totalEdge: edgeAnalysis.reduce((sum, e) => sum + (e.hasEdge ? e.edge : 0), 0),
      },
    },
    timestamp: new Date().toISOString(),
  });
}));

/**
 * POST /api/parlay/bet-sizing
 * Get bet sizing recommendation
 */
router.post('/bet-sizing', asyncHandler(async (req: Request, res: Response) => {
  const { 
    parlayOdds, 
    trueProbability, 
    bankroll = 1000, 
    expectedValue, 
    correlationWarnings = 0 
  } = req.body;

  if (!parlayOdds || !trueProbability) {
    return res.status(400).json({
      success: false,
      error: 'parlayOdds and trueProbability are required',
      timestamp: new Date().toISOString(),
    });
  }

  const recommendation = ParlayOptimizer.recommendBetSize(
    parlayOdds,
    trueProbability,
    bankroll,
    expectedValue || 0,
    correlationWarnings
  );

  res.json({
    success: true,
    data: recommendation,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * POST /api/parlay/line-movement
 * Track line movement for a specific leg
 */
router.post('/line-movement', asyncHandler(async (req: Request, res: Response) => {
  const { legId, previousOdds, currentOdds, eventId, market, bookmaker } = req.body;

  if (!legId || !previousOdds || !currentOdds || !eventId || !market || !bookmaker) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required: legId, previousOdds, currentOdds, eventId, market, bookmaker',
      timestamp: new Date().toISOString(),
    });
  }

  const movement = ParlayOptimizer.trackLineMovement(
    legId,
    previousOdds,
    currentOdds,
    eventId,
    market,
    bookmaker
  );

  // Store line movement in cache for history tracking
  if (cache) {
    const cacheKey = `line-movement:${legId}`;
    const history = await cache.get<any[]>(cacheKey) || [];
    history.push(movement);
    
    // Keep only last 10 movements
    if (history.length > 10) {
      history.shift();
    }
    
    await cache.set(cacheKey, history, CacheTTL.LONG);
  }

  res.json({
    success: true,
    data: movement,
    timestamp: new Date().toISOString(),
  });
}));

/**
 * GET /api/parlay/line-movement/:legId
 * Get line movement history for a leg
 */
router.get('/line-movement/:legId', asyncHandler(async (req: Request, res: Response) => {
  const { legId } = req.params;

  if (!cache) {
    return res.status(503).json({
      success: false,
      error: 'Cache is not enabled',
      timestamp: new Date().toISOString(),
    });
  }

  const cacheKey = `line-movement:${legId}`;
  const history = await cache.get<any[]>(cacheKey) || [];

  res.json({
    success: true,
    data: {
      legId,
      movements: history,
      count: history.length,
    },
    timestamp: new Date().toISOString(),
  });
}));

/**
 * POST /api/parlay/sgp-validate
 * Validate Same Game Parlay for prohibited combinations
 */
router.post('/sgp-validate', asyncHandler(async (req: Request, res: Response) => {
  const { legs } = req.body;

  if (!legs || !Array.isArray(legs) || legs.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'At least 2 legs are required',
      timestamp: new Date().toISOString(),
    });
  }

  // Check if all legs are from the same event (Same Game Parlay)
  const eventIds = new Set(legs.map((l: any) => l.eventId));
  const isSGP = eventIds.size === 1;

  const prohibited = [];
  const warnings = [];

  if (isSGP) {
    // Check for prohibited SGP combinations
    for (let i = 0; i < legs.length; i++) {
      for (let j = i + 1; j < legs.length; j++) {
        const leg1 = legs[i];
        const leg2 = legs[j];

        // Moneyline + Spread (same team) - PROHIBITED
        if ((leg1.market === 'moneyline' && leg2.market === 'spread') ||
            (leg1.market === 'spread' && leg2.market === 'moneyline')) {
          if (leg1.selection === leg2.selection) {
            prohibited.push({
              leg1: i,
              leg2: j,
              reason: 'Cannot combine moneyline and spread for the same team in SGP',
            });
          }
        }

        // Multiple player props from same player
        if (leg1.market === 'prop' && leg2.market === 'prop') {
          if (leg1.playerId && leg2.playerId && leg1.playerId === leg2.playerId) {
            warnings.push({
              leg1: i,
              leg2: j,
              reason: 'Multiple props for same player may be correlated',
            });
          }
        }
      }
    }
  }

  res.json({
    success: true,
    data: {
      isSGP,
      isValid: prohibited.length === 0,
      prohibited,
      warnings,
      recommendations: prohibited.length > 0 
        ? ['Remove one of the conflicting legs to make this a valid SGP']
        : [],
    },
    timestamp: new Date().toISOString(),
  });
}));

export default router;
