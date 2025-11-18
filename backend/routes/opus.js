const express = require('express');
const router = express.Router();
const {
  triggerOpusWorkflow,
  getOpusWorkflowSchema,
  checkOpusJobStatus,
  triggerOpusWorkflowWithFiles,
  batchTriggerOpusWorkflows,
  monitorOpusJob
} = require('../services/opusIntegration');

// Trigger Opus workflow for an anomaly
router.post('/trigger', async (req, res) => {
  try {
    const anomalyData = req.body;

    if (!anomalyData || !anomalyData.id) {
      return res.status(400).json({ error: 'Anomaly data with ID required' });
    }

    const result = await triggerOpusWorkflow(anomalyData);

    if (result && result.success) {
      res.json(result);
    } else {
      res.status(500).json(result || { error: 'Workflow trigger failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger workflow with files
router.post('/trigger-with-files', async (req, res) => {
  try {
    const { anomalyData, files } = req.body;

    if (!anomalyData || !files) {
      return res.status(400).json({ error: 'Anomaly data and files required' });
    }

    const result = await triggerOpusWorkflowWithFiles(anomalyData, files);

    if (result && result.success) {
      res.json(result);
    } else {
      res.status(500).json(result || { error: 'Workflow trigger failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Batch trigger workflows
router.post('/batch-trigger', async (req, res) => {
  try {
    const { anomalies } = req.body;

    if (!anomalies || !Array.isArray(anomalies)) {
      return res.status(400).json({ error: 'Array of anomalies required' });
    }

    const result = await batchTriggerOpusWorkflows(anomalies);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get workflow schema
router.get('/schema/:workflowId?', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const result = await getOpusWorkflowSchema(workflowId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check job status
router.get('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID required' });
    }

    const result = await checkOpusJobStatus(jobId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Monitor job with SSE (Server-Sent Events)
router.get('/job/:jobId/monitor', async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID required' });
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Monitor job and send updates
    await monitorOpusJob(jobId, (status) => {
      res.write(`data: ${JSON.stringify(status)}\n\n`);
    });

    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Opus integration status
router.get('/status', (req, res) => {
  const configured = !!(process.env.OPUS_SERVICE_KEY && process.env.OPUS_WORKFLOW_ID);
  
  res.json({
    configured,
    serviceKey: process.env.OPUS_SERVICE_KEY ? '***' + process.env.OPUS_SERVICE_KEY.slice(-4) : null,
    workflowId: process.env.OPUS_WORKFLOW_ID || null,
    apiBase: 'https://operator.opus.com/v1'
  });
});

module.exports = router;
