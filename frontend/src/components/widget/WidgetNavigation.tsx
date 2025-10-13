/**
 * Widget Navigation Tabs Component
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useWidgetStore } from '../../stores/widgetStore';
import { WidgetTab } from '../../stores/widgetStore';
import { HelpTooltip } from '../ui/HelpTooltip';

const TABS = [
  {
    id: 'games' as WidgetTab,
    name: 'Games',
    icon: '🏈',
    description: 'Live games with odds and predictions'
  },
  {
    id: 'predictions' as WidgetTab,
    name: 'Predictions', 
    icon: '🤖',
    description: 'AI-powered game analysis and forecasts'
  },
  {
    id: 'parlays' as WidgetTab,
    name: 'Parlays',
    icon: '💰',
    description: 'Optimized multi-game betting combinations'
  },
  {
    id: 'settings' as WidgetTab,
    name: 'Settings',
    icon: '⚙️',
    description: 'Customize your widget preferences'
  }
];

export const WidgetNavigation: React.FC = () => {
  const { selectedTab, setSelectedTab } = useWidgetStore();

  return (
    <div className="widget-nav">
      <div className="flex justify-center items-center space-x-2 px-4">
        {TABS.map((tab) => {
          const isActive = selectedTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`widget-nav-item ${isActive ? 'active' : ''} group relative flex-shrink-0`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={false}
              animate={isActive ? { scale: 1.05 } : { scale: 1 }}
            >
              <div className="flex items-center space-x-3">
                <motion.span 
                  className="text-xl"
                  animate={isActive ? { rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {tab.icon}
                </motion.span>
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-sm">{tab.name}</span>
                  <span className="text-xs opacity-70 group-hover:opacity-100 transition-opacity">
                    {tab.description.split(' ').slice(0, 2).join(' ')}...
                  </span>
                </div>
                <HelpTooltip content={tab.description} size="sm" />
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white rounded-full"
                  layoutId="activeIndicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};