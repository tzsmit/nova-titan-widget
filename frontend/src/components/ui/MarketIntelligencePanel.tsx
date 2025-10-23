/**
 * Market Intelligence Panel - Replace Legacy AI Analysis
 * Professional market intelligence with real-time data integration
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  DollarSign,
  Users,
  LineChart,
  Flame,
  ArrowUp,
  ArrowDown,
  Eye,
  Activity,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { marketIntelligenceService, MarketIntelligenceData } from '../../services/marketIntelligenceService';
import { formatLargeNumber, formatPercentage, formatNumber } from '../../utils/format';

interface MarketIntelligencePanelProps {
  className?: string;
}

export const MarketIntelligencePanel: React.FC<MarketIntelligencePanelProps> = ({ 
  className = '' 
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Fetch market intelligence data
  const { 
    data: marketIntel, 
    isLoading: marketLoading, 
    error: marketError,
    refetch: refetchMarket 
  } = useQuery({
    queryKey: ['market-intelligence-panel'],
    queryFn: () => marketIntelligenceService.getMarketIntelligence(),
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    staleTime: 60 * 1000 // 1 minute
  });

  if (marketError) {
    return (
      <div className={`nova-card p-6 ${className}`}>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-400 mb-2">
              Market Data Unavailable
            </h3>
            <p className="text-sm" style={{ color: 'var(--nova-text-secondary)' }}>
              Unable to fetch market intelligence
            </p>
            <button
              onClick={() => refetchMarket()}
              className="nova-btn-primary mt-4 px-4 py-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (marketLoading || !marketIntel) {
    return (
      <div className={`nova-card p-6 ${className}`}>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 relative">
              <div 
                className="absolute inset-0 rounded-full animate-spin"
                style={{
                  border: '3px solid transparent',
                  borderTop: '3px solid var(--nova-text-accent)',
                  borderRight: '3px solid var(--nova-primary-400)'
                }}
              ></div>
              <div className="absolute inset-2 flex items-center justify-center">
                <BarChart3 className="w-6 h-6" style={{ color: 'var(--nova-text-accent)' }} />
              </div>
            </div>
            <p className="text-sm" style={{ color: 'var(--nova-text-secondary)' }}>
              Loading market intelligence...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`nova-card ${className}`}>
      {/* Header */}
      <div className="p-6 pb-4 border-b" style={{ borderColor: 'var(--nova-glass-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, var(--nova-success) 0%, var(--nova-cyan-500) 100%)' 
              }}
            >
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 
                className="text-lg font-semibold"
                style={{ color: 'var(--nova-text-primary)' }}
              >
                Market Intelligence
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--nova-text-secondary)' }}
              >
                Live market analysis and trends
              </p>
            </div>
          </div>
          
          <motion.button
            onClick={() => refetchMarket()}
            disabled={marketLoading}
            whileHover={{ scale: marketLoading ? 1 : 1.05 }}
            whileTap={{ scale: marketLoading ? 1 : 0.95 }}
            className="nova-btn-secondary p-2"
            title="Refresh market data"
          >
            <RefreshCw className={`w-4 h-4 ${marketLoading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Market Overview Stats */}
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Volume */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="nova-metric-card cursor-pointer"
            onClick={() => setSelectedMetric(selectedMetric === 'volume' ? null : 'volume')}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1">
                <div 
                  className="text-xs font-medium"
                  style={{ color: 'var(--nova-text-secondary)' }}
                >
                  Total Volume
                </div>
                <div 
                  className="text-lg font-bold"
                  style={{ color: 'var(--nova-text-primary)' }}
                >
                  ${formatLargeNumber(marketIntel.totalVolume, 1)}
                </div>
              </div>
            </div>
            
            <AnimatePresence>
              {selectedMetric === 'volume' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-green-500/20"
                >
                  <div className="text-xs" style={{ color: 'var(--nova-text-secondary)' }}>
                    Estimated total betting volume across all tracked markets
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Sharp Money */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="nova-metric-card cursor-pointer"
            onClick={() => setSelectedMetric(selectedMetric === 'sharp' ? null : 'sharp')}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Target className="w-4 h-4 text-orange-400" />
              </div>
              <div className="flex-1">
                <div 
                  className="text-xs font-medium"
                  style={{ color: 'var(--nova-text-secondary)' }}
                >
                  Sharp Money
                </div>
                <div 
                  className="text-lg font-bold"
                  style={{ color: 'var(--nova-text-primary)' }}
                >
                  {formatPercentage(marketIntel.sharpMoneyPercentage, 1)}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {selectedMetric === 'sharp' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-orange-500/20"
                >
                  <div className="text-xs" style={{ color: 'var(--nova-text-secondary)' }}>
                    Percentage of volume from professional/sharp bettors
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Market Efficiency */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="nova-metric-card cursor-pointer"
            onClick={() => setSelectedMetric(selectedMetric === 'efficiency' ? null : 'efficiency')}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <div 
                  className="text-xs font-medium"
                  style={{ color: 'var(--nova-text-secondary)' }}
                >
                  Line Movement
                </div>
                <div 
                  className="text-lg font-bold"
                  style={{ color: 'var(--nova-text-primary)' }}
                >
                  {formatNumber(marketIntel.marketTrends.averageLineMovement, 1)}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {selectedMetric === 'efficiency' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-blue-500/20"
                >
                  <div className="text-xs" style={{ color: 'var(--nova-text-secondary)' }}>
                    Average line movement across all games (points)
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Total Bets */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="nova-metric-card cursor-pointer"
            onClick={() => setSelectedMetric(selectedMetric === 'bets' ? null : 'bets')}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <div 
                  className="text-xs font-medium"
                  style={{ color: 'var(--nova-text-secondary)' }}
                >
                  Total Bets
                </div>
                <div 
                  className="text-lg font-bold"
                  style={{ color: 'var(--nova-text-primary)' }}
                >
                  {formatLargeNumber(marketIntel.marketTrends.totalBetsToday, 0)}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {selectedMetric === 'bets' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-purple-500/20"
                >
                  <div className="text-xs" style={{ color: 'var(--nova-text-secondary)' }}>
                    Estimated number of individual bets placed today
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Market Intelligence Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Movements */}
          <div className="space-y-4">
            <h4 
              className="text-base font-semibold flex items-center gap-2"
              style={{ color: 'var(--nova-text-primary)' }}
            >
              <LineChart className="w-4 h-4 text-blue-400" />
              Recent Line Movements
            </h4>
            
            <div className="space-y-2">
              {marketIntel.lineMovements.slice(0, 5).map((movement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="nova-metric-card p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div 
                        className="text-sm font-medium"
                        style={{ color: 'var(--nova-text-primary)' }}
                      >
                        {movement.game}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" style={{ color: 'var(--nova-text-muted)' }} />
                        <span 
                          className="text-xs"
                          style={{ color: 'var(--nova-text-muted)' }}
                        >
                          {new Date(movement.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {movement.direction === 'up' ? (
                        <ArrowUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-400" />
                      )}
                      <span 
                        className={`font-medium ${
                          movement.direction === 'up' ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {formatNumber(movement.movement, 1)}
                      </span>
                      <span 
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          movement.significance === 'high' 
                            ? 'bg-red-500/20 text-red-400' 
                            : movement.significance === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {movement.significance}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Hot Streaks */}
          <div className="space-y-4">
            <h4 
              className="text-base font-semibold flex items-center gap-2"
              style={{ color: 'var(--nova-text-primary)' }}
            >
              <Flame className="w-4 h-4 text-orange-400" />
              Hot Streaks
            </h4>
            
            <div className="space-y-2">
              {marketIntel.hotStreaks.map((streak, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="nova-metric-card p-3"
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="text-sm font-medium"
                      style={{ color: 'var(--nova-text-primary)' }}
                    >
                      {streak.team}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-lg font-bold text-orange-400"
                      >
                        {streak.streak}
                      </span>
                      <span 
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          streak.type === 'win' 
                            ? 'bg-green-500/20 text-green-400' 
                            : streak.type === 'cover'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {streak.type}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Public Favorites */}
        {marketIntel.publicFavorites.length > 0 && (
          <div className="mt-6">
            <h4 
              className="text-base font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--nova-text-primary)' }}
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              Public Favorites
            </h4>
            
            <div className="flex flex-wrap gap-2">
              {marketIntel.publicFavorites.map((team, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-medium"
                >
                  {team}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};