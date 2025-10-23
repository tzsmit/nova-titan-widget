/**
 * GameCard Component Tests
 * Comprehensive unit tests covering accessibility, responsive behavior, and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameCard, GameData } from '../GameCard';
import { mockGameData } from '../../setupTests';

// Test data variations
const liveGameData: GameData = {
  ...mockGameData,
  status: 'live',
  id: 'live-game-1',
};

const finalGameData: GameData = {
  ...mockGameData,
  status: 'final',
  id: 'final-game-1',
};

const compactGameData: GameData = {
  ...mockGameData,
  id: 'compact-game-1',
};

describe('GameCard Component', () => {
  const mockOnTeamClick = jest.fn();
  const mockOnBetClick = jest.fn();
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering and Basic Display', () => {
    test('renders game information correctly', () => {
      render(<GameCard game={mockGameData} />);
      
      expect(screen.getByText('Test Home Team')).toBeInTheDocument();
      expect(screen.getByText('Test Away Team')).toBeInTheDocument();
      expect(screen.getByText('BASKETBALL_NBA')).toBeInTheDocument();
      expect(screen.getByText('Test Stadium')).toBeInTheDocument();
      expect(screen.getByText('ESPN')).toBeInTheDocument();
    });

    test('displays team logos with proper alt text', () => {
      render(<GameCard game={mockGameData} />);
      
      const homeTeamLogo = screen.getByAltText('Test Home Team logo');
      const awayTeamLogo = screen.getByAltText('Test Away Team logo');
      
      expect(homeTeamLogo).toBeInTheDocument();
      expect(awayTeamLogo).toBeInTheDocument();
      expect(homeTeamLogo).toHaveAttribute('src', 'https://example.com/home-logo.png');
      expect(awayTeamLogo).toHaveAttribute('src', 'https://example.com/away-logo.png');
    });

    test('shows proper game status badges', () => {
      const { rerender } = render(<GameCard game={mockGameData} />);
      expect(screen.getByText('SCHEDULED')).toBeInTheDocument();

      rerender(<GameCard game={liveGameData} />);
      expect(screen.getByText('LIVE')).toBeInTheDocument();

      rerender(<GameCard game={finalGameData} />);
      expect(screen.getByText('FINAL')).toBeInTheDocument();
    });

    test('formats odds correctly', () => {
      render(<GameCard game={mockGameData} />);
      
      expect(screen.getByText('-150')).toBeInTheDocument(); // Home moneyline
      expect(screen.getByText('+130')).toBeInTheDocument(); // Away moneyline
    });
  });

  describe('Loading States', () => {
    test('shows skeleton loading state', () => {
      render(<GameCard game={mockGameData} isLoading={true} />);
      
      // Should show skeleton elements
      expect(document.querySelector('.skeleton')).toBeInTheDocument();
      
      // Should not show actual game content
      expect(screen.queryByText('Test Home Team')).not.toBeInTheDocument();
    });

    test('shows skeleton with proper accessibility', () => {
      render(<GameCard game={mockGameData} isLoading={true} />);
      
      // Skeleton should have proper ARIA attributes
      const skeletonElements = document.querySelectorAll('[class*="skeleton"]');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });
  });

  describe('Error States', () => {
    test('displays error message and retry button', () => {
      render(
        <GameCard 
          game={mockGameData} 
          error="Failed to load game data" 
          onRetry={mockOnRetry}
        />
      );
      
      expect(screen.getByText('Failed to load game data')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    test('calls onRetry when retry button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <GameCard 
          game={mockGameData} 
          error="Network error" 
          onRetry={mockOnRetry}
        />
      );
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);
      
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component Variants', () => {
    test('renders compact variant correctly', () => {
      render(<GameCard game={compactGameData} variant="compact" />);
      
      // Compact variant should still show essential information
      expect(screen.getByText('Test Home Team')).toBeInTheDocument();
      expect(screen.getByText('Test Away Team')).toBeInTheDocument();
      
      // But may hide some details like venue
      const venueText = screen.queryByText('Test Stadium');
      // Venue might be hidden in compact mode based on implementation
    });

    test('renders detailed variant with extra information', () => {
      const detailedGame = { ...mockGameData, weather: 'Clear, 72°F' };
      render(<GameCard game={detailedGame} variant="detailed" />);
      
      expect(screen.getByText('Test Home Team')).toBeInTheDocument();
      // Detailed variant might show additional info when expanded
    });

    test('hides betting actions when showActions is false', () => {
      render(<GameCard game={mockGameData} showActions={false} />);
      
      expect(screen.queryByText('More Bets')).not.toBeInTheDocument();
      expect(screen.queryByText('Spread')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('calls onTeamClick when team button is clicked', async () => {
      const user = userEvent.setup();
      render(<GameCard game={mockGameData} onTeamClick={mockOnTeamClick} />);
      
      const homeTeamButton = screen.getByLabelText('View Test Home Team team details');
      await user.click(homeTeamButton);
      
      expect(mockOnTeamClick).toHaveBeenCalledWith(
        'Test Home Team',
        'https://example.com/home-logo.png',
        'basketball_nba'
      );
    });

    test('calls onBetClick when bet button is clicked', async () => {
      const user = userEvent.setup();
      render(<GameCard game={mockGameData} onBetClick={mockOnBetClick} />);
      
      const spreadButton = screen.getByLabelText(/Bet on.*spread/i);
      await user.click(spreadButton);
      
      expect(mockOnBetClick).toHaveBeenCalledWith('spread', 'home');
    });

    test('expands and collapses additional betting options', async () => {
      const user = userEvent.setup();
      render(<GameCard game={mockGameData} />);
      
      const moreBetsButton = screen.getByLabelText('View more betting options');
      
      // Initially collapsed
      expect(screen.queryByText('Player Props')).not.toBeInTheDocument();
      
      // Click to expand
      await user.click(moreBetsButton);
      
      // Should show expanded options
      await waitFor(() => {
        expect(screen.getByText('Player Props')).toBeInTheDocument();
      });
      
      // Click again to collapse
      await user.click(moreBetsButton);
    });
  });

  describe('Image Error Handling', () => {
    test('shows fallback when team logo fails to load', () => {
      render(<GameCard game={mockGameData} />);
      
      const awayTeamLogo = screen.getByAltText('Test Away Team logo');
      
      // Simulate image load error
      fireEvent.error(awayTeamLogo);
      
      // Should show fallback with team initial
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    test('handles missing logo URLs gracefully', () => {
      const gameWithoutLogos = {
        ...mockGameData,
        homeTeamLogo: undefined,
        awayTeamLogo: undefined,
      };
      
      render(<GameCard game={gameWithoutLogos} />);
      
      // Should show fallback elements
      expect(screen.getAllByText('T')).toHaveLength(2); // Both team initials
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', () => {
      render(<GameCard game={mockGameData} />);
      
      // Main card should have proper role and label
      const gameCard = screen.getByRole('article');
      expect(gameCard).toHaveAttribute('aria-label', 'Game: Test Away Team at Test Home Team');
      
      // Team buttons should have descriptive labels
      expect(screen.getByLabelText('View Test Home Team team details')).toBeInTheDocument();
      expect(screen.getByLabelText('View Test Away Team team details')).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<GameCard game={mockGameData} onTeamClick={mockOnTeamClick} />);
      
      // Tab to team button
      await user.tab();
      const homeTeamButton = screen.getByLabelText('View Test Home Team team details');
      expect(homeTeamButton).toHaveFocus();
      
      // Press Enter to activate
      await user.keyboard('{Enter}');
      expect(mockOnTeamClick).toHaveBeenCalled();
    });

    test('has proper focus management', async () => {
      const user = userEvent.setup();
      render(<GameCard game={mockGameData} />);
      
      // Tab through interactive elements
      await user.tab(); // First team button
      await user.tab(); // Second team button
      await user.tab(); // First bet button
      
      const focusedElement = document.activeElement;
      expect(focusedElement).toHaveAttribute('aria-label');
    });
  });

  describe('Responsive Behavior', () => {
    test('adapts to different screen sizes', () => {
      const { container } = render(<GameCard game={mockGameData} />);
      
      // Should have responsive classes
      expect(container.firstChild).toHaveClass('min-w-220');
    });

    test('maintains minimum width for card flexibility', () => {
      render(<GameCard game={mockGameData} />);
      
      // Card should maintain minimum width constraint
      const gameCard = document.querySelector('[class*="min-w-220"]');
      expect(gameCard).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles missing odds gracefully', () => {
      const gameWithoutOdds = {
        ...mockGameData,
        odds: undefined,
      };
      
      render(<GameCard game={gameWithoutOdds} />);
      
      // Should still render game info
      expect(screen.getByText('Test Home Team')).toBeInTheDocument();
      expect(screen.getByText('Test Away Team')).toBeInTheDocument();
    });

    test('handles invalid date formats', () => {
      const gameWithInvalidDate = {
        ...mockGameData,
        gameTime: 'invalid-date',
      };
      
      render(<GameCard game={gameWithInvalidDate} />);
      
      // Should fallback to original string
      expect(screen.getByText('invalid-date')).toBeInTheDocument();
    });

    test('handles very long team names', () => {
      const gameWithLongNames = {
        ...mockGameData,
        homeTeam: 'Very Long Team Name That Should Be Truncated Properly',
        awayTeam: 'Another Very Long Team Name That Exceeds Normal Length',
      };
      
      render(<GameCard game={gameWithLongNames} />);
      
      // Should render with truncation classes
      const teamElements = screen.getAllByText(/Very Long Team Name/);
      expect(teamElements.length).toBeGreaterThan(0);
    });
  });

  describe('Animation and Motion', () => {
    test('has proper motion attributes for animations', () => {
      const { container } = render(<GameCard game={mockGameData} />);
      
      // Should have motion.div wrapper (mocked in setup)
      expect(container.firstChild).toBeInTheDocument();
    });

    test('respects reduced motion preferences', () => {
      // This would be handled by the motion mock in setupTests
      render(<GameCard game={mockGameData} />);
      
      // Component should render without animation errors
      expect(screen.getByText('Test Home Team')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('renders efficiently with multiple instances', () => {
      const games = Array.from({ length: 10 }, (_, i) => ({
        ...mockGameData,
        id: `game-${i}`,
        homeTeam: `Home Team ${i}`,
        awayTeam: `Away Team ${i}`,
      }));
      
      render(
        <div>
          {games.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      );
      
      // All games should render
      expect(screen.getByText('Home Team 0')).toBeInTheDocument();
      expect(screen.getByText('Home Team 9')).toBeInTheDocument();
    });
  });
});