/**
 * Help Tooltip Component for Terminology and Explanations
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HelpTooltipProps {
  content: string;
  term?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
  content, 
  term, 
  position = 'top',
  size = 'sm' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Simple, reliable positioning
  const getTooltipStyles = () => {
    const width = size === 'sm' ? '12rem' : size === 'md' ? '16rem' : '20rem';
    
    const baseStyle = {
      position: 'absolute' as const,
      zIndex: 9999,
      width,
      maxWidth: '90vw',
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '0.5rem',
        };
      case 'bottom':
        return {
          ...baseStyle,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '0.5rem',
        };
      case 'left':
        return {
          ...baseStyle,
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: '0.5rem',
        };
      case 'right':
        return {
          ...baseStyle,
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: '0.5rem',
        };
      default:
        return {
          ...baseStyle,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '0.5rem',
        };
    }
  };

  // Simple arrow styles
  const getArrowStyles = () => {
    const baseStyle = {
      position: 'absolute' as const,
      width: 0,
      height: 0,
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid rgb(17, 24, 39)',
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderBottom: '6px solid rgb(17, 24, 39)',
        };
      case 'left':
        return {
          ...baseStyle,
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderLeft: '6px solid rgb(17, 24, 39)',
        };
      case 'right':
        return {
          ...baseStyle,
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderRight: '6px solid rgb(17, 24, 39)',
        };
      default:
        return {
          ...baseStyle,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid rgb(17, 24, 39)',
        };
    }
  };

  return (
    <span className="relative inline-block ml-1">
      <button
        ref={buttonRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="inline-flex items-center justify-center w-5 h-5 text-xs bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-1 focus:ring-purple-400 focus:ring-opacity-50"
        type="button"
        aria-label="Show help information"
      >
        ?
      </button>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={getTooltipStyles()}
          >
            <div className="bg-gray-900 text-white text-sm rounded-lg px-4 py-3 shadow-2xl border border-gray-600 backdrop-blur-sm relative pointer-events-none">
              {term && (
                <div className="font-semibold text-blue-300 mb-2 text-xs uppercase tracking-wide">{term}</div>
              )}
              <div className="leading-relaxed break-words">{content}</div>
              
              {/* Arrow */}
              <div style={getArrowStyles()}></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};