/**
 * Environment variable utilities that work in both Vite and Jest environments
 */

// Safe access to import.meta.env that works in tests
const getEnvVar = (key: string, defaultValue?: string): string | undefined => {
  // Check if we're in a Vite environment
  if (typeof import !== 'undefined' && import.meta && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  
  // Fallback for Jest/Node environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  return defaultValue;
};

export const env = {
  VITE_PRIMARY_ODDS_API_KEY: getEnvVar('VITE_PRIMARY_ODDS_API_KEY', 'effdb0775abef82ff5dd944ae2180cae'),
  VITE_SECONDARY_ODDS_API_KEY: getEnvVar('VITE_SECONDARY_ODDS_API_KEY'),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
};