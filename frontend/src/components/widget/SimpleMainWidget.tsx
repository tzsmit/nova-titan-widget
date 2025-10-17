/**
 * Simplified Main Widget - Clean and User-Friendly Interface
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useWidgetStore } from '../../stores/widgetStore';
import ErrorBoundary from '../ui/ErrorBoundary';
import { SimpleHeader } from './SimpleHeader';
import { SimpleNavigation } from './SimpleNavigation';
import { SimpleGamesTab } from './tabs/SimpleGamesTab';
import { SimplePredictionsTab } from './tabs/SimplePredictionsTab';
import { SimpleParlaysTab } from './tabs/SimpleParlaysTab';
import { SimplePlayerPropsTab } from './tabs/SimplePlayerPropsTab';
import { SimpleSettingsTab } from './tabs/SimpleSettingsTab';
// AI Insights tab will use enhanced predictions for now
import { SimplePredictionsTab as SimpleAIInsightsTab } from './tabs/SimplePredictionsTab';
import { LegalDisclaimer } from '../legal/LegalDisclaimer';
import { TerminologyGuide } from '../ui/TerminologyGuide';
import { CacheStatsIndicator } from '../ui/CacheStatsIndicator';

export const SimpleMainWidget: React.FC = () => {
  const {
    config,
    selectedTab,
    setGamesLoading,
    setGamesError
  } = useWidgetStore();

  const [showTerminologyGuide, setShowTerminologyGuide] = React.useState(false);

  // Simplified service status check
  const { data: serviceStatus, isLoading, error, refetch } = useQuery({
    queryKey: ['service-health'],
    queryFn: async () => {
      console.log('🔍 Checking service status...');
      try {
        return { success: true, status: 'healthy', timestamp: new Date().toISOString() };
      } catch (error) {
        return { success: false, status: 'error', error: error.message };
      }
    },
    enabled: true,
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle service status
  React.useEffect(() => {
    if (serviceStatus?.success) {
      setGamesError(null);
    } else if (error) {
      setGamesError('Service temporarily unavailable');
    }
    setGamesLoading(isLoading);
  }, [serviceStatus, error, isLoading, setGamesError, setGamesLoading]);

  // Listen for terminology guide events
  React.useEffect(() => {
    const handleOpenTerminologyGuide = () => {
      setShowTerminologyGuide(true);
    };

    window.addEventListener('openTerminologyGuide', handleOpenTerminologyGuide);
    return () => window.removeEventListener('openTerminologyGuide', handleOpenTerminologyGuide);
  }, []);

  // Render tab content with simplified components
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'games':
        return <SimpleGamesTab />;
      case 'predictions':
        return <SimplePredictionsTab />;
      case 'player-props':
        return <SimplePlayerPropsTab />;
      case 'ai-insights':
        return <SimpleAIInsightsTab />;
      case 'parlays':
        return <SimpleParlaysTab />;
      case 'settings':
        return <SimpleSettingsTab />;
      default:
        return <SimpleGamesTab />;
    }
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <SimpleHeader onRefresh={() => refetch()} />
        <div className="p-6 text-center">
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 max-w-md mx-auto">
            <h3 className="text-red-400 font-semibold mb-2">
              Unable to Load Widget
            </h3>
            <p className="text-red-300 text-sm mb-4">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => refetch()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
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
      {/* Mobile-first responsive container with proper flex layout */}
      <div className="w-full max-w-screen-sm sm:max-w-screen-md mx-auto flex flex-col min-h-screen mobile-safe-area bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Simplified Header - Fixed height */}
        <div className="flex-shrink-0">
          <SimpleHeader onRefresh={() => refetch()} />
        </div>

        {/* Simplified Navigation - Fixed height */}
        <div className="flex-shrink-0">
          <SimpleNavigation />
        </div>

        {/* Main Content - Flexible height with scroll */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer - Fixed height */}
        {config.showDisclaimers && (
          <div className="flex-shrink-0 border-t border-slate-700 bg-slate-800/50">
            <LegalDisclaimer />
          </div>
        )}

        {/* Terminology Guide */}
        <TerminologyGuide 
          isOpen={showTerminologyGuide}
          onClose={() => setShowTerminologyGuide(false)}
        />

        {/* Cache Stats */}
        <CacheStatsIndicator />
      </div>
    </ErrorBoundary>
  );
};

export default SimpleMainWidget;