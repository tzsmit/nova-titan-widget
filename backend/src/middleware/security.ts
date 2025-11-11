/**
 * Security Middleware
 * 
 * Additional security layers including CSRF protection and enhanced headers
 * 
 * Phase 5: Security & Performance
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface CSRFConfig {
  secret: string;
  cookieName?: string;
  headerName?: string;
  tokenLength?: number;
}

const DEFAULT_CSRF_CONFIG: Partial<CSRFConfig> = {
  cookieName: 'csrf-token',
  headerName: 'X-CSRF-Token',
  tokenLength: 32,
};

export class CSRFProtection {
  private config: CSRFConfig;

  constructor(config: CSRFConfig) {
    this.config = { ...DEFAULT_CSRF_CONFIG, ...config };
  }

  /**
   * Generate CSRF token
   */
  generateToken(): string {
    return crypto.randomBytes(this.config.tokenLength!).toString('hex');
  }

  /**
   * Hash token with secret
   */
  private hashToken(token: string): string {
    return crypto
      .createHmac('sha256', this.config.secret)
      .update(token)
      .digest('hex');
  }

  /**
   * Verify CSRF token
   */
  verifyToken(token: string, hashedToken: string): boolean {
    const expectedHash = this.hashToken(token);
    
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedHash),
        Buffer.from(hashedToken)
      );
    } catch {
      return false;
    }
  }

  /**
   * Middleware to generate and set CSRF token
   */
  generateMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Generate token
      const token = this.generateToken();
      const hashedToken = this.hashToken(token);

      // Set cookie
      res.cookie(this.config.cookieName!, hashedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000, // 1 hour
      });

      // Expose token to frontend (non-httpOnly)
      res.cookie(`${this.config.cookieName!}-value`, token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000,
      });

      next();
    };
  }

  /**
   * Middleware to verify CSRF token
   */
  verifyMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Skip for GET, HEAD, OPTIONS
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }

      // Skip for health check
      if (req.path === '/api/health') {
        return next();
      }

      // Get token from header
      const token = req.headers[this.config.headerName!.toLowerCase()] as string;
      if (!token) {
        return res.status(403).json({
          success: false,
          error: 'Missing CSRF token',
        });
      }

      // Get hashed token from cookie
      const hashedToken = req.cookies[this.config.cookieName!];
      if (!hashedToken) {
        return res.status(403).json({
          success: false,
          error: 'CSRF token not initialized',
        });
      }

      // Verify token
      if (!this.verifyToken(token, hashedToken)) {
        return res.status(403).json({
          success: false,
          error: 'Invalid CSRF token',
        });
      }

      next();
    };
  }
}

/**
 * Enhanced security headers middleware
 */
export const securityHeaders = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https://api.the-odds-api.com https://site.api.espn.com; " +
      "frame-ancestors 'none';"
    );

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // XSS Protection (legacy browsers)
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(self), microphone=(), camera=(), payment=()'
    );

    next();
  };
};

/**
 * IP-based rate limiting
 */
export class IPRateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [ip, data] of this.requests.entries()) {
      if (data.resetTime < now) {
        this.requests.delete(ip);
      }
    }
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const now = Date.now();

      let data = this.requests.get(ip);

      if (!data || data.resetTime < now) {
        // New window
        data = {
          count: 1,
          resetTime: now + this.windowMs,
        };
        this.requests.set(ip, data);
        return next();
      }

      // Increment count
      data.count++;

      if (data.count > this.maxRequests) {
        const retryAfter = Math.ceil((data.resetTime - now) / 1000);
        res.setHeader('Retry-After', retryAfter.toString());
        
        return res.status(429).json({
          success: false,
          error: 'Too many requests',
          retryAfter,
        });
      }

      next();
    };
  }
}

/**
 * Request ID middleware for tracking
 */
export const requestId = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = crypto.randomBytes(16).toString('hex');
    req.headers['x-request-id'] = id;
    res.setHeader('X-Request-ID', id);
    next();
  };
};

export default {
  CSRFProtection,
  securityHeaders,
  IPRateLimiter,
  requestId,
};
