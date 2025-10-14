/**
 * App Initializer - Handles startup tasks including roster sync
 */

import { rosterManager } from './rosterManager';
import { deploymentConfig, logDeploymentInfo } from '../config/deployment';
import { logDeploymentHealth } from '../utils/deploymentCheck';

class AppInitializer {
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the entire application
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('🔄 App already initialized');
      return;
    }

    if (this.initPromise) {
      console.log('⏳ App initialization in progress...');
      return this.initPromise;
    }

    this.initPromise = this.performInitialization();
    await this.initPromise;
  }

  /**
   * Perform all initialization tasks
   */
  private async performInitialization(): Promise<void> {
    console.log('🚀 Nova Titan App Initialization Starting...');
    const startTime = Date.now();

    try {
      // 1. Log deployment environment
      logDeploymentInfo();

      // 2. Run deployment health check
      await logDeploymentHealth();

      // 3. Initialize roster manager (this will auto-sync if needed)
      console.log('📊 Initializing roster data...');
      await rosterManager.initialize();

      // 4. Other initialization tasks can go here
      // await this.initializeOtherServices();

      const duration = (Date.now() - startTime) / 1000;
      console.log(`✅ Nova Titan App initialized successfully in ${duration.toFixed(1)}s`);
      
      if (deploymentConfig.isProduction) {
        console.log('🌐 Running in production mode with live APIs');
      } else {
        console.log('💾 Running in development mode with database sync');
      }
      
      this.initialized = true;

    } catch (error) {
      console.error('❌ App initialization failed:', error);
      // Don't throw in production - graceful degradation
      if (deploymentConfig.isDevelopment) {
        throw error;
      }
      this.initialized = true; // Allow app to continue in production
    }
  }

  /**
   * Check initialization status
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get initialization stats
   */
  async getInitStats(): Promise<any> {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }

    try {
      const rosterStats = await rosterManager.getRosterStats();
      
      return {
        status: 'initialized',
        roster: rosterStats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'initialized_with_errors',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const appInitializer = new AppInitializer();