// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
// ***********************************************************

import './commands';
import '@cypress/code-coverage/support';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Don't fail tests on React's development mode warnings
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  
  if (err.message.includes('Non-serializable values were found in the state')) {
    return false;
  }
  
  // Log the error but don't fail the test for known non-critical errors
  if (err.message.includes('Network request failed') || 
      err.message.includes('Loading chunk')) {
    console.log('Non-critical error caught:', err.message);
    return false;
  }
  
  return true;
});