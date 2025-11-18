#!/usr/bin/env node

/**
 * Cleanup and Migrate Script
 * 
 * This script:
 * 1. Drops all existing tables and types
 * 2. Runs the simple migration
 * 
 * Use this when you have schema conflicts
 */

const { Sequelize } = require('sequelize');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('🧹 Starting database cleanup and migration...\n');

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not set');
  process.exit(1);
}

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

async function cleanup() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Connected\n');

    console.log('🧹 Dropping all tables and types...');
    
    // Drop tables in correct order (reverse of dependencies)
    await sequelize.query('DROP TABLE IF EXISTS "audit_logs" CASCADE;');
    console.log('  ✓ Dropped audit_logs');
    
    await sequelize.query('DROP TABLE IF EXISTS "api_data" CASCADE;');
    console.log('  ✓ Dropped api_data');
    
    await sequelize.query('DROP TABLE IF EXISTS "anomalies" CASCADE;');
    console.log('  ✓ Dropped anomalies');
    
    await sequelize.query('DROP TABLE IF EXISTS "workflows" CASCADE;');
    console.log('  ✓ Dropped workflows');

    // Drop ENUM types
    await sequelize.query('DROP TYPE IF EXISTS "enum_anomalies_severity" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_anomalies_status" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_workflows_status" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_api_data_dataType" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_api_data_status" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_audit_logs_action" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_audit_logs_actor" CASCADE;');
    console.log('  ✓ Dropped ENUM types\n');

    console.log('✅ Cleanup complete!\n');
    console.log('Now run: node simple-migrate.js\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

cleanup();
