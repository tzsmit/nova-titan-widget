/**
 * Bookmaker Picker Component
 * 
 * Features:
 * - Bookmaker logos and names
 * - State availability filtering
 * - Best line highlighting (green badge)
 * - Click to switch bookmaker
 * - Affiliate deep links with UTM tracking
 * - Side-by-side odds comparison
 * 
 * Real-time updates every 15-30 seconds
 * 
 * Phase 3: Frontend UI
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParlayStore } from '../../store/parlayStore';
import { Check, TrendingUp, AlertCircle, ExternalLink, Filter } from 'lucide-react';

// Bookmaker metadata with logos and state availability
export interface BookmakerMetadata {
  key: string;
  name: string;
  logo: string; // URL or data URI
  color: string; // Brand color
  affiliateUrl: string;
  states: string[]; // Available states
  features: string[]; // e.g., "Live Betting", "Same Game Parlay"
  rating: number; // 1-5 stars
}

// Sample bookmaker data (expand with real data)
const BOOKMAKER_DATA: BookmakerMetadata[] = [
  {
    key: 'draftkings',
    name: 'DraftKings',
    logo: '🟢', // Replace with actual logo URL
    color: '#53D337',
    affiliateUrl: 'https://sportsbook.draftkings.com',
    states: ['AZ', 'CO', 'CT', 'IL', 'IN', 'IA', 'KS', 'LA', 'MI', 'NJ', 'NY', 'PA', 'TN', 'VA', 'WV', 'WY'],
    features: ['Live Betting', 'Same Game Parlay', 'Early Cashout'],
    rating: 4.5,
  },
  {
    key: 'fanduel',
    name: 'FanDuel',
    logo: '🔵', // Replace with actual logo URL
    color: '#0066FF',
    affiliateUrl: 'https://sportsbook.fanduel.com',
    states: ['AZ', 'CO', 'CT', 'IL', 'IN', 'IA', 'KS', 'LA', 'MI', 'NJ', 'NY', 'PA', 'TN', 'VA', 'WV', 'WY'],
    features: ['Live Betting', 'Same Game Parlay', 'Boost Tokens'],
    rating: 4.7,
  },
  {
    key: 'betmgm',
    name: 'BetMGM',
    logo: '🟡', // Replace with actual logo URL
    color: '#B8860B',
    affiliateUrl: 'https://sports.betmgm.com',
    states: ['AZ', 'CO', 'IN', 'IA', 'MI', 'NJ', 'PA', 'TN', 'VA', 'WV', 'WY'],
    features: ['Live Betting', 'Parlay+', 'Easy Parlay'],
    rating: 4.3,
  },
  {
    key: 'caesars',
    name: 'Caesars Sportsbook',
    logo: '👑', // Replace with actual logo URL
    color: '#DAA520',
    affiliateUrl: 'https://sportsbook.caesars.com',
    states: ['AZ', 'CO', 'IL', 'IN', 'IA', 'LA', 'MI', 'NJ', 'NY', 'PA', 'TN', 'VA', 'WV'],
    features: ['Live Betting', 'Profit Boosts', 'Rewards'],
    rating: 4.1,
  },
  {
    key: 'pointsbet',
    name: 'PointsBet',
    logo: '🔴', // Replace with actual logo URL
    color: '#DC143C',
    affiliateUrl: 'https://pointsbet.com',
    states: ['CO', 'IL', 'IN', 'IA', 'MI', 'NJ', 'PA', 'VA', 'WV'],
    features: ['Live Betting', 'PointsBetting', 'Lightning Bets'],
    rating: 4.0,
  },
];

export interface BookmakerOdds {
  bookmakerKey: string;
  odds: number; // American odds
  lastUpdate: Date;
  isLive: boolean;
}

export interface BookmakerPickerProps {
  eventId: string;
  market: string;
  selection: string;
  currentBookmaker?: string;
  onSelect: (bookmakerKey: string) => void;
  userState?: string; // User's state for filtering
  showComparison?: boolean; // Show side-by-side comparison
}

const BookmakerPicker: React.FC<BookmakerPickerProps> = ({
  eventId,
  market,
  selection,
  currentBookmaker,
  onSelect,
  userState,
  showComparison = true,
}) => {
  const { selectedSport } = useParlayStore();
  const [showStateFilter, setShowStateFilter] = useState(false);
  const [filteredState, setFilteredState] = useState<string | null>(userState || null);

  // Mock odds data - Replace with actual API call using useRealTimeOdds
  // In production: const { odds } = useRealTimeOdds({ sport: selectedSport, eventId });
  const bookmakerOdds: BookmakerOdds[] = useMemo(() => [
    { bookmakerKey: 'draftkings', odds: -110, lastUpdate: new Date(), isLive: true },
    { bookmakerKey: 'fanduel', odds: -115, lastUpdate: new Date(), isLive: true },
    { bookmakerKey: 'betmgm', odds: -105, lastUpdate: new Date(), isLive: true },
    { bookmakerKey: 'caesars', odds: -120, lastUpdate: new Date(), isLive: true },
    { bookmakerKey: 'pointsbet', odds: -108, lastUpdate: new Date(), isLive: true },
  ], [eventId, market, selection]);

  // Find best odds
  const bestOdds = useMemo(() => {
    return bookmakerOdds.reduce((best, current) => {
      // For American odds, -105 is better than -110 (closer to even)
      // For positive odds, +150 is better than +120
      if (current.odds > 0 && best.odds > 0) {
        return current.odds > best.odds ? current : best;
      } else if (current.odds < 0 && best.odds < 0) {
        return current.odds > best.odds ? current : best;
      } else if (current.odds > 0) {
        return current;
      } else {
        return best;
      }
    }, bookmakerOdds[0]);
  }, [bookmakerOdds]);

  // Filter bookmakers by state availability
  const availableBookmakers = useMemo(() => {
    return BOOKMAKER_DATA.filter(bm => {
      if (!filteredState) return true;
      return bm.states.includes(filteredState);
    });
  }, [filteredState]);

  // Calculate savings vs worst line
  const calculateSavings = (odds: number): number => {
    const worstOdds = bookmakerOdds.reduce((worst, current) => {
      if (current.odds > 0 && worst.odds > 0) {
        return current.odds < worst.odds ? current : worst;
      } else if (current.odds < 0 && worst.odds < 0) {
        return current.odds < worst.odds ? current : worst;
      } else if (current.odds < 0) {
        return current;
      } else {
        return worst;
      }
    }, bookmakerOdds[0]);

    // Calculate implied probability difference
    const bestImplied = odds < 0 
      ? Math.abs(odds) / (Math.abs(odds) + 100) * 100
      : 100 / (odds + 100) * 100;
    const worstImplied = worstOdds.odds < 0
      ? Math.abs(worstOdds.odds) / (Math.abs(worstOdds.odds) + 100) * 100
      : 100 / (worstOdds.odds + 100) * 100;

    return worstImplied - bestImplied;
  };

  // Format odds for display
  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  // Generate affiliate link with UTM tracking
  const generateAffiliateLink = (bookmakerKey: string): string => {
    const bookmaker = BOOKMAKER_DATA.find(bm => bm.key === bookmakerKey);
    if (!bookmaker) return '#';

    const baseUrl = bookmaker.affiliateUrl;
    const utmParams = new URLSearchParams({
      utm_source: 'nova_titan',
      utm_medium: 'widget',
      utm_campaign: 'parlay_optimizer',
      utm_content: eventId,
    });

    return `${baseUrl}?${utmParams.toString()}`;
  };

  return (
    <div className="space-y-4">
      {/* Header with State Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Choose Your Bookmaker
        </h3>
        
        <button
          onClick={() => setShowStateFilter(!showStateFilter)}
          className="flex items-center gap-2 px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <Filter size={16} />
          {filteredState || 'All States'}
        </button>
      </div>

      {/* State Filter Dropdown */}
      <AnimatePresence>
        {showStateFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800 border border-gray-700 rounded-lg p-3"
          >
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setFilteredState(null)}
                className={`px-2 py-1 rounded text-sm transition-colors ${
                  !filteredState ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                All
              </button>
              {['AZ', 'CO', 'CT', 'IL', 'IN', 'IA', 'KS', 'LA', 'MI', 'NJ', 'NY', 'PA', 'TN', 'VA', 'WV', 'WY'].map(state => (
                <button
                  key={state}
                  onClick={() => setFilteredState(state)}
                  className={`px-2 py-1 rounded text-sm transition-colors ${
                    filteredState === state ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Best Line Banner */}
      {bestOdds && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-900/30 border border-green-700 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-green-400" />
            <span className="text-green-400 font-semibold">Best Available Line</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold">
                {BOOKMAKER_DATA.find(bm => bm.key === bestOdds.bookmakerKey)?.name}
              </p>
              <p className="text-2xl font-bold text-green-400">
                {formatOdds(bestOdds.odds)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Save vs worst line</p>
              <p className="text-lg font-bold text-green-400">
                {calculateSavings(bestOdds.odds).toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bookmaker Grid */}
      <div className="space-y-2">
        {availableBookmakers.map((bookmaker) => {
          const odds = bookmakerOdds.find(o => o.bookmakerKey === bookmaker.key);
          const isBest = odds?.bookmakerKey === bestOdds.bookmakerKey;
          const isCurrent = bookmaker.key === currentBookmaker;

          return (
            <motion.div
              key={bookmaker.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                isCurrent
                  ? 'border-blue-500 bg-blue-900/30'
                  : isBest
                  ? 'border-green-500 bg-gray-800'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }`}
              onClick={() => onSelect(bookmaker.key)}
            >
              {/* Best Line Badge */}
              {isBest && (
                <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  BEST
                </div>
              )}

              {/* Current Selection Checkmark */}
              {isCurrent && (
                <div className="absolute top-3 right-3">
                  <Check size={20} className="text-blue-400" />
                </div>
              )}

              <div className="flex items-center gap-4">
                {/* Logo */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${bookmaker.color}20`, color: bookmaker.color }}
                >
                  {bookmaker.logo}
                </div>

                {/* Bookmaker Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-semibold">{bookmaker.name}</h4>
                    {odds?.isLive && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < Math.floor(bookmaker.rating) ? 'text-yellow-400' : 'text-gray-600'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{bookmaker.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {bookmaker.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Odds Display */}
                <div className="text-right">
                  {odds ? (
                    <>
                      <p className={`text-2xl font-bold ${isBest ? 'text-green-400' : 'text-white'}`}>
                        {formatOdds(odds.odds)}
                      </p>
                      {showComparison && !isBest && (
                        <p className="text-xs text-gray-400 mt-1">
                          {(calculateSavings(bestOdds.odds) - calculateSavings(odds.odds)).toFixed(1)}% worse
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">N/A</p>
                  )}
                </div>
              </div>

              {/* Affiliate Link */}
              <a
                href={generateAffiliateLink(bookmaker.key)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-3 flex items-center justify-center gap-2 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
              >
                Open at {bookmaker.name}
                <ExternalLink size={14} />
              </a>
            </motion.div>
          );
        })}
      </div>

      {/* State Availability Warning */}
      {filteredState && availableBookmakers.length === 0 && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-400 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-semibold">No bookmakers available in {filteredState}</p>
              <p className="text-gray-400 text-sm mt-1">
                Try selecting a different state or view all bookmakers.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmakerPicker;
