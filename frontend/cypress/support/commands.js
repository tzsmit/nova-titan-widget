// ***********************************************
// Custom commands for Nova Titan Widget testing
// ***********************************************

/**
 * Custom command for accessible tabbing
 */
Cypress.Commands.add('tab', { prevSubject: 'optional' }, (subject) => {
  const options = { keyCode: 9, which: 9, key: 'Tab' };
  
  if (subject) {
    return cy.wrap(subject).trigger('keydown', options);
  } else {
    return cy.get('body').trigger('keydown', options);
  }
});

/**
 * Custom command for testing responsive behavior
 */
Cypress.Commands.add('testResponsive', (breakpoints = {}) => {
  const defaultBreakpoints = {
    mobile: [375, 667],
    tablet: [768, 1024], 
    desktop: [1280, 720],
    ...breakpoints
  };
  
  Object.entries(defaultBreakpoints).forEach(([device, [width, height]]) => {
    cy.viewport(width, height);
    cy.log(`Testing ${device} viewport: ${width}x${height}`);
    
    // Wait for responsive changes to take effect
    cy.wait(100);
    
    // Verify widget is still functional
    cy.get('[data-testid="nova-titan-widget"]').should('be.visible');
  });
});

/**
 * Custom command for waiting for widget to be fully loaded
 */
Cypress.Commands.add('waitForWidget', () => {
  // Wait for main widget
  cy.get('[data-testid="nova-titan-widget"]', { timeout: 10000 })
    .should('be.visible');
    
  // Wait for navigation to be ready
  cy.get('[data-testid="widget-navigation"]')
    .should('be.visible');
    
  // Wait for any initial loading to complete
  cy.get('[data-testid="skeleton-loader"]', { timeout: 5000 })
    .should('not.exist');
});

/**
 * Custom command for adding bets to slip
 */
Cypress.Commands.add('addBetToSlip', (gameIndex = 0, betType = 'moneyline') => {
  cy.get('[data-testid="nav-games"]').click();
  
  cy.get(`[data-testid="game-card"]:eq(${gameIndex})`)
    .find(`[data-testid="bet-${betType}"]`)
    .click();
    
  // Verify bet was added
  cy.get('[data-testid="bet-slip-item"]').should('be.visible');
});

/**
 * Custom command for checking accessibility
 */
Cypress.Commands.add('checkA11y', (context = null, options = {}) => {
  const defaultOptions = {
    includedImpacts: ['critical', 'serious'],
    rules: {
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'aria-valid-attr': { enabled: true },
      'button-name': { enabled: true },
      'link-name': { enabled: true },
      ...options.rules
    },
    ...options
  };
  
  // Mock axe-core for basic accessibility checks
  cy.window().then((win) => {
    // Check for basic accessibility attributes
    if (context) {
      cy.get(context).within(() => {
        // Check for ARIA labels
        cy.get('button').each(($btn) => {
          cy.wrap($btn).should('satisfy', ($el) => {
            return $el.attr('aria-label') || 
                   $el.attr('title') || 
                   $el.text().trim() !== '';
          });
        });
        
        // Check for form labels
        cy.get('input').each(($input) => {
          cy.wrap($input).should('satisfy', ($el) => {
            return $el.attr('aria-label') || 
                   $el.attr('placeholder') ||
                   $el.closest('label').length > 0;
          });
        });
      });
    }
  });
});

/**
 * Custom command for performance testing
 */
Cypress.Commands.add('measurePerformance', (label = 'default') => {
  cy.window().then((win) => {
    // Mark start time
    win.performance.mark(`${label}-start`);
    
    return cy.wrap(label);
  });
});

Cypress.Commands.add('endMeasurePerformance', (label = 'default', maxTime = 3000) => {
  cy.window().then((win) => {
    // Mark end time
    win.performance.mark(`${label}-end`);
    
    // Measure duration
    win.performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = win.performance.getEntriesByName(label)[0];
    const duration = measure.duration;
    
    cy.log(`Performance: ${label} took ${duration.toFixed(2)}ms`);
    
    // Assert performance threshold
    expect(duration).to.be.lessThan(maxTime);
  });
});

/**
 * Custom command for testing network conditions
 */
Cypress.Commands.add('simulateSlowNetwork', (delay = 2000) => {
  cy.intercept('**/*', (req) => {
    req.reply((res) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(res), delay);
      });
    });
  }).as('slowNetwork');
});

/**
 * Custom command for testing error recovery
 */
Cypress.Commands.add('simulateNetworkError', (pattern = '**/*') => {
  cy.intercept('GET', pattern, { forceNetworkError: true }).as('networkError');
});

Cypress.Commands.add('restoreNetwork', () => {
  cy.intercept('GET', '**/*').as('networkRestored');
});

/**
 * Custom command for widget-specific interactions
 */
Cypress.Commands.add('switchTab', (tabName) => {
  cy.get(`[data-testid="nav-${tabName}"]`).click();
  
  // Wait for tab content to load
  cy.get(`[data-testid="${tabName}-content"]`).should('be.visible');
});

/**
 * Custom command for bet slip interactions
 */
Cypress.Commands.add('openBetSlip', () => {
  // Check if mobile
  cy.viewport('iphone-8');
  
  cy.get('[data-testid="bet-slip-toggle"]').click();
  cy.get('[data-testid="bet-slip"]').should('be.visible');
});

Cypress.Commands.add('closeBetSlip', () => {
  cy.get('[data-testid="bet-slip-close"]').click();
  cy.get('[data-testid="bet-slip"]').should('not.be.visible');
});

// Add TypeScript support for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      tab(options?: any): Chainable<Element>;
      testResponsive(breakpoints?: object): Chainable<Element>;
      waitForWidget(): Chainable<Element>;
      addBetToSlip(gameIndex?: number, betType?: string): Chainable<Element>;
      checkA11y(context?: string, options?: object): Chainable<Element>;
      measurePerformance(label?: string): Chainable<string>;
      endMeasurePerformance(label?: string, maxTime?: number): Chainable<Element>;
      simulateSlowNetwork(delay?: number): Chainable<Element>;
      simulateNetworkError(pattern?: string): Chainable<Element>;
      restoreNetwork(): Chainable<Element>;
      switchTab(tabName: string): Chainable<Element>;
      openBetSlip(): Chainable<Element>;
      closeBetSlip(): Chainable<Element>;
    }
  }
}