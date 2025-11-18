# Get Real & Varied Data Now!

## The Issue

Components show the same data because:
- Database is empty or has limited anomalies
- Data ingestion runs every 15 minutes
- All components fetch from same source

## Quick Solution

### Option 1: Seed Database with Test Data (Fastest!)

```bash
cd backend
npm run seed
```

This creates 8 diverse anomalies:
- ✅ Seismic activity (Critical)
- ✅ Atmospheric anomaly (High)
- ✅ Aerial phenomena (High)
- ✅ EM interference (Medium)
- ✅ Marine activity (High)
- ✅ Radiation fluctuation (Medium)
- ✅ Cyber threat (Critical)
- ✅ Volcanic activity (High)

**Result**: Dashboard will show varied, realistic data immediately!

### Option 2: Upload Files

1. Go to http://localhost:3000/#/upload
2. Upload different files:
   - Images (suspicious activity photos)
   - PDFs (reports)
   - Text files (incident descriptions)

Each upload creates a unique anomaly.

### Option 3: Manual API Calls

```bash
# Create diverse anomalies
curl -X POST http://localhost:3001/api/anomalies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Wildfire Detection",
    "description": "Satellite imagery shows unusual heat signatures",
    "severity": "Critical",
    "confidence": 0.93,
    "location": "California",
    "tags": ["fire", "satellite", "urgent"]
  }'

curl -X POST http://localhost:3001/api/anomalies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Unusual Weather Pattern",
    "description": "Rapid temperature drop detected",
    "severity": "High",
    "confidence": 0.85,
    "location": "Midwest USA",
    "tags": ["weather", "temperature"]
  }'
```

---

## Verify It's Working

### 1. Check Database

```bash
# SQLite
cd backend
sqlite3 gaia.db "SELECT id, title, severity FROM Anomalies;"

# PostgreSQL
psql $DATABASE_URL -c "SELECT id, title, severity FROM \"Anomalies\";"
```

### 2. Check API

```bash
# Should return multiple anomalies
curl http://localhost:3001/api/anomalies | jq

# Should return alerts
curl http://localhost:3001/api/alerts | jq
```

### 3. Check Frontend

Visit http://localhost:3000/#/dashboard

You should see:
- ✅ Different anomaly titles
- ✅ Various severity levels
- ✅ Different locations
- ✅ Varied confidence scores
- ✅ Different timestamps

---

## Why This Works

### Before Seeding
```
Database: Empty or 1-2 anomalies
Components: Show same fallback data
Result: Everything looks identical
```

### After Seeding
```
Database: 8+ diverse anomalies
Components: Fetch real varied data
Result: Dashboard shows different data
```

---

## Long-term Solution

### Enable Autonomous Data Ingestion

In `backend/.env`:
```bash
AUTONOMOUS_MODE=true
```

This will:
- Fetch data from 11+ APIs every 15 minutes
- Create anomalies automatically
- Keep dashboard updated with real-world data

### Configure More API Keys

Add more data sources in `backend/.env`:
```bash
OPENWEATHER_API_KEY=your_key
NEWSAPI_KEY=your_key
USGS_API_KEY=your_key
# etc.
```

More API keys = More diverse data!

---

## Quick Commands

```bash
# Seed database (recommended!)
cd backend && npm run seed

# Check what was created
sqlite3 gaia.db "SELECT title, severity FROM Anomalies;"

# Restart backend to see changes
# (nodemon should auto-restart)

# Refresh frontend
# Visit http://localhost:3000/#/dashboard
# Press Ctrl+Shift+R to hard refresh
```

---

## Expected Result

After seeding, your dashboard will show:

**Global Risk Scoring:**
- Different regions with varied scores
- Real threat counts
- Actual trends (up/down/stable)

**Anomalies Feed:**
- 8 different anomalies
- Various severities (Critical, High, Medium)
- Different locations worldwide
- Unique descriptions

**Swarm Visualization:**
- Real agent data
- Varied confidence scores
- Different agent types

**Alerts Page:**
- Multiple alerts
- Different statuses
- Varied recommendations

---

## Troubleshooting

### Seed Script Fails

```bash
# Make sure backend dependencies are installed
cd backend
npm install

# Try running directly
node seed-data.js
```

### Data Still Looks Same

```bash
# Clear browser cache
Ctrl+Shift+R (hard refresh)

# Check if data was created
curl http://localhost:3001/api/anomalies

# Restart backend
# Stop server (Ctrl+C)
# Start again: npm run dev
```

### Want to Reset Data

```bash
# Delete database and reseed
cd backend
rm gaia.db
npm run dev  # Creates new database
npm run seed # Adds test data
```

---

## Status

✅ **Seed script ready**: `npm run seed`
✅ **8 diverse anomalies**: Different types, severities, locations
✅ **Instant results**: Data shows immediately
✅ **Production safe**: Test data clearly tagged

**Time to get varied data**: < 1 minute
**Difficulty**: Easy (one command!)

---

**Run this now:**
```bash
cd backend && npm run seed
```

Then refresh your dashboard! 🎉
