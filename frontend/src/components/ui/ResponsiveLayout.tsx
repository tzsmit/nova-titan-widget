/**
 * ResponsiveLayout Component
 * Implements the specified responsive layouts:
 * - Desktop: 3-column layout (sidebar, main content, bet slip)
 * - Tablet: 2-column layout (main content, collapsible bet slip)
 * - Mobile: 1-column layout with slide-over bet slip
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import { ResponsiveHeader } from './ResponsiveHeader';
import { ResponsiveNavigation, NavTab } from './ResponsiveNavigation';
import { BetSlip } from '../BetSlip';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  
  // Header props
  headerProps?: {
    title?: string;
    subtitle?: string;
    logoUrl?: string;
    actions?: any[];
    notificationCount?: number;
  };
  
  // Navigation props
  navigationTabs: NavTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  
  // Sidebar content (desktop only)
  sidebarContent?: React.ReactNode;
  
  // Bet slip props
  betSlipProps?: {
    betSlip?: any;
    onBetRemoved?: (betId: string) => void;
    onStakeChanged?: (betId: string, newStake: number) => void;
    onBetSlipPlaced?: (betSlipId: string) => void;
    isLoading?: boolean;
    isPlacing?: boolean;
    error?: string | null;
  };
  
  // Layout configuration
  showSidebar?: boolean;
  showBetSlip?: boolean;
  sidebarWidth?: string;
  betSlipWidth?: string;
  
  // State
  className?: string;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  headerProps = {},
  navigationTabs,
  activeTab,
  onTabChange,
  sidebarContent,
  betSlipProps = {},
  showSidebar = true,
  showBetSlip = true,
  sidebarWidth = '280px',
  betSlipWidth = '320px',
  className,
}) => {
  // Responsive breakpoints
  const { isMobile, isTablet, isDesktop } = useBreakpoints();
  
  // Layout state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBetSlipOpen, setIsBetSlipOpen] = useState(false);
  const [betSlipCount, setBetSlipCount] = useState(0);

  // Calculate bet slip count from props
  useEffect(() => {
    if (betSlipProps.betSlip?.bets) {
      setBetSlipCount(betSlipProps.betSlip.bets.length);
    }
  }, [betSlipProps.betSlip]);

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (isDesktop) {
      setIsMobileMenuOpen(false);
    }
  }, [isDesktop]);

  // Close bet slip when switching to desktop (it becomes sidebar)
  useEffect(() => {
    if (isDesktop) {
      setIsBetSlipOpen(false);
    }
  }, [isDesktop]);

  // Handle bet slip toggle based on layout
  const handleBetSlipToggle = (isOpen: boolean) => {
    if (isMobile || isTablet) {
      setIsBetSlipOpen(isOpen);
    }
    // On desktop, bet slip is always visible as sidebar
  };

  // Layout variants based on screen size
  const getLayoutClasses = () => {
    if (isDesktop && showSidebar && showBetSlip) {
      // 3-column: sidebar + main + bet slip
      return {
        container: 'grid grid-cols-layout-desktop gap-6',
        main: 'min-w-0', // Prevent overflow
        sidebar: 'order-1',
        content: 'order-2',
        betslip: 'order-3'
      };
    } else if (isDesktop && (showSidebar || showBetSlip)) {
      // 2-column: sidebar/main or main/bet slip
      return {
        container: 'grid grid-cols-2 gap-6',
        main: 'min-w-0',
        sidebar: showSidebar ? 'order-1' : 'hidden',
        content: 'order-2',
        betslip: showBetSlip ? 'order-3' : 'hidden'
      };
    } else if (isTablet && showBetSlip) {
      // 2-column: main + collapsible bet slip
      return {
        container: 'grid grid-cols-layout-tablet gap-4',
        main: 'min-w-0',
        sidebar: 'hidden', // Hide sidebar on tablet
        content: 'order-1',
        betslip: 'order-2'
      };
    } else {
      // 1-column: mobile or simplified layout
      return {
        container: 'grid grid-cols-1',
        main: 'min-w-0',
        sidebar: 'hidden',
        content: 'order-1',
        betslip: 'hidden' // Mobile bet slip is slide-over
      };
    }
  };

  const layout = getLayoutClasses();

  return (
    <div className={cn('min-h-screen bg-neutral-50', className)}>
      {/* Header */}
      <ResponsiveHeader
        {...headerProps}
        onMenuToggle={setIsMobileMenuOpen}
        onBetSlipToggle={handleBetSlipToggle}
        betSlipCount={betSlipCount}
        isMenuOpen={isMobileMenuOpen}
        isBetSlipOpen={isBetSlipOpen}
      />

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {(isMobile || isTablet) && isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-modal-backdrop"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Slide-out navigation */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white shadow-xl z-modal overflow-y-auto"
            >
              <div className="p-4 border-b border-neutral-200">
                <h2 className="font-semibold text-neutral-900">Navigation</h2>
              </div>
              
              <div className="p-4">
                <ResponsiveNavigation
                  tabs={navigationTabs}
                  activeTab={activeTab}
                  onTabChange={(tabId) => {
                    onTabChange(tabId);
                    setIsMobileMenuOpen(false);
                  }}
                  variant="pills"
                  overflow="wrap"
                />
              </div>

              {/* Sidebar content in mobile menu */}
              {sidebarContent && (
                <div className="border-t border-neutral-200 p-4">
                  <h3 className="font-medium text-neutral-900 mb-3">Quick Access</h3>
                  {sidebarContent}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Layout Container */}
      <div className="max-w-content mx-auto px-4 lg:px-6 py-6">
        {/* Desktop Navigation */}
        {isDesktop && (
          <div className="mb-6">
            <ResponsiveNavigation
              tabs={navigationTabs}
              activeTab={activeTab}
              onTabChange={onTabChange}
              variant="underline"
              overflow="scroll"
            />
          </div>
        )}

        {/* Layout Grid */}
        <div className={layout.container} style={{
          gridTemplateColumns: isDesktop && showSidebar && showBetSlip
            ? `${sidebarWidth} 1fr ${betSlipWidth}`
            : isDesktop && showBetSlip
            ? `1fr ${betSlipWidth}`
            : isDesktop && showSidebar
            ? `${sidebarWidth} 1fr`
            : isTablet && showBetSlip
            ? `1fr ${betSlipWidth}`
            : '1fr'
        }}>
          {/* Sidebar - Desktop only */}
          {isDesktop && showSidebar && sidebarContent && (
            <aside className={cn('space-y-4', layout.sidebar)}>
              <div className="card-base p-4">
                <h3 className="font-semibold text-neutral-900 mb-4">Quick Access</h3>
                {sidebarContent}
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className={cn('space-y-6', layout.main, layout.content)}>
            {/* Mobile/Tablet Navigation */}
            {!isDesktop && (
              <div className="card-base p-3">
                <ResponsiveNavigation
                  tabs={navigationTabs}
                  activeTab={activeTab}
                  onTabChange={onTabChange}
                  variant="pills"
                  overflow={isMobile ? 'dropdown' : 'scroll'}
                  size="sm"
                />
              </div>
            )}

            {/* Main content */}
            <div className="min-w-0">
              {children}
            </div>
          </main>

          {/* Bet Slip - Desktop & Tablet sidebar */}
          {(isDesktop || isTablet) && showBetSlip && (
            <aside className={cn('space-y-4', layout.betslip)}>
              <BetSlip
                {...betSlipProps}
                variant="sidebar"
                className="sticky top-20"
              />
            </aside>
          )}
        </div>
      </div>

      {/* Mobile Bet Slip - Slide-over */}
      {isMobile && showBetSlip && (
        <BetSlip
          {...betSlipProps}
          variant="slide-over"
          isOpen={isBetSlipOpen}
          onClose={() => setIsBetSlipOpen(false)}
        />
      )}
    </div>
  );
};

export default ResponsiveLayout;