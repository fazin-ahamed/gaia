module.exports = (sequelize, DataTypes) => {
  const Workflow = sequelize.define('Workflow', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    template: {
      type: DataTypes.JSONB, // Opus workflow template definition
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'draft'),
      allowNull: false,
      defaultValue: 'active',
    },
    triggerConditions: {
      type: DataTypes.JSONB, // Conditions that trigger this workflow
      allowNull: true,
    },
    nodes: {
      type: DataTypes.JSONB, // Workflow nodes and their configurations
      allowNull: false,
    },
    edges: {
      type: DataTypes.JSONB, // Connections between workflow nodes
      allowNull: false,
    },
    variables: {
      type: DataTypes.JSONB, // Workflow variables and their types
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.STRING, // User or system that created the workflow
      allowNull: true,
    },
    lastExecuted: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    executionCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    successRate: {
      type: DataTypes.FLOAT, // Success rate of workflow executions
      allowNull: true,
    },
    averageExecutionTime: {
      type: DataTypes.INTEGER, // Average execution time in milliseconds
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
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    isTemplate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'workflows',
    timestamps: true,
    indexes: [
      {
        fields: ['status'],
      },
      {
        fields: ['tags'],
        using: 'gin',
      },
      {
        fields: ['isTemplate'],
      },
    ],
  });

  return Workflow;
};