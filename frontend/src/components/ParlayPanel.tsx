/**
 * ParlayPanel Component
 * Enhanced parlay builder with robust loading, error handling, and retry logic
 * Fixes: parlay page loading failures, conflict/duplicate selection prevention
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Plus, 
  X, 
  Trash2, 
  DollarSign, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
  Clock
} from 'lucide-react';
import { cn } from '../utils/cn';
import { Skeleton } from './ui/Skeleton';
import { ErrorUI } from './ui/ErrorUI';

// Types
export interface ParlayLeg {
  id: string;
  gameId: string;
  team: string;
  opponent: string;
  betType: 'moneyline' | 'spread' | 'total' | 'props';
  selection: string;
  odds: number;
  line?: number;
  description: string;
  sport: string;
  gameTime?: string;
  bookmaker?: string;
}

export interface ParlayData {
  id: string;
  legs: ParlayLeg[];
  stake: number;
  totalOdds: number;
  potentialPayout: number;
  status: 'building' | 'ready' | 'placed' | 'won' | 'lost';
  createdAt: Date;
}

export interface FeaturedParlay {
  id: string;
  title: string;
  description: string;
  legs: ParlayLeg[];
  confidence: number;
  expectedValue: number;
  stake: number;
  category: 'safe' | 'value' | 'longshot';
  reasoning?: string;
}

interface ParlayPanelProps {
  className?: string;
  onBetPlaced?: (parlayId: string) => void;
  onLegAdded?: (leg: ParlayLeg) => void;
  prePopulatedParlay?: {
    title: string;
    legs: string[];
    totalOdds: number;
    reasoning: string;
  } | null;
  maxLegs?: number;
  minStake?: number;
  maxStake?: number;
  // Loading and error handling
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  retryCount?: number;
  maxRetryAttempts?: number;
}

export const ParlayPanel: React.FC<ParlayPanelProps> = ({
  className,
  onBetPlaced,
  onLegAdded,
  prePopulatedParlay,
  maxLegs = 10,
  minStake = 1,
  maxStake = 1000,
  isLoading = false,
  error = null,
  onRetry,
  retryCount = 0,
  maxRetryAttempts = 3,
}) => {
  // State management
  const [parlay, setParlay] = useState<ParlayData | null>(null);
  const [stake, setStake] = useState<string>('10');
  const [featuredParlays, setFeaturedParlays] = useState<FeaturedParlay[]>([]);
  const [isPlacing, setIsPlacing] = useState(false);
  const [showFeatured, setShowFeatured] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Loading states
  const [isFetchingParlays, setIsFetchingParlays] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Auto-retry mechanism for failed fetches
  const handleAutoRetry = useCallback(() => {
    if (retryCount < maxRetryAttempts && onRetry) {
      console.log(`🔄 Auto-retry attempt ${retryCount + 1}/${maxRetryAttempts}`);
      setTimeout(() => {
        onRetry();
      }, Math.pow(2, retryCount) * 1000); // Exponential backoff
    }
  }, [retryCount, maxRetryAttempts, onRetry]);

  // Fetch featured parlays with retry logic
  const fetchFeaturedParlays = useCallback(async () => {
    setIsFetchingParlays(true);
    setFetchError(null);

    try {
      // Simulate API call - replace with actual service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock featured parlays data
      const mockParlays: FeaturedParlay[] = [
        {
          id: 'featured-1',
          title: 'Safe NFL Favorites',
          description: 'Low-risk parlay with strong favorites',
          confidence: 78,
          expectedValue: 1.24,
          stake: 25,
          category: 'safe',
          legs: [
            {
              id: 'leg-1',
              gameId: 'nfl-1',
              team: 'Kansas City Chiefs',
              opponent: 'Denver Broncos',
              betType: 'moneyline',
              selection: 'Chiefs ML',
              odds: -180,
              description: 'Chiefs to win outright',
              sport: 'americanfootball_nfl',
              gameTime: '2024-01-15T20:00:00Z'
            },
            {
              id: 'leg-2',
              gameId: 'nfl-2',
              team: 'Buffalo Bills',
              opponent: 'Miami Dolphins',
              betType: 'spread',
              selection: 'Bills -7',
              odds: -110,
              line: -7,
              description: 'Bills to win by 7+',
              sport: 'americanfootball_nfl',
              gameTime: '2024-01-15T21:00:00Z'
            }
          ],
          reasoning: 'Both teams are at home with strong offensive records'
        },
        {
          id: 'featured-2',
          title: 'NBA High Scoring',
          description: 'Over bets on high-pace matchups',
          confidence: 65,
          expectedValue: 2.15,
          stake: 15,
          category: 'value',
          legs: [
            {
              id: 'leg-3',
              gameId: 'nba-1',
              team: 'Golden State Warriors',
              opponent: 'Phoenix Suns',
              betType: 'total',
              selection: 'Over 235.5',
              odds: -105,
              line: 235.5,
              description: 'Total points Over 235.5',
              sport: 'basketball_nba',
              gameTime: '2024-01-15T22:00:00Z'
            }
          ]
        }
      ];

      setFeaturedParlays(mockParlays);
    } catch (error) {
      console.error('Failed to fetch featured parlays:', error);
      setFetchError('Failed to load featured parlays');
      handleAutoRetry();
    } finally {
      setIsFetchingParlays(false);
    }
  }, [handleAutoRetry]);

  // Initialize component
  useEffect(() => {
    fetchFeaturedParlays();
  }, [fetchFeaturedParlays]);

  // Handle pre-populated parlays
  useEffect(() => {
    if (prePopulatedParlay) {
      console.log('🤖 Creating parlay from AI suggestion:', prePopulatedParlay);
      
      // Convert AI suggestions to parlay legs
      const legs: ParlayLeg[] = prePopulatedParlay.legs.map((leg, index) => ({
        id: `ai-leg-${index}`,
        gameId: `ai-game-${index}`,
        team: leg.split(' (')[0] || leg,
        opponent: 'TBD',
        betType: 'moneyline',
        selection: leg,
        odds: -110,
        description: leg,
        sport: 'mixed'
      }));

      const newParlay: ParlayData = {
        id: `parlay-${Date.now()}`,
        legs,
        stake: 10,
        totalOdds: prePopulatedParlay.totalOdds,
        potentialPayout: 10 * (prePopulatedParlay.totalOdds / 100),
        status: 'building',
        createdAt: new Date()
      };

      setParlay(newParlay);
      setShowFeatured(false);
    }
  }, [prePopulatedParlay]);

  // Validation logic
  const validateParlay = useMemo(() => {
    const errors: string[] = [];
    
    if (!parlay || parlay.legs.length === 0) {
      errors.push('Add at least one leg to create a parlay');
    }

    if (parlay && parlay.legs.length > maxLegs) {
      errors.push(`Maximum ${maxLegs} legs allowed`);
    }

    // Check for duplicate selections (same game, different bets are allowed)
    if (parlay) {
      const gameIds = parlay.legs.map(leg => leg.gameId);
      const duplicateGames = gameIds.filter((id, index) => 
        gameIds.indexOf(id) !== index && 
        parlay.legs.filter(l => l.gameId === id).some((l1, i1) => 
          parlay.legs.some((l2, i2) => 
            i1 !== i2 && l1.gameId === l2.gameId && l1.betType === l2.betType
          )
        )
      );
      
      if (duplicateGames.length > 0) {
        errors.push('Duplicate bet types on the same game detected');
      }
    }

    // Conflicting selections (e.g., team ML and opponent ML)
    if (parlay) {
      const conflicts = parlay.legs.filter((leg1, index1) =>
        parlay.legs.some((leg2, index2) => 
          index1 !== index2 &&
          leg1.gameId === leg2.gameId &&
          leg1.betType === 'moneyline' &&
          leg2.betType === 'moneyline' &&
          leg1.team !== leg2.team
        )
      );

      if (conflicts.length > 0) {
        errors.push('Conflicting selections detected (both teams in same game)');
      }
    }

    const numericStake = parseFloat(stake);
    if (isNaN(numericStake) || numericStake < minStake || numericStake > maxStake) {
      errors.push(`Stake must be between $${minStake} and $${maxStake}`);
    }

    return errors;
  }, [parlay, stake, maxLegs, minStake, maxStake]);

  // Update validation errors
  useEffect(() => {
    setValidationErrors(validateParlay);
  }, [validateParlay]);

  // Utility functions
  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };

  const calculateTotalOdds = (legs: ParlayLeg[]): number => {
    return legs.reduce((total, leg) => {
      const decimal = leg.odds > 0 ? (leg.odds / 100) + 1 : (100 / Math.abs(leg.odds)) + 1;
      return total * decimal;
    }, 1);
  };

  const calculatePayout = (stake: number, totalOdds: number): number => {
    return stake * totalOdds;
  };

  // Event handlers
  const handleAddSampleLeg = () => {
    if (!parlay || parlay.legs.length >= maxLegs) return;

    const sampleLegs: Omit<ParlayLeg, 'id'>[] = [
      {
        gameId: 'sample-1',
        team: 'Los Angeles Lakers',
        opponent: 'Boston Celtics',
        betType: 'moneyline',
        selection: 'Lakers ML',
        odds: -150,
        description: 'Lakers to win',
        sport: 'basketball_nba'
      },
      {
        gameId: 'sample-2',
        team: 'Kansas City Chiefs',
        opponent: 'Buffalo Bills',
        betType: 'spread',
        selection: 'Chiefs -3',
        odds: -110,
        line: -3,
        description: 'Chiefs to win by 3+',
        sport: 'americanfootball_nfl'
      }
    ];

    const randomLeg = sampleLegs[Math.floor(Math.random() * sampleLegs.length)];
    const newLeg: ParlayLeg = {
      ...randomLeg,
      id: `leg-${Date.now()}`
    };

    const updatedLegs = [...(parlay?.legs || []), newLeg];
    const totalOdds = calculateTotalOdds(updatedLegs);
    const numericStake = parseFloat(stake) || 10;

    const updatedParlay: ParlayData = {
      id: parlay?.id || `parlay-${Date.now()}`,
      legs: updatedLegs,
      stake: numericStake,
      totalOdds,
      potentialPayout: calculatePayout(numericStake, totalOdds),
      status: 'building',
      createdAt: parlay?.createdAt || new Date()
    };

    setParlay(updatedParlay);
    setShowFeatured(false);
    
    if (onLegAdded) {
      onLegAdded(newLeg);
    }
  };

  const handleRemoveLeg = (legId: string) => {
    if (!parlay) return;

    const updatedLegs = parlay.legs.filter(leg => leg.id !== legId);
    
    if (updatedLegs.length === 0) {
      setParlay(null);
      setShowFeatured(true);
      return;
    }

    const totalOdds = calculateTotalOdds(updatedLegs);
    const numericStake = parseFloat(stake) || 10;

    const updatedParlay: ParlayData = {
      ...parlay,
      legs: updatedLegs,
      totalOdds,
      potentialPayout: calculatePayout(numericStake, totalOdds)
    };

    setParlay(updatedParlay);
  };

  const handleSelectFeaturedParlay = (featured: FeaturedParlay) => {
    const totalOdds = calculateTotalOdds(featured.legs);
    
    const newParlay: ParlayData = {
      id: `parlay-${Date.now()}`,
      legs: featured.legs,
      stake: featured.stake,
      totalOdds,
      potentialPayout: calculatePayout(featured.stake, totalOdds),
      status: 'building',
      createdAt: new Date()
    };

    setParlay(newParlay);
    setStake(featured.stake.toString());
    setShowFeatured(false);
  };

  const handleStakeChange = (value: string) => {
    setStake(value);
    
    if (parlay) {
      const numericStake = parseFloat(value) || 0;
      const updatedParlay: ParlayData = {
        ...parlay,
        stake: numericStake,
        potentialPayout: calculatePayout(numericStake, parlay.totalOdds)
      };
      setParlay(updatedParlay);
    }
  };

  const handlePlaceParlay = async () => {
    if (!parlay || validationErrors.length > 0) return;

    setIsPlacing(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update parlay status
      const placedParlay: ParlayData = {
        ...parlay,
        status: 'placed'
      };

      setSuccessMessage(`Parlay placed successfully! ${parlay.legs.length} legs, $${parlay.stake} stake`);
      setParlay(null);
      setStake('10');
      setShowFeatured(true);

      if (onBetPlaced) {
        onBetPlaced(placedParlay.id);
      }

      // Clear success message after 4 seconds
      setTimeout(() => setSuccessMessage(null), 4000);

    } catch (error) {
      console.error('Failed to place parlay:', error);
    } finally {
      setIsPlacing(false);
    }
  };

  const handleClearParlay = () => {
    setParlay(null);
    setStake('10');
    setShowFeatured(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('card-base p-4 space-y-4', className)}>
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="rectangle" width={100} height={32} />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="p-3 border rounded-lg space-y-2">
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="50%" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error) {
    return (
      <div className={cn('card-base', className)}>
        <ErrorUI
          type="fetch-error"
          message={error}
          onRetry={onRetry}
          size="md"
          variant="card"
          details={retryCount > 0 ? `Retry attempt ${retryCount}/${maxRetryAttempts}` : undefined}
        />
      </div>
    );
  }

  return (
    <div className={cn('card-base p-4 lg:p-6 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Trophy className="w-6 h-6 text-gold-500" />
          <h3 className="text-xl font-bold text-neutral-900">Parlay Builder</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {!showFeatured && parlay && (
            <button
              onClick={handleClearParlay}
              className="btn-base bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm px-3 py-2"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </button>
          )}
          
          <button
            onClick={handleAddSampleLeg}
            disabled={parlay && parlay.legs.length >= maxLegs}
            className="btn-base bg-primary-600 hover:bg-primary-700 text-white text-sm px-3 py-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Leg
          </button>
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-success-50 border border-success-200 rounded-lg flex items-center space-x-3"
          >
            <CheckCircle className="w-5 h-5 text-success-600" />
            <span className="text-success-700 font-medium">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Errors */}
      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {validationErrors.map((error, index) => (
              <div
                key={index}
                className="p-3 bg-error-50 border border-error-200 rounded-lg flex items-center space-x-2"
              >
                <AlertTriangle className="w-4 h-4 text-error-600" />
                <span className="text-error-700 text-sm">{error}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured Parlays */}
      {showFeatured && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-neutral-900">Featured Parlays</h4>
            {(isFetchingParlays || fetchError) && (
              <button
                onClick={fetchFeaturedParlays}
                disabled={isFetchingParlays}
                className="btn-base bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs px-2 py-1"
              >
                <RefreshCw className={cn('w-3 h-3 mr-1', isFetchingParlays && 'animate-spin')} />
                Retry
              </button>
            )}
          </div>

          {isFetchingParlays ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }, (_, i) => (
                <Skeleton key={i} height={100} className="rounded-lg" />
              ))}
            </div>
          ) : fetchError ? (
            <ErrorUI
              type="generic"
              message={fetchError}
              onRetry={fetchFeaturedParlays}
              size="sm"
              variant="inline"
            />
          ) : (
            <div className="space-y-3">
              {featuredParlays.map((featured) => (
                <button
                  key={featured.id}
                  onClick={() => handleSelectFeaturedParlay(featured)}
                  className="w-full p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-neutral-900">{featured.title}</h5>
                    <div className="flex items-center space-x-2">
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        featured.category === 'safe' && 'bg-success-100 text-success-700',
                        featured.category === 'value' && 'bg-warning-100 text-warning-700',
                        featured.category === 'longshot' && 'bg-error-100 text-error-700'
                      )}>
                        {featured.category.toUpperCase()}
                      </span>
                      <span className="text-sm text-neutral-600">
                        {featured.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">{featured.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">{featured.legs.length} legs</span>
                    <span className="font-medium text-neutral-900">
                      ${featured.stake} → ${(featured.stake * featured.expectedValue).toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Current Parlay */}
      {parlay && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-neutral-900">
              Current Parlay ({parlay.legs.length} legs)
            </h4>
            <div className="text-sm text-neutral-600">
              Total Odds: {parlay.totalOdds.toFixed(2)}
            </div>
          </div>

          {/* Parlay Legs */}
          <div className="space-y-3">
            <AnimatePresence>
              {parlay.legs.map((leg, index) => (
                <motion.div
                  key={leg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-neutral-900">
                          {leg.team} vs {leg.opponent}
                        </span>
                        <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
                          {leg.sport.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-neutral-600">{leg.description}</div>
                      {leg.gameTime && (
                        <div className="flex items-center space-x-1 mt-1 text-xs text-neutral-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(leg.gameTime).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-neutral-900">
                        {formatOdds(leg.odds)}
                      </span>
                      <button
                        onClick={() => handleRemoveLeg(leg.id)}
                        className="p-1 text-neutral-400 hover:text-error-600 transition-colors"
                        aria-label={`Remove ${leg.description}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Stake Input and Place Bet */}
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Stake Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="number"
                    value={stake}
                    onChange={(e) => handleStakeChange(e.target.value)}
                    min={minStake}
                    max={maxStake}
                    step="0.01"
                    className="input-base pl-9"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Potential Payout
                </label>
                <div className="input-base bg-neutral-50 text-neutral-700 font-semibold flex items-center justify-between">
                  <span>${parlay.potentialPayout.toFixed(2)}</span>
                  <Target className="w-4 h-4 text-neutral-400" />
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceParlay}
              disabled={validationErrors.length > 0 || isPlacing}
              className={cn(
                'w-full btn-base text-white font-semibold py-3',
                validationErrors.length === 0
                  ? 'bg-success-600 hover:bg-success-700'
                  : 'bg-neutral-400 cursor-not-allowed'
              )}
            >
              {isPlacing ? (
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Placing Parlay...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Place Parlay</span>
                </div>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParlayPanel;