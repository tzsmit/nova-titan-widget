/**
 * Simplified Widget Header - Clean and Professional
 */

import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { NovaTitanLogo } from '../ui/NovaTitanLogo';

interface SimpleHeaderProps {
  onRefresh?: () => void;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({ onRefresh }) => {
  return (
    <motion.div 
      className="bg-gradient-to-r from-slate-900 via-blue-900/50 to-slate-900 border-b border-slate-700"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <NovaTitanLogo size="medium" showBranding={true} animated={true} />
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors border border-slate-600"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};