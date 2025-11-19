const express = require('express');
const router = express.Router();
const {
  getWorkflowDetails,
  initiateJob,
  generateFileUploadUrl,
  uploadFile,
  executeJob,
  getJobStatus,
  getJobResults,
  getJobAudit,
  triggerOpusWorkflow,
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

// Get workflow details and schema
router.get('/workflow/:workflowId?', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const result = await getWorkflowDetails(workflowId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initiate a new job
router.post('/job/initiate', async (req, res) => {
  try {
    const { workflowId, title, description } = req.body;

    if (!workflowId || !title || !description) {
      return res.status(400).json({ error: 'workflowId, title, and description required' });
    }

    const result = await initiateJob(workflowId, title, description);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate presigned file upload URL
router.post('/job/file/upload', async (req, res) => {
  try {
    const { fileExtension, accessScope } = req.body;

    if (!fileExtension) {
      return res.status(400).json({ error: 'fileExtension required' });
    }

    const result = await generateFileUploadUrl(fileExtension, accessScope);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Execute job
router.post('/job/execute', async (req, res) => {
  try {
    const { jobExecutionId, jobPayloadSchemaInstance } = req.body;

    if (!jobExecutionId || !jobPayloadSchemaInstance) {
      return res.status(400).json({ error: 'jobExecutionId and jobPayloadSchemaInstance required' });
    }

    const result = await executeJob(jobExecutionId, jobPayloadSchemaInstance);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get job status
router.get('/job/:jobExecutionId/status', async (req, res) => {
  try {
    const { jobExecutionId } = req.params;

    if (!jobExecutionId) {
      return res.status(400).json({ error: 'Job execution ID required' });
    }

    const result = await getJobStatus(jobExecutionId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get job results
router.get('/job/:jobExecutionId/results', async (req, res) => {
  try {
    const { jobExecutionId } = req.params;

    if (!jobExecutionId) {
      return res.status(400).json({ error: 'Job execution ID required' });
    }

    const result = await getJobResults(jobExecutionId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get job audit log
router.get('/job/:jobExecutionId/audit', async (req, res) => {
  try {
    const { jobExecutionId } = req.params;

    if (!jobExecutionId) {
      return res.status(400).json({ error: 'Job execution ID required' });
    }

    const result = await getJobAudit(jobExecutionId);

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
router.get('/job/:jobExecutionId/monitor', async (req, res) => {
  try {
    const { jobExecutionId } = req.params;

    if (!jobExecutionId) {
      return res.status(400).json({ error: 'Job execution ID required' });
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Monitor job and send updates
    await monitorOpusJob(jobExecutionId, (status) => {
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
    apiBase: 'https://operator.opus.com'
  });
});

module.exports = router;
