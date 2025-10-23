/**
 * Simplified Widget Header - Clean and Professional
 */

import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { NovaTitanLogo } from '../ui/NovaTitanLogo';
import { SimpleSearchComponent } from './search/SimpleSearchComponent';

interface SimpleHeaderProps {
  onRefresh?: () => void;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({ onRefresh }) => {
  return (
    <motion.header 
      className="relative"
      style={{
        background: 'var(--nova-glass-bg)',
        border: 'var(--nova-card-border)',
        backdropFilter: 'var(--nova-glass-backdrop)',
        WebkitBackdropFilter: 'var(--nova-glass-backdrop)',
        boxShadow: 'var(--nova-shadow-lg)',
        borderRadius: 'var(--nova-radius-2xl)',
        padding: 'var(--nova-space-6)',
        zIndex: 2000,
        position: 'sticky',
        top: 0
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col gap-6">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <NovaTitanLogo size="medium" showBranding={true} animated={true} />
            <div className="hidden md:flex flex-col">
              <div 
                className="text-sm font-semibold"
                style={{ color: 'var(--nova-text-primary)' }}
              >
                AI-Powered Sports Analytics
              </div>
              <div 
                className="text-xs"
                style={{ color: 'var(--nova-text-muted)' }}
              >
                Real-time odds • Live data • Smart predictions
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Live Data Indicator */}
            <div 
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: 'var(--nova-success)'
              }}
            >
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--nova-success)' }}></div>
              <span>Live Data Active</span>
            </div>
            
            {onRefresh && (
              <button
                type="button"
                onClick={() => {
                  console.log('🔄 Header refresh triggered');
                  onRefresh();
                }}
                className="nova-btn-secondary flex items-center gap-2 px-3 py-1.5 text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh All</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Enhanced Global Search */}
        <div className="relative w-full max-w-2xl">
          <SimpleSearchComponent 
            placeholder="🔍 Search games, teams, players, props, parlays... (e.g., 'LeBron', 'Lakers', 'NFL')"
            onResultSelect={(result) => {
              console.log('🎯 Header Search: Selected result:', result.type, result.title);
              // Enhanced navigation logic could be added here
            }}
            className="w-full"
          />
        </div>
      </div>
    </motion.header>
  );
};