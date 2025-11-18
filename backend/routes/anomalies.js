const express = require('express');
const { Op } = require('sequelize');
const winston = require('winston');
const { analyzeAnomalyData, generateReport } = require('../services/geminiAI');
const { models } = require('../models');

const router = express.Router();

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/anomalies.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Get all anomalies with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      severity,
      confidence_min,
      confidence_max,
      start_date,
      end_date,
      location_lat,
      location_lng,
      radius = 1000, // km
      tags
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Build filters
    if (status) whereClause.status = status;
    if (severity) whereClause.severity = severity;

    if (confidence_min || confidence_max) {
      whereClause.confidence = {};
      if (confidence_min) whereClause.confidence[Op.gte] = parseFloat(confidence_min);
      if (confidence_max) whereClause.confidence[Op.lte] = parseFloat(confidence_max);
    }

    if (start_date || end_date) {
      whereClause.timestamp = {};
      if (start_date) whereClause.timestamp[Op.gte] = new Date(start_date);
      if (end_date) whereClause.timestamp[Op.lte] = new Date(end_date);
    }

    // Location-based filtering (simplified)
    if (location_lat && location_lng) {
      // This is a simplified location filter - in production you'd use PostGIS
      whereClause.location = {
        [Op.ne]: null
      };
    }

    if (tags) {
      whereClause.tags = {
        [Op.contains]: tags.split(',')
      };
    }

    const { count, rows } = await models.Anomaly.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['timestamp', 'DESC']],
      include: [
        {
          model: models.ApiData,
          as: 'apiData',
          limit: 5,
          order: [['timestamp', 'DESC']]
        },
        {
          model: models.AuditLog,
          as: 'auditLogs',
          limit: 10,
          order: [['timestamp', 'DESC']]
        }
      ]
    });

    res.json({
      anomalies: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    logger.error('Error fetching anomalies:', error);
    res.status(500).json({ error: 'Failed to fetch anomalies' });
  }
});

// Get specific anomaly by ID
router.get('/:id', async (req, res) => {
  try {
    const anomaly = await models.Anomaly.findByPk(req.params.id, {
      include: [
        {
          model: models.ApiData,
          as: 'apiData'
        },
        {
          model: models.AuditLog,
          as: 'auditLogs',
          order: [['timestamp', 'DESC']]
        },
        {
          model: models.Workflow,
          as: 'workflow'
        }
      ]
    });

    if (!anomaly) {
      return res.status(404).json({ error: 'Anomaly not found' });
    }

    res.json(anomaly);

  } catch (error) {
    logger.error('Error fetching anomaly:', error);
    res.status(500).json({ error: 'Failed to fetch anomaly' });
  }
});

// Create new anomaly (manual or from external source)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      severity,
      location,
      modalities,
      sourceApis,
      tags
    } = req.body;

    // Analyze with AI if modalities provided
    let aiAnalysis = null;
    if (modalities) {
      aiAnalysis = await analyzeAnomalyData({
        modalities,
        location,
        timestamp: new Date(),
        sourceApis
      });
    }

    const anomaly = await models.Anomaly.create({
      title,
      description: description || aiAnalysis?.description,
      severity: severity || aiAnalysis?.severity || 'medium',
      confidence: aiAnalysis?.confidence || 0.5,
      status: 'detected',
      location,
      modalities,
      aiAnalysis,
      timestamp: new Date(),
      sourceApis,
      tags: tags || []
    });

    // Create audit log
    await models.AuditLog.create({
      anomalyId: anomaly.id,
      action: 'created',
      actor: 'human',
      reasoning: 'Manual anomaly creation',
      changes: { created: true },
      currentState: anomaly.toJSON()
    });

    logger.info(`Created anomaly ${anomaly.id}`);
    res.status(201).json(anomaly);

  } catch (error) {
    logger.error('Error creating anomaly:', error);
    res.status(500).json({ error: 'Failed to create anomaly' });
  }
});

// Update anomaly
router.put('/:id', async (req, res) => {
  try {
    const anomaly = await models.Anomaly.findByPk(req.params.id);
    if (!anomaly) {
      return res.status(404).json({ error: 'Anomaly not found' });
    }

    const previousState = anomaly.toJSON();
    const updates = req.body;

    // Update anomaly
    await anomaly.update({
      ...updates,
      lastUpdated: new Date()
    });

    // Create audit log
    await models.AuditLog.create({
      anomalyId: anomaly.id,
      action: 'updated',
      actor: 'human',
      changes: updates,
      previousState,
      currentState: anomaly.toJSON()
    });

    logger.info(`Updated anomaly ${anomaly.id}`);
    res.json(anomaly);

  } catch (error) {
    logger.error('Error updating anomaly:', error);
    res.status(500).json({ error: 'Failed to update anomaly' });
  }
});

// Approve anomaly
router.post('/:id/approve', async (req, res) => {
  try {
    const anomaly = await models.Anomaly.findByPk(req.params.id);
    if (!anomaly) {
      return res.status(404).json({ error: 'Anomaly not found' });
    }

    const previousState = anomaly.toJSON();
    const { reasoning } = req.body;

    await anomaly.update({
      status: 'approved',
      lastUpdated: new Date()
    });

    // Create audit log
    await models.AuditLog.create({
      anomalyId: anomaly.id,
      action: 'approved',
      actor: 'human',
      reasoning: reasoning || 'Manual approval',
      previousState,
      currentState: anomaly.toJSON()
    });

    // Trigger workflow if assigned
    if (anomaly.workflowId) {
      // TODO: Trigger workflow execution
    }

    logger.info(`Approved anomaly ${anomaly.id}`);
    res.json(anomaly);

  } catch (error) {
    logger.error('Error approving anomaly:', error);
    res.status(500).json({ error: 'Failed to approve anomaly' });
  }
});

// Reject anomaly
router.post('/:id/reject', async (req, res) => {
  try {
    const anomaly = await models.Anomaly.findByPk(req.params.id);
    if (!anomaly) {
      return res.status(404).json({ error: 'Anomaly not found' });
    }

    const previousState = anomaly.toJSON();
    const { reasoning } = req.body;

    await anomaly.update({
      status: 'rejected',
      lastUpdated: new Date()
    });

    await models.AuditLog.create({
      anomalyId: anomaly.id,
      action: 'rejected',
      actor: 'human',
      reasoning: reasoning || 'Manual rejection',
      previousState,
      currentState: anomaly.toJSON()
    });

    logger.info(`Rejected anomaly ${anomaly.id}`);
    res.json(anomaly);

  } catch (error) {
    logger.error('Error rejecting anomaly:', error);
    res.status(500).json({ error: 'Failed to reject anomaly' });
  }
});

// Escalate anomaly
router.post('/:id/escalate', async (req, res) => {
  try {
    const anomaly = await models.Anomaly.findByPk(req.params.id);
    if (!anomaly) {
      return res.status(404).json({ error: 'Anomaly not found' });
    }

    const previousState = anomaly.toJSON();
    const { reasoning, priority = 'high' } = req.body;

    await anomaly.update({
      severity: priority,
      status: 'escalated',
      lastUpdated: new Date()
    });

    await models.AuditLog.create({
      anomalyId: anomaly.id,
      action: 'escalated',
      actor: 'human',
      reasoning: reasoning || 'Manual escalation',
      previousState,
      currentState: anomaly.toJSON()
    });

    logger.info(`Escalated anomaly ${anomaly.id}`);
    res.json(anomaly);

  } catch (error) {
    logger.error('Error escalating anomaly:', error);
    res.status(500).json({ error: 'Failed to escalate anomaly' });
  }
});

// Generate report for anomaly
router.get('/:id/report/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const anomaly = await models.Anomaly.findByPk(req.params.id, {
      include: [
        { model: models.ApiData, as: 'apiData' },
        { model: models.AuditLog, as: 'auditLogs' }
      ]
    });

    if (!anomaly) {
      return res.status(404).json({ error: 'Anomaly not found' });
    }

    const report = await generateReport(anomaly.toJSON(), format);

    if (format === 'pdf') {
      // TODO: Generate PDF report
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=anomaly-${anomaly.id}.pdf`);
      // Return PDF buffer
      res.send(report.content);
    } else {
      res.json(report);
    }

  } catch (error) {
    logger.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Get anomaly statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalAnomalies = await models.Anomaly.count();
    const statusCounts = await models.Anomaly.findAll({
      attributes: [
        'status',
        [models.sequelize.fn('COUNT', models.sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    const severityCounts = await models.Anomaly.findAll({
      attributes: [
        'severity',
        [models.sequelize.fn('COUNT', models.sequelize.col('severity')), 'count']
      ],
      group: ['severity']
    });

    const recentAnomalies = await models.Anomaly.count({
      where: {
        timestamp: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    res.json({
      total: totalAnomalies,
      recent: recentAnomalies,
      byStatus: statusCounts,
      bySeverity: severityCounts,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Error fetching anomaly stats:', error);
    res.status(500).json({ error: 'Failed to fetch anomaly statistics' });
  }
});

module.exports = router;