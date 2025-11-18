# GAIA 3.1 - Quick Deploy Guide

## TL;DR - Fastest Way to Deploy

### 1. Backend on Railway (5 minutes)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Create new project
railway init

# 4. Add PostgreSQL
railway add postgresql

# 5. Set environment variables
railway variables set GEMINI_API_KEY=your_key
railway variables set OPENROUTER_API_KEY=your_key
railway variables set NODE_ENV=production
railway variables set AUTONOMOUS_MODE=true

# 6. Deploy
railway up
```

Your backend is live at: `https://your-app.railway.app`

---

### 2. Frontend on Vercel (3 minutes)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Go to frontend directory
cd frontend

# 3. Create .env.production
echo "VITE_API_URL=https://your-backend.railway.app" > .env.production

# 4. Deploy
vercel --prod
```

Your frontend is live at: `https://your-app.vercel.app`

---

## Fix Gemini API Errors

The Gemini errors you're seeing are normal - they happen when:
1. Rate limits are exceeded (5/min, 20/day)
2. The system automatically falls back to OpenRouter (DeepSeek)

### To Reduce Errors:

**Option 1: Reduce Data Ingestion Frequency** (Already done)
- Changed from every 5 minutes to every 15 minutes
- Reduces API calls by 66%

**Option 2: Disable Autonomous Mode Temporarily**
```bash
# In backend/.env
AUTONOMOUS_MODE=false
```

**Option 3: Use OpenRouter Only**
```bash
# Remove or comment out Gemini key
# GEMINI_API_KEY=...

# Keep OpenRouter
OPENROUTER_API_KEY=your_key
```

### Check AI Service Status
```bash
curl http://localhost:3001/api/ai/status
```

Response shows which provider is being used:
```json
{
  "currentProvider": "openrouter",
  "geminiAvailable": false,
  "openRouterAvailable": true,
  "gemini": {
    "perMinute": { "used": 5, "limit": 5, "remaining": 0 },
    "perDay": { "used": 20, "limit": 20, "remaining": 0 }
  }
}
```

---

## Environment Variables Quick Reference

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://...  # For production
DB_DIALECT=postgres

# AI (both for redundancy)
GEMINI_API_KEY=your_gemini_key
OPENROUTER_API_KEY=your_openrouter_key

# Server
PORT=3001
NODE_ENV=production
AUTONOMOUS_MODE=true
APP_URL=https://your-backend.railway.app

# Optional: External APIs
OPENWEATHER_API_KEY=...
NEWSAPI_KEY=...
OPUS_SERVICE_KEY=...
```

### Frontend (.env.production)
```bash
VITE_API_URL=https://your-backend.railway.app
```

---

## Troubleshooting

### "Gemini API error" in logs
✅ **Normal** - System falls back to OpenRouter automatically
- Check: `curl http://localhost:3001/api/ai/status`
- If OpenRouter is working, ignore Gemini errors

### "All AI providers failed"
❌ **Problem** - Both Gemini and OpenRouter failed
- Check OpenRouter API key is valid
- Test: `curl http://localhost:3001/api/ai/rate-limits`

### Database errors on Railway
- Make sure PostgreSQL is added to project
- Check `DATABASE_URL` is set automatically
- Verify SSL is enabled in code

### CORS errors
- Add your Vercel URL to CORS whitelist in backend
- Update `backend/server.js`:
```javascript
app.use(cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:3000']
}));
```

---

## Production Checklist

- [ ] Backend deployed to Railway
- [ ] PostgreSQL database added
- [ ] All environment variables set
- [ ] Frontend deployed to Vercel
- [ ] API URL updated in frontend
- [ ] CORS configured
- [ ] Test all features work
- [ ] Monitor logs for errors

---

## Cost

### Free Tier
- Railway: $5/month (includes PostgreSQL)
- Vercel: Free
- **Total: $5/month**

### Upgrade When Needed
- More traffic → Vercel Pro ($20/month)
- More compute → Railway Pro ($20/month)
- Larger database → Supabase Pro ($25/month)

---

## Support

- Railway Docs: https://docs.railway.app/
- Vercel Docs: https://vercel.com/docs
- GAIA Issues: Check logs in Railway/Vercel dashboards

---

**Status**: ✅ Ready to deploy
**Time**: ~10 minutes total
**Cost**: $5/month
