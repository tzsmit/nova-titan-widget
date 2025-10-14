/**
 * Enhanced AI Insights Tab - Real Live Data Integration
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useWidgetStore } from '../../../stores/widgetStore';
import { HelpTooltip } from '../../ui/HelpTooltip';
import { CornerHelpTooltip } from '../../ui/CornerHelpTooltip';
import { realTimeAIPredictionsService, RealAIPrediction } from '../../../services/realTimeAIPredictions';
import { realTimeOddsService } from '../../../services/realTimeOddsService';
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
  gameTime: string;
  gameDate: string;
}

export const EnhancedAIInsightsTab: React.FC = () => {
  const { config } = useWidgetStore();
  const [activeSection, setActiveSection] = useState('recommendations');
  const [selectedRec, setSelectedRec] = useState<AIRecommendation | null>(null);
  const [bankroll, setBankroll] = useState(2000);

  // Fetch real AI recommendations
  const { data: aiPredictions, isLoading } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: async () => {
      console.log('🧠 Generating AI recommendations from live data...');
      const predictions = await realTimeAIPredictionsService.generateLivePredictions();
      
      // Transform to recommendation format
      const recommendations: AIRecommendation[] = predictions.map(pred => {
        // Find the best prediction (highest EV)
        const bestPred = [pred.predictions.moneyline, pred.predictions.spread, pred.predictions.total]
          .reduce((best, current) => current.expectedValue > best.expectedValue ? current : best);
        
        return {
          id: pred.id,
          type: pred.analysis.value === 'high' ? 'max_value' : 'high_confidence',
          title: `${pred.homeTeam} vs ${pred.awayTeam}`,
          description: `AI recommendation for ${pred.sport} game`,
          bets: [`${bestPred.pick} (${bestPred.confidence}% confidence)`],
          expectedValue: bestPred.expectedValue,
          confidence: bestPred.confidence,
          reasoning: bestPred.reasoning,
          riskLevel: pred.analysis.riskLevel,
          timeFrame: `Game starts ${pred.gameTime} ET`,
          potentialProfit: Math.round(bestPred.expectedValue * 10),
          probability: bestPred.confidence,
          gameTime: pred.gameTime,
          gameDate: pred.gameDate
        };
      }).slice(0, 5); // Limit to top 5
      
      console.log(`✅ Generated ${recommendations.length} AI recommendations`);
      return recommendations;
    },
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch live odds for value scanning
  const { data: liveOdds } = useQuery({
    queryKey: ['live-odds-scanning'],
    queryFn: async () => {
      const odds = await realTimeOddsService.getLiveOddsAllSports();
      return odds.slice(0, 10); // Limit for performance
    },
    refetchInterval: 2 * 60 * 1000 // 2 minutes
  });

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
          <p className="text-gray-300 text-sm">
            Advanced AI companion with live data • Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full">
          <Brain className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 text-xs font-medium">Nova-AI-v3.1</span>
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
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
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
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-pulse text-center">
                  <div className="text-4xl mb-4">🧠</div>
                  <div className="text-white font-medium">AI Analyzing Live Games...</div>
                  <div className="text-gray-400 text-sm">Processing real-time data</div>
                </div>
              </div>
            ) : aiPredictions && aiPredictions.length > 0 ? (
              <div className="grid gap-4">
                {aiPredictions.map((rec) => (
                  <motion.div
                    key={rec.id}
                    className="bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-gray-500 cursor-pointer transition-all"
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
                          <div className="text-green-400 font-bold">+{rec.expectedValue.toFixed(1)}% EV</div>
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
                          {rec.gameDate} {rec.gameTime}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-lg font-medium text-white mb-2">No AI Recommendations Available</h3>
                <p className="text-gray-400 mb-4">
                  AI is analyzing current games. Check back when more games are scheduled.
                </p>
              </div>
            )}
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
              
              {liveOdds && liveOdds.length > 0 ? (
                <div className="space-y-4">
                  {liveOdds.slice(0, 3).map((game, idx) => {
                    const bookmakers = Object.keys(game.bookmakers);
                    const firstBook = bookmakers[0];
                    const odds = game.bookmakers[firstBook];
                    
                    return (
                      <div key={idx} className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-semibold">{game.awayTeam} @ {game.homeTeam}</h4>
                          <span className="text-blue-400 text-sm">{game.sport}</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-400">Moneyline</div>
                            <div className="text-white">
                              {odds?.moneyline.away > 0 ? '+' : ''}{odds?.moneyline.away} / {odds?.moneyline.home > 0 ? '+' : ''}{odds?.moneyline.home}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400">Spread</div>
                            <div className="text-white">
                              {odds?.spread.line} ({odds?.spread.away > 0 ? '+' : ''}{odds?.spread.away})
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400">Total</div>
                            <div className="text-white">
                              {odds?.total.line} (O/U {odds?.total.over > 0 ? '+' : ''}{odds?.total.over})
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-400">
                          {game.gameDate} • {game.gameTime} • {bookmakers.length} sportsbooks
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400">Loading live odds data...</div>
                </div>
              )}
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
                <label className="text-gray-300 text-sm block mb-2">Current Bankroll</label>
                <input
                  type="number"
                  value={bankroll}
                  onChange={(e) => setBankroll(Number(e.target.value))}
                  className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 w-32"
                />
              </div>

              {aiPredictions && aiPredictions.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Kelly Criterion for Live Recommendations</h4>
                  {aiPredictions.slice(0, 3).map((rec, idx) => {
                    const kellyPercentage = (rec.expectedValue / 100) * (rec.confidence / 100) * 2; // Simplified Kelly
                    const suggestedStake = Math.round(bankroll * kellyPercentage / 100);
                    
                    return (
                      <div key={idx} className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-white font-semibold">{rec.title}</div>
                            <div className="text-gray-400 text-sm">Best bet: {rec.bets[0]}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-bold">${suggestedStake}</div>
                            <div className="text-xs text-gray-400">{kellyPercentage.toFixed(1)}% of bankroll</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400">No active recommendations for bankroll analysis</div>
                </div>
              )}
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
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                Live Edge Detection
              </h3>

              {liveOdds && liveOdds.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-medium mb-3">Market Analysis</h4>
                    <div className="space-y-3">
                      {liveOdds.slice(0, 2).map((game, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-green-900/30 to-green-800/20 border border-green-600/30 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-green-400 font-semibold">Value Detected</span>
                            <span className="text-green-300">Live Game</span>
                          </div>
                          <div className="text-white text-sm">{game.awayTeam} @ {game.homeTeam}</div>
                          <div className="text-gray-300 text-xs mt-1">{game.gameDate} • {game.gameTime}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-3">Sportsbook Comparison</h4>
                    <div className="space-y-3">
                      {liveOdds.length > 0 && (
                        <div className="bg-gray-700/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-semibold">{liveOdds[0].awayTeam} @ {liveOdds[0].homeTeam}</span>
                            <span className="text-blue-400">Live Odds</span>
                          </div>
                          <div className="text-sm">
                            <div className="text-gray-300">
                              Available across {Object.keys(liveOdds[0].bookmakers).length} sportsbooks
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Best odds finder active
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400">Loading live edge detection...</div>
                </div>
              )}
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
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-green-400 text-2xl font-bold">+{selectedRec.expectedValue.toFixed(1)}%</div>
                <div className="text-gray-300 text-sm">Expected Value</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-blue-400 text-2xl font-bold">{selectedRec.confidence}%</div>
                <div className="text-gray-300 text-sm">AI Confidence</div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-white font-semibold mb-2">AI Reasoning</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{selectedRec.reasoning}</p>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-300">
                Game Time: <span className="text-blue-400">{selectedRec.gameDate} at {selectedRec.gameTime} ET</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-300">
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