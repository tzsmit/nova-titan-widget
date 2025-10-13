/**
 * Customizable Widget Header with Logo and Branding
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWidgetStore } from '../../stores/widgetStore';
import { SportSelector } from './SportSelector';
import { HelpTooltip } from '../ui/HelpTooltip';

export const WidgetHeader: React.FC = () => {
  const { config, setSelectedTab } = useWidgetStore();
  const [showSportSelector, setShowSportSelector] = useState(false);

  // Nova Titan branding with blue gradient theme
  const logoUrl = config.logo || 'https://page.gensparksite.com/v1/base64_upload/b12f5870654d8f0d2849b96fdb25cab2';
  const title = config.title || 'Nova Titan';
  const subtitle = 'Secure. Optimize. Innovate.';


  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="widget-header relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Logo and Title Section */}
          <div className="flex items-center space-x-4">
            {/* Nova Titan Logo */}
            <motion.div 
              className="flex-shrink-0 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedTab('games')}
            >
              <img
                src={logoUrl}
                alt="Nova Titan Logo"
                className="h-14 w-auto max-w-[160px] drop-shadow-lg"
                onError={(e) => {
                  // Fallback to text if logo fails to load
                  e.currentTarget.style.display = 'none';
                  const textFallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (textFallback) textFallback.style.display = 'block';
                }}
              />
              {/* Text Fallback with Nova Titan styling */}
              <div 
                className="text-2xl font-bold text-white hidden flex items-center space-x-3"
                style={{ display: 'none' }}
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  🛡️
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-extrabold">{title}</span>
                  <span className="text-xs text-white/80 font-normal">{subtitle}</span>
                </div>
              </div>
            </motion.div>

            {/* Title and Nova Titan Tagline */}
            <div className="hidden sm:block">
              <motion.h1 
                className="text-xl md:text-2xl font-extrabold text-white drop-shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {title} <span className="text-nova-gold-400">Sports</span>
              </motion.h1>
              <motion.p 
                className="text-sm md:text-base text-white/90 font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {subtitle}
              </motion.p>
              <motion.p 
                className="text-xs text-white/80 flex items-center space-x-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/20 backdrop-blur-sm">
                  🤖 AI Predictions
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/20 backdrop-blur-sm">
                  📊 Live Analysis
                </span>
                <HelpTooltip content="Advanced machine learning algorithms analyze team performance, player stats, injuries, and situational factors to provide winning predictions" />
              </motion.p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-3">
            {/* Live Indicator */}
            <motion.div 
              className="flex items-center space-x-2 bg-green-500/20 text-green-300 px-3 py-2 rounded-xl backdrop-blur-sm border border-green-400/30"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold">LIVE</span>
            </motion.div>

            {/* Sport Selector Button */}
            <motion.button
              onClick={() => setShowSportSelector(!showSportSelector)}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/30 hover:border-white/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-sm font-semibold">Sports</span>
            </motion.button>

            {/* Settings Button */}
            <motion.button
              className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/30 hover:border-white/50"
              title="Widget Settings"
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </motion.button>

            {/* Help & Terminology Guide Button */}
            <button
              onClick={() => {
                // This will be handled by the parent component
                const event = new CustomEvent('openTerminologyGuide');
                window.dispatchEvent(event);
              }}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors duration-200 relative"
              title="Help & Sports Betting Glossary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {/* Notification dot for new users */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse border-2 border-white"></div>
            </button>
          </div>
        </div>

        {/* Sport Selector Dropdown */}
        {showSportSelector && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4"
          >
            <SportSelector onClose={() => setShowSportSelector(false)} />
          </motion.div>
        )}

        {/* Live Status Indicator */}
        <div className="absolute top-2 right-2">
          <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-white font-medium">LIVE</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WidgetHeader;