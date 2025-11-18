module.exports = (sequelize, DataTypes) => {
  const Anomaly = sequelize.define('Anomaly', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'medium',
    },
    confidence: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 1,
      },
    },
    status: {
      type: DataTypes.ENUM('detected', 'processing', 'reviewed', 'approved', 'rejected', 'escalated'),
      allowNull: false,
      defaultValue: 'detected',
    },
    location: {
      type: DataTypes.JSONB, // { lat: number, lng: number, address: string }
      allowNull: true,
    },
    modalities: {
      type: DataTypes.JSONB, // { text: string, images: [], videos: [], audio: [] }
      allowNull: true,
    },
    crossVerification: {
      type: DataTypes.JSONB, // { sources: [], confidence: number, verificationStatus: string }
      allowNull: true,
    },
    aiAnalysis: {
      type: DataTypes.JSONB, // { geminiAnalysis: {}, anomalyScore: number, reasoning: string }
      allowNull: true,
    },
    workflowState: {
      type: DataTypes.JSONB, // Current workflow state
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    sourceApis: {
      type: DataTypes.JSONB, // Array of API sources that contributed data
      allowNull: true,
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: JSON.stringify([]),
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(val) {
        this.setDataValue('tags', JSON.stringify(val));
      },
    },
  }, {
    tableName: 'anomalies',
    timestamps: true,
    indexes: [
      {
        fields: ['severity', 'confidence'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['timestamp'],
      },
      {
        fields: ['location'],
        using: 'gin',
      },
      {
        fields: ['tags'],
        using: 'gin',
      },
    ],
  });

  return Anomaly;
};