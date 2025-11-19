const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get AI service status and rate limits
router.get('/status', (req, res) => {
  try {
    const { getRateLimitStatus } = require('../services/aiService');
    const status = getRateLimitStatus();
    
    res.json({
      success: true,
      ...status,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get rate limit details
router.get('/rate-limits', (req, res) => {
  try {
    const { getRateLimitStatus } = require('../services/aiService');
    const status = getRateLimitStatus();
    
    res.json({
      success: true,
      rateLimits: status.gemini,
      providers: {
        gemini: {
          available: status.geminiAvailable,
          configured: !!process.env.GEMINI_API_KEY
        },
        openrouter: {
          available: status.openRouterAvailable,
          configured: !!process.env.OPENROUTER_API_KEY
        }
      },
      currentProvider: status.currentProvider,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all API sources health status
router.get('/sources', async (req, res) => {
  try {
    const sources = {
      // AI Services
      ai: {
        gemini: {
          name: 'Google Gemini AI',
          configured: !!process.env.GEMINI_API_KEY,
          status: 'unknown',
          endpoint: 'https://generativelanguage.googleapis.com',
          purpose: 'AI analysis and text generation'
        },
        openrouter: {
          name: 'OpenRouter AI',
          configured: !!process.env.OPENROUTER_API_KEY,
          status: 'unknown',
          endpoint: 'https://openrouter.ai/api/v1',
          purpose: 'Fallback AI provider'
        }
      },
      
      // Weather APIs
      weather: {
        openweathermap: {
          name: 'OpenWeatherMap',
          configured: !!process.env.OPENWEATHER_API_KEY,
          status: 'unknown',
          endpoint: 'https://api.openweathermap.org/data/3.0',
          purpose: 'Weather data and forecasts'
        },
        openmeteo: {
          name: 'Open-Meteo',
          configured: true, // No API key needed
          status: 'unknown',
          endpoint: 'https://api.open-meteo.com/v1',
          purpose: 'Free weather data'
        },
        noaa: {
          name: 'NOAA Weather',
          configured: true, // No API key needed
          status: 'unknown',
          endpoint: 'https://api.weather.gov',
          purpose: 'US weather data'
        }
      },
      
      // Environmental APIs
      environmental: {
        openaq: {
          name: 'OpenAQ',
          configured: !!process.env.OPENAQ_API_KEY,
          status: 'unknown',
          endpoint: 'https://api.openaq.org/v3',
          purpose: 'Air quality data'
        },
        aqicn: {
          name: 'AQICN',
          configured: !!process.env.AQICN_API_KEY,
          status: 'unknown',
          endpoint: 'https://api.waqi.info',
          purpose: 'Air quality index'
        }
      },
      
      // Disaster & Events APIs
      disasters: {
        usgs: {
          name: 'USGS Earthquakes',
          configured: true, // No API key needed
          status: 'unknown',
          endpoint: 'https://earthquake.usgs.gov/fdsnws/event/1',
          purpose: 'Earthquake data'
        },
        gdacs: {
          name: 'GDACS',
          configured: true, // No API key needed
          status: 'unknown',
          endpoint: 'https://www.gdacs.org/gdacsapi/api',
          purpose: 'Global disaster alerts'
        },
        gdelt: {
          name: 'GDELT',
          configured: true, // No API key needed
          status: 'unknown',
          endpoint: 'https://api.gdeltproject.org/api/v2',
          purpose: 'Global events database'
        }
      },
      
      // News APIs
      news: {
        gnews: {
          name: 'GNews',
          configured: !!process.env.GNEWS_API_KEY,
          status: 'unknown',
          endpoint: 'https://gnews.io/api/v4',
          purpose: 'News articles'
        },
        newsapi: {
          name: 'NewsAPI',
          configured: !!process.env.NEWSAPI_KEY,
          status: 'unknown',
          endpoint: 'https://newsapi.org/v2',
          purpose: 'News aggregation'
        }
      },
      
      // Traffic & Mapping APIs
      traffic: {
        tomtom: {
          name: 'TomTom',
          configured: !!process.env.TOMTOM_API_KEY,
          status: 'unknown',
          endpoint: 'https://api.tomtom.com',
          purpose: 'Traffic, routing, and mapping'
        }
      },
      
      // Workflow APIs
      workflow: {
        opus: {
          name: 'Opus Workflows',
          configured: !!(process.env.OPUS_SERVICE_KEY && process.env.OPUS_WORKFLOW_ID),
          status: 'unknown',
          endpoint: 'https://operator.opus.com',
          purpose: 'Workflow automation'
        }
      }
    };

    // Test API connectivity (quick health checks)
    const healthChecks = await Promise.allSettled([
      // Test Open-Meteo (free, no auth)
      axios.get('https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&current=temperature_2m', { timeout: 3000 }),
      // Test USGS (free, no auth)
      axios.get('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=1', { timeout: 3000 }),
      // Test GDACS (free, no auth)
      axios.get('https://www.gdacs.org/gdacsapi/api/events/geteventlist/latest', { timeout: 3000 })
    ]);

    // Update status based on health checks
    sources.weather.openmeteo.status = healthChecks[0].status === 'fulfilled' ? 'operational' : 'error';
    sources.disasters.usgs.status = healthChecks[1].status === 'fulfilled' ? 'operational' : 'error';
    sources.disasters.gdacs.status = healthChecks[2].status === 'fulfilled' ? 'operational' : 'error';

    // Count configured vs total
    const allSources = Object.values(sources).flatMap(category => Object.values(category));
    const configured = allSources.filter(s => s.configured).length;
    const operational = allSources.filter(s => s.status === 'operational').length;

    res.json({
      success: true,
      summary: {
        total: allSources.length,
        configured: configured,
        operational: operational,
        configurationRate: `${Math.round((configured / allSources.length) * 100)}%`
      },
      sources,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
