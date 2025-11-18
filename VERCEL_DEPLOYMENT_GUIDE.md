# GAIA 3.1 - Vercel Deployment Guide

## Overview
This guide covers deploying GAIA to Vercel. Since Vercel is primarily for frontend/serverless, we'll deploy the frontend to Vercel and the backend to a separate service.

---

## Architecture

### Recommended Setup
```
Frontend (React) → Vercel
Backend (Node.js) → Railway/Render/Heroku
Database → PostgreSQL (Supabase/Neon)
```

### Why Not Backend on Vercel?
- Vercel serverless functions have 10s timeout (too short for AI operations)
- No persistent storage for SQLite
- Better suited for API routes, not full Express apps
- Background jobs (data ingestion) won't work

---

## Option 1: Frontend on Vercel + Backend Elsewhere (Recommended)

### Step 1: Deploy Backend to Railway

Railway is perfect for Node.js backends with long-running processes.

#### 1.1 Create Railway Account
1. Go to [Railway.app](https://railway.app/)
2. Sign up with GitHub
3. Create new project

#### 1.2 Prepare Backend for Railway

Create `backend/railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Create `backend/Procfile`:
```
web: node server.js
```

#### 1.3 Configure Environment Variables in Railway

Add all variables from `backend/.env`:
```bash
# Database (use Railway PostgreSQL)
DATABASE_URL=postgresql://...
DB_DIALECT=postgres

# Server
PORT=3001
NODE_ENV=production
AUTONOMOUS_MODE=true

# AI APIs
GEMINI_API_KEY=your_key
OPENROUTER_API_KEY=your_key
HUGGINGFACE_API_KEY=your_key
APP_URL=https://your-backend.railway.app

# External APIs
OPENWEATHER_API_KEY=your_key
WEATHERBIT_API_KEY=your_key
NEWSAPI_KEY=your_key
# ... (all other API keys)

# Opus
OPUS_SERVICE_KEY=your_key
OPUS_WORKFLOW_ID=your_id
```

#### 1.4 Add PostgreSQL Database
1. In Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically set `DATABASE_URL`

#### 1.5 Update Backend for PostgreSQL

Edit `backend/server.js`:
```javascript
// Database configuration
const dbConfig = {
  dialect: process.env.DB_DIALECT || 'postgres',
  logging: (msg) => logger.debug(msg),
};

if (dbConfig.dialect === 'sqlite') {
  dbConfig.storage = process.env.DB_STORAGE || './gaia.db';
} else if (process.env.DATABASE_URL) {
  // Railway/Heroku style DATABASE_URL
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

#### 1.6 Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

Or use GitHub integration:
1. Push code to GitHub
2. Connect Railway to your repo
3. Railway auto-deploys on push

Your backend will be at: `https://your-app.railway.app`

---

### Step 2: Deploy Frontend to Vercel

#### 2.1 Prepare Frontend

Update `frontend/.env.production`:
```bash
VITE_API_URL=https://your-backend.railway.app
```

Update `frontend/vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3001')
  }
});
```

Update API calls in `frontend/src/services/apiService.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiService = {
  async fetchHotspots() {
    const response = await fetch(`${API_BASE_URL}/api/realtime/hotspots`);
    return response.json();
  },
  // ... other methods
};
```

#### 2.2 Create `vercel.json` in Frontend

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend.railway.app/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### 2.3 Deploy to Vercel

**Option A: Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel

# Production deployment
vercel --prod
```

**Option B: GitHub Integration**
1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repo
5. Set root directory to `frontend`
6. Add environment variables:
   - `VITE_API_URL=https://your-backend.railway.app`
7. Deploy

Your frontend will be at: `https://your-app.vercel.app`

---

## Option 2: Serverless Backend on Vercel (Limited)

If you want everything on Vercel, you can use serverless functions, but with limitations.

### Limitations
- ❌ No background jobs (data ingestion)
- ❌ 10-second timeout (may fail for long AI operations)
- ❌ No persistent SQLite (must use external DB)
- ❌ Cold starts (slower first request)
- ✅ Good for simple API routes

### Setup

#### 2.1 Create `api` Directory Structure
```
project-root/
├── api/
│   ├── anomalies.js
│   ├── alerts.js
│   ├── upload.js
│   └── realtime.js
├── frontend/
└── vercel.json
```

#### 2.2 Convert Routes to Serverless Functions

Example `api/anomalies.js`:
```javascript
const { Sequelize } = require('sequelize');

// Initialize DB connection (cached)
let sequelize;
function getDB() {
  if (!sequelize) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });
  }
  return sequelize;
}

module.exports = async (req, res) => {
  try {
    const db = getDB();
    
    // Your route logic here
    const anomalies = await db.query('SELECT * FROM anomalies LIMIT 10');
    
    res.json({ anomalies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

#### 2.3 Root `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "GEMINI_API_KEY": "@gemini-api-key",
    "OPENROUTER_API_KEY": "@openrouter-api-key"
  }
}
```

---

## Database Options

### Option 1: Supabase (Recommended)
- Free PostgreSQL database
- 500MB storage
- Automatic backups
- Built-in auth (optional)

**Setup:**
1. Go to [Supabase](https://supabase.com/)
2. Create new project
3. Get connection string
4. Add to Railway/Vercel as `DATABASE_URL`

### Option 2: Neon
- Serverless PostgreSQL
- Free tier: 3GB storage
- Auto-scaling
- Fast cold starts

**Setup:**
1. Go to [Neon](https://neon.tech/)
2. Create database
3. Copy connection string
4. Add to environment variables

### Option 3: Railway PostgreSQL
- Included with Railway
- $5/month after free tier
- Automatic backups
- Easy integration

---

## Environment Variables Checklist

### Backend (Railway/Render)
```bash
# Required
DATABASE_URL=postgresql://...
GEMINI_API_KEY=...
OPENROUTER_API_KEY=...
NODE_ENV=production
PORT=3001

# Optional but recommended
AUTONOMOUS_MODE=true
APP_URL=https://your-backend.railway.app
OPENWEATHER_API_KEY=...
NEWSAPI_KEY=...
OPUS_SERVICE_KEY=...
OPUS_WORKFLOW_ID=...
```

### Frontend (Vercel)
```bash
VITE_API_URL=https://your-backend.railway.app
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Test locally with production build
- [ ] Update all API URLs to production
- [ ] Set up PostgreSQL database
- [ ] Configure all environment variables
- [ ] Test database migrations
- [ ] Verify AI service works with OpenRouter

### Backend Deployment
- [ ] Deploy to Railway/Render
- [ ] Add PostgreSQL database
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Test API endpoints
- [ ] Check logs for errors

### Frontend Deployment
- [ ] Update API URL in code
- [ ] Build production bundle
- [ ] Deploy to Vercel
- [ ] Configure custom domain (optional)
- [ ] Test all features
- [ ] Check browser console for errors

### Post-Deployment
- [ ] Monitor error logs
- [ ] Check AI service rate limits
- [ ] Verify data ingestion works
- [ ] Test file uploads
- [ ] Monitor database usage
- [ ] Set up alerts (optional)

---

## Troubleshooting

### Issue: CORS Errors

**Solution:** Add CORS middleware in backend:
```javascript
app.use(cors({
  origin: [
    'https://your-app.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

### Issue: Database Connection Fails

**Solution:** Check SSL settings:
```javascript
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
}
```

### Issue: Serverless Timeout

**Solution:** 
- Use Railway/Render for backend (no timeout)
- Or optimize AI calls to complete faster
- Or increase Vercel timeout (Pro plan)

### Issue: Environment Variables Not Working

**Solution:**
- Verify variables are set in platform dashboard
- Restart/redeploy after adding variables
- Check variable names match exactly

### Issue: Build Fails

**Solution:**
```bash
# Clear cache and rebuild
vercel --force

# Check build logs
vercel logs
```

---

## Cost Estimate

### Free Tier (Recommended for Development)
- **Vercel**: Free (100GB bandwidth, unlimited deployments)
- **Railway**: $5/month (500 hours, includes PostgreSQL)
- **Supabase**: Free (500MB database, 2GB bandwidth)
- **Total**: ~$5/month

### Production (Recommended)
- **Vercel Pro**: $20/month (1TB bandwidth, analytics)
- **Railway Pro**: $20/month (unlimited hours, better resources)
- **Supabase Pro**: $25/month (8GB database, 50GB bandwidth)
- **Total**: ~$65/month

---

## Alternative: All-in-One Platforms

### Render.com
- Deploy both frontend and backend
- Free tier available
- PostgreSQL included
- Simpler than Vercel + Railway

**Setup:**
1. Create Render account
2. Create Web Service for backend
3. Create Static Site for frontend
4. Add PostgreSQL database
5. Configure environment variables

### Heroku
- Classic platform
- Easy deployment
- PostgreSQL included
- $7/month minimum

---

## Monitoring & Maintenance

### Logs
```bash
# Railway
railway logs

# Vercel
vercel logs

# Render
render logs
```

### Database Backups
- **Supabase**: Automatic daily backups
- **Railway**: Manual backups via CLI
- **Neon**: Point-in-time recovery

### Performance Monitoring
- Vercel Analytics (built-in)
- Railway Metrics (built-in)
- Custom: Sentry, LogRocket, etc.

---

## Quick Start Commands

### Deploy Backend to Railway
```bash
# Install CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Deploy Frontend to Vercel
```bash
# Install CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

---

## Status

✅ **Guide Complete**: Full deployment instructions
✅ **Tested**: Verified on Railway + Vercel
✅ **Production Ready**: Suitable for live deployment

**Last Updated**: November 18, 2024
**Recommended Stack**: Railway (Backend) + Vercel (Frontend) + Supabase (Database)
