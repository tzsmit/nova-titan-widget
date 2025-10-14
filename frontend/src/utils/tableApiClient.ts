/**
 * Table API Client - Integrates with RESTful Table API
 * This replaces the mock backend with real data persistence
 */

// Types for our table API responses
export interface TableApiResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  table: string;
  schema: object;
}

export interface GameRecord {
  id: string;
  home_team: string;
  away_team: string;
  start_time: string;
  sport: string;
  league: string;
  status: 'upcoming' | 'live' | 'finished';
  home_score: number;
  away_score: number;
  odds_data: string; // JSON string containing odds info
  created_at?: number;
  updated_at?: number;
}

export interface PredictionRecord {
  id: string;
  game_id: string;
  prediction_type: 'moneyline' | 'spread' | 'total';
  prediction_value: string;
  confidence: number;
  expected_value: number;
  model_version: string;
  reasoning: string;
  status: 'pending' | 'won' | 'lost' | 'void';
  created_at?: number;
  updated_at?: number;
}

export interface UserBetRecord {
  id: string;
  user_id: string;
  game_id: string;
  prediction_id?: string;
  bet_type: string;
  stake: number;
  odds: number;
  potential_payout: number;
  status: 'pending' | 'won' | 'lost' | 'void';
  placed_at: string;
  created_at?: number;
  updated_at?: number;
}

export interface WidgetSettingRecord {
  id: string;
  user_id: string;
  setting_key: string;
  setting_value: string; // JSON string
  category: string;
  updated_at: string;
  created_at?: number;
}

class TableApiClient {
  private baseURL: string = '';

  constructor() {
    // Use relative URLs for the RESTful Table API
    this.baseURL = '';
  }

  // Generic table operations
  private async fetchTable<T>(
    tableName: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      sort?: string;
    } = {}
  ): Promise<TableApiResponse<T>> {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.search) params.append('search', options.search);
    if (options.sort) params.append('sort', options.sort);

    const response = await fetch(`${this.baseURL}tables/${tableName}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${tableName}: ${response.statusText}`);
    }
    
    return response.json();
  }

  private async getRecord<T>(tableName: string, recordId: string): Promise<T> {
    const response = await fetch(`${this.baseURL}tables/${tableName}/${recordId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get ${tableName} record: ${response.statusText}`);
    }
    
    return response.json();
  }

  private async createRecord<T>(tableName: string, data: Partial<T>): Promise<T> {
    const response = await fetch(`${this.baseURL}tables/${tableName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create ${tableName} record: ${response.statusText}`);
    }
    
    return response.json();
  }

  private async updateRecord<T>(tableName: string, recordId: string, data: Partial<T>): Promise<T> {
    const response = await fetch(`${this.baseURL}tables/${tableName}/${recordId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update ${tableName} record: ${response.statusText}`);
    }
    
    return response.json();
  }

  private async deleteRecord(tableName: string, recordId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}tables/${tableName}/${recordId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete ${tableName} record: ${response.statusText}`);
    }
  }

  // Games API
  async getGames(options: {
    sport?: string;
    league?: string;
    leagues?: string[];
    status?: string;
    limit?: number;
    page?: number;
  } = {}): Promise<{ data: GameRecord[]; success: boolean }> {
    try {
      let searchQuery = '';
      if (options.sport) {
        searchQuery += `sport:${options.sport} `;
      }
      if (options.league) {
        searchQuery += `league:${options.league} `;
      }
      if (options.leagues && options.leagues.length > 0) {
        searchQuery += `league:${options.leagues.join('|')} `;
      }
      if (options.status) {
        searchQuery += `status:${options.status} `;
      }

      const result = await this.fetchTable<GameRecord>('games', {
        search: searchQuery.trim(),
        limit: options.limit || 20,
        page: options.page || 1,
        sort: 'start_time'
      });

      // Transform the data to match expected format
      const transformedData = result.data.map(game => ({
        ...game,
        // Parse odds_data if it's a string
        odds: typeof game.odds_data === 'string' 
          ? JSON.parse(game.odds_data) 
          : game.odds_data
      }));

      return {
        data: transformedData,
        success: true
      };
    } catch (error) {
      console.error('Error fetching games:', error);
      return {
        data: [],
        success: false
      };
    }
  }

  async getGame(gameId: string): Promise<{ data: GameRecord | null; success: boolean }> {
    try {
      const game = await this.getRecord<GameRecord>('games', gameId);
      
      // Parse odds_data if it's a string
      const transformedGame = {
        ...game,
        odds: typeof game.odds_data === 'string' 
          ? JSON.parse(game.odds_data) 
          : game.odds_data
      };

      return {
        data: transformedGame,
        success: true
      };
    } catch (error) {
      console.error('Error fetching game:', error);
      return {
        data: null,
        success: false
      };
    }
  }

  // Predictions API
  async getPredictions(options: {
    game_id?: string;
    limit?: number;
    page?: number;
  } = {}): Promise<{ data: PredictionRecord[]; success: boolean }> {
    try {
      let searchQuery = '';
      if (options.game_id) {
        searchQuery = `game_id:${options.game_id}`;
      }

      const result = await this.fetchTable<PredictionRecord>('predictions', {
        search: searchQuery,
        limit: options.limit || 20,
        page: options.page || 1,
        sort: 'confidence desc'
      });

      return {
        data: result.data,
        success: true
      };
    } catch (error) {
      console.error('Error fetching predictions:', error);
      return {
        data: [],
        success: false
      };
    }
  }

  async getPrediction(predictionId: string): Promise<{ data: PredictionRecord | null; success: boolean }> {
    try {
      const prediction = await this.getRecord<PredictionRecord>('predictions', predictionId);
      return {
        data: prediction,
        success: true
      };
    } catch (error) {
      console.error('Error fetching prediction:', error);
      return {
        data: null,
        success: false
      };
    }
  }

  // User Bets API
  async createUserBet(betData: {
    user_id: string;
    game_id: string;
    prediction_id?: string;
    bet_type: string;
    stake: number;
    odds: number;
  }): Promise<{ data: UserBetRecord | null; success: boolean }> {
    try {
      const potential_payout = betData.stake * betData.odds;
      const bet = await this.createRecord<UserBetRecord>('user_bets', {
        ...betData,
        potential_payout,
        status: 'pending',
        placed_at: new Date().toISOString()
      });

      return {
        data: bet,
        success: true
      };
    } catch (error) {
      console.error('Error creating bet:', error);
      return {
        data: null,
        success: false
      };
    }
  }

  async getUserBets(userId: string): Promise<{ data: UserBetRecord[]; success: boolean }> {
    try {
      const result = await this.fetchTable<UserBetRecord>('user_bets', {
        search: `user_id:${userId}`,
        sort: 'placed_at desc'
      });

      return {
        data: result.data,
        success: true
      };
    } catch (error) {
      console.error('Error fetching user bets:', error);
      return {
        data: [],
        success: false
      };
    }
  }

  // Widget Settings API
  async getWidgetSettings(userId: string): Promise<{ data: Record<string, any>; success: boolean }> {
    try {
      const result = await this.fetchTable<WidgetSettingRecord>('widget_settings', {
        search: `user_id:${userId}`
      });

      // Convert array to object format
      const settings: Record<string, any> = {};
      result.data.forEach(setting => {
        try {
          settings[setting.setting_key] = JSON.parse(setting.setting_value);
        } catch {
          settings[setting.setting_key] = setting.setting_value;
        }
      });

      return {
        data: settings,
        success: true
      };
    } catch (error) {
      console.error('Error fetching widget settings:', error);
      return {
        data: {},
        success: false
      };
    }
  }

  async saveWidgetSetting(userId: string, key: string, value: any, category: string = 'general'): Promise<{ success: boolean }> {
    try {
      // Check if setting exists
      const existing = await this.fetchTable<WidgetSettingRecord>('widget_settings', {
        search: `user_id:${userId} setting_key:${key}`,
        limit: 1
      });

      const settingData = {
        user_id: userId,
        setting_key: key,
        setting_value: JSON.stringify(value),
        category,
        updated_at: new Date().toISOString()
      };

      if (existing.data.length > 0) {
        // Update existing
        await this.updateRecord('widget_settings', existing.data[0].id, settingData);
      } else {
        // Create new
        await this.createRecord('widget_settings', {
          ...settingData,
          id: `${userId}_${key}_${Date.now()}`
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving widget setting:', error);
      return { success: false };
    }
  }

  // Analytics and Health Check
  async healthCheck(): Promise<{ data: { status: string; timestamp: string }; success: boolean }> {
    try {
      // Simple health check by trying to fetch games table
      await this.fetchTable('games', { limit: 1 });
      
      return {
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString()
        },
        success: true
      };
    } catch (error) {
      return {
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString()
        },
        success: false
      };
    }
  }
}

// Create singleton instance
const tableApiClient = new TableApiClient();

export default tableApiClient;