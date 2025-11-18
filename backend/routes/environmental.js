const express = require('express');
const router = express.Router();
const {
  fetchWeatherData,
  fetchAirQuality,
  fetchOpenAQLocation,
  fetchOpenAQCountries,
  fetchEarthquakeData,
  fetchUAEIranEarthquakes,
  fetchNearbyEarthquakes,
  fetchNewsData,
  fetchNewsAPIData,
  aggregateAnomalyData
} = require('../services/externalAPIs');

// Get comprehensive weather data for a location
router.get('/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const weatherData = await fetchWeatherData(parseFloat(lat), parseFloat(lon));
    res.json(weatherData);
  } catch (error) {
    console.error('Weather fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Get air quality data for a location
router.get('/air-quality', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const airQualityData = await fetchAirQuality(parseFloat(lat), parseFloat(lon));
    res.json(airQualityData);
  } catch (error) {
    console.error('Air quality fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch air quality data' });
  }
});

// Get specific OpenAQ location by ID
router.get('/air-quality/location/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const locationData = await fetchOpenAQLocation(id);
    res.json(locationData);
  } catch (error) {
    console.error('OpenAQ location fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch location data' });
  }
});

// Get all OpenAQ countries
router.get('/air-quality/countries', async (req, res) => {
  try {
    const countries = await fetchOpenAQCountries();
    res.json(countries);
  } catch (error) {
    console.error('OpenAQ countries fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch countries data' });
  }
});

// Get earthquake data for custom region
router.get('/earthquakes', async (req, res) => {
  try {
    const { minLat, maxLat, minLon, maxLon, minMagnitude } = req.query;
    
    if (!minLat || !maxLat || !minLon || !maxLon) {
      return res.status(400).json({ 
        error: 'minLat, maxLat, minLon, and maxLon are required' 
      });
    }

    const earthquakeData = await fetchEarthquakeData(
      parseFloat(minLat),
      parseFloat(maxLat),
      parseFloat(minLon),
      parseFloat(maxLon),
      minMagnitude ? parseFloat(minMagnitude) : 2
    );
    
    res.json(earthquakeData);
  } catch (error) {
    console.error('Earthquake fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch earthquake data' });
  }
});

// Get earthquake data for UAE/Iran region
router.get('/earthquakes/uae-iran', async (req, res) => {
  try {
    const earthquakeData = await fetchUAEIranEarthquakes();
    res.json(earthquakeData);
  } catch (error) {
    console.error('UAE/Iran earthquake fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch UAE/Iran earthquake data' });
  }
});

// Get nearby earthquakes for a location
router.get('/earthquakes/nearby', async (req, res) => {
  try {
    const { lat, lon, radius, minMagnitude } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const earthquakeData = await fetchNearbyEarthquakes(
      parseFloat(lat),
      parseFloat(lon),
      radius ? parseFloat(radius) : 2,
      minMagnitude ? parseFloat(minMagnitude) : 2
    );
    
    res.json(earthquakeData);
  } catch (error) {
    console.error('Nearby earthquake fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch nearby earthquake data' });
  }
});

// Get news data
router.get('/news', async (req, res) => {
  try {
    const { query, country } = req.query;
    
    const newsData = await fetchNewsData(query || 'anomaly', country || 'us');
    res.json({
      status: 'ok',
      totalResults: newsData.length,
      articles: newsData
    });
  } catch (error) {
    console.error('News fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch news data' });
  }
});

// Get news from NewsAPI.org specifically
router.get('/news/newsapi', async (req, res) => {
  try {
    const { query, language, sortBy, pageSize } = req.query;
    
    const newsData = await fetchNewsAPIData(query || 'anomaly', {
      language,
      sortBy,
      pageSize: pageSize ? parseInt(pageSize) : 10
    });
    
    res.json(newsData);
  } catch (error) {
    console.error('NewsAPI fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch NewsAPI data' });
  }
});

// Get comprehensive environmental data (all sources)
router.get('/comprehensive', async (req, res) => {
  try {
    const { lat, lon, query } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const comprehensiveData = await aggregateAnomalyData(
      parseFloat(lat),
      parseFloat(lon),
      query || 'environmental'
    );
    
    res.json(comprehensiveData);
  } catch (error) {
    console.error('Comprehensive data fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch comprehensive environmental data' });
  }
});

module.exports = router;
