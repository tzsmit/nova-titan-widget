/**
 * GlassCard Component - Premium glassmorphism card with Nova Titan branding
 * Features: Backdrop blur, gradient borders, glow effects, smooth animations
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  onClick?: () => void;
  gradient?: 'purple' | 'violet' | 'gold' | 'none';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = false,
  hover = true,
  onClick,
  gradient = 'purple',
  padding = 'md'
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const borderGradients = {
    purple: 'border-nova-purple/30',
    violet: 'border-nova-violet/30',
    gold: 'border-nova-gold/30',
    none: 'border-gray-700/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      onClick={onClick}
      className={`
        relative
        bg-nova-midnight/40 
        backdrop-blur-xl 
        border ${borderGradients[gradient]}
        rounded-2xl 
        ${paddingClasses[padding]}
        ${glow ? 'shadow-nova-glow' : 'shadow-glass'}
        ${hover ? 'transition-all duration-300 cursor-pointer hover:border-nova-purple hover:shadow-nova-lg' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Gradient overlay for extra depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-nova-purple/5 to-transparent rounded-2xl pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
