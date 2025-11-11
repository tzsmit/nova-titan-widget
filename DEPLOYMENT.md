# Deployment Guide - Nova Titan Widget

## Overview

This guide covers deploying the Nova Titan Widget to production using Vercel for the frontend and GitHub Actions for CI/CD automation.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Vercel Deployment](#vercel-deployment)
4. [GitHub Actions CI/CD](#github-actions-cicd)
5. [Environment Variables](#environment-variables)
6. [Monitoring Setup](#monitoring-setup)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Required Accounts
- ✅ GitHub account with repository access
- ✅ Vercel account ([vercel.com](https://vercel.com))
- ✅ Upstash account for Redis ([upstash.com](https://upstash.com))
- ✅ The Odds API key ([the-odds-api.com](https://the-odds-api.com))
- ✅ Sentry account for monitoring ([sentry.io](https://sentry.io))

### Required Tools
```bash
# Node.js 18+
node --version  # Should be 18.x or higher

# npm
npm --version

# Vercel CLI (optional, for manual deploys)
npm install -g vercel

# GitHub CLI (optional)
npm install -g gh
```

---

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/tzsmit/nova-titan-widget.git
cd nova-titan-widget
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm run install:all

# Or install individually
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 3. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
```bash
# Required for development
ODDS_API_KEY=your_api_key
UPSTASH_REDIS_URL=redis://...
UPSTASH_REDIS_TOKEN=your_token
HMAC_SECRET=generate_with_crypto_randomBytes
CSRF_SECRET=generate_with_crypto_randomBytes
```

Generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Vercel Deployment

### Option 1: Vercel Dashboard (Recommended)

1. **Import Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select "Import Git Repository"
   - Choose `tzsmit/nova-titan-widget`

2. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`
   - Set for Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your site is live! 🎉

### Option 2: Vercel CLI

```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Set environment variables
vercel env add VITE_API_BASE_URL production
vercel env add VITE_ODDS_API_KEY production
vercel env add VITE_SENTRY_DSN production

# Deploy to production
vercel --prod
```

### Vercel Configuration

The project includes `vercel.json` with:
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ Asset caching (1 year for immutable assets)
- ✅ API proxy (`/api/*` → backend)
- ✅ GitHub integration
- ✅ Automatic aliasing

---

## GitHub Actions CI/CD

### Setup GitHub Secrets

1. Go to your repository → Settings → Secrets and variables → Actions

2. Add the following secrets:

**Vercel Secrets:**
```
VERCEL_TOKEN           # From vercel.com/account/tokens
VERCEL_ORG_ID          # From vercel.json or team settings
VERCEL_PROJECT_ID      # From project settings
```

**API Keys:**
```
ODDS_API_KEY           # The Odds API key
ESPN_API_KEY           # ESPN API key (optional)
```

**Security Secrets:**
```
HMAC_SECRET            # 32+ character random string
CSRF_SECRET            # 32+ character random string
```

**Monitoring:**
```
VITE_SENTRY_DSN        # Sentry DSN for frontend
SENTRY_DSN             # Sentry DSN for backend (optional)
```

**Frontend Config:**
```
VITE_API_BASE_URL      # Production API URL
VITE_ODDS_API_KEY      # If needed in frontend
```

### CI/CD Workflow

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs automatically on:
- ✅ Push to `main` → Deploy to production
- ✅ Push to `develop` → Deploy to staging
- ✅ Pull requests → Run tests only

**Workflow Steps:**
1. Install dependencies (cached)
2. Lint code (frontend + backend)
3. Run tests (frontend + backend)
4. Security audit (npm audit)
5. Build (frontend + backend)
6. Deploy to Vercel (if on main/develop)
7. Upload coverage to Codecov

### Manual Workflow Trigger

```bash
# Trigger workflow manually
gh workflow run ci.yml --ref main
```

---

## Environment Variables

### Production Environment Variables

**Critical (Required):**
```bash
# API Keys
ODDS_API_KEY=your_production_key
UPSTASH_REDIS_URL=redis://production-url
UPSTASH_REDIS_TOKEN=production_token

# Security (MUST be different from development)
HMAC_SECRET=64_character_hex_string
CSRF_SECRET=64_character_hex_string

# Frontend
VITE_API_BASE_URL=https://api.novatitan.com
VITE_SENTRY_DSN=https://...@sentry.io/...
```

**Optional (Recommended):**
```bash
# Monitoring
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Caching
CACHE_TTL_ODDS=60
CACHE_TTL_GAMES=300
```

### Environment Variable Precedence

1. **Vercel Environment Variables** (highest priority)
2. `.env.production` (not recommended, use Vercel dashboard)
3. `.env.local` (local development only)
4. `.env` (defaults, committed to git)

---

## Monitoring Setup

### 1. Sentry Setup

**Backend Monitoring:**
```typescript
// backend/src/index.ts
import { MonitoringService } from './services/Monitoring';

MonitoringService.init({
  sentryDsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
});
```

**Frontend Monitoring:**
```typescript
// frontend/src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 0.1,
});
```

### 2. Vercel Analytics

Enable in Vercel dashboard:
1. Go to Project → Analytics
2. Enable Web Analytics
3. Add `<Analytics />` component to frontend

### 3. Uptime Monitoring

Set up external monitoring:
- [UptimeRobot](https://uptimerobot.com) - Free, 5-minute checks
- [Pingdom](https://www.pingdom.com) - Professional
- Vercel Monitoring (built-in)

**Health Check Endpoint:**
```
https://nova-titan-widget.vercel.app/api/health
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Bundle size acceptable (<500KB)
- [ ] All environment variables configured
- [ ] Secrets rotated from development
- [ ] Database migrations applied (if applicable)
- [ ] Feature flags configured
- [ ] Monitoring dashboards set up

### Deployment

- [ ] Create deployment branch/tag
- [ ] Update CHANGELOG.md
- [ ] Merge to main branch
- [ ] CI/CD pipeline passes
- [ ] Vercel deployment succeeds
- [ ] Health check passes
- [ ] Smoke tests pass

### Post-Deployment

- [ ] Verify production site loads
- [ ] Test critical user flows
- [ ] Check error rates in Sentry
- [ ] Monitor performance metrics
- [ ] Verify API integrations working
- [ ] Test from different locations/devices
- [ ] Check compliance features (geolocation, age verification)
- [ ] Monitor for 24 hours

---

## Troubleshooting

### Build Failures

**Issue: "Module not found"**
```bash
# Clear cache and reinstall
rm -rf node_modules frontend/node_modules backend/node_modules
npm run install:all
```

**Issue: "Out of memory"**
```bash
# Increase Node memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

**Issue: TypeScript errors**
```bash
# Check TypeScript version consistency
npm ls typescript
cd frontend && npm ls typescript
cd ../backend && npm ls typescript
```

### Deployment Failures

**Issue: Vercel deployment fails**
1. Check build logs in Vercel dashboard
2. Verify environment variables are set
3. Check `vercel.json` configuration
4. Try manual deployment: `vercel --prod`

**Issue: CI/CD workflow fails**
1. Check GitHub Actions logs
2. Verify secrets are set correctly
3. Test locally: `npm test`
4. Re-run workflow

### Runtime Errors

**Issue: API not responding**
1. Check Upstash Redis connection
2. Verify API keys are valid
3. Check rate limiting (may be exceeded)
4. Review Sentry error logs

**Issue: Geolocation not working**
1. Ensure HTTPS (required for geolocation API)
2. Check browser permissions
3. Verify geolocation service is accessible
4. Test with VPN disabled

**Issue: Age verification not persisting**
1. Check localStorage is enabled
2. Verify Zustand store persistence
3. Check browser cookie settings
4. Test in incognito mode

---

## Rollback Procedures

### Quick Rollback (Vercel)

1. **Via Dashboard:**
   - Go to Deployments
   - Find last working deployment
   - Click "..." → "Promote to Production"

2. **Via CLI:**
```bash
# List deployments
vercel ls

# Promote specific deployment
vercel promote <deployment-url>
```

### Git Rollback

```bash
# Revert last commit
git revert HEAD
git push origin main

# Or rollback to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

### Database Rollback (if applicable)

```bash
# Run down migration
npx prisma migrate down

# Or reset to specific migration
npx prisma migrate reset --to <migration-name>
```

---

## Performance Optimization

### Frontend Optimization

1. **Bundle Analysis:**
```bash
cd frontend
npm run build
npx vite-bundle-visualizer
```

2. **Image Optimization:**
- Use WebP format
- Lazy load images
- Serve responsive images
- Use CDN for static assets

3. **Code Splitting:**
```typescript
// Use React.lazy for route-based splitting
const ParlayDrawer = lazy(() => import('./components/parlay/ParlayDrawer'));
```

### Backend Optimization

1. **Redis Caching:**
- Cache frequently accessed data
- Use appropriate TTLs
- Implement cache warming

2. **API Rate Limiting:**
- Respect third-party rate limits
- Implement request queuing
- Use bulk endpoints where available

3. **Database Queries:**
- Add indexes for common queries
- Use connection pooling
- Implement query caching

---

## Security Best Practices

### Production Security Checklist

- [ ] All secrets are 32+ characters
- [ ] Secrets rotated from development
- [ ] HTTPS enforced (Vercel handles this)
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Rate limiting enabled
- [ ] HMAC request signing active
- [ ] CSRF protection enabled
- [ ] Input sanitization active
- [ ] Sentry monitoring configured
- [ ] Regular dependency updates (Dependabot)
- [ ] Security audit: `npm audit`
- [ ] No secrets in Git history

### Secret Rotation

Rotate production secrets every 90 days:

```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update in Vercel
vercel env rm HMAC_SECRET production
vercel env add HMAC_SECRET production

# Redeploy
vercel --prod
```

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error rates in Sentry
- Check uptime metrics
- Review performance dashboards

**Weekly:**
- Review Dependabot PRs
- Check bundle size changes
- Review API usage/costs

**Monthly:**
- Security audit: `npm audit`
- Performance review
- Cost analysis
- Rotate non-critical secrets

**Quarterly:**
- Full security review
- Dependency major version updates
- Infrastructure optimization
- Disaster recovery drill

---

## Support & Resources

### Documentation
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Actions Docs](https://docs.github.com/actions)
- [Vite Docs](https://vitejs.dev)
- [Sentry Docs](https://docs.sentry.io)

### Internal Documentation
- `README.md` - Project overview
- `PHASE_*.md` - Development phase documentation
- `CHANGELOG.md` - Version history

### Getting Help
- **Issues:** Create GitHub issue
- **Email:** support@novatitan.com
- **Slack:** #nova-titan-dev (if available)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-11-11 | Initial production release |

---

**Deployment Status:** ✅ Production Ready

Last Updated: 2024-11-11
