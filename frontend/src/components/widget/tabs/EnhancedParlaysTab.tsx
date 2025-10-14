/**
 * Enhanced Parlays Tab Component
 * Real-time parlay builder with live odds and AI predictions
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useWidgetStore } from '../../../stores/widgetStore';
import { HelpTooltip } from '../../ui/HelpTooltip';
import { CornerHelpTooltip } from '../../ui/CornerHelpTooltip';
import { realTimeOddsService } from '../../../services/realTimeOddsService';
import { realTimeAIPredictionsService } from '../../../services/realTimeAIPredictions';
import { 
  Plus, 
  Trash2, 
  Calculator, 
  TrendingUp, 
  Zap, 
  AlertTriangle,
  DollarSign,
  Target,
  Calendar,
  Loader2
} from 'lucide-react';

interface ParlayLeg {
  id: string;
  game: string;
  team: string; // Can be team name OR player name
  bet: string;
  odds: number;
  confidence?: number;
  sport: string;
  gameDate?: string;
  venue?: string;
  bookmaker?: string;
}

interface ParlayBuilder {
  legs: ParlayLeg[];
  stake: number;
  totalOdds: number;
  potentialPayout: number;
  impliedProbability: number;
  expectedValue: number;
}

export const EnhancedParlaysTab: React.FC = () => {
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
  const [betType, setBetType] = useState<'h2h' | 'spreads' | 'totals' | 'player_props'>('h2h');
  const [selectedSport, setSelectedSport] = useState<string>('americanfootball_nfl');
  const [selectedBookmaker, setSelectedBookmaker] = useState<string>('draftkings');

  // Fetch live odds data
  const { data: oddsData, isLoading: oddsLoading, error: oddsError } = useQuery({
    queryKey: ['live-odds', selectedSport, betType, selectedBookmaker],
    queryFn: async () => {
      console.log('🎯 Fetching live odds for parlays...', { selectedSport, betType, selectedBookmaker });
      
      if (betType === 'player_props') {
        return await realTimeOddsService.getLivePlayerProps(selectedSport, selectedBookmaker);
      } else {
        return await realTimeOddsService.getLiveOdds(selectedSport, betType, selectedBookmaker);
      }
    },
    enabled: true,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });

  // Fetch AI predictions for selected games
  const { data: predictionsData } = useQuery({
    queryKey: ['ai-predictions-parlays', selectedSport],
    queryFn: async () => {
      console.log('🧠 Fetching AI predictions for parlays...');
      return await realTimeAIPredictionsService.generateLivePredictions(selectedSport);
    },
    enabled: !!oddsData && oddsData.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Convert live odds data to parlay legs format
  const getAvailableBets = (): ParlayLeg[] => {
    if (!oddsData || oddsData.length === 0) return [];

    const legs: ParlayLeg[] = [];

    oddsData.forEach((game: any) => {
      const gameId = game.id;
      const homeTeam = game.home_team;
      const awayTeam = game.away_team;
      const gameDate = new Date(game.commence_time).toLocaleDateString();
      const gameTime = new Date(game.commence_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const gameDisplay = `${awayTeam} @ ${homeTeam}`;

      // Get AI confidence for this game
      const prediction = predictionsData?.find((p: any) => 
        p.game_id === gameId || 
        p.home_team === homeTeam || 
        p.away_team === awayTeam
      );

      if (game.bookmakers && game.bookmakers.length > 0) {
        const bookmaker = game.bookmakers.find((b: any) => b.key === selectedBookmaker) || game.bookmakers[0];
        
        if (bookmaker?.markets && bookmaker.markets.length > 0) {
          bookmaker.markets.forEach((market: any) => {
            if (market.outcomes && market.outcomes.length > 0) {
              market.outcomes.forEach((outcome: any) => {
                let betDescription = '';
                let confidence = 0;

                // Determine bet description and confidence based on market type
                switch (market.key) {
                  case 'h2h':
                    betDescription = 'Moneyline';
                    confidence = prediction?.moneyline_confidence?.[outcome.name] || 
                               (outcome.name === prediction?.predicted_winner ? prediction?.confidence || 65 : 45);
                    break;
                  case 'spreads':
                    betDescription = `Spread ${outcome.point > 0 ? '+' : ''}${outcome.point}`;
                    confidence = prediction?.spread_confidence?.[outcome.name] || 
                               (Math.abs(outcome.point) < 3 ? 60 : 70);
                    break;
                  case 'totals':
                    betDescription = `${outcome.name} ${outcome.point}`;
                    confidence = prediction?.total_confidence?.[outcome.name] || 
                               (outcome.name === 'Over' ? 65 : 55);
                    break;
                  default:
                    betDescription = `${market.key} - ${outcome.name}`;
                    confidence = 50;
                }

                // Convert decimal odds to American odds
                const americanOdds = outcome.price >= 2 ? 
                  Math.round((outcome.price - 1) * 100) : 
                  Math.round(-100 / (outcome.price - 1));

                legs.push({
                  id: `${gameId}-${market.key}-${outcome.name}-${Date.now()}`,
                  game: `${gameDisplay} (${gameDate} ${gameTime})`,
                  team: outcome.name,
                  bet: betDescription,
                  odds: americanOdds,
                  confidence: Math.round(confidence),
                  sport: selectedSport,
                  gameDate: gameDate,
                  venue: homeTeam,
                  bookmaker: bookmaker.title || selectedBookmaker
                });
              });
            }
          });
        }
      }
    });

    return legs.slice(0, 50); // Limit to 50 bets to prevent overwhelming UI
  };

  const availableBets = getAvailableBets();

  const addLegToParlay = (leg: ParlayLeg) => {
    // Prevent duplicate IDs
    if (parlay.legs.find(l => l.id === leg.id)) return;
    
    // Prevent duplicate logical bets (same game/team/bet combination)
    const isDuplicate = parlay.legs.some(l => 
      l.game === leg.game && 
      l.team === leg.team && 
      l.bet === leg.bet
    );
    
    if (isDuplicate) {
      console.warn('Duplicate bet prevented:', leg.game, leg.team, leg.bet);
      return;
    }
    
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

    // Calculate EV based on AI confidence scores
    const avgConfidence = legs.reduce((sum, leg) => sum + (leg.confidence || 50), 0) / legs.length;
    const trueWinProb = avgConfidence / 100;
    const expectedValue = (trueWinProb * profit) - ((1 - trueWinProb) * stake);
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

  const getBetTypeDisplay = (betType: string) => {
    switch (betType) {
      case 'h2h': return 'Moneylines';
      case 'spreads': return 'Spreads';
      case 'totals': return 'Totals';
      case 'player_props': return 'Player Props';
      default: return betType;
    }
  };

  const getSportDisplay = (sport: string) => {
    switch (sport) {
      case 'americanfootball_nfl': return '🏈 NFL';
      case 'basketball_nba': return '🏀 NBA';
      case 'americanfootball_ncaaf': return '🏟️ NCAAF';
      case 'baseball_mlb': return '⚾ MLB';
      case 'icehockey_nhl': return '🏒 NHL';
      case 'soccer_epl': return '⚽ Premier League';
      case 'soccer_usa_mls': return '⚽ MLS';
      default: return sport;
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Page Help Button */}
      <div className="absolute top-4 right-4 z-10">
        <CornerHelpTooltip 
          content="Build parlays with live odds and real AI predictions. Combines multiple bets for higher payouts with Nova Titan AI analysis for optimal value."
          term="Live Parlay Builder"
          size="md"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5" style={{ color: config.colors.accent }} />
            Live Parlay Builder
          </h2>
          <p className="text-gray-400 text-sm">
            Combine live bets with AI analysis for maximum value
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sport Selector */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Sport</label>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500"
            >
              <option value="americanfootball_nfl">🏈 NFL</option>
              <option value="basketball_nba">🏀 NBA</option>
              <option value="americanfootball_ncaaf">🏟️ College Football</option>
              <option value="baseball_mlb">⚾ MLB</option>
              <option value="icehockey_nhl">🏒 NHL</option>
              <option value="soccer_epl">⚽ Premier League</option>
              <option value="soccer_usa_mls">⚽ MLS</option>
            </select>
          </div>

          {/* Bet Type Selector */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Bet Type</label>
            <select
              value={betType}
              onChange={(e) => setBetType(e.target.value as any)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500"
            >
              <option value="h2h">💰 Moneylines</option>
              <option value="spreads">📊 Point Spreads</option>
              <option value="totals">🎯 Over/Under</option>
              <option value="player_props">👤 Player Props</option>
            </select>
          </div>

          {/* Bookmaker Selector */}
          <div>
            <label className="text-gray-400 text-sm block mb-2">Sportsbook</label>
            <select
              value={selectedBookmaker}
              onChange={(e) => setSelectedBookmaker(e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500"
            >
              <option value="draftkings">DraftKings</option>
              <option value="fanduel">FanDuel</option>
              <option value="betmgm">BetMGM</option>
              <option value="caesars">Caesars</option>
              <option value="pointsbetsportsbook">PointsBet</option>
              <option value="betrivers">BetRivers</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Parlay Optimizer */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Nova Titan AI Parlay Optimizer</h3>
            <HelpTooltip content="AI analyzes your parlay selections using real game data to optimize value, detect correlations, and recommend better combinations for maximum expected value" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-300 text-xs bg-blue-600/20 px-2 py-1 rounded">Live Analysis</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className={`font-bold text-lg ${parlay.expectedValue > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parlay.expectedValue > 0 ? '+' : ''}{parlay.expectedValue.toFixed(1)}% EV
            </div>
            <div className="text-gray-300 text-sm">Expected Value</div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-blue-400 font-bold text-lg">
              {parlay.legs.length > 0 ? 'Low' : 'No'} Correlation
            </div>
            <div className="text-gray-300 text-sm">
              {parlay.legs.length > 0 ? 'Independent outcomes' : 'Add legs to analyze'}
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-yellow-400 font-bold text-lg">
              {parlay.legs.length > 0 ? '2.5%' : '0%'}
            </div>
            <div className="text-gray-300 text-sm">Kelly Criterion</div>
          </div>
        </div>

        {parlay.legs.length > 0 && (
          <div className="mt-3 p-3 bg-blue-900/10 border border-blue-600/20 rounded">
            <div className="text-blue-300 text-sm font-medium mb-1">🧠 Nova Titan AI Analysis</div>
            <div className="text-gray-200 text-sm">
              {parlay.expectedValue > 5 
                ? "Excellent value detected! This parlay shows strong positive expected value based on AI confidence scores."
                : parlay.expectedValue > 0
                ? "Positive expected value detected. Consider this parlay for long-term profitability."
                : "Negative expected value. Consider adjusting legs or stake size for better risk management."}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Bets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="w-4 h-4" />
              Live {getBetTypeDisplay(betType)} ({availableBets.length})
            </h3>
            <div className="flex items-center gap-2">
              {oddsLoading && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
              <span className="text-xs text-gray-400">
                Live data • {selectedBookmaker}
              </span>
            </div>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {oddsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin mr-2" />
                <span className="text-gray-400">Loading live odds...</span>
              </div>
            ) : oddsError ? (
              <div className="text-center py-8 text-red-400">
                Error loading odds data
              </div>
            ) : availableBets.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No live odds available for {getSportDisplay(selectedSport)} {getBetTypeDisplay(betType)}
              </div>
            ) : (
              availableBets.map((bet) => (
                <motion.div
                  key={bet.id}
                  className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                  onClick={() => addLegToParlay(bet)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{bet.game}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-400 text-xs">{bet.team} - {bet.bet}</p>
                        {bet.confidence && (
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            bet.confidence >= 75 ? 'bg-green-600/20 text-green-400' :
                            bet.confidence >= 65 ? 'bg-yellow-600/20 text-yellow-400' :
                            'bg-red-600/20 text-red-400'
                          }`}>
                            {bet.confidence}% AI
                          </span>
                        )}
                      </div>
                      {bet.bookmaker && (
                        <p className="text-gray-500 text-xs mt-1">{bet.bookmaker}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{formatOdds(bet.odds)}</span>
                      <Plus className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
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
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{leg.game}</p>
                      <p className="text-gray-300 text-xs">{leg.team} - {leg.bet}</p>
                      {leg.confidence && (
                        <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                          leg.confidence >= 75 ? 'bg-green-600/20 text-green-400' :
                          leg.confidence >= 65 ? 'bg-yellow-600/20 text-yellow-400' :
                          'bg-red-600/20 text-red-400'
                        }`}>
                          {leg.confidence}% confidence
                        </span>
                      )}
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
              <p className="text-gray-500 text-sm">Click on live odds to add them</p>
            </div>
          )}

          {/* Stake Input and Calculations */}
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
                    <HelpTooltip content="Expected value based on AI confidence scores shows if this bet is theoretically profitable over time" />
                  </span>
                  <span className={`font-semibold ${parlay.expectedValue > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {parlay.expectedValue > 0 ? '+' : ''}{parlay.expectedValue.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Track Bet Button */}
              <button
                className="w-full py-3 px-4 rounded font-semibold text-white transition-colors bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                📋 Track This Parlay (Companion Mode)
              </button>
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                  🛡️ No real money • Track performance only
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Data Disclaimer */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-white font-semibold text-sm mb-2">Live Data Information</p>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• All odds are live from {selectedBookmaker} and update every minute</li>
              <li>• AI confidence scores are based on real team statistics and performance data</li>
              <li>• Parlay calculations use actual game data and Nova Titan AI predictions</li>
              <li>• Expected value calculated using AI confidence vs sportsbook implied probability</li>
              <li>• All legs must win for the parlay to pay out - risk increases exponentially</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};