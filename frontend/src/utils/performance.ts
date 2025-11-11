/**
 * Performance Optimization Utilities
 * 
 * Utilities for lazy loading, code splitting, and performance monitoring
 * 
 * Phase 5: Security & Performance
 */

import { lazy, ComponentType } from 'react';

/**
 * Lazy load a component with retry logic
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries: number = 3,
  interval: number = 1000
): React.LazyExoticComponent<T> {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      const attemptImport = (attemptsLeft: number) => {
        componentImport()
          .then(resolve)
          .catch((error) => {
            if (attemptsLeft === 1) {
              reject(error);
              return;
            }

            console.warn(
              `Failed to load component. Retrying... (${retries - attemptsLeft + 1}/${retries})`
            );

            setTimeout(() => {
              attemptImport(attemptsLeft - 1);
            }, interval);
          });
      };

      attemptImport(retries);
    });
  });
}

/**
 * Preload a component
 */
export function preloadComponent(componentImport: () => Promise<any>) {
  const promise = componentImport();
  return () => promise;
}

/**
 * Intersection Observer for lazy loading
 */
export class LazyLoader {
  private observer: IntersectionObserver;

  constructor(options?: IntersectionObserverInit) {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const src = element.dataset.src;
          const srcset = element.dataset.srcset;

          if (src) {
            if (element.tagName === 'IMG') {
              (element as HTMLImageElement).src = src;
            } else {
              element.style.backgroundImage = `url(${src})`;
            }
          }

          if (srcset) {
            (element as HTMLImageElement).srcset = srcset;
          }

          element.classList.add('loaded');
          this.observer.unobserve(element);
        }
      });
    }, options);
  }

  observe(element: Element) {
    this.observer.observe(element);
  }

  unobserve(element: Element) {
    this.observer.unobserve(element);
  }

  disconnect() {
    this.observer.disconnect();
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Performance measurement
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  /**
   * Start measuring
   */
  start(name: string) {
    this.marks.set(name, performance.now());
  }

  /**
   * End measuring and get duration
   */
  end(name: string): number {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`No start mark found for: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(name);

    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  /**
   * Measure a function
   */
  measure<T>(name: string, fn: () => T): T {
    this.start(name);
    try {
      const result = fn();
      return result;
    } finally {
      this.end(name);
    }
  }

  /**
   * Measure an async function
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      return result;
    } finally {
      this.end(name);
    }
  }
}

/**
 * Get Web Vitals
 */
export function reportWebVitals(onPerfEntry?: (metric: any) => void) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onFID(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
}

/**
 * Check if images support WebP
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
  });
}

/**
 * Optimize image URL for WebP
 */
export async function optimizeImageUrl(url: string): Promise<string> {
  const webpSupported = await supportsWebP();
  
  if (webpSupported && !url.endsWith('.webp')) {
    // Try to request WebP version
    return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
  
  return url;
}

/**
 * Service Worker registration
 */
export function registerServiceWorker(swUrl: string = '/service-worker.js') {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}

/**
 * Prefetch resources
 */
export function prefetchResource(url: string, as: string = 'fetch') {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * Preconnect to domain
 */
export function preconnectDomain(url: string) {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

export default {
  lazyWithRetry,
  preloadComponent,
  LazyLoader,
  debounce,
  throttle,
  PerformanceMonitor,
  reportWebVitals,
  supportsWebP,
  optimizeImageUrl,
  registerServiceWorker,
  prefetchResource,
  preconnectDomain,
};
