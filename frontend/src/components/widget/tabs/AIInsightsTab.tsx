/**
 * AI Insights Tab - Advanced AI-powered betting analysis and recommendations
 * This is what makes Nova Titan the best AI companion in sports betting
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWidgetStore } from '../../../stores/widgetStore';
import { HelpTooltip } from '../../ui/HelpTooltip';
import { CornerHelpTooltip } from '../../ui/CornerHelpTooltip';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  AlertTriangle,
  DollarSign,
  Calculator,
  Eye,
  BarChart3,
  Lightbulb,
  Shield,
  Award,
  Clock,
  ArrowRight,
  Star,
  Flame
} from 'lucide-react';
import { LiveOddsDisplay } from '../LiveOddsDisplay';

interface AIRecommendation {
  id: string;
  type: 'max_value' | 'high_confidence' | 'arbitrage' | 'correlation' | 'contrarian';
  title: string;
  description: string;
  bets: string[];
  expectedValue: number;
  confidence: number;
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
  timeFrame: string;
  potentialProfit: number;
  probability: number;
}

const AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: 'rec1',
    type: 'max_value',
    title: 'Maximum Value Play',
    description: 'Highest expected value bet across all markets',
    bets: ['LeBron James Over 28.5 Points', 'Lakers Moneyline'],
    expectedValue: 12.8,
    confidence: 87,
    reasoning: 'Nova TitanAI: Historical data shows LeBron averages 31.2 points in nationally televised games. Lakers are 8-2 when LeBron scores 29+. Oddsmakers undervaluing this correlation.',
    riskLevel: 'medium',
    timeFrame: '2h 15m until game',
    potentialProfit: 156,
    probability: 74
  },
  {
    id: 'rec2', 
    type: 'arbitrage',
    title: 'Arbitrage Opportunity',
    description: 'Guaranteed profit across multiple sportsbooks',
    bets: ['Chiefs -3 (-108)', 'Bills +3.5 (-105)'],
    expectedValue: 8.3,
    confidence: 100,
    reasoning: 'Price discrepancy detected across books. Bet Chiefs -3 at Book A and Bills +3.5 at Book B for guaranteed 2.1% profit regardless of outcome.',
    riskLevel: 'low',
    timeFrame: 'Expires in 12m',
    potentialProfit: 21,
    probability: 100
  },
  {
    id: 'rec3',
    type: 'correlation',
    title: 'Correlated Parlay Edge',
    description: 'Positively correlated outcomes underpriced by books',
    bets: ['Nuggets vs Suns Over 228.5', 'Nikola Jokic Triple-Double'],
    expectedValue: 15.2,
    confidence: 71,
    reasoning: 'When games go over 225 points, Jokic records triple-double 68% of time vs 32% implied odds. Books not pricing this correlation correctly.',
    riskLevel: 'medium',
    timeFrame: '1h 45m until game',
    potentialProfit: 340,
    probability: 48
  },
  {
    id: 'rec4',
    type: 'high_confidence',
    title: 'High Confidence Lock',
    description: 'AI model shows exceptional edge on this outcome',
    bets: ['Connor McDavid Over 1.5 Points'],
    expectedValue: 9.7,
    confidence: 91,
    reasoning: 'McDavid has 1.5+ points in 23 of last 25 games. Opponent allows 2.8 points/game to top-line centers. Weather conditions favor high-scoring game.',
    riskLevel: 'low',
    timeFrame: '3h 20m until game',
    potentialProfit: 97,
    probability: 82
  },
  {
    id: 'rec5',
    type: 'contrarian',
    title: 'Contrarian Value',
    description: 'Public heavily on one side, creating value on other',
    bets: ['Rangers Moneyline +105'],
    expectedValue: 7.4,
    confidence: 64,
    reasoning: '87% of public money on Bruins, but Rangers are 12-3 as road underdogs this season. Market overreaction to recent Bruins win streak.',
    riskLevel: 'medium',
    timeFrame: '4h 10m until game',
    potentialProfit: 105,
    probability: 58
  }
];

const BANKROLL_SUGGESTIONS = [
  {
    bet: 'LeBron James Over 28.5 Points',
    kellyPercentage: 3.2,
    suggestedStake: 64,
    maxStake: 80,
    reasoning: 'Kelly Criterion suggests 3.2% of bankroll based on edge and confidence'
  },
  {
    bet: 'Chiefs -3 Arbitrage',
    kellyPercentage: 5.0,
    suggestedStake: 100,
    maxStake: 100,
    reasoning: 'Risk-free arbitrage - use maximum comfortable amount'
  }
];

export const AIInsightsTab: React.FC = () => {
  const { config } = useWidgetStore();
  const [activeSection, setActiveSection] = useState('recommendations');
  const [selectedRec, setSelectedRec] = useState<AIRecommendation | null>(null);
  const [bankroll, setBankroll] = useState(2000);

  const sections = [
    { 
      id: 'recommendations', 
      label: 'AI Picks', 
      icon: Brain,
      description: 'Smart bet recommendations with maximum value, arbitrage opportunities, and high-confidence predictions from Nova TitanAI'
    },
    { 
      id: 'value', 
      label: 'Value Scanner', 
      icon: Target,
      description: 'Real-time odds comparison across multiple sportsbooks to find the best value and market inefficiencies'
    },
    { 
      id: 'bankroll', 
      label: 'Bankroll AI', 
      icon: Calculator,
      description: 'Kelly Criterion calculator and smart bet sizing recommendations to optimize your bankroll management'
    },
    { 
      id: 'edges', 
      label: 'Live Edges', 
      icon: Eye,
      description: 'Live market monitoring to detect sharp money movement, steam moves, and contrarian opportunities'
    }
  ];

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'max_value': return <Star className="w-4 h-4 text-yellow-400" />;
      case 'arbitrage': return <Shield className="w-4 h-4 text-green-400" />;
      case 'correlation': return <Zap className="w-4 h-4 text-purple-400" />;
      case 'high_confidence': return <Award className="w-4 h-4 text-blue-400" />;
      case 'contrarian': return <Flame className="w-4 h-4 text-orange-400" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'high': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Page Help Button */}
      <div className="absolute top-4 right-4 z-10">
        <CornerHelpTooltip 
          content="Advanced AI betting intelligence and edge detection. Find arbitrage opportunities, get value betting recommendations, and use professional bankroll management tools."
          term="AI Pro"
          size="md"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6" style={{ color: config.colors?.accent }} />
            Nova TitanAI Intelligence Center
          </h2>
          <p className="text-gray-400 text-sm">
            Advanced AI companion to guide your betting decisions
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full">
          <Brain className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 text-xs font-medium">Nova TitanAI v2.1</span>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all relative group ${
              activeSection === section.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.label}
            <HelpTooltip content={section.description} size="md" />
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSection === 'recommendations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="grid gap-4">
              {AI_RECOMMENDATIONS.map((rec) => (
                <motion.div
                  key={rec.id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 cursor-pointer transition-all"
                  onClick={() => setSelectedRec(rec)}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getRecommendationIcon(rec.type)}
                      <h3 className="text-white font-semibold">{rec.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(rec.riskLevel)}`}>
                        {rec.riskLevel} risk
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-green-400 font-bold">+{rec.expectedValue}% EV</div>
                        <div className="text-xs text-gray-400">{rec.confidence}% confidence</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3">{rec.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      {rec.bets.map((bet, idx) => (
                        <div key={idx} className="text-blue-400 text-xs font-mono">{bet}</div>
                      ))}
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">${rec.potentialProfit} profit</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {rec.timeFrame}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeSection === 'value' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Real-Time Value Scanner
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Best Value Detected</span>
                    <span className="text-green-400 font-bold">+18.7% EV</span>
                  </div>
                  <div className="text-white font-semibold">McDavid Over 1.5 Points</div>
                  <div className="text-blue-400 text-sm">Best odds: -115 @ BetMGM</div>
                  <div className="text-xs text-gray-500 mt-2">Fair value: -145 (AI calculated)</div>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Arbitrage Alert</span>
                    <span className="text-blue-400 font-bold">2.1% Risk-Free</span>
                  </div>
                  <div className="text-white font-semibold">Chiefs vs Bills Spread</div>
                  <div className="text-green-400 text-sm">Guaranteed profit opportunity</div>
                  <div className="text-xs text-gray-500 mt-2">Expires in 8 minutes</div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-white font-medium mb-3">Live Odds Movement</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-900/30 rounded">
                    <span className="text-gray-300 text-sm">Lakers Moneyline</span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 text-sm">+110 → +115</span>
                      <TrendingUp className="w-3 h-3 text-green-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-900/30 rounded">
                    <span className="text-gray-300 text-sm">Chiefs -3</span>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-sm">-110 → -108</span>
                      <TrendingUp className="w-3 h-3 text-green-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'bankroll' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-400" />
                AI Bankroll Management
              </h3>

              <div className="mb-6">
                <label className="text-gray-400 text-sm block mb-2">Current Bankroll</label>
                <input
                  type="number"
                  value={bankroll}
                  onChange={(e) => setBankroll(Number(e.target.value))}
                  className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 w-32"
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-medium">Kelly Criterion Recommendations</h4>
                {BANKROLL_SUGGESTIONS.map((suggestion, idx) => (
                  <div key={idx} className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-white font-semibold">{suggestion.bet}</div>
                        <div className="text-gray-400 text-sm">{suggestion.reasoning}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">${suggestion.suggestedStake}</div>
                        <div className="text-xs text-gray-400">{suggestion.kellyPercentage}% of bankroll</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                      <span className="text-gray-400 text-sm">Max recommended: ${suggestion.maxStake}</span>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        Apply Kelly
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 font-semibold text-sm">AI Bankroll Tip</span>
                </div>
                <p className="text-blue-200 text-sm">
                  Based on your current performance and risk tolerance, consider reducing unit sizes by 15% 
                  until you hit a 10-game winning streak. This protects against variance while maintaining growth.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'edges' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Live Edge Detection with Real Odds */}
            <LiveOddsDisplay sport="americanfootball_nfl" />

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                Live Edge Detection
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Market Inefficiencies</h4>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-green-900/30 to-green-800/20 border border-green-600/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-green-400 font-semibold">High Edge Detected</span>
                        <span className="text-green-300">+22.4% EV</span>
                      </div>
                      <div className="text-white text-sm">Jokic Triple-Double vs Game Total correlation</div>
                      <div className="text-gray-400 text-xs mt-1">Books underpricing by 18%</div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 border border-blue-600/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-blue-400 font-semibold">Steam Move</span>
                        <span className="text-blue-300">Sharp Action</span>
                      </div>
                      <div className="text-white text-sm">Rangers +1.5 massive line movement</div>
                      <div className="text-gray-400 text-xs mt-1">Follow the smart money</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3">Public vs Sharp</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">Cowboys vs Eagles</span>
                        <span className="text-orange-400">Contrarian Value</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Public Money</div>
                          <div className="text-white">78% on Cowboys</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Sharp Money</div>
                          <div className="text-white">65% on Eagles</div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <span className="text-green-400 text-xs">Fade the public: Eagles +3.5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendation Detail Modal */}
      {selectedRec && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedRec(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-lg max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getRecommendationIcon(selectedRec.type)}
                <h3 className="text-xl font-bold text-white">{selectedRec.title}</h3>
              </div>
              <button
                onClick={() => setSelectedRec(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="text-green-400 text-2xl font-bold">+{selectedRec.expectedValue}%</div>
                <div className="text-gray-400 text-sm">Expected Value</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="text-blue-400 text-2xl font-bold">{selectedRec.confidence}%</div>
                <div className="text-gray-400 text-sm">AI Confidence</div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-white font-semibold mb-2">AI Reasoning</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{selectedRec.reasoning}</p>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Potential Profit: <span className="text-green-400 font-semibold">${selectedRec.potentialProfit}</span>
              </div>
              <button className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors">
                📋 Track Bet
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};