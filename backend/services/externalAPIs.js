const axios = require('axios');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/api.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

// Weather Data Collection (Updated with OpenWeatherMap 3.0 One Call API)
async function fetchWeatherData(lat, lon) {
  try {
    const [openWeather, openMeteo, noaa] = await Promise.allSettled([
      // OpenWeatherMap One Call API 3.0
      axios.get(`https://api.openweathermap.org/data/3.0/onecall`, {
        params: { 
          lat, 
          lon, 
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric',
          exclude: 'minutely'
        }
      }),
      // Open-Meteo API (free, no API key needed)
      axios.get(`https://api.open-meteo.com/v1/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,pressure_msl',
          hourly: 'temperature_2m,precipitation_probability',
          daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
          timezone: 'auto'
        }
      }),
      // NOAA API (if coordinates in US)
      axios.get(`https://api.weather.gov/points/${lat},${lon}`)
    ]);

    return {
      openWeather: openWeather.status === 'fulfilled' ? openWeather.value.data : null,
      openMeteo: openMeteo.status === 'fulfilled' ? openMeteo.value.data : null,
      noaa: noaa.status === 'fulfilled' ? noaa.value.data : null,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Weather data fetch error:', error.message);
    return null;
  }
}

// Air Quality Data (Updated with OpenAQ v3 API)
async function fetchAirQuality(lat, lon) {
  try {
    const [openAQ, aqicn] = await Promise.allSettled([
      // OpenAQ API v3 - Find nearest locations
      axios.get(`https://api.openaq.org/v3/locations`, {
        params: { 
          coordinates: `${lat},${lon}`,
          radius: 25000,
          limit: 10
        },
        headers: { 'X-API-Key': process.env.OPENAQ_API_KEY }
      }),
      // AQICN API
      axios.get(`https://api.waqi.info/feed/geo:${lat};${lon}/`, {
        params: { token: process.env.AQICN_API_KEY }
      })
    ]);

    return {
      openAQ: openAQ.status === 'fulfilled' ? openAQ.value.data : null,
      aqicn: aqicn.status === 'fulfilled' ? aqicn.value.data : null,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Air quality fetch error:', error.message);
    return null;
  }
}

// Fetch specific OpenAQ location by ID
async function fetchOpenAQLocation(locationId) {
  try {
    const response = await axios.get(`https://api.openaq.org/v3/locations/${locationId}`, {
      headers: { 'X-API-Key': process.env.OPENAQ_API_KEY }
    });
    return response.data;
  } catch (error) {
    logger.error('OpenAQ location fetch error:', error.message);
    return null;
  }
}

// Fetch OpenAQ countries
async function fetchOpenAQCountries() {
  try {
    const response = await axios.get(`https://api.openaq.org/v3/countries`, {
      headers: { 'X-API-Key': process.env.OPENAQ_API_KEY }
    });
    return response.data;
  } catch (error) {
    logger.error('OpenAQ countries fetch error:', error.message);
    return null;
  }
}

// USGS Earthquake Data (for specific regions like UAE/Iran)
async function fetchEarthquakeData(minLat, maxLat, minLon, maxLon, minMagnitude = 2) {
  try {
    const response = await axios.get(`https://earthquake.usgs.gov/fdsnws/event/1/query`, {
      params: {
        format: 'geojson',
        minmagnitude: minMagnitude,
        minlatitude: minLat,
        maxlatitude: maxLat,
        minlongitude: minLon,
        maxlongitude: maxLon,
        orderby: 'time'
      }
    });

    return response.data || null;
  } catch (error) {
    logger.error('USGS Earthquake API error:', error.message);
    return null;
  }
}

// Fetch earthquakes for UAE/Iran region
async function fetchUAEIranEarthquakes() {
  return fetchEarthquakeData(22, 26, 51, 57, 2);
}

// Fetch earthquakes near coordinates
async function fetchNearbyEarthquakes(lat, lon, radiusDegrees = 2, minMagnitude = 2) {
  return fetchEarthquakeData(
    lat - radiusDegrees,
    lat + radiusDegrees,
    lon - radiusDegrees,
    lon + radiusDegrees,
    minMagnitude
  );
}

// News & Events Data (Using NewsAPI.org and GNews as fallback)
async function fetchNewsData(query = 'anomaly', country = 'us') {
  try {
    // Try NewsAPI.org first (v2/everything endpoint)
    if (process.env.NEWSAPI_KEY) {
      try {
        const response = await axios.get(`https://newsapi.org/v2/everything`, {
          params: {
            q: query,
            apiKey: process.env.NEWSAPI_KEY,
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: 10
          }
        });

        if (response.data.status === 'ok' && response.data.articles) {
          return response.data.articles;
        }
      } catch (newsApiError) {
        logger.warn('NewsAPI.org error, trying GNews fallback:', newsApiError.message);
      }
    }

    // Fallback to GNews API
    if (process.env.GNEWS_API_KEY) {
      const response = await axios.get(`https://gnews.io/api/v4/search`, {
        params: {
          q: query,
          lang: 'en',
          country: country,
          max: 10,
          apikey: process.env.GNEWS_API_KEY
        }
      });

      return response.data.articles || [];
    }

    return [];
  } catch (error) {
    logger.error('News API error:', error.message);
    return [];
  }
}

// Fetch news from NewsAPI.org specifically
async function fetchNewsAPIData(query = 'anomaly', options = {}) {
  try {
    if (!process.env.NEWSAPI_KEY) {
      logger.warn('NewsAPI key not configured');
      return [];
    }

    const params = {
      q: query,
      apiKey: process.env.NEWSAPI_KEY,
      language: options.language || 'en',
      sortBy: options.sortBy || 'publishedAt',
      pageSize: options.pageSize || 10,
      ...options
    };

    const response = await axios.get(`https://newsapi.org/v2/everything`, { params });

    if (response.data.status === 'ok') {
      return {
        status: response.data.status,
        totalResults: response.data.totalResults,
        articles: response.data.articles
      };
    }

    return { status: 'error', totalResults: 0, articles: [] };
  } catch (error) {
    logger.error('NewsAPI.org fetch error:', error.message);
    return { status: 'error', totalResults: 0, articles: [] };
  }
}

// GDELT Global Events
async function fetchGDELTEvents() {
  try {
    const response = await axios.get(`https://api.gdeltproject.org/api/v2/doc/doc`, {
      params: {
        query: 'anomaly OR disaster OR threat',
        mode: 'artlist',
        maxrecords: 50,
        format: 'json'
      }
    });

    return response.data || [];
  } catch (error) {
    logger.error('GDELT fetch error:', error.message);
    return [];
  }
}

// TomTom Traffic & Mapping APIs
async function fetchTomTomTraffic(lat, lon, zoom = 12) {
  try {
    if (!process.env.TOMTOM_API_KEY) {
      logger.warn('TomTom API key not configured');
      return null;
    }

    // Traffic Flow API - Get traffic flow data
    const trafficFlow = await axios.get(
      `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/${zoom}/json`,
      {
        params: {
          key: process.env.TOMTOM_API_KEY,
          point: `${lat},${lon}`
        }
      }
    );

    return {
      flow: trafficFlow.data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('TomTom traffic fetch error:', error.message);
    return null;
  }
}

// TomTom Traffic Incidents
async function fetchTomTomIncidents(bbox) {
  try {
    if (!process.env.TOMTOM_API_KEY) {
      logger.warn('TomTom API key not configured');
      return null;
    }

    // Traffic Incidents API - Get traffic incidents in bounding box
    const response = await axios.get(
      `https://api.tomtom.com/traffic/services/5/incidentDetails`,
      {
        params: {
          key: process.env.TOMTOM_API_KEY,
          bbox: bbox, // Format: minLon,minLat,maxLon,maxLat
          fields: '{incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description,code,iconCategory},startTime,endTime,from,to,length,delay,roadNumbers,timeValidity}}}',
          language: 'en-US',
          categoryFilter: '0,1,2,3,4,5,6,7,8,9,10,11,14',
          timeValidityFilter: 'present'
        }
      }
    );

    return response.data;
  } catch (error) {
    logger.error('TomTom incidents fetch error:', error.message);
    return null;
  }
}

// TomTom Routing API
async function fetchTomTomRoute(startLat, startLon, endLat, endLon) {
  try {
    if (!process.env.TOMTOM_API_KEY) {
      logger.warn('TomTom API key not configured');
      return null;
    }

    const response = await axios.get(
      `https://api.tomtom.com/routing/1/calculateRoute/${startLat},${startLon}:${endLat},${endLon}/json`,
      {
        params: {
          key: process.env.TOMTOM_API_KEY,
          traffic: true,
          travelMode: 'car',
          computeBestOrder: false
        }
      }
    );

    return response.data;
  } catch (error) {
    logger.error('TomTom routing fetch error:', error.message);
    return null;
  }
}

// TomTom Search API - Find places
async function fetchTomTomSearch(query, lat, lon, radius = 10000) {
  try {
    if (!process.env.TOMTOM_API_KEY) {
      logger.warn('TomTom API key not configured');
      return null;
    }

    const response = await axios.get(
      `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json`,
      {
        params: {
          key: process.env.TOMTOM_API_KEY,
          lat: lat,
          lon: lon,
          radius: radius,
          limit: 10
        }
      }
    );

    return response.data;
  } catch (error) {
    logger.error('TomTom search fetch error:', error.message);
    return null;
  }
}

// TomTom Reverse Geocoding
async function fetchTomTomReverseGeocode(lat, lon) {
  try {
    if (!process.env.TOMTOM_API_KEY) {
      logger.warn('TomTom API key not configured');
      return null;
    }

    const response = await axios.get(
      `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lon}.json`,
      {
        params: {
          key: process.env.TOMTOM_API_KEY
        }
      }
    );

    return response.data;
  } catch (error) {
    logger.error('TomTom reverse geocode error:', error.message);
    return null;
  }
}

// Detect traffic anomalies
function detectTrafficAnomaly(trafficData) {
  let confidence = 0.5;
  let description = 'Normal traffic conditions';

  if (!trafficData) {
    return { confidence, description };
  }

  // Check traffic flow data
  if (trafficData.flow?.flowSegmentData) {
    const flow = trafficData.flow.flowSegmentData;
    const currentSpeed = flow.currentSpeed;
    const freeFlowSpeed = flow.freeFlowSpeed;
    const speedRatio = currentSpeed / freeFlowSpeed;

    if (speedRatio < 0.3) {
      confidence = 0.90;
      description = `Severe traffic congestion detected (${Math.round(speedRatio * 100)}% of normal speed)`;
    } else if (speedRatio < 0.5) {
      confidence = 0.75;
      description = `Heavy traffic detected (${Math.round(speedRatio * 100)}% of normal speed)`;
    } else if (speedRatio < 0.7) {
      confidence = 0.65;
      description = `Moderate traffic detected (${Math.round(speedRatio * 100)}% of normal speed)`;
    }
  }

  return { confidence, description };
}

// Use Gemini for AI processing
async function processWithGemini(text, prompt = 'Analyze this text for anomalies') {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return null;
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const fullPrompt = `${prompt}: "${text}"`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    
    return {
      text: response.text(),
      model: 'gemini-pro'
    };
  } catch (error) {
    logger.error('Gemini API error:', error.message);
    return null;
  }
}

// Aggregate Multi-Source Data (with all APIs including TomTom)
async function aggregateAnomalyData(lat, lon, query) {
  try {
    const [weather, airQuality, earthquakes, traffic, news] = await Promise.all([
      fetchWeatherData(lat, lon),
      fetchAirQuality(lat, lon),
      fetchNearbyEarthquakes(lat, lon, 2, 2),
      fetchTomTomTraffic(lat, lon),
      fetchNewsData(query || 'anomaly')
    ]);

    return {
      location: { lat, lon },
      weather,
      airQuality,
      earthquakes,
      traffic,
      news,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Data aggregation error:', error.message);
    return null;
  }
}

// Analyze Anomaly with AI Agents (using Gemini)
async function analyzeWithAgentSwarm(data) {
  const agents = [];

  try {
    // Text Analysis Agents (using Gemini)
    if (data.news && data.news.length > 0) {
      const newsText = data.news.map(n => n.title + ' ' + n.description).join(' ').substring(0, 500);
      const textAnalysis = await processWithGemini(newsText, 'Analyze this news for anomalies or threats');
      agents.push({
        type: 'text',
        agentId: 'text-agent-001',
        confidence: textAnalysis ? 0.85 : 0.5,
        output: textAnalysis ? textAnalysis.text.substring(0, 150) : 'Text analysis completed',
        timestamp: new Date().toISOString()
      });
    }

    // Weather Analysis Agent
    if (data.weather) {
      const weatherAnomaly = detectWeatherAnomaly(data.weather);
      agents.push({
        type: 'sensor',
        agentId: 'weather-agent-001',
        confidence: weatherAnomaly.confidence,
        output: weatherAnomaly.description,
        timestamp: new Date().toISOString()
      });
    }

    // Air Quality Analysis Agent
    if (data.airQuality) {
      const aqAnomaly = detectAirQualityAnomaly(data.airQuality);
      agents.push({
        type: 'sensor',
        agentId: 'airquality-agent-001',
        confidence: aqAnomaly.confidence,
        output: aqAnomaly.description,
        timestamp: new Date().toISOString()
      });
    }

    // Earthquake Analysis Agent
    if (data.earthquakes) {
      const eqAnomaly = detectEarthquakeAnomaly(data.earthquakes);
      agents.push({
        type: 'seismic',
        agentId: 'earthquake-agent-001',
        confidence: eqAnomaly.confidence,
        output: eqAnomaly.description,
        timestamp: new Date().toISOString()
      });
    }

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

    // Calculate Consensus
    const avgConfidence = agents.length > 0 
      ? agents.reduce((sum, a) => sum + a.confidence, 0) / agents.length 
      : 0.5;
    
    return {
      agents,
      consensus: avgConfidence,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Agent swarm analysis error:', error.message);
    return { agents: [], consensus: 0.5, timestamp: new Date().toISOString() };
  }
}

// Helper: Detect Weather Anomalies
function detectWeatherAnomaly(weatherData) {
  let confidence = 0.5;
  let description = 'Normal weather conditions';

  if (weatherData.openWeather) {
    const temp = weatherData.openWeather.main?.temp;
    const pressure = weatherData.openWeather.main?.pressure;
    const windSpeed = weatherData.openWeather.wind?.speed;

    // Detect anomalies
    if (pressure < 980 || pressure > 1040) {
      confidence = 0.85;
      description = 'Unusual atmospheric pressure detected';
    }
    if (windSpeed > 20) {
      confidence = Math.max(confidence, 0.80);
      description = 'High wind speeds detected';
    }
  }

  return { confidence, description };
}

// Helper: Detect Air Quality Anomalies
function detectAirQualityAnomaly(aqData) {
  let confidence = 0.5;
  let description = 'Normal air quality';

  if (aqData.aqicn?.data?.aqi) {
    const aqi = aqData.aqicn.data.aqi;
    
    if (aqi > 150) {
      confidence = 0.90;
      description = `Unhealthy air quality detected (AQI: ${aqi})`;
    } else if (aqi > 100) {
      confidence = 0.75;
      description = `Moderate air quality concern (AQI: ${aqi})`;
    }
  }

  return { confidence, description };
}

// Helper: Detect Earthquake Anomalies
function detectEarthquakeAnomaly(earthquakeData) {
  let confidence = 0.5;
  let description = 'No significant seismic activity';

  if (earthquakeData?.features && earthquakeData.features.length > 0) {
    const earthquakes = earthquakeData.features;
    const maxMagnitude = Math.max(...earthquakes.map(eq => eq.properties.mag || 0));
    const recentCount = earthquakes.filter(eq => {
      const time = new Date(eq.properties.time);
      const hourAgo = new Date(Date.now() - 3600000);
      return time > hourAgo;
    }).length;

    if (maxMagnitude >= 5.0) {
      confidence = 0.95;
      description = `Major earthquake detected (Magnitude ${maxMagnitude.toFixed(1)})`;
    } else if (maxMagnitude >= 4.0) {
      confidence = 0.85;
      description = `Moderate earthquake detected (Magnitude ${maxMagnitude.toFixed(1)})`;
    } else if (recentCount >= 5) {
      confidence = 0.80;
      description = `Earthquake swarm detected (${recentCount} events in last hour)`;
    } else if (earthquakes.length > 0) {
      confidence = 0.65;
      description = `${earthquakes.length} earthquake(s) detected (Max magnitude: ${maxMagnitude.toFixed(1)})`;
    }
  }

  return { confidence, description };
}



// Fetch hotspots (used by stats)
async function fetchHotspots() {
  const locations = [
    { name: 'New York', lat: 40.7128, lon: -74.0060 },
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    { name: 'São Paulo', lat: -23.5505, lon: -46.6333 }
  ];

  const hotspots = await Promise.all(
    locations.map(async (loc) => {
      try {
        const data = await aggregateAnomalyData(loc.lat, loc.lon, 'anomaly');
        const analysis = await analyzeWithAgentSwarm(data);
        
        return {
          ...loc,
          data,
          analysis,
          severity: analysis.consensus > 0.8 ? 'High' : analysis.consensus > 0.6 ? 'Medium' : 'Low'
        };
      } catch (error) {
        logger.error(`Failed to fetch hotspot for ${loc.name}:`, error.message);
        return null;
      }
    })
  );

  return hotspots.filter(h => h !== null);
}

module.exports = {
  fetchWeatherData,
  fetchAirQuality,
  fetchOpenAQLocation,
  fetchOpenAQCountries,
  fetchEarthquakeData,
  fetchUAEIranEarthquakes,
  fetchNearbyEarthquakes,
  fetchNewsData,
  fetchNewsAPIData,
  fetchGDELTEvents,
  fetchTomTomTraffic,
  fetchTomTomIncidents,
  fetchTomTomRoute,
  fetchTomTomSearch,
  fetchTomTomReverseGeocode,
  processWithGemini,
  aggregateAnomalyData,
  analyzeWithAgentSwarm,
  fetchHotspots
};
