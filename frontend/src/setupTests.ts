import '@testing-library/jest-dom';
import type { GameData } from './components/GameCard';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Suppress console warnings during tests
const originalConsoleWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalConsoleWarn;
});

// Mock Headers
global.Headers = class Headers {
  constructor() {}
} as any;

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve([]),
    text: () => Promise.resolve(''),
    headers: new Headers(),
  })
) as jest.Mock;

// Mock test data for GameCard component
export const mockGameData: GameData = {
  id: 'test-game-1',
  homeTeam: 'Test Home Team',
  awayTeam: 'Test Away Team',
  homeTeamLogo: 'https://example.com/home-logo.png',
  awayTeamLogo: 'https://example.com/away-logo.png',
  gameTime: '7:00 PM',
  gameDate: '2024-10-22',
  venue: 'Test Stadium',
  sport: 'basketball_nba',
  status: 'scheduled',
  odds: {
    spread: { home: -5.5, away: 5.5, line: -110 },
    moneyline: { home: -150, away: 130 },
    over_under: { over: 220.5, under: 220.5, total: 220.5 }
  },
  network: 'ESPN',
  weather: 'Clear, 72°F'
};