# Opus Remote Workflow Integration Guide

## Overview
Complete integration with Opus platform for remote workflow triggering, following the official Opus API documentation.

## ✅ What's Implemented

### Core API Functions
All Opus API endpoints are fully integrated:

1. **GET /workflow/{workflowId}** - Get workflow details and schema
2. **POST /job/initiate** - Initiate a new job
3. **POST /job/file/upload** - Generate presigned file upload URL
4. **PUT {presignedUrl}** - Upload file to presigned URL
5. **POST /job/execute** - Execute job with payload
6. **GET /job/{jobExecutionId}/status** - Get job execution status
7. **GET /job/{jobExecutionId}/results** - Get job results
8. **GET /job/{jobExecutionId}/audit** - Get job audit log

### High-Level Functions
Convenient wrapper functions for common workflows:

- `triggerOpusWorkflow(anomalyData, files)` - Complete workflow trigger
- `triggerOpusWorkflowWithFiles(anomalyData, files)` - Trigger with file uploads
- `batchTriggerOpusWorkflows(anomalies)` - Batch processing
- `monitorOpusJob(jobExecutionId, onProgress)` - Real-time monitoring

## Configuration

### Environment Variables
Already configured in `.env`:

```bash
OPUS_SERVICE_KEY=_9a2aca85e0ca0fffca8a6490c197f3950a9da6cb6442e7add53b13ac625dac8c0a6ba43fce81e4686d6934666e6e3774
OPUS_WORKFLOW_ID=mscAs7ikJERHpxqC
```

### API Base URL
```
https://operator.opus.com
```

## API Endpoints

### 1. Get Workflow Details
```http
GET /api/opus/workflow/:workflowId?
```

**Response:**
```json
{
  "success": true,
  "workflow": { ... },
  "jobPayloadSchema": { ... }
}
```

### 2. Initiate Job
```http
POST /api/opus/job/initiate
Content-Type: application/json

{
  "workflowId": "mscAs7ikJERHpxqC",
  "title": "Anomaly Analysis",
  "description": "Processing anomaly data"
}
```

**Response:**
```json
{
  "success": true,
  "jobExecutionId": "2514"
}
```

### 3. Generate File Upload URL
```http
POST /api/opus/job/file/upload
Content-Type: application/json

{
  "fileExtension": ".pdf",
  "accessScope": "organization"
}
```

**Response:**
```json
{
  "success": true,
  "presignedUrl": "https://...",
  "fileUrl": "https://files.opus.com/..."
}
```

### 4. Execute Job
```http
POST /api/opus/job/execute
Content-Type: application/json

{
  "jobExecutionId": "2514",
  "jobPayloadSchemaInstance": {
    "workflow_input_we4tej0ly": {
      "value": "API Test Project",
      "type": "str"
    },
    "workflow_input_a0hk6ujuo": {
      "value": 45.8,
      "type": "float"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job execution has been started",
  "jobExecutionId": "2514"
}
```

### 5. Get Job Status
```http
GET /api/opus/job/:jobExecutionId/status
```

**Response:**
```json
{
  "success": true,
  "status": "IN PROGRESS",
  "jobExecutionId": "2514"
}
```

Status values: `IN PROGRESS`, `COMPLETED`, `FAILED`

### 6. Get Job Results
```http
GET /api/opus/job/:jobExecutionId/results
```

**Response:**
```json
{
  "success": true,
  "jobExecutionId": "2514",
  "status": "COMPLETED",
  "results": {
    "summary": "Job executed successfully.",
    "outputFiles": ["https://files.opus.com/..."],
    "data": {
      "score": 92,
      "verdict": "PASS"
    }
  }
}
```

### 7. Get Job Audit Log
```http
GET /api/opus/job/:jobExecutionId/audit
```

**Response:**
```json
{
  "success": true,
  "jobExecutionId": "2514",
  "auditTrail": [
    {
      "timestamp": "2025-10-27T12:32:00Z",
      "actor": "SYSTEM",
      "action": "Job initiated"
    }
  ]
}
```

### 8. Monitor Job (SSE)
```http
GET /api/opus/job/:jobExecutionId/monitor
```

Server-Sent Events stream with real-time status updates.

## High-Level Usage

### Simple Trigger
```javascript
const { triggerOpusWorkflow } = require('./services/opusIntegration');

const anomalyData = {
  id: 123,
  title: "Seismic Activity Detected",
  description: "Unusual seismic patterns in region",
  severity: "high",
  confidence: 0.95,
  location: { lat: 34.05, lng: -118.25 },
  timestamp: "2025-11-19T10:00:00Z"
};

const result = await triggerOpusWorkflow(anomalyData);
console.log(result.jobExecutionId);
```

### Trigger with Files
```javascript
const files = [
  {
    name: "seismic-data.pdf",
    buffer: fileBuffer
  }
];

const result = await triggerOpusWorkflow(anomalyData, files);
```

### Monitor Job Progress
```javascript
const { monitorOpusJob } = require('./services/opusIntegration');

const result = await monitorOpusJob(jobExecutionId, (status) => {
  console.log(`Status: ${status.status}`);
});

if (result.success && result.status === 'COMPLETED') {
  console.log('Results:', result.results);
}
```

### Batch Processing
```javascript
const { batchTriggerOpusWorkflows } = require('./services/opusIntegration');

const anomalies = [anomaly1, anomaly2, anomaly3];
const result = await batchTriggerOpusWorkflows(anomalies);

console.log(`${result.successful} successful, ${result.failed} failed`);
```

## Workflow Payload Mapping

The system automatically maps anomaly data to workflow inputs based on the schema:

| Schema Type | Mapped From |
|------------|-------------|
| `str` | title, description |
| `float` | confidence, severity |
| `file` | First uploaded file |
| `array_files` | All uploaded files |
| `bool` | verified flag |
| `date` | timestamp |
| `object` | Full anomaly metadata |
| `array` | modalities, tags |

## Supported File Types

- `.jpeg`, `.jpg`, `.png` - Images
- `.pdf` - Documents
- `.docx` - Word documents
- `.csv`, `.xls`, `.xlsx` - Spreadsheets
- `.txt`, `.json` - Text files
- `.html`, `.xml` - Markup files

## Error Handling

All functions return a consistent response format:

**Success:**
```json
{
  "success": true,
  "jobExecutionId": "2514",
  ...
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Testing

### Check Integration Status
```bash
curl http://localhost:3001/api/opus/status
```

### Get Workflow Schema
```bash
curl -H "Content-Type: application/json" \
  http://localhost:3001/api/opus/workflow/mscAs7ikJERHpxqC
```

### Trigger Test Workflow
```bash
curl -X POST http://localhost:3001/api/opus/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "title": "Test Anomaly",
    "description": "Testing Opus integration",
    "severity": "medium",
    "confidence": 0.85
  }'
```

## Integration Points

### Anomaly Upload
When users upload anomalies, automatically trigger Opus workflow:

```javascript
// In backend/routes/upload.js
const opusResult = await triggerOpusWorkflow(anomalyData, files);
```

### Real-time Processing
Monitor jobs and update anomaly status:

```javascript
const result = await monitorOpusJob(jobExecutionId, async (status) => {
  await updateAnomalyStatus(anomalyId, status);
});
```

### Batch Analysis
Process multiple anomalies overnight:

```javascript
const pendingAnomalies = await getPendingAnomalies();
const results = await batchTriggerOpusWorkflows(pendingAnomalies);
```

## Logging

All Opus operations are logged to `logs/opus.log`:

```
[info] Triggering Opus workflow for anomaly 123
[info] Job initiated: 2514
[info] File uploaded successfully
[info] Job executed: 2514
[info] Opus job 2514 completed successfully
```

## Next Steps

1. ✅ Integration complete and ready to use
2. Test with your actual workflow schema
3. Customize payload mapping if needed
4. Add webhook handlers for job completion
5. Implement result processing logic

## Support

For Opus API documentation:
- Base URL: https://operator.opus.com
- Documentation: Check Opus platform docs
- API Keys: Manage in Organization settings

## Notes

- All API calls include proper authentication headers
- File uploads use presigned URLs (no auth needed for PUT)
- Job monitoring polls every 5 seconds for up to 5 minutes
- Batch operations use Promise.allSettled for resilience
- Automatic payload mapping based on workflow schema
