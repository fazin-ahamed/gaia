# GAIA 3.1 - Opus Workflow Integration Guide

> **🚀 NEW: Remote Workflow API Integration Complete!**
> Full implementation of Opus remote workflow triggering API. See [OPUS_REMOTE_WORKFLOW_GUIDE.md](OPUS_REMOTE_WORKFLOW_GUIDE.md) for complete API documentation.

## Overview
GAIA 3.1 integrates with Opus workflow orchestration platform to automate anomaly processing through sophisticated AI-powered workflows. The integration now includes full support for remote workflow triggering via the official Opus API.

## How It Works

### 1. Workflow Trigger Flow
```
Anomaly Detected → GAIA Analysis → Opus Workflow Triggered → Job Executed → Results Returned
```

### 2. Integration Points
- **Upload Analysis**: Automatically triggers Opus when anomaly detected
- **Real-time Data**: Triggers workflows for hotspot anomalies
- **Manual Trigger**: API endpoint for manual workflow execution
- **Batch Processing**: Trigger multiple workflows simultaneously

## Setup Instructions

### 1. Get Opus Credentials

1. **Service Key**: 
   - Log into Opus platform
   - Navigate to Settings → API Keys
   - Generate new service key
   - Copy the key (starts with `opus_`)

2. **Workflow ID**:
   - Go to Workflows section
   - Select your anomaly processing workflow
   - Copy the workflow ID from URL or workflow details

### 2. Configure GAIA Backend

Add to `backend/.env`:

```bash
# Opus Workflow Integration
OPUS_SERVICE_KEY=opus_your_service_key_here
OPUS_WORKFLOW_ID=wf_your_workflow_id_here
```

### 3. Verify Configuration

```bash
curl http://localhost:3001/api/opus/status
```

Expected response:
```json
{
  "configured": true,
  "serviceKey": "***key4",
  "workflowId": "wf_abc123",
  "apiBase": "https://operator.opus.com/v1"
}
```

## Opus Workflow Schema

### Required Input Fields

Your Opus workflow should accept the following `jobPayloadSchema`:

```json
{
  "input_data": {
    "anomaly_id": "string",
    "title": "string",
    "description": "string",
    "severity": "string (Low|Medium|High|Critical)",
    "confidence": "number (0-1)",
    "location": "string",
    "timestamp": "string (ISO 8601)",
    "modalities": "array of strings",
    "source_data": "object",
    "ai_analysis": "object",
    "metadata": "object"
  }
}
```

### Optional File Fields

For workflows that process files:

```json
{
  "input_data": {
    ...
    "files": [
      {
        "type": "file",
        "name": "string",
        "mimeType": "string",
        "value": "base64 string or URL"
      }
    ]
  }
}
```

## API Endpoints

### POST `/api/opus/trigger`
Trigger Opus workflow for an anomaly

**Request:**
```json
{
  "id": "anom-001",
  "title": "Unusual Seismic Activity",
  "description": "Multiple tremors detected",
  "severity": "High",
  "confidence": 0.89,
  "location": "Pacific Northwest",
  "timestamp": "2024-11-18T10:00:00Z",
  "modalities": ["sensor", "seismic"],
  "aiAnalysis": {...}
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "job_abc123",
  "status": "running",
  "workflowId": "wf_xyz789",
  "triggeredAt": "2024-11-18T10:00:01Z"
}
```

### POST `/api/opus/trigger-with-files`
Trigger workflow with file uploads

**Request:**
```json
{
  "anomalyData": {...},
  "files": [
    {
      "name": "evidence.jpg",
      "type": "image/jpeg",
      "buffer": "base64_encoded_data"
    }
  ]
}
```

### POST `/api/opus/batch-trigger`
Trigger multiple workflows

**Request:**
```json
{
  "anomalies": [
    {...anomaly1...},
    {...anomaly2...},
    {...anomaly3...}
  ]
}
```

**Response:**
```json
{
  "total": 3,
  "successful": 2,
  "failed": 1,
  "results": [...]
}
```

### GET `/api/opus/job/:jobId`
Check job status

**Response:**
```json
{
  "success": true,
  "jobId": "job_abc123",
  "status": "completed",
  "result": {...},
  "progress": 100,
  "updatedAt": "2024-11-18T10:05:00Z"
}
```

### GET `/api/opus/job/:jobId/monitor`
Monitor job with real-time updates (SSE)

Returns Server-Sent Events stream with job progress updates.

### GET `/api/opus/schema/:workflowId?`
Get workflow schema

**Response:**
```json
{
  "success": true,
  "schema": {...jobPayloadSchema...},
  "workflow": {...workflow details...}
}
```

## Automatic Triggers

### 1. File Upload
When a file is uploaded and analyzed:
- If anomaly detected (not fake)
- Opus workflow automatically triggered
- Job ID returned in response

```javascript
// In upload response
{
  "isAnomaly": true,
  "confidence": 0.89,
  "opusWorkflow": {
    "success": true,
    "jobId": "job_abc123"
  }
}
```

### 2. Real-time Hotspots
Hotspots with high severity automatically trigger workflows:

```javascript
// In backend/services/externalAPIs.js
if (hotspot.severity === 'High' || hotspot.severity === 'Critical') {
  await triggerOpusWorkflow(hotspot);
}
```

## Manual Triggers

### From Frontend

```typescript
// In your component
import { apiService } from '../src/services/apiService';

const triggerWorkflow = async (anomaly) => {
  const response = await fetch('http://localhost:3001/api/opus/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(anomaly)
  });
  
  const result = await response.json();
  console.log('Workflow triggered:', result.jobId);
};
```

### From Backend

```javascript
const { triggerOpusWorkflow } = require('./services/opusIntegration');

const result = await triggerOpusWorkflow({
  id: 'anom-001',
  title: 'Test Anomaly',
  // ... other fields
});

console.log('Job ID:', result.jobId);
```

## Monitoring Jobs

### Poll for Status

```javascript
const checkStatus = async (jobId) => {
  const response = await fetch(`http://localhost:3001/api/opus/job/${jobId}`);
  const status = await response.json();
  
  if (status.status === 'completed') {
    console.log('Job completed:', status.result);
  } else if (status.status === 'failed') {
    console.error('Job failed:', status.error);
  } else {
    // Still running, check again later
    setTimeout(() => checkStatus(jobId), 5000);
  }
};
```

### Real-time Monitoring (SSE)

```javascript
const monitorJob = (jobId) => {
  const eventSource = new EventSource(
    `http://localhost:3001/api/opus/job/${jobId}/monitor`
  );
  
  eventSource.onmessage = (event) => {
    const status = JSON.parse(event.data);
    console.log('Job update:', status);
    
    if (status.status === 'completed' || status.status === 'failed') {
      eventSource.close();
    }
  };
};
```

## Error Handling

### Common Errors

**1. Missing Credentials**
```json
{
  "success": false,
  "error": "Opus service key not configured"
}
```
**Solution**: Add OPUS_SERVICE_KEY to .env

**2. Invalid Workflow ID**
```json
{
  "success": false,
  "error": "Workflow not found"
}
```
**Solution**: Verify OPUS_WORKFLOW_ID in .env

**3. Schema Mismatch**
```json
{
  "success": false,
  "error": "Invalid payload schema"
}
```
**Solution**: Check workflow schema with `/api/opus/schema`

### Retry Logic

```javascript
const triggerWithRetry = async (anomaly, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await triggerOpusWorkflow(anomaly);
      if (result.success) return result;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

## Best Practices

### 1. Payload Preparation
- Always include required fields
- Validate data before triggering
- Use appropriate data types
- Include relevant metadata

### 2. Error Handling
- Implement retry logic
- Log all trigger attempts
- Handle timeout scenarios
- Provide fallback mechanisms

### 3. Monitoring
- Store job IDs in database
- Poll for status updates
- Set up alerts for failures
- Track workflow performance

### 4. Security
- Never expose service keys
- Use environment variables
- Implement rate limiting
- Validate all inputs

## Example Workflow

### Complete Integration Example

```javascript
// 1. Detect anomaly
const anomaly = await detectAnomaly(data);

// 2. Trigger Opus workflow
const workflow = await triggerOpusWorkflow({
  id: anomaly.id,
  title: anomaly.title,
  description: anomaly.description,
  severity: anomaly.severity,
  confidence: anomaly.confidence,
  location: anomaly.location,
  timestamp: new Date().toISOString(),
  modalities: ['sensor', 'ai'],
  aiAnalysis: anomaly.analysis
});

// 3. Store job ID
await saveJobId(anomaly.id, workflow.jobId);

// 4. Monitor progress
const result = await monitorOpusJob(workflow.jobId, (status) => {
  console.log(`Progress: ${status.progress}%`);
});

// 5. Process results
if (result.status === 'completed') {
  await processWorkflowResults(anomaly.id, result.result);
}
```

## Testing

### Test Workflow Trigger

```bash
curl -X POST http://localhost:3001/api/opus/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-001",
    "title": "Test Anomaly",
    "description": "Testing Opus integration",
    "severity": "Medium",
    "confidence": 0.75,
    "location": "Test Location",
    "timestamp": "2024-11-18T10:00:00Z",
    "modalities": ["test"]
  }'
```

### Test Job Status

```bash
curl http://localhost:3001/api/opus/job/job_abc123
```

## Performance

- **Trigger Time**: < 1 second
- **Job Execution**: Varies by workflow (typically 10-60 seconds)
- **Monitoring Interval**: 5 seconds
- **Timeout**: 5 minutes max monitoring

## Troubleshooting

### Workflow Not Triggering
1. Check Opus credentials in .env
2. Verify workflow ID is correct
3. Check network connectivity
4. Review backend logs

### Job Status Not Updating
1. Verify job ID is correct
2. Check Opus platform status
3. Review monitoring logs
4. Ensure proper permissions

### Schema Errors
1. Fetch current schema: `/api/opus/schema`
2. Compare with your payload
3. Update payload structure
4. Test with minimal payload

---

**Status**: ✅ Opus integration complete and functional
**API**: Fully integrated
**Auto-trigger**: Active
**Monitoring**: Real-time
**Error Handling**: Comprehensive
