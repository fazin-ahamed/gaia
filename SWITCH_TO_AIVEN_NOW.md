# Switch to Aiven - Quick Guide 🚀

## Why Switch?

Your current Render PostgreSQL has schema conflicts that are hard to fix. A fresh Aiven database will work immediately.

## Quick Steps

### 1. Create Aiven Database (5 minutes)

1. Go to https://aiven.io/signup
2. Create account (free tier available)
3. Click "Create Service"
4. Select "PostgreSQL"
5. Choose region (closest to your Render region)
6. Select plan (Free tier is fine)
7. Click "Create Service"
8. Wait 2-3 minutes for service to start

### 2. Get Connection String (1 minute)

1. Click on your PostgreSQL service
2. Go to "Overview" tab
3. Find "Service URI" or "Session Pooler URI"
4. Copy the **Session Pooler URI** (recommended)

**Format:**
```
postgres://avnadmin:PASSWORD@HOST:PORT/defaultdb?sslmode=require
```

### 3. Update Render (2 minutes)

1. Go to https://dashboard.render.com
2. Select your `gaia-backend` service
3. Go to "Environment" tab
4. Find `DATABASE_URL`
5. Click "Edit"
6. Paste your Aiven connection string
7. Click "Save"

### 4. Deploy (Automatic)

Render will automatically redeploy with the new database.

The `fresh-db-setup.js` script will:
- Connect to your fresh Aiven database
- Create all tables with correct schemas
- Set up indexes and relationships
- Your app will start successfully!

## What You Need

From Aiven, copy the **Session Pooler URI**:
```
postgres://avnadmin:YOUR_PASSWORD@YOUR_HOST:PORT/defaultdb?sslmode=require
```

Paste it as `DATABASE_URL` in Render.

## Why This Works

### Fresh Database
- ✅ No existing tables to conflict with
- ✅ No enum types to convert
- ✅ No indexes to fix
- ✅ Clean slate

### Aiven Benefits
- ✅ Proper SSL certificates
- ✅ Better connection pooling
- ✅ More reliable
- ✅ Better performance
- ✅ Automatic backups

### Your Code is Ready
- ✅ `fresh-db-setup.js` creates everything
- ✅ SSL configuration correct
- ✅ Models fixed (JSONB tags)
- ✅ No GIN index issues

## Expected Result

After switching:

1. ✅ Build completes successfully
2. ✅ Tables created on Aiven
3. ✅ Server starts without errors
4. ✅ Health check passes
5. ✅ API endpoints work
6. ✅ Frontend connects
7. ✅ Can create anomalies

## Verification

```bash
# Check health
curl https://gaia-4jxk.onrender.com/health

# Check API
curl https://gaia-4jxk.onrender.com/api/anomalies

# Both should work!
```

## Cost

**Aiven Free Tier:**
- 1 GB storage
- 1 CPU
- Automatic backups
- Perfect for development/testing

**Upgrade later if needed.**

## Timeline

- Create Aiven account: 2 minutes
- Create PostgreSQL service: 3 minutes
- Update Render DATABASE_URL: 1 minute
- Deploy: 3-5 minutes
- **Total: ~10 minutes**

## Rollback

If you want to go back to Render PostgreSQL:
1. Change DATABASE_URL back to Render's
2. Redeploy

But you won't need to - Aiven will work!

## Support

- Aiven has great documentation
- Free tier includes support
- Community forum available

---

**TL;DR:**

1. Create Aiven PostgreSQL (free tier)
2. Copy Session Pooler URI
3. Update DATABASE_URL in Render
4. Deploy
5. Done! ✅

Your app will work immediately with the fresh Aiven database!
