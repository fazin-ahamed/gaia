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

// Weather Data Collection
async function fetchWeatherData(lat, lon) {
  try {
    const [openWeather, weatherBit, noaa] = await Promise.allSettled([
      // OpenWeather API
      axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: { lat, lon, appid: process.env.OPENWEATHER_API_KEY }
      }),
      // WeatherBit API
      axios.get(`https://api.weatherbit.io/v2.0/current`, {
        params: { lat, lon, key: process.env.WEATHERBIT_API_KEY }
      }),
      // NOAA API (if coordinates in US)
      axios.get(`https://api.weather.gov/points/${lat},${lon}`)
    ]);

    return {
      openWeather: openWeather.status === 'fulfilled' ? openWeather.value.data : null,
      weatherBit: weatherBit.status === 'fulfilled' ? weatherBit.value.data : null,
      noaa: noaa.status === 'fulfilled' ? noaa.value.data : null,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Weather data fetch error:', error.message);
    return null;
  }
}

// Air Quality Data
async function fetchAirQuality(lat, lon) {
  try {
    const [openAQ, aqicn] = await Promise.allSettled([
      // OpenAQ API
      axios.get(`https://api.openaq.org/v2/latest`, {
        params: { coordinates: `${lat},${lon}`, radius: 25000 },
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

// News & Events Data (Disabled - API removed)
async function fetchNewsData(query = 'anomaly OR unusual OR strange') {
  // News API disabled to prevent fetch errors
  logger.info('News API disabled - returning empty array');
  return [];
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

// Traffic Data - Removed (not using TomTom API)

// Use Gemini for AI processing
async function processWithGemini(text, prompt = 'Analyze this text for anomalies') {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return null;
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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

// Aggregate Multi-Source Data (without traffic and news)
async function aggregateAnomalyData(lat, lon, query) {
  try {
    const [weather, airQuality] = await Promise.all([
      fetchWeatherData(lat, lon),
      fetchAirQuality(lat, lon)
    ]);

    return {
      location: { lat, lon },
      weather,
      airQuality,
      news: [], // News API disabled
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
  fetchNewsData,
  fetchGDELTEvents,
  processWithGemini,
  aggregateAnomalyData,
  analyzeWithAgentSwarm,
  fetchHotspots
};
