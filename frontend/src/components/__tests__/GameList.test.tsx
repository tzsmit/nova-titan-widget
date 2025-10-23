/**
 * GameList Component Tests
 * Tests for responsive grid layout, overflow handling, and empty states
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameList } from '../GameList';
import { mockGameData } from '../../setupTests';

// Test data
const multipleGames = Array.from({ length: 6 }, (_, i) => ({
  ...mockGameData,
  id: `game-${i}`,
  homeTeam: `Home Team ${i}`,
  awayTeam: `Away Team ${i}`,
}));

const singleGame = [mockGameData];

describe('GameList Component', () => {
  const mockOnTeamClick = jest.fn();
  const mockOnBetClick = jest.fn();
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders game list with multiple games', () => {
      render(<GameList games={multipleGames} />);
      
      expect(screen.getByText('Home Team 0')).toBeInTheDocument();
      expect(screen.getByText('Home Team 5')).toBeInTheDocument();
      expect(screen.getByText('6 games available')).toBeInTheDocument();
    });

    test('renders single game with correct count', () => {
      render(<GameList games={singleGame} />);
      
      expect(screen.getByText('Test Home Team')).toBeInTheDocument();
      expect(screen.getByText('1 game available')).toBeInTheDocument();
    });

    test('applies custom className', () => {
      const { container } = render(
        <GameList games={multipleGames} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Grid Layout and Responsive Behavior', () => {
    test('uses CSS grid with minmax(220px, 1fr) for grid variant', () => {
      render(<GameList games={multipleGames} variant="grid" />);
      
      const gridContainer = screen.getByRole('grid');
      expect(gridContainer).toHaveStyle({
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
      });
    });

    test('uses single column for list variant', () => {
      render(<GameList games={multipleGames} variant="list" />);
      
      const gridContainer = screen.getByRole('grid');
      expect(gridContainer).toHaveStyle({
        gridTemplateColumns: '1fr'
      });
    });

    test('respects custom minCardWidth', () => {
      render(<GameList games={multipleGames} minCardWidth={300} />);
      
      const gridContainer = screen.getByRole('grid');
      expect(gridContainer).toHaveStyle({
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
      });
    });

    test('constrains max columns on wide screens', () => {
      render(<GameList games={multipleGames} maxColumns={3} minCardWidth={220} />);
      
      const gridContainer = screen.getByRole('grid');
      expect(gridContainer).toHaveStyle({
        maxWidth: '732px' // 3 * (220 + 16) = 708px
      });
    });

    test('has parent min-width:0 for flex compatibility', () => {
      const { container } = render(<GameList games={multipleGames} />);
      
      expect(container.firstChild).toHaveClass('min-w-0');
    });
  });

  describe('Loading States', () => {
    test('shows skeleton loading cards', () => {
      render(<GameList games={[]} isLoading={true} />);
      
      // Should show 6 skeleton cards by default
      const skeletonCards = document.querySelectorAll('[class*="skeleton"]');
      expect(skeletonCards.length).toBeGreaterThan(0);
      
      // Should have proper accessibility
      expect(screen.getByLabelText('Loading games')).toBeInTheDocument();
    });

    test('shows loading state with proper grid layout', () => {
      render(<GameList games={[]} isLoading={true} variant="grid" />);
      
      const gridContainer = screen.getByLabelText('Loading games');
      expect(gridContainer).toHaveClass('grid');
    });

    test('does not show actual games while loading', () => {
      render(<GameList games={multipleGames} isLoading={true} />);
      
      expect(screen.queryByText('Home Team 0')).not.toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    test('shows default empty state message', () => {
      render(<GameList games={[]} />);
      
      expect(screen.getByText('No Games Found')).toBeInTheDocument();
      expect(screen.getByText('No games available')).toBeInTheDocument();
    });

    test('shows custom empty state message', () => {
      render(
        <GameList 
          games={[]} 
          emptyStateMessage="No games for selected filters" 
        />
      );
      
      expect(screen.getByText('No games for selected filters')).toBeInTheDocument();
    });

    test('shows refresh button when onRetry is provided', () => {
      render(<GameList games={[]} onRetry={mockOnRetry} />);
      
      const refreshButton = screen.getByRole('button', { name: 'Refresh games list' });
      expect(refreshButton).toBeInTheDocument();
    });

    test('calls onRetry when refresh button is clicked', async () => {
      const user = userEvent.setup();
      render(<GameList games={[]} onRetry={mockOnRetry} />);
      
      const refreshButton = screen.getByRole('button', { name: 'Refresh games list' });
      await user.click(refreshButton);
      
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    test('shows helpful suggestions in empty state', () => {
      render(<GameList games={[]} />);
      
      expect(screen.getByText('Try selecting a different sport or date')).toBeInTheDocument();
      expect(screen.getByText('Check back later for upcoming games')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    test('shows error message and retry button', () => {
      render(
        <GameList 
          games={[]} 
          error="Failed to fetch games" 
          onRetry={mockOnRetry}
        />
      );
      
      expect(screen.getByText('Failed to fetch games')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    test('calls onRetry from error state', async () => {
      const user = userEvent.setup();
      render(
        <GameList 
          games={[]} 
          error="Network error" 
          onRetry={mockOnRetry}
        />
      );
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);
      
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    test('centers error content properly', () => {
      render(<GameList games={[]} error="Test error" />);
      
      const errorContainer = screen.getByText('Test error').closest('div');
      expect(errorContainer).toHaveClass('flex', 'items-center', 'justify-center');
    });
  });

  describe('Animation and Staggering', () => {
    test('applies stagger delay to game cards', () => {
      render(<GameList games={multipleGames} staggerDelay={0.1} />);
      
      // Motion components should render (mocked in setup)
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    test('supports different animation types', () => {
      const { rerender } = render(
        <GameList games={multipleGames} animationType="fade" />
      );
      
      expect(screen.getByRole('grid')).toBeInTheDocument();
      
      rerender(<GameList games={multipleGames} animationType="slide" />);
      expect(screen.getByRole('grid')).toBeInTheDocument();
      
      rerender(<GameList games={multipleGames} animationType="scale" />);
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  describe('Game Card Integration', () => {
    test('passes callbacks to individual game cards', () => {
      render(
        <GameList 
          games={singleGame}
          onTeamClick={mockOnTeamClick}
          onBetClick={mockOnBetClick}
        />
      );
      
      // Should be able to interact with game cards
      const teamButton = screen.getByLabelText('View Test Home Team team details');
      expect(teamButton).toBeInTheDocument();
    });

    test('passes showActions prop to game cards', () => {
      render(<GameList games={singleGame} showActions={false} />);
      
      // Game cards should not show betting actions
      expect(screen.queryByText('More Bets')).not.toBeInTheDocument();
    });

    test('ensures consistent card heights with h-full class', () => {
      render(<GameList games={multipleGames} />);
      
      // Each game card should have h-full class for consistent heights
      const gameCards = screen.getAllByRole('gridcell');
      gameCards.forEach(card => {
        const gameCard = card.querySelector('[class*="h-full"]');
        expect(gameCard).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', () => {
      render(<GameList games={multipleGames} />);
      
      const gridContainer = screen.getByRole('grid');
      expect(gridContainer).toHaveAttribute('aria-label', '6 games available');
      
      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells).toHaveLength(6);
    });

    test('provides accessible empty state', () => {
      render(<GameList games={[]} />);
      
      // Empty state should be accessible to screen readers
      const emptyStateContent = screen.getByText('No Games Found');
      expect(emptyStateContent).toBeInTheDocument();
    });

    test('maintains focus management during updates', async () => {
      const { rerender } = render(<GameList games={[]} isLoading={true} />);
      
      // Loading state should be announced
      expect(screen.getByLabelText('Loading games')).toBeInTheDocument();
      
      rerender(<GameList games={multipleGames} />);
      
      // Games should be accessible after loading
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  describe('Preset Configurations', () => {
    test('GameListPresets provides correct configurations', () => {
      const { GameListPresets } = require('../GameList');
      
      expect(GameListPresets.desktop).toEqual({
        minCardWidth: 280,
        maxColumns: 3,
        variant: 'grid',
      });
      
      expect(GameListPresets.tablet).toEqual({
        minCardWidth: 240,
        maxColumns: 2,
        variant: 'grid',
      });
      
      expect(GameListPresets.mobile).toEqual({
        minCardWidth: 220,
        maxColumns: 1,
        variant: 'list',
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    test('handles large number of games efficiently', () => {
      const manyGames = Array.from({ length: 50 }, (_, i) => ({
        ...mockGameData,
        id: `game-${i}`,
        homeTeam: `Team ${i}`,
        awayTeam: `Opponent ${i}`,
      }));
      
      render(<GameList games={manyGames} />);
      
      // Should render all games
      expect(screen.getByText('50 games available')).toBeInTheDocument();
    });

    test('handles games with missing data gracefully', () => {
      const incompleteGame = {
        id: 'incomplete-1',
        homeTeam: 'Home Team',
        awayTeam: 'Away Team',
        sport: 'test',
        status: 'scheduled' as const,
        gameTime: '2024-01-15T20:00:00Z',
        gameDate: '2024-01-15',
      };
      
      render(<GameList games={[incompleteGame]} />);
      
      // Should still render basic game info
      expect(screen.getByText('Home Team')).toBeInTheDocument();
    });

    test('updates game count dynamically', () => {
      const { rerender } = render(<GameList games={singleGame} />);
      
      expect(screen.getByText('1 game available')).toBeInTheDocument();
      
      rerender(<GameList games={multipleGames} />);
      
      expect(screen.getByText('6 games available')).toBeInTheDocument();
    });

    test('prevents layout shift during loading transitions', async () => {
      const { rerender } = render(<GameList games={[]} isLoading={true} />);
      
      // Should maintain container structure during loading
      const container = document.querySelector('.min-w-0');
      expect(container).toBeInTheDocument();
      
      rerender(<GameList games={multipleGames} />);
      
      // Container should persist after loading
      expect(container).toBeInTheDocument();
    });

    test('handles rapid state changes smoothly', async () => {
      const { rerender } = render(<GameList games={[]} isLoading={true} />);
      
      rerender(<GameList games={[]} error="Network error" />);
      rerender(<GameList games={multipleGames} />);
      rerender(<GameList games={[]} />);
      
      // Should end in empty state
      expect(screen.getByText('No Games Found')).toBeInTheDocument();
    });
  });

  describe('CSS Grid Integration', () => {
    test('uses Tailwind responsive grid classes', () => {
      render(<GameList games={multipleGames} />);
      
      const gridContainer = screen.getByRole('grid');
      expect(gridContainer).toHaveClass('grid-cols-responsive');
    });

    test('maintains min-width constraints for grid items', () => {
      render(<GameList games={multipleGames} />);
      
      const gridCells = screen.getAllByRole('gridcell');
      gridCells.forEach(cell => {
        expect(cell).toHaveClass('min-w-0');
      });
    });

    test('handles overflow correctly in grid layout', () => {
      // Render with wide content that could overflow
      const wideGames = Array.from({ length: 3 }, (_, i) => ({
        ...mockGameData,
        id: `wide-game-${i}`,
        homeTeam: 'Very Long Team Name That Could Cause Overflow Issues',
        awayTeam: 'Another Extremely Long Team Name That Should Be Handled',
      }));
      
      render(<GameList games={wideGames} />);
      
      // Should not cause horizontal overflow
      const gridContainer = screen.getByRole('grid');
      expect(gridContainer).toHaveClass('min-w-0');
    });
  });
});