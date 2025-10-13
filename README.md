# 🏆 Nova Titan Sports Widget

**Complete AI-powered sports prediction and betting widget with your Nova Titan branding.**

## 🚀 Quick Setup

### Method 1: Individual Package Setup (Recommended)
```bash
# Frontend only (for widget development)
cd frontend
npm install
npm run dev
```

### Method 2: Full Workspace Setup
```bash
# Install all workspace dependencies
npm install
npm run dev:frontend
```

Open `http://localhost:5173` to see your widget!

## 🔧 Recent Fixes Applied

✅ **Fixed all dependency issues**:
- Added missing `@sentry/react`, `@tanstack/react-query`, `@tailwindcss/forms`
- Updated `react-query` to `@tanstack/react-query` v5
- Removed problematic workspace dependencies
- Fixed import paths for all components

✅ **Resolved TypeScript/JSX errors**:
- Fixed ErrorBoundary import paths
- Created missing LegalDisclaimer component
- Updated widget store interface compatibility
- Fixed API client method signatures

✅ **Updated build configuration**:
- Added proper workspace configuration in root package.json
- Fixed Tailwind CSS config to include @tailwindcss/forms
- Added environment variables setup
- Updated Vite config for better module resolution

✅ **Component fixes**:
- All components now have correct import paths
- LoadingSpinner and ErrorBoundary working properly
- Added QueryClient provider wrapper
- Fixed widget store state management

## ✨ Features

- 🏆 **Nova Titan Branding** - Your logo and colors throughout
- 🤖 **AI Predictions** - Powered by "Nova AI v2.1" 
- 📊 **Live Games** - NBA, NFL, MLB, NHL, Soccer
- 🎯 **Parlay Builder** - Smart combination betting
- 📚 **Terminology Guide** - Comprehensive betting glossary
- ⚙️ **Settings Panel** - Customize colors and branding
- 📱 **Mobile Responsive** - Works on all devices

## 🎨 Your Nova Titan Branding Includes

- **Logo**: Prominently displayed in header
- **Colors**: Navy blue (#1a365d), Steel blue (#2d5a87), Bright blue (#4299e1)
- **Typography**: Clean, professional Nova Titan styling
- **AI Branding**: "Nova AI v2.1" throughout predictions
- **Customization**: Full settings panel for tweaking

## 🌐 Deploy Options

### Instant Deploy
1. `npm run build`
2. Upload `dist` folder to any host
3. Your widget is live!

### Recommended Hosts
- **Netlify**: Drag & drop deployment
- **Vercel**: GitHub integration
- **GitHub Pages**: Free hosting

## 📁 Project Structure

```
nova-titan-widget/
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components with Nova branding
│   │   ├── stores/         # App state management
│   │   └── utils/          # Helper functions
│   ├── package.json        # Dependencies
│   └── index.html          # Entry point
├── SETUP.md               # Detailed setup guide
└── README.md              # This file
```

## 🔧 Customization

All Nova branding is easily customizable in:
- `src/stores/widgetStore.ts` - Colors and logo URL
- `src/components/widget/WidgetHeader.tsx` - Header layout
- `tailwind.config.js` - Color palette

## 📱 Embed Anywhere

```html
<iframe src="https://your-widget-url.com" width="100%" height="600px"></iframe>
```

## 🆘 Troubleshooting

**If you get workspace errors (`npm error code EUNSUPPORTEDPROTOCOL`):**
```bash
# Use the individual package approach instead
cd frontend
npm install
npm run dev
```

**If npm install fails:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**If you see `vite is not recognized` errors:**
```bash
# Make sure you're in the frontend directory
cd frontend
npm install  # This will install vite locally
npm run dev
```

**If you see import errors:**
- Make sure you're in the `frontend` folder
- All shared dependencies have been moved to local types
- Run `npm install` to get all dependencies

**If you see Sentry errors:**
- Sentry imports have been removed from the main frontend
- Check if you're running the wrong project directory
- Make sure you're in the `frontend` folder, not `nova-titan-widget-standalone`

**If TypeScript errors persist:**
```bash
# Clear TypeScript cache and rebuild
npx tsc --build --clean
npm run build
```

## 🎯 What's Included

✅ **Complete React app** with TypeScript  
✅ **Nova Titan branding** throughout  
✅ **AI predictions interface**  
✅ **Parlay builder tool**  
✅ **Terminology guide**  
✅ **Settings panel**  
✅ **Mobile responsive design**  
✅ **Production-ready build**  

## 📞 Support

Need help? Check `SETUP.md` for detailed instructions or common issues.

---

**Built with ❤️ for Nova Titan Sports** 🚀