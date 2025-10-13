/**
 * Help Tooltip Component for Terminology and Explanations
 */

import React, { useState } from 'react';
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

  const positionClasses = {
    top: 'bottom-full right-0 mb-2',
    bottom: 'top-full right-0 mt-2', 
    left: 'right-full top-0 mr-2',
    right: 'left-full top-0 ml-2'
  };

  const arrowClasses = {
    top: 'top-full right-4 border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full right-4 border-b-gray-900 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-2 border-l-gray-900 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-2 border-r-gray-900 border-t-transparent border-b-transparent border-l-transparent'
  };

  return (
    <span className="relative inline-flex items-center">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="inline-flex items-center justify-center w-4 h-4 ml-1 text-xs bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
        type="button"
      >
        ?
      </button>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positionClasses[position]} ${
              size === 'sm' ? 'w-48' : size === 'md' ? 'w-64' : 'w-80'
            }`}
          >
            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
              {term && (
                <div className="font-semibold text-blue-300 mb-1">{term}</div>
              )}
              <div className="leading-relaxed">{content}</div>
              <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};