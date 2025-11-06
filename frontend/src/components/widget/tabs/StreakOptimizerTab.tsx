/**
 * Streak Optimizer Tab Component
 * Underdog/PrizePicks style safe picks display
 */

import React, { useEffect, useState } from 'react';
import { playerStatsService } from '../../../services/analytics/playerStatsService';
import { propAnalysisEngine, PropAnalysis } from '../../../services/analytics/propAnalysisEngine';
import { streakOptimizer, StreakPick, StreakCombo, StreakAvoid } from '../../../services/analytics/streakOptimizer';

export const StreakOptimizerTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState<StreakPick[]>([]);
  const [safeCombos, setSafeCombos] = useState<StreakCombo[]>([]);
  const [avoidList, setAvoidList] = useState<StreakAvoid[]>([]);
  const [selectedCombo, setSelectedCombo] = useState<StreakCombo | null>(null);

  useEffect(() => {
    loadStreakRecommendations();
  }, []);

  const loadStreakRecommendations = async () => {
    setLoading(true);
    try {
      // Generate sample player props for demonstration
      const samplePlayers = [
        { name: 'Luka Doncic', sport: 'NBA' as const, prop: 'points', line: 27.5, opponent: 'LAL', gameDate: '2025-11-07', isHome: true },
        { name: 'Nikola Jokic', sport: 'NBA' as const, prop: 'rebounds', line: 10.5, opponent: 'GSW', gameDate: '2025-11-07', isHome: true },
        { name: 'Stephen Curry', sport: 'NBA' as const, prop: 'assists', line: 6.5, opponent: 'DEN', gameDate: '2025-11-07', isHome: false },
        { name: 'Giannis Antetokounmpo', sport: 'NBA' as const, prop: 'points', line: 29.5, opponent: 'BOS', gameDate: '2025-11-07', isHome: true },
        { name: 'Joel Embiid', sport: 'NBA' as const, prop: 'rebounds', line: 11.5, opponent: 'MIA', gameDate: '2025-11-07', isHome: true },
        { name: 'Damian Lillard', sport: 'NBA' as const, prop: 'assists', line: 7.5, opponent: 'DAL', gameDate: '2025-11-07', isHome: false },
        { name: 'Anthony Edwards', sport: 'NBA' as const, prop: 'points', line: 24.5, opponent: 'LAC', gameDate: '2025-11-07', isHome: true },
        { name: 'Jayson Tatum', sport: 'NBA' as const, prop: 'rebounds', line: 8.5, opponent: 'MIL', gameDate: '2025-11-07', isHome: false },
      ];

      // Fetch prop data and analyze
      const propDataList = await playerStatsService.batchFetchProps(samplePlayers);
      const analyses = propDataList.map(prop => propAnalysisEngine.analyzeProp(prop));

      // Generate streak recommendations
      const recommendations = streakOptimizer.generateRecommendations(analyses, 10);
      
      setRecommended(recommendations.recommended);
      setSafeCombos(recommendations.safeCombos);
      setAvoidList(recommendations.avoidToday);
    } catch (error) {
      console.error('Error loading streak recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">🎯 Streak Optimizer</h2>
        <p className="text-blue-100">
          Safest picks for building winning streaks - Underdog/PrizePicks style
        </p>
      </div>

      {/* Top Safe Picks */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Top Safe Picks Today</h3>
          <button 
            onClick={loadStreakRecommendations}
            className="text-sm bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            🔄 Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommended.slice(0, 6).map((pick) => (
            <div 
              key={`${pick.player}_${pick.prop}`}
              className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-all shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-3xl">{pick.medal}</span>
                  <span className="ml-2 text-sm text-gray-500">Rank #{pick.rank}</span>
                </div>
                <div className="text-right">
                  <div className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                    Safety: {pick.safetyScore}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <h4 className="font-bold text-lg text-gray-800">{pick.player}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-blue-600">{pick.pick}</span>
                  <span className="text-2xl font-bold text-gray-700">{pick.line}</span>
                  <span className="text-sm text-gray-500 uppercase">{pick.prop}</span>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                {pick.reasoning}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-500">Hit Rate</div>
                  <div className="font-bold">{(pick.stats.hitRate * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-500">Variance</div>
                  <div className="font-bold">σ={pick.stats.variance.toFixed(1)}</div>
                </div>
              </div>

              <div className="mt-3 flex gap-1">
                {pick.stats.lastTenGames.slice(-5).map((val, i) => (
                  <div 
                    key={i}
                    className={`flex-1 h-2 rounded ${
                      val > pick.line ? 'bg-green-500' : 'bg-red-400'
                    }`}
                    title={`Game ${i + 1}: ${val.toFixed(1)}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pre-built Combos */}
      <section>
        <h3 className="text-xl font-bold text-gray-800 mb-4">🔥 Pre-Built Safe Combos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeCombos.map((combo, index) => (
            <div 
              key={index}
              className="bg-white border-2 border-blue-200 rounded-lg p-5 hover:border-blue-400 cursor-pointer transition-all"
              onClick={() => setSelectedCombo(combo)}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-lg text-gray-800">{combo.name}</h4>
                <div className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded">
                  {combo.combinedSafety} Safety
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {combo.picks.map((pick, i) => (
                  <div key={i} className="text-sm text-gray-700 flex items-center">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center mr-2 text-xs">
                      {i + 1}
                    </span>
                    {pick}
                  </div>
                ))}
              </div>

              <div className="border-t pt-3">
                <div className="text-xs text-gray-500 mb-1">Expected Hit Rate</div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-blue-600">
                    {(combo.expectedHitRate * 100).toFixed(1)}%
                  </div>
                  <button className="text-sm bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Use This Combo
                  </button>
                </div>
                <div className="text-xs text-gray-600 mt-2">{combo.reasoning}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Avoid Today */}
      {avoidList.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-4">⚠️ Avoid Today</h3>
          
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="space-y-3">
              {avoidList.map((avoid, index) => (
                <div key={index} className="bg-white p-3 rounded border border-red-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-gray-800">{avoid.player}</span>
                      <span className="text-gray-500 ml-2">- {avoid.prop}</span>
                    </div>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      High Risk
                    </span>
                  </div>
                  <div className="text-sm text-red-600 mb-2">{avoid.reason}</div>
                  <div className="flex gap-1">
                    {avoid.lastTen.map((val, i) => (
                      <div 
                        key={i}
                        className="flex-1 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-bold"
                      >
                        {val.toFixed(0)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Custom Streak Builder */}
      <section className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🎨 Build Your Own Streak</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white border-2 border-green-400 p-4 rounded-lg hover:bg-green-50 transition-all">
            <div className="text-3xl mb-2">🛡️</div>
            <div className="font-bold text-gray-800">Ultra Safe</div>
            <div className="text-sm text-gray-600">90+ Safety Score</div>
          </button>
          
          <button className="bg-white border-2 border-blue-400 p-4 rounded-lg hover:bg-blue-50 transition-all">
            <div className="text-3xl mb-2">⚖️</div>
            <div className="font-bold text-gray-800">Balanced</div>
            <div className="text-sm text-gray-600">80+ Safety Score</div>
          </button>
          
          <button className="bg-white border-2 border-orange-400 p-4 rounded-lg hover:bg-orange-50 transition-all">
            <div className="text-3xl mb-2">🚀</div>
            <div className="font-bold text-gray-800">Aggressive</div>
            <div className="text-sm text-gray-600">70+ Safety Score</div>
          </button>
        </div>
      </section>

      {/* Selected Combo Modal */}
      {selectedCombo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCombo(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-800">{selectedCombo.name}</h3>
              <button 
                onClick={() => setSelectedCombo(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {selectedCombo.pickDetails.map((pick, i) => (
                <div key={i} className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-2xl mr-2">{pick.medal}</span>
                      <span className="font-bold text-lg">{pick.player}</span>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded font-bold">
                      {pick.safetyScore}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl font-bold text-blue-600">{pick.pick}</span>
                    <span className="text-xl font-bold">{pick.line}</span>
                    <span className="text-gray-600">{pick.prop}</span>
                  </div>
                  <div className="text-sm text-gray-600">{pick.reasoning}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Combined Safety</div>
                  <div className="text-2xl font-bold text-blue-600">{selectedCombo.combinedSafety}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Expected Hit Rate</div>
                  <div className="text-2xl font-bold text-green-600">
                    {(selectedCombo.expectedHitRate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
                Add to Bet Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
