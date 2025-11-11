/**
 * Parlay Leg Card Component
 * Individual leg display with edge detection and remove button
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useParlayStore, ParlayLeg } from '../../store/parlayStore';

interface ParlayLegCardProps {
  leg: ParlayLeg;
  index: number;
  edgeData?: {
    hasEdge: boolean;
    edge: number;
    reasoning: string;
  };
}

const ParlayLegCard: React.FC<ParlayLegCardProps> = ({ leg, index, edgeData }) => {
  const { removeLeg } = useParlayStore();

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const formatMarket = (market: string, selection: string, line?: number) => {
    switch (market) {
      case 'moneyline':
        return `${selection === 'home' ? leg.homeTeam : leg.awayTeam} ML`;
      case 'spread':
        return `${selection === 'home' ? leg.homeTeam : leg.awayTeam} ${line && line > 0 ? '+' : ''}${line}`;
      case 'total':
        return `${selection === 'over' ? 'Over' : 'Under'} ${line}`;
      case 'prop':
        return selection;
      default:
        return selection;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className="relative p-3 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors group"
    >
      {/* Leg Number */}
      <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
        {index + 1}
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeLeg(leg.id)}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove leg"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Edge Badge */}
      {edgeData && (
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
          edgeData.hasEdge 
            ? 'bg-green-900/50 text-green-400 border border-green-700'
            : edgeData.edge < -2 
              ? 'bg-red-900/50 text-red-400 border border-red-700'
              : 'bg-gray-700 text-gray-400 border border-gray-600'
        }`}>
          {edgeData.hasEdge ? '+' : ''}{edgeData.edge.toFixed(1)}% edge
        </div>
      )}

      {/* Game Info */}
      <div className="mb-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          {leg.sport.replace('_', ' ')}
        </p>
        <p className="text-sm font-medium text-gray-300">
          {leg.homeTeam} vs {leg.awayTeam}
        </p>
      </div>

      {/* Selection */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-base font-bold text-white">
            {formatMarket(leg.market, leg.selection, leg.line)}
          </p>
          <p className="text-xs text-gray-500">
            via {leg.bookmaker}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-blue-400">
            {formatOdds(leg.odds)}
          </p>
        </div>
      </div>

      {/* Edge Reasoning */}
      {edgeData && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-400">
            {edgeData.reasoning}
          </p>
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>
          {new Date(leg.commenceTime).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </span>
        <span className="flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
          Live
        </span>
      </div>
    </motion.div>
  );
};

export default ParlayLegCard;
