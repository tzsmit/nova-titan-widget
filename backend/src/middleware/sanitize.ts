/**
 * Input Sanitization Middleware
 * 
 * Sanitizes user inputs to prevent XSS, SQL injection, and other attacks
 * 
 * Phase 5: Security & Performance
 */

import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

export interface SanitizeOptions {
  stripHtml?: boolean;
  trimWhitespace?: boolean;
  maxLength?: number;
}

const DEFAULT_OPTIONS: SanitizeOptions = {
  stripHtml: true,
  trimWhitespace: true,
  maxLength: 10000,
};

export class Sanitizer {
  /**
   * Sanitize a string value
   */
  static sanitizeString(value: string, options: SanitizeOptions = {}): string {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let sanitized = value;

    // Trim whitespace
    if (opts.trimWhitespace) {
      sanitized = sanitized.trim();
    }

    // Strip HTML tags to prevent XSS
    if (opts.stripHtml) {
      sanitized = validator.stripLow(sanitized);
      sanitized = sanitized.replace(/<[^>]*>/g, ''); // Remove HTML tags
      sanitized = validator.escape(sanitized); // Escape HTML entities
    }

    // Enforce max length
    if (opts.maxLength && sanitized.length > opts.maxLength) {
      sanitized = sanitized.substring(0, opts.maxLength);
    }

    return sanitized;
  }

  /**
   * Sanitize an object recursively
   */
  static sanitizeObject(obj: any, options: SanitizeOptions = {}): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj, options);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item, options));
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeObject(obj[key], options);
        }
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Validate email
   */
  static isValidEmail(email: string): boolean {
    return validator.isEmail(email);
  }

  /**
   * Validate URL
   */
  static isValidURL(url: string): boolean {
    return validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true,
    });
  }

  /**
   * Validate numeric value
   */
  static isValidNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }

  /**
   * Validate integer
   */
  static isValidInteger(value: any): boolean {
    return Number.isInteger(value);
  }

  /**
   * Validate positive number
   */
  static isPositiveNumber(value: any): boolean {
    return this.isValidNumber(value) && value > 0;
  }

  /**
   * Validate date
   */
  static isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Sanitize query parameters
   */
  static sanitizeQueryParams(query: any): any {
    const sanitized: any = {};

    for (const key in query) {
      if (query.hasOwnProperty(key)) {
        const value = query[key];

        if (typeof value === 'string') {
          sanitized[key] = this.sanitizeString(value, { maxLength: 500 });
        } else if (Array.isArray(value)) {
          sanitized[key] = value
            .filter((v) => typeof v === 'string')
            .map((v) => this.sanitizeString(v, { maxLength: 500 }));
        } else {
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }
}

/**
 * Middleware to sanitize request body
 */
export const sanitizeBody = (options: SanitizeOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
      req.body = Sanitizer.sanitizeObject(req.body, options);
    }
    next();
  };
};

/**
 * Middleware to sanitize query parameters
 */
export const sanitizeQuery = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.query) {
      req.query = Sanitizer.sanitizeQueryParams(req.query);
    }
    next();
  };
};

/**
 * Combined sanitization middleware
 */
export const sanitize = (options: SanitizeOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Sanitize body
    if (req.body) {
      req.body = Sanitizer.sanitizeObject(req.body, options);
    }

    // Sanitize query
    if (req.query) {
      req.query = Sanitizer.sanitizeQueryParams(req.query);
    }

    next();
  };
};

export default Sanitizer;
