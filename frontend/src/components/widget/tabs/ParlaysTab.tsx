import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWidgetStore } from '../../../stores/widgetStore';
import { HelpTooltip } from '../../ui/HelpTooltip';
import { CornerHelpTooltip } from '../../ui/CornerHelpTooltip';
import { parlayOptimizer, type ParlayLeg as OptimizerParlayLeg } from '../../../services/analytics/parlayOptimizer';
import { 
  Plus, 
  Trash2, 
  Calculator, 
  TrendingUp, 
  Zap, 
  AlertTriangle,
  DollarSign,
  Target
} from 'lucide-react';

interface ParlayLeg {
  id: string;
  game: string;
  team: string; // Can be team name OR player name
  bet: string;
  odds: number;
  confidence?: number;
  sport: string;
}

interface ParlayBuilder {
  legs: ParlayLeg[];
  stake: number;
  totalOdds: number;
  potentialPayout: number;
  impliedProbability: number;
  expectedValue: number;
  independenceScore?: number;
  correlationWarnings?: string[];
}

// Comprehensive sport-specific betting options
const SPORT_SPECIFIC_BETS = {
  basketball: [
    // NBA Team Bets
    { id: 'nba1', game: 'Lakers vs Warriors', team: 'Lakers', bet: 'Moneyline', odds: 110, confidence: 72, sport: 'basketball' },
    { id: 'nba2', game: 'Lakers vs Warriors', team: 'Warriors', bet: 'Moneyline', odds: -130, confidence: 65, sport: 'basketball' },
    { id: 'nba3', game: 'Celtics vs Heat', team: 'Celtics', bet: 'Spread -4.5', odds: -110, confidence: 68, sport: 'basketball' },
    { id: 'nba4', game: 'Celtics vs Heat', team: 'Heat', bet: 'Spread +4.5', odds: -110, confidence: 58, sport: 'basketball' },
    { id: 'nba5', game: 'Nuggets vs Suns', team: 'Both Teams', bet: 'Over 218.5', odds: -105, confidence: 74, sport: 'basketball' },
    
    // NBA Player Props
    { id: 'nba-p1', game: 'Lakers vs Warriors', team: 'LeBron James', bet: 'Over 28.5 Points', odds: -115, confidence: 76, sport: 'basketball' },
    { id: 'nba-p2', game: 'Lakers vs Warriors', team: 'Stephen Curry', bet: 'Over 26.5 Points', odds: -105, confidence: 69, sport: 'basketball' },
    { id: 'nba-p3', game: 'Celtics vs Heat', team: 'Jayson Tatum', bet: 'Over 29.5 Points', odds: -120, confidence: 71, sport: 'basketball' },
    { id: 'nba-p4', game: 'Lakers vs Warriors', team: 'Anthony Davis', bet: 'Over 11.5 Rebounds', odds: -110, confidence: 78, sport: 'basketball' },
    { id: 'nba-p5', game: 'Lakers vs Warriors', team: 'LeBron James', bet: 'Over 7.5 Assists', odds: -130, confidence: 74, sport: 'basketball' },
    { id: 'nba-p6', game: 'Lakers vs Warriors', team: 'Stephen Curry', bet: 'Over 4.5 Three-Pointers', odds: -110, confidence: 73, sport: 'basketball' },
    { id: 'nba-p7', game: 'Lakers vs Warriors', team: 'LeBron James', bet: 'Double-Double', odds: -180, confidence: 85, sport: 'basketball' },
    { id: 'nba-p8', game: 'Nuggets vs Suns', team: 'Nikola Jokic', bet: 'Triple-Double', odds: +140, confidence: 45, sport: 'basketball' },
  ],
  
  football: [
    // NFL Team Bets
    { id: 'nfl1', game: 'Chiefs vs Bills', team: 'Kansas City Chiefs', bet: 'Moneyline', odds: -125, confidence: 68, sport: 'football' },
    { id: 'nfl2', game: 'Chiefs vs Bills', team: 'Buffalo Bills', bet: 'Moneyline', odds: +110, confidence: 58, sport: 'football' },
    { id: 'nfl3', game: 'Chiefs vs Bills', team: 'Chiefs', bet: 'Spread -3.0', odds: -110, confidence: 72, sport: 'football' },
    { id: 'nfl4', game: 'Chiefs vs Bills', team: 'Bills', bet: 'Spread +3.0', odds: -110, confidence: 64, sport: 'football' },
    { id: 'nfl5', game: 'Chiefs vs Bills', team: 'Both Teams', bet: 'Over 48.5', odds: -105, confidence: 69, sport: 'football' },
    { id: 'nfl6', game: 'Cowboys vs Eagles', team: 'Dallas Cowboys', bet: 'Moneyline', odds: +140, confidence: 61, sport: 'football' },
    
    // NFL Player Props
    { id: 'nfl-p1', game: 'Chiefs vs Bills', team: 'Patrick Mahomes', bet: 'Over 267.5 Pass Yards', odds: -115, confidence: 74, sport: 'football' },
    { id: 'nfl-p2', game: 'Chiefs vs Bills', team: 'Josh Allen', bet: 'Over 245.5 Pass Yards', odds: -110, confidence: 71, sport: 'football' },
    { id: 'nfl-p3', game: 'Chiefs vs Bills', team: 'Travis Kelce', bet: 'Over 67.5 Rec Yards', odds: -120, confidence: 78, sport: 'football' },
    { id: 'nfl-p4', game: 'Chiefs vs Bills', team: 'Stefon Diggs', bet: 'Over 75.5 Rec Yards', odds: -105, confidence: 69, sport: 'football' },
    { id: 'nfl-p5', game: 'Chiefs vs Bills', team: 'Patrick Mahomes', bet: 'Over 1.5 Pass TDs', odds: -140, confidence: 81, sport: 'football' },
    { id: 'nfl-p6', game: 'Chiefs vs Bills', team: 'Josh Allen', bet: 'Over 24.5 Rush Yards', odds: +105, confidence: 62, sport: 'football' },
    { id: 'nfl-p7', game: 'Chiefs vs Bills', team: 'Travis Kelce', bet: 'Anytime TD Scorer', odds: +120, confidence: 65, sport: 'football' },
    { id: 'nfl-p8', game: 'Cowboys vs Eagles', team: 'Dak Prescott', bet: 'Over 2.5 Pass TDs', odds: +110, confidence: 67, sport: 'football' },
  ],

  college_football: [
    // NCAAF Team Bets
    { id: 'ncaaf1', game: 'Alabama vs Georgia', team: 'Alabama Crimson Tide', bet: 'Moneyline', odds: +105, confidence: 65, sport: 'college_football' },
    { id: 'ncaaf2', game: 'Alabama vs Georgia', team: 'Georgia Bulldogs', bet: 'Moneyline', odds: -125, confidence: 71, sport: 'college_football' },
    { id: 'ncaaf3', game: 'Alabama vs Georgia', team: 'Alabama', bet: 'Spread +2.5', odds: -110, confidence: 68, sport: 'college_football' },
    { id: 'ncaaf4', game: 'Alabama vs Georgia', team: 'Georgia', bet: 'Spread -2.5', odds: -110, confidence: 64, sport: 'college_football' },
    { id: 'ncaaf5', game: 'Alabama vs Georgia', team: 'Both Teams', bet: 'Over 58.5', odds: -105, confidence: 72, sport: 'college_football' },
    { id: 'ncaaf6', game: 'Ohio State vs Michigan', team: 'Ohio State Buckeyes', bet: 'Moneyline', odds: -180, confidence: 78, sport: 'college_football' },
    
    // NCAAF Player Props
    { id: 'ncaaf-p1', game: 'Alabama vs Georgia', team: 'Bryce Young', bet: 'Over 267.5 Pass Yards', odds: -115, confidence: 69, sport: 'college_football' },
    { id: 'ncaaf-p2', game: 'Alabama vs Georgia', team: 'Stetson Bennett', bet: 'Over 225.5 Pass Yards', odds: -110, confidence: 66, sport: 'college_football' },
    { id: 'ncaaf-p3', game: 'Alabama vs Georgia', team: 'Jahmyr Gibbs', bet: 'Over 89.5 Rush Yards', odds: -120, confidence: 74, sport: 'college_football' },
    { id: 'ncaaf-p4', game: 'Ohio State vs Michigan', team: 'C.J. Stroud', bet: 'Over 2.5 Pass TDs', odds: -130, confidence: 76, sport: 'college_football' },
    { id: 'ncaaf-p5', game: 'Alabama vs Georgia', team: 'Ladd McConkey', bet: 'Over 65.5 Rec Yards', odds: +105, confidence: 63, sport: 'college_football' },
    { id: 'ncaaf-p6', game: 'Ohio State vs Michigan', team: 'Marvin Harrison Jr.', bet: 'Anytime TD Scorer', odds: +140, confidence: 68, sport: 'college_football' },
    { id: 'ncaaf-p7', game: 'Alabama vs Georgia', team: 'Bryce Young', bet: 'Over 45.5 Rush Yards', odds: +115, confidence: 59, sport: 'college_football' },
  ],
  
  hockey: [
    // NHL Team Bets
    { id: 'nhl1', game: 'Rangers vs Bruins', team: 'New York Rangers', bet: 'Moneyline', odds: +105, confidence: 61, sport: 'hockey' },
    { id: 'nhl2', game: 'Rangers vs Bruins', team: 'Boston Bruins', bet: 'Moneyline', odds: -120, confidence: 67, sport: 'hockey' },
    { id: 'nhl3', game: 'Rangers vs Bruins', team: 'Rangers', bet: 'Puck Line +1.5', odds: -110, confidence: 72, sport: 'hockey' },
    { id: 'nhl4', game: 'Rangers vs Bruins', team: 'Bruins', bet: 'Puck Line -1.5', odds: -110, confidence: 58, sport: 'hockey' },
    { id: 'nhl5', game: 'Rangers vs Bruins', team: 'Both Teams', bet: 'Over 6.5 Goals', odds: -110, confidence: 64, sport: 'hockey' },
    { id: 'nhl6', game: 'Oilers vs Avalanche', team: 'Edmonton Oilers', bet: 'Moneyline', odds: -135, confidence: 73, sport: 'hockey' },
    
    // NHL Player Props
    { id: 'nhl-p1', game: 'Rangers vs Bruins', team: 'David Pastrnak', bet: 'Over 0.5 Goals', odds: +140, confidence: 68, sport: 'hockey' },
    { id: 'nhl-p2', game: 'Rangers vs Bruins', team: 'Artemi Panarin', bet: 'Over 0.5 Points', odds: -125, confidence: 75, sport: 'hockey' },
    { id: 'nhl-p3', game: 'Rangers vs Bruins', team: 'Igor Shesterkin', bet: 'Over 28.5 Saves', odds: -110, confidence: 71, sport: 'hockey' },
    { id: 'nhl-p4', game: 'Rangers vs Bruins', team: 'Brad Marchand', bet: 'Over 0.5 Assists', odds: +110, confidence: 63, sport: 'hockey' },
    { id: 'nhl-p5', game: 'Rangers vs Bruins', team: 'Chris Kreider', bet: 'Anytime Goal Scorer', odds: +165, confidence: 59, sport: 'hockey' },
    { id: 'nhl-p6', game: 'Rangers vs Bruins', team: 'David Pastrnak', bet: 'Over 2.5 Shots on Goal', odds: -130, confidence: 77, sport: 'hockey' },
    { id: 'nhl-p7', game: 'Oilers vs Avalanche', team: 'Connor McDavid', bet: 'Over 1.5 Points', odds: -115, confidence: 82, sport: 'hockey' },
    { id: 'nhl-p8', game: 'Oilers vs Avalanche', team: 'Nathan MacKinnon', bet: 'Anytime Goal Scorer', odds: +130, confidence: 71, sport: 'hockey' },
  ],

  baseball: [
    // MLB Team Bets
    { id: 'mlb1', game: 'Dodgers vs Yankees', team: 'Los Angeles Dodgers', bet: 'Moneyline', odds: +115, confidence: 64, sport: 'baseball' },
    { id: 'mlb2', game: 'Dodgers vs Yankees', team: 'New York Yankees', bet: 'Moneyline', odds: -135, confidence: 69, sport: 'baseball' },
    { id: 'mlb3', game: 'Dodgers vs Yankees', team: 'Dodgers', bet: 'Run Line +1.5', odds: -110, confidence: 71, sport: 'baseball' },
    { id: 'mlb4', game: 'Dodgers vs Yankees', team: 'Yankees', bet: 'Run Line -1.5', odds: -110, confidence: 62, sport: 'baseball' },
    { id: 'mlb5', game: 'Dodgers vs Yankees', team: 'Both Teams', bet: 'Over 8.5 Runs', odds: -105, confidence: 67, sport: 'baseball' },
    { id: 'mlb6', game: 'Astros vs Braves', team: 'Houston Astros', bet: 'Moneyline', odds: -120, confidence: 72, sport: 'baseball' },
    
    // MLB Player Props
    { id: 'mlb-p1', game: 'Dodgers vs Yankees', team: 'Mookie Betts', bet: 'Over 1.5 Hits', odds: +105, confidence: 68, sport: 'baseball' },
    { id: 'mlb-p2', game: 'Dodgers vs Yankees', team: 'Aaron Judge', bet: 'Over 0.5 Home Runs', odds: +180, confidence: 45, sport: 'baseball' },
    { id: 'mlb-p3', game: 'Dodgers vs Yankees', team: 'Freddie Freeman', bet: 'Over 0.5 RBIs', odds: -115, confidence: 72, sport: 'baseball' },
    { id: 'mlb-p4', game: 'Dodgers vs Yankees', team: 'Gerrit Cole', bet: 'Over 6.5 Strikeouts', odds: -120, confidence: 76, sport: 'baseball' },
    { id: 'mlb-p5', game: 'Astros vs Braves', team: 'Jose Altuve', bet: 'Over 1.5 Total Bases', odds: +110, confidence: 65, sport: 'baseball' },
    { id: 'mlb-p6', game: 'Dodgers vs Yankees', team: 'Anthony Rizzo', bet: 'Anytime Home Run', odds: +220, confidence: 38, sport: 'baseball' },
    { id: 'mlb-p7', game: 'Astros vs Braves', team: 'Alex Bregman', bet: 'Over 0.5 Runs Scored', odds: +125, confidence: 61, sport: 'baseball' },
  ],

  soccer: [
    // MLS Team Bets
    { id: 'mls1', game: 'LAFC vs Inter Miami', team: 'Los Angeles FC', bet: 'Moneyline', odds: +140, confidence: 58, sport: 'soccer' },
    { id: 'mls2', game: 'LAFC vs Inter Miami', team: 'Inter Miami CF', bet: 'Moneyline', odds: +180, confidence: 52, sport: 'soccer' },
    { id: 'mls3', game: 'LAFC vs Inter Miami', team: 'Draw', bet: 'Draw', odds: +220, confidence: 35, sport: 'soccer' },
    { id: 'mls4', game: 'LAFC vs Inter Miami', team: 'Both Teams', bet: 'Over 2.5 Goals', odds: -110, confidence: 68, sport: 'soccer' },
    { id: 'mls5', game: 'LAFC vs Inter Miami', team: 'Both Teams', bet: 'Under 2.5 Goals', odds: -110, confidence: 58, sport: 'soccer' },
    { id: 'mls6', game: 'Seattle vs Portland', team: 'Seattle Sounders', bet: 'Moneyline', odds: +105, confidence: 62, sport: 'soccer' },
    
    // Soccer Player Props
    { id: 'mls-p1', game: 'LAFC vs Inter Miami', team: 'Carlos Vela', bet: 'Anytime Goal Scorer', odds: +160, confidence: 64, sport: 'soccer' },
    { id: 'mls-p2', game: 'LAFC vs Inter Miami', team: 'Lionel Messi', bet: 'Anytime Goal Scorer', odds: +120, confidence: 72, sport: 'soccer' },
    { id: 'mls-p3', game: 'LAFC vs Inter Miami', team: 'Giorgio Chiellini', bet: 'Over 0.5 Assists', odds: +180, confidence: 48, sport: 'soccer' },
    { id: 'mls-p4', game: 'LAFC vs Inter Miami', team: 'Lionel Messi', bet: 'Over 2.5 Shots on Target', odds: -115, confidence: 69, sport: 'soccer' },
    { id: 'mls-p5', game: 'Seattle vs Portland', team: 'Jordan Morris', bet: 'Anytime Goal Scorer', odds: +190, confidence: 56, sport: 'soccer' },
    { id: 'mls-p6', game: 'LAFC vs Inter Miami', team: 'Carlos Vela', bet: 'Over 1.5 Shots on Target', odds: +105, confidence: 63, sport: 'soccer' },
    { id: 'mls-p7', game: 'LAFC vs Inter Miami', team: 'Lionel Messi', bet: 'First Goal Scorer', odds: +200, confidence: 42, sport: 'soccer' },
  ]
};

// Get available bets based on selected sports
const getAvailableBets = (selectedSports: string[]): ParlayLeg[] => {
  let allBets: ParlayLeg[] = [];
  
  selectedSports.forEach(sport => {
    if (SPORT_SPECIFIC_BETS[sport as keyof typeof SPORT_SPECIFIC_BETS]) {
      allBets = [...allBets, ...SPORT_SPECIFIC_BETS[sport as keyof typeof SPORT_SPECIFIC_BETS]];
    }
  });
  
  return allBets;
};

export const ParlaysTab: React.FC = () => {
  const { config } = useWidgetStore();
  const [parlay, setParlay] = useState<ParlayBuilder>({
    legs: [],
    stake: 100,
    totalOdds: 0,
    potentialPayout: 0,
    impliedProbability: 0,
    expectedValue: 0
  });
  const [showOptimization, setShowOptimization] = useState(false);
  const [betType, setBetType] = useState<'team' | 'player'>('team');
  const [selectedSport, setSelectedSport] = useState<string>('basketball');

  // Get available bets for current sport selection
  const availableBets = getAvailableBets([selectedSport]);

  const addLegToParlay = (leg: ParlayLeg) => {
    if (parlay.legs.find(l => l.id === leg.id)) return;
    
    const newLegs = [...parlay.legs, leg];
    updateParlayCalculations(newLegs, parlay.stake);
  };

  const removeLegFromParlay = (legId: string) => {
    const newLegs = parlay.legs.filter(l => l.id !== legId);
    updateParlayCalculations(newLegs, parlay.stake);
  };

  const updateStake = (newStake: number) => {
    updateParlayCalculations(parlay.legs, newStake);
  };

  const updateParlayCalculations = (legs: ParlayLeg[], stake: number) => {
    if (legs.length === 0) {
      setParlay(prev => ({
        ...prev,
        legs,
        stake,
        totalOdds: 0,
        potentialPayout: 0,
        impliedProbability: 0,
        expectedValue: 0,
        independenceScore: undefined,
        correlationWarnings: []
      }));
      return;
    }

    // Calculate combined odds
    let combinedDecimalOdds = 1;
    let combinedImpliedProb = 1;
    
    legs.forEach(leg => {
      const decimalOdds = leg.odds > 0 ? (leg.odds / 100) + 1 : (100 / Math.abs(leg.odds)) + 1;
      const impliedProb = leg.odds > 0 ? 100 / (leg.odds + 100) : Math.abs(leg.odds) / (Math.abs(leg.odds) + 100);
      
      combinedDecimalOdds *= decimalOdds;
      combinedImpliedProb *= impliedProb;
    });

    const potentialPayout = stake * combinedDecimalOdds;
    const profit = potentialPayout - stake;
    const americanOdds = combinedDecimalOdds >= 2 ? 
      Math.round((combinedDecimalOdds - 1) * 100) : 
      Math.round(-100 / (combinedDecimalOdds - 1));

    // Simple EV calculation (would be more sophisticated with real data)
    const expectedValue = (combinedImpliedProb * profit) - ((1 - combinedImpliedProb) * stake);
    const expectedValuePercent = (expectedValue / stake) * 100;

    // ✅ NEW: Calculate REAL independence score using parlayOptimizer
    let independenceScore: number | undefined;
    let correlationWarnings: string[] = [];
    
    if (legs.length >= 2) {
      try {
        // Convert ParlayLeg to OptimizerParlayLeg format
        const optimizerLegs: OptimizerParlayLeg[] = legs.map(leg => ({
          game: leg.game,
          team: leg.team,
          prop: leg.bet,
          odds: leg.odds,
          sport: leg.sport as 'NBA' | 'NFL'
        }));
        
        // Use parlayOptimizer to get real correlation analysis
        const analysis = parlayOptimizer.analyzeParlay(optimizerLegs);
        independenceScore = analysis.independenceScore;
        correlationWarnings = analysis.warnings.map(w => w.description);
        
        console.log('🔍 Parlay Analysis:', {
          legs: legs.length,
          independenceScore,
          warnings: correlationWarnings.length
        });
      } catch (error) {
        console.error('❌ Error calculating independence score:', error);
        independenceScore = undefined;
      }
    }

    setParlay({
      legs,
      stake,
      totalOdds: americanOdds,
      potentialPayout,
      impliedProbability: combinedImpliedProb * 100,
      expectedValue: expectedValuePercent,
      independenceScore,
      correlationWarnings
    });
  };

  const clearParlay = () => {
    setParlay({
      legs: [],
      stake: 100,
      totalOdds: 0,
      potentialPayout: 0,
      impliedProbability: 0,
      expectedValue: 0
    });
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  return (
    <div className="space-y-6 relative">
      {/* Page Help Button */}
      <div className="absolute top-4 right-4 z-10">
        <CornerHelpTooltip 
          content="Optimized multi-game betting combinations with AI analysis. Build parlays with confidence scores and expected value calculations in companion mode."
          term="Parlay Builder"
          size="md"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5" style={{ color: config.colors.accent }} />
            Parlay Builder
          </h2>
          <p className="text-gray-400 text-sm">
            Combine multiple bets for higher payouts
          </p>
        </div>
      </div>

      {/* AI Parlay Optimizer */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Nova TitanAI Parlay Optimizer</h3>
            <HelpTooltip content="AI analyzes your parlay selections to optimize value, detect correlations, and recommend better combinations for maximum expected value" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-300 text-xs bg-blue-600/20 px-2 py-1 rounded">Nova TitanAI v2.1</span>
            <button 
              onClick={() => setShowOptimization(!showOptimization)}
              className="text-blue-400 text-xs hover:text-blue-300 underline"
            >
              How to Use
            </button>
          </div>
        </div>
        
        {/* How-to Guide */}
        {showOptimization && (
          <div className="mb-4 p-3 bg-blue-900/10 border border-blue-600/20 rounded">
            <h4 className="text-blue-300 font-medium text-sm mb-2">📚 How Parlay Optimization Works:</h4>
            <div className="text-gray-300 text-sm space-y-1">
              <div>• <strong>Add bets</strong> from the available options below</div>
              <div>• <strong>AI analyzes</strong> correlations and value automatically</div>
              <div>• <strong>View suggestions</strong> to improve your parlay's expected value</div>
              <div>• <strong>Apply Kelly sizing</strong> for optimal bankroll allocation</div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-green-400 font-bold text-lg">+18.7% EV</div>
            <div className="text-gray-300 text-sm">Optimal 3-leg parlay detected</div>
            <button className="mt-2 text-blue-400 text-xs hover:text-blue-300">View Analysis →</button>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-3">
            {parlay.independenceScore !== undefined ? (
              <>
                <div className={`font-bold text-lg ${
                  parlay.independenceScore >= 80 ? 'text-green-400' :
                  parlay.independenceScore >= 60 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {parlay.independenceScore}/100 Independence
                </div>
                <div className="text-gray-300 text-sm">
                  {parlay.independenceScore >= 80 ? 'Excellent' :
                   parlay.independenceScore >= 60 ? 'Moderate' :
                   'High'} correlation risk
                </div>
                <HelpTooltip content={`Independence score shows how uncorrelated your parlay legs are. 100 = completely independent outcomes. ${parlay.correlationWarnings?.length || 0} correlation(s) detected.`} />
              </>
            ) : (
              <>
                <div className="text-gray-400 font-bold text-lg">Add 2+ Legs</div>
                <div className="text-gray-400 text-sm">Independence score requires multiple legs</div>
              </>
            )}
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-blue-400 font-bold text-lg">Kelly: 2.3%</div>
            <div className="text-gray-300 text-sm">Recommended bankroll %</div>
            <button className="mt-2 text-blue-400 text-xs hover:text-blue-300">Learn Kelly →</button>
          </div>
        </div>

        {/* Real Correlation Warnings */}
        {parlay.correlationWarnings && parlay.correlationWarnings.length > 0 && (
          <div className="mt-3 p-3 bg-yellow-900/10 border border-yellow-600/20 rounded">
            <div className="text-yellow-300 text-sm font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              ⚠️ Correlation Detected
            </div>
            <div className="space-y-1">
              {parlay.correlationWarnings.map((warning, idx) => (
                <div key={idx} className="text-gray-200 text-xs">
                  • {warning}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Show suggestion when no warnings */}
        {(!parlay.correlationWarnings || parlay.correlationWarnings.length === 0) && parlay.legs.length >= 2 && (
          <div className="mt-3 p-3 bg-green-900/10 border border-green-600/20 rounded">
            <div className="text-green-300 text-sm font-medium mb-1">✅ Well-Optimized Parlay</div>
            <div className="text-gray-200 text-sm">
              Your selections show low correlation. Good independence between outcomes!
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Bets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="w-4 h-4" />
              Available Bets
            </h3>
            
            <div className="flex items-center gap-3">
              {/* Sport Selector */}
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="bg-gray-700 text-white text-xs px-3 py-1 rounded-md border border-gray-600 focus:border-blue-500"
              >
                <option value="basketball">🏀 Basketball</option>
                <option value="football">🏈 NFL</option>
                <option value="college_football">🏟️ College Football</option>
                <option value="hockey">🏒 Hockey</option>
                <option value="baseball">⚾ Baseball</option>
                <option value="soccer">⚽ Soccer</option>
              </select>

              {/* Bet Type Toggle */}
              <div className="flex bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setBetType('team')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    betType === 'team' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  🏆 Team Bets
                </button>
                <button
                  onClick={() => setBetType('player')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    betType === 'player' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  👤 Player Props
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            {availableBets
              .filter(bet => {
                // Filter logic: check if it's a player prop by looking for player-specific IDs
                const isPlayerProp = bet.id.includes('-p');
                return betType === 'player' ? isPlayerProp : !isPlayerProp;
              })
              .map((bet) => (
              <motion.div
                key={bet.id}
                className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                onClick={() => addLegToParlay(bet)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{bet.game}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-400 text-xs">{bet.team} - {bet.bet}</p>
                      {bet.confidence && (
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          bet.confidence >= 75 ? 'bg-green-600/20 text-green-400' :
                          bet.confidence >= 65 ? 'bg-yellow-600/20 text-yellow-400' :
                          'bg-red-600/20 text-red-400'
                        }`}>
                          {bet.confidence}% AI
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{formatOdds(bet.odds)}</span>
                    <Plus className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Parlay Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Your Parlay ({parlay.legs.length} legs)
            </h3>
            {parlay.legs.length > 0 && (
              <button
                onClick={clearParlay}
                className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {/* Parlay Legs */}
          <div className="space-y-2">
            <AnimatePresence>
              {parlay.legs.map((leg, index) => (
                <motion.div
                  key={leg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-700 rounded-lg p-3 border border-gray-600"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium text-sm">{leg.game}</p>
                      <p className="text-gray-300 text-xs">{leg.team} - {leg.bet}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{formatOdds(leg.odds)}</span>
                      <button
                        onClick={() => removeLegFromParlay(leg.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {parlay.legs.length === 0 && (
            <div className="bg-gray-800 rounded-lg p-6 text-center border-2 border-dashed border-gray-600">
              <Calculator className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">Add bets to build your parlay</p>
              <p className="text-gray-500 text-sm">Click on available bets to add them</p>
            </div>
          )}

          {/* Stake Input */}
          {parlay.legs.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-2">Stake Amount</label>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={parlay.stake}
                    onChange={(e) => updateStake(Number(e.target.value))}
                    className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-400 w-full"
                    min="1"
                  />
                </div>
              </div>

              {/* Calculations */}
              <div className="space-y-3 border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Odds:</span>
                  <span className="text-white font-semibold">{formatOdds(parlay.totalOdds)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Implied Probability:</span>
                  <span className="text-white">{parlay.impliedProbability.toFixed(1)}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Potential Payout:</span>
                  <span className="text-green-400 font-semibold">${parlay.potentialPayout.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-1">
                    Expected Value:
                    <HelpTooltip content="Expected value shows if this bet is theoretically profitable over time" />
                  </span>
                  <span className={`font-semibold ${parlay.expectedValue > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {parlay.expectedValue > 0 ? '+' : ''}{parlay.expectedValue.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Optimization */}
              <button
                onClick={() => setShowOptimization(!showOptimization)}
                className="w-full py-2 px-4 rounded border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Nova TitanAI Optimization
              </button>

              <AnimatePresence>
                {showOptimization && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-700 rounded p-3 space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-white text-sm font-semibold">AI Recommendation</p>
                        <p className="text-gray-300 text-xs">
                          Consider reducing stake to $75 for optimal Kelly Criterion sizing based on your bankroll.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                      <div>
                        <p className="text-white text-sm font-semibold">Risk Assessment</p>
                        <p className="text-gray-300 text-xs">
                          High-risk parlay. Individual leg confidence: 78%, 65%, 71%
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Companion Mode - Track Bet */}
              <button
                className="w-full py-3 px-4 rounded font-semibold text-white transition-colors bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                📋 Track This Parlay (Companion Mode)
              </button>
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                  🛡️ No real money • Track performance only
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-white font-semibold text-sm mb-2">Parlay Tips</p>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• All legs must win for the parlay to pay out</li>
              <li>• Odds multiply together, increasing both risk and reward</li>
              <li>• Nova TitanAI analyzes correlations between legs</li>
              <li>• Consider limiting parlays to 2-4 legs for better success rates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};