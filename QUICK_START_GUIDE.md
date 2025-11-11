# 🚀 NOVA TITAN - QUICK START GUIDE

**Branch**: `feature/real-time-transformation`  
**Status**: Phase 1 (40% complete) - Backend API Integration  
**Overall Progress**: 15% of total transformation

---

## 📖 TL;DR - What We're Building

Transforming Nova Titan into a **real-time, multi-bookmaker parlay intelligence platform** with:

✅ **Live odds** from The Odds API (DraftKings, FanDuel, BetMGM, Caesars, etc.)  
✅ **Real-time updates** every 15-30 seconds  
✅ **Parlay calculator** with Expected Value (EV) and Kelly Criterion  
✅ **Correlation detection** for same-game parlays  
✅ **Line shopping** to find best odds across bookmakers  
✅ **Compliance features** (age verification, geolocation, responsible gaming)  

**Zero static data. Everything is live.**

---

## 📊 Current Progress

### ✅ What's Done (15%)
- [x] **OddsAPI Service** (9,021 lines) - Live odds aggregation
- [x] **ParlayEngine Service** (9,710 lines) - Parlay math, EV, Kelly, correlations
- [x] **Transformation Plan** - 8-phase roadmap
- [x] **Branch Created** - `feature/real-time-transformation`

### 🔄 In Progress (Phase 1 - 40% complete)
- [ ] Redis caching layer (Upstash)
- [ ] Express/Fastify API endpoints
- [ ] Real-time refresh system
- [ ] Integration testing

### ⏳ Coming Next (85% remaining)
- Phase 2: Advanced parlay features
- Phase 3: Frontend UI (parlay drawer, line shopping, etc.)
- Phase 4: Compliance (age gate, geolocation, disclaimers)
- Phase 5: Security (HMAC, rate limiting, CORS)
- Phase 6: Testing & QA
- Phase 7: Deployment
- Phase 8: Documentation

---

## 🎯 What's Different from Before

### OLD (Already Merged to Main)
❌ Analytics engine with predictions  
❌ Mock/sample data  
❌ Safety scores and streak optimizer  
❌ No real-time updates  
❌ No bookmaker integration  

### NEW (Current Work)
✅ Live bookmaker odds aggregation  
✅ Real-time API integration  
✅ Multi-bookmaker comparison  
✅ True parlay pricing  
✅ Correlation warnings  
✅ Compliance-first approach  

---

## 🛠️ Quick Commands

### Resume Work
```bash
cd /home/user/webapp
git checkout feature/real-time-transformation
git pull origin feature/real-time-transformation
```

### Check What's Built
```bash
# View the core services
ls -lh backend/src/services/

# OddsAPI.ts - 9,021 lines
# ParlayEngine.ts - 9,710 lines
```

### Test Services (Once API Key Added)
```bash
# Add your API key to backend/.env
echo "ODDS_API_KEY=your_key_here" > backend/.env

# Install dependencies
cd backend
npm install

# Create test file
node -e "
const { OddsAPIService } = require('./src/services/OddsAPI');
const oddsAPI = new OddsAPIService({ apiKey: process.env.ODDS_API_KEY });
oddsAPI.getSports().then(console.log);
"
```

---

## 📝 Next 5 Steps (1-2 hours)

### 1. Redis Caching (~30 mins)
**File**: `backend/src/services/RedisCache.ts`  
**Purpose**: Cache API responses for 30-60 seconds  
**Dependencies**: `@upstash/redis`

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
}
```

### 2. API Endpoints (~1 hour)
**File**: `backend/src/routes/api.ts`  
**Purpose**: Express routes for all API endpoints

**Endpoints**:
- `GET /api/events` - Live events list
- `GET /api/events/:eventId` - Event details
- `GET /api/books` - Bookmakers by region
- `POST /api/price/parlay` - Parlay calculator
- `GET /api/health` - Health check

### 3. Real-Time Refresh (~30 mins)
**File**: `frontend/src/hooks/useRealTimeOdds.ts`  
**Purpose**: Polling hook for live odds updates

```typescript
export function useRealTimeOdds(sport: string) {
  const [odds, setOdds] = useState([]);
  
  useEffect(() => {
    const fetchOdds = async () => {
      const response = await fetch(`/api/events?sport=${sport}`);
      setOdds(await response.json());
    };
    
    fetchOdds();
    const interval = setInterval(fetchOdds, 20000); // 20 seconds
    
    return () => clearInterval(interval);
  }, [sport]);
  
  return { odds };
}
```

### 4. Test with Live API Key (~30 mins)
- Get API key from https://the-odds-api.com/
- Add to `backend/.env`
- Test endpoints with curl/Postman
- Verify data freshness (lastUpdated timestamps)

### 5. Deploy Backend (~30 mins)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd backend
vercel

# Set environment variables in Vercel dashboard:
# - ODDS_API_KEY
# - UPSTASH_REDIS_REST_URL
# - UPSTASH_REDIS_REST_TOKEN
```

---

## 🔑 Required API Keys

### 1. The Odds API
- **Get it**: https://the-odds-api.com/
- **Free tier**: 500 requests/month
- **Paid tier**: $99/month for 10,000 requests
- **What it gives**: Live odds from 30+ bookmakers

### 2. Upstash Redis
- **Get it**: https://upstash.com/
- **Free tier**: 10,000 requests/day
- **What it gives**: Serverless Redis for caching

### 3. ESPN API (Optional)
- **Get it**: https://www.espn.com/apis/devcenter/
- **What it gives**: Live scores, team stats, injury reports

---

## 📚 Key Documentation Files

| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `REAL_TIME_TRANSFORMATION_PLAN.md` | 8-phase roadmap | 8,036 | ✅ Complete |
| `REAL_TIME_STATUS.md` | Progress tracking | 8,005 | ✅ Complete |
| `CONTEXT_SUMMARY.md` | Full project context | 31,932 | ✅ Complete |
| `backend/src/services/OddsAPI.ts` | Live odds service | 9,021 | ✅ Complete |
| `backend/src/services/ParlayEngine.ts` | Parlay calculator | 9,710 | ✅ Complete |

---

## 🎯 Success Criteria (Not Yet Met)

- [ ] All responses use live data (no mock/static)
- [ ] Updates within 30-60 seconds
- [ ] Multi-bookmaker coverage (5+ books)
- [ ] API response time < 300ms
- [ ] Frontend displays real-time odds
- [ ] Compliance features active
- [ ] Deployed to production
- [ ] Lighthouse score > 90

---

## 💡 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Parlay   │  │    Line    │  │   Live     │            │
│  │   Drawer   │  │  Shopping  │  │   Scores   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│         │                │                │                  │
│         └────────────────┼────────────────┘                  │
│                          │                                   │
│                    Polling (15-30s)                          │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Express)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ GET /events│  │ POST /price│  │ GET /books │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│         │                │                │                  │
│         └────────────────┼────────────────┘                  │
│                          │                                   │
│                    ┌─────▼─────┐                            │
│                    │   Redis   │  (30-60s TTL)              │
│                    │   Cache   │                            │
│                    └─────┬─────┘                            │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICES LAYER                           │
│  ┌────────────┐  ┌────────────┐                            │
│  │  OddsAPI   │  │   Parlay   │                            │
│  │  Service   │  │   Engine   │                            │
│  └────────────┘  └────────────┘                            │
│         │                                                    │
│         └────────────────┐                                  │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL APIs                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  The Odds  │  │    ESPN    │  │ BookMakers │            │
│  │    API     │  │    API     │  │    APIs    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚨 Critical Constraints

1. **Zero Static Data**: Every response must be from live APIs
2. **Cache TTL**: Maximum 60 seconds
3. **Real-Time**: Updates every 15-30 seconds
4. **Performance**: < 300ms API response, < 2s TTI
5. **Compliance**: Age gate, geolocation, disclaimers
6. **Production-Ready**: Not a prototype

---

## 📞 Support & Resources

### Documentation
- **Full Context**: `CONTEXT_SUMMARY.md`
- **Progress Tracking**: `REAL_TIME_STATUS.md`
- **8-Phase Plan**: `REAL_TIME_TRANSFORMATION_PLAN.md`

### External Resources
- The Odds API Docs: https://the-odds-api.com/liveapi/guides/v4/
- Upstash Redis: https://docs.upstash.com/redis
- Vercel Deployment: https://vercel.com/docs

### Branch
- **Current**: `feature/real-time-transformation`
- **Remote**: https://github.com/tzsmit/nova-titan-widget/tree/feature/real-time-transformation

---

## ⏱️ Time Estimates

| Task | Time | Priority |
|------|------|----------|
| Redis caching | 30 mins | 🔴 High |
| API endpoints | 1 hour | 🔴 High |
| Real-time refresh | 30 mins | 🔴 High |
| Testing | 30 mins | 🔴 High |
| Frontend UI | 3-4 hours | 🟡 Medium |
| Compliance | 1-2 hours | 🟡 Medium |
| Security | 2-3 hours | 🟡 Medium |
| Testing & QA | 3-4 hours | 🟢 Low |
| Deployment | 1-2 hours | 🟢 Low |

**Total Remaining**: ~13-18 hours

---

**Last Updated**: November 7, 2025  
**Ready for**: Phase 1 completion (Redis + API endpoints)
