const { GoogleGenerativeAI } = require('@google/generative-ai');
const winston = require('winston');

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/gemini.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

let genAI;
let model;

async function initializeGeminiAI() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    // Test the connection
    const testResult = await model.generateContent('Test connection');
    logger.info('Gemini AI initialized successfully');

    // Store globally for other modules
    global.geminiClient = model;

    return model;
  } catch (error) {
    logger.error('Failed to initialize Gemini AI:', error);
    throw error;
  }
}

async function analyzeAnomalyData(data) {
  try {
    const {
      modalities,
      location,
      timestamp,
      sourceApis,
      existingContext
    } = data;

    // Prepare the prompt for multimodal analysis
    let prompt = `Analyze the following data for potential anomalies. Consider multiple modalities (text, images, videos, audio) and cross-verify information.

Context:
- Location: ${location ? `${location.lat}, ${location.lng}` : 'Unknown'}
- Timestamp: ${timestamp}
- Data Sources: ${sourceApis ? sourceApis.join(', ') : 'Unknown'}

`;

    // Add text analysis
    if (modalities && modalities.text) {
      prompt += `Text Data: ${modalities.text}\n\n`;
    }

    // Add image analysis prompt
    if (modalities && modalities.images && modalities.images.length > 0) {
      prompt += `Image Analysis Required: ${modalities.images.length} images available\n`;
    }

    // Add existing context from previous analyses
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

    let result;

    // Handle multimodal content
    if (modalities && modalities.images && modalities.images.length > 0) {
      // Use vision model for images
      const visionModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

      const imageParts = modalities.images.map(img => ({
        inlineData: {
          data: img.data, // base64 encoded
          mimeType: img.mimeType || 'image/jpeg'
        }
      }));

      result = await visionModel.generateContent([prompt, ...imageParts]);
    } else {
      // Use text-only model
      result = await model.generateContent(prompt);
    }

    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let analysis;
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (parseError) {
      logger.warn('Failed to parse Gemini response as JSON, using fallback', parseError);
      analysis = {
        isAnomaly: text.toLowerCase().includes('yes') || text.toLowerCase().includes('anomaly'),
        severity: 'medium',
        confidence: 0.5,
        description: text,
        crossVerification: 'Unable to determine',
        recommendedActions: ['Manual review required']
      };
    }

    logger.info('Gemini AI analysis completed', { analysis });

    return {
      ...analysis,
      rawResponse: text,
      timestamp: new Date(),
      model: 'gemini-pro-vision'
    };

  } catch (error) {
    logger.error('Gemini AI analysis failed:', error);
    throw error;
  }
}

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const report = response.text();

    logger.info(`Report generated in ${format} format`);

    return {
      content: report,
      format,
      generatedAt: new Date(),
      anomalyId: anomalyData.id
    };

  } catch (error) {
    logger.error('Report generation failed:', error);
    throw error;
  }
}

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let verification;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
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

    logger.info('Cross-verification completed', { verification });

    return verification;

  } catch (error) {
    logger.error('Cross-verification failed:', error);
    throw error;
  }
}

module.exports = {
  initializeGeminiAI,
  analyzeAnomalyData,
  generateReport,
  crossVerifyData,
};