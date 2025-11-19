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

const OPUS_API_BASE = 'https://operator.opus.com';
const OPUS_SERVICE_KEY = process.env.OPUS_SERVICE_KEY;
const OPUS_WORKFLOW_ID = process.env.OPUS_WORKFLOW_ID;

// Step 1: Get workflow details and schema
async function getWorkflowDetails(workflowId = OPUS_WORKFLOW_ID) {
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

    logger.info(`Retrieved workflow details for ${workflowId}`);
    return {
      success: true,
      workflow: response.data,
      jobPayloadSchema: response.data.jobPayloadSchema
    };

  } catch (error) {
    logger.error('Failed to fetch workflow details:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Step 2: Initiate job
async function initiateJob(workflowId, title, description) {
  try {
    if (!OPUS_SERVICE_KEY) {
      throw new Error('Opus service key not configured');
    }

    const response = await axios.post(
      `${OPUS_API_BASE}/job/initiate`,
      {
        workflowId,
        title,
        description
      },
      {
        headers: {
          'x-service-key': OPUS_SERVICE_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info(`Job initiated: ${response.data.jobExecutionId}`);
    return {
      success: true,
      jobExecutionId: response.data.jobExecutionId
    };

  } catch (error) {
    logger.error('Failed to initiate job:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Step 3: Generate presigned URL for file upload
async function generateFileUploadUrl(fileExtension, accessScope = 'organization') {
  try {
    if (!OPUS_SERVICE_KEY) {
      throw new Error('Opus service key not configured');
    }

    const response = await axios.post(
      `${OPUS_API_BASE}/job/file/upload`,
      {
        fileExtension,
        accessScope
      },
      {
        headers: {
          'x-service-key': OPUS_SERVICE_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info(`Generated presigned URL for ${fileExtension} file`);
    return {
      success: true,
      presignedUrl: response.data.presignedUrl,
      fileUrl: response.data.fileUrl
    };

  } catch (error) {
    logger.error('Failed to generate presigned URL:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Step 4: Upload file to presigned URL
async function uploadFile(presignedUrl, fileBuffer) {
  try {
    await axios.put(presignedUrl, fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    });

    logger.info('File uploaded successfully');
    return { success: true };

  } catch (error) {
    logger.error('Failed to upload file:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Step 5: Execute job
async function executeJob(jobExecutionId, jobPayloadSchemaInstance) {
  try {
    if (!OPUS_SERVICE_KEY) {
      throw new Error('Opus service key not configured');
    }

    const response = await axios.post(
      `${OPUS_API_BASE}/job/execute`,
      {
        jobExecutionId,
        jobPayloadSchemaInstance
      },
      {
        headers: {
          'x-service-key': OPUS_SERVICE_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info(`Job executed: ${jobExecutionId}`);
    return {
      success: true,
      message: response.data.message,
      jobExecutionId: response.data.jobExecutionId
    };

  } catch (error) {
    logger.error('Failed to execute job:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Step 6: Get job execution status
async function getJobStatus(jobExecutionId) {
  try {
    if (!OPUS_SERVICE_KEY) {
      throw new Error('Opus service key not configured');
    }

    const response = await axios.get(
      `${OPUS_API_BASE}/job/${jobExecutionId}/status`,
      {
        headers: {
          'x-service-key': OPUS_SERVICE_KEY
        }
      }
    );

    return {
      success: true,
      status: response.data.status,
      jobExecutionId
    };

  } catch (error) {
    logger.error(`Failed to get job status for ${jobExecutionId}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Step 7: Get job results
async function getJobResults(jobExecutionId) {
  try {
    if (!OPUS_SERVICE_KEY) {
      throw new Error('Opus service key not configured');
    }

    const response = await axios.get(
      `${OPUS_API_BASE}/job/${jobExecutionId}/results`,
      {
        headers: {
          'x-service-key': OPUS_SERVICE_KEY
        }
      }
    );

    logger.info(`Retrieved results for job ${jobExecutionId}`);
    return {
      success: true,
      jobExecutionId: response.data.jobExecutionId,
      status: response.data.status,
      results: response.data.results
    };

  } catch (error) {
    logger.error(`Failed to get job results for ${jobExecutionId}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Step 8: Get job audit log
async function getJobAudit(jobExecutionId) {
  try {
    if (!OPUS_SERVICE_KEY) {
      throw new Error('Opus service key not configured');
    }

    const response = await axios.get(
      `${OPUS_API_BASE}/job/${jobExecutionId}/audit`,
      {
        headers: {
          'x-service-key': OPUS_SERVICE_KEY
        }
      }
    );

    return {
      success: true,
      jobExecutionId: response.data.jobExecutionId,
      auditTrail: response.data.auditTrail
    };

  } catch (error) {
    logger.error(`Failed to get job audit for ${jobExecutionId}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Complete workflow: Trigger Opus workflow for anomaly processing
async function triggerOpusWorkflow(anomalyData, files = []) {
  try {
    if (!OPUS_SERVICE_KEY || !OPUS_WORKFLOW_ID) {
      logger.warn('Opus credentials not configured, skipping workflow trigger');
      return null;
    }

    logger.info(`Starting Opus workflow for anomaly ${anomalyData.id}`);

    // Step 1: Get workflow schema
    const workflowDetails = await getWorkflowDetails(OPUS_WORKFLOW_ID);
    if (!workflowDetails.success) {
      return workflowDetails;
    }

    // Step 2: Initiate job
    const jobInit = await initiateJob(
      OPUS_WORKFLOW_ID,
      `Anomaly Analysis: ${anomalyData.title}`,
      `Processing anomaly ${anomalyData.id} - ${anomalyData.description}`
    );
    if (!jobInit.success) {
      return jobInit;
    }

    const jobExecutionId = jobInit.jobExecutionId;

    // Step 3-4: Upload files if any
    const uploadedFiles = [];
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const uploadUrl = await generateFileUploadUrl(`.${fileExt}`);
      
      if (uploadUrl.success) {
        const upload = await uploadFile(uploadUrl.presignedUrl, file.buffer);
        if (upload.success) {
          uploadedFiles.push(uploadUrl.fileUrl);
        }
      }
    }

    // Step 5: Build job payload based on schema
    const jobPayloadSchemaInstance = buildJobPayload(
      workflowDetails.jobPayloadSchema,
      anomalyData,
      uploadedFiles
    );

    // Step 6: Execute job
    const execution = await executeJob(jobExecutionId, jobPayloadSchemaInstance);
    if (!execution.success) {
      return execution;
    }

    logger.info(`Opus workflow triggered successfully. Job ID: ${jobExecutionId}`);

    return {
      success: true,
      jobExecutionId,
      workflowId: OPUS_WORKFLOW_ID,
      filesUploaded: uploadedFiles.length,
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

// Helper: Build job payload from schema
function buildJobPayload(schema, anomalyData, fileUrls = []) {
  const payload = {};

  // Map anomaly data to workflow inputs based on schema
  for (const [key, field] of Object.entries(schema)) {
    const { type, display_name } = field;

    // Map based on display name or type
    if (display_name?.toLowerCase().includes('text') || type === 'str') {
      payload[key] = {
        value: anomalyData.title || anomalyData.description || '',
        type: 'str'
      };
    } else if (display_name?.toLowerCase().includes('number') || type === 'float') {
      payload[key] = {
        value: anomalyData.confidence || anomalyData.severity || 0,
        type: 'float'
      };
    } else if (type === 'file' && fileUrls.length > 0) {
      payload[key] = {
        value: fileUrls[0],
        type: 'file'
      };
    } else if (type === 'array_files' && fileUrls.length > 0) {
      payload[key] = {
        value: fileUrls,
        type: 'array_files'
      };
    } else if (type === 'bool') {
      payload[key] = {
        value: anomalyData.verified || false,
        type: 'bool'
      };
    } else if (type === 'date') {
      payload[key] = {
        value: anomalyData.timestamp || new Date().toISOString().split('T')[0],
        type: 'date'
      };
    } else if (type === 'object') {
      payload[key] = {
        value: {
          anomaly_id: anomalyData.id,
          location: anomalyData.location,
          metadata: anomalyData.metadata
        },
        type: 'object'
      };
    } else if (type === 'array') {
      payload[key] = {
        value: anomalyData.modalities || anomalyData.tags || [],
        type: 'array'
      };
    }
  }

  return payload;
}

// Trigger workflow with file upload (wrapper for backward compatibility)
async function triggerOpusWorkflowWithFiles(anomalyData, files) {
  return triggerOpusWorkflow(anomalyData, files);
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
async function monitorOpusJob(jobExecutionId, onProgress) {
  const maxAttempts = 60; // 5 minutes max (5 second intervals)
  let attempts = 0;

  const checkStatus = async () => {
    attempts++;
    const status = await getJobStatus(jobExecutionId);

    if (onProgress) {
      onProgress(status);
    }

    if (status.success && status.status === 'COMPLETED') {
      logger.info(`Opus job ${jobExecutionId} completed successfully`);
      // Get final results
      const results = await getJobResults(jobExecutionId);
      return results;
    }

    if (status.success && status.status === 'FAILED') {
      logger.error(`Opus job ${jobExecutionId} failed`);
      return status;
    }

    if (attempts >= maxAttempts) {
      logger.warn(`Opus job ${jobExecutionId} monitoring timeout`);
      return { success: false, error: 'Monitoring timeout' };
    }

    // Continue monitoring
    await new Promise(resolve => setTimeout(resolve, 5000));
    return checkStatus();
  };

  return checkStatus();
}

module.exports = {
  // Core API functions
  getWorkflowDetails,
  initiateJob,
  generateFileUploadUrl,
  uploadFile,
  executeJob,
  getJobStatus,
  getJobResults,
  getJobAudit,
  
  // High-level functions
  triggerOpusWorkflow,
  triggerOpusWorkflowWithFiles,
  batchTriggerOpusWorkflows,
  monitorOpusJob,
  
  // Legacy aliases
  getOpusWorkflowSchema: getWorkflowDetails,
  checkOpusJobStatus: getJobStatus
};
