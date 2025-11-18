# 🚀 Quick Start: Deploy GAIA 3.1

## 30-Minute Deployment via GitHub Integration

---

## ✅ Pre-Flight Check

- [x] npm install error fixed
- [x] Build tested and working
- [x] Dynamic anomaly links working
- [x] Production environment ready

---

## 📋 What You Need

1. **GitHub account** (with your code pushed)
2. **Render account** (sign up with GitHub)
3. **Vercel account** (sign up with GitHub)
4. **API Keys**:
   - Gemini API key (required)
   - OpenRouter API key (required)
   - Other API keys (optional)

---

## 🎯 3-Step Deployment

### Step 1: Push to GitHub (2 min)
```bash
git add .
git commit -m "Production ready - GAIA 3.1"
git push origin main
```

### Step 2: Deploy Backend to Render (15 min)

1. **render.com** → Sign in with GitHub
2. **New +** → **PostgreSQL** → Create (copy Database URL)
3. **New +** → **Web Service** → Connect GitHub repo
4. **Configure**:
   - Root: (empty)
   - Build: `cd backend && npm install`
   - Start: `cd backend && node server.js`
5. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   DB_DIALECT=postgres
   DATABASE_URL=<your-database-url>
   GEMINI_API_KEY=<your-key>
   OPENROUTER_API_KEY=<your-key>
   AUTONOMOUS_MODE=true
   APP_URL=https://gaia-backend.onrender.com
   ```
6. **Deploy** → Wait 5-10 min
7. **Test**: `curl https://gaia-backend.onrender.com/health`

### Step 3: Deploy Frontend to Vercel (10 min)

1. **vercel.com** → Sign in with GitHub
2. **New Project** → Import your repo
3. **Configure**:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build: `npm run build`
   - Install: `npm install --legacy-peer-deps`
4. **Add Environment Variable**:
   ```
   VITE_API_URL=https://gaia-backend.onrender.com
   ```
5. **Deploy** → Wait 2-5 min
6. **Copy your Vercel URL**

### Step 4: Update CORS (3 min)

1. Edit `backend/server.js`:
   ```javascript
   app.use(cors({
     origin: [
       'https://your-vercel-url.vercel.app', // Your actual URL
       'http://localhost:3000'
     ],
     credentials: true
   }));
   ```
2. Push to GitHub:
   ```bash
   git add backend/server.js
   git commit -m "Update CORS"
   git push origin main
   ```
3. Render auto-deploys (2-3 min)

---

## ✅ Verify Deployment

### Backend
```bash
curl https://gaia-backend.onrender.com/health
curl https://gaia-backend.onrender.com/api/anomalies
```

### Frontend
Visit: `https://your-project-name.vercel.app`

Check:
- ✅ Site loads
- ✅ Dashboard shows data
- ✅ Click anomaly → goes to `/incident/1`, `/incident/2` (not `anom-001`)
- ✅ No console errors

---

## 🎉 You're Live!

**Backend**: `https://gaia-backend.onrender.com`
**Frontend**: `https://your-project-name.vercel.app`

**Auto-Deploy Enabled**: Push to GitHub → Automatic deployment!

---

## 📚 Full Guide

See **GITHUB_DEPLOY_GUIDE.md** for:
- Detailed step-by-step instructions
- Troubleshooting guide
- Custom domain setup
- Monitoring and alerts
- Production optimization

---

## 💰 Cost

**Free Tier**: $0/month (perfect for testing)
**Production**: $14/month (Render Starter + PostgreSQL)

---

**Need Help?** Check GITHUB_DEPLOY_GUIDE.md for troubleshooting!
