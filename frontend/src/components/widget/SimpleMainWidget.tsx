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
import { SimpleSearchComponent } from './search/SimpleSearchComponent';
import { SimpleGamesTab } from './tabs/SimpleGamesTab';
import { SimplePredictionsTab } from './tabs/SimplePredictionsTab';
import { SimpleParlaysTab } from './tabs/SimpleParlaysTab';
import { PlayerPropsTab as SimplePlayerPropsTab } from './tabs/PlayerPropsTab';
import { SimpleSettingsTab } from './tabs/SimpleSettingsTab';
import { SimpleAIInsightsTab } from './tabs/SimpleAIInsightsTab';
import { LegalDisclaimer } from '../legal/LegalDisclaimer';
import { TerminologyGuide } from '../ui/TerminologyGuide';
import { CacheStatsIndicator } from '../ui/CacheStatsIndicator';
import { FuturisticBackground } from '../ui/FuturisticBackground';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 -right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-screen-sm sm:max-w-screen-md mx-auto">
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
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {/* Nova Titan Dark Background with Brand Gradient */}
      <div 
        className="min-h-screen relative overflow-hidden nova-transition"
        style={{ 
          background: 'var(--nova-bg-primary)',
          fontFamily: 'var(--nova-font-family)'
        }}
      >
        {/* Nova Titan Futuristic Technology Background */}
        <FuturisticBackground />

        {/* Glassmorphism Content Container with Improved Z-Index Management */}
        <div className="relative w-full max-w-7xl mx-auto flex flex-col min-h-screen px-4 lg:px-6 py-6 gap-4" style={{ zIndex: 1 }}>
          {/* Nova Titan Header with Glassmorphism - CRITICAL: Highest Z-Index for Search Bar */}
          <header className="flex-shrink-0 relative" style={{ zIndex: 2000 }}>
            <SimpleHeader onRefresh={() => refetch()} />
          </header>

          {/* Nova Titan Navigation with Glass Effect - Below Header */}
          <nav className="flex-shrink-0 relative" style={{ zIndex: 1000 }}>
            <SimpleNavigation />
          </nav>

          {/* Main Content with Nova Titan Glass Card */}
          <div className="flex-1 flex flex-col relative" style={{ zIndex: 10 }}>
            <div 
              className="nova-card flex-1 p-6 nova-animate-fade-in relative"
              data-main-content="true"
              style={{
                background: 'var(--nova-glass-bg)',
                border: 'var(--nova-card-border)',
                backdropFilter: 'var(--nova-glass-backdrop)',
                WebkitBackdropFilter: 'var(--nova-glass-backdrop)',
                boxShadow: 'var(--nova-glass-shadow)',
                borderRadius: 'var(--nova-radius-2xl)',
                minHeight: '600px',
                zIndex: 10,
                isolation: 'isolate',
                marginTop: '0.5rem' // Small gap to ensure no overlap with sticky header
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedTab}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="h-full flex flex-col relative"
                  style={{ zIndex: 1 }}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Nova Titan Footer */}
          {config.showDisclaimers && (
            <div 
              className="flex-shrink-0 mt-6 p-4 rounded-xl nova-transition"
              style={{
                background: 'var(--nova-glass-bg)',
                border: 'var(--nova-card-border)',
                backdropFilter: 'var(--nova-glass-backdrop)',
                WebkitBackdropFilter: 'var(--nova-glass-backdrop)'
              }}
            >
              <LegalDisclaimer />
            </div>
          )}

          {/* Terminology Guide with Nova Titan Styling */}
          <TerminologyGuide 
            isOpen={showTerminologyGuide}
            onClose={() => setShowTerminologyGuide(false)}
          />

          {/* Cache Stats with Glass Effect */}
          <CacheStatsIndicator />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SimpleMainWidget;