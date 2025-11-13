/**
 * StatCard Component - Animated stat display for Dashboard
 * Features: Trend indicators, animated counters, color-coded changes
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { GlassCard } from './GlassCard';

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  loading?: boolean;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  loading = false,
  prefix = '',
  suffix = '',
  decimals = 0
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Animate counter
  useEffect(() => {
    if (typeof value === 'number' && !loading) {
      const duration = 1000; // 1 second
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [value, loading]);

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <GlassCard padding="md" hover={false} glow={trend === 'up'}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Label */}
          <p className="text-gray-400 text-sm font-medium mb-2">{label}</p>
          
          {/* Value */}
          {loading ? (
            <div className="h-10 w-24 bg-gray-700/30 animate-pulse rounded" />
          ) : (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-white text-3xl font-bold flex items-baseline gap-1"
            >
              <span>{prefix}</span>
              <span>
                {typeof value === 'number' 
                  ? displayValue.toFixed(decimals)
                  : value
                }
              </span>
              <span>{suffix}</span>
            </motion.div>
          )}
          
          {/* Change indicator */}
          {change && !loading && (
            <div className={`flex items-center gap-1 mt-2 ${trendColors[trend]}`}>
              {TrendIcon && <TrendIcon className="w-4 h-4" />}
              <span className="text-sm font-medium">{change}</span>
            </div>
          )}
        </div>
        
        {/* Icon */}
        {Icon && (
          <div className="bg-nova-purple/20 p-3 rounded-xl">
            <Icon className="w-6 h-6 text-nova-violet" />
          </div>
        )}
      </div>
    </GlassCard>
  );
};
