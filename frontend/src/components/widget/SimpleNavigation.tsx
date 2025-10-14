/**
 * Simplified Widget Navigation - Clean and Intuitive
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useWidgetStore } from '../../stores/widgetStore';
import { WidgetTab } from '../../stores/widgetStore';

const TABS = [
  {
    id: 'games' as WidgetTab,
    name: 'Games',
    icon: '🏈'
  },
  {
    id: 'predictions' as WidgetTab,
    name: 'AI Predictions', 
    icon: '🤖'
  },
  {
    id: 'parlays' as WidgetTab,
    name: 'Parlays',
    icon: '💰'
  },
  {
    id: 'player-props' as WidgetTab,
    name: 'Player Props',
    icon: '🎯'
  },
  {
    id: 'ai-insights' as WidgetTab,
    name: 'AI Pro',
    icon: '🧠'
  },
  {
    id: 'settings' as WidgetTab,
    name: 'Settings',
    icon: '⚙️'
  }
];

export const SimpleNavigation: React.FC = () => {
  const { selectedTab, setSelectedTab } = useWidgetStore();

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
      <div className="flex items-center justify-center px-4 py-3">
        <div className="flex bg-slate-900/50 rounded-xl p-1 border border-slate-600/50">
          {TABS.map((tab) => {
            const isActive = selectedTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="whitespace-nowrap">{tab.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};