/**
 * Simplified Parlays Tab - Easy Parlay Building
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Calculator,
  DollarSign,
  Target,
  Star
} from 'lucide-react';

interface ParlayLeg {
  id: string;
  game: string;
  pick: string;
  odds: number;
  sport: string;
}

export const SimpleParlaysTab: React.FC = () => {
  const [parlayLegs, setParlayLegs] = useState<ParlayLeg[]>([]);
  const [stake, setStake] = useState(100);

  // Sample available bets
  const availableBets = [
    {
      id: '1',
      game: 'Chiefs @ Rams',
      pick: 'Chiefs -3.5',
      odds: -110,
      sport: 'NFL'
    },
    {
      id: '2', 
      game: 'Steelers @ Bengals',
      pick: 'Over 43.5',
      odds: -105,
      sport: 'NFL'
    },
    {
      id: '3',
      game: 'Lakers @ Warriors',
      pick: 'Lakers +5.5',
      odds: -110,
      sport: 'NBA'
    },
    {
      id: '4',
      game: 'Celtics @ Heat', 
      pick: 'Under 215.5',
      odds: -115,
      sport: 'NBA'
    }
  ];

  const addLeg = (bet: any) => {
    if (parlayLegs.find(leg => leg.id === bet.id)) return;
    
    setParlayLegs([...parlayLegs, {
      id: bet.id,
      game: bet.game,
      pick: bet.pick,
      odds: bet.odds,
      sport: bet.sport
    }]);
  };

  const removeLeg = (id: string) => {
    setParlayLegs(parlayLegs.filter(leg => leg.id !== id));
  };

  const calculateParlay = () => {
    if (parlayLegs.length === 0) {
      return { totalOdds: 1, payout: stake, profit: 0 };
    }

    const totalOdds = parlayLegs.reduce((acc, leg) => {
      const decimal = leg.odds > 0 ? (leg.odds / 100) + 1 : (100 / Math.abs(leg.odds)) + 1;
      return acc * decimal;
    }, 1);

    const payout = stake * totalOdds;
    const profit = payout - stake;

    return { totalOdds, payout, profit };
  };

  const { totalOdds, payout, profit } = calculateParlay();

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  return (
    <div className="w-full max-w-screen-sm sm:max-w-screen-md mx-auto p-2 sm:p-4 flex flex-col gap-4">
      {/* Simple Header */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-4">
        <h1 className="text-lg sm:text-xl font-bold text-white">Build Parlay</h1>
      </div>

      <div className="w-full">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 w-full">
          
          {/* Available Bets */}
          <div className="w-full">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Available Bets</h2>
            <div className="space-y-3 max-h-[40vh] sm:max-h-[50vh] overflow-y-auto">
              {availableBets.map((bet) => (
                <motion.div
                  key={bet.id}
                  className="bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => addLeg(bet)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                          {bet.sport}
                        </span>
                        <span className="text-white font-medium">{bet.game}</span>
                      </div>
                      <div className="text-slate-300">{bet.pick}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-green-400 font-semibold">
                        {formatOdds(bet.odds)}
                      </span>
                      <Plus className="h-4 w-4 text-blue-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Parlay Builder */}
          <div className="w-full">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Your Parlay</h2>
            
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              {/* Parlay Legs */}
              <div className="space-y-3 mb-6">
                {parlayLegs.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-8 w-8 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">Add bets to build your parlay</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {parlayLegs.map((leg, index) => (
                      <motion.div
                        key={leg.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-slate-700 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded">
                                {leg.sport}
                              </span>
                              <span className="text-white text-sm font-medium">
                                {leg.game}
                              </span>
                            </div>
                            <div className="text-slate-300 text-sm">{leg.pick}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-green-400 font-semibold">
                              {formatOdds(leg.odds)}
                            </span>
                            <button
                              onClick={() => removeLeg(leg.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Stake Input */}
              {parlayLegs.length > 0 && (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Stake Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="number"
                        value={stake}
                        onChange={(e) => setStake(Number(e.target.value) || 0)}
                        className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter stake amount"
                      />
                    </div>
                  </div>

                  {/* Parlay Summary */}
                  <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center gap-2 mb-3">
                      <Calculator className="h-5 w-5 text-blue-400" />
                      <span className="font-semibold text-white">Parlay Summary</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-slate-400">Legs</div>
                        <div className="text-lg font-semibold text-white">
                          {parlayLegs.length}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Total Odds</div>
                        <div className="text-lg font-semibold text-white">
                          +{Math.round((totalOdds - 1) * 100)}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400">Stake:</span>
                        <span className="text-white">${stake.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400">To Win:</span>
                        <span className="text-green-400 font-semibold">
                          ${profit.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span className="text-slate-200">Total Payout:</span>
                        <span className="text-green-400">
                          ${payout.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg mt-4 transition-all transform hover:scale-105"
                      disabled={parlayLegs.length === 0}
                    >
                      <Star className="h-4 w-4 inline mr-2" />
                      Place Parlay Bet
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <div className="text-center p-3 sm:p-4 border-t border-slate-700 mt-4">
        <div className="text-slate-500 text-xs sm:text-sm">
          Parlay Builder by{' '}
          <a 
            href="https://novatitan.net/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-400 hover:text-blue-300 underline"
          >
            novatitan.net
          </a>
        </div>
      </div>
    </div>
  );
};