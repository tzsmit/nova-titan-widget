/**
 * Filter Bar Component
 * 
 * Features:
 * - Sport selection (NBA, NFL, NHL, MLB, etc.)
 * - Date range picker (Today, Tomorrow, This Week)
 * - Bookmaker filter (multi-select)
 * - State filter (legal betting states)
 * - Market type filter (Moneyline, Spread, Totals)
 * - Clear all filters button
 * - Active filter count badge
 * 
 * Phase 3: Frontend UI
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Calendar, Target, MapPin, TrendingUp } from 'lucide-react';
import { useParlayStore } from '../../store/parlayStore';

export interface FilterOptions {
  sports: string[];
  dateRange: 'today' | 'tomorrow' | 'week' | 'all';
  bookmakers: string[];
  states: string[];
  markets: string[];
}

export interface FilterBarProps {
  onFilterChange?: (filters: FilterOptions) => void;
  showStateFilter?: boolean;
  showMarketFilter?: boolean;
}

// Available sports
const SPORTS = [
  { key: 'basketball_nba', name: 'NBA', icon: '🏀' },
  { key: 'americanfootball_nfl', name: 'NFL', icon: '🏈' },
  { key: 'icehockey_nhl', name: 'NHL', icon: '🏒' },
  { key: 'baseball_mlb', name: 'MLB', icon: '⚾' },
  { key: 'soccer_epl', name: 'EPL', icon: '⚽' },
  { key: 'basketball_ncaab', name: 'NCAAB', icon: '🏀' },
  { key: 'americanfootball_ncaaf', name: 'NCAAF', icon: '🏈' },
];

// Available bookmakers
const BOOKMAKERS = [
  { key: 'draftkings', name: 'DraftKings' },
  { key: 'fanduel', name: 'FanDuel' },
  { key: 'betmgm', name: 'BetMGM' },
  { key: 'caesars', name: 'Caesars' },
  { key: 'pointsbet', name: 'PointsBet' },
  { key: 'betrivers', name: 'BetRivers' },
  { key: 'wynnbet', name: 'WynnBET' },
];

// Legal betting states
const STATES = [
  'AZ', 'CO', 'CT', 'IL', 'IN', 'IA', 'KS', 'LA', 'MI', 'NJ', 'NY', 'PA', 'TN', 'VA', 'WV', 'WY'
];

// Market types
const MARKETS = [
  { key: 'h2h', name: 'Moneyline' },
  { key: 'spreads', name: 'Spread' },
  { key: 'totals', name: 'Totals (O/U)' },
  { key: 'player_props', name: 'Player Props' },
  { key: 'team_props', name: 'Team Props' },
];

const FilterBar: React.FC<FilterBarProps> = ({
  onFilterChange,
  showStateFilter = true,
  showMarketFilter = true,
}) => {
  const { selectedSport, setSelectedSport } = useParlayStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    sports: [selectedSport],
    dateRange: 'today',
    bookmakers: [],
    states: [],
    markets: [],
  });

  // Calculate active filter count
  const activeFilterCount = 
    (filters.sports.length > 1 ? 1 : 0) +
    (filters.dateRange !== 'today' ? 1 : 0) +
    (filters.bookmakers.length > 0 ? 1 : 0) +
    (filters.states.length > 0 ? 1 : 0) +
    (filters.markets.length > 0 ? 1 : 0);

  // Handle filter change
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (key === 'sports' && value.length === 1) {
      setSelectedSport(value[0]);
    }
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Toggle sport selection
  const toggleSport = (sportKey: string) => {
    const newSports = filters.sports.includes(sportKey)
      ? filters.sports.filter(s => s !== sportKey)
      : [...filters.sports, sportKey];
    
    if (newSports.length > 0) {
      handleFilterChange('sports', newSports);
    }
  };

  // Toggle bookmaker selection
  const toggleBookmaker = (bookmakerKey: string) => {
    const newBookmakers = filters.bookmakers.includes(bookmakerKey)
      ? filters.bookmakers.filter(b => b !== bookmakerKey)
      : [...filters.bookmakers, bookmakerKey];
    
    handleFilterChange('bookmakers', newBookmakers);
  };

  // Toggle state selection
  const toggleState = (state: string) => {
    const newStates = filters.states.includes(state)
      ? filters.states.filter(s => s !== state)
      : [...filters.states, state];
    
    handleFilterChange('states', newStates);
  };

  // Toggle market selection
  const toggleMarket = (marketKey: string) => {
    const newMarkets = filters.markets.includes(marketKey)
      ? filters.markets.filter(m => m !== marketKey)
      : [...filters.markets, marketKey];
    
    handleFilterChange('markets', newMarkets);
  };

  // Clear all filters
  const clearAllFilters = () => {
    const defaultFilters: FilterOptions = {
      sports: [selectedSport],
      dateRange: 'today',
      bookmakers: [],
      states: [],
      markets: [],
    };
    setFilters(defaultFilters);
    if (onFilterChange) {
      onFilterChange(defaultFilters);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-blue-400" />
          <h3 className="text-white font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            {isExpanded ? <X size={20} /> : <Filter size={20} />}
          </button>
        </div>
      </div>

      {/* Sports Quick Filter (Always Visible) */}
      <div className="flex flex-wrap gap-2 mb-3">
        {SPORTS.map((sport) => (
          <button
            key={sport.key}
            onClick={() => toggleSport(sport.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              filters.sports.includes(sport.key)
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span>{sport.icon}</span>
            <span>{sport.name}</span>
          </button>
        ))}
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-4 border-t border-gray-700"
          >
            {/* Date Range Filter */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-gray-400" />
                <label className="text-sm text-gray-300 font-medium">Date Range</label>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(['today', 'tomorrow', 'week', 'all'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => handleFilterChange('dateRange', range)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      filters.dateRange === range
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookmaker Filter */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-gray-400" />
                <label className="text-sm text-gray-300 font-medium">
                  Bookmakers {filters.bookmakers.length > 0 && `(${filters.bookmakers.length})`}
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {BOOKMAKERS.map((bookmaker) => (
                  <button
                    key={bookmaker.key}
                    onClick={() => toggleBookmaker(bookmaker.key)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      filters.bookmakers.includes(bookmaker.key)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {bookmaker.name}
                  </button>
                ))}
              </div>
            </div>

            {/* State Filter */}
            {showStateFilter && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-gray-400" />
                  <label className="text-sm text-gray-300 font-medium">
                    States {filters.states.length > 0 && `(${filters.states.length})`}
                  </label>
                </div>
                <div className="grid grid-cols-8 gap-2">
                  {STATES.map((state) => (
                    <button
                      key={state}
                      onClick={() => toggleState(state)}
                      className={`px-2 py-2 rounded text-sm font-medium transition-colors ${
                        filters.states.includes(state)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Market Filter */}
            {showMarketFilter && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-gray-400" />
                  <label className="text-sm text-gray-300 font-medium">
                    Markets {filters.markets.length > 0 && `(${filters.markets.length})`}
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {MARKETS.map((market) => (
                    <button
                      key={market.key}
                      onClick={() => toggleMarket(market.key)}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                        filters.markets.includes(market.key)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {market.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterBar;
