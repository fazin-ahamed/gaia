# 🚀 GAIA 3.1 - Deployment Guide

## Quick Start

Deploy GAIA in 3 simple steps:

### 1️⃣ Run Deployment Helper

**Windows:**
```bash
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### 2️⃣ Deploy Backend to Render

1. Go to [render.com](https://render.com/)
2. Create PostgreSQL database
3. Create Web Service from GitHub
4. Add environment variables (see below)
5. Deploy

### 3️⃣ Deploy Frontend to Vercel

```bash
cd frontend
npm install -g vercel
vercel --prod
```

---

## 📋 Environment Variables

### Backend (Render)
```bash
# Required
NODE_ENV=production
PORT=10000
DB_DIALECT=postgres
DATABASE_URL=<auto-set>
GEMINI_API_KEY=your_key
OPENROUTER_API_KEY=your_key

# Optional
AUTONOMOUS_MODE=true
OPENWEATHER_API_KEY=your_key
NEWSAPI_KEY=your_key
```

### Frontend (Vercel)
```bash
VITE_API_URL=https://gaia-backend.onrender.com
```

---

## 📚 Documentation

- **DEPLOYMENT_SUMMARY.md** - Complete overview
- **RENDER_DEPLOYMENT_GUIDE.md** - Detailed Render guide
- **RENDER_CHECKLIST.md** - Step-by-step checklist
- **QUICK_DEPLOY.md** - Fast reference

---

## ✅ Verify Deployment

```bash
# Test backend
curl https://gaia-backend.onrender.com/health

# Test API
curl https://gaia-backend.onrender.com/api/anomalies

# Open frontend
# https://your-app.vercel.app
```

---

## 💰 Cost

- **Free Tier:** $0/month (with limitations)
- **Production:** $14/month (recommended)
- **High-Traffic:** $65/month

---

## 🆘 Need Help?

1. Check **DEPLOYMENT_SUMMARY.md** for troubleshooting
2. Review logs in Render/Vercel dashboards
3. Test health endpoint
4. Check browser console

---

## 🎯 Success Criteria

- ✅ Backend health check passes
- ✅ Frontend loads
- ✅ Database connected
- ✅ API calls work
- ✅ No errors in logs

---

**Time to Deploy:** ~15 minutes
**Difficulty:** Easy
**Status:** Production Ready ✅
