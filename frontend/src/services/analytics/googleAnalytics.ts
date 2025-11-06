/**
 * Google Analytics 4 Integration
 * Track user behavior and betting analytics performance
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export interface GAPageView {
  page_path: string;
  page_title: string;
}

export class GoogleAnalytics {
  private readonly GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
  private initialized = false;

  /**
   * Initialize Google Analytics
   */
  initialize(): void {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    // Check if GA is disabled (privacy settings)
    if (localStorage.getItem('ga_disabled') === 'true') {
      console.log('📊 Google Analytics disabled by user preference');
      return;
    }

    try {
      // Load GA4 script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);

      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer?.push(arguments);
      };

      window.gtag('js', new Date());
      window.gtag('config', this.GA_MEASUREMENT_ID, {
        send_page_view: false, // We'll send manually
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure'
      });

      this.initialized = true;
      console.log('✅ Google Analytics 4 initialized');
    } catch (error) {
      console.error('Error initializing Google Analytics:', error);
    }
  }

  /**
   * Track page view
   */
  pageView(path: string, title?: string): void {
    if (!this.initialized || !window.gtag) return;

    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title
    });
  }

  /**
   * Track custom event
   */
  trackEvent(event: GAEvent): void {
    if (!this.initialized || !window.gtag) return;

    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value
    });
  }

  // ============ BETTING ANALYTICS SPECIFIC EVENTS ============

  /**
   * Track prop analysis view
   */
  trackPropView(playerName: string, propType: string, safetyScore: number): void {
    this.trackEvent({
      action: 'view_prop_analysis',
      category: 'Prop Analysis',
      label: `${playerName} - ${propType}`,
      value: safetyScore
    });
  }

  /**
   * Track streak combo selection
   */
  trackStreakCombo(comboName: string, pickCount: number, combinedSafety: number): void {
    this.trackEvent({
      action: 'select_streak_combo',
      category: 'Streak Optimizer',
      label: comboName,
      value: combinedSafety
    });
  }

  /**
   * Track parlay creation
   */
  trackParlayCreated(legCount: number, hasCorrelation: boolean): void {
    this.trackEvent({
      action: 'create_parlay',
      category: 'Parlay Optimizer',
      label: hasCorrelation ? 'with_correlation' : 'no_correlation',
      value: legCount
    });
  }

  /**
   * Track pick added to slip
   */
  trackPickAdded(playerName: string, propType: string, pick: 'HIGHER' | 'LOWER'): void {
    this.trackEvent({
      action: 'add_pick',
      category: 'Bet Slip',
      label: `${playerName} - ${propType} - ${pick}`
    });
  }

  /**
   * Track report generation
   */
  trackReportGenerated(sport: 'NBA' | 'NFL', pickCount: number): void {
    this.trackEvent({
      action: 'generate_report',
      category: 'Daily Reports',
      label: sport,
      value: pickCount
    });
  }

  /**
   * Track report view
   */
  trackReportView(sport: 'NBA' | 'NFL', date: string): void {
    this.trackEvent({
      action: 'view_report',
      category: 'Daily Reports',
      label: `${sport} - ${date}`
    });
  }

  /**
   * Track performance review
   */
  trackPerformanceReview(winRate: number, roi: number): void {
    this.trackEvent({
      action: 'view_performance',
      category: 'Performance Tracker',
      label: `Win Rate: ${winRate.toFixed(1)}%`,
      value: Math.round(roi)
    });
  }

  /**
   * Track backtesting run
   */
  trackBacktest(days: number, winRate: number): void {
    this.trackEvent({
      action: 'run_backtest',
      category: 'Backtesting',
      label: `${days} days`,
      value: Math.round(winRate * 100)
    });
  }

  /**
   * Track injury alert
   */
  trackInjuryAlert(playerName: string, severity: 'critical' | 'warning' | 'info'): void {
    this.trackEvent({
      action: 'injury_alert',
      category: 'Injury Monitor',
      label: `${playerName} - ${severity}`
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName: string, action: string): void {
    this.trackEvent({
      action: 'use_feature',
      category: 'Feature Usage',
      label: `${featureName} - ${action}`
    });
  }

  /**
   * Track search
   */
  trackSearch(query: string, resultsCount: number): void {
    this.trackEvent({
      action: 'search',
      category: 'Search',
      label: query,
      value: resultsCount
    });
  }

  /**
   * Track filter usage
   */
  trackFilter(filterType: string, value: string): void {
    this.trackEvent({
      action: 'apply_filter',
      category: 'Filters',
      label: `${filterType}: ${value}`
    });
  }

  /**
   * Track user conversion funnel
   */
  trackConversionStep(step: 'view_picks' | 'add_to_slip' | 'share' | 'track_performance'): void {
    this.trackEvent({
      action: 'conversion_step',
      category: 'User Journey',
      label: step
    });
  }

  // ============ ADVANCED TRACKING ============

  /**
   * Track timing (performance metrics)
   */
  trackTiming(category: string, variable: string, timeMs: number): void {
    if (!this.initialized || !window.gtag) return;

    window.gtag('event', 'timing_complete', {
      name: variable,
      value: timeMs,
      event_category: category
    });
  }

  /**
   * Track exception/error
   */
  trackException(description: string, fatal: boolean = false): void {
    if (!this.initialized || !window.gtag) return;

    window.gtag('event', 'exception', {
      description,
      fatal
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: { [key: string]: any }): void {
    if (!this.initialized || !window.gtag) return;

    window.gtag('set', 'user_properties', properties);
  }

  /**
   * Track algorithm performance
   */
  trackAlgorithmPerformance(
    algorithmName: string,
    executionTimeMs: number,
    accuracy: number
  ): void {
    this.trackTiming('Algorithm Performance', algorithmName, executionTimeMs);
    this.trackEvent({
      action: 'algorithm_execution',
      category: 'Performance',
      label: algorithmName,
      value: Math.round(accuracy * 100)
    });
  }

  // ============ PRIVACY & CONSENT ============

  /**
   * Disable Google Analytics (GDPR compliance)
   */
  disable(): void {
    localStorage.setItem('ga_disabled', 'true');
    console.log('📊 Google Analytics disabled');
  }

  /**
   * Enable Google Analytics
   */
  enable(): void {
    localStorage.removeItem('ga_disabled');
    if (!this.initialized) {
      this.initialize();
    }
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.initialized && localStorage.getItem('ga_disabled') !== 'true';
  }
}

// Export singleton instance
export const analytics = new GoogleAnalytics();

// Auto-initialize on import (can be disabled)
if (typeof window !== 'undefined') {
  // Initialize after a short delay to not block initial render
  setTimeout(() => {
    analytics.initialize();
  }, 1000);
}
