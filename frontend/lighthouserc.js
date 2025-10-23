module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4173'],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:   http://localhost:4173',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        // Performance thresholds (target >= 80 as specified)
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.8 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 500 }],
        
        // Bundle size constraints
        'resource-summary:script:size': ['warn', { maxNumericValue: 500000 }], // 500KB JS
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 100000 }], // 100KB CSS
        'resource-summary:image:size': ['warn', { maxNumericValue: 1000000 }], // 1MB images
        
        // Accessibility requirements
        'color-contrast': 'error',
        'heading-order': 'error',
        'link-name': 'error',
        'button-name': 'error',
        'aria-valid-attr': 'error',
        'aria-valid-attr-value': 'error',
        'keyboard-navigation': 'error',
        'focus-traps': 'warn',
        
        // Performance best practices
        'uses-optimized-images': 'warn',
        'uses-webp-images': 'warn',
        'efficient-animated-content': 'warn',
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        
        // Nova Titan specific requirements
        'viewport': 'error', // Mobile responsive
        'meta-description': 'warn',
        'document-title': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lighthouse-ci.db',
      },
    },
  },
};