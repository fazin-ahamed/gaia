#!/usr/bin/env node

/**
 * Simple Database Migration Script
 * 
 * This script creates tables without complex associations
 * to avoid constraint errors
 */

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('🔄 Starting simple database migration...\n');

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not set');
  process.exit(1);
}

// Initialize Sequelize
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

async function migrate() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Connected\n');

    // Drop existing tables to start fresh
    console.log('🔄 Dropping existing tables (if any)...');
    await sequelize.query('DROP TABLE IF EXISTS "audit_logs" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "api_data" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "anomalies" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "workflows" CASCADE;');
    console.log('✓ Tables dropped\n');

    // Create Workflows table (no dependencies)
    console.log('🔄 Creating workflows table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "workflows" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "template" JSONB NOT NULL,
        "status" VARCHAR(50) DEFAULT 'active',
        "triggerConditions" JSONB,
        "nodes" JSONB NOT NULL,
        "edges" JSONB NOT NULL,
        "variables" JSONB,
        "createdBy" VARCHAR(255),
        "lastExecuted" TIMESTAMP,
        "executionCount" INTEGER DEFAULT 0,
        "successRate" FLOAT,
        "averageExecutionTime" INTEGER,
        "tags" TEXT DEFAULT '[]',
        "version" INTEGER DEFAULT 1,
        "isTemplate" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Workflows table created\n');

    // Create Anomalies table
    console.log('🔄 Creating anomalies table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "anomalies" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "severity" VARCHAR(50) DEFAULT 'medium',
        "confidence" FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
        "status" VARCHAR(50) DEFAULT 'detected',
        "location" JSONB,
        "modalities" JSONB,
        "crossVerification" JSONB,
        "aiAnalysis" JSONB,
        "workflowState" JSONB,
        "timestamp" TIMESTAMP DEFAULT NOW(),
        "lastUpdated" TIMESTAMP DEFAULT NOW(),
        "sourceApis" JSONB,
        "tags" TEXT DEFAULT '[]',
        "workflowId" UUID REFERENCES "workflows"("id") ON DELETE SET NULL,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Anomalies table created\n');

    // Create ApiData table
    console.log('🔄 Creating api_data table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "api_data" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "anomalyId" UUID NOT NULL REFERENCES "anomalies"("id") ON DELETE CASCADE,
        "apiName" VARCHAR(255) NOT NULL,
        "apiEndpoint" VARCHAR(255),
        "rawData" JSONB NOT NULL,
        "processedData" JSONB,
        "dataType" VARCHAR(50) NOT NULL,
        "location" JSONB,
        "timestamp" TIMESTAMP DEFAULT NOW(),
        "dataTimestamp" TIMESTAMP,
        "confidence" FLOAT CHECK (confidence >= 0 AND confidence <= 1),
        "metadata" JSONB,
        "status" VARCHAR(50) DEFAULT 'collected',
        "errorMessage" TEXT,
        "tags" TEXT DEFAULT '[]',
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ ApiData table created\n');

    // Create AuditLogs table
    console.log('🔄 Creating audit_logs table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "anomalyId" UUID NOT NULL REFERENCES "anomalies"("id") ON DELETE CASCADE,
        "action" VARCHAR(50) NOT NULL,
        "actor" VARCHAR(50) DEFAULT 'system',
        "actorId" VARCHAR(255),
        "changes" JSONB,
        "previousState" JSONB,
        "currentState" JSONB,
        "reasoning" TEXT,
        "confidence" FLOAT,
        "metadata" JSONB,
        "provenance" JSONB,
        "timestamp" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ AuditLogs table created\n');

    // Create indexes
    console.log('🔄 Creating indexes...');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_anomalies_severity ON "anomalies"("severity");');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_anomalies_status ON "anomalies"("status");');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_anomalies_timestamp ON "anomalies"("timestamp");');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_api_data_anomaly ON "api_data"("anomalyId");');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_anomaly ON "audit_logs"("anomalyId");');
    console.log('✓ Indexes created\n');

    // Seed initial data
    console.log('🔄 Seeding initial data...');
    
    // Insert a workflow
    await sequelize.query(`
      INSERT INTO "workflows" (name, description, template, nodes, edges, tags)
      VALUES (
        'Standard Investigation',
        'Default anomaly investigation workflow',
        '{"type":"investigation","steps":["verify","analyze","report"]}',
        '[{"id":"start","type":"trigger"},{"id":"verify","type":"verification"},{"id":"analyze","type":"analysis"}]',
        '[{"from":"start","to":"verify"},{"from":"verify","to":"analyze"}]',
        '["default","investigation"]'
      );
    `);

    // Insert sample anomalies
    await sequelize.query(`
      INSERT INTO "anomalies" (title, description, severity, confidence, status, location, tags, timestamp)
      VALUES 
      ('Unusual Seismic Activity', 'Detected abnormal seismic readings in Pacific Northwest', 'critical', 0.94, 'detected', '{"lat":47.6062,"lng":-122.3321,"address":"Seattle, WA"}', '["seismic","urgent"]', NOW() - INTERVAL '2 hours'),
      ('Atmospheric Pressure Anomaly', 'Rapid pressure changes over North Atlantic', 'high', 0.87, 'processing', '{"lat":40.7128,"lng":-74.0060,"address":"New York, NY"}', '["weather","atmospheric"]', NOW() - INTERVAL '5 hours'),
      ('Electromagnetic Interference', 'Unexplained EM interference affecting communications', 'high', 0.82, 'reviewed', '{"lat":51.5074,"lng":-0.1278,"address":"London, UK"}', '["electromagnetic"]', NOW() - INTERVAL '8 hours'),
      ('Marine Life Behavior', 'Mass migration of marine species detected', 'medium', 0.76, 'detected', '{"lat":-33.8688,"lng":151.2093,"address":"Sydney, Australia"}', '["marine","biological"]', NOW() - INTERVAL '12 hours'),
      ('Air Quality Spike', 'Sudden increase in particulate matter', 'medium', 0.71, 'processing', '{"lat":19.0760,"lng":72.8777,"address":"Mumbai, India"}', '["air-quality","environmental"]', NOW() - INTERVAL '18 hours');
    `);

    console.log('✓ Initial data seeded\n');

    // Verify
    const result = await sequelize.query('SELECT COUNT(*) as count FROM "anomalies";');
    const count = result[0][0].count;

    console.log('═══════════════════════════════════════');
    console.log('✅ MIGRATION COMPLETE');
    console.log('═══════════════════════════════════════');
    console.log(`\nDatabase Statistics:`);
    console.log(`  Anomalies: ${count}`);
    console.log(`  Tables: 4 (workflows, anomalies, api_data, audit_logs)`);
    console.log(`\n✓ Database is ready!\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate();
