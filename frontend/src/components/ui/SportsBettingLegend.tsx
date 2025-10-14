/**
 * Comprehensive Sports Betting Legend and Help System
 * Explains all terminology and concepts for beginners
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  X, 
  TrendingUp, 
  Calculator, 
  Target, 
  DollarSign,
  Activity,
  Brain,
  Award,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface LegendSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  items: { term: string; definition: string; example?: string }[];
}

const legendSections: LegendSection[] = [
  {
    id: 'odds',
    title: 'Understanding Odds',
    icon: Calculator,
    items: [
      {
        term: 'Positive Odds (+150)',
        definition: 'Amount of profit you win on a $100 bet',
        example: '+150 means $100 bet wins $150 profit (total return: $250)'
      },
      {
        term: 'Negative Odds (-200)',
        definition: 'Amount you need to bet to win $100 profit',
        example: '-200 means bet $200 to win $100 profit (total return: $300)'
      },
      {
        term: 'Even Odds (+100)',
        definition: 'Equal risk and reward',
        example: '$100 bet wins $100 profit (total return: $200)'
      }
    ]
  },
  {
    id: 'bet_types',
    title: 'Types of Bets',
    icon: Target,
    items: [
      {
        term: 'Moneyline',
        definition: 'Bet on which team wins the game outright',
        example: 'Chiefs -150 vs Raiders +130 (Chiefs favored to win)'
      },
      {
        term: 'Point Spread',
        definition: 'Betting with a point handicap to even the odds',
        example: 'Chiefs -7.5 means they must win by 8+ points to cover'
      },
      {
        term: 'Total (Over/Under)',
        definition: 'Bet on combined score of both teams',
        example: 'Total 47.5 - bet Over if you think combined score > 47.5'
      },
      {
        term: 'Player Props',
        definition: 'Bets on individual player statistics',
        example: 'Mahomes Over 2.5 Passing TDs, Over 275.5 Passing Yards'
      }
    ]
  },
  {
    id: 'parlay',
    title: 'Parlay Betting',
    icon: TrendingUp,
    items: [
      {
        term: 'Parlay',
        definition: 'Combination bet requiring ALL selections to win',
        example: '3-leg parlay: Chiefs -7, Over 47.5, Mahomes 2+ TDs'
      },
      {
        term: 'Parlay Odds',
        definition: 'Higher potential payout but all legs must hit',
        example: '3 legs at +100 each = approximately +600 parlay odds'
      },
      {
        term: 'Push',
        definition: 'When a bet ties exactly on the line',
        example: 'Spread is -7, team wins by exactly 7 = push (bet refunded)'
      },
      {
        term: 'Leg',
        definition: 'Individual bet within a parlay',
        example: 'A 4-leg parlay has 4 separate bets that must all win'
      }
    ]
  },
  {
    id: 'ai_features',
    title: 'AI Predictions',
    icon: Brain,
    items: [
      {
        term: 'Confidence Score',
        definition: 'AI certainty level in the prediction (0-100%)',
        example: '85% confidence = AI is very confident in this prediction'
      },
      {
        term: 'Expected Value (EV)',
        definition: 'Long-term profitability of a bet',
        example: '+5% EV means theoretically profitable over many bets'
      },
      {
        term: 'AI Analysis',
        definition: 'Algorithmic evaluation of team stats and trends',
        example: 'Considers injuries, recent form, head-to-head records'
      },
      {
        term: 'Live Odds',
        definition: 'Real-time odds from multiple sportsbooks',
        example: 'Updated every few minutes across 10+ major sportsbooks'
      }
    ]
  },
  {
    id: 'strategy',
    title: 'Betting Strategy',
    icon: Award,
    items: [
      {
        term: 'Bankroll Management',
        definition: 'Only bet what you can afford to lose',
        example: 'Never bet more than 1-5% of total bankroll per bet'
      },
      {
        term: 'Line Shopping',
        definition: 'Compare odds across different sportsbooks',
        example: 'Chiefs -6.5 at one book, -7 at another (take -6.5)'
      },
      {
        term: 'Hedge Betting',
        definition: 'Placing opposite bets to guarantee profit/minimize loss',
        example: 'Bet against your parlay before final leg to guarantee profit'
      },
      {
        term: 'Arbitrage',
        definition: 'Risk-free profit by exploiting odds differences',
        example: 'Different odds on same game at different sportsbooks'
      }
    ]
  },
  {
    id: 'warnings',
    title: 'Important Warnings',
    icon: AlertTriangle,
    items: [
      {
        term: 'Gambling Addiction',
        definition: 'Sports betting can be addictive - bet responsibly',
        example: 'Set limits, take breaks, seek help if needed'
      },
      {
        term: 'No Guarantees',
        definition: 'All predictions are estimates - no guaranteed wins',
        example: 'Even 95% confidence predictions can lose'
      },
      {
        term: 'Educational Purpose',
        definition: 'This tool is for learning and entertainment',
        example: 'Not professional gambling advice - do your own research'
      },
      {
        term: 'Legal Considerations',
        definition: 'Check local laws regarding sports betting',
        example: 'Sports betting laws vary by state and country'
      }
    ]
  }
];

interface SportsBettingLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SportsBettingLegend: React.FC<SportsBettingLegendProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedSection, setSelectedSection] = useState<string>(legendSections[0].id);

  const currentSection = legendSections.find(s => s.id === selectedSection);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl z-50 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-slate-100">Sports Betting Guide</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="w-80 border-r border-slate-700 bg-slate-800/50">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Topics</h3>
                  <div className="space-y-1">
                    {legendSections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setSelectedSection(section.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                            selectedSection === section.id
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700'
                          }`}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="font-medium">{section.title}</span>
                          <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {currentSection && (
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <currentSection.icon className="h-6 w-6 text-blue-400" />
                      <h3 className="text-xl font-bold text-slate-100">{currentSection.title}</h3>
                    </div>

                    <div className="space-y-6">
                      {currentSection.items.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-slate-800/50 rounded-lg p-5 border border-slate-700"
                        >
                          <h4 className="font-semibold text-slate-100 mb-2 text-lg">{item.term}</h4>
                          <p className="text-slate-300 leading-relaxed mb-3">{item.definition}</p>
                          {item.example && (
                            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
                              <p className="text-blue-200 text-sm">
                                <span className="font-medium text-blue-100">Example: </span>
                                {item.example}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-700 p-4 bg-slate-800/50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  Sports betting involves risk. Please gamble responsibly.
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};