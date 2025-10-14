/**
 * Sport and League Selection Component
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useWidgetStore } from '../../stores/widgetStore';
import { SportType, LeagueType } from '../../types/widget';
import { HelpTooltip } from '../ui/HelpTooltip';

interface SportSelectorProps {
  onClose: () => void;
}

const SPORT_CONFIGS = {
  basketball: {
    name: 'Basketball',
    icon: '🏀',
    leagues: ['NBA', 'NCAAB'],
    description: 'Professional and college basketball leagues',
    color: 'bg-orange-500'
  },
  football: {
    name: 'Football', 
    icon: '🏈',
    leagues: ['NFL', 'NCAAF'],
    description: 'Professional and college football leagues',
    color: 'bg-green-600'
  },
  baseball: {
    name: 'Baseball',
    icon: '⚾',
    leagues: ['MLB'],
    description: 'Major League Baseball',
    color: 'bg-blue-600'
  },
  hockey: {
    name: 'Hockey',
    icon: '🏒', 
    leagues: ['NHL'],
    description: 'National Hockey League',
    color: 'bg-gray-600'
  },
  soccer: {
    name: 'Soccer',
    icon: '⚽',
    leagues: ['MLS'],
    description: 'Major League Soccer',
    color: 'bg-green-500'
  }
} as const;

const LEAGUE_DESCRIPTIONS = {
  NBA: 'National Basketball Association - Premier professional basketball',
  NFL: 'National Football League - Premier professional football', 
  MLB: 'Major League Baseball - Premier professional baseball',
  NHL: 'National Hockey League - Premier professional hockey',
  MLS: 'Major League Soccer - Premier professional soccer',
  NCAAB: 'NCAA Basketball - College basketball tournaments and regular season',
  NCAAF: 'NCAA Football - College football including bowl games'
};

export const SportSelector: React.FC<SportSelectorProps> = ({ onClose }) => {
  const { config, setConfig } = useWidgetStore();

  const toggleSport = (sport: SportType) => {
    const currentSports = config.sports || [];
    const newSports = currentSports.includes(sport)
      ? currentSports.filter(s => s !== sport)
      : [...currentSports, sport];
    
    setConfig({ 
      sports: newSports,
      // Also update leagues to match selected sports
      leagues: newSports.flatMap(s => SPORT_CONFIGS[s]?.leagues || []) as LeagueType[]
    });
  };

  const toggleLeague = (league: LeagueType) => {
    const currentLeagues = config.leagues || [];
    const newLeagues = currentLeagues.includes(league)
      ? currentLeagues.filter(l => l !== league)
      : [...currentLeagues, league];
    
    setConfig({ leagues: newLeagues });
  };

  const selectAllSports = () => {
    const allSports = Object.keys(SPORT_CONFIGS) as SportType[];
    const allLeagues = allSports.flatMap(s => SPORT_CONFIGS[s]?.leagues || []) as LeagueType[];
    setConfig({ 
      sports: allSports,
      leagues: allLeagues
    });
  };

  const clearAll = () => {
    setConfig({ 
      sports: [],
      leagues: []
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-2xl relative overflow-hidden"
    >
      {/* Sports-themed background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" viewBox="0 0 400 300">
          {/* Sports icons background pattern */}
          <defs>
            <pattern id="sportsIcons" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              {/* Basketball court */}
              <rect x="10" y="10" width="30" height="50" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <circle cx="25" cy="35" r="8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <path d="M17 35 Q25 27 33 35" fill="none" stroke="currentColor" strokeWidth="0.3"/>
              
              {/* Football field */}
              <rect x="50" y="20" width="25" height="40" fill="none" stroke="currentColor" strokeWidth="0.4"/>
              <line x1="50" y1="30" x2="75" y2="30" stroke="currentColor" strokeWidth="0.2"/>
              <line x1="50" y1="40" x2="75" y2="40" stroke="currentColor" strokeWidth="0.2"/>
              <line x1="50" y1="50" x2="75" y2="50" stroke="currentColor" strokeWidth="0.2"/>
              
              {/* Baseball diamond */}
              <path d="M25 70 L35 75 L25 80 L15 75 Z" fill="none" stroke="currentColor" strokeWidth="0.4"/>
              <circle cx="25" cy="75" r="2" fill="currentColor"/>
              
              {/* Hockey rink corner */}
              <path d="M60 70 Q70 70 70 75 Q70 80 60 80" fill="none" stroke="currentColor" strokeWidth="0.4"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sportsIcons)" className="text-gray-400"/>
        </svg>
      </div>

      {/* Gradient overlay for sports feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-blue-50/20 to-orange-50/30 pointer-events-none"></div>
      
      <div className="relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-800">Select Sports & Leagues</h3>
          <HelpTooltip 
            content="Choose which sports and leagues you want to see predictions for. More sports = more betting opportunities!" 
            term="Sport Selection"
            position="bottom"
          />
        </div>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={selectAllSports}
          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
        >
          Select All
        </button>
        <button
          onClick={clearAll}
          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Clear All
        </button>
        <div className="text-sm text-gray-700 flex items-center">
          {config.leagues?.length || 0} leagues selected
        </div>
      </div>

      {/* Sports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.entries(SPORT_CONFIGS) as [SportType, typeof SPORT_CONFIGS[SportType]][]).map(([sport, sportConfig]) => {
          const isSelected = config.sports?.includes(sport) || false;
          
          return (
            <motion.div
              key={sport}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-sm'
              }`}
              onClick={() => toggleSport(sport)}
            >
              {/* Sport Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg ${sportConfig.color} flex items-center justify-center text-white text-lg`}>
                    {sportConfig.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{sportConfig.name}</h4>
                    <p className="text-xs text-gray-700">{sportConfig.description}</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Leagues */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-800 uppercase tracking-wide">Leagues:</div>
                <div className="flex flex-wrap gap-2">
                  {sportConfig.leagues.map((league) => {
                    const isLeagueSelected = config.leagues?.includes(league as LeagueType) || false;
                    
                    return (
                      <button
                        key={league}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLeague(league as LeagueType);
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          isLeagueSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        title={LEAGUE_DESCRIPTIONS[league as keyof typeof LEAGUE_DESCRIPTIONS]}
                      >
                        {league}
                        <HelpTooltip 
                          content={LEAGUE_DESCRIPTIONS[league as keyof typeof LEAGUE_DESCRIPTIONS]}
                          size="md"
                          position="bottom"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Summary */}
      {config.leagues && config.leagues.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">
              Predictions enabled for: {config.leagues.join(', ')}
            </span>
          </div>
        </div>
      )}
      </div> {/* Close relative z-10 wrapper */}
    </motion.div>
  );
};