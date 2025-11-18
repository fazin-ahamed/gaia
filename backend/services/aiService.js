const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const winston = require('winston');

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/ai-service.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Rate limiting configuration
const RATE_LIMITS = {
  gemini: {
    perMinute: 5,
    perDay: 20,
    currentMinute: 0,
    currentDay: 0,
    lastMinuteReset: Date.now(),
    lastDayReset: Date.now(),
    consecutiveFailures: 0,
    maxConsecutiveFailures: 5,
    failureTimeout: null,
    failureTimeoutDuration: 5 * 60 * 1000 // 5 minutes
  }
};

// AI providers
let geminiClient = null;
let currentProvider = 'gemini'; // 'gemini' or 'openrouter'

// Initialize Gemini
function initializeGemini() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.warn('GEMINI_API_KEY not found, will use OpenRouter only');
      return null;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    geminiClient = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    logger.info('Gemini AI initialized successfully');
    return geminiClient;
  } catch (error) {
    logger.error('Failed to initialize Gemini:', error);
    return null;
  }
}

// Check and update rate limits
function checkRateLimit() {
  const now = Date.now();
  
  // Reset minute counter if 60 seconds have passed
  if (now - RATE_LIMITS.gemini.lastMinuteReset > 60000) {
    RATE_LIMITS.gemini.currentMinute = 0;
    RATE_LIMITS.gemini.lastMinuteReset = now;
  }
  
  // Reset day counter if 24 hours have passed
  if (now - RATE_LIMITS.gemini.lastDayReset > 86400000) {
    RATE_LIMITS.gemini.currentDay = 0;
    RATE_LIMITS.gemini.lastDayReset = now;
  }
  
  // Check if in failure timeout (too many consecutive failures)
  if (RATE_LIMITS.gemini.failureTimeout && now < RATE_LIMITS.gemini.failureTimeout) {
    const remainingTime = Math.ceil((RATE_LIMITS.gemini.failureTimeout - now) / 1000);
    logger.warn(`Gemini temporarily disabled due to ${RATE_LIMITS.gemini.consecutiveFailures} consecutive failures. Retry in ${remainingTime}s`);
    return false;
  } else if (RATE_LIMITS.gemini.failureTimeout && now >= RATE_LIMITS.gemini.failureTimeout) {
    // Timeout expired, reset failure counter
    logger.info('Gemini failure timeout expired, resetting failure counter');
    RATE_LIMITS.gemini.consecutiveFailures = 0;
    RATE_LIMITS.gemini.failureTimeout = null;
  }
  
  // Check if limits exceeded
  if (RATE_LIMITS.gemini.currentMinute >= RATE_LIMITS.gemini.perMinute) {
    logger.warn('Gemini per-minute rate limit exceeded, switching to OpenRouter');
    return false;
  }
  
  if (RATE_LIMITS.gemini.currentDay >= RATE_LIMITS.gemini.perDay) {
    logger.warn('Gemini daily rate limit exceeded, switching to OpenRouter');
    return false;
  }
  
  return true;
}

// Increment rate limit counters
function incrementRateLimit() {
  RATE_LIMITS.gemini.currentMinute++;
  RATE_LIMITS.gemini.currentDay++;
  logger.info(`Gemini usage: ${RATE_LIMITS.gemini.currentMinute}/min, ${RATE_LIMITS.gemini.currentDay}/day`);
}

// Call Gemini API
async function callGemini(prompt, imageParts = null) {
  try {
    if (!geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    if (!checkRateLimit()) {
      throw new Error('Rate limit exceeded');
    }

    let result;
    if (imageParts && imageParts.length > 0) {
      result = await geminiClient.generateContent([prompt, ...imageParts]);
    } else {
      result = await geminiClient.generateContent(prompt);
    }

    incrementRateLimit();
    
    const response = await result.response;
    const text = response.text();
    
    // Success! Reset failure counter
    RATE_LIMITS.gemini.consecutiveFailures = 0;
    RATE_LIMITS.gemini.failureTimeout = null;
    
    return {
      text,
      provider: 'gemini',
      success: true
    };

  } catch (error) {
    // Increment failure counter
    RATE_LIMITS.gemini.consecutiveFailures++;
    
    logger.error(`Gemini API error (failure ${RATE_LIMITS.gemini.consecutiveFailures}/${RATE_LIMITS.gemini.maxConsecutiveFailures}):`, error.message);
    
    // If too many consecutive failures, disable Gemini temporarily
    if (RATE_LIMITS.gemini.consecutiveFailures >= RATE_LIMITS.gemini.maxConsecutiveFailures) {
      RATE_LIMITS.gemini.failureTimeout = Date.now() + RATE_LIMITS.gemini.failureTimeoutDuration;
      logger.error(`Gemini disabled for ${RATE_LIMITS.gemini.failureTimeoutDuration / 1000}s due to ${RATE_LIMITS.gemini.consecutiveFailures} consecutive failures`);
    }
    
    throw error;
  }
}

// Call OpenRouter API
async function callOpenRouter(prompt, model = 'tngtech/deepseek-r1t2-chimera:free') {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3001',
          'X-Title': 'GAIA Anomaly Detection'
        },
        timeout: 30000
      }
    );

    const text = response.data.choices[0].message.content;
    
    logger.info('OpenRouter API call successful');
    
    return {
      text,
      provider: 'openrouter',
      model: model,
      success: true
    };

  } catch (error) {
    logger.error('OpenRouter API error:', error.message);
    throw error;
  }
}

// Smart AI call with automatic fallback
async function generateContent(prompt, options = {}) {
  const { imageParts = null, forceProvider = null } = options;

  // If specific provider requested
  if (forceProvider === 'openrouter') {
    try {
      return await callOpenRouter(prompt);
    } catch (error) {
      logger.error('OpenRouter failed:', error.message);
      throw new Error('OpenRouter unavailable');
    }
  }

  if (forceProvider === 'gemini') {
    try {
      return await callGemini(prompt, imageParts);
    } catch (error) {
      logger.error('Gemini failed:', error.message);
      throw new Error('Gemini unavailable');
    }
  }

  // Smart fallback logic
  try {
    // Try Gemini first if available and within limits
    if (geminiClient && checkRateLimit()) {
      try {
        return await callGemini(prompt, imageParts);
      } catch (geminiError) {
        logger.warn('Gemini failed, falling back to OpenRouter:', geminiError.message);
        // Fall through to OpenRouter
      }
    } else {
      logger.info('Gemini rate limit reached, using OpenRouter');
    }

    // Fallback to OpenRouter
    return await callOpenRouter(prompt);

  } catch (error) {
    logger.error('All AI providers failed:', error.message);
    throw new Error('AI service unavailable - all providers failed');
  }
}

// Analyze anomaly data with smart provider selection
async function analyzeAnomalyData(data) {
  try {
    const {
      modalities,
      location,
      timestamp,
      sourceApis,
      existingContext
    } = data;

    let prompt = `Analyze the following data for potential anomalies. Consider multiple modalities and cross-verify information.

Context:
- Location: ${location ? `${location.lat}, ${location.lng}` : 'Unknown'}
- Timestamp: ${timestamp}
- Data Sources: ${sourceApis ? sourceApis.join(', ') : 'Unknown'}

`;

    if (modalities && modalities.text) {
      prompt += `Text Data: ${modalities.text}\n\n`;
    }

    if (modalities && modalities.images && modalities.images.length > 0) {
      prompt += `Image Analysis Required: ${modalities.images.length} images available\n`;
    }

    if (existingContext) {
      prompt += `Previous Analysis Context: ${JSON.stringify(existingContext)}\n\n`;
    }

    prompt += `
Please provide:
1. Anomaly Detection: Is this an anomaly? (Yes/No/Maybe)
2. Severity: Low/Medium/High/Critical
3. Confidence Score: 0.0-1.0
4. Description: Detailed explanation
5. Cross-verification: How multiple data sources corroborate each other
6. Recommended Actions: What should be done next

Response format: JSON with keys: isAnomaly, severity, confidence, description, crossVerification, recommendedActions
`;

    const imageParts = modalities?.images?.map(img => ({
      inlineData: {
        data: img.data,
        mimeType: img.mimeType || 'image/jpeg'
      }
    }));

    const result = await generateContent(prompt, { imageParts });

    // Parse JSON response
    let analysis;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (parseError) {
      logger.warn('Failed to parse AI response as JSON, using fallback');
      analysis = {
        isAnomaly: result.text.toLowerCase().includes('yes') || result.text.toLowerCase().includes('anomaly'),
        severity: 'medium',
        confidence: 0.5,
        description: result.text,
        crossVerification: 'Unable to determine',
        recommendedActions: ['Manual review required']
      };
    }

    logger.info('AI analysis completed', { provider: result.provider, analysis });

    return {
      ...analysis,
      rawResponse: result.text,
      timestamp: new Date(),
      provider: result.provider,
      model: result.model || 'gemini-2.5-flash-lite'
    };

  } catch (error) {
    logger.error('AI analysis failed:', error);
    throw error;
  }
}

// Generate report
async function generateReport(anomalyData, format = 'json') {
  try {
    const prompt = `Generate a comprehensive anomaly report based on the following data:

${JSON.stringify(anomalyData, null, 2)}

Please create a detailed report including:
1. Executive Summary
2. Anomaly Details
3. Evidence and Cross-verification
4. Impact Assessment
5. Recommendations
6. Timeline

Format the response as a structured ${format.toUpperCase()} report.`;

    const result = await generateContent(prompt);

    logger.info(`Report generated in ${format} format using ${result.provider}`);

    return {
      content: result.text,
      format,
      generatedAt: new Date(),
      anomalyId: anomalyData.id,
      provider: result.provider
    };

  } catch (error) {
    logger.error('Report generation failed:', error);
    throw error;
  }
}

// Cross-verify data
async function crossVerifyData(dataSources) {
  try {
    const prompt = `Cross-verify the following data sources for consistency and potential anomalies:

Data Sources:
${JSON.stringify(dataSources, null, 2)}

Please analyze:
1. Consistency across sources
2. Potential conflicts or anomalies
3. Confidence in combined assessment
4. Any gaps in data coverage

Response format: JSON with keys: consistency, conflicts, combinedConfidence, gaps, recommendations`;

    const result = await generateContent(prompt);

    let verification;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      verification = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (parseError) {
      verification = {
        consistency: 'Unable to determine',
        conflicts: [],
        combinedConfidence: 0.5,
        gaps: ['Analysis failed'],
        recommendations: ['Manual review required']
      };
    }

    logger.info('Cross-verification completed', { provider: result.provider, verification });

    return {
      ...verification,
      provider: result.provider
    };

  } catch (error) {
    logger.error('Cross-verification failed:', error);
    throw error;
  }
}

// Analyze image
async function analyzeImage(imageBuffer, filename) {
  try {
    const imageParts = [{
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg'
      }
    }];

    const prompt = "Analyze this image for any anomalies, unusual patterns, disasters, emergencies, or dangerous situations. Describe what you see and rate the severity from 0-10.";
    
    const result = await generateContent(prompt, { imageParts });

    // Parse response for anomaly detection
    const text = result.text;
    const textLower = text.toLowerCase();
    
    const anomalyKeywords = [
      'fire', 'smoke', 'explosion', 'damage', 'destruction', 'disaster',
      'flood', 'storm', 'earthquake', 'accident', 'crash', 'weapon',
      'emergency', 'danger', 'hazard', 'unusual', 'abnormal', 'strange'
    ];

    let anomalyCount = 0;
    anomalyKeywords.forEach(keyword => {
      if (textLower.includes(keyword)) anomalyCount++;
    });

    const severityMatch = text.match(/severity[:\s]+(\d+)/i) || text.match(/(\d+)\/10/);
    const severityRating = severityMatch ? parseInt(severityMatch[1]) : 5;

    const isAnomaly = anomalyCount > 0 || severityRating > 6;
    const confidence = Math.min(0.95, (anomalyCount * 0.1 + severityRating * 0.08));

    let severity = 'Low';
    if (severityRating >= 8) severity = 'Critical';
    else if (severityRating >= 6) severity = 'High';
    else if (severityRating >= 4) severity = 'Medium';

    return {
      type: 'image',
      filename,
      analysis: text,
      anomalyScore: {
        confidence,
        isAnomaly,
        reasoning: text.substring(0, 200),
        severity,
        severityRating
      },
      confidence,
      isAnomaly,
      reasoning: text.substring(0, 200),
      timestamp: new Date().toISOString(),
      provider: result.provider
    };

  } catch (error) {
    logger.error('Image analysis error:', error.message);
    return {
      type: 'image',
      filename,
      error: error.message,
      anomalyScore: { confidence: 0.5, isAnomaly: false, reasoning: 'Analysis failed - manual review needed' },
      timestamp: new Date().toISOString()
    };
  }
}

// Analyze text
async function analyzeText(text) {
  try {
    const prompt = `Analyze this text for anomalies, threats, emergencies, or unusual patterns. 
Text: "${text}"

Provide:
1. Is this content normal or anomalous? (normal/anomalous)
2. Confidence level (0-100%)
3. Severity (Low/Medium/High/Critical)
4. Is this fake or fabricated content? (yes/no)
5. Brief reasoning

Format: [Classification]|[Confidence]|[Severity]|[IsFake]|[Reasoning]`;

    const result = await generateContent(prompt);
    const analysisText = result.text;

    // Try to parse structured response
    let anomalyScore;
    try {
      const parts = analysisText.split('|');
      
      if (parts.length >= 5) {
        const classification = parts[0].toLowerCase();
        const confidence = parseFloat(parts[1]) / 100;
        const severity = parts[2].trim();
        const isFake = parts[3].toLowerCase().includes('yes');
        const reasoning = parts[4].trim();

        anomalyScore = {
          confidence: Math.min(0.95, confidence),
          isAnomaly: classification.includes('anomalous'),
          reasoning,
          severity,
          isFake
        };
      } else {
        throw new Error('Invalid format');
      }
    } catch (error) {
      // Fallback to keyword analysis
      anomalyScore = {
        confidence: 0.5,
        isAnomaly: analysisText.toLowerCase().includes('anomal'),
        reasoning: analysisText.substring(0, 200),
        severity: 'Medium',
        isFake: false
      };
    }

    return {
      type: 'text',
      analysis: analysisText,
      anomalyScore,
      confidence: anomalyScore.confidence,
      isAnomaly: anomalyScore.isAnomaly,
      reasoning: anomalyScore.reasoning,
      timestamp: new Date().toISOString(),
      provider: result.provider
    };

  } catch (error) {
    logger.error('Text analysis error:', error.message);
    
    return {
      type: 'text',
      error: error.message,
      anomalyScore: { confidence: 0.5, isAnomaly: false, reasoning: 'Analysis failed' },
      timestamp: new Date().toISOString()
    };
  }
}

// Get current rate limit status
function getRateLimitStatus() {
  return {
    gemini: {
      perMinute: {
        used: RATE_LIMITS.gemini.currentMinute,
        limit: RATE_LIMITS.gemini.perMinute,
        remaining: RATE_LIMITS.gemini.perMinute - RATE_LIMITS.gemini.currentMinute
      },
      perDay: {
        used: RATE_LIMITS.gemini.currentDay,
        limit: RATE_LIMITS.gemini.perDay,
        remaining: RATE_LIMITS.gemini.perDay - RATE_LIMITS.gemini.currentDay
      },
      nextMinuteReset: new Date(RATE_LIMITS.gemini.lastMinuteReset + 60000),
      nextDayReset: new Date(RATE_LIMITS.gemini.lastDayReset + 86400000)
    },
    currentProvider: currentProvider,
    geminiAvailable: geminiClient !== null && checkRateLimit(),
    openRouterAvailable: !!process.env.OPENROUTER_API_KEY
  };
}

// Initialize AI service
async function initializeAIService() {
  try {
    geminiClient = initializeGemini();
    
    // Test OpenRouter if configured
    if (process.env.OPENROUTER_API_KEY) {
      logger.info('OpenRouter API key found, fallback available');
    } else {
      logger.warn('OpenRouter API key not found, no fallback available');
    }

    // Store globally
    global.aiService = {
      generateContent,
      analyzeAnomalyData,
      generateReport,
      crossVerifyData,
      analyzeImage,
      analyzeText,
      getRateLimitStatus
    };

    logger.info('AI Service initialized successfully');
    return true;

  } catch (error) {
    logger.error('Failed to initialize AI Service:', error);
    throw error;
  }
}

module.exports = {
  initializeAIService,
  generateContent,
  analyzeAnomalyData,
  generateReport,
  crossVerifyData,
  analyzeImage,
  analyzeText,
  getRateLimitStatus
};
