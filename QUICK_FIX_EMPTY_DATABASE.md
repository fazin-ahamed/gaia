# 🔧 Quick Fix: Empty Database Errors

## Problem
- `GET /api/anomalies` returns 500 error
- `GET /api/anomalies/hotspot-0` returns 400 error
- Dashboard shows no data

## Root Cause
The database is empty - no anomalies have been created yet.

## Quick Solution

### Option 1: Sync GDACS Disasters (Recommended)
This will populate the database with real global disaster data:

```bash
curl -X POST https://gaia-4jxk.onrender.com/api/realtime/sync-disasters
```

**Expected Result:**
```json
{
  "success": true,
  "synced": 5,
  "errors": 0,
  "savedAnomalies": [...]
}
```

### Option 2: Upload Test Anomaly
Upload a test file to create an anomaly:

```bash
# Create test file
echo "Emergency: Unusual activity detected" > test.txt

# Upload
curl -X POST https://gaia-4jxk.onrender.com/api/upload/analyze \
  -F "file=@test.txt" \
  -F "title=Test Anomaly" \
  -F "description=Testing system"
```

### Option 3: Run Fresh Database Setup
If on Render, trigger a redeploy which will run `fresh-db-setup.js`.

## Verify Fix

### Check if anomalies exist:
```bash
curl https://gaia-4jxk.onrender.com/api/anomalies
```

**Should return:**
```json
{
  "anomalies": [...],
  "pagination": {
    "totalItems": 5
  }
}
```

### Check dashboard:
1. Refresh the page
2. Should see anomalies in the feed
3. Clicking on them should work

## Why This Happens

The application expects anomalies to exist but:
1. Fresh database has no data
2. No seed data is created automatically
3. GDACS sync hasn't run yet

## Permanent Solution

Add automatic GDACS sync on server startup:

**In `backend/server.js`:**
```javascript
// After database initialization
if (process.env.NODE_ENV === 'production') {
  // Sync GDACS disasters on startup
  setTimeout(async () => {
    try {
      const { fetchGDACSEvents } = require('./services/externalAPIs');
      const events = await fetchGDACSEvents();
      console.log(`Found ${events.features?.length || 0} GDACS events`);
      // Trigger sync endpoint internally
    } catch (error) {
      console.error('GDACS startup sync failed:', error);
    }
  }, 5000); // Wait 5 seconds after startup
}
```

## Quick Commands

```bash
# 1. Sync GDACS (fastest)
curl -X POST https://gaia-4jxk.onrender.com/api/realtime/sync-disasters

# 2. Check if it worked
curl https://gaia-4jxk.onrender.com/api/anomalies | jq '.pagination.totalItems'

# 3. Refresh dashboard
# Open https://gaia-4jxk.onrender.com and refresh
```

## Status After Fix

✅ Database populated with real disasters
✅ Dashboard shows anomalies
✅ Clicking incidents works
✅ No more 500 errors

---

**Run this now:**
```bash
curl -X POST https://gaia-4jxk.onrender.com/api/realtime/sync-disasters
```

Then refresh your dashboard!
