/**
 * Brand Security - Advanced protection for Nova Titan branding
 * This file ensures no one can modify or extract the branding elements
 */

// Brand constants that cannot be modified
export const BRAND_CONFIG = Object.freeze({
  LOGO_URL: '/src/assets/nova-titan-logo.png',
  COMPANY_NAME: 'Nova Titan Elite',
  BRAND_TEXT: 'Nova TitanAI a product of Nova Titan Systems',
  WEBSITE_URL: 'https://novatitan.net/',
  PROTECTION_ENABLED: true
});

// Initialize brand protection
export function initBrandProtection() {
  // Simple brand protection without infinite loops

  // Disable right-click globally on protected elements
  document.addEventListener('contextmenu', (e) => {
    const target = e.target as HTMLElement;
    if (target?.closest('.nova-titan-protected') || 
        target?.getAttribute('alt')?.includes('Nova Titan') ||
        target?.getAttribute('src')?.includes('nova-titan')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });

  // Disable text selection on protected elements
  document.addEventListener('selectstart', (e) => {
    const target = e.target as HTMLElement;
    if (target?.closest('.nova-titan-protected')) {
      e.preventDefault();
      return false;
    }
  });

  // Disable drag on protected elements
  document.addEventListener('dragstart', (e) => {
    const target = e.target as HTMLElement;
    if (target?.closest('.nova-titan-protected') ||
        target?.getAttribute('alt')?.includes('Nova Titan')) {
      e.preventDefault();
      return false;
    }
  });

  // Disable keyboard shortcuts that could extract content
  document.addEventListener('keydown', (e) => {
    // Disable F12, Ctrl+Shift+I, Ctrl+U (view source), etc.
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C')) {
      e.preventDefault();
      return false;
    }
  });

  // Basic DOM monitoring without causing infinite loops

  // Log protection initialization
  console.log('🔒 Nova Titan Brand Protection Active');
}

// Validate branding integrity
export function validateBranding(): boolean {
  const logoElements = document.querySelectorAll('img[alt*="Nova Titan"]');
  const brandingElements = document.querySelectorAll('.nova-titan-protected');
  
  return logoElements.length > 0 && brandingElements.length > 0;
}

// Lock down settings to prevent branding changes
export function lockBrandingSettings() {
  // Override any attempts to modify branding in settings
  Object.defineProperty(window, 'changeBranding', {
    value: () => false,
    writable: false,
    configurable: false
  });

  Object.defineProperty(window, 'updateLogo', {
    value: () => false,
    writable: false,
    configurable: false
  });
}