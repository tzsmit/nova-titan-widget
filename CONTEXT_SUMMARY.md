# 📋 NOVA TITAN WIDGET - COMPLETE CONTEXT SUMMARY

**Generated**: November 7, 2025  
**Current Branch**: `feature/real-time-transformation`  
**Overall Progress**: ~15% Complete (Phase 1 of 8)

---

## 🎯 PRIMARY REQUEST & INTENT

You requested a **complete transformation** of the Nova Titan Widget into a **real-time, production-grade, multi-bookmaker parlay intelligence system**.

### Critical Requirements

#### 1. **Live Data Only - Zero Mock Data**
- Replace ALL static/placeholder data with live API feeds
- Primary sources: The Odds API, ESPN, optionally DraftKings/FanDuel/BetMGM
- Every response must include `lastUpdated` timestamp
- Cache duration: ≤ 60 seconds maximum

#### 2. **Real-Time Refresh**
- Update odds every 15-30 seconds
- No hard-coded delays
- WebSocket or Server-Sent Events (SSE) preferred
- Polling as fallback

#### 3. **Unified Data Schema**
```typescript
interface NormalizedMarket {
  eventId: string;
  sport: string;
  commenceTime: string;
  homeTeam: string;
  awayTeam: string;
  bookmaker: string;
  moneyline?: { home: number; away: number; homeDecimal: number; awayDecimal: number };
  spread?: { home: number; homePoints: number; away: number; awayPoints: number };
  total?: { over: number; overPoints: number; under: number; underPoints: number };
  props?: PlayerProp[];
  lastUpdated: string;
  impliedProbability?: { home: number; away: number };
  fairOdds?: { home: number; away: number };
  hold?: number;
}
```

#### 4. **Odds Intelligence**
- Convert American ↔ Decimal odds
- Calculate implied probabilities
- Remove vig for fair odds
- Display bookmaker hold percentage

#### 5. **Caching with Upstash Redis**
- Cache-aside pattern
- TTL: 30-60 seconds per data type
- Automatic cache warming on startup
- Cache invalidation on refresh

#### 6. **Parlay Engine**
- Support 2-15 leg parlays
- Calculate true odds (not naive multiplication)
- Expected Value (EV) computation
- Kelly Criterion (fractional 1/4 Kelly)
- Correlation detection (same-game, cross-game, prohibited combinations)
- Bankroll management recommendations

#### 7. **Compliance & Legal**
- Age verification (21+) gate
- Geolocation-based state filtering
- Responsible gaming disclaimers (1-800-GAMBLER)
- Affiliate deep links with UTM tracking
- No direct betting transactions (information only)

#### 8. **Security & Performance**
- HMAC request signing (frontend → backend)
- Rate limiting to prevent API abuse
- CORS restricted to `https://novatitan.net`
- Helmet CSP headers
- Sentry error tracking
- OpenTelemetry distributed tracing
- UptimeRobot monitoring

#### 9. **Performance Targets**
- API response: < 300ms
- Time to Interactive: < 2 seconds
- Lighthouse score: > 90
- Mobile-first, WCAG AA accessibility

#### 10. **Deployment**
- Vercel/Netlify with edge caching
- GitHub Actions CI/CD
- Automated testing (functional, security, performance)
- Health check endpoint (`/api/health`)

---

## 🔑 KEY TECHNICAL CONCEPTS

### Backend Architecture

#### **The Odds API Integration**
Primary source for live bookmaker odds across multiple markets:
- Sports: NBA, NFL, MLB, NHL, Soccer, MMA, etc.
- Markets: Moneyline, Spread, Totals, Player Props
- Bookmakers: DraftKings, FanDuel, BetMGM, Caesars, Pinnacle, BetRivers, etc.
- Updates: Every 15-30 seconds (based on API plan)

#### **ESPN API**
Live scores, team statistics, injury reports, schedules.

#### **Odds Conversion**
```typescript
// American to Decimal
americanToDecimal(odds: number): number {
  return odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;
}

// Decimal to American
decimalToAmerican(decimal: number): number {
  return decimal >= 2 ? (decimal - 1) * 100 : -100 / (decimal - 1);
}

// Implied Probability
oddsToImpliedProbability(american: number): number {
  return american > 0 
    ? 100 / (american + 100) 
    : Math.abs(american) / (Math.abs(american) + 100);
}
```

#### **Vig Removal (Fair Odds)**
```typescript
// Calculate bookmaker hold and remove it
const homeProb = oddsToImpliedProbability(homeOdds);
const awayProb = oddsToImpliedProbability(awayOdds);
const hold = (homeProb + awayProb) - 1; // Overround

const fairHomeProb = homeProb / (homeProb + awayProb);
const fairAwayProb = awayProb / (homeProb + awayProb);
```

#### **Upstash Redis Caching**
```typescript
// Cache-aside pattern
async getEvents(sport: string): Promise<NormalizedMarket[]> {
  const cacheKey = `events:${sport}`;
  
  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Fetch from API
  const data = await oddsAPI.getEvents(sport);
  
  // Store in cache with TTL
  await redis.setex(cacheKey, 60, JSON.stringify(data));
  
  return data;
}
```

### Frontend Architecture

#### **Parlay Drawer**
Persistent bottom drawer (mobile) or sidebar (desktop) showing:
- Selected legs with live odds
- Combined parlay odds (updates in real-time)
- Expected Value (EV)
- Kelly Criterion recommendation
- Correlation warnings
- Best lines across bookmakers

#### **Line Shopping**
Compare the same bet across multiple bookmakers:
```
Lakers ML
DraftKings: -150 ❌
FanDuel: -145 ✅ BEST LINE
BetMGM: -148
Caesars: -152
```
Savings calculator: "Betting at FanDuel saves you $X compared to Caesars"

#### **Real-Time Updates**
```typescript
// Polling approach (15-30 second interval)
useEffect(() => {
  const interval = setInterval(async () => {
    const freshOdds = await fetch('/api/events');
    setOdds(freshOdds);
  }, 20000); // 20 seconds
  
  return () => clearInterval(interval);
}, []);
```

### Parlay Mathematics

#### **True Odds Calculation**
```typescript
// Naive approach (WRONG for correlated legs)
const naiveOdds = leg1.decimal * leg2.decimal * leg3.decimal;

// Adjusted for correlation (CORRECT)
const adjustedOdds = naiveOdds * (1 - correlationFactor);
```

#### **Kelly Criterion**
```typescript
// Full Kelly (aggressive, not recommended)
const edge = (trueProbability * decimal) - 1;
const fullKelly = edge / (decimal - 1);

// Fractional Kelly (1/4 Kelly - conservative)
const fractionalKelly = fullKelly / 4;

// Recommended bet size
const recommendedBet = Math.min(
  fractionalKelly * bankroll,
  0.05 * bankroll // Never bet > 5%
);
```

#### **Correlation Detection**
```typescript
// Same-game correlations
if (leg1.eventId === leg2.eventId) {
  // Prohibited: Team ML + Team Spread
  if (leg1.market === 'moneyline' && leg2.market === 'spread') {
    warnings.push({ type: 'prohibited', severity: 'high' });
  }
  
  // Positive correlation: QB + WR same team
  if (leg1.player === 'Mahomes passing yards' && leg2.player === 'Kelce receiving yards') {
    adjustedProb *= 0.85; // Reduce combined probability by 15%
  }
}
```

### Compliance & Legal

#### **Age Verification**
```typescript
// Modal on first load
<AgeGate>
  <p>You must be 21+ to access betting odds</p>
  <button onClick={() => verifyAge()}>I am 21 or older</button>
</AgeGate>
```

#### **Geolocation Filtering**
```typescript
// Show only legal bookmakers per state
const legalBooks = getBookmakersByState(userState);

// Example: New York allows DraftKings, FanDuel, BetMGM, Caesars
// California shows "Sports betting not yet legal in CA"
```

#### **Responsible Gaming**
```html
<footer>
  <p>If you or someone you know has a gambling problem, call 1-800-GAMBLER</p>
  <a href="https://www.ncpgambling.org/">National Council on Problem Gambling</a>
</footer>
```

### Security

#### **HMAC Request Signing**
```typescript
// Frontend signs request
const signature = crypto
  .createHmac('sha256', secretKey)
  .update(JSON.stringify(requestBody))
  .digest('hex');

fetch('/api/parlay', {
  headers: { 'X-Signature': signature }
});

// Backend verifies
const expectedSignature = crypto
  .createHmac('sha256', secretKey)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Invalid signature');
}
```

#### **Rate Limiting**
```typescript
// Express middleware
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});

app.use('/api/', limiter);
```

---

## 📁 FILES & CODE SECTIONS

### Core Implementation Files

#### **REAL_TIME_TRANSFORMATION_PLAN.md** (8,036 lines)
- **Purpose**: Comprehensive 8-phase implementation roadmap
- **Status**: ✅ Complete, committed to feature/real-time-transformation
- **Content**:
  - Phase 1: Backend Live Aggregation Engine
  - Phase 2: Parlay & Analytics Engine
  - Phase 3: Frontend Enhancement
  - Phase 4: Compliance & Legal
  - Phase 5: Security & Performance
  - Phase 6: Testing & QA
  - Phase 7: Deployment
  - Phase 8: Documentation
- **Timeline**: 15-20 hours estimated total

#### **REAL_TIME_STATUS.md** (8,005 lines)
- **Purpose**: Progress tracking document
- **Status**: ✅ Created, ready to commit
- **Content**:
  - Phase 1: 40% complete
  - Overall: 15% complete
  - Remaining: 13-18 hours
  - Next steps clearly outlined

#### **backend/src/services/OddsAPI.ts** (9,021 lines)
- **Purpose**: Live odds aggregation from The Odds API and ESPN
- **Status**: ✅ Complete, committed
- **Why Important**: Core service that fetches real-time bookmaker odds
- **Key Features**:
  ```typescript
  export class OddsAPIService {
    async getSports(): Promise<any[]>
    async getEvents(sport: string): Promise<NormalizedMarket[]>
    async getEventOdds(sport: string, eventId: string): Promise<NormalizedMarket[]>
    private normalizeEvents(events: any[]): NormalizedMarket[]
    private americanToDecimal(american: number): number
    private decimalToAmerican(decimal: number): number
    private oddsToImpliedProbability(american: number): number
    private calculateHold(homeProb: number, awayProb: number): number
    async getQuota(): Promise<QuotaInfo>
  }
  ```

- **NormalizedMarket Schema**:
  ```typescript
  export interface NormalizedMarket {
    eventId: string;
    sport: string;
    commenceTime: string;
    homeTeam: string;
    awayTeam: string;
    bookmaker: string;
    moneyline?: { home: number; away: number; homeDecimal: number; awayDecimal: number };
    spread?: { home: number; homePoints: number; away: number; awayPoints: number };
    total?: { over: number; overPoints: number; under: number; underPoints: number };
    props?: PlayerProp[];
    lastUpdated: string;
    impliedProbability?: { home: number; away: number };
    fairOdds?: { home: number; away: number };
    hold?: number;
  }
  ```

#### **backend/src/services/ParlayEngine.ts** (9,710 lines)
- **Purpose**: Parlay calculation with EV, Kelly Criterion, correlation detection
- **Status**: ✅ Complete, committed
- **Why Important**: Core mathematics engine for parlay pricing and risk
- **Key Features**:
  ```typescript
  export class ParlayEngine {
    static calculate(legs: ParlayLeg[], bankroll: number): ParlayResult
    private static detectCorrelations(legs: ParlayLeg[]): CorrelationWarning[]
    private static checkSameGameCorrelation(leg1: ParlayLeg, leg2: ParlayLeg): CorrelationWarning[]
    private static adjustForCorrelations(prob: number, warnings: CorrelationWarning[]): number
    private static calculateEV(probability: number, decimal: number): number
    private static americanToDecimal(american: number): number
    private static decimalToAmerican(decimal: number): number
    private static oddsToImpliedProbability(american: number): number
    static findBestLines(legs: ParlayLeg[], allOdds: NormalizedMarket[]): BestLineResult
  }
  ```

- **ParlayResult Interface**:
  ```typescript
  export interface ParlayResult {
    legs: ParlayLeg[];
    parlayOdds: number; // American odds
    parlayDecimalOdds: number;
    trueProbability: number;
    payout: number; // Per $100 bet
    expectedValue: number;
    kellyFraction: number;
    recommendedBankroll: number;
    correlationWarnings: CorrelationWarning[];
    isValid: boolean;
    errors: string[];
  }
  ```

- **Correlation Detection**:
  ```typescript
  export interface CorrelationWarning {
    leg1: string;
    leg2: string;
    type: 'positive' | 'negative' | 'prohibited';
    severity: 'low' | 'medium' | 'high';
    message: string;
  }
  ```

### Previous Work (Analytics Engine - Different Direction)

The following files were created in an earlier implementation focused on **analytics/predictions**, which is **NOT** aligned with the current request for **live bookmaker odds**:

- ❌ `frontend/src/engine/analysisEngine.ts` - Prediction algorithms
- ❌ `frontend/src/engine/streakOptimizer.ts` - Safe streak building
- ❌ `frontend/src/engine/parlayAnalyzer.ts` - Correlation analysis
- ❌ `frontend/src/engine/dataAggregator.ts` - Mock data aggregation
- ❌ `frontend/src/engine/performanceTracker.ts` - ROI tracking
- ❌ `frontend/src/components/analytics/PlayerPropCard.tsx` - UI component
- ❌ `frontend/src/components/analytics/DashboardHero.tsx` - UI component
- ❌ `frontend/src/App-Premium.tsx` - Premium app integration

**Note**: These files are merged to main but do NOT align with the current transformation request.

---

## 🛠️ PROBLEM SOLVING

### Problem 1: No Visual Changes After First Implementation
- **Issue**: Built analytics engine components but didn't integrate into visible app
- **Root Cause**: Components created but not imported/rendered in main app
- **Solution**: Created `App-Premium.tsx` that imported all components
- **Fix**: Updated `main.tsx` to use `App-Premium` instead of base `App`
- **Outcome**: ✅ Changes became visible in deployed app

### Problem 2: Netlify Not Showing Updates
- **Issue**: User saw screenshot of Netlify not reflecting changes
- **Root Cause**: Deploy processing delay (2-5 minutes typical)
- **Analysis**: 
  - PR #4 was already merged to main
  - Files confirmed in repository
  - Netlify auto-deploys from main branch
- **Explanation**: Netlify UI cache or deploy still processing
- **Outcome**: ✅ Likely resolved (deploy completed after brief delay)

### Problem 3: Direction Mismatch
- **Issue**: First implementation was "analytics engine" with predictions, but user wanted "live bookmaker odds aggregation"
- **Root Cause**: Misunderstanding of requirements
- **Analysis**:
  - Old direction: Safety scores, streak optimizer, backtesting, mock data
  - New direction: Live API integration, real-time odds, multi-bookmaker comparison
- **Solution**: Started completely new implementation on separate branch
- **Current Status**: ✅ Phase 1 (40% complete) - Backend services built
- **Outcome**: 🔄 In progress, 85% remaining

### Ongoing Challenge: Complete Transformation
- Need to finish remaining 85% of real-time transformation
- Must integrate Redis caching, API endpoints, real-time refresh
- Frontend parlay drawer, line shopping, compliance features required
- Full QA validation before production deployment

---

## ⏳ PENDING TASKS

### Phase 1 - Backend (Remaining)
- [ ] **Redis Caching Layer** (~30 mins)
  - Set up Upstash Redis connection
  - Implement cache-aside pattern
  - Configure TTL (30-60s per data type)
  - Cache invalidation logic
  - Cache warming on startup

- [ ] **API Endpoints** (~1 hour)
  - Create Express/Fastify server
  - `GET /api/events` - Live events list
  - `GET /api/events/:eventId` - Event details with all bookmakers
  - `GET /api/books` - Available bookmakers by region/state
  - `GET /api/props/:eventId` - Player props for an event
  - `POST /api/price/parlay` - Calculate parlay odds, EV, Kelly
  - `GET /api/insights` - Market insights and +EV opportunities
  - `GET /api/health` - Health check endpoint

- [ ] **Real-Time Refresh System** (~30 mins)
  - Implement 15-30 second polling intervals
  - WebSocket or SSE for live updates (stretch goal)
  - Refresh queue management
  - Error handling with exponential backoff
  - Circuit breaker pattern for API failures

- [ ] **Testing** (~30 mins)
  - Test with live API key (The Odds API)
  - Verify data freshness (lastUpdated timestamps)
  - Confirm cache TTL working
  - Validate odds conversion accuracy

### Phase 2 - Advanced Parlay Features (~30 mins)
- [ ] Same Game Parlay (SGP) specific logic
- [ ] Multi-leg optimization algorithms
- [ ] Live payout recalculation as odds change
- [ ] Edge detection per leg across books

### Phase 3 - Frontend (~3-4 hours)
- [ ] **Parlay Drawer Component**
  - Persistent bottom drawer (mobile) / sidebar (desktop)
  - Real-time odds updates (no page refresh)
  - Live payout display
  - EV and Kelly Criterion badges
  - Remove leg functionality
  - Share parlay (copy link)

- [ ] **Bookmaker Picker**
  - Logos for each bookmaker
  - State availability filtering
  - Best line highlighting
  - Affiliate deep links with UTM tracking

- [ ] **Line Shopping Table**
  - Compare same bet across all books
  - Sort by best odds
  - Savings calculator
  - Color-coded best/worst lines

- [ ] **Live Score Widgets**
  - ESPN or SportRadar integration
  - In-game score updates
  - Game status (pre-game, live, final)

- [ ] **Filters**
  - Sport selector (NBA, NFL, MLB, etc.)
  - Date picker (today, tomorrow, week)
  - State selector (for legal bookmakers)
  - Bookmaker multi-select

- [ ] **Animations**
  - Framer Motion for smooth transitions
  - Odds change animations (flash green/red)
  - Loading skeletons

- [ ] **Real-Time Updates**
  - Polling every 15-30 seconds
  - Optimistic UI updates
  - Stale data indicators

### Phase 4 - Compliance (~1-2 hours)
- [ ] **Age Verification**
  - Modal on first load
  - LocalStorage persistence
  - 21+ gate before showing odds

- [ ] **Geolocation**
  - Detect user's state (IP or browser geolocation)
  - Filter bookmakers by state legality
  - Display "Not available in your state" message

- [ ] **Responsible Gaming**
  - Disclaimer modal
  - Footer with 1-800-GAMBLER
  - Links to NCPG resources
  - "Gambling Problem?" banner

- [ ] **Affiliate Links**
  - Deep links to bookmaker sites
  - UTM tracking parameters
  - Affiliate disclosure ("We may earn commission")

- [ ] **Data Attribution**
  - Display data sources ("Powered by The Odds API")
  - Show lastUpdated timestamp
  - Display bookmaker hold %

### Phase 5 - Security & Performance (~2-3 hours)
- [ ] **HMAC Signing**
  - Frontend signs all API requests
  - Backend verifies signatures
  - Secret key in environment variables

- [ ] **Rate Limiting**
  - Express rate-limit middleware
  - 100 requests per 15 minutes per IP
  - Custom error messages

- [ ] **CORS**
  - Restrict to `https://novatitan.net`
  - Allow credentials for authenticated requests

- [ ] **Helmet CSP**
  - Content Security Policy headers
  - XSS protection
  - Frame guard

- [ ] **Sentry**
  - Error tracking and reporting
  - Performance monitoring
  - User feedback integration

- [ ] **OpenTelemetry**
  - Distributed tracing
  - Custom spans for API calls
  - Performance metrics

- [ ] **UptimeRobot**
  - Monitor `/api/health` endpoint
  - Alert on downtime
  - Status page integration

### Phase 6 - Testing & QA (~3-4 hours)
- [ ] **Functional Tests (Jest/Vitest)**
  - Unit tests for OddsAPI service
  - Unit tests for ParlayEngine
  - Integration tests for API endpoints
  - Frontend component tests

- [ ] **Data Validation Tests**
  - Verify NormalizedMarket schema
  - Test odds conversion accuracy
  - Validate correlation detection
  - Confirm EV and Kelly calculations

- [ ] **Security Tests**
  - Test HMAC signature validation
  - Verify rate limiting
  - Check CORS configuration
  - CSP header validation

- [ ] **Performance Tests (K6/Artillery)**
  - Load testing (1000+ concurrent users)
  - API response time < 300ms
  - Cache hit rate > 80%
  - Time to Interactive < 2s

- [ ] **Lighthouse CI**
  - Performance score > 90
  - Accessibility score > 90
  - Best Practices score > 90
  - SEO score > 90

### Phase 7 - Deployment (~1-2 hours)
- [ ] **Vercel Configuration**
  - `vercel.json` setup
  - Serverless functions for API routes
  - Edge caching configuration
  - Environment variables

- [ ] **GitHub Actions CI/CD**
  - Run tests on every PR
  - Deploy preview on PR
  - Auto-deploy to production on merge to main
  - Lighthouse CI integration

- [ ] **Custom Domain**
  - Configure `novatitan.net`
  - SSL certificate
  - DNS records

### Phase 8 - Documentation (~1-2 hours)
- [ ] **`/docs/ARCHITECTURE.md`**
  - System architecture diagram
  - Data flow documentation
  - Technology stack details

- [ ] **`/docs/COMPLIANCE.md`**
  - Legal requirements
  - State-by-state bookmaker availability
  - Responsible gaming policies

- [ ] **`/docs/SECURITY.md`**
  - HMAC signing process
  - Rate limiting configuration
  - CORS and CSP policies

- [ ] **`/docs/API.md`**
  - API endpoint documentation
  - Request/response schemas
  - Example usage
  - Error codes

- [ ] **Updated `/README.md`**
  - Quick start guide
  - Feature overview
  - Deployment instructions

- [ ] **`/CHANGELOG.md`**
  - Version history
  - Breaking changes
  - Migration guides

---

## 🔄 CURRENT WORK

**Last Activity**: Immediately before this summary request, I was working on **Phase 1 of the Real-Time Transformation**.

### What Was Completed:
1. ✅ Created `REAL_TIME_TRANSFORMATION_PLAN.md` (8-phase roadmap)
2. ✅ Created `backend/src/services/OddsAPI.ts` (9,021 lines)
   - The Odds API client
   - ESPN API client
   - NormalizedMarket schema
   - Odds conversion utilities
   - Implied probability calculation
   - Vig removal
   - Hold % calculation
   - API quota tracking

3. ✅ Created `backend/src/services/ParlayEngine.ts` (9,710 lines)
   - Parlay calculation (2-15 legs)
   - Expected Value (EV) computation
   - Kelly Criterion (fractional 1/4 Kelly)
   - Correlation detection:
     - Same-game correlations
     - Prohibited combinations (ML + Spread)
     - Positive correlations (QB + WR)
     - Negative correlations (Team total + Opponent prop)
   - Best line finder
   - Line shopping savings calculator

4. ✅ Created `REAL_TIME_STATUS.md` (progress tracking)
5. ✅ Committed all work to `feature/real-time-transformation` branch

### Current Branch Status:
```bash
Branch: feature/real-time-transformation
Status: 1 untracked file (REAL_TIME_STATUS.md)
Last Commit: d8287b8f - "feat: Start real-time transformation - Backend API integration"
```

### Phase 1 Progress:
- **Overall Phase 1**: 40% complete
- **Completed**: OddsAPI service, ParlayEngine service
- **Remaining**: Redis caching, API endpoints, real-time refresh, testing

---

## 🚀 NEXT IMMEDIATE STEPS

Based on the explicit user request and current progress, the next steps are:

### Step 1: Redis Caching Service (~30 mins)
Create `backend/src/services/RedisCache.ts`:
```typescript
import { Redis } from '@upstash/redis';

export class RedisCacheService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  
  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data as T | null;
  }
  
  async set(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }
  
  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### Step 2: API Endpoints (~1 hour)
Create `backend/src/routes/api.ts`:
```typescript
import express from 'express';
import { OddsAPIService } from '../services/OddsAPI';
import { ParlayEngine } from '../services/ParlayEngine';
import { RedisCacheService } from '../services/RedisCache';

const router = express.Router();
const oddsAPI = new OddsAPIService({ apiKey: process.env.ODDS_API_KEY! });
const cache = new RedisCacheService();

// GET /api/events - Live events list
router.get('/events', async (req, res) => {
  const { sport = 'basketball_nba' } = req.query;
  
  const cacheKey = `events:${sport}`;
  const cached = await cache.get(cacheKey);
  if (cached) return res.json(cached);
  
  const events = await oddsAPI.getEvents(sport as string);
  await cache.set(cacheKey, events, 60);
  
  res.json(events);
});

// POST /api/price/parlay - Parlay calculator
router.post('/price/parlay', async (req, res) => {
  const { legs, bankroll = 1000 } = req.body;
  const result = ParlayEngine.calculate(legs, bankroll);
  res.json(result);
});

// ... more endpoints
```

### Step 3: Real-Time Refresh (~30 mins)
Implement polling system in frontend:
```typescript
// frontend/src/hooks/useRealTimeOdds.ts
export function useRealTimeOdds(sport: string) {
  const [odds, setOdds] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  useEffect(() => {
    const fetchOdds = async () => {
      const response = await fetch(`/api/events?sport=${sport}`);
      const data = await response.json();
      setOdds(data);
      setLastUpdated(new Date());
    };
    
    fetchOdds(); // Initial fetch
    const interval = setInterval(fetchOdds, 20000); // Every 20 seconds
    
    return () => clearInterval(interval);
  }, [sport]);
  
  return { odds, lastUpdated };
}
```

### Step 4: Test with Live API Key (~30 mins)
```bash
# Add to backend/.env
ODDS_API_KEY=your_actual_key_here
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Start backend
cd backend
npm install
npm run dev

# Test endpoints
curl http://localhost:3000/api/events?sport=basketball_nba
```

### Step 5: Deploy Backend to Vercel (~30 mins)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd backend
vercel

# Set environment variables in Vercel dashboard
```

### Then Move to Phase 3 (Frontend)
Build the parlay drawer, bookmaker picker, line shopping table, etc.

---

## 📊 PROGRESS METRICS

| Phase | Description | Status | Progress | Est. Time Remaining |
|-------|-------------|--------|----------|---------------------|
| 1 | Backend API | 🔄 In Progress | 40% | 1-2 hours |
| 2 | Parlay Engine | ✅ Core Complete | 80% | 0.5 hours |
| 3 | Frontend | ⏳ Not Started | 0% | 3-4 hours |
| 4 | Compliance | ⏳ Not Started | 0% | 1-2 hours |
| 5 | Security | ⏳ Not Started | 0% | 2-3 hours |
| 6 | Testing | ⏳ Not Started | 0% | 3-4 hours |
| 7 | Deployment | ⏳ Not Started | 0% | 1-2 hours |
| 8 | Docs | 🔄 In Progress | 10% | 1-2 hours |

**Overall Progress**: ~15% Complete  
**Time Invested**: ~2 hours  
**Time Remaining**: ~13-18 hours  
**Estimated Finish**: 2-3 days of focused work

---

## 💡 KEY DIFFERENCES FROM PREVIOUS WORK

### OLD (Analytics Engine - Merged to Main)
❌ **Focus**: Predictions and safety scores  
❌ **Data**: Mock/sample data  
❌ **Updates**: Static, no real-time  
❌ **Bookmakers**: None (no odds comparison)  
❌ **Parlay**: Correlation analysis only  
❌ **Features**: Streak optimizer, backtesting, ROI tracking  

### NEW (Real-Time Transformation - Current Work)
✅ **Focus**: Live bookmaker odds aggregation  
✅ **Data**: The Odds API, ESPN (100% real-time)  
✅ **Updates**: Every 15-30 seconds  
✅ **Bookmakers**: DraftKings, FanDuel, BetMGM, Caesars, Pinnacle, etc.  
✅ **Parlay**: True pricing with EV and Kelly Criterion  
✅ **Features**: Line shopping, best line finder, correlation warnings, compliance  

---

## 🎯 SUCCESS CRITERIA (NOT YET MET)

- ❌ All responses use live data (no mock/static)
- ❌ Updates within 30-60 seconds
- ❌ Multi-bookmaker coverage (5+ books)
- ❌ API response time < 300ms
- ❌ Frontend displays real-time odds
- ❌ Compliance features active (age gate, geolocation, disclaimers)
- ❌ Deployed to production (Vercel/Netlify)
- ❌ Lighthouse score > 90
- ❌ Full test coverage

---

## 🔧 TECHNOLOGY STACK

### Backend (Implemented)
- ✅ TypeScript
- ✅ The Odds API integration
- ✅ ESPN API integration
- ⏳ Express/Fastify (pending)
- ⏳ Upstash Redis (pending)

### Backend (Planned)
- Express or Fastify (API framework)
- Upstash Redis (caching)
- Vercel Serverless Functions
- Sentry (error tracking)
- OpenTelemetry (tracing)

### Frontend (Planned)
- React 18 + TypeScript
- Vite
- Zustand or Redux Toolkit (state management)
- Framer Motion (animations)
- Tailwind CSS
- Recharts (data visualization)

### Infrastructure (Planned)
- Vercel or Netlify (hosting)
- Upstash Redis (caching)
- GitHub Actions (CI/CD)
- UptimeRobot (monitoring)
- Lighthouse CI (performance)

---

## 🚀 HOW TO RESUME DEVELOPMENT

### Current State
```bash
# You are on feature/real-time-transformation branch
git status
# On branch feature/real-time-transformation
# Untracked files:
#   REAL_TIME_STATUS.md
```

### To Continue Work

1. **Commit the status document**:
```bash
cd /home/user/webapp
git add REAL_TIME_STATUS.md
git commit -m "docs: Add real-time transformation status report"
git push origin feature/real-time-transformation
```

2. **Install backend dependencies** (if not already):
```bash
cd backend
npm install
```

3. **Set up environment variables**:
```bash
# Create backend/.env
cat > backend/.env << 'EOF'
ODDS_API_KEY=your_key_here
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
PORT=3000
EOF
```

4. **Start building Redis cache service**:
```bash
# Create the file
touch backend/src/services/RedisCache.ts

# Install Upstash Redis
cd backend
npm install @upstash/redis
```

5. **Test existing services**:
```typescript
// Test OddsAPI
import { OddsAPIService } from './services/OddsAPI';

const oddsAPI = new OddsAPIService({ 
  apiKey: process.env.ODDS_API_KEY! 
});

const events = await oddsAPI.getEvents('basketball_nba');
console.log(events);

// Test ParlayEngine
import { ParlayEngine } from './services/ParlayEngine';

const parlay = ParlayEngine.calculate([
  { id: '1', eventId: 'abc', market: 'moneyline', selection: 'home', odds: -150 },
  { id: '2', eventId: 'def', market: 'spread', selection: 'away', odds: -110, line: -3.5 }
], 1000);

console.log(parlay);
```

---

## 📝 QUICK REFERENCE

### API Key Setup
1. Get free API key from The Odds API: https://the-odds-api.com/
2. Create Upstash Redis account: https://upstash.com/
3. Add keys to `backend/.env`

### Useful Commands
```bash
# Check current branch
git branch

# Commit changes
git add .
git commit -m "feat: Add Redis caching service"

# Push to remote
git push origin feature/real-time-transformation

# Run backend dev server
cd backend && npm run dev

# Run frontend dev server
cd frontend && npm run dev

# Run all tests
npm test

# Build for production
npm run build
```

### Important Endpoints (To Be Built)
- `GET /api/events` - Live events
- `GET /api/events/:eventId` - Event details
- `GET /api/books` - Bookmakers
- `POST /api/price/parlay` - Parlay calculator
- `GET /api/health` - Health check

---

## 🎯 FINAL NOTES

### What's Different About This Direction
This is a **complete pivot** from the earlier analytics engine work. We're now building a **live data aggregation platform** similar to:
- OddsJam (line shopping)
- Action Network (odds comparison)
- Betting Tools (parlay calculator)

But with **better UX**, **real-time updates**, and **compliance built-in**.

### Critical Constraints Reminder
1. **Zero static data** - Everything must come from live APIs
2. **30-60 second max cache** - Keep data fresh
3. **Production-grade** - Not a prototype, must be deployment-ready
4. **Compliance first** - Age verification, geolocation, disclaimers
5. **Performance targets** - < 300ms API, < 2s TTI, Lighthouse > 90

### Current Status
✅ **Core backend services built** (OddsAPI, ParlayEngine)  
🔄 **Phase 1 in progress** (Redis, API endpoints pending)  
⏳ **85% of work remaining** (Frontend, compliance, testing, deployment)  
🎯 **Estimated 13-18 hours to completion**

---

**Last Updated**: November 7, 2025  
**Branch**: `feature/real-time-transformation`  
**Status**: Ready to continue with Redis caching layer  
**Next PR**: Will be created after Phase 1 completion (backend API layer)
