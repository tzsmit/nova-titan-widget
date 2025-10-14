/**
 * Corner Help Tooltip Component - Specialized for page corner positioning
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CornerHelpTooltipProps {
  content: string;
  term?: string;
  size?: 'md' | 'lg';
}

export const CornerHelpTooltip: React.FC<CornerHelpTooltipProps> = ({ 
  content, 
  term, 
  size = 'md' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Fixed corner positioning to prevent cutoffs
  const getTooltipStyles = () => {
    const width = size === 'md' ? '16rem' : '20rem';
    
    return {
      position: 'absolute' as const,
      zIndex: 9999,
      width,
      maxWidth: '90vw',
      top: '100%',
      right: '0',
      marginTop: '0.5rem',
    };
  };

  // Arrow pointing up to the corner button
  const getArrowStyles = () => {
    return {
      position: 'absolute' as const,
      bottom: '100%',
      right: '1rem',
      width: 0,
      height: 0,
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderBottom: '6px solid rgb(17, 24, 39)',
    };
  };

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="inline-flex items-center justify-center w-8 h-8 text-sm bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 hover:scale-105"
        type="button"
        aria-label="Show page help information"
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
            <div className="bg-gray-900 text-white text-sm rounded-lg px-5 py-4 shadow-2xl border border-gray-600 backdrop-blur-sm relative pointer-events-none">
              {term && (
                <div className="font-semibold text-purple-300 mb-2 text-xs uppercase tracking-wide">{term}</div>
              )}
              <div className="leading-relaxed break-words">{content}</div>
              
              {/* Arrow pointing up to button */}
              <div style={getArrowStyles()}></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};