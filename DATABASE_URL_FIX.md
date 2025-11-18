# DATABASE_URL Not Set - Fix Guide

## Error
```
TypeError [ERR_INVALID_ARG_TYPE]: The "url" argument must be of type string. Received undefined
```

## Problem
The `DATABASE_URL` environment variable is not set in your Render environment, so the migration script cannot connect to the database.

## Solution

### On Render

#### Step 1: Get Your Database URL

1. **Go to Render Dashboard**
2. **Click on your PostgreSQL database** (e.g., `gaia-db`)
3. **Copy the "Internal Database URL"**
   - It looks like: `postgresql://gaia:xxxxx@dpg-xxxxx-a/gaia`
   - This is the URL your backend service should use

#### Step 2: Add DATABASE_URL to Backend Service

1. **Go to your backend web service** (e.g., `gaia-backend`)
2. **Click "Environment"** in the left sidebar
3. **Click "Add Environment Variable"**
4. **Add**:
   ```
   Key: DATABASE_URL
   Value: postgresql://gaia:xxxxx@dpg-xxxxx-a/gaia
   ```
   (Paste the Internal Database URL you copied)
5. **Click "Save Changes"**

#### Step 3: Redeploy

The service will automatically redeploy with the new environment variable.

### Alternative: Don't Run Migration in Build

If you don't want to run migration during build, update your build command:

**Current** (in render.yaml or Render Dashboard):
```
cd backend && npm install && npm run migrate:prod
```

**Change to**:
```
cd backend && npm install
```

Then run the migration manually after deployment.

---

## Manual Migration After Deployment

### Option 1: Using Render Shell (if available)

1. **Go to Render Dashboard** → Your Service
2. **Click "Shell"** tab
3. **Run**:
   ```bash
   cd backend
   node migrate-and-seed.js
   ```

### Option 2: Connect Locally to Production Database

1. **Get External Database URL** from Render Dashboard
2. **Set it locally**:
   ```bash
   export DATABASE_URL="postgresql://user:pass@host/db"
   ```
3. **Run migration**:
   ```bash
   cd backend
   node migrate-and-seed.js
   ```

### Option 3: Use Database Client

1. **Get External Database URL**
2. **Connect with psql**:
   ```bash
   psql "postgresql://user:pass@host/db"
   ```
3. **Create tables manually** or run SQL from migration

---

## Verify DATABASE_URL is Set

### In Render Dashboard

1. Go to your backend service
2. Click "Environment"
3. Look for `DATABASE_URL` in the list
4. Should show: `postgresql://...` (value is hidden for security)

### Test Connection

After setting DATABASE_URL, test the connection:

```bash
# In Render Shell or locally with DATABASE_URL set
node -e "const {Sequelize} = require('sequelize'); const s = new Sequelize(process.env.DATABASE_URL, {dialect:'postgres',dialectOptions:{ssl:{require:true,rejectUnauthorized:false}}}); s.authenticate().then(() => console.log('✓ Connected')).catch(e => console.error('✗ Failed:', e.message));"
```

---

## Environment Variables Checklist

### Required for Backend

```bash
# Database (choose one method)
DATABASE_URL=postgresql://user:password@host:port/database

# OR individual variables
DB_NAME=gaia
DB_USER=gaia
DB_PASSWORD=your_password
DB_HOST=dpg-xxxxx-a
DB_PORT=5432
DB_DIALECT=postgres

# AI Services
GEMINI_API_KEY=your_gemini_key
OPENROUTER_API_KEY=your_openrouter_key

# Optional
AUTONOMOUS_MODE=true
NODE_ENV=production
PORT=10000
```

### How to Get Database URL

**Internal URL** (for backend service):
- Render Dashboard → Your Database → "Internal Database URL"
- Format: `postgresql://user:pass@dpg-xxxxx-a/dbname`
- Use this for your backend service

**External URL** (for local connections):
- Render Dashboard → Your Database → "External Database URL"
- Format: `postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com/dbname`
- Use this for connecting from your local machine

---

## Updated Build Commands

### Recommended: Skip Migration in Build

**render.yaml**:
```yaml
services:
  - type: web
    name: gaia-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && node server.js
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: gaia-db
          property: connectionString
```

Then run migration manually after first deployment.

### Alternative: Run Migration in Build

**render.yaml**:
```yaml
services:
  - type: web
    name: gaia-backend
    env: node
    buildCommand: cd backend && npm install && npm run migrate:prod
    startCommand: cd backend && node server.js
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: gaia-db
          property: connectionString
```

This requires DATABASE_URL to be set before build.

---

## Troubleshooting

### Error: "DATABASE_URL is not set"

**Cause**: Environment variable not configured
**Fix**: Add DATABASE_URL in Render Dashboard → Environment

### Error: "connect ECONNREFUSED"

**Cause**: Using External URL instead of Internal URL
**Fix**: Use Internal Database URL for backend service

### Error: "SSL required"

**Cause**: SSL not configured in connection
**Fix**: Already handled in migration scripts (ssl: { require: true })

### Error: "password authentication failed"

**Cause**: Wrong credentials in DATABASE_URL
**Fix**: Copy the correct URL from Render Dashboard

### Migration runs but tables not created

**Cause**: Migration script error or database permissions
**Fix**: Check Render logs for specific error message

---

## Quick Fix Steps

1. **Get Database URL**:
   - Render Dashboard → Database → Internal Database URL
   - Copy it

2. **Add to Backend**:
   - Render Dashboard → Backend Service → Environment
   - Add: `DATABASE_URL` = (paste URL)
   - Save

3. **Redeploy**:
   - Automatic after saving environment variable
   - Or click "Manual Deploy"

4. **Verify**:
   ```bash
   curl https://gaia-backend.onrender.com/health
   ```

5. **Run Migration** (if not in build):
   - Render Shell: `cd backend && node migrate-and-seed.js`
   - Or locally with DATABASE_URL set

---

## render.yaml Example

Complete example with DATABASE_URL:

```yaml
databases:
  - name: gaia-db
    databaseName: gaia
    user: gaia
    plan: free

services:
  - type: web
    name: gaia-backend
    env: node
    region: oregon
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DATABASE_URL
        fromDatabase:
          name: gaia-db
          property: connectionString
      - key: DB_DIALECT
        value: postgres
      - key: GEMINI_API_KEY
        sync: false
      - key: OPENROUTER_API_KEY
        sync: false
      - key: AUTONOMOUS_MODE
        value: true
```

The `fromDatabase` section automatically sets DATABASE_URL from your database.

---

## Status After Fix

✅ DATABASE_URL set in environment
✅ Migration script can connect
✅ Tables created successfully
✅ Backend starts without errors
✅ API endpoints work

---

**Last Updated**: November 18, 2024
**Priority**: Critical
**Status**: Fix Available
