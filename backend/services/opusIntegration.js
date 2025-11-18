const axios = require('axios');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/opus.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

const OPUS_API_BASE = 'https://operator.opus.com/v1';
const OPUS_SERVICE_KEY = process.env.OPUS_SERVICE_KEY;
const OPUS_WORKFLOW_ID = process.env.OPUS_WORKFLOW_ID;

// Trigger Opus workflow for anomaly processing
async function triggerOpusWorkflow(anomalyData) {
  try {
    if (!OPUS_SERVICE_KEY || !OPUS_WORKFLOW_ID) {
      logger.warn('Opus credentials not configured, skipping workflow trigger');
      return null;
    }

    // Prepare payload according to Opus jobPayloadSchema
    const payload = {
      workflowId: OPUS_WORKFLOW_ID,
      arguments: {
        input_data: {
          anomaly_id: anomalyData.id,
          title: anomalyData.title,
          description: anomalyData.description,
          severity: anomalyData.severity,
          confidence: anomalyData.confidence,
          location: anomalyData.location,
          timestamp: anomalyData.timestamp,
          modalities: anomalyData.modalities || [],
          source_data: anomalyData.sourceData || {},
          ai_analysis: anomalyData.aiAnalysis || {},
          metadata: anomalyData.metadata || {}
        }
      }
    };

    logger.info(`Triggering Opus workflow for anomaly ${anomalyData.id}`);

    const response = await axios.post(
      `${OPUS_API_BASE}/jobs/run`,
      payload,
      {
        headers: {
          'x-service-key': OPUS_SERVICE_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    logger.info(`Opus workflow triggered successfully. Job ID: ${response.data.jobId}`);

    return {
      success: true,
      jobId: response.data.jobId,
      status: response.data.status,
      workflowId: OPUS_WORKFLOW_ID,
      triggeredAt: new Date().toISOString()
    };

  } catch (error) {
    logger.error('Opus workflow trigger error:', error.message);
    
    return {
      success: false,
      error: error.message,
      workflowId: OPUS_WORKFLOW_ID,
      triggeredAt: new Date().toISOString()
    };
  }
}

// Get Opus workflow schema
async function getOpusWorkflowSchema(workflowId = OPUS_WORKFLOW_ID) {
  try {
    if (!OPUS_SERVICE_KEY) {
      throw new Error('Opus service key not configured');
    }

    const response = await axios.get(
      `${OPUS_API_BASE}/workflow/${workflowId}`,
      {
        headers: {
          'x-service-key': OPUS_SERVICE_KEY
        }
      }
    );

    return {
      success: true,
      schema: response.data.jobPayloadSchema,
      workflow: response.data
    };

  } catch (error) {
    logger.error('Failed to fetch Opus workflow schema:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Check Opus job status
async function checkOpusJobStatus(jobId) {
  try {
    if (!OPUS_SERVICE_KEY) {
      throw new Error('Opus service key not configured');
    }

    const response = await axios.get(
      `${OPUS_API_BASE}/jobs/${jobId}`,
      {
        headers: {
          'x-service-key': OPUS_SERVICE_KEY
        }
      }
    );

    return {
      success: true,
      jobId: jobId,
      status: response.data.status,
      result: response.data.result,
      progress: response.data.progress,
      updatedAt: response.data.updatedAt
    };

  } catch (error) {
    logger.error(`Failed to check Opus job ${jobId} status:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Trigger workflow with file upload
async function triggerOpusWorkflowWithFiles(anomalyData, files) {
  try {
    if (!OPUS_SERVICE_KEY || !OPUS_WORKFLOW_ID) {
      logger.warn('Opus credentials not configured');
      return null;
    }

    // Convert files to base64 or URLs
    const fileData = files.map(file => ({
      type: 'file',
      name: file.name,
      mimeType: file.type,
      value: file.buffer ? file.buffer.toString('base64') : file.url
    }));

    const payload = {
      workflowId: OPUS_WORKFLOW_ID,
      arguments: {
        input_data: {
          anomaly_id: anomalyData.id,
          title: anomalyData.title,
          description: anomalyData.description,
          severity: anomalyData.severity,
          confidence: anomalyData.confidence,
          location: anomalyData.location,
          timestamp: anomalyData.timestamp,
          files: fileData,
          modalities: anomalyData.modalities || [],
          metadata: anomalyData.metadata || {}
        }
      }
    };

    const response = await axios.post(
      `${OPUS_API_BASE}/jobs/run`,
      payload,
      {
        headers: {
          'x-service-key': OPUS_SERVICE_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 second timeout for file uploads
      }
    );

    logger.info(`Opus workflow with files triggered. Job ID: ${response.data.jobId}`);

    return {
      success: true,
      jobId: response.data.jobId,
      status: response.data.status,
      workflowId: OPUS_WORKFLOW_ID,
      filesUploaded: files.length,
      triggeredAt: new Date().toISOString()
    };

  } catch (error) {
    logger.error('Opus workflow with files trigger error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Batch trigger multiple workflows
async function batchTriggerOpusWorkflows(anomalies) {
  try {
    const results = await Promise.allSettled(
      anomalies.map(anomaly => triggerOpusWorkflow(anomaly))
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
    const failed = results.length - successful;

    logger.info(`Batch trigger completed: ${successful} successful, ${failed} failed`);

    return {
      total: results.length,
      successful,
      failed,
      results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason })
    };

  } catch (error) {
    logger.error('Batch trigger error:', error.message);
    return {
      total: anomalies.length,
      successful: 0,
      failed: anomalies.length,
      error: error.message
    };
  }
}

// Monitor job progress
async function monitorOpusJob(jobId, onProgress) {
  const maxAttempts = 60; // 5 minutes max (5 second intervals)
  let attempts = 0;

  const checkStatus = async () => {
    attempts++;
    const status = await checkOpusJobStatus(jobId);

    if (onProgress) {
      onProgress(status);
    }

    if (status.success && status.status === 'completed') {
      logger.info(`Opus job ${jobId} completed successfully`);
      return status;
    }

    if (status.success && status.status === 'failed') {
      logger.error(`Opus job ${jobId} failed`);
      return status;
    }

    if (attempts >= maxAttempts) {
      logger.warn(`Opus job ${jobId} monitoring timeout`);
      return { success: false, error: 'Monitoring timeout' };
    }

    // Continue monitoring
    await new Promise(resolve => setTimeout(resolve, 5000));
    return checkStatus();
  };

  return checkStatus();
}

module.exports = {
  triggerOpusWorkflow,
  getOpusWorkflowSchema,
  checkOpusJobStatus,
  triggerOpusWorkflowWithFiles,
  batchTriggerOpusWorkflows,
  monitorOpusJob
};
