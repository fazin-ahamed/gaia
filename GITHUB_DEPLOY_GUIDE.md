# 🚀 GitHub Integration Deployment Guide

## Deploy GAIA 3.1 using GitHub Integration
**Backend → Render | Frontend → Vercel**

---

## Prerequisites

✅ **Fixed**: npm install error resolved
✅ **Fixed**: Dynamic anomaly links working
✅ **Ready**: Build tested and working
✅ **Ready**: Production environment configured

---

## Step 1: Push to GitHub (5 minutes)

### 1.1 Check Git Status
```bash
git status
```

### 1.2 Add All Changes
```bash
git add .
```

### 1.3 Commit Changes
```bash
git commit -m "Production ready: GAIA 3.1 with dynamic anomaly links and fixed dependencies"
```

### 1.4 Push to GitHub
```bash
git push origin main
```

**✅ Verify**: Go to your GitHub repository and confirm all files are updated

---

## Step 2: Deploy Backend to Render (10 minutes)

### 2.1 Create Render Account
1. Go to **https://render.com/**
2. Click **"Get Started"**
3. Click **"Sign in with GitHub"**
4. Authorize Render to access your repositories

### 2.2 Create PostgreSQL Database

1. In Render Dashboard, click **"New +"** (top right)
2. Select **"PostgreSQL"**
3. Configure:
   ```
   Name: gaia-db
   Database: gaia
   User: gaia
   Region: Oregon (US West)
   PostgreSQL Version: 16
   Plan: Free
   ```
4. Click **"Create Database"**
5. Wait 2-3 minutes for database to provision
6. **📋 IMPORTANT**: Copy the **"Internal Database URL"**
   - It looks like: `postgresql://gaia:xxxxx@dpg-xxxxx/gaia`
   - You'll need this in the next step

### 2.3 Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"**
3. If first time:
   - Click **"Configure account"**
   - Select your GitHub account
   - Choose: **"All repositories"** or select specific repo
   - Click **"Install"**
4. Back in Render, find your repository and click **"Connect"**

### 2.4 Configure Web Service

**Basic Settings:**
```
Name: gaia-backend
Region: Oregon (US West) - SAME as database
Branch: main
Root Directory: (leave empty)
Runtime: Node
```

**Build & Start:**
```
Build Command: cd backend && npm install
Start Command: cd backend && node server.js
```

**Plan:**
```
Instance Type: Free
```

### 2.5 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

**Required Variables** (add these one by one):

```bash
NODE_ENV=production
PORT=10000
DB_DIALECT=postgres
DATABASE_URL=<paste-internal-database-url-from-step-2.2>
GEMINI_API_KEY=<your-gemini-api-key>
OPENROUTER_API_KEY=<your-openrouter-api-key>
AUTONOMOUS_MODE=true
APP_URL=https://gaia-backend.onrender.com
```

**Optional Variables** (recommended for full functionality):
```bash
HUGGINGFACE_API_KEY=<your-key>
OPENWEATHER_API_KEY=<your-key>
WEATHERBIT_API_KEY=<your-key>
NEWSAPI_KEY=<your-key>
NOAA_API_KEY=<your-key>
OPENAQ_API_KEY=<your-key>
AQICN_API_KEY=<your-key>
OPUS_SERVICE_KEY=<your-key>
OPUS_WORKFLOW_ID=<your-id>
```

### 2.6 Deploy Backend

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Run build command
   - Start the service
3. **Wait 5-10 minutes** for first deployment
4. Watch the logs for any errors

### 2.7 Verify Backend Deployment

Once deployed, you'll see: **"Your service is live 🎉"**

**Test the health endpoint:**
```bash
curl https://gaia-backend.onrender.com/health
```

**Expected response:**
```json
{
  "status": "OK",
  "timestamp": "2024-11-18T...",
  "services": {
    "database": "connected",
    "gemini": "initialized"
  }
}
```

**Test API endpoints:**
```bash
curl https://gaia-backend.onrender.com/api/anomalies
curl https://gaia-backend.onrender.com/api/alerts
```

**✅ Backend Status**: Live at `https://gaia-backend.onrender.com`

---

## Step 3: Deploy Frontend to Vercel (5 minutes)

### 3.1 Create Vercel Account

1. Go to **https://vercel.com/**
2. Click **"Sign Up"**
3. Click **"Continue with GitHub"**
4. Authorize Vercel to access your repositories

### 3.2 Import Project

1. In Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Find your repository in the list
3. Click **"Import"**

### 3.3 Configure Project

**Framework Preset:**
```
Framework: Vite
```

**Root Directory:**
```
Root Directory: frontend
```
Click **"Edit"** next to Root Directory and type `frontend`

**Build Settings:**
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install --legacy-peer-deps
```

**Node Version:**
```
Node.js Version: 18.x (default is fine)
```

### 3.4 Add Environment Variables

Click **"Environment Variables"** section

Add this variable:
```
Name: VITE_API_URL
Value: https://gaia-backend.onrender.com
Environment: Production
```

### 3.5 Deploy Frontend

1. Click **"Deploy"**
2. Vercel will automatically:
   - Clone your repository
   - Install dependencies
   - Build the project
   - Deploy to CDN
3. **Wait 2-5 minutes** for deployment
4. Watch the build logs

### 3.6 Get Your Vercel URL

Once deployed, you'll see: **"Congratulations! 🎉"**

Your app is live at: `https://your-project-name.vercel.app`

**📋 COPY THIS URL** - you'll need it for the next step

**✅ Frontend Status**: Live at `https://your-project-name.vercel.app`

---

## Step 4: Update CORS (5 minutes)

Now that frontend is deployed, update backend to allow requests from your Vercel URL.

### 4.1 Update server.js

Open `backend/server.js` and find the CORS configuration (around line 20-30):

**Replace:**
```javascript
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
```

**With:**
```javascript
app.use(cors({
  origin: [
    'https://your-actual-vercel-url.vercel.app', // Replace with YOUR URL
    'http://localhost:3000'
  ],
  credentials: true
}));
```

### 4.2 Commit and Push

```bash
git add backend/server.js
git commit -m "Update CORS for production frontend"
git push origin main
```

### 4.3 Auto-Deploy

Render will automatically detect the push and redeploy (takes 2-3 minutes)

Watch the deployment in Render Dashboard → Your Service → Events

---

## Step 5: Final Testing (5 minutes)

### 5.1 Test Backend

**Health Check:**
```bash
curl https://gaia-backend.onrender.com/health
```

**API Endpoints:**
```bash
curl https://gaia-backend.onrender.com/api/anomalies
curl https://gaia-backend.onrender.com/api/alerts
curl https://gaia-backend.onrender.com/api/realtime/hotspots
curl https://gaia-backend.onrender.com/api/ai/status
```

### 5.2 Test Frontend

Visit your Vercel URL: `https://your-project-name.vercel.app`

**Check:**
- ✅ Site loads with dark theme
- ✅ Dashboard shows anomalies
- ✅ Click anomaly → goes to `/incident/1`, `/incident/2`, etc. (not `anom-001`)
- ✅ Incident details page shows real data
- ✅ Upload page works
- ✅ Analytics page loads
- ✅ No console errors (press F12)

### 5.3 Test Integration

1. **Dashboard → Incident Details**:
   - Click different anomalies
   - Each should show unique data
   - URLs should be `/incident/1`, `/incident/2`, etc.

2. **Upload Feature**:
   - Try uploading a file
   - Should analyze and show results

3. **Real-time Data**:
   - Check if maps update
   - Verify alerts appear

---

## Step 6: Enable Auto-Deploy (Optional)

### 6.1 Render Auto-Deploy

Already enabled! Render automatically deploys when you push to `main` branch.

**To verify:**
1. Go to Render Dashboard → Your Service
2. Click **"Settings"**
3. Check **"Auto-Deploy"** is set to **"Yes"**

### 6.2 Vercel Auto-Deploy

Already enabled! Vercel automatically deploys when you push to `main` branch.

**To verify:**
1. Go to Vercel Dashboard → Your Project
2. Click **"Settings"** → **"Git"**
3. Check **"Production Branch"** is set to **"main"**

### 6.3 Test Auto-Deploy

Make a small change and push:
```bash
# Edit README or any file
git add .
git commit -m "Test auto-deploy"
git push origin main
```

Both Render and Vercel will automatically deploy the changes!

---

## Troubleshooting

### Backend Issues

**Service won't start:**
1. Check logs in Render Dashboard
2. Verify all environment variables are set correctly
3. Check DATABASE_URL is the Internal URL (not External)
4. Ensure database and service are in same region

**Database connection fails:**
```
Error: connect ECONNREFUSED
```
- Verify DATABASE_URL is correct
- Check database is running (Render Dashboard → Database)
- Ensure DB_DIALECT=postgres is set

**API returns 500 errors:**
1. Check logs for specific error
2. Verify API keys are valid
3. Test endpoints individually

### Frontend Issues

**Site won't load:**
1. Check build logs in Vercel Dashboard
2. Verify VITE_API_URL is set correctly
3. Check for build errors

**API calls fail (CORS errors):**
```
Access to fetch blocked by CORS policy
```
- Verify CORS in backend/server.js includes your Vercel URL
- Check backend redeployed after CORS update
- Clear browser cache

**CSS not showing:**
1. Hard refresh: `Ctrl + Shift + R`
2. Check build logs for Tailwind errors
3. Verify vercel.json is present

**Anomaly links still use anom-001:**
1. Verify latest code is pushed to GitHub
2. Check Vercel deployed latest commit
3. Clear browser cache
4. Check browser console for errors

### Build Issues

**npm install fails:**
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

**Build fails on Vercel:**
- Check install command is: `npm install --legacy-peer-deps`
- Verify Node version is 18.x or higher
- Check build logs for specific errors

---

## Production URLs

**Backend**: `https://gaia-backend.onrender.com`
**Frontend**: `https://your-project-name.vercel.app`
**Health Check**: `https://gaia-backend.onrender.com/health`
**API Base**: `https://gaia-backend.onrender.com/api`

---

## Cost Summary

### Free Tier (Perfect for Testing)
- **Render Web Service**: Free (750 hours/month, spins down after 15 min inactivity)
- **Render PostgreSQL**: Free (1 GB storage, expires after 90 days)
- **Vercel**: Free (100 GB bandwidth, unlimited deployments)
- **Total**: $0/month

### Paid Tier (Production Ready)
- **Render Starter**: $7/month (no spin down, always on)
- **Render PostgreSQL**: $7/month (persistent, no expiration)
- **Vercel Pro**: $20/month (more bandwidth, analytics)
- **Total**: $14-34/month

---

## Next Steps

### 1. Monitor Performance
- **Render**: Dashboard → Metrics (CPU, Memory, Response Time)
- **Vercel**: Dashboard → Analytics (Page Views, Load Time)

### 2. Set Up Alerts
- **Render**: Settings → Notifications (email on deploy/failure)
- **Vercel**: Settings → Notifications (email on deploy/failure)

### 3. Custom Domains (Optional)

**Backend:**
1. Render Dashboard → Your Service → Settings → Custom Domain
2. Add your domain (e.g., `api.yourdomain.com`)
3. Update DNS records as shown
4. SSL certificate auto-generated

**Frontend:**
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Update DNS records as shown
4. SSL certificate auto-generated

### 4. Upgrade Database (When Ready)

When you're ready for production:
1. Render Dashboard → Your Database → Settings
2. Click **"Upgrade to Paid"**
3. Select plan (Starter $7/month recommended)
4. Database will persist beyond 90 days

### 5. Seed Production Database

**Option A: Via API**
```bash
curl -X POST https://gaia-backend.onrender.com/api/realtime/data
```

**Option B: Via Database Client**
1. Get External Database URL from Render
2. Connect with psql or database client
3. Run seed script

---

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created with GitHub
- [ ] PostgreSQL database created
- [ ] Database URL copied
- [ ] Backend web service created
- [ ] All environment variables added
- [ ] Backend deployed successfully
- [ ] Backend health check passes
- [ ] Vercel account created with GitHub
- [ ] Frontend project imported
- [ ] Root directory set to `frontend`
- [ ] Install command set to `npm install --legacy-peer-deps`
- [ ] VITE_API_URL environment variable added
- [ ] Frontend deployed successfully
- [ ] Frontend loads in browser
- [ ] Vercel URL copied
- [ ] CORS updated in backend/server.js
- [ ] CORS changes pushed to GitHub
- [ ] Backend redeployed with new CORS
- [ ] End-to-end testing complete
- [ ] Anomaly links use real IDs
- [ ] All features working

---

## Success Criteria

### ✅ Backend (Render)
- Health endpoint returns 200 OK
- Database connected
- AI services initialized
- All API endpoints responding
- No critical errors in logs
- Auto-deploy working

### ✅ Frontend (Vercel)
- Site loads quickly
- Dark theme applied
- All pages accessible
- API calls succeed
- No console errors
- Anomaly links use real IDs (1, 2, 3...)
- Incident pages show unique data
- Auto-deploy working

### ✅ Integration
- Frontend connects to backend
- CORS configured correctly
- Real data flows through system
- File uploads work
- Anomaly detection works
- Alerts system functional
- Maps and visualizations work

---

## Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Render Community**: https://community.render.com/
- **Vercel Community**: https://github.com/vercel/vercel/discussions

---

## Quick Commands Reference

### Local Development
```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install --legacy-peer-deps
npm run dev
```

### Deployment
```bash
# Push to GitHub (triggers auto-deploy)
git add .
git commit -m "Your message"
git push origin main
```

### Testing
```bash
# Test backend
curl https://gaia-backend.onrender.com/health
curl https://gaia-backend.onrender.com/api/anomalies

# Test frontend
# Visit in browser: https://your-project-name.vercel.app
```

---

**Status**: 🚀 Ready to Deploy!
**Time**: ~30 minutes total
**Difficulty**: Easy (GitHub integration handles everything)
**Result**: Production-ready GAIA 3.1 system

---

**Last Updated**: November 18, 2024
**Version**: 3.1.0
**Deployment Method**: GitHub Integration (Automated)
