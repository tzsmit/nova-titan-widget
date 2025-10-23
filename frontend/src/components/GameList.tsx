/**
 * GameList Component
 * Responsive game list with minmax(220px, 1fr) grid, skeleton loading, and empty states
 * Fixes: games tab overflow, responsive grid system, error handling
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertCircle, Calendar, TrendingUp } from 'lucide-react';
import { GameCard, GameData } from './GameCard';
import { Skeleton, SkeletonGameCard } from './ui/Skeleton';
import { ErrorUI } from './ui/ErrorUI';
import { cn } from '../utils/cn';

export interface GameListProps {
  games: GameData[];
  isLoading?: boolean;
  error?: string | null;
  emptyStateMessage?: string;
  className?: string;
  onTeamClick?: (teamName: string, teamLogo: string, sport: string) => void;
  onBetClick?: (betType: string, selection: string) => void;
  onRetry?: () => void;
  showActions?: boolean;
  variant?: 'grid' | 'list';
  // Grid configuration
  minCardWidth?: number;
  maxColumns?: number;
  // Animation settings
  staggerDelay?: number;
  animationType?: 'fade' | 'slide' | 'scale';
}

export const GameList: React.FC<GameListProps> = ({
  games,
  isLoading = false,
  error = null,
  emptyStateMessage = "No games available",
  className,
  onTeamClick,
  onBetClick,
  onRetry,
  showActions = true,
  variant = 'grid',
  minCardWidth = 220,
  maxColumns = 4,
  staggerDelay = 0.05,
  animationType = 'slide',
}) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.3 } },
    },
    slide: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    },
  };

  // Loading state with skeleton cards
  if (isLoading) {
    return (
      <div className={cn(
        'w-full min-w-0', // Ensure parent min-width:0 for grid flexibility
        className
      )}>
        {/* Skeleton Grid */}
        <div 
          className={cn(
            'grid gap-4',
            variant === 'grid' 
              ? `grid-cols-responsive` // Using CSS custom property
              : 'grid-cols-1'
          )}
          style={{
            // CSS Grid with minmax as specified
            gridTemplateColumns: variant === 'grid' 
              ? `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))` 
              : '1fr'
          }}
          aria-label="Loading games"
        >
          {Array.from({ length: 6 }, (_, index) => (
            <SkeletonGameCard key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn(
        'w-full min-w-0 flex items-center justify-center py-12',
        className
      )}>
        <ErrorUI
          type="fetch-error"
          message={error}
          onRetry={onRetry}
          size="md"
          variant="card"
          className="max-w-md"
        />
      </div>
    );
  }

  // Empty state with actionable suggestions
  if (!games || games.length === 0) {
    return (
      <div className={cn(
        'w-full min-w-0 flex flex-col items-center justify-center py-12 px-4',
        className
      )}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          {/* Empty state icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-neutral-400" />
          </div>

          {/* Empty state content */}
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            No Games Found
          </h3>
          
          <p className="text-neutral-600 text-sm mb-6">
            {emptyStateMessage}
          </p>

          {/* Suggested actions */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="btn-base bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 inline-flex items-center justify-center space-x-2"
                  aria-label="Refresh games list"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              )}
            </div>

            {/* Helpful suggestions */}
            <div className="text-xs text-neutral-500 space-y-1">
              <div className="flex items-center justify-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>Try selecting a different sport or date</span>
              </div>
              <div className="flex items-center justify-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>Check back later for upcoming games</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main games display
  return (
    <div className={cn(
      'w-full min-w-0', // Critical: parent min-width:0 for grid flexibility
      className
    )}>
      <AnimatePresence mode="wait">
        <motion.div
          key="games-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className={cn(
            'grid gap-4',
            variant === 'grid' 
              ? 'grid-cols-responsive' // Using CSS custom property from tokens
              : 'grid-cols-1'
          )}
          style={{
            // CSS Grid with minmax(220px, 1fr) as specified
            gridTemplateColumns: variant === 'grid' 
              ? `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))` 
              : '1fr',
            // Constrain max columns on very wide screens
            maxWidth: variant === 'grid' 
              ? `${maxColumns * (minCardWidth + 16)}px` 
              : 'none'
          }}
          role="grid"
          aria-label={`${games.length} games available`}
        >
          {games.map((game, index) => (
            <motion.div
              key={game.id || index}
              variants={itemVariants[animationType]}
              className="min-w-0" // Allow card to shrink if needed
              role="gridcell"
            >
              <GameCard
                game={game}
                onTeamClick={onTeamClick}
                onBetClick={onBetClick}
                showActions={showActions}
                variant="default"
                className="h-full" // Ensure consistent card heights
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Games count indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <span className="text-sm text-neutral-500">
          {games.length === 1 ? '1 game' : `${games.length} games`} available
        </span>
      </motion.div>
    </div>
  );
};

// Preset configurations for common use cases
export const GameListPresets = {
  // Desktop: 3-column layout as specified
  desktop: {
    minCardWidth: 280,
    maxColumns: 3,
    variant: 'grid' as const,
  },
  // Tablet: 2-column layout
  tablet: {
    minCardWidth: 240,
    maxColumns: 2,
    variant: 'grid' as const,
  },
  // Mobile: 1-column layout
  mobile: {
    minCardWidth: 220,
    maxColumns: 1,
    variant: 'list' as const,
  },
  // Compact grid for sidebars
  compact: {
    minCardWidth: 200,
    maxColumns: 2,
    variant: 'grid' as const,
  },
};

export default GameList;