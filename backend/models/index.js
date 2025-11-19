const { Sequelize, DataTypes } = require('sequelize');

// Import models
const Anomaly = require('./Anomaly');
const AuditLog = require('./AuditLog');
const Workflow = require('./Workflow');
const ApiData = require('./ApiData');

// Store models globally
let models = {};

// Initialize database models
async function initializeDatabase(sequelize) {
  // Define models
  const anomalyModel = Anomaly(sequelize, DataTypes);
  const auditLogModel = AuditLog(sequelize, DataTypes);
  const workflowModel = Workflow(sequelize, DataTypes);
  const apiDataModel = ApiData(sequelize, DataTypes);

  // Define associations
  anomalyModel.hasMany(auditLogModel, { foreignKey: 'anomalyId' });
  auditLogModel.belongsTo(anomalyModel, { foreignKey: 'anomalyId' });

  anomalyModel.belongsTo(workflowModel, { foreignKey: 'workflowId' });
  workflowModel.hasMany(anomalyModel, { foreignKey: 'workflowId' });

  apiDataModel.belongsTo(anomalyModel, { foreignKey: 'anomalyId' });
  anomalyModel.hasMany(apiDataModel, { foreignKey: 'anomalyId' });

  // Sync database
  // In production, skip sync entirely to avoid conflicts
  // Use fresh-db-setup.js to create tables from scratch
  if (process.env.NODE_ENV === 'development') {
    await sequelize.sync({ alter: true });
  } else {
    // Production: Just verify tables exist, don't sync
    try {
      const [results] = await sequelize.query(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'anomalies';"
      );
      
      if (results.length === 0) {
        console.log('⚠️  Tables not found! Run: node fresh-db-setup.js');
        console.log('Attempting to create tables...');
        await sequelize.sync({ force: false, alter: false });
      } else {
        console.log('✓ Tables exist, skipping sync');
      }
    } catch (error) {
      console.log('Could not verify tables:', error.message);
    }
  }

  // Store models for global access
  models = {
    Anomaly: anomalyModel,
    AuditLog: auditLogModel,
    Workflow: workflowModel,
    ApiData: apiDataModel,
  };

  return models;
}

module.exports = {
  initializeDatabase,
  models,
};