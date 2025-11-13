/**
 * PremiumButton Component - Gradient buttons with Nova Titan branding
 * Features: Multiple variants, sizes, glow effects, loading states
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface PremiumButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  glow = false,
  loading = false,
  disabled = false,
  className = '',
  icon,
  fullWidth = false
}) => {
  const baseClasses = "font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2";
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl"
  };
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-nova-purple to-nova-violet text-white hover:scale-105 active:scale-95",
    secondary: "bg-nova-indigo text-white border border-nova-purple/30 hover:border-nova-purple hover:bg-nova-indigo/80",
    gold: "bg-gradient-to-r from-nova-purple to-nova-gold text-white hover:scale-105 active:scale-95",
    outline: "bg-transparent border-2 border-nova-purple text-nova-purple hover:bg-nova-purple hover:text-white",
    ghost: "bg-transparent text-nova-violet hover:bg-nova-purple/10"
  };

  const disabledClasses = "opacity-50 cursor-not-allowed hover:scale-100";

  return (
    <motion.button
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      onClick={!disabled && !loading ? onClick : undefined}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled || loading ? disabledClasses : ''}
        ${glow && !disabled ? 'shadow-nova-glow animate-glow-pulse' : ''}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
};
