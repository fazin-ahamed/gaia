# Environmental Data API Integration Guide

This guide covers the newly integrated environmental data APIs for real-time monitoring of weather, air quality, and seismic activity.

## Available APIs

### 1. USGS Earthquake API
Real-time earthquake data from the United States Geological Survey.

**Base URL**: `https://earthquake.usgs.gov/fdsnws/event/1/query`

**Example (UAE/Iran Region)**:
```
https://earthquake.usgs.gov/fdsnws/event/1/query?minmagnitude=2&maxlatitude=26&minlatitude=22&maxlongitude=57&minlongitude=51&format=geojson
```

### 2. OpenAQ API v3
Air quality data from monitoring stations worldwide.

**Base URL**: `https://api.openaq.org/v3`

**Endpoints**:
- `/v3/locations` - Get all locations
- `/v3/locations/{id}` - Get specific location (e.g., `/v3/locations/8118`)
- `/v3/countries` - Get all countries

**Authentication**: Requires `X-API-Key` header

### 3. OpenWeatherMap One Call API 3.0
Comprehensive weather data including current, hourly, and daily forecasts.

**Base URL**: `https://api.openweathermap.org/data/3.0/onecall`

**Parameters**:
- `lat` (required) - Latitude (-90 to 90)
- `lon` (required) - Longitude (-180 to 180)
- `appid` (required) - Your API key
- `exclude` (optional) - Comma-delimited list: current, minutely, hourly, daily, alerts
- `units` (optional) - standard, metric, or imperial
- `lang` (optional) - Language code

### 4. Open-Meteo API
Free weather forecasting API (no API key required).

**Base URL**: `https://api.open-meteo.com/v1/forecast`

**Example**:
```javascript
const params = {
  latitude: 52.52,
  longitude: 13.41,
  hourly: "temperature_2m",
  current: "temperature_2m,wind_speed_10m"
};
```

### 5. TomTom Traffic & Mapping APIs
Real-time traffic flow, incidents, routing, and location services.

**Traffic Flow**: `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/{zoom}/json`
**Traffic Incidents**: `https://api.tomtom.com/traffic/services/5/incidentDetails`
**Routing**: `https://api.tomtom.com/routing/1/calculateRoute/{start}:{end}/json`
**Search**: `https://api.tomtom.com/search/2/search/{query}.json`
**Reverse Geocoding**: `https://api.tomtom.com/search/2/reverseGeocode/{lat},{lon}.json`

**Use Cases**:
- Real-time traffic monitoring
- Accident and incident detection
- Emergency response routing
- Location intelligence

### 6. NewsAPI.org
Real-time news articles from thousands of sources worldwide.

**Base URL**: `https://newsapi.org/v2/everything`

**Parameters**:
- `q` (required) - Keywords or phrases to search for
- `apiKey` (required) - Your API key
- `language` (optional) - Language code (e.g., 'en')
- `sortBy` (optional) - publishedAt, relevancy, or popularity
- `pageSize` (optional) - Number of results (max 100)

**Example**:
```
GET https://newsapi.org/v2/everything?q=bitcoin&apiKey=YOUR_KEY
```

**Response Format**:
```json
{
  "status": "ok",
  "totalResults": 10103,
  "articles": [
    {
      "source": {
        "id": "wired",
        "name": "Wired"
      },
      "author": "Joel Khalili",
      "title": "Article Title",
      "description": "Article description...",
      "url": "https://example.com/article",
      "urlToImage": "https://example.com/image.jpg",
      "publishedAt": "2025-11-17T10:00:00Z",
      "content": "Article content..."
    }
  ]
}
```

## Backend API Endpoints

### Weather Data
```
GET /api/environmental/weather?lat={lat}&lon={lon}
```
Returns comprehensive weather data from OpenWeatherMap, Open-Meteo, and NOAA.

### Air Quality Data
```
GET /api/environmental/air-quality?lat={lat}&lon={lon}
```
Returns air quality data from OpenAQ and AQICN.

### Specific OpenAQ Location
```
GET /api/environmental/air-quality/location/{id}
```
Get detailed data for a specific OpenAQ monitoring station.

### OpenAQ Countries
```
GET /api/environmental/air-quality/countries
```
Get list of all countries with air quality monitoring.

### Earthquake Data (Custom Region)
```
GET /api/environmental/earthquakes?minLat={minLat}&maxLat={maxLat}&minLon={minLon}&maxLon={maxLon}&minMagnitude={mag}
```
Get earthquake data for a custom bounding box.

### UAE/Iran Earthquakes
```
GET /api/environmental/earthquakes/uae-iran
```
Pre-configured endpoint for UAE/Iran region (lat: 22-26, lon: 51-57).

### Nearby Earthquakes
```
GET /api/environmental/earthquakes/nearby?lat={lat}&lon={lon}&radius={degrees}&minMagnitude={mag}
```
Get earthquakes within a radius of a specific location.

### News Data
```
GET /api/environmental/news?query={searchTerm}&country={countryCode}
```
Get news articles from NewsAPI.org (with GNews fallback).

### NewsAPI.org Specific
```
GET /api/environmental/news/newsapi?query={searchTerm}&language={lang}&sortBy={sort}&pageSize={size}
```
Get news specifically from NewsAPI.org with full control over parameters.

### Traffic Data
```
GET /api/environmental/traffic?lat={lat}&lon={lon}&zoom={zoom}
```
Get real-time traffic flow data.

### Traffic Incidents
```
GET /api/environmental/traffic/incidents?bbox={minLon},{minLat},{maxLon},{maxLat}
```
Get traffic incidents (accidents, road closures, etc.) in a bounding box.

### Route Calculation
```
GET /api/environmental/traffic/route?startLat={lat}&startLon={lon}&endLat={lat}&endLon={lon}
```
Calculate optimal route with real-time traffic.

### Place Search
```
GET /api/environmental/traffic/search?query={term}&lat={lat}&lon={lon}&radius={meters}
```
Search for places and points of interest.

### Reverse Geocoding
```
GET /api/environmental/traffic/reverse-geocode?lat={lat}&lon={lon}
```
Convert coordinates to address.

### Comprehensive Environmental Data
```
GET /api/environmental/comprehensive?lat={lat}&lon={lon}&query={searchTerm}
```
Get all environmental data (weather, air quality, earthquakes, news) for a location.

## Environment Variables

Add these to your `backend/.env` file:

```env
# OpenWeatherMap API (required for weather data)
OPENWEATHER_API_KEY=your_key_here

# OpenAQ API (required for air quality)
OPENAQ_API_KEY=your_key_here

# AQICN API (optional, for additional air quality data)
AQICN_API_KEY=your_key_here

# NewsAPI.org (required for news data)
NEWSAPI_KEY=1d68c651803f430ca16d89967d8da37c

# GNews API (optional fallback for news)
GNEWS_API_KEY=your_gnews_key_here

# TomTom API (required for traffic data)
TOMTOM_API_KEY=ZhWiSCOn92QUayZUB210bZjSjzFhbylO

# Open-Meteo (no key required - free service)
# USGS Earthquake API (no key required - free service)
```

## Usage Examples

### Frontend Integration

```typescript
// Fetch comprehensive environmental data
const response = await fetch(
  `/api/environmental/comprehensive?lat=25.2048&lon=55.2708&query=dubai`
);
const data = await response.json();

// Access different data sources
console.log('Weather:', data.weather);
console.log('Air Quality:', data.airQuality);
console.log('Earthquakes:', data.earthquakes);
console.log('News:', data.news);
```

### Earthquake Monitoring

```typescript
// Monitor UAE/Iran region
const earthquakes = await fetch('/api/environmental/earthquakes/uae-iran');
const data = await earthquakes.json();

data.features.forEach(eq => {
  console.log(`Magnitude ${eq.properties.mag} at ${eq.properties.place}`);
});
```

### Air Quality Monitoring

```typescript
// Get air quality for a location
const aq = await fetch('/api/environmental/air-quality?lat=25.2048&lon=55.2708');
const aqData = await aq.json();

// Check specific monitoring station
const station = await fetch('/api/environmental/air-quality/location/8118');
const stationData = await station.json();
```

### News Monitoring

```typescript
// Get news articles about a topic
const news = await fetch('/api/environmental/news?query=bitcoin&country=us');
const newsData = await news.json();

console.log(`Found ${newsData.totalResults} articles`);
newsData.articles.forEach(article => {
  console.log(`${article.title} - ${article.source.name}`);
  console.log(`Published: ${article.publishedAt}`);
});

// Get news from NewsAPI.org specifically
const newsApi = await fetch('/api/environmental/news/newsapi?query=earthquake&sortBy=publishedAt&pageSize=20');
const newsApiData = await newsApi.json();
```

## Anomaly Detection

The system automatically analyzes environmental data for anomalies:

- **Earthquakes**: Detects magnitude > 4.0 or earthquake swarms
- **Weather**: Identifies unusual pressure, temperature, or wind patterns
- **Air Quality**: Flags AQI > 100 (unhealthy levels)

Each anomaly is assigned a confidence score (0-1) and description.

## Rate Limiting

To avoid API rate limits:
- Weather data: Cached for 10 minutes
- Air quality: Cached for 15 minutes
- Earthquakes: Cached for 5 minutes
- Autonomous ingestion runs every 15 minutes

## Testing

Test the APIs using curl:

```bash
# Test weather endpoint
curl "http://localhost:3001/api/environmental/weather?lat=25.2048&lon=55.2708"

# Test earthquake endpoint
curl "http://localhost:3001/api/environmental/earthquakes/uae-iran"

# Test comprehensive data
curl "http://localhost:3001/api/environmental/comprehensive?lat=25.2048&lon=55.2708"
```

## Next Steps

1. Add API keys to `backend/.env`
2. Restart the backend server
3. Test endpoints using the examples above
4. Integrate into frontend components for real-time monitoring
5. Set up alerts for high-severity anomalies
