// Parlay Optimization API Routes
import express from 'express';
import { ApiResponse, ParlayOptimizeRequest, ParlayOptimizeResult } from '@nova-titan/shared';
import { validateRequest } from '../middleware/validation';
import { cacheMiddleware } from '../middleware/cache';
import { parlayService } from '../services/parlay';
import { logger } from '../utils/logger';

const router = express.Router();

// POST /api/parlay/optimize - Optimize parlay combinations
router.post('/optimize',
  validateRequest({
    body: {
      gameIds: { 
        type: 'array', 
        required: true,
        items: { type: 'string' },
        minItems: 2,
        maxItems: 8 // Reasonable limit for parlay complexity
      },
      optimizationMode: { 
        type: 'string', 
        required: true,
        enum: ['max_probability', 'max_payout']
      },
      riskTolerance: { 
        type: 'string', 
        required: true,
        enum: ['conservative', 'moderate', 'aggressive']
      },
      maxLegs: { 
        type: 'number', 
        optional: true, 
        min: 2, 
        max: 8, 
        default: 5 
      },
      bankrollSettings: {
        type: 'object',
        optional: true,
        properties: {
          totalBankroll: { type: 'number', min: 1 },
          maxBetPercentage: { type: 'number', min: 1, max: 20 },
          riskTolerance: { type: 'string', enum: ['conservative', 'moderate', 'aggressive'] },
          unitSize: { type: 'number', min: 0.1, max: 10 }
        }
      },
      excludedBetTypes: {
        type: 'array',
        optional: true,
        items: { 
          type: 'string',
          enum: ['moneyline', 'spread', 'total', 'player_prop', 'team_prop']
        }
      }
    }
  }),
  cacheMiddleware(300), // 5 minute cache
  async (req, res) => {
    try {
      const request: ParlayOptimizeRequest = req.body;
      
      logger.info('Optimizing parlay', { 
        gameIds: request.gameIds,
        mode: request.optimizationMode,
        riskTolerance: request.riskTolerance
      });

      // Validate that we have predictions for all requested games
      const result = await parlayService.optimizeParlays(request);

      const response: ApiResponse<ParlayOptimizeResult> = {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string
      };

      res.json(response);
    } catch (error) {
      logger.error('Error optimizing parlay:', error);
      
      const statusCode = error.message.includes('not found') || 
                        error.message.includes('insufficient') ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: {
          code: 'PARLAY_OPTIMIZATION_ERROR',
          message: error.message || 'Failed to optimize parlay',
          details: process.env.NODE_ENV === 'development' ? { error: error.message } : undefined
        },
        timestamp: new Date().toISOString()
      });
    }
  }
);

// POST /api/parlay/calculate - Calculate parlay odds and payout
router.post('/calculate',
  validateRequest({
    body: {
      bets: {
        type: 'array',
        required: true,
        items: {
          type: 'object',
          properties: {
            outcomeId: { type: 'string', required: true },
            odds: {
              type: 'object',
              required: true,
              properties: {
                format: { type: 'string', enum: ['american', 'decimal', 'fractional'] },
                value: { type: 'number' }
              }
            },
            stake: { type: 'number', min: 0.01 }
          }
        },
        minItems: 2,
        maxItems: 8
      }
    }
  }),
  async (req, res) => {
    try {
      const { bets } = req.body;

      logger.info('Calculating parlay', { betCount: bets.length });

      const calculation = await parlayService.calculateParlay(bets);

      const response: ApiResponse = {
        success: true,
        data: calculation,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string
      };

      res.json(response);
    } catch (error) {
      logger.error('Error calculating parlay:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PARLAY_CALCULATION_ERROR',
          message: 'Failed to calculate parlay'
        },
        timestamp: new Date().toISOString()
      });
    }
  }
);

// GET /api/parlay/suggestions/:gameId - Get suggested parlays for a game
router.get('/suggestions/:gameId',
  validateRequest({
    params: {
      gameId: { type: 'string', required: true }
    },
    query: {
      riskTolerance: { 
        type: 'string', 
        optional: true, 
        enum: ['conservative', 'moderate', 'aggressive'],
        default: 'moderate'
      },
      maxSuggestions: { 
        type: 'number', 
        optional: true, 
        min: 1, 
        max: 10, 
        default: 3 
      }
    }
  }),
  cacheMiddleware(600), // 10 minute cache
  async (req, res) => {
    try {
      const { gameId } = req.params;
      const { riskTolerance = 'moderate', maxSuggestions = 3 } = req.query;

      logger.info('Getting parlay suggestions', { gameId, riskTolerance });

      const suggestions = await parlayService.getParlaysuggestions(
        gameId, 
        riskTolerance as string, 
        maxSuggestions as number
      );

      const response: ApiResponse = {
        success: true,
        data: { suggestions },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting parlay suggestions:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PARLAY_SUGGESTIONS_ERROR',
          message: 'Failed to get parlay suggestions'
        },
        timestamp: new Date().toISOString()
      });
    }
  }
);

// GET /api/parlay/kelly/:parlayId - Get Kelly criterion for a specific parlay
router.get('/kelly/:parlayId',
  validateRequest({
    params: {
      parlayId: { type: 'string', required: true }
    },
    query: {
      bankroll: { type: 'number', optional: true, min: 1, default: 1000 },
      riskLevel: { 
        type: 'string', 
        optional: true, 
        enum: ['conservative', 'moderate', 'aggressive'],
        default: 'moderate'
      }
    }
  }),
  async (req, res) => {
    try {
      const { parlayId } = req.params;
      const { bankroll = 1000, riskLevel = 'moderate' } = req.query;

      logger.info('Calculating Kelly for parlay', { parlayId, bankroll, riskLevel });

      const kelly = await parlayService.calculateKellyForParlay(
        parlayId, 
        bankroll as number, 
        riskLevel as string
      );

      const response: ApiResponse = {
        success: true,
        data: kelly,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string
      };

      res.json(response);
    } catch (error) {
      logger.error('Error calculating Kelly for parlay:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PARLAY_KELLY_ERROR',
          message: 'Failed to calculate Kelly criterion'
        },
        timestamp: new Date().toISOString()
      });
    }
  }
);

export default router;