#!/usr/bin/env node

/**
 * Simple Database Setup Script for Production
 * 
 * This is a minimal version that can be run as part of the build process
 * Usage: node setup-database.js
 */

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set');
  console.error('Please set DATABASE_URL in your environment variables');
  console.error('Example: postgresql://user:password@host:port/database');
  process.exit(1);
}

// Initialize Sequelize with session pooler support
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: false
});

// Import models
const AnomalyModel = require('./models/Anomaly');
const ApiDataModel = require('./models/ApiData');
const AuditLogModel = require('./models/AuditLog');
const WorkflowModel = require('./models/Workflow');

async function setup() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Connected');

    console.log('🔄 Defining models...');
    const Anomaly = AnomalyModel(sequelize, DataTypes);
    const ApiData = ApiDataModel(sequelize, DataTypes);
    const AuditLog = AuditLogModel(sequelize, DataTypes);
    const Workflow = WorkflowModel(sequelize, DataTypes);

    // Define associations
    Anomaly.hasMany(AuditLog, { as: 'auditLogs', foreignKey: 'anomalyId' });
    AuditLog.belongsTo(Anomaly, { foreignKey: 'anomalyId' });
    Anomaly.belongsTo(Workflow, { as: 'workflow', foreignKey: 'workflowId' });
    Workflow.hasMany(Anomaly, { foreignKey: 'workflowId' });
    ApiData.belongsTo(Anomaly, { foreignKey: 'anomalyId' });
    Anomaly.hasMany(ApiData, { as: 'apiData', foreignKey: 'anomalyId' });

    console.log('🔄 Creating tables...');
    await sequelize.sync({ alter: true });
    console.log('✓ Tables created');

    // Check if we need to seed
    const count = await Anomaly.count();
    if (count === 0) {
      console.log('🔄 Seeding initial data...');
      
      // Create one sample anomaly
      await Anomaly.create({
        title: 'System Initialized',
        description: 'GAIA system successfully deployed and initialized',
        severity: 'low',
        confidence: 1.0,
        status: 'detected',
        location: { lat: 0, lng: 0, address: 'Global' },
        timestamp: new Date(),
        tags: ['system', 'initialization']
      });

      console.log('✓ Initial data seeded');
    } else {
      console.log(`✓ Database already has ${count} anomalies`);
    }

    console.log('✅ Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setup();
