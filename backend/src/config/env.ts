/**
 * Environment Configuration
 * Validates and exports environment variables with type safety
 */

import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface EnvConfig {
  // Server
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  HOST: string;
  
  // APIs
  ODDS_API_KEY: string;
  ODDS_API_BASE_URL: string;
  ESPN_API_KEY?: string;
  
  // Redis (Upstash)
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  
  // Cache
  CACHE_DEFAULT_TTL: number;
  CACHE_ENABLED: boolean;
  
  // CORS
  CORS_ORIGIN: string;
  
  // Security
  HMAC_SECRET?: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  
  // Sentry (optional)
  SENTRY_DSN?: string;
  
  // Logging
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
}

/**
 * Parse environment variable as number
 */
function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parse environment variable as boolean
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Validate required environment variables
 */
function validateEnv(): void {
  const required = [
    'ODDS_API_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n\n` +
      `Please create a .env file in the backend directory with these variables.\n` +
      `See .env.example for reference.`
    );
  }
}

/**
 * Load and export configuration
 */
function loadConfig(): EnvConfig {
  validateEnv();

  return {
    // Server
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    PORT: parseNumber(process.env.PORT, 3000),
    HOST: process.env.HOST || '0.0.0.0',
    
    // APIs
    ODDS_API_KEY: process.env.ODDS_API_KEY!,
    ODDS_API_BASE_URL: process.env.ODDS_API_BASE_URL || 'https://api.the-odds-api.com/v4',
    ESPN_API_KEY: process.env.ESPN_API_KEY,
    
    // Redis
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL!,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN!,
    
    // Cache
    CACHE_DEFAULT_TTL: parseNumber(process.env.CACHE_DEFAULT_TTL, 60),
    CACHE_ENABLED: parseBoolean(process.env.CACHE_ENABLED, true),
    
    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://novatitan.net',
    
    // Security
    HMAC_SECRET: process.env.HMAC_SECRET,
    RATE_LIMIT_WINDOW_MS: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
    
    // Sentry
    SENTRY_DSN: process.env.SENTRY_DSN,
    
    // Logging
    LOG_LEVEL: (process.env.LOG_LEVEL as any) || 'info',
  };
}

export const config = loadConfig();

export default config;
