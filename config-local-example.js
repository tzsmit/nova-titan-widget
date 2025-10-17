/**
 * LOCAL CONFIGURATION EXAMPLE
 * 
 * INSTRUCTIONS:
 * 1. Copy this file to 'config-local.js' 
 * 2. Replace 'your_api_key_here' with your actual API key
 * 3. Include config-local.js in your HTML for local development
 * 4. NEVER commit config-local.js to git (it's in .gitignore)
 */

// For local development - copy this file to config-local.js and add your real API key
window.NOVA_TITAN_API_KEY = 'your_api_key_here';

// Additional local configuration
window.NOVA_TITAN_CONFIG = {
  ENVIRONMENT: 'development',
  DEBUG_MODE: true,
  API_BASE_URL: 'https://api.the-odds-api.com/v4'
};