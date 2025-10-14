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
      {/* Enhanced Sports Betting Background */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" viewBox="0 0 1200 200" className="absolute inset-0">
          <defs>
            {/* Casino chip pattern */}
            <pattern id="casinoChips" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="12" fill="none" stroke="white" strokeWidth="0.8" opacity="0.4"/>
              <circle cx="20" cy="20" r="8" fill="none" stroke="white" strokeWidth="0.4" opacity="0.3"/>
              <text x="20" y="25" textAnchor="middle" fontSize="6" fill="white" opacity="0.3">$</text>
              
              <circle cx="60" cy="20" r="12" fill="none" stroke="white" strokeWidth="0.8" opacity="0.3"/>
              <circle cx="60" cy="20" r="8" fill="none" stroke="white" strokeWidth="0.4" opacity="0.2"/>
              
              <circle cx="20" cy="60" r="12" fill="none" stroke="white" strokeWidth="0.8" opacity="0.2"/>
              <rect x="16" y="56" width="8" height="8" fill="none" stroke="white" strokeWidth="0.4" opacity="0.3"/>
              
              <circle cx="60" cy="60" r="12" fill="none" stroke="white" strokeWidth="0.8" opacity="0.35"/>
              <path d="M52 60 L68 60 M60 52 L60 68" stroke="white" strokeWidth="0.4" opacity="0.3"/>
            </pattern>
            
            {/* Sports icons with betting elements */}
            <pattern id="bettingSports" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              {/* Basketball with odds */}
              <circle cx="25" cy="25" r="10" fill="none" stroke="white" strokeWidth="0.6" opacity="0.4"/>
              <path d="M17 25 Q25 17 33 25" fill="none" stroke="white" strokeWidth="0.4" opacity="0.4"/>
              <text x="25" y="45" textAnchor="middle" fontSize="4" fill="white" opacity="0.3">-110</text>
              
              {/* Football field with yard lines */}
              <rect x="65" y="15" width="30" height="20" fill="none" stroke="white" strokeWidth="0.6" opacity="0.3"/>
              <line x1="65" y1="20" x2="95" y2="20" stroke="white" strokeWidth="0.2" opacity="0.3"/>
              <line x1="65" y1="25" x2="95" y2="25" stroke="white" strokeWidth="0.2" opacity="0.3"/>
              <line x1="65" y1="30" x2="95" y2="30" stroke="white" strokeWidth="0.2" opacity="0.3"/>
              <text x="80" y="45" textAnchor="middle" fontSize="4" fill="white" opacity="0.3">O/U</text>
              
              {/* Dice and cards */}
              <rect x="15" y="65" width="8" height="8" fill="none" stroke="white" strokeWidth="0.4" opacity="0.3"/>
              <circle cx="19" cy="69" r="1" fill="white" opacity="0.3"/>
              <circle cx="19" cy="71" r="1" fill="white" opacity="0.3"/>
              
              <rect x="70" y="65" width="12" height="18" fill="none" stroke="white" strokeWidth="0.4" opacity="0.3"/>
              <text x="76" y="72" textAnchor="middle" fontSize="3" fill="white" opacity="0.3">A</text>
              <path d="M73 75 L79 75" stroke="white" strokeWidth="0.2" opacity="0.3"/>
            </pattern>
            
            {/* Money/profit symbols */}
            <pattern id="moneyPattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <text x="30" y="30" fontSize="12" fill="white" opacity="0.15">$</text>
              <text x="90" y="60" fontSize="8" fill="white" opacity="0.1">+EV</text>
              <text x="20" y="90" fontSize="6" fill="white" opacity="0.1">ROI</text>
              <path d="M60 20 Q70 10 80 20 Q70 30 60 20" fill="none" stroke="white" strokeWidth="0.3" opacity="0.1"/>
            </pattern>
          </defs>
          
          {/* Layer the patterns for rich betting atmosphere */}
          <rect width="100%" height="100%" fill="url(#casinoChips)"/>
          <rect width="100%" height="100%" fill="url(#bettingSports)" opacity="0.6"/>
          <rect width="100%" height="100%" fill="url(#moneyPattern)" opacity="0.4"/>
          
          {/* Stadium lights with betting glow */}
          <g opacity="0.15">
            <circle cx="150" cy="40" r="3" fill="white" filter="blur(1px)"/>
            <circle cx="350" cy="60" r="2.5" fill="white" filter="blur(1px)"/>
            <circle cx="550" cy="35" r="4" fill="white" filter="blur(1px)"/>
            <circle cx="750" cy="55" r="2" fill="white" filter="blur(1px)"/>
            <circle cx="950" cy="45" r="3.5" fill="white" filter="blur(1px)"/>
            
            {/* Betting board lines */}
            <line x1="0" y1="70" x2="1200" y2="70" stroke="white" strokeWidth="0.5" opacity="0.6"/>
            <line x1="0" y1="130" x2="1200" y2="130" stroke="white" strokeWidth="0.5" opacity="0.4"/>
            
            {/* Odds board grid */}
            <defs>
              <pattern id="oddsBoard" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.2"/>
                <circle cx="30" cy="30" r="2" fill="white" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#oddsBoard)" opacity="0.5"/>
          </g>
        </svg>
      </div>
      
      {/* Multi-layer gradient for depth and betting atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/25"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/15"></div>

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
                  🤖 Nova TitanAI
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/20 backdrop-blur-sm">
                  📊 Live Analysis
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-600/30 backdrop-blur-sm border border-blue-400/40">
                  🛡️ Companion Mode
                </span>
                <HelpTooltip content="Nova TitanAI analyzes team performance, stats, and key factors for winning predictions" position="bottom" />
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