/**
 * Cache Stats Indicator - Shows cache efficiency to users
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { liveSportsService } from '../../services/liveSportsService';

export const CacheStatsIndicator: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      const cacheStats = liveSportsService.getCacheStats();
      setStats(cacheStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  const efficiency = stats.totalEntries > 0 ? Math.round((stats.averageHitRatio / stats.totalEntries) * 100) : 0;
  const getEfficiencyColor = (eff: number) => {
    if (eff >= 80) return 'text-green-400';
    if (eff >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getEfficiencyIcon = (eff: number) => {
    if (eff >= 80) return '🚀';
    if (eff >= 60) return '⚡';
    return '⚠️';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.button
        onClick={() => setShowDetails(!showDetails)}
        className="bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg border border-white/20 hover:border-white/40 transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm">{getEfficiencyIcon(efficiency)}</span>
          <span className={`text-sm font-medium ${getEfficiencyColor(efficiency)}`}>
            {efficiency}% Cache
          </span>
        </div>
      </motion.button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-14 right-0 bg-black/90 backdrop-blur-sm text-white p-4 rounded-lg border border-white/20 min-w-64"
          >
            <h3 className="font-semibold mb-3 flex items-center space-x-2">
              <span>📊</span>
              <span>Smart Cache Stats</span>
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Cache Entries:</span>
                <span className="font-medium">{stats.totalEntries}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Efficiency:</span>
                <span className={`font-medium ${getEfficiencyColor(efficiency)}`}>
                  {efficiency}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Background Updates:</span>
                <span className="font-medium text-blue-400">{stats.backgroundRefreshActive}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Live Timers:</span>
                <span className="font-medium text-green-400">{stats.realtimeTimers}</span>
              </div>

              {stats.byPriority && (
                <div className="border-t border-white/20 pt-2 mt-2">
                  <div className="text-xs text-gray-400 mb-1">By Priority:</div>
                  {Object.entries(stats.byPriority).map(([priority, count]) => (
                    <div key={priority} className="flex justify-between text-xs">
                      <span className="capitalize text-gray-300">{priority}:</span>
                      <span>{count as number}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-white/20">
              <div className="text-xs text-gray-400">
                💡 Smart caching reduces API calls by up to 90%
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};