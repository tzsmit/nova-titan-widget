/**
 * Deployment Configuration
 * Handles differences between development and production environments
 */

interface DeploymentConfig {
  isProduction: boolean;
  isDevelopment: boolean;
  hasBackend: boolean;
  apiBaseUrl: string;
  features: {
    rosterSync: boolean;
    database: boolean;
    caching: boolean;
  };
}

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

export const deploymentConfig: DeploymentConfig = {
  isProduction,
  isDevelopment,
  hasBackend: isDevelopment, // Only has backend in development
  apiBaseUrl: isDevelopment ? '/api' : '', // No backend API in production static deployment
  
  features: {
    rosterSync: isDevelopment, // Only sync to database in development
    database: isDevelopment,   // No database in static deployment
    caching: true              // Client-side caching works in both environments
  }
};

/**
 * Check if a feature is available in current environment
 */
export function isFeatureEnabled(feature: keyof DeploymentConfig['features']): boolean {
  return deploymentConfig.features[feature];
}

/**
 * Get appropriate API URL for current environment
 */
export function getApiUrl(endpoint: string): string {
  if (!deploymentConfig.hasBackend) {
    console.warn(`⚠️ API endpoint ${endpoint} not available in static deployment`);
    return '';
  }
  
  return `${deploymentConfig.apiBaseUrl}${endpoint}`;
}

/**
 * Log deployment environment info
 */
export function logDeploymentInfo(): void {
  console.log('🌐 Nova Titan Deployment Info:');
  console.log(`  Environment: ${isProduction ? 'Production (Static)' : 'Development'}`);
  console.log(`  Backend API: ${deploymentConfig.hasBackend ? 'Available' : 'Not Available'}`);
  console.log(`  Features:`, deploymentConfig.features);
  
  if (isProduction) {
    console.log('📊 Using live APIs only (ESPN, The Odds API) - no database');
  } else {
    console.log('💾 Using backend database with roster sync enabled');
  }
}