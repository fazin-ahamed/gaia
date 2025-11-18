module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    anomalyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'anomalies',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.ENUM(
        'created',
        'updated',
        'reviewed',
        'approved',
        'rejected',
        'escalated',
        'processed',
        'workflow_started',
        'workflow_completed',
        'report_generated'
      ),
      allowNull: false,
    },
    actor: {
      type: DataTypes.ENUM('system', 'human', 'ai'),
      allowNull: false,
      defaultValue: 'system',
    },
    actorId: {
      type: DataTypes.STRING, // Could be user ID, AI model ID, etc.
      allowNull: true,
    },
    changes: {
      type: DataTypes.JSONB, // What changed in the anomaly
      allowNull: true,
    },
    previousState: {
      type: DataTypes.JSONB, // Full anomaly state before change
      allowNull: true,
    },
    currentState: {
      type: DataTypes.JSONB, // Full anomaly state after change
      allowNull: true,
    },
    reasoning: {
      type: DataTypes.TEXT, // AI reasoning or human comments
      allowNull: true,
    },
    confidence: {
      type: DataTypes.FLOAT, // Confidence level of the action
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB, // Additional metadata (IP, user agent, etc.)
      allowNull: true,
    },
    provenance: {
      type: DataTypes.JSONB, // Data provenance information
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'audit_logs',
    timestamps: false,
    indexes: [
      {
        fields: ['anomalyId'],
      },
      {
        fields: ['action'],
      },
      {
        fields: ['actor'],
      },
      {
        fields: ['timestamp'],
      },
    ],
  });

  return AuditLog;
};