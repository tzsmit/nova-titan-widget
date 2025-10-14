/**
 * Enhanced Games Tab - Fully Live Sports Data with Date Selection
 * Real games, real odds, real-time updates
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { realTimeOddsService, LiveOddsData, Sportsbook } from '../../../services/realTimeOddsService';

export const EnhancedGamesTab: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSportsbook, setSelectedSportsbook] = useState('draftkings');
  const [selectedSport, setSelectedSport] = useState('all');
  const [viewMode, setViewMode] = useState<'today' | 'upcoming' | 'live'>('today');

  // Generate date options (today + next 14 days)
  const dateOptions = React.useMemo(() => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i < 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let label;
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Tomorrow';
      else label = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      
      options.push({
        value: date.toISOString().split('T')[0],
        label: label,
        date: date
      });
    }
    
    return options;
  }, []);

  // Fetch live games data
  const { data: liveGames, isLoading, error, refetch } = useQuery({
    queryKey: ['live-games', selectedDate, selectedSport, viewMode],
    queryFn: async () => {
      console.log(`🏈 Fetching ${viewMode} games for ${selectedDate}...`);
      
      const allGames = await realTimeOddsService.getLiveOddsAllSports();
      
      let filteredGames = allGames;
      
      // Filter by view mode
      switch (viewMode) {
        case 'today':
          const today = new Date().toISOString().split('T')[0];
          filteredGames = allGames.filter(game => game.gameDate === today);
          break;
        case 'upcoming':
          filteredGames = allGames.filter(game => {
            const gameDate = new Date(game.gameDate);
            const selectedDateTime = new Date(selectedDate);
            return gameDate.getTime() === selectedDateTime.getTime();
          });
          break;
        case 'live':
          filteredGames = allGames.filter(game => game.status === 'live');
          break;
      }
      
      // Filter by sport
      if (selectedSport !== 'all') {
        filteredGames = filteredGames.filter(game => game.sport === selectedSport);
      }
      
      console.log(`✅ Found ${filteredGames.length} ${viewMode} games`);
      return filteredGames;
    },
    refetchInterval: viewMode === 'live' ? 30000 : false, // Auto-refresh live games every 30 seconds
    staleTime: viewMode === 'live' ? 15000 : 300000, // Live: 15s, Others: 5min
  });

  // Get sportsbooks
  const sportsbooks = realTimeOddsService.sportsbooks;
  const activeSportsbook = sportsbooks.find(sb => sb.id === selectedSportsbook);

  // Sports filter options
  const sportOptions = [
    { value: 'all', label: '🏆 All Sports' },
    { value: 'NFL', label: '🏈 NFL' },
    { value: 'NBA', label: '🏀 NBA' },
    { value: 'College Football', label: '🏫 College Football' },
    { value: 'MLB', label: '⚾ MLB' }
  ];

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };

  const getBestOdds = (game: LiveOddsData, betType: string) => {
    return realTimeOddsService.findBestOdds(game, betType as any);
  };

  const getGameStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'text-red-400 animate-pulse';
      case 'final': return 'text-gray-400';
      default: return 'text-green-400';
    }
  };

  const getGameStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return '🔴';
      case 'final': return '✅';
      default: return '⏰';
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
          <h3 className="text-red-300 font-semibold text-lg mb-2">Unable to Load Live Games</h3>
          <p className="text-red-200 text-sm mb-4">
            Failed to fetch real-time sports data. This could be due to API limits or network issues.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">🏈 Live Sports Games</h2>
        <p className="text-gray-300 text-sm">
          Real-time games and odds from major sportsbooks • Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* View Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">View</label>
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
            {[
              { key: 'today', label: 'Today', icon: '📅' },
              { key: 'upcoming', label: 'Future', icon: '🔮' },
              { key: 'live', label: 'Live', icon: '🔴' }
            ].map((mode) => (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key as any)}
                className={`flex-1 px-3 py-2 text-xs rounded-md transition-all ${
                  viewMode === mode.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {mode.icon} {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Picker (shown when viewing upcoming games) */}
        {viewMode === 'upcoming' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              {dateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sport Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Sport</label>
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            {sportOptions.map((sport) => (
              <option key={sport.value} value={sport.value}>
                {sport.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sportsbook Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Sportsbook</label>
          <select
            value={selectedSportsbook}
            onChange={(e) => setSelectedSportsbook(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            style={{ color: activeSportsbook?.color }}
          >
            {sportsbooks.map((sportsbook) => (
              <option key={sportsbook.id} value={sportsbook.id}>
                {sportsbook.logo} {sportsbook.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Manual Refresh */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>Showing {liveGames?.length || 0} games</span>
          {viewMode === 'live' && (
            <span className="flex items-center space-x-1 text-red-400">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span>Auto-updating every 30s</span>
            </span>
          )}
        </div>
        
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
        >
          <span>{isLoading ? '🔄' : '↻'}</span>
          <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Games List */}
      <AnimatePresence mode="wait">
        {!isLoading && liveGames && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {liveGames.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">
                  {viewMode === 'live' ? '🔴' : viewMode === 'today' ? '📅' : '🔮'}
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No {viewMode === 'live' ? 'Live' : viewMode === 'today' ? "Today's" : 'Upcoming'} Games
                </h3>
                <p className="text-gray-400 mb-4">
                  {viewMode === 'live' 
                    ? 'No games are currently being played'
                    : `No games scheduled for ${viewMode === 'today' ? 'today' : 'the selected date'}`
                  }
                </p>
                <button
                  onClick={() => {
                    setViewMode('upcoming');
                    setSelectedDate(dateOptions[1]?.value || selectedDate);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Upcoming Games
                </button>
              </div>
            ) : (
              liveGames.map((game, index) => {
                const bookmakerOdds = game.bookmakers[selectedSportsbook];
                
                return (
                  <motion.div
                    key={game.gameId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800 rounded-lg border border-gray-600 hover:border-blue-500 transition-all duration-200"
                  >
                    <div className="p-6">
                      {/* Game Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-sm font-medium text-blue-400">
                              {game.sport}
                            </span>
                            <span className={`text-sm flex items-center space-x-1 ${getGameStatusColor(game.status)}`}>
                              <span>{getGameStatusIcon(game.status)}</span>
                              <span className="capitalize">{game.status}</span>
                            </span>
                            {game.status === 'live' && (
                              <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full animate-pulse">
                                LIVE
                              </span>
                            )}
                          </div>
                          
                          {/* Teams */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-semibold text-white">
                                {game.awayTeam}
                              </span>
                              <span className="text-gray-400 text-sm">@ {game.homeTeam}</span>
                            </div>
                          </div>
                          
                          {/* Game Info */}
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                            <span>{game.gameDate}</span>
                            <span>{game.gameTime}</span>
                          </div>
                        </div>
                        
                        {/* Sportsbook Badge */}
                        <div className="flex items-center space-x-2 ml-4">
                          <span className="text-2xl">{activeSportsbook?.logo}</span>
                          <div className="text-right">
                            <div className="text-sm font-medium text-white">
                              {activeSportsbook?.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              Live Odds
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Betting Options */}
                      {bookmakerOdds && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Moneyline */}
                          <div className="bg-gray-700/50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-300 mb-3">Moneyline</h4>
                            <div className="space-y-2">
                              <button className="w-full flex justify-between items-center p-2 bg-gray-600 hover:bg-blue-600 rounded text-sm transition-colors">
                                <span>{game.awayTeam}</span>
                                <span className="font-medium">
                                  {formatOdds(bookmakerOdds.moneyline.away)}
                                </span>
                              </button>
                              <button className="w-full flex justify-between items-center p-2 bg-gray-600 hover:bg-blue-600 rounded text-sm transition-colors">
                                <span>{game.homeTeam}</span>
                                <span className="font-medium">
                                  {formatOdds(bookmakerOdds.moneyline.home)}
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Spread */}
                          <div className="bg-gray-700/50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-300 mb-3">
                              Spread ({bookmakerOdds.spread.line})
                            </h4>
                            <div className="space-y-2">
                              <button className="w-full flex justify-between items-center p-2 bg-gray-600 hover:bg-green-600 rounded text-sm transition-colors">
                                <span>{game.awayTeam} +{bookmakerOdds.spread.line}</span>
                                <span className="font-medium">
                                  {formatOdds(bookmakerOdds.spread.away)}
                                </span>
                              </button>
                              <button className="w-full flex justify-between items-center p-2 bg-gray-600 hover:bg-green-600 rounded text-sm transition-colors">
                                <span>{game.homeTeam} -{bookmakerOdds.spread.line}</span>
                                <span className="font-medium">
                                  {formatOdds(bookmakerOdds.spread.home)}
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Total */}
                          <div className="bg-gray-700/50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-300 mb-3">
                              Total ({bookmakerOdds.total.line})
                            </h4>
                            <div className="space-y-2">
                              <button className="w-full flex justify-between items-center p-2 bg-gray-600 hover:bg-purple-600 rounded text-sm transition-colors">
                                <span>Over {bookmakerOdds.total.line}</span>
                                <span className="font-medium">
                                  {formatOdds(bookmakerOdds.total.over)}
                                </span>
                              </button>
                              <button className="w-full flex justify-between items-center p-2 bg-gray-600 hover:bg-purple-600 rounded text-sm transition-colors">
                                <span>Under {bookmakerOdds.total.line}</span>
                                <span className="font-medium">
                                  {formatOdds(bookmakerOdds.total.under)}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Best Odds Finder */}
                      <div className="mt-4 pt-4 border-t border-gray-600">
                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <span>Best Odds:</span>
                          <div className="flex space-x-4">
                            {(() => {
                              const bestML = getBestOdds(game, 'moneyline_home');
                              const bestSpread = getBestOdds(game, 'spread_home');
                              const bestOver = getBestOdds(game, 'over');
                              
                              return (
                                <>
                                  {bestML && <span>ML: {bestML.bookmaker} ({bestML.value})</span>}
                                  {bestSpread && <span>Spread: {bestSpread.bookmaker} ({bestSpread.value})</span>}
                                  {bestOver && <span>Total: {bestOver.bookmaker} ({bestOver.value})</span>}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-400 text-lg">ℹ️</div>
          <div>
            <h4 className="font-medium text-blue-300 mb-1">Real-Time Sports Data</h4>
            <p className="text-blue-200 text-sm">
              Odds updated every 2 minutes from major sportsbooks. 
              Live games refresh automatically every 30 seconds.
              All times shown in Eastern Time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};