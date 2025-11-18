# GAIA 3.1 - Real Data Integration Status

## Current Status

### ✅ Components Using Real Data

All major components now fetch real data from the backend API:

1. **UserDashboardEnhanced** - Fetches from `/api/realtime/hotspots`
2. **AlertsDeliveryPage** - Fetches from `/api/alerts`
3. **GlobalRiskScoring** - Fetches from `/api/realtime/hotspots`
4. **SwarmVisualization** - Fetches from `/api/realtime/hotspots`
5. **IncidentDetailsEnhanced** - Fetches from `/api/anomalies/:id`

### Why Data Looks the Same

The components show similar data because:

1. **Same Data Source**: All components fetch from the same hotspots/anomalies
2. **Limited API Data**: Backend may not have enough diverse anomalies yet
3. **Data Ingestion Frequency**: Runs every 15 minutes (reduced to save API calls)
4. **Fallback Data**: Components show demo data if API fails

---

## How to Get More Varied Data

### Option 1: Increase Data Ingestion Frequency

Edit `backend/server.js`:

```javascript
// Change from every 15 minutes to every 5 minutes
cron.schedule('*/5 * * * *', () => {
  startDataIngestion();
});
```

**Pros:** More frequent updates
**Cons:** Uses more AI API calls (may hit rate limits)

### Option 2: Manually Create Anomalies

Use the upload feature to create diverse anomalies:

```bash
# Upload different types of files
curl -X POST http://localhost:3001/api/upload/analyze \
  -F "file=@image1.jpg" \
  -F "description=Suspicious activity"

curl -X POST http://localhost:3001/api/upload/analyze-text \
  -H "Content-Type: application/json" \
  -d '{"text":"Unusual seismic activity detected"}'
```

### Option 3: Trigger Manual Data Ingestion

```bash
# Manually trigger data collection
curl -X POST http://localhost:3001/api/realtime/data
```

### Option 4: Add More API Sources

Edit `backend/services/dataIngestion.js` to add more diverse data sources.

---

## Data Flow

```
External APIs → Data Ingestion → Database → Backend API → Frontend Components
     ↓              ↓                ↓           ↓              ↓
  11+ APIs    Every 15 min      PostgreSQL   REST/WS      Real-time UI
```

### Current Data Sources

1. **Weather**: OpenWeatherMap, Weatherbit
2. **News**: NewsAPI, GDELT
3. **Disasters**: USGS Earthquakes, NASA EONET
4. **Social**: Reddit
5. **Environmental**: AirVisual
6. **Traffic**: TomTom (optional)

---

## Verify Real Data is Working

### 1. Check Backend Logs

```bash
# Look for data ingestion logs
tail -f backend/combined.log | grep "Data ingestion"
```

Expected output:
```
info: Starting autonomous data ingestion cycle
info: Collected data from 2 APIs
info: Data ingestion cycle completed. Processed 2 data points
```

### 2. Check Database

```bash
# SQLite
sqlite3 backend/gaia.db "SELECT COUNT(*) FROM Anomalies;"
sqlite3 backend/gaia.db "SELECT COUNT(*) FROM ApiData;"

# PostgreSQL
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Anomalies\";"
```

### 3. Test API Endpoints

```bash
# Check hotspots
curl http://localhost:3001/api/realtime/hotspots

# Check anomalies
curl http://localhost:3001/api/anomalies

# Check alerts
curl http://localhost:3001/api/alerts
```

### 4. Check Frontend Console

Open browser console (F12) and look for:
- API calls to backend
- Data being fetched
- Any errors

---

## Why Components Show Fallback Data

### GlobalRiskScoring

```typescript
const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([
  { region: 'North America', score: 67, ... }, // Fallback data
  // ...
]);
```

**Reason**: Starts with fallback, updates when API returns data

**Fix**: Wait for data ingestion to populate database

### SwarmVisualization

```typescript
const [agents, setAgents] = useState<Agent[]>([
  { id: 'text-001', type: 'text', ... }, // Fallback data
  // ...
]);
```

**Reason**: Shows demo agents until real data arrives

**Fix**: Upload files or wait for data ingestion

---

## How to Force Real Data

### 1. Disable Fallback Data

Edit components to show loading state instead of fallback:

```typescript
const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);
const [loading, setLoading] = useState(true);

// Show loading spinner until real data arrives
if (loading) {
  return <div>Loading real data...</div>;
}
```

### 2. Add Data Validation

```typescript
const fetchRiskData = async () => {
  const hotspots = await apiService.fetchHotspots();
  
  // Only update if we have real data
  if (hotspots && hotspots.length > 0) {
    setRiskMetrics(processHotspots(hotspots));
    setLoading(false);
  }
};
```

### 3. Show Data Source Indicator

Add indicator showing if data is real or fallback:

```typescript
<div className="text-xs text-gray-500">
  {dataSource === 'api' ? '✅ Real-time data' : '⚠️ Demo data'}
</div>
```

---

## Troubleshooting

### Issue: No Data in Database

**Check:**
1. Is autonomous mode enabled? (`AUTONOMOUS_MODE=true`)
2. Are API keys configured?
3. Check backend logs for errors

**Solution:**
```bash
# Manually trigger data ingestion
curl -X POST http://localhost:3001/api/realtime/data
```

### Issue: API Returns Empty Array

**Check:**
1. Database has anomalies: `SELECT * FROM Anomalies;`
2. Backend is running
3. CORS is configured

**Solution:**
```bash
# Create test anomaly
curl -X POST http://localhost:3001/api/anomalies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Anomaly",
    "description": "Test description",
    "severity": "High",
    "confidence": 0.85,
    "location": "Test Location"
  }'
```

### Issue: Components Don't Update

**Check:**
1. Browser console for errors
2. Network tab for failed requests
3. Component useEffect dependencies

**Solution:**
```typescript
// Add dependency to force re-fetch
useEffect(() => {
  fetchData();
}, [someState]); // Add dependencies
```

---

## Production Recommendations

### 1. Remove Fallback Data

Once you have real data flowing, remove fallback data from components:

```typescript
// Before
const [data, setData] = useState(FALLBACK_DATA);

// After
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
```

### 2. Add Loading States

Show proper loading indicators:

```typescript
if (loading) {
  return <LoadingSpinner />;
}

if (data.length === 0) {
  return <EmptyState message="No anomalies detected" />;
}
```

### 3. Add Error Handling

Handle API failures gracefully:

```typescript
try {
  const data = await apiService.fetchData();
  setData(data);
} catch (error) {
  setError('Failed to fetch data');
  // Don't show fallback, show error message
}
```

### 4. Add Data Freshness Indicator

Show when data was last updated:

```typescript
<div className="text-xs text-gray-500">
  Last updated: {lastUpdate.toLocaleTimeString()}
</div>
```

---

## Quick Fixes

### Get Diverse Data Now

```bash
# 1. Upload different files
cd frontend
# Upload images, PDFs, text files via UI

# 2. Manually create anomalies
curl -X POST http://localhost:3001/api/anomalies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Seismic Anomaly",
    "severity": "Critical",
    "location": "Pacific Northwest",
    "confidence": 0.92
  }'

curl -X POST http://localhost:3001/api/anomalies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Weather Anomaly",
    "severity": "High",
    "location": "North Atlantic",
    "confidence": 0.87
  }'

# 3. Trigger data ingestion
curl -X POST http://localhost:3001/api/realtime/data
```

### Verify It's Working

```bash
# Check anomalies
curl http://localhost:3001/api/anomalies | jq

# Check alerts
curl http://localhost:3001/api/alerts | jq

# Check hotspots
curl http://localhost:3001/api/realtime/hotspots | jq
```

---

## Summary

### What's Working ✅
- All components fetch from real API
- Data updates automatically (30-60 second intervals)
- Fallback data ensures UI never breaks
- Database stores all API data

### What Needs More Data 📊
- More diverse anomalies needed
- More frequent data ingestion
- More API sources configured
- Manual uploads to create variety

### Next Steps 🚀
1. Wait for data ingestion to populate database (15 min cycles)
2. Upload files to create diverse anomalies
3. Configure more API keys for more data sources
4. Increase ingestion frequency if needed
5. Remove fallback data once real data is flowing

---

**Status**: ✅ Real data integration complete
**Issue**: Limited data variety (normal for new deployment)
**Solution**: Wait for data ingestion or manually create anomalies

**Last Updated**: November 18, 2024
