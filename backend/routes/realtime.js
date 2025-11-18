const express = require('express');
const router = express.Router();
const {
  fetchWeatherData,
  fetchAirQuality,
  fetchNewsData,
  fetchGDELTEvents,
  aggregateAnomalyData,
  analyzeWithAgentSwarm
} = require('../services/externalAPIs');

// Get real-time weather data
router.get('/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const data = await fetchWeatherData(parseFloat(lat), parseFloat(lon));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get air quality data
router.get('/air-quality', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const data = await fetchAirQuality(parseFloat(lat), parseFloat(lon));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get news data
router.get('/news', async (req, res) => {
  // News API disabled to prevent fetch errors
  res.json({ 
    articles: [], 
    message: 'News API temporarily disabled',
    status: 'disabled'
  });
});

// Get GDELT events
router.get('/events', async (req, res) => {
  try {
    const data = await fetchGDELTEvents();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aggregate multi-source data
router.post('/aggregate', async (req, res) => {
  try {
    const { lat, lon, query } = req.body;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const data = await aggregateAnomalyData(
      parseFloat(lat),
      parseFloat(lon),
      query || 'anomaly'
    );
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyze with agent swarm
router.post('/analyze', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'Data required for analysis' });
    }

    const analysis = await analyzeWithAgentSwarm(data);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get global hotspots (aggregated anomalies)
router.get('/hotspots', async (req, res) => {
  try {
    // Major cities for monitoring
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
        const data = await aggregateAnomalyData(loc.lat, loc.lon, 'anomaly');
        const analysis = await analyzeWithAgentSwarm(data);
        
        return {
          ...loc,
          data,
          analysis,
          severity: analysis.consensus > 0.8 ? 'High' : analysis.consensus > 0.6 ? 'Medium' : 'Low'
        };
      })
    );

    res.json(hotspots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
