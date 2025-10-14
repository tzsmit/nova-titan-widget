// Games API Routes
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse, GamesListParams, GameDetails } from '@nova-titan/shared';
import { validateRequest } from '../middleware/validation';
import { cacheMiddleware } from '../middleware/cache';
import { gamesService } from '../services/games';
import { oddsService } from '../services/odds';
import { predictionsService } from '../services/predictions';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/games - List games with filtering
router.get('/', 
  validateRequest({
    query: {
      date: { type: 'string', optional: true, pattern: /^\d{4}-\d{2}-\d{2}$/ },
      sport: { type: 'string', optional: true },
      league: { type: 'string', optional: true },
      status: { type: 'string', optional: true, enum: ['scheduled', 'live', 'final'] },
      limit: { type: 'number', optional: true, min: 1, max: 50, default: 10 },
      page: { type: 'number', optional: true, min: 1, default: 1 }
    }
  }),
  cacheMiddleware(300), // 5 minute cache
  async (req, res) => {
    try {
      const params = req.query as GamesListParams;
      
      logger.info('Fetching games list', { params });
      
      const result = await gamesService.getGames(params);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error fetching games:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GAMES_FETCH_ERROR',
          message: 'Failed to fetch games'
        },
        timestamp: new Date().toISOString()
      });
    }
  }
);

// GET /api/games/:id - Get specific game details
router.get('/:id',
  validateRequest({
    params: {
      id: { type: 'string', required: true }
    },
    query: {
      includePredictions: { type: 'boolean', optional: true, default: true },
      includeOdds: { type: 'boolean', optional: true, default: true },
      includePlayerStats: { type: 'boolean', optional: true, default: true }
    }
  }),
  cacheMiddleware(180), // 3 minute cache
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        includePredictions = true,
        includeOdds = true,
        includePlayerStats = true
      } = req.query;

      logger.info('Fetching game details', { gameId: id });

      // Get base game data
      const game = await gamesService.getGameById(id);
      
      if (!game) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'GAME_NOT_FOUND',
            message: 'Game not found'
          },
          timestamp: new Date().toISOString()
        });
      }

      // Build detailed response
      const gameDetails: GameDetails = { ...game };

      // Add predictions if requested
      if (includePredictions) {
        gameDetails.predictions = await predictionsService.getPredictionsByGameId(id);
      }

      // Add odds if requested
      if (includeOdds) {
        gameDetails.odds = await oddsService.getOddsByGameId(id);
      }

      // Add player stats if requested
      if (includePlayerStats) {
        gameDetails.playerStats = await gamesService.getPlayerStatsByGameId(id);
        gameDetails.teamStats = await gamesService.getTeamStatsByGameId(id);
      }

      const response: ApiResponse<GameDetails> = {
        success: true,
        data: gameDetails,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string
      };

      res.json(response);
    } catch (error) {
      logger.error('Error fetching game details:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GAME_DETAILS_ERROR',
          message: 'Failed to fetch game details'
        },
        timestamp: new Date().toISOString()
      });
    }
  }
);

// GET /api/games/today - Get today's games (convenience endpoint)
router.get('/today',
  cacheMiddleware(180),
  async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const result = await gamesService.getGames({
        date: today,
        limit: 20
      });

      const response: ApiResponse = {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error fetching today\'s games:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'TODAY_GAMES_ERROR',
          message: 'Failed to fetch today\'s games'
        },
        timestamp: new Date().toISOString()
      });
    }
  }
);

export default router;