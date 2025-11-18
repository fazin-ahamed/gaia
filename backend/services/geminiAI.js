const { initializeAIService, analyzeAnomalyData: aiAnalyzeAnomalyData, generateReport: aiGenerateReport, crossVerifyData: aiCrossVerifyData } = require('./aiService');
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

async function initializeGeminiAI() {
  try {
    await initializeAIService();
    logger.info('Gemini AI initialized successfully');
    return true;
  } catch (error) {
    logger.error('Failed to initialize Gemini AI:', error);
    throw error;
  }
}

async function analyzeAnomalyData(data) {
  try {
    return await aiAnalyzeAnomalyData(data);
  } catch (error) {
    logger.error('AI analysis failed:', error);
    throw error;
  }
}

async function generateReport(anomalyData, format = 'json') {
  try {
    return await aiGenerateReport(anomalyData, format);
  } catch (error) {
    logger.error('Report generation failed:', error);
    throw error;
  }
}

async function crossVerifyData(dataSources) {
  try {
    return await aiCrossVerifyData(dataSources);
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