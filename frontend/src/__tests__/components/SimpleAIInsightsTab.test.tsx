/**
 * Tests for SimpleAIInsightsTab Component
 * Ensures proper rendering and deterministic data display
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SimpleAIInsightsTab } from '../../components/widget/tabs/SimpleAIInsightsTab';

// Mock the AI Network Service
jest.mock('../../services/aiNetworkService', () => ({
  aiNetworkService: {
    getAIPredictions: jest.fn().mockResolvedValue([
      {
        id: 'test-prediction-1',
        homeTeam: 'Lakers',
        awayTeam: 'Warriors',
        predictions: {
          moneyline: {
            prediction: 'Lakers',
            confidence: 75.5,
            reasoning: 'Strong home court advantage'
          }
        },
        gameTime: '2024-01-15T20:00:00Z',
        sport: 'basketball_nba'
      }
    ])
  }
}));

// Mock the Market Intelligence Service
jest.mock('../../services/marketIntelligenceService', () => ({
  MarketIntelligenceService: jest.fn().mockImplementation(() => ({
    getMarketIntelligence: jest.fn().mockResolvedValue({
      publicBettingPercentage: 65.2,
      sharpMoneyPercentage: 72.8,
      lineMovement: 'Lakers -7.5 → -8.0',
      bettingVolume: 'High (2.3M)',
      marketSentiment: 'Bullish on Lakers',
      keyInsights: [
        'Sharp money heavily on Lakers',
        'Line moved in favor of Lakers',
        'High betting volume indicates strong interest'
      ],
      timestamp: '2024-01-15T12:00:00Z'
    })
  }))
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('SimpleAIInsightsTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(
      <TestWrapper>
        <SimpleAIInsightsTab />
      </TestWrapper>
    );

    expect(screen.getByText(/AI Insights/i)).toBeInTheDocument();
  });

  it('should display Market Intelligence section', async () => {
    render(
      <TestWrapper>
        <SimpleAIInsightsTab />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Market Intelligence/i)).toBeInTheDocument();
    });
  });

  it('should display AI Predictions section', async () => {
    render(
      <TestWrapper>
        <SimpleAIInsightsTab />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/AI Predictions/i)).toBeInTheDocument();
    });
  });

  it('should format confidence percentages correctly', async () => {
    render(
      <TestWrapper>
        <SimpleAIInsightsTab />
      </TestWrapper>
    );

    await waitFor(() => {
      // Should display formatted confidence (75.5% from mock data)
      expect(screen.getByText(/75\.5%/)).toBeInTheDocument();
    });
  });

  it('should display market intelligence data', async () => {
    render(
      <TestWrapper>
        <SimpleAIInsightsTab />
      </TestWrapper>
    );

    await waitFor(() => {
      // Should display formatted percentages from mock data
      expect(screen.getByText(/65\.2%/)).toBeInTheDocument();
      expect(screen.getByText(/72\.8%/)).toBeInTheDocument();
    });
  });

  it('should show key insights', async () => {
    render(
      <TestWrapper>
        <SimpleAIInsightsTab />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sharp money heavily on Lakers/)).toBeInTheDocument();
      expect(screen.getByText(/Line moved in favor of Lakers/)).toBeInTheDocument();
    });
  });

  it('should handle loading state', () => {
    render(
      <TestWrapper>
        <SimpleAIInsightsTab />
      </TestWrapper>
    );

    // Should show loading indicators initially
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('should use deterministic data display', async () => {
    // Render component multiple times to ensure consistent display
    const { unmount } = render(
      <TestWrapper>
        <SimpleAIInsightsTab />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/75\.5%/)).toBeInTheDocument();
    });

    unmount();

    // Render again
    render(
      <TestWrapper>
        <SimpleAIInsightsTab />
      </TestWrapper>
    );

    await waitFor(() => {
      // Should display the same data consistently
      expect(screen.getByText(/75\.5%/)).toBeInTheDocument();
    });
  });

  it('should handle team name display', async () => {
    render(
      <TestWrapper>
        <SimpleAIInsightsTab />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Lakers/)).toBeInTheDocument();
      expect(screen.getByText(/Warriors/)).toBeInTheDocument();
    });
  });

  it('should display game time information', async () => {
    render(
      <TestWrapper>
        <SimpleAIInsightsTab />
      </TestWrapper>
    );

    await waitFor(() => {
      // Should display some form of time information
      const timeElements = screen.getAllByText(/2024/);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      render(
        <TestWrapper>
          <SimpleAIInsightsTab />
        </TestWrapper>
      );

      await waitFor(() => {
        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(0);
      });
    });

    it('should have accessible button elements', async () => {
      render(
        <TestWrapper>
          <SimpleAIInsightsTab />
        </TestWrapper>
      );

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          // Each button should have accessible text content or aria-label
          expect(
            button.textContent || 
            button.getAttribute('aria-label') ||
            button.getAttribute('title')
          ).toBeTruthy();
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      // Mock service to throw error
      const aiNetworkService = require('../../services/aiNetworkService').aiNetworkService;
      aiNetworkService.getAIPredictions.mockRejectedValueOnce(new Error('Service error'));

      render(
        <TestWrapper>
          <SimpleAIInsightsTab />
        </TestWrapper>
      );

      // Component should still render even with service errors
      expect(screen.getByText(/AI Insights/i)).toBeInTheDocument();
    });
  });
});