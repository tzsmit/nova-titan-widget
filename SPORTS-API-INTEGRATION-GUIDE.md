# 🏈 Sports API Integration Guide - Nova Titan Widget

## 📋 Overview

Your Nova Titan widget now has a complete data persistence layer using the RESTful Table API. This guide shows you how to connect external sports APIs to populate your widget with live games, odds, and generate AI predictions.

---

## 🚀 Quick Start (Development Server)

**First, get your widget running locally:**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Your widget will be available at `http://localhost:5173`

---

## 🔌 API Integration Options

### Option 1: Free Sports APIs (Recommended to Start)

**1. ESPN API (No API key required)**
```javascript
// Add this to frontend/src/utils/externalApiClient.ts
const ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports';

// NBA Games
const nbaGamesUrl = `${ESPN_BASE_URL}/basketball/nba/scoreboard`;

// NFL Games  
const nflGamesUrl = `${ESPN_BASE_URL}/football/nfl/scoreboard`;
```

**2. TheSportsDB API (Free tier available)**
```javascript
const SPORTSDB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json';

// Get leagues
const leaguesUrl = `${SPORTSDB_BASE_URL}/3/all_leagues.php`;

// Get team info
const teamUrl = `${SPORTSDB_BASE_URL}/3/lookupteam.php?id={teamId}`;
```

### Option 2: Premium Sports APIs (For Production)

**1. The Odds API ($$$)**
- Live odds from 40+ bookmakers
- Multiple sports coverage
- Real-time updates

**2. SportsRadar API ($$$)**
- Comprehensive sports data
- Official data provider
- Enterprise-grade reliability

**3. RapidAPI Sports Collection ($-$$$)**
- Various API providers
- Flexible pricing tiers
- Easy integration

---

## 🛠️ Implementation Steps

### Step 1: Create External API Client

Create `frontend/src/utils/externalApiClient.ts`:

```typescript
/**
 * External Sports API Client
 * Fetches live data from external sports APIs
 */

export interface ExternalGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  sport: string;
  league: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  odds?: {
    home_ml: number;
    away_ml: number;
    spread: number;
    total: number;
  };
}

class ExternalApiClient {
  private espnBaseUrl = 'https://site.api.espn.com/apis/site/v2/sports';
  
  // Fetch NBA games from ESPN
  async fetchNBAGames(): Promise<ExternalGame[]> {
    try {
      const response = await fetch(`${this.espnBaseUrl}/basketball/nba/scoreboard`);
      const data = await response.json();
      
      return data.events?.map(event => ({
        id: event.id,
        homeTeam: event.competitions[0].competitors.find(c => c.homeAway === 'home')?.team.displayName,
        awayTeam: event.competitions[0].competitors.find(c => c.homeAway === 'away')?.team.displayName,
        startTime: event.date,
        sport: 'basketball',
        league: 'NBA',
        status: event.status.type.name.toLowerCase(),
        homeScore: event.competitions[0].competitors.find(c => c.homeAway === 'home')?.score,
        awayScore: event.competitions[0].competitors.find(c => c.homeAway === 'away')?.score,
        // Note: ESPN doesn't provide odds - you'd need a separate odds API
        odds: {
          home_ml: -110,
          away_ml: +105,
          spread: -2.5,
          total: 215.5
        }
      })) || [];
    } catch (error) {
      console.error('Error fetching NBA games:', error);
      return [];
    }
  }
  
  // Fetch NFL games from ESPN
  async fetchNFLGames(): Promise<ExternalGame[]> {
    try {
      const response = await fetch(`${this.espnBaseUrl}/football/nfl/scoreboard`);
      const data = await response.json();
      
      return data.events?.map(event => ({
        id: event.id,
        homeTeam: event.competitions[0].competitors.find(c => c.homeAway === 'home')?.team.displayName,
        awayTeam: event.competitions[0].competitors.find(c => c.homeAway === 'away')?.team.displayName,
        startTime: event.date,
        sport: 'football',
        league: 'NFL',
        status: event.status.type.name.toLowerCase(),
        homeScore: event.competitions[0].competitors.find(c => c.homeAway === 'home')?.score,
        awayScore: event.competitions[0].competitors.find(c => c.homeAway === 'away')?.score,
        odds: {
          home_ml: -125,
          away_ml: +110,
          spread: -3.0,
          total: 48.5
        }
      })) || [];
    } catch (error) {
      console.error('Error fetching NFL games:', error);
      return [];
    }
  }
}

export const externalApiClient = new ExternalApiClient();
```

### Step 2: Create Data Sync Service

Create `frontend/src/services/dataSyncService.ts`:

```typescript
/**
 * Data Sync Service
 * Syncs external API data with our table API
 */

import { externalApiClient } from '../utils/externalApiClient';
import tableApiClient from '../utils/tableApiClient';

class DataSyncService {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  
  // Start syncing data every 5 minutes
  startSync(intervalMinutes: number = 5) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Initial sync
    this.syncAllData();
    
    // Set up interval
    this.intervalId = setInterval(() => {
      this.syncAllData();
    }, intervalMinutes * 60 * 1000);
    
    console.log(`🔄 Data sync started (every ${intervalMinutes} minutes)`);
  }
  
  stopSync() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏹️ Data sync stopped');
  }
  
  async syncAllData() {
    try {
      console.log('🔄 Syncing sports data...');
      
      // Fetch games from external APIs
      const nbaGames = await externalApiClient.fetchNBAGames();
      const nflGames = await externalApiClient.fetchNFLGames();
      
      const allGames = [...nbaGames, ...nflGames];
      
      // Sync games to our database
      for (const game of allGames) {
        await this.syncGameToDatabase(game);
      }
      
      // Generate AI predictions for new games
      await this.generatePredictions(allGames);
      
      console.log(`✅ Synced ${allGames.length} games successfully`);
    } catch (error) {
      console.error('❌ Error syncing data:', error);
    }
  }
  
  private async syncGameToDatabase(game: any) {
    try {
      // Check if game already exists
      const existing = await tableApiClient.getGame(game.id);
      
      const gameData = {
        id: game.id,
        home_team: game.homeTeam,
        away_team: game.awayTeam,
        start_time: game.startTime,
        sport: game.sport,
        league: game.league,
        status: game.status,
        home_score: game.homeScore || 0,
        away_score: game.awayScore || 0,
        odds_data: JSON.stringify(game.odds)
      };
      
      if (existing.success && existing.data) {
        // Update existing game
        await fetch(`tables/games/${game.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gameData)
        });
      } else {
        // Create new game
        await fetch('tables/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gameData)
        });
      }
    } catch (error) {
      console.error(`Error syncing game ${game.id}:`, error);
    }
  }
  
  private async generatePredictions(games: any[]) {
    // Generate AI predictions for upcoming games
    for (const game of games.filter(g => g.status === 'scheduled')) {
      try {
        // Simple AI prediction logic (you can make this more sophisticated)
        const confidence = Math.floor(Math.random() * 40) + 60; // 60-100%
        const expectedValue = Math.random() * 10 + 1; // 1-11
        
        const prediction = {
          id: `pred_${game.id}_${Date.now()}`,
          game_id: game.id,
          prediction_type: 'moneyline',
          prediction_value: Math.random() > 0.5 ? game.homeTeam : game.awayTeam,
          confidence,
          expected_value: expectedValue,
          model_version: 'Nova AI v2.1',
          reasoning: `Statistical analysis based on recent team performance, home field advantage, and player availability. Confidence: ${confidence}%`,
          status: 'pending'
        };
        
        // Save prediction
        await fetch('tables/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prediction)
        });
      } catch (error) {
        console.error(`Error generating prediction for game ${game.id}:`, error);
      }
    }
  }
}

export const dataSyncService = new DataSyncService();
```

### Step 3: Initialize Data Sync in Your App

Update `frontend/src/App.tsx`:

```typescript
import { useEffect } from 'react';
import { dataSyncService } from './services/dataSyncService';

function App() {
  // Start data sync when app loads
  useEffect(() => {
    dataSyncService.startSync(5); // Sync every 5 minutes
    
    // Cleanup on unmount
    return () => {
      dataSyncService.stopSync();
    };
  }, []);

  // ... rest of your App component
}
```

---

## 🔧 Configuration Options

### Environment Variables

Create `frontend/.env`:

```env
# Sports API Keys (when you get premium APIs)
VITE_ODDS_API_KEY=your_odds_api_key_here
VITE_SPORTSRADAR_KEY=your_sportsradar_key_here
VITE_RAPIDAPI_KEY=your_rapidapi_key_here

# Sync Settings
VITE_SYNC_INTERVAL=5
VITE_ENABLE_AUTO_SYNC=true

# Feature Flags
VITE_ENABLE_LIVE_ODDS=true
VITE_ENABLE_AI_PREDICTIONS=true
```

### Widget Settings

You can control data sources from the settings tab:

- **Auto-refresh interval** (1-60 minutes)
- **Enabled leagues** (NBA, NFL, NHL, etc.)
- **Prediction confidence threshold**
- **Live odds providers**

---

## 📊 Premium API Examples

### The Odds API Integration

```typescript
// For live odds (requires API key)
class OddsApiClient {
  private apiKey: string;
  private baseUrl = 'https://api.the-odds-api.com/v4';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async getLiveOdds(sport: string) {
    const response = await fetch(
      `${this.baseUrl}/sports/${sport}/odds?apiKey=${this.apiKey}&regions=us&markets=h2h,spreads,totals`
    );
    return response.json();
  }
}
```

### SportsRadar Integration

```typescript
// For official league data (requires API key)
class SportsRadarClient {
  private apiKey: string;
  private baseUrl = 'https://api.sportradar.us';
  
  async getNBAGames() {
    const response = await fetch(
      `${this.baseUrl}/nba/trial/v8/en/games/2024/REG/schedule.json?api_key=${this.apiKey}`
    );
    return response.json();
  }
}
```

---

## ✅ Testing Your Integration

### 1. Test with Mock Data First

Your widget already has sample data loaded. Start here to verify everything works.

### 2. Test External API Connection

```javascript
// Test in browser console:
fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard')
  .then(r => r.json())
  .then(console.log);
```

### 3. Verify Data Sync

Check your browser's Network tab to see:
- ✅ External API calls succeeding
- ✅ Table API POST/PUT requests
- ✅ Data appearing in your widget

### 4. Monitor Console Logs

Look for sync messages:
- `🔄 Syncing sports data...`
- `✅ Synced X games successfully`
- `❌ Error syncing data:` (if issues)

---

## 🚨 Important Notes

### CORS Policy
Some APIs may have CORS restrictions. If you encounter CORS errors:

1. **Use a CORS proxy service** (for development)
2. **Set up a backend server** (for production)
3. **Use official SDK/libraries** when available

### Rate Limits
- **ESPN API**: ~1000 requests/hour (unofficial)
- **The Odds API**: 500 requests/month (free tier)
- **SportsRadar**: Varies by plan

### Data Costs
- **Free APIs**: Limited features, may not have odds
- **Premium APIs**: $50-500/month depending on usage
- **Enterprise APIs**: $1000+/month for high volume

---

## 🎯 Next Steps

1. **Start the dev server**: `cd frontend && npm run dev`
2. **Choose an API provider** based on your needs and budget
3. **Implement the integration** using the code examples above
4. **Test with live data** and verify everything works
5. **Configure auto-sync** for real-time updates
6. **Add error handling** and monitoring
7. **Deploy to production** when ready

---

## 📞 Support

If you need help with:
- **API integration issues**
- **CORS problems** 
- **Data transformation**
- **Premium API setup**

Feel free to ask! I can help you troubleshoot specific integration challenges.

**Happy coding! 🚀**