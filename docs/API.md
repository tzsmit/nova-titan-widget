# Nova Titan Sports Widget - API Documentation 📚

Complete API reference for the Nova Titan Sports Prediction & Betting Widget.

## 🌐 Base URLs

- **Production:** `https://api.nova-titan.com`
- **Staging:** `https://staging-api.nova-titan.com`  
- **Local Development:** `http://localhost:3001`

All API endpoints are prefixed with `/api` (e.g., `https://api.nova-titan.com/api/health`)

## 🔐 Authentication

Most endpoints are public, but some require API key authentication:

```bash
# Include API key in header
Authorization: Bearer your_api_key_here

# Or as query parameter  
?api_key=your_api_key_here
```

## 📊 Response Format

All API responses follow this consistent format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_abc123"
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { /* additional error context */ }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🎯 Core Endpoints

### Health Check

Check API service status and dependencies.

```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "uptime": 86400,
    "services": {
      "database": "up",
      "redis": "up", 
      "mlService": "up",
      "externalApis": {
        "odds_api": "up"
      }
    },
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🏀 Games Endpoints

### List Games

Retrieve games with filtering and pagination.

```http
GET /api/games
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date` | string | today | Date in YYYY-MM-DD format |
| `sport` | string | - | Filter by sport (basketball, football) |
| `league` | string | - | Filter by league (NBA, NFL) |
| `status` | string | - | Filter by status (scheduled, live, final) |
| `limit` | number | 10 | Number of games to return (1-50) |
| `page` | number | 1 | Page number for pagination |

**Example Request:**
```bash
curl "https://api.nova-titan.com/api/games?league=NBA&limit=5&status=scheduled"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "game_123",
        "sport": "basketball",
        "league": "NBA",
        "homeTeam": {
          "id": "team_bos",
          "name": "Boston Celtics",
          "abbreviation": "BOS",
          "logo": "/logos/bos.png",
          "record": { "wins": 45, "losses": 20 }
        },
        "awayTeam": {
          "id": "team_lal", 
          "name": "Los Angeles Lakers",
          "abbreviation": "LAL",
          "logo": "/logos/lal.png",
          "record": { "wins": 38, "losses": 27 }
        },
        "startTime": "2024-01-15T20:00:00Z",
        "status": {
          "type": "scheduled"
        },
        "venue": {
          "name": "TD Garden",
          "city": "Boston",
          "state": "MA"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 12,
      "pages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get Game Details

Retrieve detailed information for a specific game.

```http
GET /api/games/{gameId}
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `includePredictions` | boolean | true | Include ML predictions |
| `includeOdds` | boolean | true | Include betting odds |
| `includePlayerStats` | boolean | true | Include player statistics |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "game_123",
    "sport": "basketball",
    "league": "NBA",
    "homeTeam": { /* team object */ },
    "awayTeam": { /* team object */ },
    "startTime": "2024-01-15T20:00:00Z",
    "predictions": [
      {
        "type": "win_probability",
        "prediction": 65.5,
        "confidence": 78.2,
        "modelVersion": "1.0.0"
      }
    ],
    "odds": [
      {
        "market": "moneyline",
        "outcomes": [
          {
            "team": "home",
            "odds": { "format": "american", "value": -150 },
            "impliedProbability": 60.0,
            "bookmaker": "DraftKings"
          }
        ]
      }
    ],
    "playerStats": {
      "homeTeam": [
        {
          "player": {
            "name": "Jayson Tatum",
            "position": "F",
            "jersey": 0
          },
          "recentStats": [
            {
              "date": "2024-01-12",
              "points": 28,
              "rebounds": 8,
              "assists": 5
            }
          ]
        }
      ]
    }
  }
}
```

---

## 🔮 Predictions Endpoints

### Generate Predictions

Generate AI-powered predictions for a game.

```http
POST /api/predictions
```

**Request Body:**
```json
{
  "gameId": "game_123",
  "types": ["win_probability", "spread", "total_points"],
  "includeExplanation": true,
  "features": {
    "homeTeamElo": 1600,
    "awayTeamElo": 1550,
    "homeTeamForm": 0.8,
    "awayTeamForm": 0.6,
    "isPlayoff": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gameId": "game_123",
    "predictions": {
      "win_probability": {
        "probability": 65.5,
        "confidence": 78.2,
        "impliedOdds": {
          "home": { "format": "american", "value": -189 },
          "away": { "format": "american", "value": +158 }
        }
      },
      "spread": {
        "spread": -4.5,
        "confidence": 72.1
      },
      "total_points": {
        "total": 218.5,
        "confidence": 69.3
      }
    },
    "explanation": {
      "mainFactors": [
        "Home team advantage (+3.2 points)",
        "Better recent form (4-1 vs 2-3 in last 5)",
        "Favorable matchup history"
      ],
      "supportingFactors": [
        "Higher offensive rating",
        "Rest advantage (2 days vs 1 day)"
      ],
      "riskFactors": [
        "Key player injury concerns",
        "Weather conditions (if outdoor sport)"
      ],
      "confidence": {
        "level": "high",
        "reasoning": "Strong model agreement and large historical dataset"
      }
    },
    "modelInfo": {
      "version": "1.0.0",
      "lastTrained": "2024-01-10T00:00:00Z",
      "ensembleWeights": {
        "lightgbm": 0.5,
        "logistic": 0.3,
        "randomForest": 0.2
      }
    }
  }
}
```

### Get Cached Predictions

Retrieve previously generated predictions for a game.

```http
GET /api/predictions/{gameId}
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `types` | array | all | Specific prediction types to return |

---

## 🎲 Parlay Endpoints

### Optimize Parlay

Generate optimized parlay combinations for maximum probability or payout.

```http
POST /api/parlay/optimize
```

**Request Body:**
```json
{
  "gameIds": ["game_123", "game_456", "game_789"],
  "optimizationMode": "max_probability",
  "riskTolerance": "moderate",
  "maxLegs": 5,
  "bankrollSettings": {
    "totalBankroll": 1000,
    "maxBetPercentage": 5,
    "riskTolerance": "moderate"
  },
  "excludedBetTypes": ["player_prop"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "parlays": [
      {
        "id": "parlay_abc123",
        "bets": [
          {
            "gameId": "game_123",
            "market": "moneyline",
            "selection": "home",
            "odds": { "format": "american", "value": -150 }
          },
          {
            "gameId": "game_456", 
            "market": "spread",
            "selection": "away",
            "point": +3.5,
            "odds": { "format": "american", "value": -110 }
          }
        ],
        "totalOdds": { "format": "american", "value": +245 },
        "combinedProbability": 48.2,
        "expectedValue": 0.085,
        "recommendedStake": 25.50,
        "potentialPayout": 87.88
      }
    ],
    "alternatives": [ /* alternative parlays */ ],
    "reasoning": "Optimized for maximum win probability while maintaining positive expected value",
    "expectedOutcomes": {
      "winProbability": 48.2,
      "expectedValue": 0.085,
      "breakEvenProbability": 28.9
    }
  }
}
```

### Calculate Parlay

Calculate odds and payout for a custom parlay combination.

```http
POST /api/parlay/calculate
```

**Request Body:**
```json
{
  "bets": [
    {
      "outcomeId": "outcome_123",
      "odds": { "format": "american", "value": -150 },
      "stake": 10.00
    },
    {
      "outcomeId": "outcome_456",
      "odds": { "format": "american", "value": +120 },
      "stake": 10.00
    }
  ]
}
```

---

## 💰 Odds Endpoints

### Get Odds

Retrieve betting odds for games or specific markets.

```http
GET /api/odds
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `gameId` | string | Specific game ID |
| `sport` | string | Filter by sport |
| `markets` | array | Specific market types |
| `bookmakers` | array | Specific bookmakers |
| `format` | string | Odds format (american, decimal, fractional) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "market_123",
      "gameId": "game_123",
      "type": "moneyline",
      "name": "Match Winner",
      "outcomes": [
        {
          "id": "outcome_home",
          "name": "Boston Celtics",
          "odds": { "format": "american", "value": -150 },
          "impliedProbability": 60.0,
          "bookmaker": "DraftKings"
        },
        {
          "id": "outcome_away", 
          "name": "Los Angeles Lakers",
          "odds": { "format": "american", "value": +130 },
          "impliedProbability": 43.5,
          "bookmaker": "DraftKings"
        }
      ],
      "lastUpdated": "2024-01-15T10:25:00Z",
      "status": "active"
    }
  ]
}
```

---

## 👥 Players Endpoints

### Get Player Stats

Retrieve recent statistics for a specific player.

```http
GET /api/players/{playerId}/stats
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `gameCount` | number | 5 | Number of recent games |
| `season` | number | current | Specific season |
| `includeProjections` | boolean | false | Include projections |

**Response:**
```json
{
  "success": true,
  "data": {
    "player": {
      "id": "player_tatum",
      "name": "Jayson Tatum",
      "position": "F",
      "jersey": 0,
      "team": { /* team object */ },
      "photo": "/players/jayson-tatum.jpg"
    },
    "recentStats": [
      {
        "gameId": "game_456",
        "date": "2024-01-12",
        "opponent": "LAL",
        "minutes": 36.5,
        "points": 28,
        "rebounds": 8,
        "assists": 5,
        "steals": 2,
        "blocks": 1,
        "fieldGoalPercentage": 52.4
      }
    ],
    "seasonAverages": {
      "games": 50,
      "points": 26.8,
      "rebounds": 8.1,
      "assists": 4.9,
      "fieldGoalPercentage": 47.2
    },
    "projections": {
      "nextGame": {
        "points": 27.5,
        "rebounds": 8.0,
        "assists": 5.2,
        "confidence": 75.3
      }
    },
    "trends": [
      {
        "stat": "points",
        "direction": "up",
        "confidence": 82.1
      }
    ]
  }
}
```

---

## 🤖 ML Service Endpoints

These endpoints interact directly with the ML service for model information and management.

### Model Performance

Get current model performance metrics.

```http
GET /api/predictions/model/performance
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accuracy": 67.2,
    "logLoss": 0.618,
    "aucRoc": 0.721,
    "calibrationScore": 0.684,
    "featureImportance": [
      {
        "feature": "elo_difference",
        "importance": 0.234,
        "rank": 1
      },
      {
        "feature": "home_advantage",
        "importance": 0.187,
        "rank": 2
      }
    ],
    "lastTrained": "2024-01-10T00:00:00Z",
    "trainingSamples": 15000,
    "modelVersion": "1.0.0"
  }
}
```

### Trigger Model Retraining

Start retraining of ML models (admin only).

```http
POST /api/predictions/model/retrain
```

**Headers:**
```
Authorization: Bearer admin_api_key
```

---

## 📈 Rate Limits

API rate limits vary by endpoint and authentication:

| Endpoint Type | Unauthenticated | Authenticated | Premium |
|---------------|----------------|---------------|---------|
| Games | 100/hour | 500/hour | 2000/hour |
| Predictions | 50/hour | 200/hour | 1000/hour |
| Odds | 200/hour | 1000/hour | 5000/hour |
| Players | 100/hour | 300/hour | 1500/hour |

Rate limit headers included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

---

## 🚨 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Malformed request |
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily down |

## 🔧 SDK & Libraries

### JavaScript/TypeScript

```bash
npm install @nova-titan/sdk
```

```javascript
import { NovaTitanAPI } from '@nova-titan/sdk';

const api = new NovaTitanAPI({
  apiKey: 'your_api_key',
  baseURL: 'https://api.nova-titan.com'
});

// Get games
const games = await api.games.list({ league: 'NBA' });

// Generate predictions  
const predictions = await api.predictions.generate({
  gameId: 'game_123',
  types: ['win_probability']
});
```

### Python

```bash
pip install nova-titan-sdk
```

```python
from nova_titan import NovaTitanAPI

api = NovaTitanAPI(api_key='your_api_key')

# Get games
games = api.games.list(league='NBA')

# Generate predictions
predictions = api.predictions.generate(
    game_id='game_123',
    types=['win_probability']
)
```

### cURL Examples

```bash
# Get games
curl "https://api.nova-titan.com/api/games?league=NBA" \
  -H "Authorization: Bearer your_api_key"

# Generate prediction
curl -X POST "https://api.nova-titan.com/api/predictions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_api_key" \
  -d '{"gameId":"game_123","types":["win_probability"]}'
```

---

## 📝 Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- Core games, predictions, odds, and parlay endpoints
- ML service integration
- Rate limiting and authentication

### Upcoming Features
- WebSocket real-time updates
- Enhanced player prop predictions  
- Betting slip management
- Historical data endpoints
- Advanced analytics endpoints

---

## 🆘 Support

- 📖 **Documentation:** [docs.nova-titan.com](https://docs.nova-titan.com)
- 🐛 **Issues:** [GitHub Issues](https://github.com/nova-titan/widget/issues)
- 📧 **Email:** api-support@nova-titan.com
- 💬 **Discord:** [Nova Titan Community](https://discord.gg/nova-titan)

For integration support or custom requirements, contact our team at enterprise@nova-titan.com.