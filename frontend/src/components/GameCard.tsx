/**
 * GameCard Component
 * Responsive, accessible game card with proper error handling and loading states
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  MapPin, 
  Tv, 
  ChevronRight
} from 'lucide-react';
import { cn } from '../utils/cn';
import { Skeleton } from './ui/Skeleton';
import { ErrorUI } from './ui/ErrorUI';

export interface GameData {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  gameTime: string;
  gameDate: string;
  venue?: string;
  sport: string;
  status: 'scheduled' | 'live' | 'final';
  odds?: {
    spread?: { home: number; away: number; line: number };
    moneyline?: { home: number; away: number };
    total?: { over: number; under: number; line: number };
  };
  bookmaker?: string;
  tv?: string;
  weather?: string;
}

interface GameCardProps {
  game: GameData;
  onTeamClick?: (teamName: string, teamLogo: string, sport: string) => void;
  onBetClick?: (betType: string, selection: string) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onTeamClick,
  onBetClick,
  className,
  variant = 'default',
  showActions = true,
  isLoading = false,
  error,
  onRetry,
}) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState(false);

  const handleImageError = (team: 'home' | 'away') => {
    setImageErrors(prev => ({ ...prev, [team]: true }));
  };

  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };

  const formatTime = (timeString: string): string => {
    try {
      return new Date(timeString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/Chicago'
      });
    } catch {
      return timeString;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'live': return 'text-success-600 bg-success-100';
      case 'final': return 'text-neutral-600 bg-neutral-100';
      case 'scheduled': return 'text-info-600 bg-info-100';
      default: return 'text-neutral-600 bg-neutral-100';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('card-base p-4 space-y-3', className)}>
        <Skeleton variant="text" width="60%" />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton variant="circle" width={32} height={32} />
            <Skeleton variant="text" width={120} />
          </div>
          <Skeleton variant="text" width={60} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton variant="circle" width={32} height={32} />
            <Skeleton variant="text" width={120} />
          </div>
          <Skeleton variant="text" width={60} />
        </div>
        <div className="border-t pt-3 grid grid-cols-3 gap-2">
          <Skeleton height={36} />
          <Skeleton height={36} />
          <Skeleton height={36} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('card-base', className)}>
        <ErrorUI 
          type="generic"
          message={error}
          onRetry={onRetry}
          size="sm"
          variant="inline"
        />
      </div>
    );
  }

  const compactCard = variant === 'compact';
  const detailedCard = variant === 'detailed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'card-base group min-w-220 relative overflow-hidden',
        compactCard && 'p-3',
        !compactCard && 'p-4',
        className
      )}
      role="article"
      aria-label={`Game: ${game.awayTeam} at ${game.homeTeam}`}
    >
      {/* Game Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          {game.sport && (
            <span className="inline-block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">
              {game.sport}
            </span>
          )}
          
          <div className="flex items-center space-x-2 text-sm text-neutral-600">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{formatTime(game.gameTime)}</span>
            
            {game.venue && !compactCard && (
              <>
                <MapPin className="w-4 h-4 flex-shrink-0 ml-2" />
                <span className="truncate">{game.venue}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {game.status && (
            <span className={cn(
              'px-2 py-1 text-xs font-semibold rounded-full',
              getStatusColor(game.status)
            )}>
              {game.status.toUpperCase()}
            </span>
          )}
          
          {game.tv && !compactCard && (
            <div className="flex items-center text-xs text-neutral-500">
              <Tv className="w-4 h-4 mr-1" />
              <span>{game.tv}</span>
            </div>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="space-y-3 mb-4">
        {/* Away Team */}
        <button
          onClick={() => onTeamClick?.(game.awayTeam, game.awayTeamLogo || '', game.sport)}
          className="flex items-center justify-between w-full p-2 -mx-2 rounded-lg hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none focus-ring transition-colors"
          aria-label={`View ${game.awayTeam} team details`}
        >
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="flex-shrink-0">
              {game.awayTeamLogo && !imageErrors.away ? (
                <img
                  src={game.awayTeamLogo}
                  alt={`${game.awayTeam} logo`}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={() => handleImageError('away')}
                />
              ) : (
                <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-neutral-600">
                    {game.awayTeam.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <span className="font-semibold text-neutral-900 truncate">
              {game.awayTeam}
            </span>
            <span className="text-xs text-neutral-500">@ Away</span>
          </div>
          
          {game.odds?.moneyline?.away && (
            <span className="text-sm font-semibold text-neutral-700">
              {formatOdds(game.odds.moneyline.away)}
            </span>
          )}
        </button>

        {/* Home Team */}
        <button
          onClick={() => onTeamClick?.(game.homeTeam, game.homeTeamLogo || '', game.sport)}
          className="flex items-center justify-between w-full p-2 -mx-2 rounded-lg hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none focus-ring transition-colors"
          aria-label={`View ${game.homeTeam} team details`}
        >
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="flex-shrink-0">
              {game.homeTeamLogo && !imageErrors.home ? (
                <img
                  src={game.homeTeamLogo}
                  alt={`${game.homeTeam} logo`}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={() => handleImageError('home')}
                />
              ) : (
                <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-neutral-600">
                    {game.homeTeam.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <span className="font-semibold text-neutral-900 truncate">
              {game.homeTeam}
            </span>
            <span className="text-xs text-neutral-500">Home</span>
          </div>
          
          {game.odds?.moneyline?.home && (
            <span className="text-sm font-semibold text-neutral-700">
              {formatOdds(game.odds.moneyline.home)}
            </span>
          )}
        </button>
      </div>

      {/* Betting Options */}
      {showActions && game.odds && (
        <div className="border-t pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Spread */}
            {game.odds.spread && (
              <button
                onClick={() => onBetClick?.('spread', 'home')}
                className="btn-base bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300 text-xs py-2"
                aria-label={`Bet on ${game.homeTeam} spread ${game.odds.spread.line}`}
              >
                <div className="text-center">
                  <div className="font-semibold">Spread</div>
                  <div>{game.odds.spread.line > 0 ? '+' : ''}{game.odds.spread.line}</div>
                </div>
              </button>
            )}

            {/* Total */}
            {game.odds.total && (
              <button
                onClick={() => onBetClick?.('total', 'over')}
                className="btn-base bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300 text-xs py-2"
                aria-label={`Bet on total ${game.odds.total.line}`}
              >
                <div className="text-center">
                  <div className="font-semibold">Total</div>
                  <div>O/U {game.odds.total.line}</div>
                </div>
              </button>
            )}

            {/* More Bets */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="btn-base bg-primary-600 hover:bg-primary-700 text-white text-xs py-2 flex items-center justify-center space-x-1"
              aria-label="View more betting options"
              aria-expanded={expanded}
            >
              <span>More Bets</span>
              <ChevronRight className={cn(
                'w-4 h-4 transition-transform',
                expanded && 'rotate-90'
              )} />
            </button>
          </div>

          {/* Expanded Options */}
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 pt-3 border-t space-y-2"
            >
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button className="btn-base bg-warning-100 hover:bg-warning-200 text-warning-900 border border-warning-300 py-2">
                  Player Props
                </button>
                <button className="btn-base bg-info-100 hover:bg-info-200 text-info-900 border border-info-300 py-2">
                  Alt Lines
                </button>
              </div>
              
              {detailedCard && game.weather && (
                <div className="text-xs text-neutral-600 mt-2">
                  <strong>Weather:</strong> {game.weather}
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Bookmaker Badge */}
      {game.bookmaker && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs bg-neutral-900 text-white px-2 py-1 rounded">
            {game.bookmaker}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default GameCard;