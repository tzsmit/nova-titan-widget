/**
 * Player Props Tab - Live player propositions with smart caching
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { realTimeOddsService, RealPlayerProp } from '../../../services/realTimeOddsService';

export const PlayerPropsTab: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState('NFL');
  const [selectedProp, setSelectedProp] = useState('all');
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  const { data: playerProps, isLoading, error, refetch } = useQuery({
    queryKey: ['player-props', selectedSport, selectedProp],
    queryFn: async () => {
      console.log(`🎯 Fetching live player props for ${selectedSport}...`);
      const sportMap: { [key: string]: string } = {
        'NFL': 'americanfootball_nfl',
        'NBA': 'basketball_nba',
        'CFB': 'americanfootball_ncaaf'
      };
      const apiSport = sportMap[selectedSport] || 'americanfootball_nfl';
      const props = await realTimeOddsService.getLivePlayerProps(apiSport);
      console.log(`✅ Found ${props.length} live player props`);
      return props;
    },
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes for live props
  });

  const filteredProps = playerProps?.filter(prop => {
    if (selectedProp !== 'all' && prop.propType !== selectedProp) return false;
    if (showOnlyActive && !prop.isActive) return false;
    return true;
  }) || [];

  const propTypes = [
    { value: 'all', label: '🎯 All Props' },
    { value: 'passing_yards', label: '🏈 Passing Yards' },
    { value: 'rushing_yards', label: '🏃 Rushing Yards' },
    { value: 'receiving_yards', label: '🤲 Receiving Yards' },
    { value: 'passing_touchdowns', label: '🎯 Pass TDs' },
    { value: 'points', label: '🏀 Points (NBA)' },
    { value: 'rebounds', label: '📦 Rebounds' },
    { value: 'assists', label: '🎯 Assists' },
  ];

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };

  const getPropIcon = (propType: string) => {
    const icons = {
      'passing_yards': '🏈',
      'rushing_yards': '🏃',
      'receiving_yards': '🤲',
      'passing_touchdowns': '🎯',
      'rushing_touchdowns': '💪',
      'points': '🏀',
      'rebounds': '📦',
      'assists': '🎯',
      'steals': '🔥',
      'blocks': '🛡️'
    };
    return icons[propType as keyof typeof icons] || '📊';
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Unable to Load Player Props</h3>
          <p className="text-red-600 text-sm mb-3">
            There was an issue loading player propositions. This might be due to API limits or network issues.
          </p>
          <motion.button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">🎯 Player Props</h2>
        <p className="text-gray-300 text-sm">
          Live player propositions with real-time odds and AI analysis
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Sport Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Sport</label>
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="NFL">🏈 NFL</option>
            <option value="NBA">🏀 NBA</option>
            <option value="CFB">🏫 College Football</option>
          </select>
        </div>

        {/* Prop Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Prop Type</label>
          <select
            value={selectedProp}
            onChange={(e) => setSelectedProp(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            {propTypes.map((prop) => (
              <option key={prop.value} value={prop.value}>
                {prop.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active Props Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="activeOnly"
            checked={showOnlyActive}
            onChange={(e) => setShowOnlyActive(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="activeOnly" className="text-sm text-gray-300">
            Active Props Only
          </label>
        </div>

        {/* Manual Refresh */}
        <motion.button
          onClick={() => refetch()}
          disabled={isLoading}
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? '🔄' : '↻'} Refresh
        </motion.button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Player Props Grid */}
      <AnimatePresence mode="wait">
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredProps.map((prop, index) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors"
              >
                {/* Player Info */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      {prop.playerName}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {prop.team} • {prop.position}
                    </p>
                  </div>
                  <div className="text-xl">
                    {getPropIcon(prop.prop)}
                  </div>
                </div>

                {/* Prop Details */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300 capitalize">
                      {prop.prop.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {prop.line}
                    </span>
                  </div>

                  {/* Over/Under Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button className="bg-green-600/20 hover:bg-green-600/30 text-green-300 text-sm font-medium py-2 px-3 rounded border border-green-500/30 transition-colors">
                      Over {formatOdds(prop.overOdds)}
                    </button>
                    <button className="bg-red-600/20 hover:bg-red-600/30 text-red-300 text-sm font-medium py-2 px-3 rounded border border-red-500/30 transition-colors">
                      Under {formatOdds(prop.underOdds)}
                    </button>
                  </div>

                  {/* Status */}
                  <div className="flex justify-between items-center text-xs">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        prop.status === 'active'
                          ? 'bg-green-600/20 text-green-300'
                          : prop.status === 'suspended'
                          ? 'bg-yellow-600/20 text-yellow-300'
                          : 'bg-gray-600/20 text-gray-300'
                      }`}
                    >
                      {prop.status.charAt(0).toUpperCase() + prop.status.slice(1)}
                    </span>
                    <span className="text-gray-500">
                      {new Date(prop.lastUpdated).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!isLoading && filteredProps.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-white mb-2">No Player Props Available</h3>
          <p className="text-gray-400 mb-4">
            {selectedProp === 'all' 
              ? `No player props found for ${selectedSport}`
              : `No ${selectedProp.replace('_', ' ')} props available`
            }
          </p>
          <motion.button
            onClick={() => {
              setSelectedProp('all');
              setShowOnlyActive(false);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            Show All Props
          </motion.button>
        </motion.div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-400 text-lg">ℹ️</div>
          <div>
            <h4 className="font-medium text-blue-300 mb-1">Smart Caching Active</h4>
            <p className="text-blue-200 text-sm">
              Player props are cached for 20 minutes to minimize API costs. 
              Live odds update automatically during active game times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};