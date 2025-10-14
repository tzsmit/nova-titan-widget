// Predictions API Routes
import express from 'express';
import { ApiResponse, PredictionsRequest, PredictionsResult } from '@nova-titan/shared';
import { validateRequest } from '../middleware/validation';
import { cacheMiddleware } from '../middleware/cache';
import { predictionsService } from '../services/predictions';
import { mlService } from '../services/ml';
import { logger } from '../utils/logger';

const router = express.Router();

// POST /api/predictions - Generate predictions for a game
router.post('/',
  validateRequest({
    body: {
      gameId: { type: 'string', required: true },
      features: { type: 'object', optional: true },
      types: { 
        type: 'array', 
        optional: true, 
        items: { 
          type: 'string', 
          enum: ['win_probability', 'spread', 'total_points', 'player_performance'] 
        },
        default: ['win_probability']
      },
      includeExplanation: { type: 'boolean', optional: true, default: true }
    }
  }),
  cacheMiddleware(600), // 10 minute cache
  async (req, res) => {
    try {
      const request: PredictionsRequest = req.body;
      
      logger.info('Generating predictions', { request });

      // Check if ML predictions are enabled
      if (process.env.ENABLE_ML_PREDICTIONS !== 'true') {
        return res.status(503).json({
          success: false,
          error: {
            code: 'ML_DISABLED',
            message: 'ML predictions are currently disabled'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Generate predictions
      const result = await predictionsService.generatePredictions(request);

      const response: ApiResponse<PredictionsResult> = {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string
      };

      res.json(response);
    } catch (error) {
      logger.error('Error generating predictions:', error);
      
      const statusCode = error.message.includes('not found') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: {
          code: 'PREDICTION_ERROR',
          message: 'Failed to generate predictions',
          details: process.env.NODE_ENV === 'development' ? { error: error.message } : undefined
        },
        timestamp: new Date().toISOString()
      });
    }
  }
);

// GET /api/predictions/:gameId - Get cached predictions for a game
router.get('/:gameId',
  validateRequest({
    params: {
      gameId: { type: 'string', required: true }
    },
    query: {
      types: { 
        type: 'array', 
        optional: true,
        items: { 
          type: 'string', 
          enum: ['win_probability', 'spread', 'total_points', 'player_performance'] 
        }
      }
    }
  }),
  cacheMiddleware(300), // 5 minute cache
  async (req, res) => {
    try {
      const { gameId } = req.params;
      const { types } = req.query;

      logger.info('Fetching cached predictions', { gameId, types });

      const predictions = await predictionsService.getPredictionsByGameId(gameId, types as string[]);

      if (!predictions || predictions.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PREDICTIONS_NOT_FOUND',
            message: 'No predictions found for this game'
          },
          timestamp: new Date().toISOString()
        });
      }

      const response: ApiResponse = {
        success: true,
        data: { predictions },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string
      };

      res.json(response);
    } catch (error) {
      logger.error('Error fetching predictions:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PREDICTIONS_FETCH_ERROR',
          message: 'Failed to fetch predictions'
        },
        timestamp: new Date().toISOString()
      });
    }
  }
);

// POST /api/predictions/batch - Generate predictions for multiple games
router.post('/batch',
  validateRequest({
    body: {
      gameIds: { 
        type: 'array', 
        required: true,
        items: { type: 'string' },
        maxItems: 10 // Limit batch size
      },
      types: { 
        type: 'array', 
        optional: true,
        items: { 
          type: 'string', 
          enum: ['win_probability', 'spread', 'total_points'] 
        },
        default: ['win_probability']
      },
      includeExplanation: { type: 'boolean', optional: true, default: false }
    }
  }),
  async (req, res) => {
    try {
      const { gameIds, types = ['win_probability'], includeExplanation = false } = req.body;

      logger.info('Generating batch predictions', { gameIds, types });

      const results = await Promise.allSettled(
        gameIds.map(gameId =>
          predictionsService.generatePredictions({
            gameId,
            types,
            includeExplanation
          })
        )
      );

      const predictions = results.map((result, index) => ({
        gameId: gameIds[index],
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason.message : null
      }));

      const response: ApiResponse = {
        success: true,
        data: { predictions },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string
      };

      res.json(response);
    } catch (error) {
      logger.error('Error in batch predictions:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'BATCH_PREDICTIONS_ERROR',
          message: 'Failed to generate batch predictions'
        },
        timestamp: new Date().toISOString()
      });
    }
  }
);

// GET /api/predictions/model/performance - Get model performance metrics
router.get('/model/performance',
  cacheMiddleware(3600), // 1 hour cache
  async (req, res) => {
    try {
      const performance = await mlService.getModelPerformance();

      const response: ApiResponse = {
        success: true,
        data: performance,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error fetching model performance:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'MODEL_PERFORMANCE_ERROR',
          message: 'Failed to fetch model performance'
        },
        timestamp: new Date().toISOString()
      });
    }
  }
);

export default router;