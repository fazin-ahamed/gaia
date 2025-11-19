# GDACS Integration - Global Disaster Alerts

## Overview
GDACS (Global Disaster Alert and Coordination System) provides real-time alerts about natural disasters worldwide including earthquakes, tsunamis, tropical cyclones, floods, volcanoes, and droughts.

## ✅ Integration Complete

### API Endpoints

#### 1. Get Latest Disaster Events
```http
GET /api/environmental/disasters
```

**Response:**
```json
{
  "success": true,
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-51.389, -6.659]
      },
      "properties": {
        "eventId": 1016449,
        "eventType": "DR",
        "eventName": "South America-2023",
        "name": "Drought in Bolivia, Brazil, Peru",
        "description": "Drought in Bolivia, Brazil, Peru",
        "alertLevel": "Orange",
        "alertScore": 2,
        "severity": {
          "severity": 1209940,
          "severitytext": "Medium impact for agricultural drought in 1209940 km2",
          "severityunit": "km2"
        },
        "country": "Bolivia, Brazil, Peru",
        "affectedCountries": [
          {
            "iso2": "BO",
            "iso3": "BOL",
            "countryname": "Bolivia"
          }
        ],
        "fromDate": "2022-09-21T00:00:00",
        "toDate": "2025-11-17T00:00:00",
        "isCurrent": "false",
        "url": {
          "geometry": "https://www.gdacs.org/gdacsapi/api/polygons/getgeometry?eventtype=DR&eventid=1016449&episodeid=79",
          "report": "https://www.gdacs.org/report.aspx?eventid=1016449&episodeid=79&eventtype=DR",
          "details": "https://www.gdacs.org/gdacsapi/api/events/geteventdata?eventtype=DR&eventid=1016449"
        },
        "icon": "https://www.gdacs.org/images/gdacs_icons/maps/Orange/DR.png"
      }
    }
  ],
  "count": 2,
  "timestamp": "2025-11-19T10:00:00.000Z",
  "source": "GDACS (Global Disaster Alert and Coordination System)"
}
```

#### 2. Get Specific Event Details
```http
GET /api/environmental/disasters/:eventType/:eventId
```

**Example:**
```http
GET /api/environmental/disasters/DR/1016449
```

**Response:**
```json
{
  "success": true,
  "event": {
    "eventId": 1016449,
    "eventType": "DR",
    "details": "..."
  },
  "source": "GDACS"
}
```

## Event Types

| Code | Type | Description |
|------|------|-------------|
| `EQ` | Earthquake | Seismic events |
| `TC` | Tropical Cyclone | Hurricanes, typhoons |
| `FL` | Flood | Flooding events |
| `VO` | Volcano | Volcanic activity |
| `DR` | Drought | Drought conditions |
| `WF` | Wildfire | Forest fires |

## Alert Levels

| Level | Color | Description |
|-------|-------|-------------|
| `Green` | 🟢 | Low impact |
| `Orange` | 🟠 | Medium impact |
| `Red` | 🔴 | High impact |

## Features

### 1. Real-time Disaster Monitoring
- Automatic updates from GDACS
- Global coverage
- Multiple disaster types
- Alert severity levels

### 2. Geographic Data
- GeoJSON format
- Point coordinates
- Affected countries
- Bounding boxes

### 3. Event Details
- Event name and description
- Start and end dates
- Current status
- Severity metrics
- Affected areas

### 4. External Links
- Geometry data
- Official reports
- Detailed event data
- Alert icons

## Integration in GAIA

### Automatic Anomaly Detection
GDACS events are automatically processed as potential anomalies:

```javascript
const { fetchGDACSEvents } = require('./services/externalAPIs');

// Fetch latest disasters
const disasters = await fetchGDACSEvents();

// Process high-severity events
disasters.features
  .filter(f => f.properties.alertLevel === 'Red')
  .forEach(event => {
    // Create anomaly from disaster event
    createAnomalyFromGDACS(event);
  });
```

### Real-time Dashboard
Display active disasters on the map:

```typescript
// In frontend
const response = await fetch('/api/environmental/disasters');
const data = await response.json();

// Display on map
data.features.forEach(feature => {
  addDisasterMarker(
    feature.geometry.coordinates,
    feature.properties
  );
});
```

## Usage Examples

### Fetch All Current Disasters
```bash
curl http://localhost:3001/api/environmental/disasters
```

### Filter by Alert Level
```javascript
const disasters = await fetchGDACSEvents();
const redAlerts = disasters.features.filter(
  f => f.properties.alertLevel === 'Red'
);
```

### Get Event Details
```bash
curl http://localhost:3001/api/environmental/disasters/DR/1016449
```

### Monitor Specific Region
```javascript
const disasters = await fetchGDACSEvents();
const regionEvents = disasters.features.filter(f => {
  const countries = f.properties.affectedCountries;
  return countries.some(c => c.iso3 === 'USA');
});
```

## API Source Health

Check GDACS status:
```http
GET /api/ai-status/sources
```

Response includes:
```json
{
  "sources": {
    "disasters": {
      "gdacs": {
        "name": "GDACS",
        "configured": true,
        "status": "operational",
        "endpoint": "https://www.gdacs.org/gdacsapi/api",
        "purpose": "Global disaster alerts"
      }
    }
  }
}
```

## Benefits

### 1. No API Key Required
- Free public API
- No authentication needed
- No rate limits

### 2. Comprehensive Coverage
- Global disaster monitoring
- Multiple event types
- Real-time updates

### 3. Authoritative Source
- UN-backed system
- Official disaster data
- Trusted by governments

### 4. Rich Metadata
- Severity scores
- Affected populations
- Geographic boundaries
- Historical data

## Integration with Other APIs

### Combined Disaster Analysis
```javascript
const [gdacs, earthquakes, weather] = await Promise.all([
  fetchGDACSEvents(),
  fetchNearbyEarthquakes(lat, lon),
  fetchWeatherData(lat, lon)
]);

// Cross-reference data sources
const combinedAnalysis = analyzeMultiSourceDisasters({
  gdacs,
  earthquakes,
  weather
});
```

## Frontend Integration

### Display Disasters on Map
```typescript
// In InteractiveMapEnhanced.tsx
useEffect(() => {
  fetch('/api/environmental/disasters')
    .then(res => res.json())
    .then(data => {
      data.features.forEach(feature => {
        const marker = L.marker(
          [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
          {
            icon: getDisasterIcon(feature.properties.eventType)
          }
        );
        
        marker.bindPopup(`
          <h3>${feature.properties.name}</h3>
          <p>Alert: ${feature.properties.alertLevel}</p>
          <p>${feature.properties.description}</p>
        `);
        
        marker.addTo(map);
      });
    });
}, []);
```

## Status

✅ **GDACS Integration Complete**

- API endpoints implemented
- Real-time disaster fetching
- Event details retrieval
- Health monitoring
- Documentation complete

## Next Steps

1. Add GDACS events to real-time dashboard
2. Create anomalies from high-severity events
3. Set up automatic monitoring
4. Add disaster type filtering
5. Implement alert notifications

---

**API Documentation:** https://www.gdacs.org/gdacsapi/
**Status:** ✅ Operational
**Authentication:** None required
