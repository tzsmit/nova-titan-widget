import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWidgetStore } from '../../../stores/widgetStore';
import { HelpTooltip } from '../../ui/HelpTooltip';
import { 
  Plus, 
  Trash2, 
  Calculator, 
  TrendingUp, 
  Zap, 
  AlertTriangle,
  DollarSign,
  Target
} from 'lucide-react';

interface ParlayLeg {
  id: string;
  game: string;
  team: string;
  bet: string;
  odds: number;
  confidence?: number;
}

interface ParlayBuilder {
  legs: ParlayLeg[];
  stake: number;
  totalOdds: number;
  potentialPayout: number;
  impliedProbability: number;
  expectedValue: number;
}

const availableBets: ParlayLeg[] = [
  { id: '1', game: 'Lakers vs Warriors', team: 'Lakers', bet: 'Moneyline', odds: 110 },
  { id: '2', game: 'Lakers vs Warriors', team: 'Warriors', bet: 'Moneyline', odds: -130 },
  { id: '3', game: 'Celtics vs Heat', team: 'Celtics', bet: 'Spread -4.5', odds: -110 },
  { id: '4', game: 'Celtics vs Heat', team: 'Heat', bet: 'Spread +4.5', odds: -110 },
  { id: '5', game: 'Nuggets vs Suns', team: 'Both Teams', bet: 'Over 218.5', odds: -105 },
  { id: '6', game: 'Nuggets vs Suns', team: 'Both Teams', bet: 'Under 218.5', odds: -115 },
];

export const ParlaysTab: React.FC = () => {
  const { config } = useWidgetStore();
  const [parlay, setParlay] = useState<ParlayBuilder>({
    legs: [],
    stake: 100,
    totalOdds: 0,
    potentialPayout: 0,
    impliedProbability: 0,
    expectedValue: 0
  });
  const [showOptimization, setShowOptimization] = useState(false);

  const addLegToParlay = (leg: ParlayLeg) => {
    if (parlay.legs.find(l => l.id === leg.id)) return;
    
    const newLegs = [...parlay.legs, leg];
    updateParlayCalculations(newLegs, parlay.stake);
  };

  const removeLegFromParlay = (legId: string) => {
    const newLegs = parlay.legs.filter(l => l.id !== legId);
    updateParlayCalculations(newLegs, parlay.stake);
  };

  const updateStake = (newStake: number) => {
    updateParlayCalculations(parlay.legs, newStake);
  };

  const updateParlayCalculations = (legs: ParlayLeg[], stake: number) => {
    if (legs.length === 0) {
      setParlay(prev => ({
        ...prev,
        legs,
        stake,
        totalOdds: 0,
        potentialPayout: 0,
        impliedProbability: 0,
        expectedValue: 0
      }));
      return;
    }

    // Calculate combined odds
    let combinedDecimalOdds = 1;
    let combinedImpliedProb = 1;
    
    legs.forEach(leg => {
      const decimalOdds = leg.odds > 0 ? (leg.odds / 100) + 1 : (100 / Math.abs(leg.odds)) + 1;
      const impliedProb = leg.odds > 0 ? 100 / (leg.odds + 100) : Math.abs(leg.odds) / (Math.abs(leg.odds) + 100);
      
      combinedDecimalOdds *= decimalOdds;
      combinedImpliedProb *= impliedProb;
    });

    const potentialPayout = stake * combinedDecimalOdds;
    const profit = potentialPayout - stake;
    const americanOdds = combinedDecimalOdds >= 2 ? 
      Math.round((combinedDecimalOdds - 1) * 100) : 
      Math.round(-100 / (combinedDecimalOdds - 1));

    // Simple EV calculation (would be more sophisticated with real data)
    const expectedValue = (combinedImpliedProb * profit) - ((1 - combinedImpliedProb) * stake);
    const expectedValuePercent = (expectedValue / stake) * 100;

    setParlay({
      legs,
      stake,
      totalOdds: americanOdds,
      potentialPayout,
      impliedProbability: combinedImpliedProb * 100,
      expectedValue: expectedValuePercent
    });
  };

  const clearParlay = () => {
    setParlay({
      legs: [],
      stake: 100,
      totalOdds: 0,
      potentialPayout: 0,
      impliedProbability: 0,
      expectedValue: 0
    });
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5" style={{ color: config.colors.accent }} />
            Parlay Builder
          </h2>
          <p className="text-gray-400 text-sm">
            Combine multiple bets for higher payouts
          </p>
        </div>
        <HelpTooltip 
          content="Parlays combine multiple bets into one. All legs must win for the parlay to pay out, but odds multiply for bigger returns."
          position="left"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Bets */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="w-4 h-4" />
            Available Bets
          </h3>
          
          <div className="space-y-2">
            {availableBets.map((bet) => (
              <motion.div
                key={bet.id}
                className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                onClick={() => addLegToParlay(bet)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium text-sm">{bet.game}</p>
                    <p className="text-gray-400 text-xs">{bet.team} - {bet.bet}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{formatOdds(bet.odds)}</span>
                    <Plus className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Parlay Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Your Parlay ({parlay.legs.length} legs)
            </h3>
            {parlay.legs.length > 0 && (
              <button
                onClick={clearParlay}
                className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {/* Parlay Legs */}
          <div className="space-y-2">
            <AnimatePresence>
              {parlay.legs.map((leg, index) => (
                <motion.div
                  key={leg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-700 rounded-lg p-3 border border-gray-600"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium text-sm">{leg.game}</p>
                      <p className="text-gray-300 text-xs">{leg.team} - {leg.bet}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{formatOdds(leg.odds)}</span>
                      <button
                        onClick={() => removeLegFromParlay(leg.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {parlay.legs.length === 0 && (
            <div className="bg-gray-800 rounded-lg p-6 text-center border-2 border-dashed border-gray-600">
              <Calculator className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">Add bets to build your parlay</p>
              <p className="text-gray-500 text-sm">Click on available bets to add them</p>
            </div>
          )}

          {/* Stake Input */}
          {parlay.legs.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-2">Stake Amount</label>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={parlay.stake}
                    onChange={(e) => updateStake(Number(e.target.value))}
                    className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 w-full"
                    min="1"
                  />
                </div>
              </div>

              {/* Calculations */}
              <div className="space-y-3 border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Odds:</span>
                  <span className="text-white font-semibold">{formatOdds(parlay.totalOdds)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Implied Probability:</span>
                  <span className="text-white">{parlay.impliedProbability.toFixed(1)}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Potential Payout:</span>
                  <span className="text-green-400 font-semibold">${parlay.potentialPayout.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-1">
                    Expected Value:
                    <HelpTooltip content="Expected value shows if this bet is theoretically profitable over time" />
                  </span>
                  <span className={`font-semibold ${parlay.expectedValue > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {parlay.expectedValue > 0 ? '+' : ''}{parlay.expectedValue.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Optimization */}
              <button
                onClick={() => setShowOptimization(!showOptimization)}
                className="w-full py-2 px-4 rounded border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Nova AI Optimization
              </button>

              <AnimatePresence>
                {showOptimization && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-700 rounded p-3 space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-white text-sm font-semibold">AI Recommendation</p>
                        <p className="text-gray-300 text-xs">
                          Consider reducing stake to $75 for optimal Kelly Criterion sizing based on your bankroll.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-white text-sm font-semibold">Risk Assessment</p>
                        <p className="text-gray-300 text-xs">
                          High-risk parlay. Individual leg confidence: 78%, 65%, 71%
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Place Bet Button */}
              <button
                className="w-full py-3 px-4 rounded font-semibold text-white transition-colors"
                style={{ backgroundColor: config.colors.accent }}
              >
                Place Parlay Bet
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-white font-semibold text-sm mb-2">Parlay Tips</p>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• All legs must win for the parlay to pay out</li>
              <li>• Odds multiply together, increasing both risk and reward</li>
              <li>• Nova AI analyzes correlations between legs</li>
              <li>• Consider limiting parlays to 2-4 legs for better success rates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};