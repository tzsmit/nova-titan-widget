/**
 * Simplified Widget Navigation - Clean and Easy to Use
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useWidgetStore } from '../../stores/widgetStore';
import { WidgetTab } from '../../stores/widgetStore';

const SIMPLE_TABS = [
  {
    id: 'games' as WidgetTab,
    name: 'Games',
    icon: '🏈'
  },
  {
    id: 'predictions' as WidgetTab,
    name: 'AI Picks', 
    icon: '🤖'
  },
  {
    id: 'parlays' as WidgetTab,
    name: 'Parlays',
    icon: '💰'
  },
  {
    id: 'player-props' as WidgetTab,
    name: 'Props',
    icon: '🎯'
  },
  {
    id: 'settings' as WidgetTab,
    name: 'Settings',
    icon: '⚙️'
  }
];

export const SimpleWidgetNavigation: React.FC = () => {
  const { selectedTab, setSelectedTab } = useWidgetStore();

  return (
    <div className="bg-slate-800 border-b border-slate-700 px-4 py-2">
      <div className="flex justify-center items-center gap-2">
        {SIMPLE_TABS.map((tab) => {
          const isActive = selectedTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};