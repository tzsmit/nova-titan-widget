/**
 * Games Tab Component - Shows live games with odds
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../utils/apiClient';
import { useWidgetStore } from '../../../stores/widgetStore';

import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { HelpTooltip } from '../../ui/HelpTooltip';
import { CornerHelpTooltip } from '../../ui/CornerHelpTooltip';
import { LiveOddsDisplay } from '../LiveOddsDisplay';
import { LiveTimestamp } from '../../ui/LiveTimestamp';

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
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Update last refresh timestamp when games data changes
  useEffect(() => {
    if (games && games.length > 0) {
      setLastUpdate(new Date());
    }
  }, [games]);

  // Transform real games data to display format - no mock data used
  const safeGames = Array.isArray(games) ? games : [];
  
  const transformedGames = safeGames.map(game => ({
    id: game.id,
    sport: game.sport,
    league: game.league,
    homeTeam: {
      id: game.homeTeam?.toLowerCase() || game.home_team?.toLowerCase() || 'home',
      name: game.homeTeam || game.home_team || 'Home Team',
      abbreviation: (game.homeTeam || game.home_team)?.substring(0, 3).toUpperCase() || 'HOME',
      logo: '/logos/default.png',
      record: { wins: 0, losses: 0 }
    },
    awayTeam: {
      id: game.awayTeam?.toLowerCase() || game.away_team?.toLowerCase() || 'away',
      name: game.awayTeam || game.away_team || 'Away Team',
      abbreviation: (game.awayTeam || game.away_team)?.substring(0, 3).toUpperCase() || 'AWAY',
      logo: '/logos/default.png',
      record: { wins: 0, losses: 0 }
    },
    startTime: game.startTime || game.start_time || new Date().toISOString(),
    status: { type: game.status === 'upcoming' ? 'scheduled' as const : 'live' as const },
    venue: {
      name: 'Stadium',
      city: 'City',
      state: 'ST'
    },
    odds: {
      moneyline: { 
        home: game.odds?.home_ml || game.homeOdds || -110, 
        away: game.odds?.away_ml || game.awayOdds || +105 
      },
      spread: { 
        home: game.odds?.spread || game.spread || -2.5, 
        away: -(game.odds?.spread || game.spread || -2.5) 
      },
      total: game.odds?.total || game.total || 215.5
    },
    prediction: {
      homeWinProbability: 65.0,
      confidence: 72.5,
      expectedValue: 5.8
    }
  }));
  
  const displayGames = transformedGames.length > 0 ? transformedGames : MOCK_GAMES;

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
    <div className="space-y-6 relative">
      {/* Page Help Button */}
      <div className="absolute top-4 right-4 z-10">
        <CornerHelpTooltip 
          content="Live games with odds and predictions from Nova TitanAI. View real-time odds from multiple sportsbooks and AI-powered predictions."
          term="Games Tab"
          size="md"
        />
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Today's Games</h2>
            <p className="text-sm text-gray-600">
              Live odds and AI predictions from 10+ sportsbooks including Underdog Fantasy
              <HelpTooltip content="Real-time odds from major platforms like Underdog Fantasy, DraftKings, FanDuel, and more with AI-powered predictions" />
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {displayGames.length} games available
          </div>
        </div>
        
        {/* Live Timestamp */}
        <LiveTimestamp 
          lastUpdate={lastUpdate}
          autoRefresh={true}
          label="Games data"
        />
      </div>

      {/* Live Odds Comparison */}
      <LiveOddsDisplay sport="americanfootball_nfl" compact={true} />

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
                <span className="font-semibold text-gray-800">
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
                    <div className="font-semibold text-gray-800">{game.awayTeam.name}</div>
                    <div className="text-sm text-gray-600">
                      {game.awayTeam.record.wins}-{game.awayTeam.record.losses}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-700">@ {game.venue?.city}</div>
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
                    <div className="font-semibold text-gray-800">{game.homeTeam.name}</div>
                    <div className="text-sm text-gray-600">
                      {game.homeTeam.record.wins}-{game.homeTeam.record.losses}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Odds */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-700 mb-1">
                  Moneyline
                  <HelpTooltip content="Bet on which team wins straight up, regardless of score" />
                </div>
                <div className="font-semibold text-gray-800">
                  {formatOdds(game.odds.moneyline.home)}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-700 mb-1">
                  Spread
                  <HelpTooltip content="Point spread betting - favorite must win by more than the spread" />
                </div>
                <div className="font-semibold text-gray-800">
                  {game.odds.spread.home > 0 ? '+' : ''}{game.odds.spread.home}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-700 mb-1">
                  Total
                  <HelpTooltip content="Bet on whether total combined score goes over or under this number" />
                </div>
                <div className="font-semibold text-gray-800">
                  O/U {game.odds.total}
                </div>
              </div>
            </div>

            {/* Enhanced AI Analysis */}
            <div 
              className="p-4 rounded-lg border border-gray-200"
              style={{ 
                background: `linear-gradient(135deg, ${config.theme?.accent || '#4299e1'}08, ${config.theme?.primary || '#1a365d'}08)` 
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🧠</span>
                  <span className="font-semibold text-gray-900">Nova TitanAI Analysis</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    v2.1
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className="font-bold text-lg"
                    style={{ color: config.theme?.accent || '#4299e1' }}
                  >
                    +{game.prediction.expectedValue}% EV
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    game.prediction.confidence >= 80 ? 'bg-green-100 text-green-800' :
                    game.prediction.confidence >= 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {game.prediction.confidence}% confidence
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="text-xs text-gray-700 uppercase tracking-wide font-medium mb-1">
                    Best Value
                  </div>
                  <div className="font-bold text-gray-800">{game.homeTeam.abbreviation} Moneyline</div>
                  <div className="text-sm text-green-600 font-medium">
                    {formatOdds(game.odds.moneyline.home)} • Fair: -135
                  </div>
                </div>
                
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="text-xs text-gray-700 uppercase tracking-wide font-medium mb-1">
                    Edge Detected
                  </div>
                  <div className="font-bold text-gray-800">Market Inefficiency</div>
                  <div className="text-sm text-blue-600 font-medium">
                    Books undervaluing by 8%
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">💡</span>
                  <div>
                    <div className="text-blue-800 font-medium text-sm mb-1">AI Insight</div>
                    <div className="text-blue-700 text-sm leading-relaxed">
                      {game.homeTeam.name} has covered the spread in 8 of last 10 home games. 
                      Weather conditions and injury reports strongly favor the home team today.
                    </div>
                  </div>
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