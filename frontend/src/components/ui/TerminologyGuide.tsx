/**
 * Sports Betting Terminology Guide Component
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpTooltip } from './HelpTooltip';

interface TerminologyGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const TERMINOLOGY = {
  'Betting Basics': {
    'Moneyline (ML)': 'A bet on which team will win the game straight up, regardless of the point spread',
    'Point Spread': 'The predicted margin of victory. Favorite must win by more than the spread',
    'Total/Over-Under (O/U)': 'A bet on whether the combined score will be over or under a set number',
    'Juice/Vig': 'The commission charged by sportsbooks, typically -110 means you bet $110 to win $100',
    'Push': 'When a bet results in a tie (e.g., team wins by exactly the spread)',
    'Cover': 'When a team beats the point spread (favorite wins by more than spread, or underdog loses by less)'
  },
  'Odds & Probability': {
    'American Odds': 'Odds format using + and - numbers. +150 means bet $100 to win $150. -150 means bet $150 to win $100',
    'Decimal Odds': 'Odds showing total return per dollar bet. 2.50 odds means $1 bet returns $2.50 total',
    'Implied Probability': 'The probability of an outcome based on the odds. Used to find betting value',
    'Expected Value (EV)': 'The theoretical profit/loss of a bet over time. Positive EV = profitable long-term',
    'True Odds': 'The actual probability of an outcome without bookmaker margin',
    'Line Movement': 'How odds change over time due to betting action and new information'
  },
  'Advanced Betting': {
    'Parlay': 'A bet combining multiple selections. All must win for payout, but odds multiply for bigger returns',
    'Kelly Criterion': 'Mathematical formula for optimal bet sizing based on edge and bankroll',
    'Bankroll Management': 'Strategy for managing your betting funds to minimize risk of ruin',
    'Unit Size': 'Standard bet amount, typically 1-5% of total bankroll',
    'Sharp vs Square': 'Professional bettors (sharp) vs casual public bettors (square)',
    'Line Shopping': 'Comparing odds across multiple sportsbooks to find the best price'
  },
  'AI & Analytics': {
    'Model Confidence': 'How certain our AI is about a prediction, based on data quality and model agreement',
    'Ensemble Model': 'Combining multiple AI algorithms for more accurate predictions',
    'Feature Importance': 'Which factors (team strength, injuries, etc.) most influence the prediction',
    'Calibration': 'How well predicted probabilities match actual outcomes over time',
    'Backtesting': 'Testing model performance on historical data to validate accuracy',
    'ELO Rating': 'Dynamic rating system that adjusts team strength based on game results'
  },
  'Risk Management': {
    'Responsible Gaming': 'Betting within your means and maintaining control over gambling habits',
    'Stop Loss': 'Predetermined loss limit to prevent chasing losses',
    'Variance': 'Natural ups and downs in betting results, even with good strategy',
    'Regression to Mean': 'Tendency for extreme results to move toward average over time',
    'Bankroll Requirements': 'Minimum funds needed to withstand losing streaks while following strategy',
    'Risk of Ruin': 'Probability of losing entire bankroll given current betting strategy'
  }
};

export const TerminologyGuide: React.FC<TerminologyGuideProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = Object.keys(TERMINOLOGY);
  
  const filteredTerms = selectedCategory 
    ? { [selectedCategory]: TERMINOLOGY[selectedCategory as keyof typeof TERMINOLOGY] }
    : searchTerm 
      ? Object.fromEntries(
          Object.entries(TERMINOLOGY).map(([category, terms]) => [
            category,
            Object.fromEntries(
              Object.entries(terms).filter(([term, definition]) =>
                term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                definition.toLowerCase().includes(searchTerm.toLowerCase())
              )
            )
          ]).filter(([, terms]) => Object.keys(terms).length > 0)
        )
      : TERMINOLOGY;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-start justify-center p-4 pt-16 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-slate-600"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white px-6 py-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Nova Titan Elite Glossary</h2>
              <p className="text-slate-300 text-sm mt-1">
                Professional sports betting terminology • <a href="https://novatitan.net/" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 underline transition-colors">novatitan.net</a>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(80vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-slate-700 bg-slate-800/50">
            {/* Search */}
            <div className="p-4 border-b border-slate-700">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search terms..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedCategory(null);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm placeholder-slate-400"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="p-2">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchTerm('');
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${
                  !selectedCategory && !searchTerm
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                All Terms
              </button>
              
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSearchTerm('');
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {Object.entries(filteredTerms).map(([category, terms]) => (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    {category}
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                      {Object.keys(terms).length} terms
                    </span>
                  </h3>
                  
                  <div className="grid gap-4">
                    {Object.entries(terms).map(([term, definition]) => (
                      <motion.div
                        key={term}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-base mb-2">
                              {term}
                            </h4>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {definition}
                            </p>
                          </div>
                          <HelpTooltip 
                            content={`${term}: ${definition}`}
                            term={term}
                            size="lg"
                            position="left"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
              
              {Object.keys(filteredTerms).length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No terms found</h3>
                  <p className="text-gray-700">Try a different search term or browse categories.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              💡 <strong>Tip:</strong> Hover over any term in the app for instant definitions
            </div>
            <div>
              {Object.values(filteredTerms).reduce((total, terms) => total + Object.keys(terms).length, 0)} total terms
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};