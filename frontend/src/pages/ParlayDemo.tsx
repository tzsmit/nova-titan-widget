/**
 * Parlay Demo Page
 * 
 * Showcases all Phase 3 frontend components:
 * - Parlay Drawer with real-time optimization
 * - Bookmaker Picker
 * - Line Shopping Table
 * - Live Score Widget
 * - Filter Bar
 * 
 * Phase 3: Frontend UI
 */

import React, { useState } from 'react';
import {
  ParlayDrawer,
  BookmakerPicker,
  LineShoppingTable,
  LiveScoreWidget,
  FilterBar,
} from '../components';
import { useParlayStore } from '../store/parlayStore';
import { Sparkles, TrendingUp, Target } from 'lucide-react';

const ParlayDemo: React.FC = () => {
  const { addLeg, toggleDrawer } = useParlayStore();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  // Mock data for demo
  const mockLineShoppingData = [
    {
      bookmakerKey: 'draftkings',
      bookmakerName: 'DraftKings',
      bookmakerLogo: '🟢',
      odds: -110,
      impliedProbability: 52.4,
      expectedValue: 2.3,
      lastUpdate: new Date(),
      isLive: true,
      affiliateUrl: 'https://sportsbook.draftkings.com',
    },
    {
      bookmakerKey: 'fanduel',
      bookmakerName: 'FanDuel',
      bookmakerLogo: '🔵',
      odds: -115,
      impliedProbability: 53.5,
      expectedValue: 1.2,
      lastUpdate: new Date(),
      isLive: true,
      affiliateUrl: 'https://sportsbook.fanduel.com',
    },
    {
      bookmakerKey: 'betmgm',
      bookmakerName: 'BetMGM',
      bookmakerLogo: '🟡',
      odds: -105,
      impliedProbability: 51.2,
      expectedValue: 3.5,
      lastUpdate: new Date(),
      isLive: true,
      affiliateUrl: 'https://sports.betmgm.com',
    },
  ];

  // Handle adding a sample leg
  const handleAddSampleLeg = () => {
    addLeg({
      id: `leg-${Date.now()}`,
      eventId: 'sample-event-1',
      eventName: 'Lakers vs Warriors',
      market: 'h2h',
      selection: 'Lakers ML',
      odds: -110,
      bookmaker: 'draftkings',
      timestamp: new Date(),
    });
    toggleDrawer(); // Open drawer after adding leg
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles size={28} className="text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold">Nova Titan Parlay Builder</h1>
                <p className="text-sm text-gray-400">Real-time multi-book parlay intelligence</p>
              </div>
            </div>
            
            <button
              onClick={handleAddSampleLeg}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              Add Sample Leg
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Filter Bar */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Target size={20} className="text-blue-400" />
            <h2 className="text-xl font-semibold">Filters</h2>
          </div>
          <FilterBar
            onFilterChange={(filters) => console.log('Filters changed:', filters)}
            showStateFilter={true}
            showMarketFilter={true}
          />
        </section>

        {/* Live Scores */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={20} className="text-blue-400" />
            <h2 className="text-xl font-semibold">Live Scores</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <LiveScoreWidget
              eventId="sample-event-1"
              sport="basketball_nba"
              showRecord={true}
              showVenue={false}
              compact={false}
            />
            <LiveScoreWidget
              eventId="sample-event-2"
              sport="basketball_nba"
              showRecord={true}
              showVenue={false}
              compact={true}
            />
            <LiveScoreWidget
              eventId="sample-event-3"
              sport="basketball_nba"
              showRecord={true}
              showVenue={false}
              compact={true}
            />
          </div>
        </section>

        {/* Bookmaker Picker */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Target size={20} className="text-blue-400" />
            <h2 className="text-xl font-semibold">Bookmaker Picker</h2>
          </div>
          <BookmakerPicker
            eventId="sample-event-1"
            market="h2h"
            selection="Lakers ML"
            currentBookmaker="draftkings"
            onSelect={(bookmaker) => console.log('Selected bookmaker:', bookmaker)}
            userState="NY"
            showComparison={true}
          />
        </section>

        {/* Line Shopping Table */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={20} className="text-blue-400" />
            <h2 className="text-xl font-semibold">Line Shopping</h2>
          </div>
          <LineShoppingTable
            eventId="sample-event-1"
            eventName="Lakers vs Warriors"
            market="Moneyline"
            selection="Lakers ML"
            lines={mockLineShoppingData}
            trueProbability={50}
            betAmount={100}
            onOptimize={(bookmaker) => console.log('Optimized to:', bookmaker)}
            showEV={true}
          />
        </section>

        {/* Instructions */}
        <section className="bg-blue-900/30 border border-blue-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Sparkles size={20} className="text-blue-400" />
            How to Use
          </h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Click "Add Sample Leg" to add a bet to your parlay</li>
            <li>• Use the Filter Bar to filter events by sport, date, bookmaker, state, or market</li>
            <li>• View Live Scores for real-time game updates</li>
            <li>• Use Bookmaker Picker to compare odds across different sportsbooks</li>
            <li>• Use Line Shopping Table to find the best odds and maximize your payout</li>
            <li>• Open the Parlay Drawer (bottom/right side) to see your parlay summary and optimization</li>
          </ul>
        </section>
      </div>

      {/* Parlay Drawer (Always rendered, controlled by store) */}
      <ParlayDrawer />
    </div>
  );
};

export default ParlayDemo;
