/**
 * Skeleton Loading Component
 * Provides placeholder loading states with proper accessibility
 */

import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width = '100%',
  height = '1rem',
  variant = 'rectangular',
  animated = true,
  ...props
}) => {
  const baseClasses = 'bg-neutral-200 dark:bg-neutral-700';
  const animationClasses = animated ? 'animate-pulse' : '';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  return (
    <div
      className={cn(
        baseClasses,
        animationClasses,
        variantClasses[variant],
        'skeleton',
        className
      )}
      style={{ width, height }}
      role="status"
      aria-label="Loading..."
      {...props}
    />
  );
};