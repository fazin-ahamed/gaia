# Render Session Pooler Configuration Guide

## What is a Session Pooler?

Render's PostgreSQL databases use **PgBouncer** as a session pooler to manage database connections efficiently. This is important for:
- Handling multiple concurrent connections
- Reducing connection overhead
- Better performance on free tier
- Connection pooling and reuse

## Connection Types

Render provides two connection strings:

### 1. Internal Database URL (Direct Connection)
```
postgresql://user:password@dpg-xxxxx-a/database
```
- Direct connection to PostgreSQL
- Use for migrations and admin tasks
- More reliable for schema changes

### 2. Session Pooler URL (Pooled Connection)
```
postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/database?sslmode=require
```
- Goes through PgBouncer
- Use for application runtime
- Better for handling many connections
- Required for free tier in production

## Configuration for GAIA

### For Migrations (Use Direct Connection)

When running migrations, use the **Internal Database URL** (direct connection):

```bash
# In Render environment or locally
DATABASE_URL=postgresql://user:pass@dpg-xxxxx-a/database
node migrate-and-seed.js
```

### For Application Runtime (Use Session Pooler)

When running the application, use the **Session Pooler URL**:

```bash
# In Render environment variables
DATABASE_URL=postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com/database?sslmode=require
```

## Render Dashboard Setup

### Step 1: Get Both URLs

1. Go to **Render Dashboard** → Your PostgreSQL Database
2. You'll see two connection strings:
   - **Internal Database URL** - for migrations
   - **External Database URL** - for session pooler

### Step 2: Configure Backend Service

**Option A: Use Session Pooler (Recommended for Production)**

1. Go to **Backend Service** → **Environment**
2. Add/Update:
   ```
   DATABASE_URL = (paste External Database URL with ?sslmode=require)
   ```

**Option B: Use Direct Connection (Simpler, but less scalable)**

1. Go to **Backend Service** → **Environment**
2. Add/Update:
   ```
   DATABASE_URL = (paste Internal Database URL)
   ```

### Step 3: Run Migration Separately

Since migrations need direct connection, run them separately:

1. **Temporarily change DATABASE_URL** to Internal URL
2. **Run migration** via Render Shell or locally
3. **Change DATABASE_URL back** to Session Pooler URL
4. **Restart service**

Or use a separate migration job (see below).

## Code Configuration

### Current Setup (Already Configured)

Our migration scripts and server.js are already configured with proper pool settings:

```javascript
// Pool configuration for session pooler
pool: {
  max: 5,        // Maximum connections
  min: 0,        // Minimum connections
  acquire: 30000, // Max time to get connection (30s)
  idle: 10000    // Max idle time (10s)
}
```

### SSL Configuration

```javascript
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
}
```

This is already set in:
- `backend/server.js`
- `backend/setup-database.js`
- `backend/migrate-and-seed.js`

## Deployment Strategies

### Strategy 1: Separate Migration Job (Recommended)

**render.yaml**:
```yaml
databases:
  - name: gaia-db
    databaseName: gaia
    user: gaia
    plan: free

services:
  # Migration Job (runs once)
  - type: worker
    name: gaia-migration
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && node migrate-and-seed.js && exit 0
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: gaia-db
          property: connectionString  # Uses internal URL
  
  # Main Backend Service
  - type: web
    name: gaia-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && node server.js
    envVars:
      - key: DATABASE_URL
        value: postgresql://user:pass@dpg-xxxxx.oregon-postgres.render.com/gaia?sslmode=require
      # ... other env vars
```

### Strategy 2: Manual Migration (Simpler)

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

Then run migration manually:
```bash
# In Render Shell
cd backend
node migrate-and-seed.js
```

### Strategy 3: Build-Time Migration (Current)

**render.yaml**:
```yaml
services:
  - type: web
    name: gaia-backend
    buildCommand: cd backend && npm install && npm run migrate:prod
    startCommand: cd backend && node server.js
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: gaia-db
          property: connectionString
```

This works but uses direct connection for both migration and runtime.

## Troubleshooting

### Error: "remaining connection slots reserved"

**Cause**: Too many connections, session pooler limit reached
**Fix**: 
- Reduce pool max: `max: 3`
- Ensure connections are properly closed
- Use session pooler URL

### Error: "prepared statement already exists"

**Cause**: PgBouncer doesn't support prepared statements in transaction mode
**Fix**: Add to DATABASE_URL:
```
?sslmode=require&statement_cache_size=0
```

### Error: "SSL required"

**Cause**: Missing SSL configuration
**Fix**: Already handled in code, ensure URL has `?sslmode=require`

### Error: "connection timeout"

**Cause**: Pool settings too aggressive
**Fix**: Increase acquire timeout:
```javascript
pool: {
  max: 5,
  min: 0,
  acquire: 60000,  // Increase to 60s
  idle: 10000
}
```

### Migration fails but app works

**Cause**: Using session pooler for migrations
**Fix**: Use Internal Database URL for migrations

## Best Practices

### 1. Use Different URLs for Different Purposes

```bash
# For migrations (direct)
MIGRATION_DATABASE_URL=postgresql://user:pass@dpg-xxxxx-a/database

# For application (pooled)
DATABASE_URL=postgresql://user:pass@dpg-xxxxx.oregon-postgres.render.com/database?sslmode=require
```

### 2. Keep Pool Size Small on Free Tier

```javascript
pool: {
  max: 3,  // Free tier has limited connections
  min: 0,
  acquire: 30000,
  idle: 10000
}
```

### 3. Always Close Connections

```javascript
// After operations
await sequelize.close();
```

### 4. Use Connection Retry Logic

```javascript
const sequelize = new Sequelize(DATABASE_URL, {
  retry: {
    max: 3,
    timeout: 5000
  }
});
```

## Environment Variables

### For Backend Service

```bash
# Use session pooler for production
DATABASE_URL=postgresql://user:pass@dpg-xxxxx.oregon-postgres.render.com/database?sslmode=require

# Or use internal for simplicity
DATABASE_URL=postgresql://user:pass@dpg-xxxxx-a/database

# Other required vars
NODE_ENV=production
DB_DIALECT=postgres
GEMINI_API_KEY=your_key
OPENROUTER_API_KEY=your_key
```

### For Migration Job

```bash
# Use internal/direct connection
DATABASE_URL=postgresql://user:pass@dpg-xxxxx-a/database
```

## Testing Connection

### Test Direct Connection
```bash
psql "postgresql://user:pass@dpg-xxxxx-a/database"
```

### Test Session Pooler
```bash
psql "postgresql://user:pass@dpg-xxxxx.oregon-postgres.render.com/database?sslmode=require"
```

### Test from Node
```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  },
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
});

sequelize.authenticate()
  .then(() => console.log('✓ Connected'))
  .catch(err => console.error('✗ Failed:', err.message));
```

## Quick Fix for Current Issue

Since you're using session pooler:

1. **Check your DATABASE_URL** in Render Dashboard
   - Should end with `.oregon-postgres.render.com/database`
   - Should have `?sslmode=require`

2. **If using internal URL**, that's fine too
   - Just make sure it's set in environment variables

3. **Run migration manually** after deployment:
   ```bash
   # In Render Shell
   cd backend
   node migrate-and-seed.js
   ```

4. **Don't run migration in build command** if using session pooler
   - Remove `&& npm run migrate:prod` from build command
   - Run migrations separately

## Summary

✅ **Session Pooler**: Better for production, handles many connections
✅ **Direct Connection**: Better for migrations, admin tasks
✅ **Our Code**: Already configured with proper pool settings
✅ **Recommendation**: Use direct connection for now (simpler)

---

**Last Updated**: November 18, 2024
**Status**: Session Pooler Support Added
