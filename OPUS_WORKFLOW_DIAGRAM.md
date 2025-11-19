# Opus Remote Workflow - Visual Flow Diagram

## Complete Workflow Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GAIA Anomaly Detection System                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Anomaly Detected       │
                    │  (Upload/Real-time/API) │
                    └─────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 1: Get Workflow Schema                       │
│  GET https://operator.opus.com/workflow/{workflowId}                │
│  Response: jobPayloadSchema with input field definitions            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 2: Initiate Job                              │
│  POST https://operator.opus.com/job/initiate                        │
│  Body: { workflowId, title, description }                           │
│  Response: { jobExecutionId }                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │   Files to Upload?      │
                    └─────────────────────────┘
                         │              │
                        Yes             No
                         │              │
                         ▼              │
┌────────────────────────────────────┐  │
│  STEP 3: Generate Upload URL       │  │
│  POST /job/file/upload             │  │
│  Body: { fileExtension }           │  │
│  Response: { presignedUrl }        │  │
└────────────────────────────────────┘  │
                         │              │
                         ▼              │
┌────────────────────────────────────┐  │
│  STEP 4: Upload File               │  │
│  PUT {presignedUrl}                │  │
│  Body: file binary data            │  │
│  (No auth headers needed)          │  │
└────────────────────────────────────┘  │
                         │              │
                         └──────┬───────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 5: Build Payload                             │
│  Map anomaly data to jobPayloadSchema:                              │
│  - str fields → title, description                                  │
│  - float fields → confidence, severity                              │
│  - file fields → uploaded file URLs                                 │
│  - bool fields → verified flag                                      │
│  - date fields → timestamp                                          │
│  - object fields → full metadata                                    │
│  - array fields → modalities, tags                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 6: Execute Job                               │
│  POST https://operator.opus.com/job/execute                         │
│  Body: { jobExecutionId, jobPayloadSchemaInstance }                 │
│  Response: { success, message }                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 7: Monitor Status                            │
│  GET https://operator.opus.com/job/{jobExecutionId}/status          │
│  Poll every 5 seconds (max 5 minutes)                               │
│  Status: IN PROGRESS → COMPLETED / FAILED                           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
        ┌───────────────────┐       ┌───────────────────┐
        │   COMPLETED       │       │     FAILED        │
        └───────────────────┘       └───────────────────┘
                    │                           │
                    ▼                           ▼
┌────────────────────────────────┐  ┌────────────────────────────────┐
│  STEP 8: Get Results           │  │  Log Error                     │
│  GET /job/{id}/results         │  │  Return failure response       │
│  Response: { results, data }   │  └────────────────────────────────┘
└────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────┐
│  STEP 9: Get Audit Log         │
│  GET /job/{id}/audit           │
│  Response: { auditTrail }      │
└────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Process Results in GAIA                           │
│  - Update anomaly status                                            │
│  - Store workflow results                                           │
│  - Trigger notifications                                            │
│  - Update dashboard                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Simplified High-Level Flow

```
┌──────────────┐
│   Anomaly    │
│   Detected   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│  triggerOpusWorkflow()           │
│  ┌────────────────────────────┐  │
│  │ 1. Get Schema              │  │
│  │ 2. Initiate Job            │  │
│  │ 3. Upload Files (optional) │  │
│  │ 4. Build Payload           │  │
│  │ 5. Execute Job             │  │
│  └────────────────────────────┘  │
└──────────────┬───────────────────┘
               │
               ▼
       ┌──────────────┐
       │ Job Executed │
       │ Return ID    │
       └──────┬───────┘
              │
              ▼
┌─────────────────────────────┐
│  monitorOpusJob()           │
│  ┌───────────────────────┐  │
│  │ Poll Status           │  │
│  │ Wait for Completion   │  │
│  │ Get Results           │  │
│  └───────────────────────┘  │
└─────────────┬───────────────┘
              │
              ▼
      ┌───────────────┐
      │    Results    │
      │   Returned    │
      └───────────────┘
```

## API Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│  All API Requests (except file upload)                      │
│                                                              │
│  Headers:                                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ x-service-key: _9a2aca85e0ca0fffca8a6490c197f...   │    │
│  │ Content-Type: application/json                     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  File Upload to Presigned URL                               │
│                                                              │
│  Headers:                                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Content-Type: application/octet-stream             │    │
│  │ (NO x-service-key needed)                          │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Data Mapping Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Anomaly Data                              │
│  {                                                           │
│    id: 123,                                                  │
│    title: "Seismic Activity",                               │
│    description: "Unusual patterns",                         │
│    severity: "high",                                        │
│    confidence: 0.95,                                        │
│    location: { lat, lng },                                  │
│    timestamp: "2025-11-19T10:00:00Z",                       │
│    modalities: ["seismic", "environmental"],                │
│    files: [buffer1, buffer2]                                │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Workflow Schema (from Opus)                     │
│  {                                                           │
│    workflow_input_we4tej0ly: { type: "str" },              │
│    workflow_input_a0hk6ujuo: { type: "float" },            │
│    workflow_input_h69vx5i4a: { type: "file" },             │
│    workflow_input_m2z6rkzgj: { type: "bool" },             │
│    workflow_input_2kbsjrx1y: { type: "array" },            │
│    workflow_input_bzti690ga: { type: "object" },           │
│    workflow_input_k3ayfjyh7: { type: "date" },             │
│    workflow_input_auqgnzk8d: { type: "array_files" }       │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           Mapped Payload (jobPayloadSchemaInstance)         │
│  {                                                           │
│    workflow_input_we4tej0ly: {                              │
│      value: "Seismic Activity",                             │
│      type: "str"                                            │
│    },                                                        │
│    workflow_input_a0hk6ujuo: {                              │
│      value: 0.95,                                           │
│      type: "float"                                          │
│    },                                                        │
│    workflow_input_auqgnzk8d: {                              │
│      value: ["https://files.opus.com/file1.pdf", ...],     │
│      type: "array_files"                                    │
│    }                                                         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌──────────────┐
│  API Call    │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Try Request     │
└──────┬───────────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────┐      ┌──────────────┐
│ Success  │      │    Error     │
└──────┬───┘      └──────┬───────┘
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────────┐
│ Return:      │  │ Return:          │
│ {            │  │ {                │
│   success:   │  │   success: false,│
│     true,    │  │   error: "msg"   │
│   data: ...  │  │ }                │
│ }            │  │                  │
└──────────────┘  └──────┬───────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Log Error    │
                  │ Return to    │
                  │ Caller       │
                  └──────────────┘
```

## Batch Processing Flow

```
┌────────────────────────────────────────┐
│  Multiple Anomalies                    │
│  [anomaly1, anomaly2, anomaly3, ...]   │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│  batchTriggerOpusWorkflows()           │
│  Promise.allSettled([                  │
│    triggerOpusWorkflow(anomaly1),      │
│    triggerOpusWorkflow(anomaly2),      │
│    triggerOpusWorkflow(anomaly3)       │
│  ])                                    │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│  Results Collection                    │
│  {                                     │
│    total: 3,                           │
│    successful: 2,                      │
│    failed: 1,                          │
│    results: [                          │
│      { success: true, jobId: "..." }, │
│      { success: true, jobId: "..." }, │
│      { success: false, error: "..." } │
│    ]                                   │
│  }                                     │
└────────────────────────────────────────┘
```

## Real-time Monitoring Flow (SSE)

```
┌──────────────────────────────────────────────┐
│  Client: EventSource                         │
│  GET /api/opus/job/{id}/monitor              │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  Server: Set SSE Headers                     │
│  Content-Type: text/event-stream             │
│  Cache-Control: no-cache                     │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  Poll Status Every 5 Seconds                 │
│  ┌────────────────────────────────────────┐  │
│  │ data: {"status":"IN PROGRESS"}        │  │
│  │                                        │  │
│  │ data: {"status":"IN PROGRESS"}        │  │
│  │                                        │  │
│  │ data: {"status":"COMPLETED",          │  │
│  │        "results": {...}}              │  │
│  └────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  Client: Process Updates                     │
│  eventSource.onmessage = (event) => {        │
│    const status = JSON.parse(event.data);    │
│    updateUI(status);                         │
│  }                                           │
└──────────────────────────────────────────────┘
```

---

**Legend:**
- `┌─┐` = Process/Step
- `│ │` = Data/Container
- `▼ ▲` = Flow Direction
- `├─┤` = Decision Point
