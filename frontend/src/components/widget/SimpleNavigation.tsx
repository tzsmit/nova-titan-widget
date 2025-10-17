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
    id: 'ai-insights' as WidgetTab,
    name: 'AI Pro',
    icon: '🧠'
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
    id: 'settings' as WidgetTab,
    name: 'Settings',
    icon: '⚙️'
  }
];

export const SimpleNavigation: React.FC = () => {
  const { selectedTab, setSelectedTab } = useWidgetStore();

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
      <div className="w-full max-w-screen-sm sm:max-w-screen-md mx-auto p-2 sm:p-4 flex flex-col gap-4">
        {/* Mobile-first responsive navigation */}
        <nav className="flex flex-wrap justify-between sm:justify-start gap-2 sm:gap-4 overflow-x-auto scrollbar-hide">
          <div className="flex bg-slate-900/50 rounded-xl p-1 border border-slate-600/50 w-full sm:w-auto overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const isActive = selectedTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`
                    min-w-[80px] sm:min-w-[120px] py-1 px-3 text-sm sm:text-base rounded-md font-medium flex-shrink-0
                    flex items-center justify-center gap-1 sm:gap-2 transition-all
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-sm sm:text-base">{tab.icon}</span>
                  <span className="hidden sm:inline whitespace-nowrap">{tab.name}</span>
                  <span className="sm:hidden text-xs text-center leading-tight">{tab.name.split(' ')[0]}</span>
                </motion.button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};