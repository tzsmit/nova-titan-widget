/**
 * HMAC Authentication Middleware
 * 
 * Provides request signing and verification using HMAC-SHA256
 * to ensure API requests haven't been tampered with.
 * 
 * Phase 5: Security & Performance
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface HMACConfig {
  secret: string;
  algorithm?: string;
  headerName?: string;
  timestampTolerance?: number; // seconds
  requireTimestamp?: boolean;
}

const DEFAULT_CONFIG: Partial<HMACConfig> = {
  algorithm: 'sha256',
  headerName: 'X-HMAC-Signature',
  timestampTolerance: 300, // 5 minutes
  requireTimestamp: true,
};

export class HMACAuth {
  private config: HMACConfig;

  constructor(config: HMACConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate HMAC signature for a payload
   */
  static generateSignature(
    payload: string,
    secret: string,
    algorithm: string = 'sha256'
  ): string {
    return crypto
      .createHmac(algorithm, secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  static verifySignature(
    payload: string,
    signature: string,
    secret: string,
    algorithm: string = 'sha256'
  ): boolean {
    const expectedSignature = this.generateSignature(payload, secret, algorithm);
    
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Create request payload for signing
   */
  private createPayload(req: Request): string {
    const timestamp = req.headers['x-timestamp'] as string;
    const method = req.method;
    const path = req.path;
    const body = req.body ? JSON.stringify(req.body) : '';
    
    return `${method}|${path}|${body}|${timestamp}`;
  }

  /**
   * Middleware to verify HMAC signature
   */
  verify() {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        // Skip HMAC verification for health check
        if (req.path === '/api/health') {
          return next();
        }

        // Get signature from header
        const signature = req.headers[this.config.headerName!.toLowerCase()] as string;
        if (!signature) {
          return res.status(401).json({
            success: false,
            error: 'Missing HMAC signature',
          });
        }

        // Check timestamp if required
        if (this.config.requireTimestamp) {
          const timestamp = req.headers['x-timestamp'] as string;
          if (!timestamp) {
            return res.status(401).json({
              success: false,
              error: 'Missing timestamp',
            });
          }

          const requestTime = parseInt(timestamp, 10);
          const currentTime = Math.floor(Date.now() / 1000);
          const timeDiff = Math.abs(currentTime - requestTime);

          if (timeDiff > this.config.timestampTolerance!) {
            return res.status(401).json({
              success: false,
              error: 'Request timestamp expired',
            });
          }
        }

        // Create payload and verify signature
        const payload = this.createPayload(req);
        const isValid = HMACAuth.verifySignature(
          payload,
          signature,
          this.config.secret,
          this.config.algorithm!
        );

        if (!isValid) {
          return res.status(401).json({
            success: false,
            error: 'Invalid HMAC signature',
          });
        }

        next();
      } catch (error) {
        console.error('HMAC verification error:', error);
        return res.status(500).json({
          success: false,
          error: 'Authentication error',
        });
      }
    };
  }

  /**
   * Helper to generate signature for client-side requests
   */
  static signRequest(
    method: string,
    path: string,
    body: any,
    secret: string,
    algorithm: string = 'sha256'
  ): { signature: string; timestamp: string } {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const bodyStr = body ? JSON.stringify(body) : '';
    const payload = `${method}|${path}|${bodyStr}|${timestamp}`;
    const signature = this.generateSignature(payload, secret, algorithm);

    return { signature, timestamp };
  }
}

export default HMACAuth;
