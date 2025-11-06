/**
 * NOVA TITAN SPORTS - PREMIUM APP
 * Complete rebuild with advanced analytics engine
 */

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles/design-system.css';
import './styles/app-premium.css';

// Engine imports
import { AnalysisEngine, PropAnalysis } from './engine/analysisEngine';
import { StreakOptimizer } from './engine/streakOptimizer';
import { ParlayCorrelationAnalyzer } from './engine/parlayAnalyzer';
import { PerformanceTracker } from './engine/performanceTracker';
import { DataAggregator } from './engine/dataAggregator';

// Component imports
import { PlayerPropCard } from './components/analytics/PlayerPropCard';
import { DashboardHero, DashboardStats } from './components/analytics/DashboardHero';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize engines
const analysisEngine = new AnalysisEngine();
const performanceTracker = new PerformanceTracker();
const dataAggregator = new DataAggregator();

// Sample data generator (replace with real API calls)
const generateSampleProps = (): PropAnalysis[] => {
  const players = [
    { name: 'LeBron James', team: 'LAL', opponent: 'BOS' },
    { name: 'Stephen Curry', team: 'GSW', opponent: 'LAC' },
    { name: 'Kevin Durant', team: 'PHX', opponent: 'DEN' },
    { name: 'Giannis Antetokounmpo', team: 'MIL', opponent: 'MIA' },
    { name: 'Luka Doncic', team: 'DAL', opponent: 'PHX' },
    { name: 'Joel Embiid', team: 'PHI', opponent: 'NYK' },
  ];

  const props = ['points', 'rebounds', 'assists', 'threes'];

  return players.flatMap(player => {
    const numProps = Math.floor(Math.random() * 2) + 1;
    return Array.from({ length: numProps }, (_, i) => {
      const prop = props[Math.floor(Math.random() * props.length)];
      const line = prop === 'points' ? 25.5 : prop === 'rebounds' ? 10.5 : prop === 'assists' ? 7.5 : 3.5;
      const historicalData = Array.from({ length: 10 }, () => 
        line + (Math.random() - 0.5) * 6
      );

      return analysisEngine.analyzeProp({
        player: player.name,
        team: player.team,
        opponent: player.opponent,
        prop: prop,
        line: line,
        historicalData: historicalData,
        contextData: {
          opponent: player.opponent,
          isHome: Math.random() > 0.5,
          injuryStatus: 'healthy',
        }
      });
    });
  });
};

function AppPremium() {
  const [activeView, setActiveView] = useState<'dashboard' | 'props' | 'streaks' | 'parlays'>('dashboard');
  const [allProps, setAllProps] = useState<PropAnalysis[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    currentStreak: 5,
    accuracy: '82%',
    winRate: '76.5%',
    totalPicks: 247,
    roi: '+18.4%',
    picksToday: 12
  });

  // Load performance tracker data
  useEffect(() => {
    performanceTracker.loadFromDisk();
  }, []);

  // Generate sample props on mount
  useEffect(() => {
    const props = generateSampleProps();
    setAllProps(props);
  }, []);

  // Update dashboard stats from performance tracker
  useEffect(() => {
    const updateStats = async () => {
      const stats = await performanceTracker.getOverallStats(30);
      setDashboardStats({
        currentStreak: stats.currentStreak,
        accuracy: '82%',
        winRate: stats.winRate,
        totalPicks: stats.totalPicks,
        roi: stats.roi,
        picksToday: allProps.length
      });
    };

    updateStats();
  }, [allProps]);

  // Initialize streak optimizer
  const streakOptimizer = new StreakOptimizer(allProps);
  const safestPicks = streakOptimizer.getSafestPicks(10);
  const prebuiltCombos = streakOptimizer.getPrebuiltCombos();

  // Render dashboard view
  const renderDashboard = () => (
    <div className="content-area">
      <DashboardHero 
        stats={dashboardStats}
        userName="Champion"
        onBuildStreak={() => setActiveView('streaks')}
        onViewAnalytics={() => setActiveView('props')}
      />

      <div className="section">
        <h2 className="section-title">🎯 Today's Top Picks</h2>
        <div className="picks-grid">
          {safestPicks.slice(0, 6).map((pick, index) => (
            <PlayerPropCard
              key={index}
              prop={pick}
              onAddToStreak={() => console.log('Added to streak:', pick.player)}
              onViewDetails={() => console.log('View details:', pick.player)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // Render props view
  const renderProps = () => (
    <div className="content-area">
      <div className="section">
        <h2 className="section-title">📊 All Player Props (Ranked by Safety)</h2>
        <div className="picks-grid">
          {allProps
            .sort((a, b) => b.safetyScore - a.safetyScore)
            .map((pick, index) => (
              <PlayerPropCard
                key={index}
                prop={pick}
                onAddToStreak={() => console.log('Added to streak:', pick.player)}
                onViewDetails={() => console.log('View details:', pick.player)}
              />
            ))}
        </div>
      </div>
    </div>
  );

  // Render streaks view
  const renderStreaks = () => (
    <div className="content-area">
      <div className="section">
        <h2 className="section-title">🔥 Streak Optimizer</h2>
        
        {/* Pre-built combos */}
        <div className="combos-grid">
          {prebuiltCombos.ultraSafe && (
            <div className="combo-card">
              <h3 className="combo-title">⭐ Ultra Safe 2-Pick</h3>
              <div className="combo-safety">{prebuiltCombos.ultraSafe.combinedSafety}</div>
              <p className="combo-reasoning">{prebuiltCombos.ultraSafe.reasoning}</p>
              <div className="combo-picks">
                {prebuiltCombos.ultraSafe.picks.map((pick, i) => (
                  <div key={i} className="combo-pick">
                    <span>{pick.player} - {pick.prop} {pick.recommendation}</span>
                    <span className="combo-pick-safety">{pick.safetyScore}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {prebuiltCombos.balanced && (
            <div className="combo-card">
              <h3 className="combo-title">⚖️ Balanced 3-Pick</h3>
              <div className="combo-safety">{prebuiltCombos.balanced.combinedSafety}</div>
              <p className="combo-reasoning">{prebuiltCombos.balanced.reasoning}</p>
              <div className="combo-picks">
                {prebuiltCombos.balanced.picks.map((pick, i) => (
                  <div key={i} className="combo-pick">
                    <span>{pick.player} - {pick.prop} {pick.recommendation}</span>
                    <span className="combo-pick-safety">{pick.safetyScore}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {prebuiltCombos.highReward && (
            <div className="combo-card">
              <h3 className="combo-title">🚀 High-Reward 4-Pick</h3>
              <div className="combo-safety">{prebuiltCombos.highReward.combinedSafety}</div>
              <p className="combo-reasoning">{prebuiltCombos.highReward.reasoning}</p>
              <div className="combo-picks">
                {prebuiltCombos.highReward.picks.map((pick, i) => (
                  <div key={i} className="combo-pick">
                    <span>{pick.player} - {pick.prop} {pick.recommendation}</span>
                    <span className="combo-pick-safety">{pick.safetyScore}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top safe picks */}
        <div className="section">
          <h3 className="section-subtitle">✅ Safest Individual Picks</h3>
          <div className="picks-grid">
            {safestPicks.slice(0, 10).map((pick, index) => (
              <PlayerPropCard
                key={index}
                prop={pick}
                onAddToStreak={() => console.log('Added to streak:', pick.player)}
                onViewDetails={() => console.log('View details:', pick.player)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render parlays view
  const renderParlays = () => {
    const analyzer = new ParlayCorrelationAnalyzer();
    const sampleParlay = safestPicks.slice(0, 3);
    const correlations = analyzer.detectCorrelations(sampleParlay);
    const adjustedOdds = analyzer.calculateAdjustedOdds(sampleParlay);
    const validation = analyzer.validateParlay(sampleParlay);

    return (
      <div className="content-area">
        <div className="section">
          <h2 className="section-title">🎰 Parlay Analyzer</h2>
          
          <div className="parlay-validation">
            <h3>Parlay Independence Score: {validation.score}/100</h3>
            <p>Status: {validation.isOptimal ? '✅ Optimal' : '⚠️ Needs Improvement'}</p>
            
            {validation.recommendations.map((rec, i) => (
              <div key={i} className="recommendation">{rec}</div>
            ))}
          </div>

          {correlations.length > 0 && (
            <div className="correlation-warnings">
              <h3>⚠️ Correlation Warnings</h3>
              {correlations.map((corr, i) => (
                <div key={i} className="warning-card">
                  <div className="warning-severity">{corr.severity}</div>
                  <div className="warning-details">
                    <strong>{corr.picks.join(' & ')}</strong>
                    <p>{corr.warning}</p>
                    <p>Correlation: {(corr.correlation * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="odds-analysis">
            <h3>True Odds Analysis</h3>
            <p>Naive Probability: {(adjustedOdds.naive * 100).toFixed(1)}%</p>
            <p>Adjusted Probability: {(adjustedOdds.adjusted * 100).toFixed(1)}%</p>
            <p>Difference: {adjustedOdds.difference}</p>
            <p>{adjustedOdds.explanation}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        {/* Top Navigation */}
        <nav className="top-nav">
          <div className="nav-brand">
            <span className="logo">🏆</span>
            <span className="brand-name">NOVA TITAN SPORTS</span>
          </div>
          <div className="nav-links">
            <button
              className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`nav-link ${activeView === 'props' ? 'active' : ''}`}
              onClick={() => setActiveView('props')}
            >
              All Props
            </button>
            <button
              className={`nav-link ${activeView === 'streaks' ? 'active' : ''}`}
              onClick={() => setActiveView('streaks')}
            >
              Streak Builder
            </button>
            <button
              className={`nav-link ${activeView === 'parlays' ? 'active' : ''}`}
              onClick={() => setActiveView('parlays')}
            >
              Parlay Analyzer
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-layout">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'props' && renderProps()}
          {activeView === 'streaks' && renderStreaks()}
          {activeView === 'parlays' && renderParlays()}
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default AppPremium;
