# 🚀 Nova Titan Backend - API Documentation

**Version**: 1.0.0  
**Base URL**: `http://localhost:3000/api`  
**Production URL**: `https://api.novatitan.net/api`

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Response Format](#response-format)
4. [Endpoints](#endpoints)
   - [Sports](#get-apisports)
   - [Events](#get-apievents)
   - [Event Details](#get-apieventseventid)
   - [Bookmakers](#get-apibookmakers)
   - [Player Props](#get-apipropseventid)
   - [Parlay Calculator](#post-apipreparlay)
   - [Market Insights](#get-apiinsights)
   - [API Quota](#get-apiquota)
   - [Health Check](#get-apihealth)
   - [Cache Stats](#get-apicachestats)
   - [Cache Invalidation](#post-apicacheinvalidate)
5. [Data Models](#data-models)
6. [Error Codes](#error-codes)
7. [Usage Examples](#usage-examples)

---

## 🔐 Authentication

Currently, the API does not require authentication for public endpoints. Future versions may implement:

- API keys for rate limiting
- HMAC signature verification
- OAuth 2.0 for user-specific data

---

## ⏱️ Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP address
- **Headers**:
  - `RateLimit-Limit`: Maximum requests allowed
  - `RateLimit-Remaining`: Requests remaining
  - `RateLimit-Reset`: Time when limit resets (Unix timestamp)

**Response when rate limited**:
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

---

## 📦 Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "cached": false,
  "timestamp": "2025-11-07T12:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here",
  "timestamp": "2025-11-07T12:00:00.000Z"
}
```

---

## 🎯 Endpoints

### GET /api/sports

Get list of available sports from The Odds API.

**Cache TTL**: 1 hour

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "key": "basketball_nba",
      "group": "Basketball",
      "title": "NBA",
      "description": "US Basketball",
      "active": true,
      "has_outrights": false
    },
    {
      "key": "americanfootball_nfl",
      "group": "American Football",
      "title": "NFL",
      "description": "US Football",
      "active": true,
      "has_outrights": false
    }
  ],
  "cached": false,
  "timestamp": "2025-11-07T12:00:00.000Z"
}
```

---

### GET /api/events

Get live and upcoming events for a specific sport.

**Query Parameters**:
- `sport` (required): Sport key (e.g., `basketball_nba`)
- `regions` (optional): Comma-separated regions (default: `us`)
- `markets` (optional): Comma-separated markets (default: `h2h,spreads,totals`)

**Cache TTL**: 30 seconds

**Example Request**:
```
GET /api/events?sport=basketball_nba
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "eventId": "abc123",
      "sport": "basketball_nba",
      "commenceTime": "2025-11-07T19:30:00Z",
      "homeTeam": "Los Angeles Lakers",
      "awayTeam": "Golden State Warriors",
      "bookmaker": "draftkings",
      "moneyline": {
        "home": -150,
        "away": 130,
        "homeDecimal": 1.67,
        "awayDecimal": 2.30
      },
      "spread": {
        "home": -110,
        "homePoints": -3.5,
        "away": -110,
        "awayPoints": 3.5
      },
      "total": {
        "over": -110,
        "overPoints": 225.5,
        "under": -110,
        "underPoints": 225.5
      },
      "lastUpdated": "2025-11-07T12:00:00.000Z",
      "impliedProbability": {
        "home": 0.60,
        "away": 0.43
      },
      "fairOdds": {
        "home": -145,
        "away": 125
      },
      "hold": 0.03
    }
  ],
  "count": 15,
  "sport": "basketball_nba",
  "cached": false,
  "timestamp": "2025-11-07T12:00:00.000Z"
}
```

---

### GET /api/events/:eventId

Get detailed odds for a specific event across all bookmakers.

**URL Parameters**:
- `eventId` (required): Unique event identifier

**Query Parameters**:
- `sport` (required): Sport key (e.g., `basketball_nba`)

**Cache TTL**: 30 seconds

**Example Request**:
```
GET /api/events/abc123?sport=basketball_nba
```

**Response**: Same format as `/api/events` but filtered to single event with multiple bookmakers.

---

### GET /api/bookmakers

Get list of available bookmakers by region.

**Query Parameters**:
- `region` (optional): Region code (`us`, `uk`, `au`) - default: `us`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "draftkings",
      "name": "DraftKings",
      "states": ["NY", "NJ", "PA", "MI", "CO", "IN", "IL", "VA", "TN", "AZ", "WV", "IA", "LA"]
    },
    {
      "id": "fanduel",
      "name": "FanDuel",
      "states": ["NY", "NJ", "PA", "MI", "CO", "IN", "IL", "VA", "TN", "AZ", "WV", "IA", "LA"]
    }
  ],
  "region": "us",
  "timestamp": "2025-11-07T12:00:00.000Z"
}
```

---

### GET /api/props/:eventId

Get player props for a specific event.

**URL Parameters**:
- `eventId` (required): Unique event identifier

**Query Parameters**:
- `sport` (required): Sport key

**Cache TTL**: 30 seconds

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "playerId": "player123",
      "playerName": "LeBron James",
      "market": "points",
      "line": 27.5,
      "over": -110,
      "under": -110,
      "overDecimal": 1.91,
      "underDecimal": 1.91
    }
  ],
  "eventId": "abc123",
  "cached": false,
  "timestamp": "2025-11-07T12:00:00.000Z"
}
```

---

### POST /api/price/parlay

Calculate parlay odds, Expected Value (EV), and Kelly Criterion.

**Request Body**:
```json
{
  "legs": [
    {
      "id": "1",
      "eventId": "abc123",
      "market": "moneyline",
      "selection": "home",
      "odds": -150,
      "sport": "basketball_nba",
      "teams": {
        "home": "Los Angeles Lakers",
        "away": "Golden State Warriors"
      }
    },
    {
      "id": "2",
      "eventId": "def456",
      "market": "spread",
      "selection": "away",
      "odds": -110,
      "line": 3.5,
      "sport": "basketball_nba",
      "teams": {
        "home": "Boston Celtics",
        "away": "Miami Heat"
      }
    }
  ],
  "bankroll": 1000
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "legs": [ /* same as input */ ],
    "parlayOdds": 254,
    "parlayDecimalOdds": 3.54,
    "trueProbability": 0.34,
    "payout": 254,
    "expectedValue": 0.20,
    "kellyFraction": 0.045,
    "recommendedBankroll": 45,
    "correlationWarnings": [],
    "isValid": true,
    "errors": []
  },
  "timestamp": "2025-11-07T12:00:00.000Z"
}
```

**Correlation Warnings** (if any):
```json
{
  "correlationWarnings": [
    {
      "leg1": "1",
      "leg2": "2",
      "type": "positive",
      "severity": "medium",
      "message": "Same team parlay detected: reduced combined probability"
    }
  ]
}
```

---

### GET /api/insights

Get market insights and +EV opportunities.

**Query Parameters**:
- `sport` (optional): Sport key - default: `basketball_nba`

**Cache TTL**: 1 minute

**Response**:
```json
{
  "success": true,
  "data": {
    "totalEvents": 15,
    "totalBookmakers": 7,
    "averageHold": 0.045,
    "lowHoldMarkets": [
      {
        "eventId": "abc123",
        "bookmaker": "pinnacle",
        "hold": 0.018
      }
    ],
    "timestamp": "2025-11-07T12:00:00.000Z"
  },
  "cached": false,
  "timestamp": "2025-11-07T12:00:00.000Z"
}
```

---

### GET /api/quota

Get The Odds API quota information.

**Response**:
```json
{
  "success": true,
  "data": {
    "used": 245,
    "remaining": 755,
    "limit": 1000
  },
  "timestamp": "2025-11-07T12:00:00.000Z"
}
```

---

### GET /api/health

Health check endpoint for monitoring.

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-11-07T12:00:00.000Z",
    "uptime": 3600,
    "cache": {
      "enabled": true,
      "connected": true,
      "stats": {
        "hits": 150,
        "misses": 50,
        "sets": 200,
        "deletes": 10,
        "hitRate": 0.75
      }
    },
    "api": {
      "oddsAPI": "connected"
    }
  }
}
```

---

### GET /api/cache/stats

Get cache statistics.

**Response**:
```json
{
  "success": true,
  "data": {
    "hits": 150,
    "misses": 50,
    "sets": 200,
    "deletes": 10,
    "hitRate": 0.75
  },
  "timestamp": "2025-11-07T12:00:00.000Z"
}
```

---

### POST /api/cache/invalidate

Invalidate cache by pattern (admin only).

**Request Body**:
```json
{
  "pattern": "events:*"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "pattern": "events:*",
    "deletedCount": 15
  },
  "timestamp": "2025-11-07T12:00:00.000Z"
}
```

---

## 📊 Data Models

### NormalizedMarket
```typescript
interface NormalizedMarket {
  eventId: string;
  sport: string;
  commenceTime: string;
  homeTeam: string;
  awayTeam: string;
  bookmaker: string;
  moneyline?: {
    home: number;          // American odds
    away: number;
    homeDecimal: number;
    awayDecimal: number;
  };
  spread?: {
    home: number;          // American odds
    homePoints: number;    // Spread line
    away: number;
    awayPoints: number;
  };
  total?: {
    over: number;          // American odds
    overPoints: number;    // Total line
    under: number;
    underPoints: number;
  };
  props?: PlayerProp[];
  lastUpdated: string;    // ISO 8601 timestamp
  impliedProbability?: {
    home: number;         // 0-1 probability
    away: number;
  };
  fairOdds?: {
    home: number;         // Vig-free American odds
    away: number;
  };
  hold?: number;          // Bookmaker hold percentage (0-1)
}
```

### ParlayLeg
```typescript
interface ParlayLeg {
  id: string;
  eventId: string;
  market: 'moneyline' | 'spread' | 'total' | 'prop';
  selection: string;      // 'home', 'away', 'over', 'under', player name
  odds: number;           // American odds
  line?: number;          // For spreads/totals/props
  sport?: string;
  teams?: {
    home: string;
    away: string;
  };
}
```

---

## ❌ Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid parameters |
| 404 | Not Found | Endpoint or resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | Cache or external API unavailable |

---

## 💡 Usage Examples

### Example 1: Get Live NBA Odds

```bash
curl -X GET "http://localhost:3000/api/events?sport=basketball_nba"
```

### Example 2: Calculate 3-Leg Parlay

```bash
curl -X POST "http://localhost:3000/api/price/parlay" \
  -H "Content-Type: application/json" \
  -d '{
    "legs": [
      {
        "id": "1",
        "eventId": "abc123",
        "market": "moneyline",
        "selection": "home",
        "odds": -150
      },
      {
        "id": "2",
        "eventId": "def456",
        "market": "spread",
        "selection": "away",
        "odds": -110,
        "line": 3.5
      },
      {
        "id": "3",
        "eventId": "ghi789",
        "market": "total",
        "selection": "over",
        "odds": -105,
        "line": 225.5
      }
    ],
    "bankroll": 1000
  }'
```

### Example 3: Frontend Integration (React)

```typescript
import { useRealTimeOdds } from './hooks/useRealTimeOdds';

function MyComponent() {
  const { odds, loading, error, lastUpdated, isStale } = useRealTimeOdds({
    sport: 'basketball_nba',
    refreshInterval: 20000, // 20 seconds
    autoRefresh: true,
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>Last updated: {lastUpdated?.toLocaleTimeString()}</p>
      {isStale && <p>⚠️ Data is stale (>60s old)</p>}
      
      {odds.map(odd => (
        <div key={`${odd.eventId}-${odd.bookmaker}`}>
          <h3>{odd.homeTeam} vs {odd.awayTeam}</h3>
          <p>Bookmaker: {odd.bookmaker}</p>
          <p>Moneyline: {odd.moneyline?.home} / {odd.moneyline?.away}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Required
ODDS_API_KEY=your_odds_api_key
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Optional
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
CORS_ORIGIN=https://novatitan.net
CACHE_DEFAULT_TTL=60
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📞 Support

- **Issues**: https://github.com/tzsmit/nova-titan-widget/issues
- **Documentation**: `/backend/API_DOCUMENTATION.md`
- **Status**: https://status.novatitan.net (coming soon)

---

**Last Updated**: November 7, 2025  
**Version**: 1.0.0
