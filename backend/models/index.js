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
  // In production, skip sync if tables already exist (use migration scripts instead)
  if (process.env.NODE_ENV === 'development') {
    await sequelize.sync({ alter: true });
  } else {
    // Check if tables exist before syncing
    try {
      const [results] = await sequelize.query(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'anomalies';"
      );
      
      if (results.length === 0) {
        // Tables don't exist, create them
        console.log('Tables not found, creating...');
        await sequelize.sync();
      } else {
        console.log('Tables already exist, skipping sync');
      }
    } catch (error) {
      console.log('Could not check tables, attempting sync...');
      await sequelize.sync();
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