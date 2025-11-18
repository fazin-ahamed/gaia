const express = require('express');
const router = express.Router();

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

module.exports = router;
