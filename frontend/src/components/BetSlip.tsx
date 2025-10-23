/**
 * BetSlip Component
 * Responsive bet slip with slide-over functionality for mobile
 * Features: desktop sidebar, mobile slide-over, persistent state
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart,
  X,
  Trash2,
  DollarSign,
  Target,
  CheckCircle,
  AlertTriangle,
  Calculator,
  TrendingUp,
  Zap,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '../utils/cn';
import { Skeleton } from './ui/Skeleton';
import { ErrorUI } from './ui/ErrorUI';

// Types
export interface Bet {
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
  gameTime: string;
  stake: number;
  potentialPayout: number;
  bookmaker?: string;
}

export interface BetSlipData {
  id: string;
  bets: Bet[];
  totalStake: number;
  totalPotentialPayout: number;
  createdAt: Date;
  status: 'active' | 'placed' | 'settled';
}

interface BetSlipProps {
  className?: string;
  // Mobile slide-over configuration
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  
  // Layout mode
  variant?: 'sidebar' | 'slide-over' | 'modal';
  
  // Data and callbacks
  betSlip?: BetSlipData | null;
  onBetRemoved?: (betId: string) => void;
  onStakeChanged?: (betId: string, newStake: number) => void;
  onBetSlipPlaced?: (betSlipId: string) => void;
  
  // Loading and error states
  isLoading?: boolean;
  isPlacing?: boolean;
  error?: string | null;
  
  // Configuration
  minStake?: number;
  maxStake?: number;
  maxBets?: number;
}

export const BetSlip: React.FC<BetSlipProps> = ({
  className,
  isOpen = false,
  onClose,
  onOpen,
  variant = 'sidebar',
  betSlip,
  onBetRemoved,
  onStakeChanged,
  onBetSlipPlaced,
  isLoading = false,
  isPlacing = false,
  error = null,
  minStake = 1,
  maxStake = 1000,
  maxBets = 20,
}) => {
  // Internal state
  const [localBetSlip, setLocalBetSlip] = useState<BetSlipData | null>(betSlip || null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [quickStakeAmounts] = useState([5, 10, 25, 50, 100]);

  // Update local state when prop changes
  useEffect(() => {
    setLocalBetSlip(betSlip || null);
  }, [betSlip]);

  // Mock data for demonstration
  useEffect(() => {
    if (!betSlip && !localBetSlip) {
      // Create sample bet slip for demo
      const mockBetSlip: BetSlipData = {
        id: `betslip-${Date.now()}`,
        bets: [
          {
            id: 'bet-1',
            gameId: 'nfl-game-1',
            team: 'Kansas City Chiefs',
            opponent: 'Denver Broncos',
            betType: 'moneyline',
            selection: 'Chiefs ML',
            odds: -150,
            description: 'Kansas City Chiefs to win',
            sport: 'americanfootball_nfl',
            gameTime: '2024-01-15T20:00:00Z',
            stake: 25,
            potentialPayout: 41.67,
            bookmaker: 'DraftKings'
          },
          {
            id: 'bet-2',
            gameId: 'nba-game-1',
            team: 'Los Angeles Lakers',
            opponent: 'Boston Celtics',
            betType: 'spread',
            selection: 'Lakers +7.5',
            odds: -110,
            line: 7.5,
            description: 'Lakers +7.5 points',
            sport: 'basketball_nba',
            gameTime: '2024-01-15T22:00:00Z',
            stake: 15,
            potentialPayout: 28.64,
            bookmaker: 'FanDuel'
          }
        ],
        totalStake: 0,
        totalPotentialPayout: 0,
        createdAt: new Date(),
        status: 'active'
      };

      // Calculate totals
      mockBetSlip.totalStake = mockBetSlip.bets.reduce((sum, bet) => sum + bet.stake, 0);
      mockBetSlip.totalPotentialPayout = mockBetSlip.bets.reduce((sum, bet) => sum + bet.potentialPayout, 0);

      setLocalBetSlip(mockBetSlip);
    }
  }, [betSlip, localBetSlip]);

  // Validation
  const validateBetSlip = useCallback(() => {
    const errors: string[] = [];

    if (!localBetSlip || localBetSlip.bets.length === 0) {
      errors.push('Add at least one bet to place a bet slip');
      return errors;
    }

    if (localBetSlip.bets.length > maxBets) {
      errors.push(`Maximum ${maxBets} bets allowed per slip`);
    }

    // Validate individual bets
    localBetSlip.bets.forEach((bet, index) => {
      if (bet.stake < minStake || bet.stake > maxStake) {
        errors.push(`Bet ${index + 1}: Stake must be between $${minStake} and $${maxStake}`);
      }
      
      if (isNaN(bet.stake) || bet.stake <= 0) {
        errors.push(`Bet ${index + 1}: Invalid stake amount`);
      }
    });

    // Check for duplicate bets
    const gameIds = localBetSlip.bets.map(bet => `${bet.gameId}-${bet.betType}-${bet.selection}`);
    const duplicates = gameIds.filter((id, index) => gameIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      errors.push('Duplicate bets detected');
    }

    return errors;
  }, [localBetSlip, minStake, maxStake, maxBets]);

  // Update validation on changes
  useEffect(() => {
    setValidationErrors(validateBetSlip());
  }, [validateBetSlip]);

  // Utility functions
  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };

  const calculatePayout = (stake: number, odds: number): number => {
    if (odds > 0) {
      return stake * (odds / 100);
    } else {
      return stake * (100 / Math.abs(odds));
    }
  };

  // Event handlers
  const handleRemoveBet = (betId: string) => {
    if (!localBetSlip) return;

    const updatedBets = localBetSlip.bets.filter(bet => bet.id !== betId);
    const updatedBetSlip: BetSlipData = {
      ...localBetSlip,
      bets: updatedBets,
      totalStake: updatedBets.reduce((sum, bet) => sum + bet.stake, 0),
      totalPotentialPayout: updatedBets.reduce((sum, bet) => sum + bet.potentialPayout, 0)
    };

    setLocalBetSlip(updatedBetSlip);
    
    if (onBetRemoved) {
      onBetRemoved(betId);
    }
  };

  const handleStakeChange = (betId: string, newStake: number) => {
    if (!localBetSlip) return;

    const updatedBets = localBetSlip.bets.map(bet => {
      if (bet.id === betId) {
        const potentialPayout = bet.stake + calculatePayout(newStake, bet.odds);
        return { ...bet, stake: newStake, potentialPayout };
      }
      return bet;
    });

    const updatedBetSlip: BetSlipData = {
      ...localBetSlip,
      bets: updatedBets,
      totalStake: updatedBets.reduce((sum, bet) => sum + bet.stake, 0),
      totalPotentialPayout: updatedBets.reduce((sum, bet) => sum + bet.potentialPayout, 0)
    };

    setLocalBetSlip(updatedBetSlip);

    if (onStakeChanged) {
      onStakeChanged(betId, newStake);
    }
  };

  const handleQuickStake = (betId: string, amount: number) => {
    handleStakeChange(betId, amount);
  };

  const handlePlaceBetSlip = () => {
    if (!localBetSlip || validationErrors.length > 0) return;

    if (onBetSlipPlaced) {
      onBetSlipPlaced(localBetSlip.id);
    }
  };

  const handleClearBetSlip = () => {
    setLocalBetSlip(null);
  };

  // Animation variants
  const slideOverVariants = {
    hidden: {
      x: '100%',
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    visible: {
      x: 0,
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn(
        'space-y-4',
        variant === 'sidebar' ? 'w-80' : 'w-full max-w-md',
        className
      )}>
        <Skeleton height={32} className="rounded-lg" />
        <div className="space-y-3">
          {Array.from({ length: 2 }, (_, i) => (
            <Skeleton key={i} height={100} className="rounded-lg" />
          ))}
        </div>
        <Skeleton height={80} className="rounded-lg" />
      </div>
    );
  }

  // Content component
  const BetSlipContent = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <ShoppingCart className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-neutral-900">
            Bet Slip ({localBetSlip?.bets.length || 0})
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {variant === 'sidebar' && (
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label={isMinimized ? 'Expand bet slip' : 'Minimize bet slip'}
            >
              {isMinimized ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          )}
          
          {variant === 'slide-over' && onClose && (
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label="Close bet slip"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4">
          <ErrorUI
            type="generic"
            message={error}
            size="sm"
            variant="inline"
          />
        </div>
      )}

      {/* Content */}
      <div className={cn(
        'flex-1 overflow-y-auto',
        isMinimized && 'hidden'
      )}>
        {!localBetSlip || localBetSlip.bets.length === 0 ? (
          // Empty state
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-neutral-400" />
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 mb-2">Your bet slip is empty</h4>
              <p className="text-sm text-neutral-600">Add bets from games to get started</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Individual Bets */}
            <div className="space-y-3">
              <AnimatePresence>
                {localBetSlip.bets.map((bet, index) => (
                  <motion.div
                    key={bet.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 space-y-3"
                  >
                    {/* Bet Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-neutral-900 truncate">
                            {bet.team} vs {bet.opponent}
                          </span>
                          <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
                            {bet.sport.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-neutral-600">{bet.description}</div>
                        <div className="flex items-center space-x-1 text-xs text-neutral-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(bet.gameTime).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-neutral-900">
                          {formatOdds(bet.odds)}
                        </span>
                        <button
                          onClick={() => handleRemoveBet(bet.id)}
                          className="p-1 text-neutral-400 hover:text-error-600 transition-colors"
                          aria-label={`Remove ${bet.description}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Stake Input */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-neutral-600">
                        <span>Stake</span>
                        <span>Payout: ${bet.potentialPayout.toFixed(2)}</span>
                      </div>
                      
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="number"
                          value={bet.stake}
                          onChange={(e) => handleStakeChange(bet.id, parseFloat(e.target.value) || 0)}
                          min={minStake}
                          max={maxStake}
                          step="0.01"
                          className="input-base text-sm h-10 pl-9"
                          placeholder="0.00"
                        />
                      </div>

                      {/* Quick Stake Buttons */}
                      <div className="flex space-x-1">
                        {quickStakeAmounts.map((amount) => (
                          <button
                            key={amount}
                            onClick={() => handleQuickStake(bet.id, amount)}
                            className="flex-1 px-2 py-1 text-xs bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded transition-colors"
                          >
                            ${amount}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bookmaker */}
                    {bet.bookmaker && (
                      <div className="text-xs text-neutral-500 flex items-center justify-between">
                        <span>via {bet.bookmaker}</span>
                        <Target className="w-3 h-3" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="space-y-2">
                {validationErrors.map((error, index) => (
                  <div
                    key={index}
                    className="p-2 bg-error-50 border border-error-200 rounded text-xs flex items-center space-x-2"
                  >
                    <AlertTriangle className="w-3 h-3 text-error-600" />
                    <span className="text-error-700">{error}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - Totals and Actions */}
      {localBetSlip && localBetSlip.bets.length > 0 && !isMinimized && (
        <div className="border-t p-4 space-y-4">
          {/* Totals */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Total Stake:</span>
              <span className="font-medium">${localBetSlip.totalStake.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Potential Payout:</span>
              <span className="font-semibold text-success-600">
                ${localBetSlip.totalPotentialPayout.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Potential Profit:</span>
              <span className="font-semibold text-primary-600">
                ${(localBetSlip.totalPotentialPayout - localBetSlip.totalStake).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handlePlaceBetSlip}
              disabled={validationErrors.length > 0 || isPlacing}
              className={cn(
                'w-full btn-base font-semibold py-3 flex items-center justify-center space-x-2',
                validationErrors.length === 0
                  ? 'bg-success-600 hover:bg-success-700 text-white'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              )}
            >
              {isPlacing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Calculator className="w-4 h-4" />
                  </motion.div>
                  <span>Placing Bets...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Place Bets (${localBetSlip.totalStake.toFixed(2)})</span>
                </>
              )}
            </button>

            <button
              onClick={handleClearBetSlip}
              className="w-full btn-base bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2 flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Render based on variant
  if (variant === 'slide-over') {
    return (
      <>
        {/* Backdrop */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="fixed inset-0 bg-black/50 z-modal-backdrop"
              onClick={onClose}
            />
          )}
        </AnimatePresence>

        {/* Slide-over Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={slideOverVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className={cn(
                'fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-modal',
                className
              )}
            >
              <BetSlipContent />
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Default sidebar variant
  return (
    <div className={cn(
      'card-base h-fit max-h-screen overflow-hidden',
      variant === 'sidebar' ? 'w-80' : 'w-full',
      className
    )}>
      <BetSlipContent />
    </div>
  );
};

export default BetSlip;