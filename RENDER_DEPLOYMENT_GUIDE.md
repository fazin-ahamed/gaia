# GAIA 3.1 - Render Deployment Guide

## Overview
Deploy GAIA backend to Render.com - a simple, reliable platform with free tier and built-in PostgreSQL.

**Stack:**
- Backend: Render Web Service
- Database: Render PostgreSQL
- Frontend: Vercel

---

## Step-by-Step Deployment

### Step 1: Prepare Your Code

#### 1.1 Create `render.yaml` in Project Root

```yaml
services:
  # Backend Web Service
  - type: web
    name: gaia-backend
    env: node
    region: oregon
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && node server.js
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: AUTONOMOUS_MODE
        value: true
      - key: DB_DIALECT
        value: postgres
      - key: GEMINI_API_KEY
        sync: false
      - key: OPENROUTER_API_KEY
        sync: false
      - key: HUGGINGFACE_API_KEY
        sync: false
      - key: OPENWEATHER_API_KEY
        sync: false
      - key: NEWSAPI_KEY
        sync: false
      - key: OPUS_SERVICE_KEY
        sync: false
      - key: OPUS_WORKFLOW_ID
        sync: false
      - key: DATABASE_URL
        fromDatabase:
          name: gaia-db
          property: connectionString

databases:
  # PostgreSQL Database
  - name: gaia-db
    databaseName: gaia
    user: gaia
    plan: free
    region: oregon
```

#### 1.2 Update `backend/server.js` for Render

Add this after the database configuration:

```javascript
// Database connection - Support both PostgreSQL and SQLite
const dbConfig = {
  dialect: process.env.DB_DIALECT || 'postgres',
  logging: (msg) => logger.debug(msg),
};

if (dbConfig.dialect === 'sqlite') {
  dbConfig.storage = process.env.DB_STORAGE || './gaia.db';
} else if (process.env.DATABASE_URL) {
  // Render/Railway/Heroku style DATABASE_URL
  dbConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
} else {
  dbConfig.host = process.env.DB_HOST || 'localhost';
  dbConfig.port = process.env.DB_PORT || 5432;
  dbConfig.database = process.env.DB_NAME || 'gaia_db';
  dbConfig.username = process.env.DB_USER || 'postgres';
  dbConfig.password = process.env.DB_PASSWORD || '';
}

const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, dbConfig)
  : new Sequelize(dbConfig);
```

#### 1.3 Update CORS for Production

In `backend/server.js`, update CORS:

```javascript
app.use(cors({
  origin: [
    'https://your-app.vercel.app', // Replace with your Vercel URL
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));
```

#### 1.4 Create `backend/package.json` Scripts

Make sure these scripts exist:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

### Step 2: Deploy to Render

#### Option A: Using Render Dashboard (Recommended)

1. **Create Render Account**
   - Go to [render.com](https://render.com/)
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Name: `gaia-db`
   - Database: `gaia`
   - User: `gaia`
   - Region: Oregon (or closest to you)
   - Plan: Free
   - Click "Create Database"
   - **Save the connection details** (you'll need them)

3. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Name: `gaia-backend`
   - Region: Oregon (same as database)
   - Branch: `main`
   - Root Directory: Leave empty (or `backend` if monorepo)
   - Runtime: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node server.js`
   - Plan: Free
   - Click "Create Web Service"

4. **Add Environment Variables**
   
   In the Render dashboard, go to your web service → Environment:

   ```bash
   # Required
   NODE_ENV=production
   PORT=10000
   DB_DIALECT=postgres
   DATABASE_URL=<paste from PostgreSQL dashboard>
   
   # AI Services
   GEMINI_API_KEY=your_gemini_key
   OPENROUTER_API_KEY=your_openrouter_key
   HUGGINGFACE_API_KEY=your_huggingface_key
   APP_URL=https://gaia-backend.onrender.com
   
   # System
   AUTONOMOUS_MODE=true
   
   # External APIs (Optional)
   OPENWEATHER_API_KEY=your_key
   WEATHERBIT_API_KEY=your_key
   NEWSAPI_KEY=your_key
   NOAA_API_KEY=your_key
   OPENAQ_API_KEY=your_key
   AQICN_API_KEY=your_key
   
   # Opus Workflow
   OPUS_SERVICE_KEY=your_key
   OPUS_WORKFLOW_ID=your_id
   ```

5. **Deploy**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for build to complete (5-10 minutes)
   - Your backend will be at: `https://gaia-backend.onrender.com`

#### Option B: Using `render.yaml` (Automatic)

1. **Push `render.yaml` to GitHub**
   ```bash
   git add render.yaml
   git commit -m "Add Render configuration"
   git push
   ```

2. **Create Blueprint in Render**
   - Go to Render Dashboard
   - Click "New +" → "Blueprint"
   - Connect your GitHub repo
   - Render will detect `render.yaml`
   - Click "Apply"
   - Add environment variables in dashboard
   - Deploy

---

### Step 3: Verify Deployment

#### 3.1 Check Health Endpoint

```bash
curl https://gaia-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-11-18T10:00:00Z",
  "services": {
    "database": "connected",
    "gemini": "initialized"
  }
}
```

#### 3.2 Test API Endpoints

```bash
# Test anomalies endpoint
curl https://gaia-backend.onrender.com/api/anomalies

# Test AI status
curl https://gaia-backend.onrender.com/api/ai/status

# Test hotspots
curl https://gaia-backend.onrender.com/api/realtime/hotspots
```

#### 3.3 Check Logs

In Render Dashboard:
- Go to your web service
- Click "Logs" tab
- Look for:
  - ✅ "GAIA Backend server is running on port 10000"
  - ✅ "Database connection has been established successfully"
  - ✅ "Gemini AI initialized successfully"
  - ✅ "GAIA Backend initialized successfully"

---

### Step 4: Deploy Frontend to Vercel

#### 4.1 Update Frontend Environment

Create `frontend/.env.production`:

```bash
VITE_API_URL=https://gaia-backend.onrender.com
```

#### 4.2 Update API Service

In `frontend/src/services/apiService.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiService = {
  async fetchHotspots() {
    const response = await fetch(`${API_BASE_URL}/api/realtime/hotspots`);
    return response.json();
  },
  // ... rest of methods
};
```

#### 4.3 Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Go to frontend directory
cd frontend

# Deploy
vercel --prod
```

Or use Vercel Dashboard:
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repo
4. Set root directory to `frontend`
5. Add environment variable:
   - `VITE_API_URL=https://gaia-backend.onrender.com`
6. Deploy

---

## Render Configuration Details

### Free Tier Limits
- ✅ 750 hours/month (enough for 1 service 24/7)
- ✅ 512 MB RAM
- ✅ 0.1 CPU
- ✅ Automatic SSL
- ✅ Custom domains
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ Cold start: 30-60 seconds

### PostgreSQL Free Tier
- ✅ 1 GB storage
- ✅ Automatic backups (7 days)
- ✅ SSL connections
- ✅ 97 connections
- ⚠️ Expires after 90 days (must upgrade or recreate)

### Paid Plans (When You Need More)
- **Starter**: $7/month (no spin down, 512 MB RAM)
- **Standard**: $25/month (2 GB RAM, better performance)
- **Pro**: $85/month (4 GB RAM, priority support)

---

## Important Render-Specific Configurations

### 1. Handle Cold Starts

Add a keep-alive service (optional):

Create `backend/keep-alive.js`:
```javascript
const https = require('https');

// Ping every 14 minutes to prevent spin down
setInterval(() => {
  https.get('https://gaia-backend.onrender.com/health', (res) => {
    console.log('Keep-alive ping:', res.statusCode);
  });
}, 14 * 60 * 1000);
```

Add to `server.js`:
```javascript
if (process.env.NODE_ENV === 'production') {
  require('./keep-alive');
}
```

### 2. Database Connection Pooling

Update `backend/server.js`:
```javascript
const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, {
      ...dbConfig,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    })
  : new Sequelize(dbConfig);
```

### 3. Logging for Render

Render captures stdout/stderr automatically. Make sure Winston logs to console:

```javascript
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

---

## Troubleshooting

### Issue: Service Won't Start

**Check:**
1. Build logs in Render dashboard
2. Verify `package.json` has correct start script
3. Check all environment variables are set
4. Verify DATABASE_URL is correct

**Solution:**
```bash
# Test locally with production settings
NODE_ENV=production DATABASE_URL=your_db_url node server.js
```

### Issue: Database Connection Failed

**Check:**
1. DATABASE_URL is set correctly
2. SSL is enabled in code
3. Database is in same region as web service

**Solution:**
```javascript
// Add to sequelize config
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
}
```

### Issue: Cold Start Too Slow

**Solutions:**
1. Upgrade to Starter plan ($7/month) - no spin down
2. Use keep-alive script (see above)
3. Accept 30-60s first load (free tier limitation)

### Issue: CORS Errors

**Solution:**
Update CORS in `backend/server.js`:
```javascript
app.use(cors({
  origin: [
    'https://your-app.vercel.app',
    'https://gaia-backend.onrender.com',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

### Issue: Environment Variables Not Working

**Solution:**
1. Go to Render Dashboard → Your Service → Environment
2. Click "Add Environment Variable"
3. Add each variable manually
4. Click "Save Changes"
5. Service will auto-redeploy

### Issue: Build Fails

**Common causes:**
- Missing dependencies in `package.json`
- Wrong build command
- Node version mismatch

**Solution:**
Add `.node-version` file in backend:
```
18.17.0
```

Or specify in `render.yaml`:
```yaml
services:
  - type: web
    name: gaia-backend
    env: node
    nodeVersion: 18.17.0
```

---

## Monitoring & Maintenance

### View Logs
```bash
# Real-time logs in dashboard
Render Dashboard → Your Service → Logs

# Or use Render CLI
npm install -g @render/cli
render login
render logs gaia-backend
```

### Database Backups
- Automatic daily backups (7 days retention)
- Manual backup: Dashboard → Database → Backups → Create Backup
- Download backup: Click backup → Download

### Performance Monitoring
- Render Dashboard shows:
  - CPU usage
  - Memory usage
  - Request count
  - Response times

### Alerts
Set up in Render Dashboard:
- Email notifications for:
  - Deploy failures
  - Service crashes
  - High resource usage

---

## Upgrade Path

### When to Upgrade

**Upgrade to Starter ($7/month) when:**
- Cold starts are annoying users
- Need 24/7 availability
- Want faster response times

**Upgrade to Standard ($25/month) when:**
- Need more RAM (2 GB)
- Higher traffic (>10k requests/day)
- Need better performance

**Upgrade Database ($7/month) when:**
- Need more than 1 GB storage
- Want longer backup retention
- Need more connections

---

## Complete Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] `render.yaml` created (optional)
- [ ] Database configuration updated for PostgreSQL
- [ ] CORS configured for production URLs
- [ ] Environment variables documented

### Render Setup
- [ ] Render account created
- [ ] PostgreSQL database created
- [ ] Database connection string saved
- [ ] Web service created
- [ ] All environment variables added
- [ ] Service deployed successfully

### Verification
- [ ] Health endpoint responds
- [ ] Database connected
- [ ] AI service initialized
- [ ] API endpoints working
- [ ] Logs show no errors
- [ ] Frontend can connect to backend

### Frontend Setup
- [ ] API URL updated to Render URL
- [ ] Deployed to Vercel
- [ ] CORS working
- [ ] All features tested
- [ ] No console errors

### Post-Deployment
- [ ] Monitor logs for 24 hours
- [ ] Test all major features
- [ ] Check database is populating
- [ ] Verify AI service working
- [ ] Set up monitoring/alerts

---

## Quick Commands Reference

### Deploy Backend
```bash
# Push to GitHub (triggers auto-deploy)
git add .
git commit -m "Deploy to Render"
git push origin main
```

### Deploy Frontend
```bash
cd frontend
vercel --prod
```

### Check Status
```bash
# Backend health
curl https://gaia-backend.onrender.com/health

# AI service status
curl https://gaia-backend.onrender.com/api/ai/status

# Database test
curl https://gaia-backend.onrender.com/api/anomalies
```

### View Logs
```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# View logs
render logs gaia-backend --tail
```

---

## Cost Summary

### Free Tier (Development)
- Render Web Service: Free
- Render PostgreSQL: Free (90 days)
- Vercel: Free
- **Total: $0/month**

### Recommended Production
- Render Starter: $7/month (no spin down)
- Render PostgreSQL: $7/month (persistent)
- Vercel: Free
- **Total: $14/month**

### High-Traffic Production
- Render Standard: $25/month
- Render PostgreSQL Pro: $20/month
- Vercel Pro: $20/month
- **Total: $65/month**

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Render Status**: https://status.render.com/
- **Community**: https://community.render.com/
- **Support**: support@render.com

---

## Status

✅ **Complete**: Full Render deployment guide
✅ **Tested**: Verified on Render free tier
✅ **Production Ready**: Suitable for live deployment

**Last Updated**: November 18, 2024
**Recommended**: Render (Backend) + Vercel (Frontend)
**Cost**: Free tier available, $14/month for production
