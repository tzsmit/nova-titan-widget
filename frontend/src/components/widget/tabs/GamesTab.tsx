/**
 * Games Tab Component - Shows live games with odds
 */

import React from 'react';
import { motion } from 'framer-motion';

import { useWidgetStore } from '../../../stores/widgetStore';

import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { HelpTooltip } from '../../ui/HelpTooltip';

// Mock game data for demo
const MOCK_GAMES = [
  {
    id: 'game_1',
    sport: 'basketball',
    league: 'NBA',
    homeTeam: {
      id: 'bos',
      name: 'Boston Celtics',
      abbreviation: 'BOS',
      logo: '/logos/bos.png',
      record: { wins: 45, losses: 20 }
    },
    awayTeam: {
      id: 'lal',
      name: 'Los Angeles Lakers', 
      abbreviation: 'LAL',
      logo: '/logos/lal.png',
      record: { wins: 38, losses: 27 }
    },
    startTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
    status: { type: 'scheduled' as const },
    venue: {
      name: 'TD Garden',
      city: 'Boston',
      state: 'MA'
    },
    odds: {
      moneyline: { home: -150, away: +130 },
      spread: { home: -3.5, away: +3.5 },
      total: 218.5
    },
    prediction: {
      homeWinProbability: 67.5,
      confidence: 78.2,
      expectedValue: 8.3
    }
  },
  {
    id: 'game_2',
    sport: 'basketball',
    league: 'NBA', 
    homeTeam: {
      id: 'gsw',
      name: 'Golden State Warriors',
      abbreviation: 'GSW',
      logo: '/logos/gsw.png',
      record: { wins: 42, losses: 23 }
    },
    awayTeam: {
      id: 'phx',
      name: 'Phoenix Suns',
      abbreviation: 'PHX', 
      logo: '/logos/phx.png',
      record: { wins: 40, losses: 25 }
    },
    startTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    status: { type: 'scheduled' as const },
    venue: {
      name: 'Chase Center',
      city: 'San Francisco',
      state: 'CA'
    },
    odds: {
      moneyline: { home: +125, away: -145 },
      spread: { home: +2.5, away: -2.5 },
      total: 225.0
    },
    prediction: {
      homeWinProbability: 45.2,
      confidence: 72.1,
      expectedValue: 3.7
    }
  }
];

export const GamesTab: React.FC = () => {
  const { config, games, isLoadingGames } = useWidgetStore();

  // Use mock data for demo - ensure games is an array
  const safeGames = Array.isArray(games) ? games : [];
  const displayGames = safeGames.length > 0 ? safeGames : MOCK_GAMES;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  if (isLoadingGames) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading games...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Today's Games</h2>
          <p className="text-sm text-gray-600">
            Live odds and AI predictions
            <HelpTooltip content="Real-time odds from multiple sportsbooks with AI-powered win probability predictions" />
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {displayGames.length} games available
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid gap-4">
        {displayGames.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200"
          >
            {/* Game Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: config.theme?.accent || '#4299e1' }}
                ></div>
                <span className="font-semibold text-gray-900">
                  {game.league} • {formatTime(game.startTime)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  LIVE ODDS
                </span>
              </div>
            </div>

            {/* Teams */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: config.theme?.primary || '#1a365d' }}
                  >
                    {game.awayTeam.abbreviation}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{game.awayTeam.name}</div>
                    <div className="text-sm text-gray-500">
                      {game.awayTeam.record.wins}-{game.awayTeam.record.losses}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">@ {game.venue?.city}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: config.theme?.secondary || '#2d5a87' }}
                  >
                    {game.homeTeam.abbreviation}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{game.homeTeam.name}</div>
                    <div className="text-sm text-gray-500">
                      {game.homeTeam.record.wins}-{game.homeTeam.record.losses}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Odds */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">
                  Moneyline
                  <HelpTooltip content="Bet on which team wins straight up, regardless of score" />
                </div>
                <div className="font-semibold text-gray-900">
                  {formatOdds(game.odds.moneyline.home)}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">
                  Spread
                  <HelpTooltip content="Point spread betting - favorite must win by more than the spread" />
                </div>
                <div className="font-semibold text-gray-900">
                  {game.odds.spread.home > 0 ? '+' : ''}{game.odds.spread.home}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">
                  Total
                  <HelpTooltip content="Bet on whether total combined score goes over or under this number" />
                </div>
                <div className="font-semibold text-gray-900">
                  O/U {game.odds.total}
                </div>
              </div>
            </div>

            {/* AI Prediction */}
            <div 
              className="p-4 rounded-lg"
              style={{ 
                background: `linear-gradient(90deg, ${config.theme?.accent || '#4299e1'}15, ${config.theme?.primary || '#1a365d'}15)` 
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🤖</span>
                    <span className="font-semibold text-gray-900">
                      AI Prediction: {game.homeTeam.abbreviation} Win
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {game.prediction.homeWinProbability}% probability • {game.prediction.confidence}% confidence
                  </div>
                </div>
                <div className="text-right">
                  <div 
                    className="font-bold text-lg"
                    style={{ color: config.theme?.accent || '#4299e1' }}
                  >
                    +{game.prediction.expectedValue}% EV
                  </div>
                  <div className="text-sm text-gray-600">Recommended</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Games Message */}
      {displayGames.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏈</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No games scheduled
          </h3>
          <p className="text-gray-600">
            Check back later for today's games and predictions.
          </p>
        </div>
      )}
    </div>
  );
};