/**
 * Parlay Drawer Component
 * Persistent bottom drawer (mobile) or sidebar (desktop)
 * Shows parlay legs, live odds, optimization, and bet sizing
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParlayStore } from '../../store/parlayStore';
import { useParlay } from '../../hooks/useRealTimeOdds';
import { useParlayOptimizer, useEdgeDetection, useBetSizing } from '../../hooks/useParlayOptimizer';
import ParlayLegCard from './ParlayLegCard';
import OptimizationPanel from './OptimizationPanel';
import BetSizingPanel from './BetSizingPanel';

const ParlayDrawer: React.FC = () => {
  const {
    legs,
    isDrawerOpen,
    toggleDrawer,
    closeDrawer,
    optimization,
    setOptimization,
    setIsOptimizing,
    bankroll,
  } = useParlayStore();

  const [showOptimization, setShowOptimization] = useState(false);
  const [showBetSizing, setShowBetSizing] = useState(false);

  // Calculate parlay odds and EV
  const { result: parlayResult, loading: parlayLoading } = useParlay(
    legs.map(leg => ({
      id: leg.id,
      eventId: leg.eventId,
      market: leg.market,
      selection: leg.selection,
      odds: leg.odds,
      line: leg.line,
      sport: leg.sport,
      teams: { home: leg.homeTeam, away: leg.awayTeam },
    })),
    bankroll
  );

  // Edge detection
  const { edgeAnalysis, loading: edgeLoading } = useEdgeDetection(
    legs.map(leg => ({
      eventId: leg.eventId,
      market: leg.market,
      selection: leg.selection,
      odds: leg.odds,
      bookmaker: leg.bookmaker,
    })),
    legs[0]?.sport || 'basketball_nba'
  );

  // Bet sizing recommendation
  const { recommendation: betSizing } = useBetSizing(
    parlayResult?.parlayOdds || 0,
    parlayResult?.trueProbability || 0,
    bankroll,
    parlayResult?.expectedValue || 0,
    parlayResult?.correlationWarnings?.length || 0
  );

  // Auto-open drawer when legs added
  useEffect(() => {
    if (legs.length > 0 && !isDrawerOpen) {
      // Optional: auto-open on first leg
    }
  }, [legs.length]);

  // Handle optimization
  const handleOptimize = async () => {
    setIsOptimizing(true);
    setShowOptimization(true);
    // Optimization handled by OptimizationPanel component
  };

  const legCount = legs.length;
  const isValid = legCount >= 2 && legCount <= 15;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <motion.div
        initial={false}
        animate={{
          x: isDrawerOpen ? 0 : '100%',
          y: 0,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full md:w-96 bg-gray-900 border-l border-gray-800 shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-blue-600 to-purple-600">
          <div>
            <h2 className="text-xl font-bold text-white">
              Parlay Slip
            </h2>
            <p className="text-sm text-gray-200">
              {legCount} {legCount === 1 ? 'leg' : 'legs'}
            </p>
          </div>
          <button
            onClick={toggleDrawer}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close drawer"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {legCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                No legs added yet
              </h3>
              <p className="text-sm text-gray-500">
                Click on odds to add legs to your parlay
              </p>
            </div>
          ) : (
            <>
              {/* Legs List */}
              <div className="space-y-3">
                {legs.map((leg, index) => (
                  <ParlayLegCard
                    key={leg.id}
                    leg={leg}
                    index={index}
                    edgeData={edgeAnalysis?.legs?.find(e => e.legId === `${leg.eventId}-${leg.market}`)}
                  />
                ))}
              </div>

              {/* Validation Warning */}
              {!isValid && (
                <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                  <p className="text-sm text-red-400">
                    {legCount < 2 
                      ? 'Add at least 2 legs to create a parlay'
                      : 'Maximum 15 legs allowed'}
                  </p>
                </div>
              )}

              {/* Correlation Warnings */}
              {parlayResult?.correlationWarnings && parlayResult.correlationWarnings.length > 0 && (
                <div className="p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-yellow-400">
                    ⚠️ Correlation Warnings
                  </p>
                  {parlayResult.correlationWarnings.map((warning, i) => (
                    <p key={i} className="text-xs text-yellow-300">
                      {warning.message}
                    </p>
                  ))}
                </div>
              )}

              {/* Parlay Summary */}
              {isValid && parlayResult && (
                <div className="p-4 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-700 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Parlay Odds</span>
                    <span className="text-xl font-bold text-white">
                      {parlayResult.parlayOdds > 0 ? '+' : ''}
                      {parlayResult.parlayOdds}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Payout ($100 bet)</span>
                    <span className="text-lg font-semibold text-green-400">
                      ${parlayResult.payout.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Expected Value</span>
                    <span className={`text-sm font-semibold ${
                      parlayResult.expectedValue > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(parlayResult.expectedValue * 100).toFixed(2)}%
                    </span>
                  </div>
                  {parlayResult.recommendedBankroll > 0 && (
                    <div className="pt-3 border-t border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Kelly Recommendation</span>
                        <span className="text-lg font-bold text-blue-400">
                          ${parlayResult.recommendedBankroll.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {isValid && (
                <div className="space-y-2">
                  <button
                    onClick={handleOptimize}
                    disabled={!isValid}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-800 text-white font-semibold rounded-lg transition-all shadow-lg disabled:cursor-not-allowed"
                  >
                    🔍 Optimize Parlay
                  </button>
                  
                  <button
                    onClick={() => setShowBetSizing(!showBetSizing)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-lg"
                  >
                    💰 Bet Sizing
                  </button>
                </div>
              )}

              {/* Optimization Panel */}
              {showOptimization && (
                <OptimizationPanel
                  legs={legs}
                  onClose={() => setShowOptimization(false)}
                />
              )}

              {/* Bet Sizing Panel */}
              {showBetSizing && betSizing && (
                <BetSizingPanel
                  recommendation={betSizing}
                  onClose={() => setShowBetSizing(false)}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {legCount > 0 && (
          <div className="p-4 border-t border-gray-800 bg-gray-900">
            <button
              onClick={() => useParlayStore.getState().clearLegs()}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </motion.div>

      {/* Floating Toggle Button (Mobile) */}
      {!isDrawerOpen && legCount > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={toggleDrawer}
          className="fixed bottom-6 right-6 z-30 md:hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl"
        >
          <div className="relative">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {legCount}
            </span>
          </div>
        </motion.button>
      )}
    </>
  );
};

export default ParlayDrawer;
