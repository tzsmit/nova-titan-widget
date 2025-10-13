# Nova Titan Sports Widget - Deployment Guide 🚀

This guide provides step-by-step instructions for deploying the Nova Titan Sports Widget to various platforms.

## 📋 Prerequisites

- **Node.js 18+** and npm
- **Python 3.11+** (for ML service)
- **Docker** (for containerized deployment)
- **Git** repository with your code

## 🏗️ Architecture Overview

The Nova Titan Widget consists of 3 main services:

1. **Frontend** (React + Vite) → Static hosting (Vercel, Netlify)
2. **Backend API** (Node.js + Express) → Container hosting (Render, Railway)
3. **ML Service** (Python + FastAPI) → Container hosting (Render, Railway)

Plus supporting infrastructure:
- **PostgreSQL** database
- **Redis** cache
- **CDN** for widget distribution

---

## 🌟 Quick Deploy Options

### Option 1: One-Click Deploy to Render (Recommended)

**Estimated Time:** 10 minutes

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/your-repo/nova-titan-widget)

1. Click the "Deploy to Render" button above
2. Connect your GitHub repository
3. Set the following environment variables in Render dashboard:
   ```bash
   # Required
   ODDS_API_KEY=your_odds_api_key_here
   JWT_SECRET=your_super_secret_jwt_key
   
   # Optional
   SENTRY_DSN=your_sentry_dsn
   GA_TRACKING_ID=your_google_analytics_id
   ```
4. Deploy! Services will be available at:
   - Frontend: `https://your-app.onrender.com`
   - API: `https://your-api.onrender.com`
   - ML Service: `https://your-ml.onrender.com`

### Option 2: Deploy to Railway

**Estimated Time:** 8 minutes

1. Fork this repository to your GitHub account
2. Connect Railway to your GitHub account
3. Create a new Railway project from your forked repo
4. Railway will auto-detect services and deploy them
5. Set environment variables in Railway dashboard (same as above)

### Option 3: Deploy Frontend to Vercel + Backend to Render

**Estimated Time:** 15 minutes

**Frontend to Vercel:**
```bash
cd frontend
npx vercel --prod
```

**Backend to Render:** Use Option 1 above but only deploy API services.

---

## 🔧 Manual Deployment

### Step 1: Environment Setup

Create environment files for each service:

**.env (Backend):**
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379
ML_SERVICE_URL=http://your-ml-service
ODDS_API_KEY=your_odds_api_key
JWT_SECRET=your_jwt_secret
SENTRY_DSN=your_sentry_dsn
CORS_ORIGIN=https://your-frontend-domain.com
```

**.env (ML Service):**
```bash
ENVIRONMENT=production
PORT=3002
REDIS_URL=redis://host:6379
MODEL_PATH=/app/models
LOG_LEVEL=INFO
```

**.env (Frontend):**
```bash
VITE_API_URL=https://your-api-domain.com/api
VITE_ML_URL=https://your-ml-domain.com
VITE_ENVIRONMENT=production
VITE_SENTRY_DSN=your_sentry_dsn
VITE_GA_TRACKING_ID=your_ga_id
```

### Step 2: Build & Deploy Backend

```bash
# Install dependencies
cd backend
npm ci --production

# Run database migrations
npm run db:migrate

# Build application
npm run build

# Start production server
npm start
```

**Deploy to your preferred platform:**
- **Render:** Connect GitHub repo, set environment variables
- **Railway:** Import from GitHub, configure services
- **Heroku:** `git push heroku main`
- **AWS ECS:** Use provided Dockerfile
- **Google Cloud Run:** `gcloud run deploy`

### Step 3: Build & Deploy ML Service

```bash
# Install Python dependencies
cd ml
pip install -r requirements.txt

# Start production server
python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Docker Deployment:**
```bash
cd ml
docker build -t nova-titan-ml .
docker run -p 3002:3002 nova-titan-ml
```

### Step 4: Build & Deploy Frontend

```bash
# Install dependencies
cd frontend
npm ci

# Build for production
npm run build

# Deploy static files to CDN/hosting
```

**Static Hosting Options:**
- **Vercel:** `npx vercel --prod`
- **Netlify:** Drag `dist` folder to Netlify dashboard
- **AWS S3 + CloudFront:** Upload `dist` to S3, configure CloudFront
- **GitHub Pages:** Push `dist` to `gh-pages` branch

---

## 🗄️ Database Setup

### PostgreSQL (Production)

**Render PostgreSQL:**
```bash
# Automatically provisioned with render.yaml
# Connection string available as DATABASE_URL
```

**Manual PostgreSQL Setup:**
```sql
-- Create database and user
CREATE DATABASE nova_titan;
CREATE USER nova_titan WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE nova_titan TO nova_titan;

-- Run migrations
npx prisma migrate deploy
```

### Redis Cache

**Render Redis:**
```bash
# Automatically provisioned with render.yaml
# Connection string available as REDIS_URL
```

**Manual Redis Setup:**
```bash
# Install Redis
sudo apt-get install redis-server

# Start Redis
redis-server

# Test connection
redis-cli ping
```

---

## 🔑 API Keys & External Services

### Required API Keys

1. **The Odds API** (Sports data)
   - Sign up: https://the-odds-api.com/
   - Free tier: 500 requests/month
   - Set as `ODDS_API_KEY`

2. **Sentry** (Error tracking - Optional)
   - Sign up: https://sentry.io/
   - Create project, get DSN
   - Set as `SENTRY_DSN`

3. **Google Analytics** (Analytics - Optional)
   - Create GA4 property
   - Get tracking ID
   - Set as `VITE_GA_TRACKING_ID`

### Environment Variables Reference

| Variable | Service | Required | Description |
|----------|---------|----------|-------------|
| `ODDS_API_KEY` | Backend | ✅ | The Odds API key |
| `JWT_SECRET` | Backend | ✅ | JWT signing secret |
| `DATABASE_URL` | Backend | ✅ | PostgreSQL connection string |
| `REDIS_URL` | Backend/ML | ✅ | Redis connection string |
| `SENTRY_DSN` | All | ❌ | Error tracking |
| `CORS_ORIGIN` | Backend | ✅ | Frontend domain for CORS |
| `VITE_API_URL` | Frontend | ✅ | Backend API URL |
| `ML_SERVICE_URL` | Backend | ✅ | ML service URL |

---

## 🧪 Testing Deployment

### Health Checks

After deployment, verify services are running:

```bash
# Backend health check
curl https://your-api.com/api/health

# ML service health check  
curl https://your-ml.com/health

# Frontend availability
curl https://your-frontend.com
```

### Widget Integration Test

Test the embeddable widget:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Widget Test</title>
</head>
<body>
    <h1>Nova Titan Widget Test</h1>
    
    <!-- Embed widget -->
    <script src="https://your-frontend.com/widget.js" 
            data-api-url="https://your-api.com/api"
            data-theme="nova-titan">
    </script>
    <div id="nova-titan-widget"></div>
</body>
</html>
```

### Performance Testing

Run Lighthouse audit:
```bash
npx lighthouse https://your-frontend.com --view
```

Expected scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 85+

---

## 🔄 CI/CD Setup

### GitHub Actions (Included)

The repository includes a complete CI/CD pipeline (`.github/workflows/ci-cd.yml`) that:

1. **Tests** all services on PR/push
2. **Builds** and pushes Docker images
3. **Deploys** to staging (main branch)
4. **Deploys** to production (releases)
5. **Runs** performance tests
6. **Notifies** team via Slack

### Required GitHub Secrets

Set these in your GitHub repository settings:

```bash
# Deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id  
VERCEL_PROJECT_ID=your_vercel_project_id
RENDER_DEPLOY_HOOK_STAGING=https://api.render.com/deploy/...
RENDER_DEPLOY_HOOK_PRODUCTION=https://api.render.com/deploy/...

# Docker Hub
DOCKERHUB_USERNAME=your_username
DOCKERHUB_TOKEN=your_token

# Security
SNYK_TOKEN=your_snyk_token

# Notifications  
SLACK_WEBHOOK=your_slack_webhook

# Analytics
LHCI_GITHUB_APP_TOKEN=your_lighthouse_token
```

---

## 🚀 Going Live Checklist

### Pre-Launch

- [ ] Set all required environment variables
- [ ] Configure real API keys (replace demo keys)
- [ ] Set up monitoring (Sentry, logs)
- [ ] Configure analytics (Google Analytics)
- [ ] Test widget embedding on target sites
- [ ] Verify age verification and legal disclaimers
- [ ] Test predictions with real data
- [ ] Set up SSL certificates
- [ ] Configure CDN for widget.js
- [ ] Set up database backups

### Launch

- [ ] Deploy to production
- [ ] Update DNS records if needed
- [ ] Test all functionality end-to-end
- [ ] Monitor error rates and performance
- [ ] Verify embeddable widget works on partner sites
- [ ] Set up uptime monitoring
- [ ] Document API endpoints for partners

### Post-Launch

- [ ] Monitor model performance and accuracy
- [ ] Set up regular model retraining
- [ ] Analyze user behavior and widget usage
- [ ] Optimize based on performance metrics
- [ ] Scale infrastructure based on traffic
- [ ] Update documentation as needed

---

## 🆘 Troubleshooting

### Common Issues

**Widget not loading:**
```bash
# Check CORS settings
curl -H "Origin: https://partner-site.com" https://your-api.com/api/health

# Verify widget.js is accessible  
curl https://your-frontend.com/widget.js
```

**Predictions failing:**
```bash
# Check ML service health
curl https://your-ml.com/health

# Test prediction endpoint
curl -X POST https://your-api.com/api/predictions \
  -H "Content-Type: application/json" \
  -d '{"gameId":"test-game-123"}'
```

**Database connection issues:**
```bash
# Test database connection
npm run db:test

# Check connection string format
echo $DATABASE_URL
```

### Performance Issues

**Slow API responses:**
- Enable Redis caching
- Optimize database queries
- Scale to multiple instances
- Use CDN for static assets

**High memory usage (ML service):**
- Reduce model complexity
- Enable model compression
- Scale vertically or horizontally
- Implement model caching

### Getting Help

- 📖 **Documentation:** `/docs` folder
- 🐛 **Issues:** GitHub Issues tab
- 💬 **Discussions:** GitHub Discussions
- 📧 **Support:** support@nova-titan.com

---

## 💰 Cost Estimation

### Free Tier (Development/Demo)

| Service | Provider | Cost |
|---------|----------|------|
| Frontend | Vercel | Free |
| Backend | Render | Free (750 hrs/month) |
| ML Service | Render | Free (750 hrs/month) |
| Database | Render PostgreSQL | Free |
| Cache | Render Redis | Free |
| **Total** | | **$0/month** |

### Production Tier

| Service | Provider | Cost |
|---------|----------|------|
| Frontend | Vercel Pro | $20/month |
| Backend | Render Standard | $7/month |
| ML Service | Render Standard | $7/month |
| Database | Render PostgreSQL | $7/month |
| Cache | Render Redis | $7/month |
| The Odds API | Premium | $50/month |
| **Total** | | **~$98/month** |

### Enterprise Scale

For high-traffic deployments, consider:
- AWS/GCP for auto-scaling
- Dedicated ML infrastructure
- Premium API tiers
- Advanced monitoring

Estimated cost: $500-2000/month depending on traffic.

---

## 🔒 Security & Compliance

### Security Checklist

- [ ] All secrets stored securely (not in code)
- [ ] HTTPS enabled on all services
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS protection headers
- [ ] Age verification implemented
- [ ] Legal disclaimers displayed
- [ ] Regular security updates

### Compliance Notes

- **Age Verification:** Required for betting features
- **Legal Disclaimers:** Must be prominently displayed
- **Geo-blocking:** Configurable by region
- **Responsible Gambling:** Links and resources provided
- **Data Privacy:** GDPR/CCPA considerations
- **Terms of Service:** Required for production use

---

🎉 **Congratulations!** Your Nova Titan Sports Widget is now live and ready to provide AI-powered sports predictions to users worldwide!