# Opus API Quick Reference

## Configuration
```bash
OPUS_SERVICE_KEY=_9a2aca85e0ca0fffca8a6490c197f3950a9da6cb6442e7add53b13ac625dac8c0a6ba43fce81e4686d6934666e6e3774
OPUS_WORKFLOW_ID=mscAs7ikJERHpxqC
```

## Quick Start

### 1. Simple Trigger
```javascript
const { triggerOpusWorkflow } = require('./services/opusIntegration');

await triggerOpusWorkflow({
  id: 1,
  title: "Anomaly Title",
  description: "Description",
  severity: "high",
  confidence: 0.95
});
```

### 2. With Files
```javascript
const files = [{ name: "data.pdf", buffer: fileBuffer }];
await triggerOpusWorkflow(anomalyData, files);
```

### 3. Monitor Job
```javascript
const result = await monitorOpusJob(jobExecutionId, (status) => {
  console.log(status.status); // IN PROGRESS, COMPLETED, FAILED
});
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/opus/workflow/:id` | Get workflow schema |
| POST | `/api/opus/job/initiate` | Create new job |
| POST | `/api/opus/job/file/upload` | Get file upload URL |
| POST | `/api/opus/job/execute` | Execute job |
| GET | `/api/opus/job/:id/status` | Check status |
| GET | `/api/opus/job/:id/results` | Get results |
| GET | `/api/opus/job/:id/audit` | Get audit log |
| GET | `/api/opus/job/:id/monitor` | SSE monitoring |

## Core Functions

```javascript
// Get workflow details
const workflow = await getWorkflowDetails(workflowId);

// Initiate job
const job = await initiateJob(workflowId, title, description);

// Upload file
const url = await generateFileUploadUrl('.pdf');
await uploadFile(url.presignedUrl, fileBuffer);

// Execute job
await executeJob(jobExecutionId, payload);

// Check status
const status = await getJobStatus(jobExecutionId);

// Get results
const results = await getJobResults(jobExecutionId);

// Get audit
const audit = await getJobAudit(jobExecutionId);
```

## Job Status Values

- `IN PROGRESS` - Job is running
- `COMPLETED` - Job finished successfully
- `FAILED` - Job failed

## Supported File Types

`.jpeg`, `.jpg`, `.png`, `.pdf`, `.docx`, `.csv`, `.xls`, `.xlsx`, `.txt`, `.json`, `.html`, `.xml`

## Testing

```bash
cd backend
node test-opus-integration.js
```

## Error Handling

```javascript
const result = await triggerOpusWorkflow(data);

if (result.success) {
  console.log('Job ID:', result.jobExecutionId);
} else {
  console.error('Error:', result.error);
}
```

## Batch Processing

```javascript
const results = await batchTriggerOpusWorkflows([
  anomaly1, anomaly2, anomaly3
]);

console.log(`${results.successful} successful, ${results.failed} failed`);
```

## Complete Workflow

```javascript
// 1. Get schema
const workflow = await getWorkflowDetails();

// 2. Initiate
const job = await initiateJob(workflowId, title, desc);

// 3. Upload files (optional)
const url = await generateFileUploadUrl('.pdf');
await uploadFile(url.presignedUrl, buffer);

// 4. Execute
await executeJob(job.jobExecutionId, payload);

// 5. Monitor
const result = await monitorOpusJob(job.jobExecutionId);

// 6. Get results
if (result.status === 'COMPLETED') {
  const final = await getJobResults(job.jobExecutionId);
}
```

## Documentation

- Full API: `OPUS_REMOTE_WORKFLOW_GUIDE.md`
- Integration: `OPUS_INTEGRATION_GUIDE.md`
- Status: `OPUS_REMOTE_INTEGRATION_COMPLETE.md`
