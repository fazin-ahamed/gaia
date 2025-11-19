# ✅ Real Data Integration - Now Working!

## What's Fixed

### 1. Upload/Report Anomaly - Now Saves to Database ✅

**Before:** Upload analyzed files but didn't save to database
**Now:** Uploads are analyzed AND saved as anomalies in the database

#### How It Works:
```
User uploads file → AI analyzes → Saves to database → Triggers Opus workflow → Returns anomaly ID
```

#### API Endpoint:
```http
POST /api/upload/analyze
Content-Type: multipart/form-data

Fields:
- file: The file to upload (image, PDF, text)
- title: Anomaly title (optional)
- description: Description (optional)
- location: Location JSON or string (optional)
```

#### Response:
```json
{
  "isAnomaly": true,
  "confidence": 0.85,
  "reasoning": "AI analysis results...",
  "anomalyScore": {
    "severity": "High",
    "isFake": false
  },
  "saved": true,
  "anomalyId": "uuid-here",
  "savedAnomaly": {
    "id": "uuid-here",
    "title": "Uploaded image anomaly",
    "status": "detected"
  },
  "opusWorkflow": {
    "success": true,
    "jobExecutionId": "2514"
  }
}
```

### 2. GDACS Disasters - Now in Panel ✅

**Before:** GDACS data fetched but not displayed
**Now:** GDACS disasters automatically appear in hotspots and can be synced to database

#### Hotspots Endpoint Enhanced:
```http
GET /api/realtime/hotspots
```

**Now Returns:**
- GDACS disasters (earthquakes, floods, droughts, etc.)
- City-based anomalies (weather, air quality, etc.)
- Combined view with severity levels

#### Response:
```json
{
  "hotspots": [
    {
      "name": "Drought in Bolivia, Brazil, Peru",
      "lat": -6.659,
      "lon": -51.389,
      "severity": "High",
      "type": "disaster",
      "source": "GDACS",
      "data": {
        "eventType": "DR",
        "alertLevel": "Orange",
        "alertScore": 2,
        "description": "Drought in Bolivia, Brazil, Peru",
        "country": "Bolivia, Brazil, Peru",
        "affectedCountries": [...],
        "isCurrent": "false"
      }
    },
    {
      "name": "New York",
      "lat": 40.7128,
      "lon": -74.0060,
      "severity": "Medium",
      "type": "city",
      "source": "multi-source",
      "data": {
        "weather": {...},
        "airQuality": {...},
        "earthquakes": {...}
      }
    }
  ],
  "summary": {
    "total": 8,
    "disasters": 2,
    "cities": 6,
    "critical": 0,
    "high": 2,
    "medium": 4,
    "low": 2
  }
}
```

### 3. Sync GDACS to Database ✅

New endpoint to import GDACS disasters as anomalies:

```http
POST /api/realtime/sync-disasters
```

**What It Does:**
1. Fetches latest GDACS disasters
2. Checks if already in database
3. Creates new anomalies for new disasters
4. Tags with `gdacs`, event type, alert level

**Response:**
```json
{
  "success": true,
  "synced": 5,
  "errors": 0,
  "savedAnomalies": [
    {
      "id": "uuid-1",
      "title": "Drought in Bolivia, Brazil, Peru",
      "eventId": 1016449
    }
  ],
  "timestamp": "2025-11-19T10:00:00.000Z"
}
```

## Usage Examples

### Upload and Save Anomaly

```bash
curl -X POST http://localhost:3001/api/upload/analyze \
  -F "file=@evidence.jpg" \
  -F "title=Suspicious Activity" \
  -F "description=Unusual patterns detected" \
  -F 'location={"lat":40.7128,"lng":-74.0060,"address":"New York"}'
```

### Get Hotspots with GDACS

```bash
curl http://localhost:3001/api/realtime/hotspots
```

### Sync GDACS Disasters

```bash
curl -X POST http://localhost:3001/api/realtime/sync-disasters
```

### View Saved Anomalies

```bash
curl http://localhost:3001/api/anomalies
```

## Frontend Integration

### Display Hotspots on Map

```typescript
// In InteractiveMapEnhanced.tsx
useEffect(() => {
  fetch('/api/realtime/hotspots')
    .then(res => res.json())
    .then(data => {
      data.hotspots.forEach(hotspot => {
        const icon = hotspot.type === 'disaster' 
          ? getDisasterIcon(hotspot.data.eventType)
          : getCityIcon(hotspot.severity);
        
        const marker = L.marker([hotspot.lat, hotspot.lon], { icon });
        
        marker.bindPopup(`
          <h3>${hotspot.name}</h3>
          <p><strong>Severity:</strong> ${hotspot.severity}</p>
          <p><strong>Source:</strong> ${hotspot.source}</p>
          ${hotspot.data.description ? `<p>${hotspot.data.description}</p>` : ''}
        `);
        
        marker.addTo(map);
      });
    });
}, []);
```

### Upload Form

```typescript
// In AnomalyUploadReal.tsx
const handleUpload = async (file: File, data: any) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('location', JSON.stringify(data.location));
  
  const response = await fetch('/api/upload/analyze', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (result.saved) {
    alert(`Anomaly saved! ID: ${result.anomalyId}`);
    // Redirect to anomaly details
    navigate(`/incidents/${result.anomalyId}`);
  }
};
```

### Auto-Sync GDACS

```typescript
// In Dashboard or Settings
const syncDisasters = async () => {
  const response = await fetch('/api/realtime/sync-disasters', {
    method: 'POST'
  });
  
  const result = await response.json();
  
  if (result.success) {
    alert(`Synced ${result.synced} disasters!`);
    // Refresh anomalies list
    refreshAnomalies();
  }
};

// Auto-sync every hour
useEffect(() => {
  const interval = setInterval(syncDisasters, 3600000);
  return () => clearInterval(interval);
}, []);
```

## Database Schema

### Uploaded Anomalies

```javascript
{
  id: "uuid",
  title: "Uploaded image anomaly",
  description: "User description or AI reasoning",
  severity: "high",
  confidence: 0.85,
  status: "detected",
  location: {
    lat: 40.7128,
    lng: -74.0060,
    address: "New York"
  },
  modalities: {
    type: "image",
    fileName: "evidence.jpg",
    fileType: "image/jpeg"
  },
  aiAnalysis: {
    isAnomaly: true,
    confidence: 0.85,
    reasoning: "...",
    anomalyScore: {...}
  },
  tags: ["uploaded", "image", "user-reported"],
  timestamp: "2025-11-19T10:00:00.000Z"
}
```

### GDACS Anomalies

```javascript
{
  id: "uuid",
  title: "Drought in Bolivia, Brazil, Peru",
  description: "Drought in Bolivia, Brazil, Peru",
  severity: "high",
  confidence: 0.67,
  status: "detected",
  location: {
    lat: -6.659,
    lng: -51.389,
    address: "Bolivia, Brazil, Peru"
  },
  modalities: {
    type: "disaster",
    eventType: "DR",
    source: "GDACS"
  },
  aiAnalysis: {
    source: "GDACS",
    alertLevel: "Orange",
    alertScore: 2,
    severity: {...},
    affectedCountries: [...]
  },
  tags: ["gdacs", "gdacs-1016449", "DR", "disaster", "orange"],
  timestamp: "2022-09-21T00:00:00.000Z"
}
```

## Benefits

### 1. Real Data Storage
- ✅ Uploads saved to database
- ✅ Persistent anomaly records
- ✅ Full audit trail

### 2. GDACS Integration
- ✅ Real-time disaster monitoring
- ✅ Global coverage
- ✅ Automatic severity mapping

### 3. Unified View
- ✅ User uploads + GDACS disasters
- ✅ Single anomalies endpoint
- ✅ Consistent data format

### 4. Workflow Automation
- ✅ Opus workflows triggered
- ✅ AI analysis included
- ✅ Cross-verification

## Testing

### Test Upload
```bash
# Create test image
echo "test" > test.txt

# Upload
curl -X POST http://localhost:3001/api/upload/analyze \
  -F "file=@test.txt" \
  -F "title=Test Anomaly" \
  -F "description=Testing upload"

# Check if saved
curl http://localhost:3001/api/anomalies | jq '.anomalies[0]'
```

### Test GDACS Sync
```bash
# Sync disasters
curl -X POST http://localhost:3001/api/realtime/sync-disasters

# Check hotspots
curl http://localhost:3001/api/realtime/hotspots | jq '.summary'

# View in anomalies
curl http://localhost:3001/api/anomalies?tags=gdacs
```

## Status

✅ **Upload Feature - Working**
- Saves to database
- Triggers workflows
- Returns anomaly ID

✅ **GDACS Integration - Working**
- Appears in hotspots
- Can sync to database
- Tagged and searchable

✅ **Real Data - Flowing**
- No more predefined data
- Live API integration
- Persistent storage

## Next Steps

1. Add automatic GDACS sync (cron job)
2. Display GDACS disasters on map
3. Add disaster type filters
4. Create disaster alert notifications
5. Add file preview for uploads

---

**Status:** ✅ Complete and Working
**Test:** Upload a file and check `/api/anomalies`
**GDACS:** Run `/api/realtime/sync-disasters` and check hotspots
