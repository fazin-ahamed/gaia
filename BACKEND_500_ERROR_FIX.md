# Backend 500 Error Fix

## Problem
Production backend at `https://gaia-4jxk.onrender.com` is returning 500 errors for `/api/anomalies` endpoint.

## Error Details
```
GET https://gaia-4jxk.onrender.com/api/anomalies 500 (Internal Server Error)
```

## Root Cause
The anomalies route is trying to access database models with associations that aren't properly initialized:

```javascript
await global.models.Anomaly.findAndCountAll({
  include: [
    { model: global.models.ApiData, as: 'apiData' },
    { model: global.models.AuditLog, as: 'auditLogs' }
  ]
});
```

The database either:
1. Doesn't have the Anomalies table
2. Associations aren't set up correctly
3. Models aren't initialized properly

## Quick Fix Options

### Option 1: Seed the Database (Recommended)
The backend needs data in the database. Run the seed script:

1. **Access Render Shell** (if available):
   ```bash
   cd backend
   node seed-data.js
   ```

2. **Or connect to database directly**:
   - Get DATABASE_URL from Render environment variables
   - Connect with psql or database client
   - Run migrations and seed data

### Option 2: Fix the Anomalies Route
Simplify the route to not require associations:

**File**: `backend/routes/anomalies.js`

**Change line 73-91** from:
```javascript
const { count, rows } = await global.models.Anomaly.findAndCountAll({
  where: whereClause,
  limit: parseInt(limit),
  offset: parseInt(offset),
  order: [['timestamp', 'DESC']],
  include: [
    {
      model: global.models.ApiData,
      as: 'apiData',
      limit: 5,
      order: [['timestamp', 'DESC']]
    },
    {
      model: global.models.AuditLog,
      as: 'auditLogs',
      limit: 10,
      order: [['timestamp', 'DESC']]
    }
  ]
});
```

**To**:
```javascript
const { count, rows } = await global.models.Anomaly.findAndCountAll({
  where: whereClause,
  limit: parseInt(limit),
  offset: parseInt(offset),
  order: [['timestamp', 'DESC']]
});
```

### Option 3: Use Working Endpoint
The `/api/realtime/hotspots` endpoint is working. Frontend can use this instead.

## Immediate Solution

### Check Backend Logs
1. Go to Render Dashboard
2. Click on your backend service
3. Click "Logs"
4. Look for the actual error message

Common errors:
- `relation "Anomalies" does not exist` → Database not migrated
- `Cannot read property 'findAndCountAll' of undefined` → Models not initialized
- `Association error` → Model associations not set up

### Fix Based on Error

**If "relation does not exist":**
```bash
# Run migrations
cd backend
npx sequelize-cli db:migrate

# Seed data
node seed-data.js
```

**If "models not initialized":**
Check `backend/server.js` - models should be initialized before routes:
```javascript
// Initialize models
const models = require('./models');
global.models = models;

// Then load routes
app.use('/api/anomalies', require('./routes/anomalies'));
```

**If "association error":**
Check `backend/models/index.js` - associations should be defined:
```javascript
// Define associations
Anomaly.hasMany(ApiData, { as: 'apiData', foreignKey: 'anomalyId' });
Anomaly.hasMany(AuditLog, { as: 'auditLogs', foreignKey: 'anomalyId' });
```

## Frontend Workaround

While fixing backend, update frontend to handle errors gracefully:

**File**: `frontend/src/services/apiService.ts`

Add fallback logic:
```typescript
async fetchAnomalies() {
  try {
    const response = await fetch(`${this.baseUrl}/api/anomalies`);
    if (!response.ok) {
      // Fallback to hotspots if anomalies fails
      console.warn('Anomalies endpoint failed, using hotspots');
      return this.fetchHotspots();
    }
    return await response.json();
  } catch (error) {
    console.error('Anomalies API error:', error);
    // Return empty array instead of throwing
    return { anomalies: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0 } };
  }
}
```

## Testing

### Test Health Endpoint
```bash
curl https://gaia-4jxk.onrender.com/health
```

**Expected**:
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

### Test Anomalies Endpoint
```bash
curl https://gaia-4jxk.onrender.com/api/anomalies
```

**Expected** (after fix):
```json
{
  "anomalies": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 8
  }
}
```

### Test Hotspots (Working)
```bash
curl https://gaia-4jxk.onrender.com/api/realtime/hotspots
```

**Expected**:
```json
[
  {
    "name": "New York",
    "lat": 40.7128,
    "lon": -74.0060,
    "data": {...},
    "analysis": {...},
    "severity": "Medium"
  },
  ...
]
```

## Steps to Fix Production

### 1. Check Render Logs
```
Render Dashboard → Your Service → Logs
```

Look for the specific error message.

### 2. Check Environment Variables
Ensure these are set:
- `DATABASE_URL` - PostgreSQL connection string
- `DB_DIALECT` - Should be `postgres`
- `NODE_ENV` - Should be `production`

### 3. Check Database
```bash
# Connect to database
psql $DATABASE_URL

# Check if tables exist
\dt

# Check Anomalies table
SELECT * FROM "Anomalies" LIMIT 1;
```

### 4. Run Migrations (if needed)
If tables don't exist:
```bash
cd backend
npx sequelize-cli db:migrate
```

### 5. Seed Data
```bash
cd backend
node seed-data.js
```

### 6. Restart Service
Render Dashboard → Your Service → Manual Deploy → Deploy latest commit

## Prevention

### Add Health Check for Models
**File**: `backend/server.js`

```javascript
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    
    // Test models
    const anomalyCount = await global.models.Anomaly.count();
    
    res.json({
      status: 'OK',
      timestamp: new Date(),
      services: {
        database: 'connected',
        models: 'initialized',
        anomalies: anomalyCount
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message
    });
  }
});
```

### Add Error Handling
**File**: `backend/routes/anomalies.js`

```javascript
router.get('/', async (req, res) => {
  try {
    // Check if models are initialized
    if (!global.models || !global.models.Anomaly) {
      return res.status(503).json({ 
        error: 'Service unavailable - models not initialized' 
      });
    }

    // Rest of the code...
  } catch (error) {
    logger.error('Error fetching anomalies:', error);
    res.status(500).json({ 
      error: 'Failed to fetch anomalies',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
```

## Status

❌ **Current**: `/api/anomalies` returning 500 errors
✅ **Working**: `/api/realtime/hotspots` endpoint functional
⏳ **Action Needed**: Check Render logs and fix database/models

## Next Steps

1. **Immediate**: Check Render logs for specific error
2. **Short-term**: Seed database or fix models
3. **Long-term**: Add better error handling and health checks

---

**Last Updated**: November 18, 2024
**Priority**: High
**Impact**: Frontend can't load anomaly data
