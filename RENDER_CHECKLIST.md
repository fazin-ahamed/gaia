# GAIA 3.1 - Render Deployment Checklist

## Pre-Deployment Setup

### 1. Code Preparation
- [ ] All code committed to GitHub
- [ ] `render.yaml` in project root
- [ ] `backend/server.js` updated for PostgreSQL
- [ ] CORS configured with production URLs
- [ ] Environment variables documented

### 2. Render Account
- [ ] Created account at [render.com](https://render.com/)
- [ ] Connected GitHub account
- [ ] Verified email address

---

## Backend Deployment (Render)

### Step 1: Create PostgreSQL Database
- [ ] Go to Render Dashboard
- [ ] Click "New +" → "PostgreSQL"
- [ ] Settings:
  - Name: `gaia-db`
  - Database: `gaia`
  - User: `gaia`
  - Region: Oregon (or closest)
  - Plan: Free
- [ ] Click "Create Database"
- [ ] Copy "Internal Database URL" (starts with `postgresql://`)
- [ ] Save connection details securely

### Step 2: Create Web Service
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Settings:
  - Name: `gaia-backend`
  - Region: Oregon (same as database)
  - Branch: `main`
  - Root Directory: (leave empty)
  - Runtime: Node
  - Build Command: `cd backend && npm install`
  - Start Command: `cd backend && node server.js`
  - Plan: Free
- [ ] Click "Create Web Service"

### Step 3: Configure Environment Variables

Go to your web service → Environment tab and add:

#### Required Variables
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `DB_DIALECT` = `postgres`
- [ ] `DATABASE_URL` = (paste from PostgreSQL dashboard)

#### AI Services
- [ ] `GEMINI_API_KEY` = your_gemini_key
- [ ] `OPENROUTER_API_KEY` = your_openrouter_key
- [ ] `HUGGINGFACE_API_KEY` = your_huggingface_key
- [ ] `APP_URL` = `https://gaia-backend.onrender.com`

#### System
- [ ] `AUTONOMOUS_MODE` = `true`

#### External APIs (Optional but Recommended)
- [ ] `OPENWEATHER_API_KEY` = your_key
- [ ] `WEATHERBIT_API_KEY` = your_key
- [ ] `NEWSAPI_KEY` = your_key
- [ ] `NOAA_API_KEY` = your_key
- [ ] `OPENAQ_API_KEY` = your_key
- [ ] `AQICN_API_KEY` = your_key

#### Opus Workflow (Optional)
- [ ] `OPUS_SERVICE_KEY` = your_key
- [ ] `OPUS_WORKFLOW_ID` = your_id

### Step 4: Deploy
- [ ] Click "Manual Deploy" → "Deploy latest commit"
- [ ] Wait for build (5-10 minutes)
- [ ] Check logs for errors
- [ ] Verify deployment successful

### Step 5: Verify Backend
- [ ] Test health endpoint: `https://gaia-backend.onrender.com/health`
- [ ] Test API: `https://gaia-backend.onrender.com/api/anomalies`
- [ ] Test AI status: `https://gaia-backend.onrender.com/api/ai/status`
- [ ] Check logs show no errors
- [ ] Database connected successfully

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
- [ ] Create `frontend/.env.production`:
  ```bash
  VITE_API_URL=https://gaia-backend.onrender.com
  ```
- [ ] Update CORS in backend to include Vercel URL
- [ ] Test locally with production API URL

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

#### Option B: Vercel Dashboard
- [ ] Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- [ ] Click "New Project"
- [ ] Import GitHub repository
- [ ] Settings:
  - Root Directory: `frontend`
  - Framework Preset: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Add Environment Variable:
  - `VITE_API_URL` = `https://gaia-backend.onrender.com`
- [ ] Click "Deploy"

### Step 3: Update Backend CORS
- [ ] Add Vercel URL to CORS in `backend/server.js`:
  ```javascript
  app.use(cors({
    origin: [
      'https://your-app.vercel.app', // Replace with actual URL
      'http://localhost:3000'
    ]
  }));
  ```
- [ ] Commit and push changes
- [ ] Render will auto-redeploy

### Step 4: Verify Frontend
- [ ] Visit your Vercel URL
- [ ] Check browser console for errors
- [ ] Test all major features:
  - [ ] Dashboard loads
  - [ ] Alerts page works
  - [ ] Upload feature works
  - [ ] Real-time data displays
  - [ ] Maps render correctly

---

## Post-Deployment Testing

### Backend Tests
```bash
# Health check
curl https://gaia-backend.onrender.com/health

# Anomalies API
curl https://gaia-backend.onrender.com/api/anomalies

# Alerts API
curl https://gaia-backend.onrender.com/api/alerts

# AI Status
curl https://gaia-backend.onrender.com/api/ai/status

# Hotspots
curl https://gaia-backend.onrender.com/api/realtime/hotspots

# Upload test
curl -X POST https://gaia-backend.onrender.com/api/upload/analyze-text \
  -H "Content-Type: application/json" \
  -d '{"text":"Test anomaly detection"}'
```

### Frontend Tests
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Dashboard displays data
- [ ] Alerts page shows alerts
- [ ] Upload page accepts files
- [ ] Maps render correctly
- [ ] No console errors
- [ ] API calls succeed

### Database Tests
- [ ] Data is being stored
- [ ] Anomalies are created
- [ ] API data is saved
- [ ] Audit logs are working

### AI Service Tests
- [ ] Gemini API working (or falling back to OpenRouter)
- [ ] Rate limiting working
- [ ] Image analysis works
- [ ] Text analysis works

---

## Monitoring Setup

### Render Dashboard
- [ ] Check service status (should be "Live")
- [ ] Monitor CPU usage
- [ ] Monitor memory usage
- [ ] Check request count
- [ ] Review logs regularly

### Set Up Alerts
- [ ] Go to Service Settings → Notifications
- [ ] Enable email notifications for:
  - [ ] Deploy failures
  - [ ] Service crashes
  - [ ] High resource usage

### Database Monitoring
- [ ] Check database size
- [ ] Monitor connection count
- [ ] Verify backups are running
- [ ] Check query performance

---

## Troubleshooting

### If Backend Won't Start
1. [ ] Check build logs in Render dashboard
2. [ ] Verify all environment variables are set
3. [ ] Check DATABASE_URL is correct
4. [ ] Test locally with production settings
5. [ ] Review error logs

### If Database Connection Fails
1. [ ] Verify DATABASE_URL is set
2. [ ] Check SSL is enabled in code
3. [ ] Ensure database and service in same region
4. [ ] Test connection string locally

### If Frontend Can't Connect
1. [ ] Verify VITE_API_URL is correct
2. [ ] Check CORS settings in backend
3. [ ] Test API endpoints directly
4. [ ] Check browser console for errors

### If Cold Start is Slow
1. [ ] Accept 30-60s delay (free tier limitation)
2. [ ] Consider upgrading to Starter plan ($7/month)
3. [ ] Implement keep-alive script
4. [ ] Optimize startup code

---

## Optimization (Optional)

### Reduce Cold Starts
- [ ] Upgrade to Render Starter plan ($7/month)
- [ ] Add keep-alive script
- [ ] Optimize initialization code

### Improve Performance
- [ ] Enable database connection pooling
- [ ] Add caching for frequent queries
- [ ] Optimize AI API calls
- [ ] Compress responses

### Cost Optimization
- [ ] Monitor usage patterns
- [ ] Disable autonomous mode if not needed
- [ ] Reduce data ingestion frequency
- [ ] Use free tier APIs where possible

---

## Maintenance Schedule

### Daily
- [ ] Check service status
- [ ] Review error logs
- [ ] Monitor AI rate limits

### Weekly
- [ ] Review database size
- [ ] Check backup status
- [ ] Monitor performance metrics
- [ ] Test all features

### Monthly
- [ ] Review costs
- [ ] Update dependencies
- [ ] Check for security updates
- [ ] Optimize database

---

## Upgrade Path

### When to Upgrade Backend
- [ ] Cold starts affecting users → Starter ($7/month)
- [ ] Need more RAM → Standard ($25/month)
- [ ] High traffic → Pro ($85/month)

### When to Upgrade Database
- [ ] Approaching 1 GB storage → Starter ($7/month)
- [ ] Need longer backups → Standard ($20/month)
- [ ] High connection count → Pro ($90/month)

### When to Upgrade Frontend
- [ ] Need analytics → Vercel Pro ($20/month)
- [ ] High bandwidth → Vercel Pro
- [ ] Team collaboration → Vercel Pro

---

## Success Criteria

### Backend
- ✅ Service status: Live
- ✅ Health endpoint responds
- ✅ Database connected
- ✅ AI service initialized
- ✅ No errors in logs
- ✅ API endpoints working

### Frontend
- ✅ Site loads quickly
- ✅ All pages accessible
- ✅ API calls succeed
- ✅ No console errors
- ✅ Features working
- ✅ Mobile responsive

### Overall
- ✅ End-to-end testing passed
- ✅ Monitoring configured
- ✅ Backups enabled
- ✅ Documentation updated
- ✅ Team notified

---

## Quick Reference

### URLs
- Backend: `https://gaia-backend.onrender.com`
- Frontend: `https://your-app.vercel.app`
- Database: (Internal URL in Render dashboard)

### Important Commands
```bash
# View backend logs
# (In Render dashboard → Logs tab)

# Redeploy backend
# (In Render dashboard → Manual Deploy)

# Deploy frontend
cd frontend && vercel --prod

# Test health
curl https://gaia-backend.onrender.com/health
```

### Support
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Community: https://community.render.com/

---

## Completion

- [ ] All checklist items completed
- [ ] System fully deployed
- [ ] All tests passing
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team trained

**Deployment Date**: _______________
**Deployed By**: _______________
**Backend URL**: _______________
**Frontend URL**: _______________

---

**Status**: Ready for Production ✅
