# 🚀 Nova Titan Sports Widget - Setup Guide

## Quick Start (3 Steps)

### 1. Download & Extract
- Download all project files
- Extract to your desired folder

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Run the Widget
```bash
npm run dev
```

Open `http://localhost:5173` in your browser to see your Nova Titan Sports Widget!

## ✅ What You'll See

- 🏆 **Nova Titan logo** prominently displayed
- 🎨 **Blue Nova color scheme** throughout
- ⚡ **AI predictions** with Nova branding
- 📚 **Terminology guide** for betting terms
- 🎯 **Sport selection** tabs
- 🔧 **Settings panel** for customization

## 🌐 Deploy to Production

### Option 1: Netlify (Easiest)
1. Build the project: `npm run build`
2. Drag the `dist` folder to [netlify.com/drop](https://netlify.com/drop)
3. Your widget is live!

### Option 2: Vercel
1. Push to GitHub
2. Connect to [vercel.com](https://vercel.com)
3. Deploy automatically

### Option 3: GitHub Pages
1. Build: `npm run build`
2. Push `dist` folder to `gh-pages` branch
3. Enable GitHub Pages in repo settings

## 🔧 Customization

All Nova Titan branding is in:
- `src/stores/widgetStore.ts` - Default colors and logo
- `tailwind.config.js` - Color palette
- `src/components/widget/WidgetHeader.tsx` - Logo and header

## 📱 Embed Anywhere

After deployment, embed with:
```html
<iframe src="https://your-domain.com" width="100%" height="600px"></iframe>
```

## 🆘 Need Help?

If npm install fails:
1. Delete `node_modules` folder
2. Delete `package-lock.json` file  
3. Run `npm cache clean --force`
4. Try `npm install` again

---

**Built for Nova Titan Sports** 🏆