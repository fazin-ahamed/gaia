const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const WebSocket = require('ws');
const { Sequelize } = require('sequelize');
const winston = require('winston');
const cron = require('node-cron');

// Load environment variables
require('dotenv').config();

// Import routes and services
const anomalyRoutes = require('./routes/anomalies');
const apiRoutes = require('./routes/apis');
const workflowRoutes = require('./routes/workflows');
const { initializeDatabase } = require('./models');
const { startDataIngestion } = require('./services/dataIngestion');
const { initializeGeminiAI } = require('./services/geminiAI');
const { initializeWorkflowEngine } = require('./services/workflowEngine');
const { setupWebSocket } = require('./services/websocket');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Database connection
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'gaia_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  logging: (msg) => logger.debug(msg),
});

// Initialize database and services
async function initializeApp() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');

    // Initialize database models
    await initializeDatabase(sequelize);

    // Initialize AI service
    await initializeGeminiAI();

    // Initialize workflow engine
    await initializeWorkflowEngine();

    // Setup WebSocket
    setupWebSocket(wss);

    // Start data ingestion scheduler
    if (process.env.AUTONOMOUS_MODE === 'true') {
      cron.schedule('*/5 * * * *', () => {
        startDataIngestion();
      });
      logger.info('Autonomous data ingestion scheduled (every 5 minutes)');
    }

    logger.info('GAIA Backend initialized successfully');
  } catch (error) {
    logger.error('Unable to initialize application:', error);
    process.exit(1);
  }
}

// Routes
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/apis', apiRoutes);
app.use('/api/workflows', workflowRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      database: sequelize.connectionManager.pool ? 'connected' : 'disconnected',
      gemini: global.geminiClient ? 'initialized' : 'not initialized'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  logger.info(`GAIA Backend server is running on port ${PORT}`);
  await initializeApp();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await sequelize.close();
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await sequelize.close();
  server.close(() => {
    logger.info('Process terminated');
  });
});

module.exports = app;