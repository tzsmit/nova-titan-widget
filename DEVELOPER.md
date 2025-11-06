# 👨‍💻 Nova Titan Sports - Developer Documentation

## 🏗️ Architecture Overview

Nova Titan Sports is an elite AI-powered betting analytics platform with advanced prediction algorithms, streak optimization, and automated daily reports.

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Zustand
- **Analytics**: Custom prop analysis engine + ML algorithms
- **Styling**: Tailwind CSS
- **Charts**: Recharts + Chart.js
- **Deployment**: Netlify (Auto-deploy from main branch)
- **Automation**: GitHub Actions (Daily reports)

## 📁 Project Structure

```
nova-titan-sports/
├── frontend/                         # React frontend application
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── widget/tabs/         # Tab components
│   │   │   │   ├── StreakOptimizerTab.tsx  # Streak optimizer UI
│   │   │   │   └── ...              # Other tabs
│   │   │   └── ui/                  # Reusable UI components
│   │   ├── services/                # Business logic services
│   │   │   ├── analytics/           # ⭐ Core analytics engines
│   │   │   │   ├── propAnalysisEngine.ts      # Prop analysis
│   │   │   │   ├── streakOptimizer.ts         # Streak building
│   │   │   │   ├── parlayOptimizer.ts         # Parlay correlation
│   │   │   │   ├── performanceTracker.ts      # Performance tracking
│   │   │   │   └── playerStatsService.ts      # Player stats API
│   │   │   ├── realTimeAIPredictions.ts  # AI predictions
│   │   │   ├── realTimeOddsService.ts    # Live odds
│   │   │   └── oddsAPI.ts           # Odds API integration
│   │   ├── stores/                  # Zustand state stores
│   │   └── types/                   # TypeScript definitions
│   └── package.json
├── scripts/                         # Automation scripts
│   └── generateDailyReport.ts       # Daily report generator
├── .github/workflows/               # GitHub Actions
│   └── daily-reports.yml            # Daily automation
├── reports/                         # Generated HTML reports
├── netlify.toml                     # Netlify configuration
└── package.json
```

## 🧠 Core Analytics Engines

### 1. Prop Analysis Engine (`propAnalysisEngine.ts`)

Analyzes player props with advanced metrics:

```typescript
import { propAnalysisEngine, PlayerPropData } from './services/analytics/propAnalysisEngine';

const propData: PlayerPropData = {
  player: 'Luka Doncic',
  prop: 'points',
  line: 27.5,
  team: 'DAL',
  opponent: 'LAL',
  gameDate: '2025-11-07',
  isHome: true,
  lastTenGames: [32, 28, 35, 27, 30, 29, 31, 26, 33, 28],
  seasonAverage: 29.5,
  minutesPerGame: 36.5,
  injuryStatus: 'healthy',
  restDays: 1
};

const analysis = propAnalysisEngine.analyzeProp(propData);

console.log(analysis);
// Output:
// {
//   recommendation: 'HIGHER',
//   confidence: 88,
//   safetyScore: 92,
//   metrics: {
//     consistency: 0.85,
//     variance: 2.1,
//     trend: 'increasing',
//     hitRate: 0.80
//   },
//   risk: { level: 'LOW' }
// }
```

**Key Algorithms:**
- **Consistency Score**: (Games within ±1 of line) / Total Games
- **Variance**: Standard deviation of last 10 games (lower = safer)
- **Trend**: (Recent 5 avg - Season avg) / Season avg
- **Safety Score**: (Consistency × 0.4) + (1/Variance × 0.3) + (HitRate × 0.3)

### 2. Streak Optimizer (`streakOptimizer.ts`)

Builds safe multi-pick combinations (Underdog/PrizePicks style):

```typescript
import { streakOptimizer } from './services/analytics/streakOptimizer';

const analyses = /* array of PropAnalysis */;

// Get top safe picks
const recommendations = streakOptimizer.generateRecommendations(analyses, 10);

// Build custom streak
const customStreak = streakOptimizer.buildCustomStreak(
  analyses,
  3, // pick count
  'ultra-safe' // risk tolerance
);
```

**Features:**
- Top safe picks ranked by safety score
- Pre-built combos (2-pick, 3-pick, 4-pick)
- Avoid list with high-variance props
- Custom streak builder with risk tolerance

### 3. Parlay Optimizer (`parlayOptimizer.ts`)

Detects correlated picks and calculates true odds:

```typescript
import { parlayOptimizer, ParlayLeg } from './services/analytics/parlayOptimizer';

const legs: ParlayLeg[] = [
  { player: 'Mahomes', prop: 'passing_yards', pick: 'HIGHER', gameId: 'game1', odds: -110 },
  { player: 'Kelce', prop: 'receiving_yards', pick: 'HIGHER', gameId: 'game1', odds: -110 }
];

const analysis = parlayOptimizer.analyzeParlay(legs);

// Detects positive correlation (same game, passer-receiver)
// Adjusts true odds accordingly
```

**Correlation Detection:**
- Same-game parlays
- Passer-receiver combos (high positive correlation)
- Opposing outcomes (negative correlation)
- True odds calculation with adjustment

### 4. Performance Tracker (`performanceTracker.ts`)

Tracks picks and calculates ROI:

```typescript
import { performanceTracker } from './services/analytics/performanceTracker';

// Add a pick
const pickId = performanceTracker.addPick({
  date: '2025-11-07',
  player: 'Luka Doncic',
  prop: 'points',
  line: 27.5,
  pick: 'HIGHER',
  actualValue: 32, // Set after game
  confidence: 88,
  safetyScore: 92,
  odds: -110,
  stake: 100
});

// Update result
performanceTracker.updatePickResult(pickId, 32);

// Get stats
const stats = performanceTracker.getPerformanceStats();
// Returns: overall stats, by category, by safety, charts

// Backtest
const backtestResults = await performanceTracker.backtestAlgorithm(30);
```

**Tracked Metrics:**
- Win rate overall and by category
- ROI (Return on Investment)
- Longest win streak
- Confidence calibration (predicted vs actual)
- Daily win rate and profit curves

### 5. Player Stats Service (`playerStatsService.ts`)

Fetches real player stats:

```typescript
import { playerStatsService } from './services/analytics/playerStatsService';

// Fetch NBA player stats
const nbaStats = await playerStatsService.getNBAPlayerStats('Luka Doncic');

// Convert to prop data
const propData = await playerStatsService.convertToPropData(
  'Luka Doncic',
  'NBA',
  'points',
  27.5,
  'LAL',
  '2025-11-07',
  true
);

// Batch fetch
const props = await playerStatsService.batchFetchProps([
  { name: 'Luka Doncic', sport: 'NBA', prop: 'points', line: 27.5, ... },
  { name: 'Nikola Jokic', sport: 'NBA', prop: 'rebounds', line: 10.5, ... }
]);
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 8+
- TypeScript (for scripts)

### Installation

```bash
# Clone repository
git clone https://github.com/tzsmit/nova-titan-widget.git
cd nova-titan-widget

# Install dependencies
npm install
cd frontend && npm install

# Start development server
npm run dev
```

### Environment Variables

Create `.env` in frontend directory:

```env
VITE_ODDS_API_KEY=your_odds_api_key
VITE_ESPN_API_KEY=your_espn_api_key
VITE_NBA_API_KEY=your_nba_api_key
```

## 📊 Daily Reports

### Manual Generation

```bash
# Generate NBA report
npm run generate-report NBA

# Generate NFL report
npm run generate-report NFL

# Generate all reports
npm run generate-reports
```

### Automated Generation

Reports are automatically generated daily at 2 PM ET via GitHub Actions.

**Workflow Steps:**
1. Checkout repository
2. Install dependencies
3. Generate reports (NBA + NFL)
4. Commit reports to `reports/` directory
5. Trigger Netlify deployment
6. Test preview deployment

## 🧪 Testing

### Run Tests

```bash
cd frontend
npm test
```

### Backtesting

```bash
# Test algorithm on last 30 days
const results = await performanceTracker.backtestAlgorithm(30);
```

## 🔧 Adding New Features

### Adding a New Prop Type

1. Update `PlayerPropData` interface in `propAnalysisEngine.ts`
2. Add stat mapping in `playerStatsService.ts`
3. Update UI components to display new prop type

### Adding a New Sport

1. Add sport stats generator in `playerStatsService.ts`
2. Update report generator in `generateDailyReport.ts`
3. Add sport selector in UI components

### Customizing Safety Algorithm

The safety score formula is in `propAnalysisEngine.ts`:

```typescript
private calculateSafetyScore(
  consistency: number, 
  variance: number, 
  hitRate: number
): number {
  const varianceScore = variance > 0 ? Math.min(1, 5 / variance) : 0.5;
  const rawScore = (consistency * 0.4) + (varianceScore * 0.3) + (Math.abs(hitRate - 0.5) * 0.6);
  return Math.round(Math.min(100, rawScore * 100));
}
```

Adjust weights to prioritize different metrics.

## 📈 Performance Optimization

### Caching Strategy

- Team stats: 1 hour cache
- Player stats: 1 hour cache
- Live odds: 5 minutes cache
- Injury reports: 30 minutes cache

### Build Optimization

```bash
# Production build with optimizations
cd frontend
npm run build

# Analyze bundle size
npm run build -- --analyze
```

## 🐛 Troubleshooting

### Common Issues

**Issue: Reports not generating**
- Check GitHub Actions logs
- Verify API keys in secrets
- Ensure `reports/` directory exists

**Issue: High variance props**
- Increase minimum games threshold
- Adjust variance weight in safety score

**Issue: Correlation detection false positives**
- Tune correlation thresholds in `parlayOptimizer.ts`
- Add sport-specific correlation rules

## 📝 Code Style

### TypeScript

```typescript
// Use explicit types
export interface MyData {
  name: string;
  value: number;
}

// Use readonly for immutable data
readonly CACHE_TTL = 3600000;

// Use async/await over promises
async fetchData(): Promise<MyData> {
  const response = await fetch(url);
  return response.json();
}
```

### React Components

```typescript
// Use functional components with TypeScript
export const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  const [state, setState] = useState<StateType>(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return <div>...</div>;
};
```

## 🚢 Deployment

### Netlify (Production)

Automatic deployment on push to `main` branch.

```bash
# Manual deploy
npm run build
netlify deploy --prod
```

### Environment Setup

1. Add secrets in GitHub Settings → Secrets:
   - `ODDS_API_KEY`
   - `ESPN_API_KEY`
   - `NBA_API_KEY`
   - `NETLIFY_BUILD_HOOK`

2. Configure Netlify:
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/dist`
   - Environment variables: Same as GitHub secrets

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [The Odds API](https://the-odds-api.com/liveapi/guides/v4/)
- [ESPN API](https://site.api.espn.com/)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m "feat: Add my feature"`
3. Push to branch: `git push origin feature/my-feature`
4. Create pull request

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ by the Nova Titan Team**
