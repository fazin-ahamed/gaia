# TomTom API Integration Guide

## Overview

TomTom APIs have been fully integrated into the GAIA system for real-time traffic monitoring, routing, mapping, and location services.

## TomTom APIs Integrated

### 1. Traffic Flow API
Get real-time traffic flow data for any location.

**Endpoint**: `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/{zoom}/json`

**Use Case**: Monitor traffic speed and congestion levels

**Parameters**:
- `point`: Latitude,Longitude
- `zoom`: Map zoom level (1-22, default: 12)
- `key`: TomTom API key

**Response**:
```json
{
  "flowSegmentData": {
    "currentSpeed": 45,
    "freeFlowSpeed": 65,
    "currentTravelTime": 120,
    "freeFlowTravelTime": 85,
    "confidence": 0.95
  }
}
```

### 2. Traffic Incidents API
Get traffic incidents (accidents, road closures, construction) in a bounding box.

**Endpoint**: `https://api.tomtom.com/traffic/services/5/incidentDetails`

**Use Case**: Detect traffic anomalies, accidents, road hazards

**Parameters**:
- `bbox`: minLon,minLat,maxLon,maxLat
- `categoryFilter`: Incident types (0-14)
- `timeValidityFilter`: present/future
- `key`: TomTom API key

**Incident Categories**:
- 0: Unknown
- 1: Accident
- 2: Fog
- 3: Dangerous Conditions
- 4: Rain
- 5: Ice
- 6: Jam
- 7: Lane Closed
- 8: Road Closed
- 9: Road Works
- 10: Wind
- 11: Flooding
- 14: Broken Down Vehicle


### 3. Routing API
Calculate optimal routes between two points with real-time traffic.

**Endpoint**: `https://api.tomtom.com/routing/1/calculateRoute/{start}:{end}/json`

**Use Case**: Emergency response routing, evacuation planning

**Parameters**:
- `start`: startLat,startLon
- `end`: endLat,endLon
- `traffic`: true/false (include traffic)
- `travelMode`: car/truck/taxi/bus/van/motorcycle/bicycle/pedestrian
- `key`: TomTom API key

**Response**:
```json
{
  "routes": [{
    "summary": {
      "lengthInMeters": 15420,
      "travelTimeInSeconds": 1245,
      "trafficDelayInSeconds": 180,
      "departureTime": "2025-11-19T10:00:00Z",
      "arrivalTime": "2025-11-19T10:20:45Z"
    },
    "legs": [...],
    "sections": [...]
  }]
}
```

### 4. Search API
Find places, addresses, and points of interest.

**Endpoint**: `https://api.tomtom.com/search/2/search/{query}.json`

**Use Case**: Find nearby hospitals, shelters, emergency services

**Parameters**:
- `query`: Search term
- `lat`, `lon`: Center point
- `radius`: Search radius in meters
- `limit`: Max results (default: 10)
- `key`: TomTom API key

**Example Queries**:
- "hospital"
- "police station"
- "emergency shelter"
- "gas station"

### 5. Reverse Geocoding API
Convert coordinates to human-readable addresses.

**Endpoint**: `https://api.tomtom.com/search/2/reverseGeocode/{lat},{lon}.json`

**Use Case**: Get address from anomaly coordinates

**Response**:
```json
{
  "addresses": [{
    "address": {
      "streetNumber": "123",
      "streetName": "Main Street",
      "municipality": "New York",
      "countrySubdivision": "NY",
      "postalCode": "10001",
      "country": "United States",
      "freeformAddress": "123 Main Street, New York, NY 10001"
    },
    "position": "40.7128,-74.0060"
  }]
}
```

## Backend API Endpoints

### Traffic Flow
```
GET /api/environmental/traffic?lat={lat}&lon={lon}&zoom={zoom}
```

**Example**:
```bash
curl "http://localhost:3001/api/environmental/traffic?lat=40.7128&lon=-74.0060&zoom=12"
```

### Traffic Incidents
```
GET /api/environmental/traffic/incidents?bbox={minLon},{minLat},{maxLon},{maxLat}
```

**Example**:
```bash
curl "http://localhost:3001/api/environmental/traffic/incidents?bbox=-74.1,40.6,-73.9,40.8"
```

### Route Calculation
```
GET /api/environmental/traffic/route?startLat={lat}&startLon={lon}&endLat={lat}&endLon={lon}
```

**Example**:
```bash
curl "http://localhost:3001/api/environmental/traffic/route?startLat=40.7128&startLon=-74.0060&endLat=40.7589&endLon=-73.9851"
```

### Place Search
```
GET /api/environmental/traffic/search?query={term}&lat={lat}&lon={lon}&radius={meters}
```

**Example**:
```bash
curl "http://localhost:3001/api/environmental/traffic/search?query=hospital&lat=40.7128&lon=-74.0060&radius=5000"
```

### Reverse Geocoding
```
GET /api/environmental/traffic/reverse-geocode?lat={lat}&lon={lon}
```

**Example**:
```bash
curl "http://localhost:3001/api/environmental/traffic/reverse-geocode?lat=40.7128&lon=-74.0060"
```


## Traffic Anomaly Detection

The system automatically detects traffic anomalies based on speed ratios:

```javascript
function detectTrafficAnomaly(trafficData) {
  const currentSpeed = trafficData.flow.flowSegmentData.currentSpeed;
  const freeFlowSpeed = trafficData.flow.flowSegmentData.freeFlowSpeed;
  const speedRatio = currentSpeed / freeFlowSpeed;

  if (speedRatio < 0.3) {
    // Severe congestion: 90% confidence
    return { 
      confidence: 0.90, 
      description: 'Severe traffic congestion detected (30% of normal speed)' 
    };
  } else if (speedRatio < 0.5) {
    // Heavy traffic: 75% confidence
    return { 
      confidence: 0.75, 
      description: 'Heavy traffic detected (50% of normal speed)' 
    };
  } else if (speedRatio < 0.7) {
    // Moderate traffic: 65% confidence
    return { 
      confidence: 0.65, 
      description: 'Moderate traffic detected (70% of normal speed)' 
    };
  }
  
  return { confidence: 0.5, description: 'Normal traffic conditions' };
}
```

## Agent Swarm Integration

Traffic data is analyzed by a dedicated Traffic Agent in the agent swarm:

```javascript
// Traffic Analysis Agent
if (data.traffic) {
  const trafficAnomaly = detectTrafficAnomaly(data.traffic);
  agents.push({
    type: 'traffic',
    agentId: 'traffic-agent-001',
    confidence: trafficAnomaly.confidence,
    output: trafficAnomaly.description,
    timestamp: new Date().toISOString()
  });
}
```

## Comprehensive Data Integration

Traffic data is automatically included in the comprehensive environmental endpoint:

```
GET /api/environmental/comprehensive?lat={lat}&lon={lon}&query={query}
```

**Response includes**:
- Weather data
- Air quality data
- Earthquake data
- **Traffic data** (NEW)
- News articles

## Configuration

### Environment Variables

Add to `backend/.env`:
```env
TOMTOM_API_KEY=ZhWiSCOn92QUayZUB210bZjSjzFhbylO
```

### API Key Already Configured
The TomTom API key is already in your `.env.example` file and ready to use.

## Use Cases

### 1. Emergency Response
- Calculate fastest routes avoiding traffic
- Find nearby hospitals and emergency services
- Monitor road closures and incidents

### 2. Evacuation Planning
- Identify congested areas
- Plan evacuation routes
- Monitor traffic flow in real-time

### 3. Anomaly Detection
- Detect unusual traffic patterns
- Identify accidents and incidents
- Alert on severe congestion

### 4. Location Intelligence
- Reverse geocode anomaly locations
- Find nearby points of interest
- Search for critical infrastructure

## Frontend Integration

### Display Traffic Data
```typescript
// Fetch traffic data for a location
const response = await fetch(
  `/api/environmental/traffic?lat=40.7128&lon=-74.0060`
);
const trafficData = await response.json();

if (trafficData.flow) {
  const { currentSpeed, freeFlowSpeed } = trafficData.flow.flowSegmentData;
  const speedRatio = (currentSpeed / freeFlowSpeed * 100).toFixed(0);
  
  console.log(`Traffic flowing at ${speedRatio}% of normal speed`);
}
```

### Display Traffic Incidents
```typescript
// Get incidents in bounding box
const bbox = '-74.1,40.6,-73.9,40.8'; // NYC area
const response = await fetch(
  `/api/environmental/traffic/incidents?bbox=${bbox}`
);
const incidents = await response.json();

incidents.incidents?.forEach(incident => {
  console.log(`${incident.properties.iconCategory}: ${incident.properties.events[0].description}`);
});
```

### Calculate Route
```typescript
// Calculate route with traffic
const response = await fetch(
  `/api/environmental/traffic/route?` +
  `startLat=40.7128&startLon=-74.0060&` +
  `endLat=40.7589&endLon=-73.9851`
);
const route = await response.json();

const summary = route.routes[0].summary;
console.log(`Distance: ${summary.lengthInMeters}m`);
console.log(`Travel time: ${summary.travelTimeInSeconds}s`);
console.log(`Traffic delay: ${summary.trafficDelayInSeconds}s`);
```

## Rate Limits

TomTom API rate limits vary by plan:
- **Free tier**: 2,500 requests/day
- **Developer tier**: 10,000 requests/day
- **Business tier**: Custom limits

The system handles rate limits gracefully with fallback mechanisms.

## Testing

Test TomTom integration:

```bash
# Test traffic flow
curl "http://localhost:3001/api/environmental/traffic?lat=40.7128&lon=-74.0060"

# Test incidents
curl "http://localhost:3001/api/environmental/traffic/incidents?bbox=-74.1,40.6,-73.9,40.8"

# Test routing
curl "http://localhost:3001/api/environmental/traffic/route?startLat=40.7128&startLon=-74.0060&endLat=40.7589&endLon=-73.9851"

# Test search
curl "http://localhost:3001/api/environmental/traffic/search?query=hospital&lat=40.7128&lon=-74.0060"

# Test reverse geocoding
curl "http://localhost:3001/api/environmental/traffic/reverse-geocode?lat=40.7128&lon=-74.0060"
```

## Next Steps

1. ✅ TomTom APIs integrated
2. ✅ Traffic anomaly detection implemented
3. ✅ Agent swarm updated
4. ✅ API endpoints created
5. ✅ Documentation complete

### Recommended Actions
1. Test all TomTom endpoints
2. Integrate traffic visualization in frontend map
3. Add traffic incident markers to map
4. Create traffic alerts for severe congestion
5. Use routing API for emergency response planning

## Support

For TomTom API documentation, visit: https://developer.tomtom.com/

For issues, check logs in `backend/logs/api.log`
