// Nova Titan Sports Widget Backend API
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/node';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import gamesRouter from './routes/games';
import predictionsRouter from './routes/predictions';
import parlayRouter from './routes/parlay';
import oddsRouter from './routes/odds';
import playersRouter from './routes/players';
import teamsRouter from './routes/teams';
import healthRouter from './routes/health';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { validateApiKey } from './middleware/auth';

// Import services
import { initializeDatabase } from './services/database';
import { initializeRedis } from './services/cache';
import { startBackgroundJobs } from './services/scheduler';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Sentry for error tracking
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CORS_ORIGIN || 'https://yourdomain.com']
    : true,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Compression and parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.API_RATE_LIMIT || '100'),
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Request logging
if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
  app.use(requestLogger);
}

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/games', gamesRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/parlay', parlayRouter);
app.use('/api/odds', oddsRouter);
app.use('/api/players', playersRouter);
app.use('/api/teams', teamsRouter);

// Widget serving (for development)
if (process.env.NODE_ENV === 'development') {
  app.use('/widget', express.static('public'));
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use(errorHandler);

// Initialize services and start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    logger.info('Database initialized');

    // Initialize Redis cache (optional)
    if (process.env.ENABLE_REDIS === 'true') {
      await initializeRedis();
      logger.info('Redis cache initialized');
    }

    // Start background jobs
    startBackgroundJobs();
    logger.info('Background jobs started');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Nova Titan API server started on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`API URL: http://localhost:${PORT}/api`);
      
      if (process.env.NODE_ENV === 'development') {
        logger.info(`Health check: http://localhost:${PORT}/api/health`);
        logger.info(`Widget demo: http://localhost:${PORT}/widget`);
      }
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;