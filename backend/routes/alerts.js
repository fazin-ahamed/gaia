const express = require('express');
const winston = require('winston');

const router = express.Router();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/alerts.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

// Get all alerts (from anomalies with high severity)
router.get('/', async (req, res) => {
  try {
    const { status, severity } = req.query;
    
    const whereClause = {
      severity: ['High', 'Critical']
    };

    if (status) {
      whereClause.status = status;
    }

    if (severity) {
      whereClause.severity = severity;
    }

    const anomalies = await global.models.Anomaly.findAll({
      where: whereClause,
      order: [['timestamp', 'DESC']],
      limit: 50,
      include: [
        {
          model: global.models.ApiData,
          as: 'ApiData',
          limit: 5
        }
      ]
    });

    // Transform anomalies into alerts format
    const alerts = anomalies.map(anomaly => ({
      id: `alert-${anomaly.id}`,
      title: anomaly.title,
      description: anomaly.description,
      severity: anomaly.severity,
      timestamp: anomaly.timestamp,
      anomalyId: anomaly.id,
      swarmRecommendation: anomaly.aiAnalysis?.recommendedActions?.join('. ') || 'Manual review recommended',
      actions: anomaly.aiAnalysis?.recommendedActions || ['Review', 'Investigate'],
      status: anomaly.status === 'detected' ? 'new' : anomaly.status === 'approved' ? 'acknowledged' : 'resolved',
      confidence: anomaly.confidence,
      location: anomaly.location || 'Unknown'
    }));

    res.json({
      alerts,
      total: alerts.length,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get alert statistics
router.get('/stats', async (req, res) => {
  try {
    const totalAlerts = await global.models.Anomaly.count({
      where: {
        severity: ['High', 'Critical']
      }
    });

    const newAlerts = await global.models.Anomaly.count({
      where: {
        severity: ['High', 'Critical'],
        status: 'detected'
      }
    });

    const acknowledgedAlerts = await global.models.Anomaly.count({
      where: {
        severity: ['High', 'Critical'],
        status: 'approved'
      }
    });

    const resolvedAlerts = await global.models.Anomaly.count({
      where: {
        severity: ['High', 'Critical'],
        status: 'rejected'
      }
    });

    res.json({
      total: totalAlerts,
      new: newAlerts,
      acknowledged: acknowledgedAlerts,
      resolved: resolvedAlerts,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Error fetching alert stats:', error);
    res.status(500).json({ error: 'Failed to fetch alert statistics' });
  }
});

// Update alert status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Extract anomaly ID from alert ID (format: alert-{anomalyId})
    const anomalyId = id.replace('alert-', '');

    const anomaly = await global.models.Anomaly.findByPk(anomalyId);
    if (!anomaly) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Map alert status to anomaly status
    const statusMap = {
      'new': 'detected',
      'acknowledged': 'approved',
      'resolved': 'rejected'
    };

    await anomaly.update({
      status: statusMap[status] || status,
      lastUpdated: new Date()
    });

    // Create audit log
    await global.models.AuditLog.create({
      anomalyId: anomaly.id,
      action: `status_changed_to_${status}`,
      actor: 'user',
      reasoning: `Alert status changed to ${status}`,
      currentState: anomaly.toJSON()
    });

    res.json({
      success: true,
      alert: {
        id: `alert-${anomaly.id}`,
        status
      }
    });

  } catch (error) {
    logger.error('Error updating alert status:', error);
    res.status(500).json({ error: 'Failed to update alert status' });
  }
});

module.exports = router;
