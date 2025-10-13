import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface Game {
  id: string;
  home_team: string;
  away_team: string;
  start_time: string;
  sport: string;
  league: string;
  status: 'upcoming' | 'live' | 'finished';
  odds?: {
    home_ml: number;
    away_ml: number;
    spread: number;
    spread_odds: number;
    total: number;
    over_odds: number;
    under_odds: number;
  };
}

export interface Prediction {
  id: string;
  game_id: string;
  prediction_type: 'moneyline' | 'spread' | 'total';
  prediction_value: string;
  confidence: number;
  expected_value: number;
  model_version: string;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  settings: {
    currency: string;
    odds_format: string;
    notifications: boolean;
  };
}

export interface Bet {
  id: string;
  user_id: string;
  game_id: string;
  bet_type: string;
  stake: number;
  odds: number;
  potential_payout: number;
  status: 'pending' | 'won' | 'lost' | 'void';
  placed_at: string;
}

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for adding auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('nova_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for handling errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login or refresh token
          localStorage.removeItem('nova_token');
          window.dispatchEvent(new Event('auth-expired'));
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request<ApiResponse<T>>(config);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          data: null as any,
          error: error.response.data?.message || 'Server error occurred'
        };
      } else if (error.request) {
        // Network error
        return {
          success: false,
          data: null as any,
          error: 'Network error - please check your connection'
        };
      } else {
        // Other error
        return {
          success: false,
          data: null as any,
          error: error.message || 'Unknown error occurred'
        };
      }
    }
  }

  // Games API
  async getGames(options?: { 
    sport?: string; 
    date?: string;
    leagues?: string[];
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<Game[]>> {
    const params = new URLSearchParams();
    if (options?.sport) params.append('sport', options.sport);
    if (options?.date) params.append('date', options.date);
    if (options?.leagues) params.append('leagues', options.leagues.join(','));
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.status) params.append('status', options.status);
    
    return this.request<Game[]>({
      method: 'GET',
      url: `/api/games?${params.toString()}`
    });
  }

  async getGame(gameId: string): Promise<ApiResponse<Game>> {
    return this.request<Game>({
      method: 'GET',
      url: `/api/games/${gameId}`
    });
  }

  // Predictions API
  async getPredictions(gameId?: string): Promise<ApiResponse<Prediction[]>> {
    const url = gameId ? `/api/predictions?game_id=${gameId}` : '/api/predictions';
    return this.request<Prediction[]>({
      method: 'GET',
      url
    });
  }

  async getPrediction(predictionId: string): Promise<ApiResponse<Prediction>> {
    return this.request<Prediction>({
      method: 'GET',
      url: `/api/predictions/${predictionId}`
    });
  }

  // User API
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>({
      method: 'GET',
      url: '/api/user/profile'
    });
  }

  async updateUserSettings(settings: Partial<User['settings']>): Promise<ApiResponse<User>> {
    return this.request<User>({
      method: 'PATCH',
      url: '/api/user/settings',
      data: settings
    });
  }

  // Authentication API
  async login(username: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request<{ token: string; user: User }>({
      method: 'POST',
      url: '/api/auth/login',
      data: { username, password }
    });
  }

  async register(username: string, email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request<{ token: string; user: User }>({
      method: 'POST',
      url: '/api/auth/register',
      data: { username, email, password }
    });
  }

  async logout(): Promise<ApiResponse<null>> {
    const result = await this.request<null>({
      method: 'POST',
      url: '/api/auth/logout'
    });
    localStorage.removeItem('nova_token');
    return result;
  }

  // Betting API
  async placeBet(gameId: string, betType: string, stake: number, odds: number): Promise<ApiResponse<Bet>> {
    return this.request<Bet>({
      method: 'POST',
      url: '/api/bets',
      data: { game_id: gameId, bet_type: betType, stake, odds }
    });
  }

  async getUserBets(): Promise<ApiResponse<Bet[]>> {
    return this.request<Bet[]>({
      method: 'GET',
      url: '/api/bets'
    });
  }

  async getBet(betId: string): Promise<ApiResponse<Bet>> {
    return this.request<Bet>({
      method: 'GET',
      url: `/api/bets/${betId}`
    });
  }

  // Parlay API
  async placeParlay(legs: Array<{ game_id: string; bet_type: string; odds: number }>, stake: number): Promise<ApiResponse<Bet>> {
    return this.request<Bet>({
      method: 'POST',
      url: '/api/parlays',
      data: { legs, stake }
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>({
      method: 'GET',
      url: '/api/health'
    });
  }

  // Analytics API
  async getAnalytics(gameId: string): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'GET',
      url: `/api/analytics/${gameId}`
    });
  }

  // Live odds updates
  async subscribeLiveOdds(gameIds: string[], callback: (data: any) => void): Promise<void> {
    // In a real implementation, this would use WebSocket connection
    // For now, we'll simulate with polling
    const interval = setInterval(async () => {
      try {
        const promises = gameIds.map(id => this.getGame(id));
        const results = await Promise.all(promises);
        const validResults = results.filter(r => r.success).map(r => r.data);
        callback(validResults);
      } catch (error) {
        console.error('Error fetching live odds:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Store cleanup function (no return needed for void Promise)
    // () => clearInterval(interval);
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;

// Named exports for convenience
export const {
  getGames,
  getGame,
  getPredictions,
  getPrediction,
  getCurrentUser,
  updateUserSettings,
  login,
  register,
  logout,
  placeBet,
  getUserBets,
  getBet,
  placeParlay,
  healthCheck,
  getAnalytics,
  subscribeLiveOdds
} = apiClient;