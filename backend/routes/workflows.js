const express = require('express');
const { models } = require('../models');
const winston = require('winston');

const router = express.Router();

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/workflows.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Get all workflows
router.get('/', async (req, res) => {
  try {
    const { status, isTemplate } = req.query;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (isTemplate !== undefined) whereClause.isTemplate = isTemplate === 'true';

    const workflows = await models.Workflow.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json(workflows);

  } catch (error) {
    logger.error('Error fetching workflows:', error);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

// Get workflow by ID
router.get('/:id', async (req, res) => {
  try {
    const workflow = await models.Workflow.findByPk(req.params.id, {
      include: [
        {
          model: models.Anomaly,
          as: 'anomalies',
          limit: 10,
          order: [['timestamp', 'DESC']]
        }
      ]
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json(workflow);

  } catch (error) {
    logger.error('Error fetching workflow:', error);
    res.status(500).json({ error: 'Failed to fetch workflow' });
  }
});

// Create new workflow
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      template,
      triggerConditions,
      nodes,
      edges,
      variables,
      tags,
      isTemplate = false
    } = req.body;

    const workflow = await models.Workflow.create({
      name,
      description,
      template,
      triggerConditions,
      nodes,
      edges,
      variables,
      tags: tags || [],
      isTemplate,
      createdBy: 'system' // In production, get from auth
    });

    logger.info(`Created workflow ${workflow.id}: ${workflow.name}`);
    res.status(201).json(workflow);

  } catch (error) {
    logger.error('Error creating workflow:', error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

// Update workflow
router.put('/:id', async (req, res) => {
  try {
    const workflow = await models.Workflow.findByPk(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const updates = req.body;
    await workflow.update(updates);

    logger.info(`Updated workflow ${workflow.id}`);
    res.json(workflow);

  } catch (error) {
    logger.error('Error updating workflow:', error);
    res.status(500).json({ error: 'Failed to update workflow' });
  }
});

// Delete workflow
router.delete('/:id', async (req, res) => {
  try {
    const workflow = await models.Workflow.findByPk(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Check if workflow has associated anomalies
    const associatedAnomalies = await models.Anomaly.count({
      where: { workflowId: workflow.id }
    });

    if (associatedAnomalies > 0) {
      return res.status(400).json({
        error: 'Cannot delete workflow with associated anomalies'
      });
    }

    await workflow.destroy();

    logger.info(`Deleted workflow ${req.params.id}`);
    res.json({ message: 'Workflow deleted successfully' });

  } catch (error) {
    logger.error('Error deleting workflow:', error);
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
});

// Execute workflow
router.post('/:id/execute', async (req, res) => {
  try {
    const workflow = await models.Workflow.findByPk(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const { anomalyId, parameters } = req.body;

    // TODO: Implement actual workflow execution
    // For now, just update execution stats
    await workflow.update({
      lastExecuted: new Date(),
      executionCount: workflow.executionCount + 1
    });

    logger.info(`Executed workflow ${workflow.id} for anomaly ${anomalyId}`);

    res.json({
      message: 'Workflow execution started',
      workflowId: workflow.id,
      executionId: `exec_${Date.now()}`, // Mock execution ID
      status: 'running'
    });

  } catch (error) {
    logger.error('Error executing workflow:', error);
    res.status(500).json({ error: 'Failed to execute workflow' });
  }
});

// Get workflow templates
router.get('/templates/list', async (req, res) => {
  try {
    const templates = await models.Workflow.findAll({
      where: { isTemplate: true },
      order: [['name', 'ASC']]
    });

    res.json(templates);

  } catch (error) {
    logger.error('Error fetching workflow templates:', error);
    res.status(500).json({ error: 'Failed to fetch workflow templates' });
  }
});

// Create default workflow templates
router.post('/templates/create-defaults', async (req, res) => {
  try {
    const defaultTemplates = [
      {
        name: 'Standard Anomaly Review Workflow',
        description: 'Intake → AI Analysis → Human Review → Decision',
        isTemplate: true,
        nodes: [
          { id: 'intake', type: 'intake', label: 'Data Intake' },
          { id: 'ai_analysis', type: 'ai', label: 'AI Analysis' },
          { id: 'human_review', type: 'human', label: 'Human Review' },
          { id: 'decision', type: 'decision', label: 'Final Decision' }
        ],
        edges: [
          { source: 'intake', target: 'ai_analysis' },
          { source: 'ai_analysis', target: 'human_review' },
          { source: 'human_review', target: 'decision' }
        ],
        variables: {
          autoEscalateThreshold: 0.9,
          requireHumanReview: true
        },
        tags: ['default', 'standard']
      },
      {
        name: 'High-Priority Emergency Response',
        description: 'Rapid response workflow for critical anomalies',
        isTemplate: true,
        nodes: [
          { id: 'intake', type: 'intake', label: 'Emergency Intake' },
          { id: 'ai_triage', type: 'ai', label: 'AI Triage' },
          { id: 'parallel_review', type: 'parallel', label: 'Parallel Review' },
          { id: 'emergency_response', type: 'action', label: 'Emergency Response' }
        ],
        edges: [
          { source: 'intake', target: 'ai_triage' },
          { source: 'ai_triage', target: 'parallel_review' },
          { source: 'parallel_review', target: 'emergency_response' }
        ],
        variables: {
          responseTime: 'immediate',
          notificationChannels: ['email', 'sms', 'alert_system']
        },
        tags: ['emergency', 'high-priority']
      },
      {
        name: 'Autonomous Processing Workflow',
        description: 'Fully autonomous anomaly processing with minimal human intervention',
        isTemplate: true,
        nodes: [
          { id: 'intake', type: 'intake', label: 'Data Intake' },
          { id: 'ai_analysis', type: 'ai', label: 'AI Analysis' },
          { id: 'cross_verification', type: 'verification', label: 'Cross Verification' },
          { id: 'auto_decision', type: 'decision', label: 'Auto Decision' },
          { id: 'auto_action', type: 'action', label: 'Auto Action' }
        ],
        edges: [
          { source: 'intake', target: 'ai_analysis' },
          { source: 'ai_analysis', target: 'cross_verification' },
          { source: 'cross_verification', target: 'auto_decision' },
          { source: 'auto_decision', target: 'auto_action' }
        ],
        variables: {
          autonomousMode: true,
          confidenceThreshold: 0.8,
          humanOverride: false
        },
        tags: ['autonomous', 'ai-driven']
      }
    ];

    const createdTemplates = [];
    for (const template of defaultTemplates) {
      const existing = await models.Workflow.findOne({
        where: { name: template.name, isTemplate: true }
      });

      if (!existing) {
        const created = await models.Workflow.create(template);
        createdTemplates.push(created);
      }
    }

    res.json({
      message: 'Default workflow templates created',
      created: createdTemplates.length,
      templates: createdTemplates
    });

  } catch (error) {
    logger.error('Error creating default workflow templates:', error);
    res.status(500).json({ error: 'Failed to create default workflow templates' });
  }
});

module.exports = router;