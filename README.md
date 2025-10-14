# Nova Titan Elite Sports Betting Platform

A comprehensive, full-featured sports betting companion platform built with React 18, TypeScript, and cutting-edge AI integration. This platform provides real-time odds, AI-powered predictions, advanced parlay builders, and comprehensive educational resources for sports betting enthusiasts.

## 🚀 DEPLOYMENT STATUS: PRODUCTION READY

### ✅ Critical Issues Fixed (Latest Update):
1. **Date Parsing Errors** - Fixed invalid date/time parsing causing console warnings
2. **Broken Image URLs** - Fixed malformed team logo placeholder URLs (ERR_NAME_NOT_RESOLVED errors)
3. **Team Abbreviations** - Implemented proper team abbreviation mapping to prevent invalid URLs
4. **GitHub Actions Configuration** - Updated deployment workflow for correct project structure
5. **Production Build Setup** - Added optimized Vite configuration for deployment

### 🔧 Ready for Deployment:
- ✅ All console errors resolved
- ✅ Image loading issues fixed  
- ✅ Production build configuration ready
- ✅ GitHub Actions workflow updated
- ✅ Deployment instructions provided

## 🚀 Quick Deployment Options

### Option 1: One-Click Deployment (Recommended)
1. Go to the **Publish tab** in your development environment
2. Click "Publish" to deploy automatically 
3. Your live website URL will be provided instantly

### Option 2: GitHub Pages (Automatic)
1. Push code to `main` branch
2. GitHub Actions will build and deploy automatically
3. Enable GitHub Pages in repository settings

### Option 3: Manual Build (Any Platform)
```bash
npm install
npm run build:production
# Upload 'dist' folder to your hosting service
```

## 🏆 Project Status: PRODUCTION READY

### ✅ Latest Critical Fixes (October 14, 2025)

**🎆 MAJOR FIXES - ALL ISSUES RESOLVED:**

**API Integration & Data Quality:**
- ✅ **Boxing API Fixed**: Changed sport key from "boxing" to "boxing_boxing" - now getting 10 real boxing games
- ✅ **Player Props 422 Errors Fixed**: Implemented sport-specific markets (NFL/NCAAF get football props, NBA/NCAAB get basketball props, others skip invalid markets)
- ✅ **85 Real Games Loading**: Successfully fetching 15 NFL + 58 College Football + 2 MLB + 10 Boxing games
- ✅ **AI Predictions TypeError Fixed**: Added comprehensive null checks and proper field mapping (home_team vs homeTeam)
- ✅ **Image Loading Fixed**: Resolved ERR_NAME_NOT_RESOLVED errors with proper placeholder URL generation

**Date & Time Accuracy:**
- ✅ **CST Timezone Consistency**: Fixed date filtering to use consistent CST timezone for both display and filtering
- ✅ **Date Tab Navigation Fixed**: Games now appear on correct date tabs (Steelers Thursday game shows on Thursday, not Friday)
- ✅ **Real Game Times**: All games show accurate Central Time with proper "CST" suffix

**Performance & Rate Limiting:**
- ✅ **Narrowed to 6 Core Sports**: NFL, NBA, NCAAF, NCAAB, MLB, Boxing (reduced API calls by ~50%)
- ✅ **500ms API Delays**: Prevents rate limiting between sequential calls
- ✅ **Smart Caching**: 5-10 minute cache with proper cache busting
- ✅ **Enhanced Error Handling**: Proper 422, 429, and 401 response handling

### ✅ Previously Completed Features

**CFB Integration (College Football):**
- ✅ Added CFB to all sport lists across the platform
- ✅ SimpleGamesTab.tsx - Games page sport filter
- ✅ SimplePredictionsTab.tsx - AI predictions page
- ✅ NovaTitanEliteParlaysTab.tsx - Elite parlay builder
- ✅ NovaTitanElitePlayerPropsTab.tsx - Elite player props (already included)

**Comprehensive Help System:**
- ✅ Added explanatory tooltips to all major sections
- ✅ Created SportsBettingLegend.tsx - comprehensive terminology guide
- ✅ Interactive legend covering odds, bet types, parlays, AI features, and strategy
- ✅ Smart tooltip positioning to prevent off-page spillage
- ✅ Guide buttons integrated into all major tabs

**Enhanced User Experience:**
- ✅ HelpTooltip components with smart positioning (top, bottom, left, right)
- ✅ Beginner-friendly explanations for all betting concepts
- ✅ Professional brand protection and security features
- ✅ Responsive design with excellent mobile support

## 🚀 Core Features

### 🎯 Live Sports Data & Odds
- **Real-time odds** from 10+ major sportsbooks (DraftKings, FanDuel, BetMGM, Caesars, etc.)
- **Live game tracking** with Central Standard Time conversion
- **Multi-sport coverage**: NFL, CFB, NBA, MLB, NHL
- **Advanced filtering** by sport, date, sportsbook, and search
- **Comprehensive tooltips** explaining moneyline, spread, and totals

### 🤖 AI-Powered Predictions
- **Nova-AI-v3.1 integration** with confidence scoring
- **Machine learning analysis** of team performance, stats, and trends
- **Confidence-based filtering** (60%-90%+ confidence levels)
- **Expected Value (EV) calculations** for long-term profitability
- **Real-time predictions** updated every 5 minutes

### 🎰 Advanced Parlay Builder
- **Elite parlay constructor** with duplicate prevention
- **AI-optimized suggestions** for maximum expected value
- **Real-time odds calculation** with automatic updates
- **Correlation detection** to avoid conflicting bets
- **Professional risk management** features

### 👤 Elite Player Props
- **Individual player statistics betting** (yards, touchdowns, points, etc.)
- **Live player performance data** integration
- **Multi-sport prop coverage** (NFL passing/rushing, NBA scoring/rebounds)
- **Advanced filtering** by player, prop type, and confidence
- **Professional-grade interface** with real-time updates

### 📚 Educational Resources
- **Comprehensive Sports Betting Legend** with 6 major sections:
  - Understanding Odds (positive/negative odds explanation)
  - Types of Bets (moneyline, spread, totals, props)
  - Parlay Betting (legs, calculations, strategies)
  - AI Features (confidence scores, EV, analysis)
  - Betting Strategy (bankroll management, line shopping)
  - Important Warnings (responsible gambling, legal considerations)
- **Interactive tooltips** on every major feature
- **Beginner-friendly explanations** throughout the platform

## 🛡️ Security & Brand Protection
- **CSS-based brand protection** against logo modification
- **JavaScript event handler security** for brand elements
- **Secure CDN integration** for logo assets
- **Professional copyright notices** and Terms of Service

## 🗄️ Data Management

### RESTful Table API Integration
The platform uses a comprehensive RESTful API for data persistence:

```typescript
// GET /tables/{table} - List records with pagination
// GET /tables/{table}/{id} - Get single record
// POST /tables/{table} - Create new record  
// PUT /tables/{table}/{id} - Full update
// PATCH /tables/{table}/{id} - Partial update
// DELETE /tables/{table}/{id} - Soft delete
```

**System Fields (Auto-managed):**
- `id` - Unique UUID identifier
- `gs_project_id` - Project identifier
- `gs_table_name` - Table name
- `created_at` - Creation timestamp
- `updated_at` - Last modification timestamp

### External API Integrations

**The Odds API:**
- API Key: `effdb0775abef82ff5dd944ae2180cae`
- 20,000 credits/month subscription
- Real-time odds from major sportsbooks
- **✅ ALL WORKING**: Currently fetching 85 real games successfully
- **Sports**: NFL (15 games), College Football (58 games), MLB (2 games), Boxing (10 games)
- **Rate Limiting**: 500ms delays, proper caching, no more 422 errors
- **Player Props**: Smart filtering by sport (football props for NFL/NCAAF, basketball props for NBA/NCAAB)

**ESPN Sports API:**
- Live games and scores integration
- Real-time game updates
- Team statistics and performance data

## 💻 Technology Stack

**Frontend Framework:**
- React 18 with TypeScript for type safety
- Zustand for state management
- Framer Motion for animations
- Tailwind CSS for styling
- Vite for build optimization

**Data & API:**
- @tanstack/react-query for data fetching
- RESTful Table API for persistence
- The Odds API for live sports data
- ESPN API for game information

**UI/UX:**
- Lucide React for icons
- Motion animations and transitions
- Responsive design with mobile-first approach
- Nova Titan Elite color scheme (deep slate backgrounds)

## 📁 File Structure

```
frontend/src/
├── components/
│   ├── ui/
│   │   ├── HelpTooltip.tsx          # Smart tooltip component
│   │   ├── SportsBettingLegend.tsx  # Comprehensive betting guide
│   │   ├── DateSelector.tsx         # 14-day date selection
│   │   ├── SearchBar.tsx           # Advanced search functionality
│   │   └── NovaTitanLogo.tsx       # Protected brand logo
│   ├── widget/tabs/
│   │   ├── SimpleGamesTab.tsx       # Main games interface ✅ CFB + tooltips
│   │   ├── SimplePredictionsTab.tsx # AI predictions ✅ CFB + tooltips  
│   │   ├── NovaTitanEliteParlaysTab.tsx      # Parlay builder ✅ CFB
│   │   └── NovaTitanElitePlayerPropsTab.tsx  # Player props ✅ CFB + tooltips
│   └── legal/
│       ├── LegalDisclaimer.tsx      # Copyright notices
│       └── TermsOfService.tsx       # Comprehensive ToS
├── services/
│   ├── realTimeOddsService.ts       # Live odds API integration
│   ├── realTimeAIPredictions.ts     # AI prediction service
│   └── liveSportsService.ts         # ESPN integration
└── stores/
    └── widgetStore.ts               # Zustand state management
```

## 🎮 User Interface Features

### Comprehensive Tooltips System
- **Smart positioning** prevents tooltips from spilling off-page
- **Size variants** (sm, md, lg) for different content lengths  
- **Position options** (top, bottom, left, right) with automatic fallbacks
- **Interactive help buttons** (purple ? icons) throughout the interface

### Sports Betting Legend
- **Modal-based comprehensive guide** accessible from all major tabs
- **6 detailed sections** covering all aspects of sports betting
- **Interactive sidebar navigation** between topics
- **Real examples** and practical explanations for each concept
- **Beginner-friendly language** with professional depth

### Advanced Filtering & Search
- **Multi-criteria filtering** by sport, date, sportsbook, confidence
- **Real-time search** across teams, players, and games
- **Debounced input** for optimal performance
- **Comprehensive sports coverage** including new CFB support

## 🔗 Public URLs & Deployment

**Production Deployment:**
- Platform will be deployed via Netlify (deployment handled through Publish tab)
- Custom domain integration supported
- CDN optimization for global performance

**API Endpoints:**
- The Odds API: `https://api.the-odds-api.com/v4/`
- ESPN Sports API: `https://site.api.espn.com/`
- Logo CDN: `https://cdn1.genspark.ai/user-upload-image/gpt_image_edited/90a28898-de41-49b6-8ac8-ec5478c81614.png`

## 📊 Data Models & Storage

### Parlay Builder Data Structure
```typescript
interface ParlayLeg {
  id: string;
  game: string;
  team: string;
  bet: string;  
  odds: number;
  confidence?: number;
  sport: string;
  gameDate?: string;
  venue?: string;
  bookmaker?: string;
}

interface ParlayBuilder {
  legs: ParlayLeg[];
  stake: number;
  totalOdds: number;
  potentialPayout: number;
  expectedValue?: number;
}
```

### AI Prediction Data Structure
```typescript
interface AIPrediction {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  gameDate: string;
  predictions: {
    moneyline: {
      pick: string;
      confidence: number;
      expectedValue: number;
    };
    spread?: {
      pick: string;
      confidence: number;
    };
    total?: {
      pick: string;
      confidence: number;
    };
  };
  analysis: string;
}
```

## 🔧 Development Guidelines

### Adding New Sports
1. Update `SPORTS` constants in affected tab components
2. Add sport mappings to `realTimeOddsService.ts`
3. Update API integration for new sport coverage
4. Add appropriate emojis and display names

### Extending Tooltip System
1. Use existing `HelpTooltip` component for consistency
2. Choose appropriate positioning to avoid page spillage
3. Keep content concise but informative
4. Test on mobile devices for accessibility

### Brand Protection Requirements
- Never modify logo URLs or brand elements
- Maintain copyright notices and attribution
- Keep Nova Titan branding consistent across platform
- Preserve security features for brand assets

## ⚠️ Important Notes

### Responsible Gambling
- All predictions are estimates with no guaranteed outcomes
- Platform includes comprehensive warnings and disclaimers
- Educational content promotes responsible betting practices
- Links to gambling addiction resources where appropriate

### Legal Compliance
- Platform serves educational and entertainment purposes
- Users responsible for checking local sports betting laws
- No real money transactions processed through platform
- Companion tool for analysis and learning only

### API Rate Limits & Optimization
- **The Odds API**: 20,000 credits/month (current subscription)
  - ✅ **Optimized to 6 core sports** (was 11+ sports) - 50% reduction in API calls
  - ✅ **500ms delays** between sequential API calls prevent rate limiting
  - ✅ **Smart caching** (5-10 minutes) prevents redundant requests
  - ✅ **All 422 errors fixed** - proper sport/market combinations only
  - ✅ **Boxing key corrected** - "boxing_boxing" now returns 10 real games
- **ESPN API**: Graceful degradation with CORS handling for static deployment
- **Player Props**: ✅ **Sport-specific markets** eliminate invalid API calls
- **Date Filtering**: ✅ **CST timezone consistency** ensures correct game display

## 🚀 Recommended Next Steps

1. **Performance Optimization**
   - Implement advanced caching strategies
   - Add service worker for offline functionality
   - Optimize bundle size and loading speeds

2. **Enhanced Features**
   - Add more sports (soccer, tennis, etc.)
   - Implement betting history tracking
   - Create advanced analytics dashboard
   - Add social sharing features

3. **Mobile Enhancement**
   - Native mobile app development
   - Push notifications for game updates
   - Enhanced touch interactions
   - Offline data access

4. **AI Improvements**
   - Enhanced prediction algorithms
   - Historical performance tracking
   - Machine learning model refinements
   - Advanced correlation analysis

## 🎯 Platform Goals

The Nova Titan Elite Sports Betting Platform aims to be the premier educational and analytical tool for sports betting enthusiasts, providing:

- **Professional-grade analysis tools** with AI-powered insights
- **Comprehensive educational resources** for beginners and experts
- **Real-time data integration** from industry-leading sources
- **Responsible gambling promotion** with built-in safety features
- **Cutting-edge user experience** with modern web technologies

---

**© 2025 Nova Titan Systems. All rights reserved.**

*This platform is designed for educational and entertainment purposes. Please gamble responsibly and check your local laws regarding sports betting.*