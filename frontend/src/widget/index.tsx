/**
 * Nova Titan Sports Widget - Embeddable Web Component
 * 
 * This file creates a standalone, embeddable widget that can be loaded
 * via a single <script> tag on any website.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainWidget } from '../components/widget/MainWidget';
import { AgeGate } from '../components/legal/AgeGate';
import { useWidgetStore } from '../stores/widgetStore';
import { WidgetConfig, EmbedOptions } from '../types/widget';
import '../index.css';

// Widget configuration interface
interface NovaTitanWidgetInstance {
  init(config: Partial<WidgetConfig>): void;
  destroy(): void;
  updateConfig(config: Partial<WidgetConfig>): void;
  getConfig(): WidgetConfig;
}

// Widget wrapper component
function WidgetWrapper({ config }: { config: WidgetConfig }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });

  const { isAgeVerified, showAgeGate } = useWidgetStore();

  // Initialize widget store with config
  React.useEffect(() => {
    useWidgetStore.getState().setConfig(config);
  }, [config]);

  return (
    <QueryClientProvider client={queryClient}>
      <div 
        className="nova-titan-widget-container"
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          width: config.width || '100%',
          maxWidth: config.width || '800px',
          margin: '0 auto'
        }}
      >
        {/* Age Gate Modal */}
        {showAgeGate && !isAgeVerified && config.requireAgeVerification && (
          <AgeGate />
        )}
        
        {/* Main Widget */}
        <MainWidget />
      </div>
    </QueryClientProvider>
  );
}

class NovaTitanWidget implements NovaTitanWidgetInstance {
  private container: HTMLElement | null = null;
  private root: ReactDOM.Root | null = null;
  private config: WidgetConfig;

  constructor() {
    this.config = this.getDefaultConfig();
  }

  /**
   * Initialize the widget
   */
  init(userConfig: Partial<WidgetConfig> = {}): void {
    try {
      // Merge user config with defaults
      this.config = { ...this.config, ...userConfig };

      // Find or create container
      const containerId = userConfig.containerId || 'nova-titan-widget';
      this.container = document.getElementById(containerId);
      
      if (!this.container) {
        console.error(`Nova Titan Widget: Container element with ID "${containerId}" not found`);
        return;
      }

      // Apply container styles
      this.applyContainerStyles();

      // Create React root and render
      this.root = ReactDOM.createRoot(this.container);
      this.root.render(React.createElement(WidgetWrapper, { config: this.config }));

      // Log successful initialization
      console.log('Nova Titan Widget initialized successfully');

      // Track initialization if analytics enabled
      if (this.config.enableAnalytics && this.config.trackingId) {
        this.trackEvent('widget_initialized', {
          config: this.sanitizeConfigForTracking(this.config)
        });
      }

    } catch (error) {
      console.error('Nova Titan Widget initialization error:', error);
    }
  }

  /**
   * Destroy the widget instance
   */
  destroy(): void {
    try {
      if (this.root) {
        this.root.unmount();
        this.root = null;
      }
      
      if (this.container) {
        this.container.innerHTML = '';
        this.container = null;
      }

      console.log('Nova Titan Widget destroyed');
    } catch (error) {
      console.error('Nova Titan Widget destruction error:', error);
    }
  }

  /**
   * Update widget configuration
   */
  updateConfig(newConfig: Partial<WidgetConfig>): void {
    try {
      this.config = { ...this.config, ...newConfig };
      
      if (this.root && this.container) {
        this.root.render(React.createElement(WidgetWrapper, { config: this.config }));
      }

      console.log('Nova Titan Widget config updated');
    } catch (error) {
      console.error('Nova Titan Widget config update error:', error);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): WidgetConfig {
    return { ...this.config };
  }

  /**
   * Get default widget configuration
   */
  private getDefaultConfig(): WidgetConfig {
    return {
      apiUrl: 'https://api.nova-titan.com',
      theme: {
        primary: '#1e3a8a',
        accent: '#f59e0b',
        neutral: '#718096',
        background: '#ffffff',
        text: '#1f2937',
        border: '#e5e7eb',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        card: '#ffffff',
        button: '#1e3a8a',
        input: '#f9fafb'
      },
      features: {
        showPredictions: true,
        showOdds: true,
        showParlays: true,
        enableBetting: false, // Disabled by default for safety
        showPlayerStats: true,
        allowCustomStakes: false
      },
      leagues: ['NBA', 'NFL'],
      sports: ['basketball', 'football'],
      maxGames: 8,
      maxPlayerStats: 5,
      refreshInterval: 300, // 5 minutes
      autoRefresh: true,
      defaultOddsFormat: 'american',
      requireAgeVerification: true,
      minimumAge: 18,
      blockedRegions: [],
      showDisclaimers: true,
      affiliateLinks: {},
      enableAffiliate: false,
      enableAnalytics: false
    };
  }

  /**
   * Apply CSS styles to container
   */
  private applyContainerStyles(): void {
    if (!this.container) return;

    const styles = {
      boxSizing: 'border-box',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5',
      color: this.config.theme?.text || '#1f2937',
      backgroundColor: this.config.theme?.background || '#ffffff'
    };

    Object.assign(this.container.style, styles);
  }

  /**
   * Track analytics event
   */
  private trackEvent(eventName: string, data: any): void {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', eventName, {
        custom_parameter: data,
        event_category: 'nova_titan_widget'
      });
    }
  }

  /**
   * Remove sensitive data from config for tracking
   */
  private sanitizeConfigForTracking(config: WidgetConfig): any {
    const { apiKey, affiliateLinks, ...safeConfig } = config;
    return safeConfig;
  }
}

/**
 * Auto-initialization from script tag data attributes
 */
function autoInitFromScriptTag(): void {
  const script = document.querySelector('script[src*="nova-titan-widget"]') as HTMLScriptElement;
  if (!script) return;

  const embedOptions: EmbedOptions = {
    apiUrl: script.dataset.apiUrl || 'https://api.nova-titan.com'
  };

  // Extract configuration from data attributes
  const config: Partial<WidgetConfig> = {
    apiUrl: embedOptions.apiUrl,
  };

  // Theme colors
  if (script.dataset.themePrimary) {
    config.theme = { ...config.theme, primary: script.dataset.themePrimary };
  }
  if (script.dataset.themeAccent) {
    config.theme = { ...config.theme, accent: script.dataset.themeAccent };
  }
  if (script.dataset.themeNeutral) {
    config.theme = { ...config.theme, neutral: script.dataset.themeNeutral };
  }

  // Widget settings
  if (script.dataset.logoUrl) {
    config.logo = script.dataset.logoUrl;
  }
  if (script.dataset.title) {
    config.title = script.dataset.title;
  }
  if (script.dataset.leagues) {
    config.leagues = script.dataset.leagues.split(',').map(s => s.trim()) as any[];
  }
  if (script.dataset.sports) {
    config.sports = script.dataset.sports.split(',').map(s => s.trim()) as any[];
  }
  if (script.dataset.maxGames) {
    config.maxGames = parseInt(script.dataset.maxGames);
  }
  if (script.dataset.width) {
    config.width = script.dataset.width;
  }
  if (script.dataset.height) {
    config.height = script.dataset.height;
  }

  // Feature flags
  if (script.dataset.enablePredictions) {
    config.features = { ...config.features, showPredictions: script.dataset.enablePredictions === 'true' };
  }
  if (script.dataset.enableOdds) {
    config.features = { ...config.features, showOdds: script.dataset.enableOdds === 'true' };
  }
  if (script.dataset.enableParlays) {
    config.features = { ...config.features, showParlays: script.dataset.enableParlays === 'true' };
  }
  if (script.dataset.enableBetting) {
    config.features = { ...config.features, enableBetting: script.dataset.enableBetting === 'true' };
  }

  // Legal settings
  if (script.dataset.minAge) {
    config.minimumAge = parseInt(script.dataset.minAge);
  }
  if (script.dataset.blockedRegions) {
    config.blockedRegions = script.dataset.blockedRegions.split(',').map(s => s.trim());
  }

  // Analytics
  if (script.dataset.trackingId) {
    config.trackingId = script.dataset.trackingId;
    config.enableAnalytics = true;
  }

  // Auto-initialize widget
  const widget = new NovaTitanWidget();
  widget.init(config);

  // Expose widget instance globally
  (window as any).NovaTitanWidget = widget;
}

// Create widget class and expose globally
const widgetClass = NovaTitanWidget;
(window as any).NovaTitanWidget = widgetClass;

// Auto-initialize on DOM ready if script tag is present
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInitFromScriptTag);
} else {
  autoInitFromScriptTag();
}

// Export for manual usage
export { NovaTitanWidget };
export default NovaTitanWidget;