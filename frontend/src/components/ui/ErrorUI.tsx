/**
 * Error UI Component
 * Displays error states with retry functionality
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ErrorUIProps {
  message: string;
  onRetry?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const ErrorUI: React.FC<ErrorUIProps> = ({
  message,
  onRetry,
  className,
  size = 'md',
  showIcon = true,
  ...props
}) => {
  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'bg-red-50 border border-red-200 rounded-lg',
        'text-red-800',
        sizeClasses[size],
        className
      )}
      role="alert"
      {...props}
    >
      {showIcon && (
        <AlertCircle className="w-6 h-6 mb-2 text-red-600" />
      )}
      
      <p className="text-center mb-3 font-medium">
        {message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-2',
            'bg-red-600 text-white rounded-md',
            'hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500',
            'transition-colors duration-200',
            'text-sm font-medium'
          )}
          aria-label="Retry loading"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
};