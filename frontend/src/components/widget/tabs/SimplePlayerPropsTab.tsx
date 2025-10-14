/**
 * Simplified Player Props Tab - Easy Player Prop Betting
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User,
  Target,
  Star,
  TrendingUp,
  Loader2
} from 'lucide-react';

interface PlayerProp {
  id: string;
  playerName: string;
  team: string;
  propType: string;
  line: number;
  overOdds: number;
  underOdds: number;
  sport: string;
  confidence: number;
}

export const SimplePlayerPropsTab: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState('nfl');
  const [selectedPropType, setSelectedPropType] = useState('all');

  // Sample player props
  const playerProps: PlayerProp[] = [
    {
      id: '1',
      playerName: 'Josh Allen',
      team: 'Buffalo Bills',
      propType: 'passing_yards',
      line: 275.5,
      overOdds: -110,
      underOdds: -110,
      sport: 'nfl',
      confidence: 89
    },
    {
      id: '2',
      playerName: 'Christian McCaffrey',
      team: 'San Francisco 49ers',
      propType: 'rushing_yards',
      line: 95.5,
      overOdds: -115,
      underOdds: -105,
      sport: 'nfl',
      confidence: 92
    },
    {
      id: '3',
      playerName: 'Cooper Kupp',
      team: 'Los Angeles Rams',
      propType: 'receiving_yards',
      line: 85.5,
      overOdds: -108,
      underOdds: -112,
      sport: 'nfl',
      confidence: 85
    },
    {
      id: '4',
      playerName: 'Luka Dončić',
      team: 'Dallas Mavericks',
      propType: 'points',
      line: 28.5,
      overOdds: -110,
      underOdds: -110,
      sport: 'nba',
      confidence: 87
    },
    {
      id: '5',
      playerName: 'Nikola Jokić',
      team: 'Denver Nuggets',
      propType: 'rebounds',
      line: 12.5,
      overOdds: -105,
      underOdds: -115,
      sport: 'nba',
      confidence: 91
    }
  ];

  const formatPropType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'passing_yards': 'Passing Yards',
      'rushing_yards': 'Rushing Yards',
      'receiving_yards': 'Receiving Yards',
      'points': 'Points',
      'rebounds': 'Rebounds',
      'assists': 'Assists'
    };
    return typeMap[type] || type;
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 80) return 'text-blue-400';
    if (confidence >= 70) return 'text-yellow-400';
    return 'text-slate-400';
  };

  // Filter props
  const filteredProps = playerProps.filter(prop => {
    if (prop.sport !== selectedSport) return false;
    if (selectedPropType !== 'all' && prop.propType !== selectedPropType) return false;
    return true;
  });

  const propTypes = selectedSport === 'nfl' 
    ? [
        { value: 'all', label: 'All Props' },
        { value: 'passing_yards', label: 'Passing Yards' },
        { value: 'rushing_yards', label: 'Rushing Yards' },
        { value: 'receiving_yards', label: 'Receiving Yards' }
      ]
    : [
        { value: 'all', label: 'All Props' },
        { value: 'points', label: 'Points' },
        { value: 'rebounds', label: 'Rebounds' },
        { value: 'assists', label: 'Assists' }
      ];

  return (
    <div className="bg-slate-900 min-h-screen">
      {/* Simple Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <h1 className="text-xl font-bold text-white">Player Props</h1>
      </div>

      {/* Simple Filters */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Sport</label>
            <select 
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-1 text-sm"
            >
              <option value="nfl">🏈 NFL</option>
              <option value="nba">🏀 NBA</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Prop Type</label>
            <select 
              value={selectedPropType}
              onChange={(e) => setSelectedPropType(e.target.value)}
              className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-1 text-sm"
            >
              {propTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Props List */}
      <div className="p-4">
        {filteredProps.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg">No props available</div>
            <div className="text-slate-500 text-sm mt-2">Try selecting different filters</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProps.map((prop, index) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-blue-500 transition-colors"
              >
                {/* Player Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{prop.playerName}</div>
                      <div className="text-sm text-slate-400">{prop.team}</div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${getConfidenceColor(prop.confidence)}`}>
                    <Star className="h-4 w-4" />
                    <span className="font-semibold text-sm">{prop.confidence}%</span>
                  </div>
                </div>

                {/* Prop Details */}
                <div className="text-center mb-4">
                  <div className="text-sm text-slate-400 mb-1">
                    {formatPropType(prop.propType)}
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {prop.line}
                  </div>
                </div>

                {/* Betting Options */}
                <div className="space-y-2">
                  <button className="w-full bg-slate-700 hover:bg-green-700 border border-slate-600 hover:border-green-500 rounded-lg p-3 transition-all group">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Over {prop.line}</span>
                      <span className="text-green-400 font-semibold group-hover:text-white">
                        {formatOdds(prop.overOdds)}
                      </span>
                    </div>
                  </button>
                  
                  <button className="w-full bg-slate-700 hover:bg-red-700 border border-slate-600 hover:border-red-500 rounded-lg p-3 transition-all group">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Under {prop.line}</span>
                      <span className="text-red-400 font-semibold group-hover:text-white">
                        {formatOdds(prop.underOdds)}
                      </span>
                    </div>
                  </button>
                </div>

                {/* AI Insight */}
                <div className="mt-4 bg-slate-700 rounded p-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3 text-blue-400" />
                    <span className="text-xs text-slate-300">
                      AI suggests: {prop.confidence >= 85 ? 'Strong' : 'Moderate'} confidence
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Simple Footer */}
      <div className="text-center p-4 border-t border-slate-700">
        <div className="text-slate-500 text-sm">
          Player Props by{' '}
          <a 
            href="https://novatitan.net/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-400 hover:text-blue-300 underline"
          >
            novatitan.net
          </a>
        </div>
      </div>
    </div>
  );
};