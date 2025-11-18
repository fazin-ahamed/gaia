const axios = require('axios');
const FormData = require('form-data');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/file-analysis.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

// Analyze image for anomalies using AI Service
async function analyzeImage(imageBuffer, filename) {
  try {
    const { analyzeImage: aiAnalyzeImage } = require('./aiService');
    return await aiAnalyzeImage(imageBuffer, filename);
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

// Parse Gemini image response
function parseGeminiImageResponse(text, filename) {
  const textLower = text.toLowerCase();
  
  // Check for anomaly keywords
  const anomalyKeywords = [
    'fire', 'smoke', 'explosion', 'damage', 'destruction', 'disaster',
    'flood', 'storm', 'earthquake', 'accident', 'crash', 'weapon',
    'emergency', 'danger', 'hazard', 'unusual', 'abnormal', 'strange'
  ];

  const normalKeywords = [
    'normal', 'typical', 'regular', 'ordinary', 'safe', 'calm'
  ];

  let anomalyCount = 0;
  let normalCount = 0;

  anomalyKeywords.forEach(keyword => {
    if (textLower.includes(keyword)) anomalyCount++;
  });

  normalKeywords.forEach(keyword => {
    if (textLower.includes(keyword)) normalCount++;
  });

  // Extract severity rating if present
  const severityMatch = text.match(/severity[:\s]+(\d+)/i) || text.match(/(\d+)\/10/);
  const severityRating = severityMatch ? parseInt(severityMatch[1]) : 5;

  const isAnomaly = anomalyCount > normalCount || severityRating > 6;
  const confidence = Math.min(0.95, (anomalyCount * 0.1 + severityRating * 0.08));

  let severity = 'Low';
  if (severityRating >= 8) severity = 'Critical';
  else if (severityRating >= 6) severity = 'High';
  else if (severityRating >= 4) severity = 'Medium';

  return {
    confidence,
    isAnomaly,
    reasoning: text.substring(0, 200),
    severity,
    severityRating
  };
}

// Analyze text for anomalies using AI Service
async function analyzeText(text) {
  try {
    const { analyzeText: aiAnalyzeText } = require('./aiService');
    return await aiAnalyzeText(text);
  } catch (error) {
    logger.error('Text analysis error:', error.message);
    
    // Fallback analysis
    const anomalyScore = calculateTextAnomalyScore(null, null, text);
    return {
      type: 'text',
      anomalyScore,
      confidence: anomalyScore.confidence,
      isAnomaly: anomalyScore.isAnomaly,
      reasoning: anomalyScore.reasoning,
      timestamp: new Date().toISOString()
    };
  }
}

// Parse Gemini text response
function parseGeminiTextResponse(analysisText, originalText) {
  try {
    // Try to parse structured response
    const parts = analysisText.split('|');
    
    if (parts.length >= 5) {
      const classification = parts[0].toLowerCase();
      const confidence = parseFloat(parts[1]) / 100;
      const severity = parts[2].trim();
      const isFake = parts[3].toLowerCase().includes('yes');
      const reasoning = parts[4].trim();

      return {
        confidence: Math.min(0.95, confidence),
        isAnomaly: classification.includes('anomalous'),
        reasoning,
        severity,
        isFake
      };
    }
  } catch (error) {
    // Fallback to keyword analysis
  }

  // Fallback: analyze the response text
  return calculateTextAnomalyScore(null, null, originalText);
}

// Analyze PDF document
async function analyzePDF(pdfBuffer, filename) {
  try {
    // Extract text from PDF (simplified - in production use pdf-parse)
    const textContent = pdfBuffer.toString('utf-8', 0, 1000); // First 1000 chars
    
    const textAnalysis = await analyzeText(textContent);
    
    return {
      type: 'pdf',
      filename,
      ...textAnalysis,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('PDF analysis error:', error.message);
    return {
      type: 'pdf',
      filename,
      error: error.message,
      anomalyScore: { confidence: 0, isAnomaly: false },
      timestamp: new Date().toISOString()
    };
  }
}

// Calculate image anomaly score
function calculateImageAnomalyScore(predictions) {
  if (!predictions || predictions.length === 0) {
    return {
      confidence: 0,
      isAnomaly: false,
      reasoning: 'No predictions available',
      severity: 'Low'
    };
  }

  // Keywords that might indicate anomalies
  const anomalyKeywords = [
    'fire', 'smoke', 'explosion', 'damage', 'destruction', 'disaster',
    'flood', 'storm', 'earthquake', 'accident', 'crash', 'weapon',
    'blood', 'injury', 'emergency', 'warning', 'danger', 'hazard'
  ];

  const normalKeywords = [
    'person', 'people', 'building', 'car', 'tree', 'sky', 'grass',
    'animal', 'food', 'furniture', 'room', 'street', 'landscape'
  ];

  let anomalyScore = 0;
  let normalScore = 0;
  let maxConfidence = 0;
  let topLabel = '';

  predictions.forEach(pred => {
    const label = pred.label.toLowerCase();
    const score = pred.score;

    if (score > maxConfidence) {
      maxConfidence = score;
      topLabel = pred.label;
    }

    // Check for anomaly keywords
    anomalyKeywords.forEach(keyword => {
      if (label.includes(keyword)) {
        anomalyScore += score * 2; // Weight anomaly keywords higher
      }
    });

    // Check for normal keywords
    normalKeywords.forEach(keyword => {
      if (label.includes(keyword)) {
        normalScore += score;
      }
    });
  });

  const isAnomaly = anomalyScore > normalScore;
  const confidence = isAnomaly ? Math.min(anomalyScore, 0.95) : Math.max(0.3, normalScore);

  let severity = 'Low';
  if (confidence > 0.8) severity = 'Critical';
  else if (confidence > 0.6) severity = 'High';
  else if (confidence > 0.4) severity = 'Medium';

  return {
    confidence,
    isAnomaly,
    reasoning: isAnomaly 
      ? `Image contains potential anomaly indicators. Top prediction: ${topLabel} (${(maxConfidence * 100).toFixed(1)}%)`
      : `Image appears normal. Top prediction: ${topLabel} (${(maxConfidence * 100).toFixed(1)}%)`,
    severity,
    topPrediction: topLabel,
    anomalyScore,
    normalScore
  };
}

// Calculate text anomaly score (keyword-based fallback)
function calculateTextAnomalyScore(sentiment, classification, text) {
  let confidence = 0.5;
  let isAnomaly = false;
  let reasoning = 'Text analysis completed';
  let severity = 'Low';

  // Check for anomaly keywords in text
  const anomalyKeywords = [
    'explosion', 'disaster', 'emergency', 'unusual', 'strange', 'anomaly',
    'threat', 'danger', 'warning', 'alert', 'critical', 'urgent', 'fire',
    'smoke', 'earthquake', 'flood', 'storm', 'accident', 'crash', 'attack'
  ];

  const fakeKeywords = [
    'fake', 'hoax', 'fabricated', 'false', 'misleading', 'photoshop',
    'edited', 'manipulated', 'doctored', 'staged'
  ];

  const normalKeywords = [
    'normal', 'regular', 'typical', 'routine', 'standard', 'ordinary',
    'safe', 'calm', 'peaceful', 'stable'
  ];

  const textLower = text.toLowerCase();
  
  const anomalyMatches = anomalyKeywords.filter(keyword => textLower.includes(keyword));
  const fakeMatches = fakeKeywords.filter(keyword => textLower.includes(keyword));
  const normalMatches = normalKeywords.filter(keyword => textLower.includes(keyword));

  // Check for fake content
  if (fakeMatches.length > 1) {
    confidence = 0.2;
    isAnomaly = false;
    reasoning = `Content appears fabricated or fake (keywords: ${fakeMatches.join(', ')})`;
    severity = 'Low';
    return { confidence, isAnomaly, reasoning, severity, isFake: true };
  }

  // Calculate anomaly score
  if (anomalyMatches.length > 2) {
    confidence = Math.min(0.9, 0.5 + (anomalyMatches.length * 0.1));
    isAnomaly = true;
    reasoning = `Multiple anomaly indicators detected: ${anomalyMatches.join(', ')}`;
  } else if (anomalyMatches.length > 0 && normalMatches.length === 0) {
    confidence = 0.7;
    isAnomaly = true;
    reasoning = `Anomaly indicators found: ${anomalyMatches.join(', ')}`;
  } else if (normalMatches.length > anomalyMatches.length) {
    confidence = 0.4;
    isAnomaly = false;
    reasoning = 'Content appears normal with standard language patterns';
  }

  // Determine severity
  if (confidence > 0.8 && isAnomaly) severity = 'Critical';
  else if (confidence > 0.6 && isAnomaly) severity = 'High';
  else if (confidence > 0.4 && isAnomaly) severity = 'Medium';

  if (!isAnomaly && anomalyMatches.length === 0) {
    reasoning = 'Content appears normal with no significant anomaly indicators';
  }

  return { confidence, isAnomaly, reasoning, severity, isFake: false };
}

// Cross-verify multiple analyses
function crossVerifyAnalyses(analyses) {
  const validAnalyses = analyses.filter(a => !a.error && a.anomalyScore);
  
  if (validAnalyses.length === 0) {
    return {
      consensus: 0,
      isAnomaly: false,
      confidence: 0,
      reasoning: 'Insufficient data for verification',
      severity: 'Low'
    };
  }

  // Calculate consensus
  const anomalyCount = validAnalyses.filter(a => a.isAnomaly).length;
  const totalCount = validAnalyses.length;
  const consensus = anomalyCount / totalCount;

  // Average confidence
  const avgConfidence = validAnalyses.reduce((sum, a) => sum + a.confidence, 0) / totalCount;

  // Check for fake content
  const hasFake = validAnalyses.some(a => a.anomalyScore.isFake);
  if (hasFake) {
    return {
      consensus: 0.1,
      isAnomaly: false,
      confidence: 0.2,
      reasoning: 'Content flagged as potentially fabricated or fake',
      severity: 'Low',
      isFake: true,
      analyses: validAnalyses
    };
  }

  const isAnomaly = consensus >= 0.5;
  
  let severity = 'Low';
  if (avgConfidence > 0.8 && isAnomaly) severity = 'Critical';
  else if (avgConfidence > 0.6 && isAnomaly) severity = 'High';
  else if (avgConfidence > 0.4 && isAnomaly) severity = 'Medium';

  const reasoning = isAnomaly
    ? `${anomalyCount}/${totalCount} agents detected anomaly. Average confidence: ${(avgConfidence * 100).toFixed(0)}%`
    : `${totalCount - anomalyCount}/${totalCount} agents found no anomaly. Content appears normal.`;

  return {
    consensus,
    isAnomaly,
    confidence: avgConfidence,
    reasoning,
    severity,
    isFake: false,
    analyses: validAnalyses
  };
}

module.exports = {
  analyzeImage,
  analyzeText,
  analyzePDF,
  crossVerifyAnalyses
};
