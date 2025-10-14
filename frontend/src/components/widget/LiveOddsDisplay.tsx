/**
 * Live Odds Display Component - Simple integration for existing tabs
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { oddsAPI, LiveOdds, ArbitrageOpportunity } from '../../services/oddsAPI';
import { HelpTooltip } from '../ui/HelpTooltip';
import { TrendingUp, RefreshCw, Zap, Clock } from 'lucide-react';

interface LiveOddsDisplayProps {
  sport?: string;
  compact?: boolean;
}

interface BookmakerOption {
  id: string;
  name: string;
  description: string;
  featured?: boolean;
}

const BOOKMAKER_OPTIONS: BookmakerOption[] = [
  { id: 'all', name: 'All Bookmakers', description: 'Compare odds across all available sportsbooks' },
  { id: 'underdog', name: 'Underdog Fantasy', description: 'Pick\'em style fantasy sports betting', featured: true },
  { id: 'draftkings', name: 'DraftKings', description: 'Leading US sportsbook with comprehensive markets' },
  { id: 'fanduel', name: 'FanDuel', description: 'Popular sportsbook with competitive odds' },
  { id: 'betmgm', name: 'BetMGM', description: 'MGM\'s premium sportsbook platform' },
  { id: 'caesars', name: 'Caesars', description: 'Caesars Entertainment sportsbook' },
  { id: 'prizepicks', name: 'PrizePicks', description: 'Player prop pick\'em contests' },
  { id: 'comparison', name: 'Best Odds Comparison', description: 'Find the best available odds across all books' }
];

export const LiveOddsDisplay: React.FC<LiveOddsDisplayProps> = ({ 
  sport = 'americanfootball_nfl',
  compact = false
}) => {
  const [liveOdds, setLiveOdds] = useState<LiveOdds[]>([]);
  const [arbitrageOpps, setArbitrageOpps] = useState<ArbitrageOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedBookmaker, setSelectedBookmaker] = useState<string>('all');

  useEffect(() => {
    // Only load once when component mounts
    loadLiveOdds();
  }, []); // Removed sport dependency to prevent multiple calls

  const loadLiveOdds = async () => {
    setLoading(true);
    console.log('Loading odds - this should use cached data if available');
    try {
      const odds = await oddsAPI.getLiveOdds(sport);
      const arbitrage = await oddsAPI.getArbitrageOpportunities(sport);

      setLiveOdds(odds);
      setArbitrageOpps(arbitrage);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading live odds:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatOdds = (odds: number): string => {
    if (odds > 0) return `+${odds}`;
    return odds.toString();
  };

  const getBookmakerDisplay = (bookmaker: string): string => {
    const bookNames: Record<string, string> = {
      'draftkings': 'DraftKings',
      'fanduel': 'FanDuel',
      'underdog': 'Underdog Fantasy',
      'prizepicks': 'PrizePicks',
      'betmgm': 'BetMGM',
      'caesars': 'Caesars'
    };
    return bookNames[bookmaker] || bookmaker.toUpperCase();
  };

  const getFilteredOdds = (): LiveOdds[] => {
    if (selectedBookmaker === 'all' || selectedBookmaker === 'comparison') {
      return liveOdds;
    }
    return liveOdds.filter(odds => odds.bookmaker === selectedBookmaker);
  };

  const getBestOddsForComparison = () => {
    if (liveOdds.length === 0) return null;
    
    const moneylineOdds = liveOdds.filter(o => o.odds.moneyline);
    if (moneylineOdds.length === 0) return null;

    const bestHome = moneylineOdds.reduce((best, current) => 
      current.odds.moneyline!.home > best.odds.moneyline!.home ? current : best
    );
    
    const bestAway = moneylineOdds.reduce((best, current) => 
      current.odds.moneyline!.away > best.odds.moneyline!.away ? current : best
    );

    return { bestHome, bestAway };
  };

  if (compact) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-white font-semibold text-sm">Live Odds</span>
            <div className="relative group">
              <HelpTooltip content="Real-time odds from major sportsbooks including Underdog Fantasy, DraftKings, FanDuel" />
            </div>
          </div>
          <button
            onClick={loadLiveOdds}
            disabled={loading}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Bookmaker Selector */}
        <div className="mb-3">
          <select
            value={selectedBookmaker}
            onChange={(e) => setSelectedBookmaker(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded px-2 py-1 focus:border-blue-400 focus:outline-none"
          >
            {BOOKMAKER_OPTIONS.map(book => (
              <option key={book.id} value={book.id}>
                {book.featured ? '⭐ ' : ''}{book.name}
              </option>
            ))}
          </select>
        </div>

        {liveOdds.length > 0 && (() => {
          const filteredOdds = getFilteredOdds();
          const bestOdds = getBestOddsForComparison();
          
          if (selectedBookmaker === 'comparison' && bestOdds) {
            return (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-900/50 rounded p-2">
                  <div className="text-gray-400 mb-1">Best Home</div>
                  <div className="text-green-400 font-bold">{formatOdds(bestOdds.bestHome.odds.moneyline!.home)}</div>
                  <div className="text-gray-500">{getBookmakerDisplay(bestOdds.bestHome.bookmaker)}</div>
                </div>
                <div className="bg-gray-900/50 rounded p-2">
                  <div className="text-gray-400 mb-1">Best Away</div>
                  <div className="text-green-400 font-bold">{formatOdds(bestOdds.bestAway.odds.moneyline!.away)}</div>
                  <div className="text-gray-500">{getBookmakerDisplay(bestOdds.bestAway.bookmaker)}</div>
                </div>
              </div>
            );
          }
          
          return (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-900/50 rounded p-2">
                <div className="text-gray-400 mb-1">
                  {selectedBookmaker === 'all' ? 'Available' : BOOKMAKER_OPTIONS.find(b => b.id === selectedBookmaker)?.name}
                </div>
                <div className="text-green-400 font-bold">
                  {formatOdds(filteredOdds[0]?.odds?.moneyline?.home || -110)}
                </div>
                <div className="text-gray-500">
                  {selectedBookmaker === 'all' ? `${filteredOdds.length} books` : 'Live odds'}
                </div>
              </div>
              <div className="bg-gray-900/50 rounded p-2">
                <div className="text-gray-400 mb-1">Updated</div>
                <div className="text-blue-400 font-bold">{lastUpdate.toLocaleTimeString()}</div>
                <div className="text-gray-500">
                  {selectedBookmaker === 'all' ? 'All books' : 'Selected book'}
                </div>
              </div>
            </div>
          );
        })()}

        {arbitrageOpps.length > 0 && (
          <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-600/30 rounded">
            <div className="flex items-center gap-1 text-yellow-400 text-xs">
              <Zap className="w-3 h-3" />
              <span className="font-semibold">{arbitrageOpps.length} Arbitrage Alert!</span>
            </div>
            <div className="text-yellow-300 text-xs mt-1">
              {arbitrageOpps[0].profit} profit potential
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-2 text-gray-400 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1" />
            Loading live odds...
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <h3 className="text-white font-semibold">Live Sportsbook Comparison</h3>
          <div className="relative group">
            <HelpTooltip content="Real-time odds from 10+ major sportsbooks. Find the best lines and arbitrage opportunities." />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{lastUpdate.toLocaleTimeString()}</span>
          </div>
          
          <button
            onClick={loadLiveOdds}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors disabled:opacity-50"
            title="Refresh odds (rate limited to save API credits)"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="text-xs text-yellow-300 bg-yellow-900/20 px-2 py-1 rounded">
            💳 API calls are cached 5min
          </div>
        </div>
      </div>

      {/* Bookmaker Selector */}
      <div className="mb-4 flex items-center gap-3">
        <label className="text-gray-300 text-sm font-medium">Bookmaker:</label>
        <select
          value={selectedBookmaker}
          onChange={(e) => setSelectedBookmaker(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-white text-sm rounded px-3 py-2 focus:border-blue-400 focus:outline-none min-w-48"
        >
          {BOOKMAKER_OPTIONS.map(book => (
            <option key={book.id} value={book.id} title={book.description}>
              {book.featured ? '⭐ ' : ''}{book.name}
            </option>
          ))}
        </select>
        <div className="text-xs text-gray-400">
          {BOOKMAKER_OPTIONS.find(b => b.id === selectedBookmaker)?.description}
        </div>
      </div>

      {/* Arbitrage Opportunities */}
      {arbitrageOpps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border border-yellow-600/50 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">🚨 {arbitrageOpps.length} Arbitrage Opportunities!</span>
          </div>
          
          <div className="space-y-3">
            {arbitrageOpps.slice(0, 2).map((opp, index) => (
              <div key={index} className="bg-black/30 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">{opp.description}</span>
                  <span className="text-green-400 font-bold text-lg">{opp.profit}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-gray-300">
                    <div className="font-medium">{getBookmakerDisplay(opp.books.book1)}</div>
                    <div className="text-green-400">{formatOdds(opp.books.odds1)}</div>
                  </div>
                  <div className="text-gray-300">
                    <div className="font-medium">{getBookmakerDisplay(opp.books.book2)}</div>
                    <div className="text-green-400">{formatOdds(opp.books.odds2)}</div>
                  </div>
                </div>
                {opp.expiresIn && (
                  <div className="mt-2 text-xs text-yellow-300">
                    ⏰ Expires in ~{opp.expiresIn} minutes
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Odds Table */}
      {liveOdds.length > 0 && (() => {
        const filteredOdds = getFilteredOdds();
        const displayTitle = selectedBookmaker === 'all' ? 'All Sportsbooks' : 
                           selectedBookmaker === 'comparison' ? 'Best Odds Comparison' :
                           BOOKMAKER_OPTIONS.find(b => b.id === selectedBookmaker)?.name;
        
        return (
          <div className="bg-gray-900/50 rounded-lg overflow-hidden">
            <div className="p-3 bg-gray-800 border-b border-gray-600 flex items-center justify-between">
              <span className="text-white font-medium">{displayTitle}</span>
              <span className="text-xs text-gray-400">
                {filteredOdds.length} {filteredOdds.length === 1 ? 'book' : 'books'} showing
              </span>
            </div>
            
            <div className="p-4 space-y-3">
              {(selectedBookmaker === 'comparison' ? (() => {
                const bestOdds = getBestOddsForComparison();
                if (!bestOdds) return [];
                return [bestOdds.bestHome, bestOdds.bestAway];
              })() : filteredOdds).slice(0, 6).map((odds, index) => (
              <motion.div
                key={`${odds.bookmaker}-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between bg-gray-800/50 rounded p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="font-medium text-white">{getBookmakerDisplay(odds.bookmaker)}</div>
                  {odds.bookmaker === 'underdog' && (
                    <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-1 rounded">Featured</span>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {odds.odds.moneyline && (
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-1">Moneyline</div>
                      <div className="flex gap-2">
                        <span className="text-green-400 text-sm">{formatOdds(odds.odds.moneyline.home)}</span>
                        <span className="text-red-400 text-sm">{formatOdds(odds.odds.moneyline.away)}</span>
                      </div>
                    </div>
                  )}
                  
                  {odds.odds.spread && (
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-1">Spread</div>
                      <div className="text-blue-400 text-sm">
                        {odds.odds.spread.points > 0 ? '+' : ''}{odds.odds.spread.points}
                      </div>
                    </div>
                  )}
                  
                  {odds.odds.total && (
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-1">Total</div>
                      <div className="text-yellow-400 text-sm">
                        {odds.odds.total.points}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        );
      })()}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading live odds from major sportsbooks...</span>
          </div>
        </div>
      )}

      {liveOdds.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-400">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div>No live odds available</div>
          <div className="text-xs mt-1">Using your API key to fetch live data</div>
        </div>
      )}
    </div>
  );
};