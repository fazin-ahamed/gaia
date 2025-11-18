module.exports = (sequelize, DataTypes) => {
  const ApiData = sequelize.define('ApiData', {
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
    apiName: {
      type: DataTypes.STRING,
      allowNull: false, // e.g., 'openweathermap', 'newsapi', 'usgs'
    },
    apiEndpoint: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rawData: {
      type: DataTypes.JSONB, // Raw API response data
      allowNull: false,
    },
    processedData: {
      type: DataTypes.JSONB, // Processed/normalized data
      allowNull: true,
    },
    dataType: {
      type: DataTypes.ENUM('weather', 'satellite', 'news', 'disaster', 'traffic', 'social', 'iot', 'environmental'),
      allowNull: false,
    },
    location: {
      type: DataTypes.JSONB, // { lat: number, lng: number, address: string, region: string }
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    dataTimestamp: {
      type: DataTypes.DATE, // When the data was actually collected from the source
      allowNull: true,
    },
    confidence: {
      type: DataTypes.FLOAT, // Data quality/reliability score
      allowNull: true,
      validate: {
        min: 0,
        max: 1,
      },
    },
    metadata: {
      type: DataTypes.JSONB, // API-specific metadata (request params, response headers, etc.)
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('collected', 'processed', 'failed', 'expired'),
      allowNull: false,
      defaultValue: 'collected',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
  }, {
    tableName: 'api_data',
    timestamps: true,
    indexes: [
      {
        fields: ['anomalyId'],
      },
      {
        fields: ['apiName'],
      },
      {
        fields: ['dataType'],
      },
      {
        fields: ['timestamp'],
      },
      {
        fields: ['status'],
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

  return ApiData;
};