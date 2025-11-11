/**
 * Optimization Panel Component
 * Shows multi-book optimization results
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParlayOptimizer } from '../../hooks/useParlayOptimizer';
import { ParlayLeg } from '../../store/parlayStore';

interface OptimizationPanelProps {
  legs: ParlayLeg[];
  onClose: () => void;
}

const OptimizationPanel: React.FC<OptimizationPanelProps> = ({ legs, onClose }) => {
  const { optimization, loading, error } = useParlayOptimizer(
    legs.map(leg => ({
      eventId: leg.eventId,
      market: leg.market,
      selection: leg.selection,
      currentOdds: leg.odds,
      currentBookmaker: leg.bookmaker,
    })),
    legs[0]?.sport || 'basketball_nba'
  );

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 bg-gray-800 border border-gray-700 rounded-lg"
      >
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-300">Optimizing...</span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 bg-red-900/20 border border-red-700 rounded-lg"
      >
        <p className="text-red-400">Error: {error.message}</p>
        <button
          onClick={onClose}
          className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
        >
          Close
        </button>
      </motion.div>
    );
  }

  if (!optimization) {
    return null;
  }

  const hasImprovement = optimization.improvement.percentIncrease > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-700 rounded-lg space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center">
          <span className="mr-2">🔍</span>
          Optimization Results
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Improvement Summary */}
      <div className="p-3 bg-black/30 rounded-lg">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400">Original Payout</p>
            <p className="text-lg font-bold text-gray-300">
              ${optimization.originalParlay.payout.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Optimized Payout</p>
            <p className="text-lg font-bold text-green-400">
              ${optimization.optimizedParlay.payout.toFixed(2)}
            </p>
          </div>
        </div>
        
        {hasImprovement && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Improvement</span>
              <div className="text-right">
                <p className="text-xl font-bold text-green-400">
                  +${optimization.improvement.payoutIncrease.toFixed(2)}
                </p>
                <p className="text-sm text-green-500">
                  ({optimization.improvement.percentIncrease.toFixed(2)}% better)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Optimized Legs */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-300">Optimized Legs</h4>
        {optimization.optimizedParlay.legs.map((leg, index) => (
          <div key={index} className="p-3 bg-black/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">
                {leg.selection}
              </span>
              <span className="text-sm font-bold text-blue-400">
                {leg.odds > 0 ? '+' : ''}{leg.odds}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">
                via {leg.bookmaker}
              </span>
              {leg.edgeVsMarket && leg.edgeVsMarket > 0 && (
                <span className="px-2 py-1 bg-green-900/50 text-green-400 rounded">
                  +{leg.edgeVsMarket.toFixed(1)}% edge
                </span>
              )}
            </div>

            {/* Alternative Odds */}
            {leg.alternativeOdds && leg.alternativeOdds.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-xs text-gray-500 mb-1">Alternatives:</p>
                <div className="space-y-1">
                  {leg.alternativeOdds.slice(0, 2).map((alt, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-gray-400">
                      <span>{alt.bookmaker}</span>
                      <span>
                        {alt.odds > 0 ? '+' : ''}{alt.odds}
                        <span className="ml-1 text-gray-500">
                          ({alt.edge > 0 ? '+' : ''}{alt.edge.toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {optimization.recommendations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-300">💡 Recommendations</h4>
          <div className="space-y-2">
            {optimization.recommendations.map((rec, index) => (
              <div key={index} className="p-2 bg-blue-900/20 border border-blue-700 rounded text-xs text-blue-300">
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {optimization.warnings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-300">⚠️ Warnings</h4>
          <div className="space-y-2">
            {optimization.warnings.map((warning, index) => (
              <div key={index} className="p-2 bg-yellow-900/20 border border-yellow-700 rounded text-xs text-yellow-300">
                {warning}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Improvement Message */}
      {!hasImprovement && (
        <div className="p-3 bg-gray-800/50 rounded-lg text-center">
          <p className="text-sm text-gray-400">
            ✅ You already have the best available odds!
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default OptimizationPanel;
