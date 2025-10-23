/**
 * Simplified Widget Navigation - Fixed and Functional
 */

import React from 'react';
import { useWidgetStore } from '../../stores/widgetStore';
import { WidgetTab } from '../../stores/widgetStore';

const TABS = [
  {
    id: 'games' as WidgetTab,
    name: 'Games',
    icon: '🏈'
  },
  {
    id: 'predictions' as WidgetTab,
    name: 'AI Predictions', 
    icon: '🤖'
  },
  {
    id: 'ai-insights' as WidgetTab,
    name: 'AI Pro',
    icon: '🧠'
  },
  {
    id: 'parlays' as WidgetTab,
    name: 'Parlays',
    icon: '💰'
  },
  {
    id: 'player-props' as WidgetTab,
    name: 'Player',
    icon: '🧠'
  },
  {
    id: 'settings' as WidgetTab,
    name: 'Settings',
    icon: '⚙️'
  }
];

export const SimpleNavigation: React.FC = () => {
  const { selectedTab, setSelectedTab } = useWidgetStore();
  const [isInteracting, setIsInteracting] = React.useState(false);

  const handleTabClick = React.useCallback((tabId: WidgetTab, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log(`🎯 Navigation: Clicked on tab ${tabId}`);
    console.log('Previous tab:', selectedTab, '→ New tab:', tabId);
    
    setIsInteracting(true);
    setSelectedTab(tabId);
    
    // Reset interaction state after animation
    setTimeout(() => setIsInteracting(false), 300);
    
    // Scroll to top of content when tab changes
    const mainContent = document.querySelector('[data-main-content]');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedTab, setSelectedTab]);

  return (
    <nav 
      className="relative w-full"
      style={{
        background: 'var(--nova-glass-bg)',
        border: 'var(--nova-card-border)',
        backdropFilter: 'var(--nova-glass-backdrop)',
        WebkitBackdropFilter: 'var(--nova-glass-backdrop)',
        boxShadow: 'var(--nova-shadow-lg)',
        borderRadius: 'var(--nova-radius-2xl)',
        padding: 'var(--nova-space-3)',
        zIndex: 1000,  /* High z-index to ensure clickability */
        position: 'relative'
      }}
    >
      <div className="flex items-center justify-center">
        <div 
          className="flex rounded-xl p-2 gap-2 w-full overflow-x-auto scrollbar-hide"
          style={{ 
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 'var(--nova-radius-xl)'
          }}
        >
          {TABS.map((tab) => {
            const isActive = selectedTab === tab.id;
            
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`tab-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={(e) => handleTabClick(tab.id, e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTabClick(tab.id);
                  }
                }}
                className="nova-tab-button"
                style={{
                  background: isActive 
                    ? 'linear-gradient(135deg, var(--nova-primary-600), var(--nova-cyan-500))'
                    : 'transparent',
                  color: isActive 
                    ? 'var(--nova-text-primary)'
                    : 'var(--nova-text-secondary)',
                  fontWeight: isActive ? 'var(--nova-font-semibold)' : 'var(--nova-font-medium)',
                  boxShadow: isActive 
                    ? 'var(--nova-shadow-md), 0 0 20px rgba(6, 182, 212, 0.3)' 
                    : 'none',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  zIndex: isActive ? 1002 : 1001,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--nova-radius-lg)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--nova-font-family)',
                  minWidth: 'fit-content',
                  whiteSpace: 'nowrap',
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive && !isInteracting) {
                    e.currentTarget.style.background = 'var(--nova-glass-border)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = isActive ? 'scale(1.02)' : 'scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = isActive ? 'scale(1.05)' : 'scale(1.02)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid var(--nova-interactive-default)';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                <span 
                  className="text-lg pointer-events-none"
                  style={{ 
                    userSelect: 'none',
                    lineHeight: 1
                  }}
                >
                  {tab.icon}
                </span>
                <span 
                  className="pointer-events-none"
                  style={{
                    color: 'inherit',
                    userSelect: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 'inherit',
                    lineHeight: 1.2
                  }}
                >
                  {tab.name}
                </span>
                
                {/* Active glow indicator */}
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))',
                      animation: 'nova-glow-pulse 3s infinite',
                      zIndex: -1
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Tab panel indicator for screen readers */}
      <div className="sr-only" role="tabpanel" id={`tab-panel-${selectedTab}`}>
        Currently viewing {TABS.find(tab => tab.id === selectedTab)?.name} content
      </div>
    </nav>
  );
};