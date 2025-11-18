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
const realtimeRoutes = require('./routes/realtime');
const uploadRoutes = require('./routes/upload');
const opusRoutes = require('./routes/opus');
const statsRoutes = require('./routes/stats');
const alertsRoutes = require('./routes/alerts');
const aiStatusRoutes = require('./routes/ai-status');
const environmentalRoutes = require('./routes/environmental');
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

// Database connection - Support both PostgreSQL and SQLite
const dbConfig = {
  dialect: process.env.DB_DIALECT || 'postgres',
  logging: (msg) => logger.debug(msg),
};

if (dbConfig.dialect === 'sqlite') {
  dbConfig.storage = process.env.DB_STORAGE || './gaia.db';
} else if (process.env.DATABASE_URL) {
  // Render/Railway/Heroku style DATABASE_URL
  dbConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
  dbConfig.pool = {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  };
} else {
  dbConfig.host = process.env.DB_HOST || 'localhost';
  dbConfig.port = process.env.DB_PORT || 5432;
  dbConfig.database = process.env.DB_NAME || 'gaia_db';
  dbConfig.username = process.env.DB_USER || 'postgres';
  dbConfig.password = process.env.DB_PASSWORD || '';
}

const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, dbConfig)
  : new Sequelize(dbConfig);

// Initialize database and services
async function initializeApp() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');

    // Initialize database models
    const models = await initializeDatabase(sequelize);
    global.models = models; // Make models globally accessible

    // Initialize AI service
    await initializeGeminiAI();

    // Initialize workflow engine
    await initializeWorkflowEngine();

    // Setup WebSocket
    setupWebSocket(wss);

    // Start data ingestion scheduler
    if (process.env.AUTONOMOUS_MODE === 'true') {
      // Reduced frequency to avoid rate limits: every 15 minutes instead of 5
      cron.schedule('*/15 * * * *', () => {
        startDataIngestion();
      });
      logger.info('Autonomous data ingestion scheduled (every 15 minutes)');
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
app.use('/api/realtime', realtimeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/opus', opusRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/ai', aiStatusRoutes);
app.use('/api/environmental', environmentalRoutes);

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