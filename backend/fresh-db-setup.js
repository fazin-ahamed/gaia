#!/usr/bin/env node
/**
 * Fresh Database Setup Script
 * 
 * This script sets up a completely fresh database from scratch.
 * It drops all existing tables and recreates them with correct schemas.
 * 
 * Usage: node fresh-db-setup.js
 */

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Set NODE_TLS_REJECT_UNAUTHORIZED for SSL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

console.log('='.repeat(60));
console.log('GAIA Fresh Database Setup');
console.log('='.repeat(60));

async function setupFreshDatabase() {
  // Initialize Sequelize
  const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        logging: false
      })
    : new Sequelize({
        dialect: process.env.DB_DIALECT || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'gaia_db',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        logging: false
      });

  try {
    // Test connection
    console.log('\n[1/5] Testing database connection...');
    await sequelize.authenticate();
    console.log('✓ Database connected successfully');

    // Drop all tables
    console.log('\n[2/5] Dropping existing tables...');
    await sequelize.query('DROP TABLE IF EXISTS "audit_logs" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "api_data" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "anomalies" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "workflows" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "alerts" CASCADE;');
    console.log('✓ All tables dropped');

    // Drop all enum types
    console.log('\n[3/5] Dropping existing enum types...');
    await sequelize.query('DROP TYPE IF EXISTS "enum_anomalies_severity" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_anomalies_status" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_workflows_status" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_alerts_type" CASCADE;');
    console.log('✓ All enum types dropped');

    // Create tables with correct schemas
    console.log('\n[4/5] Creating tables with correct schemas...');

    // Workflows table
    await sequelize.query(`
      CREATE TABLE "workflows" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "template" JSONB NOT NULL,
        "status" VARCHAR(20) DEFAULT 'active',
        "triggerConditions" JSONB,
        "nodes" JSONB NOT NULL,
        "edges" JSONB NOT NULL,
        "variables" JSONB,
        "createdBy" VARCHAR(255),
        "lastExecuted" TIMESTAMP,
        "executionCount" INTEGER DEFAULT 0,
        "successRate" FLOAT,
        "averageExecutionTime" INTEGER,
        "tags" JSONB DEFAULT '[]'::jsonb,
        "version" INTEGER DEFAULT 1,
        "isTemplate" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Workflows table created');

    // Anomalies table
    await sequelize.query(`
      CREATE TABLE "anomalies" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "severity" VARCHAR(20) DEFAULT 'medium',
        "confidence" FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
        "status" VARCHAR(20) DEFAULT 'detected',
        "location" JSONB,
        "modalities" JSONB,
        "crossVerification" JSONB,
        "aiAnalysis" JSONB,
        "workflowState" JSONB,
        "timestamp" TIMESTAMP DEFAULT NOW(),
        "lastUpdated" TIMESTAMP DEFAULT NOW(),
        "sourceApis" JSONB,
        "tags" JSONB DEFAULT '[]'::jsonb,
        "workflowId" UUID REFERENCES "workflows"("id"),
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Anomalies table created');

    // Audit Logs table
    await sequelize.query(`
      CREATE TABLE "audit_logs" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "anomalyId" UUID REFERENCES "anomalies"("id") ON DELETE CASCADE,
        "action" VARCHAR(255) NOT NULL,
        "actor" VARCHAR(255),
        "reasoning" TEXT,
        "confidence" FLOAT,
        "timestamp" TIMESTAMP DEFAULT NOW(),
        "metadata" JSONB,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Audit Logs table created');

    // API Data table
    await sequelize.query(`
      CREATE TABLE "api_data" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "anomalyId" UUID REFERENCES "anomalies"("id") ON DELETE CASCADE,
        "source" VARCHAR(255) NOT NULL,
        "data" JSONB NOT NULL,
        "timestamp" TIMESTAMP DEFAULT NOW(),
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ API Data table created');

    // Alerts table
    await sequelize.query(`
      CREATE TABLE "alerts" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "anomalyId" UUID REFERENCES "anomalies"("id") ON DELETE CASCADE,
        "type" VARCHAR(20),
        "recipient" VARCHAR(255) NOT NULL,
        "status" VARCHAR(20) DEFAULT 'pending',
        "sentAt" TIMESTAMP,
        "deliveryStatus" VARCHAR(50),
        "errorMessage" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Alerts table created');

    // Create indexes
    console.log('\n[5/5] Creating indexes...');
    
    // Workflows indexes
    await sequelize.query('CREATE INDEX "workflows_status" ON "workflows"("status");');
    await sequelize.query('CREATE INDEX "workflows_isTemplate" ON "workflows"("isTemplate");');
    
    // Anomalies indexes
    await sequelize.query('CREATE INDEX "anomalies_severity_confidence" ON "anomalies"("severity", "confidence");');
    await sequelize.query('CREATE INDEX "anomalies_status" ON "anomalies"("status");');
    await sequelize.query('CREATE INDEX "anomalies_timestamp" ON "anomalies"("timestamp");');
    await sequelize.query('CREATE INDEX "anomalies_location" ON "anomalies" USING gin("location");');
    
    // Audit Logs indexes
    await sequelize.query('CREATE INDEX "audit_logs_anomalyId" ON "audit_logs"("anomalyId");');
    
    // API Data indexes
    await sequelize.query('CREATE INDEX "api_data_anomalyId" ON "api_data"("anomalyId");');
    
    // Alerts indexes
    await sequelize.query('CREATE INDEX "alerts_anomalyId" ON "alerts"("anomalyId");');
    await sequelize.query('CREATE INDEX "alerts_status" ON "alerts"("status");');
    
    console.log('✓ All indexes created');

    console.log('\n' + '='.repeat(60));
    console.log('✅ Fresh database setup completed successfully!');
    console.log('='.repeat(60));
    console.log('\nDatabase is ready to use with:');
    console.log('  - 5 tables created');
    console.log('  - All relationships configured');
    console.log('  - All indexes created');
    console.log('  - JSONB fields for flexible data');
    console.log('  - No enum type issues');
    console.log('\nYou can now start the server!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error setting up database:', error.message);
    console.error('\nFull error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run setup
setupFreshDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });
