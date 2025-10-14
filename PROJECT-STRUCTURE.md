# Nova Titan Platform - Project Structure

## 🏗️ Full-Stack Architecture

This is a complete full-stack sports betting platform with the following structure:

```
nova-titan-platform/
├── frontend/                 # React/TypeScript Frontend
│   ├── src/                 # Source code
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.ts       # Vite build configuration
│   ├── index.html           # Main HTML entry point
│   └── dist/               # Build output (generated)
│
├── backend/                 # Node.js/Express Backend
│   ├── src/                # Server source code
│   ├── prisma/             # Database schema
│   ├── package.json        # Backend dependencies
│   └── Dockerfile          # Backend containerization
│
├── .github/workflows/       # CI/CD Pipelines
│   └── deploy.yml          # GitHub Actions deployment
│
├── shared/                  # Shared utilities/types
├── docs/                   # Documentation
├── ml/                     # Machine learning models
│
└── package.json            # Root project management
```

## 🚀 Quick Start

### Development
```bash
# Install all dependencies
npm run install:all

# Run frontend only
npm run dev:frontend

# Run backend only  
npm run dev:backend
```

### Production Deployment
```bash
# Build frontend for deployment
npm run build:frontend

# Deploy via GitHub Actions (automatic on push to main)
git push origin main
```

## 🌐 Live Deployment

The platform automatically deploys the frontend to GitHub Pages when you push to the main branch. The backend can be deployed to services like Heroku, Railway, or Vercel.

**Frontend:** `https://username.github.io/repository-name`
**Backend:** Deploy to your preferred cloud service