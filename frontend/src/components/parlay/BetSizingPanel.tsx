/**
 * Bet Sizing Panel Component
 * Shows Kelly Criterion recommendations with confidence levels
 */

import React from 'react';
import { motion } from 'framer-motion';

interface BetSizingRecommendation {
  minBet: number;
  maxBet: number;
  recommendedBet: number;
  confidence: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  reasoning: string[];
  kellyFraction: number;
  expectedReturn: number;
}

interface BetSizingPanelProps {
  recommendation: BetSizingRecommendation;
  onClose: () => void;
}

const BetSizingPanel: React.FC<BetSizingPanelProps> = ({ recommendation, onClose }) => {
  const riskLevelColors = {
    conservative: 'text-green-400 bg-green-900/30 border-green-700',
    moderate: 'text-yellow-400 bg-yellow-900/30 border-yellow-700',
    aggressive: 'text-red-400 bg-red-900/30 border-red-700',
  };

  const riskLevelEmoji = {
    conservative: '🛡️',
    moderate: '⚖️',
    aggressive: '🔥',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-700 rounded-lg space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center">
          <span className="mr-2">💰</span>
          Bet Sizing Recommendation
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Risk Level */}
      <div className={`p-3 rounded-lg border ${riskLevelColors[recommendation.riskLevel]}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Risk Level</span>
          <span className="text-lg font-bold">
            {riskLevelEmoji[recommendation.riskLevel]} {recommendation.riskLevel.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Recommended Bet */}
      <div className="p-4 bg-black/30 rounded-lg">
        <p className="text-sm text-gray-400 mb-2">Recommended Bet Size</p>
        <p className="text-3xl font-bold text-white mb-1">
          ${recommendation.recommendedBet.toFixed(2)}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Kelly Fraction: {(recommendation.kellyFraction * 100).toFixed(2)}%
          </span>
          <span className={`font-semibold ${
            recommendation.confidence > 0.7 
              ? 'text-green-400' 
              : recommendation.confidence > 0.5 
                ? 'text-yellow-400' 
                : 'text-red-400'
          }`}>
            {(recommendation.confidence * 100).toFixed(0)}% confidence
          </span>
        </div>
      </div>

      {/* Bet Range */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-black/30 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Min Bet</p>
          <p className="text-lg font-bold text-gray-300">
            ${recommendation.minBet.toFixed(2)}
          </p>
        </div>
        <div className="p-3 bg-black/30 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Max Bet</p>
          <p className="text-lg font-bold text-gray-300">
            ${recommendation.maxBet.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Expected Return */}
      <div className="p-3 bg-black/30 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Expected Return</span>
          <span className={`text-lg font-bold ${
            recommendation.expectedReturn > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            ${recommendation.expectedReturn.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Reasoning */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-300">📊 Analysis</h4>
        <div className="space-y-2">
          {recommendation.reasoning.map((reason, index) => (
            <div key={index} className="flex items-start">
              <span className="mr-2 text-blue-400">•</span>
              <p className="text-sm text-gray-300 flex-1">{reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Confidence Level</span>
          <span className="text-sm font-semibold text-white">
            {(recommendation.confidence * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${recommendation.confidence * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              recommendation.confidence > 0.7 
                ? 'bg-green-500' 
                : recommendation.confidence > 0.5 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
            }`}
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
        <p className="text-xs text-blue-300">
          ℹ️ This recommendation uses the <strong>fractional Kelly Criterion (1/4 Kelly)</strong> for conservative bankroll management. 
          Never bet more than you can afford to lose.
        </p>
      </div>
    </motion.div>
  );
};

export default BetSizingPanel;
