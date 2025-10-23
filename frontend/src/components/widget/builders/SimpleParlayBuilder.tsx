import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, DollarSign, Trophy, Target, CheckCircle, Star, TrendingUp, Users } from 'lucide-react';
import { betManagementService, BetLeg, Parlay } from '../../../services/betManagementService';
import { getFeaturedParlays } from '../../../services/preloadedBetsService';
import { formatNumber, formatCurrency, formatPercentage } from '../../../utils/numberFormatting';

interface ParlayBuilderProps {
  className?: string;
  onBetPlaced?: (betSlipId: string) => void;
  prePopulatedParlay?: {
    title: string;
    legs: string[];
    totalOdds: number;
    reasoning: string;
  } | null;
}

export const SimpleParlayBuilder: React.FC<ParlayBuilderProps> = ({
  className = '',
  onBetPlaced,
  prePopulatedParlay
}) => {
  const [currentParlay, setCurrentParlay] = useState<Parlay | null>(null);
  const [stake, setStake] = useState<string>('10');
  const [isPlacing, setIsPlacing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAvailableParlays, setShowAvailableParlays] = useState(true);
  const [featuredParlays] = useState(() => getFeaturedParlays());

  useEffect(() => {
    // Get current bet slip and find active parlay
    const betSlip = betManagementService.getCurrentBetSlip();
    const activeParlay = betSlip.parlays.find(p => p.status === 'pending');
    setCurrentParlay(activeParlay || null);
  }, []);

  // Handle pre-populated parlay from AI suggestions
  useEffect(() => {
    if (prePopulatedParlay) {
      console.log('🤖 Pre-populating parlay with AI suggestion:', prePopulatedParlay);
      
      // Clear any existing parlay
      betManagementService.clearBetSlip();
      
      // Convert suggestion legs to bet legs (simplified)
      const betLegs: BetLeg[] = prePopulatedParlay.legs.map((leg, index) => ({
        type: 'moneyline' as const,
        gameId: `suggested_${index}`,
        team: leg.split(' (')[0], // Extract team name before odds
        opponent: 'vs TBD',
        description: leg, // Use the full leg description
        selection: leg.split(' (')[0], // Extract team name as selection
        odds: -110, // Simplified for demo
        sport: 'Mixed'
      }));

      // Create parlay by adding each leg (this creates the parlay if needed)
      let parlayId = '';
      betLegs.forEach(leg => {
        parlayId = betManagementService.addLegToParlay(leg);
      });
      console.log('✅ Created pre-populated parlay:', parlayId);
      
      // Update current parlay state
      const updatedBetSlip = betManagementService.getCurrentBetSlip();
      const newParlay = updatedBetSlip.parlays.find(p => p.id === parlayId);
      setCurrentParlay(newParlay || null);
      setShowAvailableParlays(false); // Hide featured parlays when using AI suggestion
    }
  }, [prePopulatedParlay]);

  const handleAddSampleBet = () => {
    try {
      // Add a sample bet to demonstrate functionality
      const sampleBets = [
        {
          type: 'moneyline' as const,
          gameId: 'sample_game_1',
          team: 'Los Angeles Lakers',
          opponent: 'Boston Celtics',
          description: 'Los Angeles Lakers ML',
          selection: 'Los Angeles Lakers',
          odds: -110,
          sport: 'basketball_nba'
        },
        {
          type: 'spread' as const,
          gameId: 'sample_game_2',
          team: 'Kansas City Chiefs',
          opponent: 'Buffalo Bills',
          description: 'Kansas City Chiefs -3.5',
          selection: 'home',
          line: -3.5,
          odds: -105,
          sport: 'americanfootball_nfl'
        },
        {
          type: 'total' as const,
          gameId: 'sample_game_3',
          team: 'Golden State Warriors',
          opponent: 'Phoenix Suns',
          description: 'Over 225.5 Total Points',
          selection: 'over',
          line: 225.5,
          odds: -110,
          sport: 'basketball_nba'
        }
      ];

      const randomBet = sampleBets[Math.floor(Math.random() * sampleBets.length)];
      const parlayId = betManagementService.addLegToParlay(randomBet);
      
      // Refresh current parlay
      const betSlip = betManagementService.getCurrentBetSlip();
      const activeParlay = betSlip.parlays.find(p => p.id === parlayId);
      setCurrentParlay(activeParlay || null);
      setShowAvailableParlays(false); // Hide available parlays when building
      
    } catch (error) {
      console.error('Error adding bet:', error);
    }
  };
  
  const handleSelectFeaturedParlay = (featuredParlay: any) => {
    try {
      // Add all bets from featured parlay
      let parlayId = null;
      
      featuredParlay.bets.forEach((bet: any) => {
        parlayId = betManagementService.addLegToParlay(bet);
      });
      
      if (parlayId) {
        // Update stake to match featured parlay
        betManagementService.updateParlayStake(parlayId, featuredParlay.stake);
        setStake(featuredParlay.stake.toString());
        
        // Refresh current parlay
        const betSlip = betManagementService.getCurrentBetSlip();
        const activeParlay = betSlip.parlays.find(p => p.id === parlayId);
        setCurrentParlay(activeParlay || null);
        setShowAvailableParlays(false);
      }
    } catch (error) {
      console.error('Error selecting featured parlay:', error);
    }
  };

  const handleRemoveLeg = (legId: string) => {
    if (currentParlay) {
      try {
        betManagementService.removeLegFromParlay(currentParlay.id, legId);
        
        // Refresh current parlay
        const betSlip = betManagementService.getCurrentBetSlip();
        const activeParlay = betSlip.parlays.find(p => p.id === currentParlay.id);
        setCurrentParlay(activeParlay || null);
      } catch (error) {
        console.error('Error removing leg:', error);
      }
    }
  };

  const handleStakeChange = (value: string) => {
    setStake(value);
    const numericStake = parseFloat(value) || 0;
    
    if (currentParlay && numericStake > 0) {
      betManagementService.updateParlayStake(currentParlay.id, numericStake);
      
      // Refresh parlay
      const betSlip = betManagementService.getCurrentBetSlip();
      const activeParlay = betSlip.parlays.find(p => p.id === currentParlay.id);
      setCurrentParlay(activeParlay || null);
    }
  };

  const handlePlaceBet = async () => {
    if (!currentParlay || currentParlay.legs.length === 0) return;
    
    setIsPlacing(true);
    
    try {
      // Update stake one more time
      const numericStake = parseFloat(stake) || 0;
      if (numericStake <= 0) {
        alert('Please enter a valid stake amount');
        setIsPlacing(false);
        return;
      }
      
      betManagementService.updateParlayStake(currentParlay.id, numericStake);
      
      // Place the bet
      const betSlipId = betManagementService.placeBetSlip();
      
      // Show success message
      setSuccessMessage(`Parlay placed successfully! Bet Slip #${betSlipId.slice(-6)}`);
      setCurrentParlay(null);
      setStake('10');
      
      // Call callback if provided
      if (onBetPlaced) {
        onBetPlaced(betSlipId);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Failed to place bet. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  return (
    <div className={`bg-slate-800/60 backdrop-blur-sm rounded-lg lg:rounded-xl border border-slate-600/40 p-4 lg:p-6 ${className}`}>
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 lg:mb-6 gap-3 sm:gap-0">
        <div className="flex items-center space-x-2 lg:space-x-3">
          <Trophy className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-400" />
          <h3 className="text-lg lg:text-xl font-bold text-white">Parlay Builder</h3>
        </div>
        <button
          onClick={handleAddSampleBet}
          className="flex items-center space-x-2 px-3 lg:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Sample Bet</span>
          <span className="sm:hidden">Add Bet</span>
        </button>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 bg-green-600/20 border border-green-600/40 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-medium">{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Parlay */}
      {currentParlay && currentParlay.legs.length > 0 ? (
        <div className="space-y-4">
          {/* Parlay Legs */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-400" />
              <span>Parlay Legs ({currentParlay.legs.length})</span>
            </h4>
            
            {currentParlay.legs.map((leg, index) => (
              <motion.div
                key={leg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-700/40 rounded-lg p-4 border border-slate-600/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded font-medium">
                        Leg {index + 1}
                      </span>
                      <span className="text-xs text-slate-400 uppercase">{leg.type}</span>
                    </div>
                    <h5 className="text-white font-semibold mb-1">{leg.description}</h5>
                    <div className="flex items-center space-x-4 text-sm text-slate-300">
                      <span>{leg.team} vs {leg.opponent}</span>
                      <span className="text-blue-300 font-medium">{formatOdds(leg.odds)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveLeg(leg.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Parlay Summary */}
          <div className="bg-slate-700/60 rounded-lg p-4 border border-slate-500/40">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Stake Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    value={stake}
                    onChange={(e) => handleStakeChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    min="1"
                    step="1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Combined Odds
                </label>
                <div className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white font-bold">
                  {formatOdds(currentParlay.combinedOdds)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 p-3 bg-slate-600/40 rounded-lg">
              <span className="text-slate-300">Potential Payout:</span>
              <span className="text-xl font-bold text-green-400">
                ${currentParlay.potentialPayout.toFixed(2)}
              </span>
            </div>

            <motion.button
              onClick={handlePlaceBet}
              disabled={isPlacing || parseFloat(stake) <= 0}
              whileHover={{ scale: isPlacing ? 1 : 1.02 }}
              whileTap={{ scale: isPlacing ? 1 : 0.98 }}
              className={`w-full py-4 rounded-xl font-bold transition-all duration-300 relative overflow-hidden ${
                isPlacing || parseFloat(stake) <= 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Animated shimmer effect during loading */}
              {isPlacing && (
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              )}
              
              <AnimatePresence mode="wait">
                {isPlacing ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-center space-x-3 relative z-10"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Processing Your Parlay...</span>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      💰
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-center space-x-2"
                  >
                    <DollarSign className="w-5 h-5" />
                    <span>Place Parlay - ${stake}</span>
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🚀
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      ) : showAvailableParlays ? (
        /* Featured Parlays - No Empty State */
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h4 className="text-2xl font-bold text-white mb-2">Popular Parlays Ready to Bet</h4>
            <p className="text-slate-300 mb-4">
              Hand-picked combinations from our experts. Click to add to your slip!
            </p>
          </div>
          
          {/* Featured Parlays Grid - Responsive */}
          <div className="grid gap-3 lg:gap-4">
            {featuredParlays.map((parlay, index) => (
              <motion.div
                key={parlay.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-700/40 rounded-lg lg:rounded-xl p-3 lg:p-5 border border-slate-600/40 hover:border-blue-500/60 transition-all cursor-pointer group"
                onClick={() => handleSelectFeaturedParlay(parlay)}
              >
                {/* Parlay Header - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 lg:mb-4 gap-2 sm:gap-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <Trophy className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h5 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {parlay.title}
                      </h5>
                      <p className="text-sm text-slate-400">{parlay.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <Users className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400 font-medium">
                        {formatPercentage(parlay.popularity, false)}% popular
                      </span>
                    </div>
                    <div className="text-lg font-bold text-white">
                      {parlay.totalOdds > 0 ? '+' : ''}{parlay.totalOdds}
                    </div>
                  </div>
                </div>
                
                {/* Bet Legs Preview - Mobile Optimized */}
                <div className="space-y-1 lg:space-y-2 mb-3 lg:mb-4">
                  {parlay.bets.slice(0, 3).map((bet: any, betIndex: number) => (
                    <div key={betIndex} className="flex items-center justify-between text-xs lg:text-sm">
                      <span className="text-slate-300 truncate flex-1 mr-2">
                        {bet.description}
                      </span>
                      <span className="text-blue-300 font-medium">
                        {bet.odds > 0 ? '+' : ''}{bet.odds}
                      </span>
                    </div>
                  ))}
                  {parlay.bets.length > 3 && (
                    <div className="text-xs text-slate-500 text-center">
                      +{parlay.bets.length - 3} more legs
                    </div>
                  )}
                </div>
                
                {/* Payout Info - Mobile Responsive */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-2 lg:p-3 bg-slate-800/50 rounded-lg gap-2 sm:gap-0">
                  <div className="text-xs lg:text-sm text-center sm:text-left">
                    <span className="text-slate-400">Stake: </span>
                    <span className="text-white font-medium">{formatCurrency(parlay.stake)}</span>
                  </div>
                  <div className="text-xs lg:text-sm text-center sm:text-right">
                    <span className="text-slate-400">Potential: </span>
                    <span className="text-green-400 font-bold">{formatCurrency(parlay.potentialPayout)}</span>
                  </div>
                </div>
                
                {/* Add Button */}
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center space-x-2 text-blue-400 group-hover:text-blue-300 font-medium">
                    <Plus className="w-4 h-4" />
                    <span>Click to Add Parlay</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Custom Parlay Option */}
          <div className="text-center pt-6 border-t border-slate-600/40">
            <p className="text-slate-400 mb-4">Want to build your own custom parlay?</p>
            <button
              onClick={() => {
                handleAddSampleBet();
                setShowAvailableParlays(false);
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors font-medium mx-auto shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Build Custom Parlay</span>
            </button>
          </div>
        </div>
      ) : (
        /* Fallback Empty State (rarely shown) */
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-white mb-2">Start Building Your Parlay</h4>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Add multiple bets to create a parlay. Higher risk, higher reward!
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setShowAvailableParlays(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium mx-auto"
            >
              <Star className="w-5 h-5" />
              <span>View Popular Parlays</span>
            </button>
            <button
              onClick={handleAddSampleBet}
              className="flex items-center space-x-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add Custom Bet</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};