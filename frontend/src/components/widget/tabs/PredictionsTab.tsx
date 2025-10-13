import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWidgetStore } from '../../../stores/widgetStore';
import { HelpTooltip } from '../../ui/HelpTooltip';
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';

interface Prediction {
  id: string;
  game: string;
  team1: string;
  team2: string;
  predictionType: 'moneyline' | 'spread' | 'total';
  prediction: string;
  confidence: number;
  expectedValue: number;
  reason: string;
  aiModel: string;
}

const mockPredictions: Prediction[] = [
  {
    id: '1',
    game: 'Lakers vs Warriors',
    team1: 'Lakers',
    team2: 'Warriors',
    predictionType: 'moneyline',
    prediction: 'Lakers +110',
    confidence: 78,
    expectedValue: 12.5,
    reason: 'Strong home advantage, key player matchups favor Lakers',
    aiModel: 'Nova AI v2.1'
  },
  {
    id: '2',
    game: 'Celtics vs Heat',
    team1: 'Celtics',
    team2: 'Heat',
    predictionType: 'spread',
    prediction: 'Celtics -4.5',
    confidence: 85,
    expectedValue: 18.3,
    reason: 'Historical performance against spread, injury reports',
    aiModel: 'Nova AI v2.1'
  },
  {
    id: '3',
    game: 'Nuggets vs Suns',
    team1: 'Nuggets',
    team2: 'Suns',
    predictionType: 'total',
    prediction: 'Over 218.5',
    confidence: 72,
    expectedValue: 8.7,
    reason: 'Both teams averaging high scoring games recently',
    aiModel: 'Nova AI v2.1'
  }
];

export const PredictionsTab: React.FC = () => {
  const { config } = useWidgetStore();
  const [selectedSport, setSelectedSport] = useState('basketball');
  const [confidenceFilter, setConfidenceFilter] = useState(0);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <TrendingUp className="w-4 h-4" />;
    if (confidence >= 70) return <Target className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const filteredPredictions = mockPredictions.filter(
    pred => pred.confidence >= confidenceFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: config.colors.accent }} />
            Nova AI Predictions
          </h2>
          <p className="text-gray-400 text-sm">
            Powered by advanced machine learning algorithms
          </p>
        </div>
        <HelpTooltip 
          content="AI predictions analyze historical data, player stats, and market trends to identify value bets"
          position="left"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-400"
        >
          <option value="basketball">Basketball</option>
          <option value="football">Football</option>
          <option value="baseball">Baseball</option>
          <option value="hockey">Hockey</option>
        </select>

        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-sm">Min Confidence:</label>
          <input
            type="range"
            min="0"
            max="90"
            step="10"
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(Number(e.target.value))}
            className="w-20"
            style={{ accentColor: config.colors.accent }}
          />
          <span className="text-white text-sm w-8">{confidenceFilter}%</span>
        </div>
      </div>

      {/* Predictions List */}
      <div className="space-y-4">
        {filteredPredictions.map((prediction, index) => (
          <motion.div
            key={prediction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-white font-semibold">{prediction.game}</h3>
                <p className="text-gray-400 text-sm">{prediction.aiModel}</p>
              </div>
              <div className={`flex items-center gap-1 ${getConfidenceColor(prediction.confidence)}`}>
                {getConfidenceIcon(prediction.confidence)}
                <span className="font-semibold">{prediction.confidence}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-gray-400 text-sm">Prediction</p>
                <p className="text-white font-semibold text-lg">{prediction.prediction}</p>
                <p className="text-gray-500 text-xs capitalize">{prediction.predictionType}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Expected Value</p>
                <p className={`font-semibold ${prediction.expectedValue > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {prediction.expectedValue > 0 ? '+' : ''}{prediction.expectedValue.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="bg-gray-700 rounded p-3">
              <p className="text-gray-400 text-sm mb-1">Analysis</p>
              <p className="text-white text-sm">{prediction.reason}</p>
            </div>

            <div className="mt-3 flex justify-between items-center">
              <button
                className="text-sm px-3 py-1 rounded border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                View Details
              </button>
              <button
                className="text-sm px-3 py-1 rounded text-white transition-colors"
                style={{ 
                  backgroundColor: config.colors.accent,
                  borderColor: config.colors.accent 
                }}
              >
                Add to Parlay
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPredictions.length === 0 && (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No predictions match your criteria</p>
          <p className="text-gray-500 text-sm">Try lowering the confidence filter</p>
        </div>
      )}

      {/* AI Disclaimer */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div>
            <p className="text-white font-semibold text-sm mb-1">Nova AI Disclaimer</p>
            <p className="text-gray-400 text-xs">
              Predictions are based on statistical analysis and machine learning models. 
              Past performance does not guarantee future results. Always bet responsibly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};