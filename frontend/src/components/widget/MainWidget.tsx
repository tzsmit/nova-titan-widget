/**
 * Main Widget Component
 * Core component that orchestrates the entire widget experience
 */

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useWidgetStore } from '../../stores/widgetStore';
import apiClient from '../../utils/apiClient';
import { liveSportsService } from '../../services/liveSportsService';
import ErrorBoundary from '../ui/ErrorBoundary';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { WidgetHeader } from './WidgetHeader';
import { WidgetNavigation } from './WidgetNavigation';
import { GamesTab } from './tabs/GamesTab';
import { PredictionsTab } from './tabs/PredictionsTab';
import { AIInsightsTab } from './tabs/AIInsightsTab';
import { ParlaysTab } from './tabs/ParlaysTab';
import { SettingsTab } from './tabs/SettingsTab';
import { PlayerPropsTab } from './tabs/PlayerPropsTab';
import { LegalDisclaimer } from '../legal/LegalDisclaimer';
import { TerminologyGuide } from '../ui/TerminologyGuide';
import { CacheStatsIndicator } from '../ui/CacheStatsIndicator';


export const MainWidget: React.FC = () => {
  const {
    config,
    selectedTab,
    setGames,
    setGamesLoading,
    setGamesError
  } = useWidgetStore();

  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [showTerminologyGuide, setShowTerminologyGuide] = useState(false);

  // Fetch games data with smart caching
  const { data: gamesData, isLoading, error, refetch } = useQuery({
    queryKey: ['live-games', config.leagues, config.maxGames],
    queryFn: async () => {
      // Get live data using smart caching system
      const [todaysGames, upcomingGames, liveGames] = await Promise.all([
        liveSportsService.getTodaysGames(),
        liveSportsService.getUpcomingGames(3), // Next 3 days
        liveSportsService.getLiveGames()
      ]);

      // Transform to expected format
      const allGames = [...liveGames, ...todaysGames, ...upcomingGames.slice(0, config.maxGames || 10)];
      
      return {
        success: true,
        data: allGames.map(game => ({
          id: game.id,
          home_team: game.homeTeam,
          away_team: game.awayTeam,
          start_time: `${game.gameDate}T${game.gameTime}`,
          sport: game.league,
          league: game.league,
          status: game.status,
          odds: game.odds
        }))
      };
    },
    enabled: true,
    refetchInterval: false, // Manual refresh only - smart caching handles updates
    staleTime: 2 * 60 * 1000, // 2 minutes stale time
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });

  // Handle success/error with useEffect instead of onSuccess/onError (deprecated in v5)
  React.useEffect(() => {
    if (gamesData && gamesData.data) {
      setGames(Array.isArray(gamesData.data) ? gamesData.data : []);
      setGamesLoading(false);
    }
  }, [gamesData, setGames, setGamesLoading]);

  React.useEffect(() => {
    if (error) {
      setGamesError(error.message || 'Failed to load games');
    }
  }, [error, setGamesError]);

  // Auto-refresh disabled to prevent excessive credit usage
  // Manual refresh available via refresh button
  useEffect(() => {
    // Auto-refresh disabled
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  // Handle loading state
  useEffect(() => {
    setGamesLoading(isLoading);
  }, [isLoading, setGamesLoading]);

  // Listen for terminology guide open events
  useEffect(() => {
    const handleOpenTerminologyGuide = () => {
      setShowTerminologyGuide(true);
    };

    window.addEventListener('openTerminologyGuide', handleOpenTerminologyGuide);
    return () => window.removeEventListener('openTerminologyGuide', handleOpenTerminologyGuide);
  }, []);

  // Render tab content
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'games':
        return <GamesTab />;
      case 'predictions':
        return <PredictionsTab />;
      case 'player-props':
        return <PlayerPropsTab />;
      case 'ai-insights':
        return <AIInsightsTab />;
      case 'parlays':
        return <ParlaysTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <GamesTab />;
    }
  };

  // Error state
  if (error) {
    return (
      <div className="widget-container">
        <WidgetHeader onRefresh={async () => {
          await liveSportsService.refreshAllData();
          refetch();
        }} />
        <div className="p-6 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold mb-2">
              Unable to Load Widget
            </h3>
            <p className="text-red-600 text-sm mb-4">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => refetch()}
              className="btn-primary btn-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="widget-container">
        {/* Widget Header */}
        <WidgetHeader onRefresh={async () => {
          await liveSportsService.refreshAllData();
          refetch();
        }} />

        {/* Navigation Tabs */}
        <WidgetNavigation />

        {/* Main Content Area */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 md:p-6"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>

          {/* Loading Overlay */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center"
            >
              <LoadingSpinner size="lg" />
            </motion.div>
          )}
        </div>

        {/* Legal Disclaimer */}
        {config.showDisclaimers && (
          <div className="border-t border-gray-200 bg-gray-50">
            <LegalDisclaimer />
          </div>
        )}

        {/* Terminology Guide Modal */}
        <TerminologyGuide 
          isOpen={showTerminologyGuide}
          onClose={() => setShowTerminologyGuide(false)}
        />

        {/* Cache Stats Indicator */}
        <CacheStatsIndicator />
      </div>
    </ErrorBoundary>
  );
};

export default MainWidget;