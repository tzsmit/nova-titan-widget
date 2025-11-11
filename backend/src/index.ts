/**
 * Nova Titan Backend - Main Server Entry Point
 * Real-time sports betting odds aggregation platform
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import config from './config/env';
import apiRoutes from './routes/api';
import parlayAdvancedRoutes from './routes/parlay-advanced';

// Initialize Express app
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.the-odds-api.com', 'https://*.upstash.io'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = config.CORS_ORIGIN.split(',').map(o => o.trim());
    
    // Development: allow localhost
    if (config.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000', 'http://localhost:5173');
    }
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Signature'],
};

app.use(cors(corsOptions));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Request logging (development only)
if (config.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });
    next();
  });
}

// Health check (before rate limiting)
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Nova Titan Backend',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api', apiRoutes);
app.use('/api/parlay', parlayAdvancedRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  // Don't leak error details in production
  const message = config.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(500).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  });
});

// Start server
const PORT = config.PORT;
const HOST = config.HOST;

const server = app.listen(PORT, HOST, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                    🚀 NOVA TITAN BACKEND - RUNNING                          ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

  Environment: ${config.NODE_ENV}
  Server:      http://${HOST}:${PORT}
  Health:      http://${HOST}:${PORT}/api/health
  
  API Endpoints:
    GET  /api/sports              - List available sports
    GET  /api/events              - Get live events
    GET  /api/events/:eventId     - Get event odds
    GET  /api/bookmakers          - List bookmakers
    GET  /api/props/:eventId      - Get player props
    POST /api/price/parlay        - Calculate parlay
    GET  /api/insights            - Market insights
    GET  /api/quota               - API quota info
    GET  /api/health              - Health check
    GET  /api/cache/stats         - Cache statistics
    POST /api/cache/invalidate    - Invalidate cache
  
  Advanced Parlay Endpoints (Phase 2):
    POST /api/parlay/optimize           - Multi-book optimization
    POST /api/parlay/live-recalculate   - Live odds recalculation
    POST /api/parlay/edge-detection     - Edge detection per leg
    POST /api/parlay/bet-sizing         - Bet sizing recommendations
    POST /api/parlay/line-movement      - Track line movements
    GET  /api/parlay/line-movement/:id  - Line movement history
    POST /api/parlay/sgp-validate       - Same Game Parlay validation
  
  Configuration:
    Cache:       ${config.CACHE_ENABLED ? 'Enabled' : 'Disabled'}
    Cache TTL:   ${config.CACHE_DEFAULT_TTL}s
    Rate Limit:  ${config.RATE_LIMIT_MAX_REQUESTS} requests per ${config.RATE_LIMIT_WINDOW_MS / 60000} minutes
    CORS:        ${config.CORS_ORIGIN}
  
  Ready to serve real-time odds! 🎯
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
