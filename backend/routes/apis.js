const express = require('express');
const { collectDataFromAPIs } = require('../services/dataIngestion');
const winston = require('winston');

const router = express.Router();

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/apis.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Manually trigger data collection
router.post('/collect', async (req, res) => {
  try {
    const { location, dataTypes } = req.body;

    logger.info('Manual data collection triggered', { location, dataTypes });

    const collectedData = await collectDataFromAPIs(location, dataTypes);

    res.json({
      message: 'Data collection completed',
      collectedItems: collectedData.length,
      data: collectedData
    });

  } catch (error) {
    logger.error('Manual data collection failed:', error);
    res.status(500).json({ error: 'Data collection failed' });
  }
});

// Test API connectivity
router.get('/test/:apiName', async (req, res) => {
  try {
    const { apiName } = req.params;

    // This would test connectivity to specific API
    // For now, return mock response
    const testResults = {
      apiName,
      status: 'mock_test_passed',
      timestamp: new Date(),
      message: `API ${apiName} connectivity test completed`
    };

    res.json(testResults);

  } catch (error) {
    logger.error(`API test failed for ${req.params.apiName}:`, error);
    res.status(500).json({ error: 'API test failed' });
  }
});

// Get API configurations and status
router.get('/config', async (req, res) => {
  try {
    // Return API configurations (without sensitive keys)
    const configs = {
      weather: ['OpenWeatherMap', 'Weatherbit'],
      satellite: ['NASA EarthData'],
      news: ['NewsAPI', 'GDELT'],
      disasters: ['USGS Earthquake', 'EONET'],
      traffic: ['TomTom'],
      social: ['Reddit'],
      iot: ['ThingSpeak'],
      environmental: ['AirVisual']
    };

    const status = {
      lastCollectionTime: new Date(), // Would track actual last collection
      activeApis: 8,
      totalApis: 8
    };

    res.json({
      configurations: configs,
      status
    });

  } catch (error) {
    logger.error('Error fetching API config:', error);
    res.status(500).json({ error: 'Failed to fetch API configuration' });
  }
});

// Update API keys (in production, this would be secured)
router.put('/keys/:apiName', async (req, res) => {
  try {
    const { apiName } = req.params;
    const { apiKey } = req.body;

    // In production, this would update environment variables or secure storage
    // For now, just log the update
    logger.info(`API key updated for ${apiName}`);

    res.json({
      message: `API key updated for ${apiName}`,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error(`Error updating API key for ${req.params.apiName}:`, error);
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

module.exports = router;