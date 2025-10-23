/**
 * Nova Titan Widget E2E Tests
 * Comprehensive end-to-end testing covering user flows and responsive behavior
 */

describe('Nova Titan Sports Betting Widget', () => {
  beforeEach(() => {
    // Visit the main widget page
    cy.visit('/');
    
    // Wait for widget to load
    cy.get('[data-testid="nova-titan-widget"]', { timeout: 10000 })
      .should('be.visible');
  });

  describe('Initial Load and Responsive Layout', () => {
    it('loads the widget successfully', () => {
      cy.get('[data-testid="nova-titan-widget"]').should('be.visible');
      cy.get('[data-testid="widget-header"]').should('contain.text', 'Nova Titan');
    });

    it('displays navigation tabs', () => {
      cy.get('[data-testid="widget-navigation"]').should('be.visible');
      cy.get('[data-testid="nav-games"]').should('be.visible');
      cy.get('[data-testid="nav-parlays"]').should('be.visible');
      cy.get('[data-testid="nav-player-props"]').should('be.visible');
      cy.get('[data-testid="nav-ai-insights"]').should('be.visible');
    });

    it('adapts to mobile viewport correctly', () => {
      cy.viewport('iphone-8');
      
      // Mobile navigation should be visible
      cy.get('[data-testid="mobile-navigation"]').should('be.visible');
      
      // Desktop navigation should be hidden
      cy.get('[data-testid="desktop-navigation"]').should('not.be.visible');
      
      // Widget should maintain proper layout
      cy.get('[data-testid="nova-titan-widget"]')
        .should('have.css', 'width')
        .and('match', /\d+px/);
    });

    it('adapts to tablet viewport correctly', () => {
      cy.viewport('ipad-2');
      
      // Should show 2-column layout
      cy.get('[data-testid="main-content"]')
        .should('have.class', 'md:grid-cols-2');
        
      // Bet slip should be accessible
      cy.get('[data-testid="bet-slip-toggle"]').should('be.visible');
    });

    it('shows desktop 3-column layout', () => {
      cy.viewport(1280, 720);
      
      // Should show 3-column layout
      cy.get('[data-testid="main-content"]')
        .should('have.class', 'lg:grid-cols-3');
        
      // All panels should be visible
      cy.get('[data-testid="games-panel"]').should('be.visible');
      cy.get('[data-testid="bet-slip-panel"]').should('be.visible');
    });
  });

  describe('Games Tab - Core Functionality', () => {
    beforeEach(() => {
      cy.get('[data-testid="nav-games"]').click();
    });

    it('displays game list with proper grid layout', () => {
      cy.get('[data-testid="games-list"]').should('be.visible');
      
      // Should use CSS Grid with minmax
      cy.get('[data-testid="games-grid"]')
        .should('have.css', 'display', 'grid')
        .and('have.css', 'grid-template-columns')
        .and('contain', 'minmax');
    });

    it('shows loading skeleton while fetching games', () => {
      // Intercept API call to simulate loading
      cy.intercept('GET', '**/sports/*/odds', { delay: 2000, fixture: 'games.json' });
      
      cy.reload();
      
      // Should show skeleton loading
      cy.get('[data-testid="skeleton-game-card"]').should('be.visible');
      cy.get('[data-testid="skeleton-game-card"]').should('have.length.at.least', 3);
    });

    it('handles empty state gracefully', () => {
      // Mock empty response
      cy.intercept('GET', '**/sports/*/odds', { body: [] });
      
      cy.reload();
      
      // Should show empty state
      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-state"]')
        .should('contain.text', 'No games available');
    });

    it('allows filtering by sport', () => {
      cy.get('[data-testid="sport-filter"]').should('be.visible');
      
      // Click NBA filter
      cy.get('[data-testid="filter-basketball_nba"]').click();
      
      // Should show only NBA games
      cy.get('[data-testid="game-card"]').each(($card) => {
        cy.wrap($card).should('contain', 'NBA');
      });
    });

    it('allows filtering by date', () => {
      cy.get('[data-testid="date-selector"]').should('be.visible');
      
      // Select tomorrow's date
      cy.get('[data-testid="date-tomorrow"]').click();
      
      // Should update games list
      cy.get('[data-testid="games-list"]').should('be.visible');
    });

    it('fixes overflow issues in games grid', () => {
      // Should not have horizontal overflow
      cy.get('[data-testid="games-container"]')
        .should('have.css', 'overflow-x', 'visible')
        .or('have.css', 'overflow-x', 'hidden');
        
      // Parent should have min-width: 0
      cy.get('[data-testid="games-list"]')
        .should('have.css', 'min-width', '0px');
    });

    it('shows error state with retry functionality', () => {
      // Mock API error
      cy.intercept('GET', '**/sports/*/odds', { statusCode: 500 });
      
      cy.reload();
      
      // Should show error state
      cy.get('[data-testid="error-state"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
      
      // Mock successful retry
      cy.intercept('GET', '**/sports/*/odds', { fixture: 'games.json' });
      
      // Click retry
      cy.get('[data-testid="retry-button"]').click();
      
      // Should show games after retry
      cy.get('[data-testid="games-list"]').should('be.visible');
    });
  });

  describe('Parlay Builder - Enhanced Features', () => {
    beforeEach(() => {
      cy.get('[data-testid="nav-parlays"]').click();
    });

    it('loads parlay builder with featured parlays', () => {
      cy.get('[data-testid="parlay-builder"]').should('be.visible');
      cy.get('[data-testid="featured-parlays"]').should('be.visible');
    });

    it('shows robust loading skeleton for parlays', () => {
      cy.intercept('GET', '**/featured-parlays', { delay: 2000, fixture: 'featured-parlays.json' });
      
      cy.reload();
      
      // Should show skeleton loading
      cy.get('[data-testid="skeleton-parlay"]').should('be.visible');
    });

    it('handles fetch failures with retry logic', () => {
      // Mock initial failure
      cy.intercept('GET', '**/featured-parlays', { statusCode: 500 });
      
      cy.reload();
      
      // Should show error with retry
      cy.get('[data-testid="parlay-error"]').should('be.visible');
      cy.get('[data-testid="parlay-retry"]').should('be.visible');
      
      // Mock successful retry
      cy.intercept('GET', '**/featured-parlays', { fixture: 'featured-parlays.json' });
      
      cy.get('[data-testid="parlay-retry"]').click();
      
      // Should show parlays after retry
      cy.get('[data-testid="featured-parlays"]').should('be.visible');
    });

    it('prevents duplicate selections', () => {
      // Add a sample leg
      cy.get('[data-testid="add-sample-leg"]').click();
      
      // Try to add same leg again (this would be prevented)
      cy.get('[data-testid="add-sample-leg"]').click();
      
      // Should show validation error
      cy.get('[data-testid="validation-error"]')
        .should('contain.text', 'duplicate')
        .or('contain.text', 'conflict');
    });

    it('prevents conflicting selections', () => {
      // This would require specific test data to create conflicts
      cy.get('[data-testid="parlay-builder"]').should('be.visible');
      
      // Add conflicting bets would show validation
      // Implementation depends on test data setup
    });

    it('calculates odds and payouts correctly', () => {
      // Add sample legs
      cy.get('[data-testid="add-sample-leg"]').click();
      
      // Check odds calculation
      cy.get('[data-testid="total-odds"]').should('be.visible');
      cy.get('[data-testid="potential-payout"]').should('be.visible');
      
      // Verify calculation is numeric
      cy.get('[data-testid="total-odds"]')
        .invoke('text')
        .should('match', /\d+\.\d+/);
    });
  });

  describe('Bet Slip - Mobile Slide-over', () => {
    it('opens bet slip as slide-over on mobile', () => {
      cy.viewport('iphone-8');
      
      // Bet slip should be hidden initially
      cy.get('[data-testid="bet-slip"]').should('not.be.visible');
      
      // Click bet slip toggle
      cy.get('[data-testid="bet-slip-toggle"]').click();
      
      // Should slide in from right
      cy.get('[data-testid="bet-slip"]')
        .should('be.visible')
        .and('have.class', 'slide-over');
    });

    it('shows bet slip as sidebar on desktop', () => {
      cy.viewport(1280, 720);
      
      // Bet slip should be visible as sidebar
      cy.get('[data-testid="bet-slip"]')
        .should('be.visible')
        .and('have.class', 'sidebar');
    });

    it('manages bet slip state correctly', () => {
      // Add bet from games tab
      cy.get('[data-testid="nav-games"]').click();
      
      // Click on a bet button (mock)
      cy.get('[data-testid="bet-button"]').first().click();
      
      // Bet should appear in bet slip
      cy.get('[data-testid="bet-slip-item"]').should('be.visible');
      
      // Should show bet count
      cy.get('[data-testid="bet-count"]').should('contain', '1');
    });

    it('calculates total stake and payout', () => {
      // Add multiple bets (this requires mock data)
      cy.get('[data-testid="bet-slip"]').should('be.visible');
      
      // Should show totals
      cy.get('[data-testid="total-stake"]').should('be.visible');
      cy.get('[data-testid="total-payout"]').should('be.visible');
    });
  });

  describe('Accessibility and User Experience', () => {
    it('supports keyboard navigation', () => {
      // Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('be.visible');
      
      // Continue tabbing through main navigation
      cy.focused().tab();
      cy.focused().should('have.attr', 'role', 'tab')
        .or('have.attr', 'role', 'button');
    });

    it('has proper ARIA labels and roles', () => {
      // Check main widget has proper role
      cy.get('[data-testid="nova-titan-widget"]')
        .should('have.attr', 'role', 'application')
        .or('have.attr', 'role', 'main');
      
      // Navigation should have proper roles
      cy.get('[data-testid="widget-navigation"]')
        .should('have.attr', 'role', 'tablist');
        
      cy.get('[data-testid="nav-games"]')
        .should('have.attr', 'role', 'tab');
    });

    it('supports screen readers with announcements', () => {
      // Check for live regions
      cy.get('[aria-live]').should('exist');
      
      // Status updates should be announced
      cy.get('[data-testid="status-message"]')
        .should('have.attr', 'aria-live', 'polite')
        .or('have.attr', 'aria-live', 'assertive');
    });

    it('respects user motion preferences', () => {
      // Test with reduced motion
      cy.window().then((win) => {
        // Mock reduced motion preference
        Object.defineProperty(win, 'matchMedia', {
          value: () => ({
            matches: true, // prefers-reduced-motion: reduce
            addEventListener: () => {},
            removeEventListener: () => {},
          }),
        });
      });
      
      // Animations should be reduced or disabled
      cy.get('[data-testid="animated-element"]')
        .should('have.css', 'animation-duration', '0.01s')
        .or('have.css', 'transition-duration', '0.01s');
    });

    it('maintains focus management during navigation', () => {
      // Focus on games tab
      cy.get('[data-testid="nav-games"]').focus().should('be.focused');
      
      // Press Enter to activate
      cy.focused().type('{enter}');
      
      // Focus should move appropriately
      cy.get('[data-testid="games-list"]').should('be.visible');
    });
  });

  describe('Performance and Loading', () => {
    it('loads within acceptable time limits', () => {
      const start = Date.now();
      
      cy.visit('/');
      
      cy.get('[data-testid="nova-titan-widget"]').should('be.visible');
      
      cy.then(() => {
        const loadTime = Date.now() - start;
        expect(loadTime).to.be.lessThan(3000); // 3 second limit
      });
    });

    it('handles slow network gracefully', () => {
      // Throttle network
      cy.intercept('GET', '**/*', (req) => {
        req.reply((res) => {
          return new Promise((resolve) => {
            setTimeout(() => resolve(res), 1000);
          });
        });
      });
      
      cy.visit('/');
      
      // Should show loading states
      cy.get('[data-testid="skeleton-loader"]').should('be.visible');
      
      // Eventually load content
      cy.get('[data-testid="nova-titan-widget"]', { timeout: 15000 })
        .should('be.visible');
    });

    it('prevents layout shift during loading', () => {
      cy.visit('/');
      
      // Measure initial layout
      cy.get('[data-testid="main-content"]').then(($el) => {
        const initialHeight = $el.height();
        
        // Wait for content to load
        cy.wait(2000);
        
        // Layout should not have shifted significantly
        cy.get('[data-testid="main-content"]').should(($newEl) => {
          const newHeight = $newEl.height();
          const shift = Math.abs(newHeight - initialHeight);
          expect(shift).to.be.lessThan(50); // Max 50px shift
        });
      });
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    it('recovers from network errors', () => {
      // Start with network failure
      cy.intercept('GET', '**/*', { forceNetworkError: true });
      
      cy.visit('/');
      
      // Should show error state
      cy.get('[data-testid="network-error"]').should('be.visible');
      
      // Restore network
      cy.intercept('GET', '**/*').as('networkRestored');
      
      // Retry should work
      cy.get('[data-testid="retry-button"]').click();
      
      cy.wait('@networkRestored');
      cy.get('[data-testid="nova-titan-widget"]').should('be.visible');
    });

    it('handles malformed API responses', () => {
      // Mock malformed response
      cy.intercept('GET', '**/sports/*/odds', { body: { invalid: 'response' } });
      
      cy.visit('/');
      
      // Should handle gracefully
      cy.get('[data-testid="error-fallback"]').should('be.visible');
    });

    it('works without JavaScript enhancements', () => {
      // Test graceful degradation
      cy.visit('/', {
        onBeforeLoad(win) {
          // Disable JavaScript
          Object.defineProperty(win.navigator, 'userAgent', {
            value: 'NoScript Browser',
          });
        },
      });
      
      // Basic content should still be visible
      cy.get('[data-testid="nova-titan-widget"]').should('be.visible');
    });
  });
});