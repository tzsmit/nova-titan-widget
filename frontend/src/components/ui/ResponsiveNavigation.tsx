/**
 * ResponsiveNavigation Component
 * Mobile-first tab navigation with overflow handling and accessibility
 * Fixes: games tab overflow, responsive layouts, proper touch targets
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  X
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export interface NavTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  description?: string;
  disabled?: boolean;
  shortLabel?: string; // For mobile
}

interface ResponsiveNavigationProps {
  tabs: NavTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  overflow?: 'scroll' | 'dropdown' | 'wrap';
  showLabels?: boolean;
  showIcons?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  variant = 'default',
  overflow = 'scroll',
  showLabels = true,
  showIcons = true,
  size = 'md',
}) => {
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Media queries
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  // Check scroll state
  const checkScrollState = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
  };

  useEffect(() => {
    checkScrollState();
    window.addEventListener('resize', checkScrollState);
    return () => window.removeEventListener('resize', checkScrollState);
  }, [tabs]);

  // Scroll functions
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Get visible and overflow tabs
  const getVisibleTabs = () => {
    if (overflow !== 'dropdown' || !isMobile) {
      return { visibleTabs: tabs, overflowTabs: [] };
    }

    // On mobile with dropdown overflow, show first 3 tabs + overflow
    const maxVisible = 3;
    if (tabs.length <= maxVisible) {
      return { visibleTabs: tabs, overflowTabs: [] };
    }

    // Always show active tab if not in visible range
    const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab);
    let visibleTabs = tabs.slice(0, maxVisible - 1);
    
    if (activeTabIndex >= maxVisible - 1) {
      // Active tab is in overflow, replace last visible tab
      visibleTabs = [...tabs.slice(0, maxVisible - 2), tabs[activeTabIndex]];
    }

    const overflowTabs = tabs.filter(tab => 
      !visibleTabs.some(visible => visible.id === tab.id)
    );

    return { visibleTabs, overflowTabs };
  };

  const { visibleTabs, overflowTabs } = getVisibleTabs();

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base'
  };

  // Variant classes
  const getTabClasses = (tab: NavTab, isActive: boolean) => {
    const baseClasses = cn(
      'relative inline-flex items-center justify-center space-x-2 font-medium transition-all duration-200 whitespace-nowrap',
      'focus:outline-none focus-ring disabled:opacity-50 disabled:pointer-events-none',
      'min-h-44', // Touch target minimum
      sizeClasses[size],
      tab.disabled && 'opacity-50 cursor-not-allowed'
    );

    switch (variant) {
      case 'pills':
        return cn(
          baseClasses,
          'rounded-full',
          isActive 
            ? 'bg-primary-600 text-white shadow-sm' 
            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
        );
      
      case 'underline':
        return cn(
          baseClasses,
          'border-b-2 rounded-none',
          isActive
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
        );
      
      default:
        return cn(
          baseClasses,
          'rounded-lg',
          isActive
            ? 'bg-primary-100 text-primary-700 shadow-sm'
            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
        );
    }
  };

  return (
    <nav 
      className={cn('relative w-full', className)}
      role="tablist"
      aria-label="Navigation tabs"
    >
      <div className="flex items-center">
        {/* Left scroll button */}
        {overflow === 'scroll' && canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="flex-shrink-0 p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Tabs container */}
        <div 
          ref={scrollContainerRef}
          onScroll={checkScrollState}
          className={cn(
            'flex items-center flex-1',
            overflow === 'scroll' && 'overflow-x-auto scrollbar-hide scroll-smooth',
            overflow === 'wrap' && 'flex-wrap gap-2',
            overflow === 'dropdown' && 'overflow-hidden'
          )}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Main tabs */}
          <div className={cn(
            'flex items-center',
            overflow === 'wrap' ? 'flex-wrap gap-2' : 'space-x-1 flex-shrink-0'
          )}>
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => !tab.disabled && onTabChange(tab.id)}
                  className={getTabClasses(tab, isActive)}
                  whileHover={!tab.disabled ? { scale: 1.02 } : undefined}
                  whileTap={!tab.disabled ? { scale: 0.98 } : undefined}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  title={tab.description}
                  disabled={tab.disabled}
                >
                  {/* Icon */}
                  {showIcons && tab.icon && (
                    <span className="flex-shrink-0">
                      {tab.icon}
                    </span>
                  )}

                  {/* Label */}
                  {showLabels && (
                    <span className={cn(
                      'truncate',
                      isMobile && tab.shortLabel ? 'hidden xs:inline' : ''
                    )}>
                      {isMobile && tab.shortLabel ? tab.shortLabel : tab.label}
                    </span>
                  )}

                  {/* Mobile short label */}
                  {showLabels && isMobile && tab.shortLabel && (
                    <span className="xs:hidden truncate">
                      {tab.shortLabel}
                    </span>
                  )}

                  {/* Badge */}
                  {tab.badge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        'flex-shrink-0 px-1.5 py-0.5 text-xs font-bold rounded-full',
                        isActive 
                          ? 'bg-white text-primary-600' 
                          : 'bg-error-500 text-white'
                      )}
                    >
                      {typeof tab.badge === 'number' && tab.badge > 99 ? '99+' : tab.badge}
                    </motion.span>
                  )}

                  {/* Active indicator for underline variant */}
                  {variant === 'underline' && isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                      layoutId="underline-indicator"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Overflow dropdown button */}
          {overflow === 'dropdown' && overflowTabs.length > 0 && (
            <div className="relative ml-1">
              <button
                onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                className={cn(
                  'p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors',
                  'flex items-center justify-center min-h-44' // Touch target
                )}
                aria-label={`${overflowTabs.length} more tabs`}
                aria-expanded={showOverflowMenu}
              >
                <MoreHorizontal className="w-4 h-4" />
                {overflowTabs.some(tab => tab.id === activeTab) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary-600 rounded-full" />
                )}
              </button>

              {/* Overflow menu */}
              <AnimatePresence>
                {showOverflowMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 min-w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-dropdown"
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-100">
                      <span className="text-sm font-medium text-neutral-900">More tabs</span>
                      <button
                        onClick={() => setShowOverflowMenu(false)}
                        className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
                        aria-label="Close menu"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="py-1">
                      {overflowTabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              if (!tab.disabled) {
                                onTabChange(tab.id);
                                setShowOverflowMenu(false);
                              }
                            }}
                            className={cn(
                              'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left',
                              'min-h-44', // Touch target
                              isActive 
                                ? 'bg-primary-50 text-primary-700' 
                                : 'text-neutral-700 hover:bg-neutral-50',
                              tab.disabled && 'opacity-50 cursor-not-allowed'
                            )}
                            disabled={tab.disabled}
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              {tab.icon && (
                                <span className="flex-shrink-0">
                                  {tab.icon}
                                </span>
                              )}
                              <span className="truncate">{tab.label}</span>
                            </div>
                            
                            {tab.badge && (
                              <span className={cn(
                                'flex-shrink-0 px-1.5 py-0.5 text-xs font-bold rounded-full ml-2',
                                isActive 
                                  ? 'bg-primary-600 text-white' 
                                  : 'bg-error-500 text-white'
                              )}>
                                {typeof tab.badge === 'number' && tab.badge > 99 ? '99+' : tab.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right scroll button */}
        {overflow === 'scroll' && canScrollRight && (
          <button
            onClick={scrollRight}
            className="flex-shrink-0 p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </nav>
  );
};

export default ResponsiveNavigation;