/**
 * Main Widget Component
 * Core component that orchestrates the entire widget experience
 */

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useWidgetStore } from '../../stores/widgetStore';
import apiClient from '../../utils/apiClient';
import ErrorBoundary from '../ui/ErrorBoundary';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { WidgetHeader } from './WidgetHeader';
import { WidgetNavigation } from './WidgetNavigation';
import { GamesTab } from './tabs/GamesTab';
import { PredictionsTab } from './tabs/PredictionsTab';
import { AIInsightsTab } from './tabs/AIInsightsTab';
import { ParlaysTab } from './tabs/ParlaysTab';
import { SettingsTab } from './tabs/SettingsTab';
import { LegalDisclaimer } from '../legal/LegalDisclaimer';
import { TerminologyGuide } from '../ui/TerminologyGuide';


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

  // Fetch games data
  const { data: gamesData, isLoading, error, refetch } = useQuery({
    queryKey: ['games', config.leagues, config.maxGames],
    queryFn: () => apiClient.getGames({
      leagues: config.leagues,
      limit: config.maxGames,
      status: 'scheduled'
    }),
    enabled: true,
    refetchInterval: config.autoRefresh ? (config.refreshInterval || 300) * 1000 : false,
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

  // Set up auto-refresh
  useEffect(() => {
    if (config.autoRefresh && (config.refreshInterval || 0) > 0) {
      const interval = setInterval(() => {
        refetch();
      }, (config.refreshInterval || 300) * 1000);
      
      setRefreshInterval(interval);
      
      return () => clearInterval(interval);
    }
  }, [config.autoRefresh, config.refreshInterval, refetch]);

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
        <WidgetHeader />
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
        <WidgetHeader />

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

        {/* Refresh Indicator */}
        {config.autoRefresh && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center text-xs text-gray-500">
              <svg className="w-3 h-3 mr-1 animate-spin" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Auto-refresh: {config.refreshInterval}s
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default MainWidget;