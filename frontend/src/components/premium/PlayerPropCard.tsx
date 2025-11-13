/**
 * PlayerPropCard Component - Professional player prop display
 * Features: Safety scores, odds display, add to streak/parlay functionality
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, AlertCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { PremiumButton } from './PremiumButton';

export interface PlayerPropCardProps {
  player: string;
  team: string;
  opponent: string;
  prop: string;
  line: number;
  overOdds: number;
  underOdds?: number;
  safetyScore?: number;
  bestBook?: string;
  trend?: 'up' | 'down' | 'neutral';
  hitRate?: number;
  onAdd: () => void;
  onAddToParlay?: () => void;
  compact?: boolean;
  loading?: boolean;
}

export const PlayerPropCard: React.FC<PlayerPropCardProps> = ({
  player,
  team,
  opponent,
  prop,
  line,
  overOdds,
  underOdds,
  safetyScore,
  bestBook = 'DraftKings',
  trend = 'neutral',
  hitRate,
  onAdd,
  onAddToParlay,
  compact = false,
  loading = false
}) => {
  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const getSafetyColor = (score?: number) => {
    if (!score) return 'text-gray-400 bg-gray-500/20';
    if (score >= 80) return 'text-green-400 bg-green-500/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getSafetyLabel = (score?: number) => {
    if (!score) return 'N/A';
    if (score >= 80) return 'SAFE';
    if (score >= 60) return 'FAIR';
    return 'RISKY';
  };

  const getPlayerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <GlassCard padding="md">
        <div className="animate-pulse space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-700/30 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700/30 rounded w-1/2" />
              <div className="h-3 bg-gray-700/30 rounded w-1/3" />
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard 
      padding={compact ? 'sm' : 'md'} 
      hover 
      glow={safetyScore && safetyScore >= 80}
      gradient={safetyScore && safetyScore >= 80 ? 'violet' : 'purple'}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Player Info */}
        <div className="flex items-center gap-4 flex-1">
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-16 h-16 bg-gradient-to-br from-nova-purple to-nova-violet rounded-full flex items-center justify-center shadow-nova-glow"
          >
            <span className="text-white font-bold text-xl">
              {getPlayerInitials(player)}
            </span>
          </motion.div>
          
          {/* Details */}
          <div className="flex-1">
            <h4 className="text-white font-bold text-lg">{player}</h4>
            <p className="text-gray-400 text-sm">
              {team} vs {opponent}
            </p>
            {hitRate !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-nova-violet" />
                <span className="text-nova-violet text-xs font-medium">
                  {hitRate}% hit rate
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Prop & Odds */}
        <div className="text-center min-w-[120px]">
          <div className="flex items-center gap-2 justify-center mb-1">
            <span className="text-nova-violet font-semibold text-sm uppercase tracking-wide">
              {prop}
            </span>
          </div>
          <div className="text-white text-2xl font-bold mb-1">
            {line}
          </div>
          <div className="flex items-center gap-2 justify-center text-sm">
            <span className="text-green-400 font-medium">
              O {formatOdds(overOdds)}
            </span>
            {underOdds && (
              <>
                <span className="text-gray-500">|</span>
                <span className="text-red-400 font-medium">
                  U {formatOdds(underOdds)}
                </span>
              </>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            @ {bestBook}
          </div>
        </div>

        {/* Safety Score & Actions */}
        <div className="flex flex-col items-end gap-2 min-w-[140px]">
          {/* Safety Badge */}
          {safetyScore !== undefined && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`
                px-3 py-1.5 rounded-full text-sm font-bold
                ${getSafetyColor(safetyScore)}
                shadow-lg
              `}
            >
              <div className="flex items-center gap-1">
                {safetyScore >= 80 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                <span>{safetyScore}/100</span>
              </div>
              <div className="text-xs opacity-80 mt-0.5">
                {getSafetyLabel(safetyScore)}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 w-full">
            <PremiumButton
              size="sm"
              variant="primary"
              onClick={onAdd}
              icon={<Plus className="w-4 h-4" />}
              glow={safetyScore && safetyScore >= 80}
              fullWidth
            >
              Add to Streak
            </PremiumButton>
            
            {onAddToParlay && (
              <PremiumButton
                size="sm"
                variant="outline"
                onClick={onAddToParlay}
                fullWidth
              >
                Add to Parlay
              </PremiumButton>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
