const { Sequelize, DataTypes } = require('sequelize');

// Import models
const Anomaly = require('./Anomaly');
const AuditLog = require('./AuditLog');
const Workflow = require('./Workflow');
const ApiData = require('./ApiData');

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
  if (process.env.NODE_ENV === 'development') {
    await sequelize.sync({ alter: true });
  } else {
    await sequelize.sync();
  }

  return {
    Anomaly: anomalyModel,
    AuditLog: auditLogModel,
    Workflow: workflowModel,
    ApiData: apiDataModel,
  };
}

module.exports = {
  initializeDatabase,
};