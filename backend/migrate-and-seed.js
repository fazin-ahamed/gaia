#!/usr/bin/env node

/**
 * GAIA Database Migration and Seed Script
 * 
 * This script:
 * 1. Connects to the database
 * 2. Creates all tables with proper schema
 * 3. Seeds the database with test data
 * 
 * Usage:
 *   node migrate-and-seed.js
 * 
 * Environment Variables Required:
 *   DATABASE_URL or DB_* variables
 */

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

// Database configuration
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    log('Using DATABASE_URL for connection', 'blue');
    return {
      url: process.env.DATABASE_URL,
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      logging: false
    };
  }

  // Check if we have any database configuration
  if (!process.env.DB_NAME && !process.env.DB_HOST) {
    logError('No database configuration found!');
    logError('Please set either DATABASE_URL or DB_* environment variables');
    logError('');
    logError('Option 1 - DATABASE_URL:');
    logError('  DATABASE_URL=postgresql://user:password@host:port/database');
    logError('');
    logError('Option 2 - Individual variables:');
    logError('  DB_NAME=gaia');
    logError('  DB_USER=postgres');
    logError('  DB_PASSWORD=your_password');
    logError('  DB_HOST=localhost');
    logError('  DB_PORT=5432');
    process.exit(1);
  }

  log('Using individual DB_* variables for connection', 'blue');
  return {
    database: process.env.DB_NAME || 'gaia',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false
  };
};

// Initialize Sequelize
let sequelize;
const config = getDatabaseConfig();

if (config.url) {
  sequelize = new Sequelize(config.url, {
    dialect: config.dialect,
    dialectOptions: config.dialectOptions,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: config.logging
  });
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      logging: config.logging
    }
  );
}

// Import model definitions
const AnomalyModel = require('./models/Anomaly');
const ApiDataModel = require('./models/ApiData');
const AuditLogModel = require('./models/AuditLog');
const WorkflowModel = require('./models/Workflow');

// Define models
const Anomaly = AnomalyModel(sequelize, DataTypes);
const ApiData = ApiDataModel(sequelize, DataTypes);
const AuditLog = AuditLogModel(sequelize, DataTypes);
const Workflow = WorkflowModel(sequelize, DataTypes);

// Define associations
Anomaly.hasMany(AuditLog, { as: 'AuditLogs', foreignKey: 'anomalyId' });
AuditLog.belongsTo(Anomaly, { foreignKey: 'anomalyId' });

Anomaly.belongsTo(Workflow, { as: 'Workflow', foreignKey: 'workflowId' });
Workflow.hasMany(Anomaly, { foreignKey: 'workflowId' });

ApiData.belongsTo(Anomaly, { foreignKey: 'anomalyId' });
Anomaly.hasMany(ApiData, { as: 'ApiData', foreignKey: 'anomalyId' });

// Test data
const seedData = {
  anomalies: [
    {
      title: 'Unusual Seismic Activity Pattern',
      description: 'Detected abnormal seismic readings in the Pacific Northwest region. Multiple sensors showing coordinated micro-tremors that don\'t match typical geological patterns.',
      severity: 'critical',
      confidence: 0.94,
      status: 'detected',
      location: { lat: 47.6062, lng: -122.3321, address: 'Seattle, WA' },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      sourceApis: ['USGS', 'NOAA', 'Local Seismic Network'],
      tags: ['seismic', 'geological', 'urgent']
    },
    {
      title: 'Atmospheric Pressure Anomaly',
      description: 'Rapid atmospheric pressure changes detected over North Atlantic. Pattern suggests unusual weather formation not predicted by standard models.',
      severity: 'high',
      confidence: 0.87,
      status: 'processing',
      location: { lat: 40.7128, lng: -74.0060, address: 'New York, NY' },
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      sourceApis: ['OpenWeatherMap', 'NOAA', 'WeatherBit'],
      tags: ['weather', 'atmospheric', 'monitoring']
    },
    {
      title: 'Unexplained Electromagnetic Interference',
      description: 'Multiple reports of electromagnetic interference affecting communications equipment. No known solar activity or terrestrial source identified.',
      severity: 'high',
      confidence: 0.82,
      status: 'reviewed',
      location: { lat: 51.5074, lng: -0.1278, address: 'London, UK' },
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      sourceApis: ['NOAA Space Weather', 'Local EM Sensors'],
      tags: ['electromagnetic', 'communications', 'investigation']
    },
    {
      title: 'Unusual Marine Life Behavior',
      description: 'Mass migration of marine species detected off the coast. Behavior patterns inconsistent with seasonal norms and environmental conditions.',
      severity: 'medium',
      confidence: 0.76,
      status: 'detected',
      location: { lat: -33.8688, lng: 151.2093, address: 'Sydney, Australia' },
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      sourceApis: ['Marine Biology Network', 'Satellite Imagery'],
      tags: ['marine', 'biological', 'environmental']
    },
    {
      title: 'Air Quality Spike',
      description: 'Sudden increase in particulate matter and unusual chemical signatures detected. Source unknown, not matching typical pollution patterns.',
      severity: 'medium',
      confidence: 0.71,
      status: 'processing',
      location: { lat: 19.0760, lng: 72.8777, address: 'Mumbai, India' },
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
      sourceApis: ['OpenAQ', 'AQICN', 'Local Air Quality Monitors'],
      tags: ['air-quality', 'environmental', 'health']
    },
    {
      title: 'Anomalous Traffic Pattern',
      description: 'Unusual network traffic patterns detected across multiple data centers. Coordinated but not matching known attack signatures.',
      severity: 'high',
      confidence: 0.89,
      status: 'escalated',
      location: { lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' },
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      sourceApis: ['Network Monitoring', 'Security Systems'],
      tags: ['network', 'security', 'cyber']
    },
    {
      title: 'Unexplained Temperature Gradient',
      description: 'Localized temperature anomaly detected via satellite. Area showing 15°C difference from surrounding region without obvious cause.',
      severity: 'medium',
      confidence: 0.68,
      status: 'detected',
      location: { lat: 35.6762, lng: 139.6503, address: 'Tokyo, Japan' },
      timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000),
      sourceApis: ['Satellite Thermal Imaging', 'Weather Stations'],
      tags: ['thermal', 'satellite', 'investigation']
    },
    {
      title: 'Unusual Radiation Readings',
      description: 'Elevated background radiation detected by multiple sensors. Levels not dangerous but pattern is unexplained and persistent.',
      severity: 'critical',
      confidence: 0.91,
      status: 'approved',
      location: { lat: -23.5505, lng: -46.6333, address: 'São Paulo, Brazil' },
      timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
      sourceApis: ['Radiation Monitoring Network', 'Environmental Sensors'],
      tags: ['radiation', 'environmental', 'urgent']
    }
  ],
  workflows: [
    {
      name: 'Standard Anomaly Investigation',
      description: 'Default workflow for investigating detected anomalies',
      template: {
        type: 'investigation',
        steps: ['verify', 'analyze', 'report']
      },
      status: 'active',
      nodes: [
        { id: 'start', type: 'trigger', config: {} },
        { id: 'verify', type: 'verification', config: { threshold: 0.7 } },
        { id: 'analyze', type: 'analysis', config: { depth: 'full' } },
        { id: 'report', type: 'reporting', config: { format: 'json' } }
      ],
      edges: [
        { from: 'start', to: 'verify' },
        { from: 'verify', to: 'analyze' },
        { from: 'analyze', to: 'report' }
      ],
      tags: ['default', 'investigation']
    },
    {
      name: 'Critical Alert Response',
      description: 'Rapid response workflow for critical severity anomalies',
      template: {
        type: 'response',
        steps: ['alert', 'escalate', 'coordinate']
      },
      status: 'active',
      nodes: [
        { id: 'start', type: 'trigger', config: { severity: 'critical' } },
        { id: 'alert', type: 'notification', config: { channels: ['email', 'sms'] } },
        { id: 'escalate', type: 'escalation', config: { priority: 'high' } },
        { id: 'coordinate', type: 'coordination', config: { teams: ['ops', 'security'] } }
      ],
      edges: [
        { from: 'start', to: 'alert' },
        { from: 'alert', to: 'escalate' },
        { from: 'escalate', to: 'coordinate' }
      ],
      tags: ['critical', 'response', 'urgent']
    }
  ]
};

// Main migration function
async function migrate() {
  try {
    logStep('1/5', 'Testing database connection...');
    await sequelize.authenticate();
    logSuccess('Database connection established');

    logStep('2/5', 'Creating tables...');
    
    // Force sync in development, regular sync in production
    const syncOptions = process.env.NODE_ENV === 'development' 
      ? { force: true } 
      : { alter: true };
    
    await sequelize.sync(syncOptions);
    logSuccess('All tables created successfully');

    // Verify tables
    const tables = await sequelize.getQueryInterface().showAllTables();
    log(`\nCreated tables: ${tables.join(', ')}`, 'blue');

    logStep('3/5', 'Seeding workflows...');
    const workflows = await Workflow.bulkCreate(seedData.workflows);
    logSuccess(`Created ${workflows.length} workflows`);

    logStep('4/5', 'Seeding anomalies...');
    const anomalies = await Anomaly.bulkCreate(seedData.anomalies);
    logSuccess(`Created ${anomalies.length} anomalies`);

    logStep('5/5', 'Creating audit logs...');
    const auditLogs = [];
    for (const anomaly of anomalies) {
      auditLogs.push({
        anomalyId: anomaly.id,
        action: 'created',
        actor: 'system',
        reasoning: 'Initial seed data',
        currentState: anomaly.toJSON(),
        timestamp: anomaly.timestamp
      });
    }
    await AuditLog.bulkCreate(auditLogs);
    logSuccess(`Created ${auditLogs.length} audit log entries`);

    // Summary
    log('\n' + '='.repeat(60), 'bright');
    log('MIGRATION COMPLETE', 'green');
    log('='.repeat(60), 'bright');
    
    const stats = {
      anomalies: await Anomaly.count(),
      workflows: await Workflow.count(),
      auditLogs: await AuditLog.count(),
      apiData: await ApiData.count()
    };

    log('\nDatabase Statistics:', 'cyan');
    log(`  Anomalies: ${stats.anomalies}`, 'blue');
    log(`  Workflows: ${stats.workflows}`, 'blue');
    log(`  Audit Logs: ${stats.auditLogs}`, 'blue');
    log(`  API Data: ${stats.apiData}`, 'blue');

    log('\nSample Anomalies:', 'cyan');
    const sampleAnomalies = await Anomaly.findAll({ limit: 3 });
    sampleAnomalies.forEach((a, i) => {
      log(`  ${i + 1}. [${a.severity.toUpperCase()}] ${a.title}`, 'blue');
    });

    log('\n✓ Database is ready for use!', 'green');
    log('\nYou can now start the server with: npm start\n', 'yellow');

  } catch (error) {
    logError(`Migration failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migration
log('\n' + '='.repeat(60), 'bright');
log('GAIA DATABASE MIGRATION & SEED', 'cyan');
log('='.repeat(60), 'bright');
log(`Environment: ${process.env.NODE_ENV || 'development'}`, 'yellow');
log(`Database: ${config.url ? 'PostgreSQL (via DATABASE_URL)' : config.database}`, 'yellow');
log('='.repeat(60) + '\n', 'bright');

migrate();
