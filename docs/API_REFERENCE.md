# GAIA API Reference

## Base URL
```
http://localhost:3001/api
```

## Authentication
Currently, no authentication is required for the demo. In production, JWT tokens would be used.

## Response Format
All responses follow this structure:
```json
{
  "data": { ... },
  "message": "Optional message",
  "error": null
}
```

## Error Responses
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

---

## Anomalies API

### Get Anomalies
Retrieve a paginated list of anomalies with optional filtering.

```http
GET /api/anomalies
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `status` (string): Filter by status (detected, processing, reviewed, approved, rejected)
- `severity` (string): Filter by severity (low, medium, high, critical)
- `confidence_min` (number): Minimum confidence score (0-1)
- `confidence_max` (number): Maximum confidence score (0-1)
- `start_date` (string): Start date (ISO format)
- `end_date` (string): End date (ISO format)
- `tags` (string): Comma-separated tags

**Response:**
```json
{
  "anomalies": [
    {
      "id": "uuid",
      "title": "Anomaly Title",
      "description": "Description",
      "severity": "high",
      "confidence": 0.87,
      "status": "detected",
      "location": { "lat": 40.7128, "lng": -74.0060 },
      "timestamp": "2025-11-18T07:00:00Z",
      "tags": ["weather", "critical"]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

### Get Anomaly by ID
```http
GET /api/anomalies/:id
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Anomaly Title",
  "description": "Description",
  "severity": "high",
  "confidence": 0.87,
  "status": "approved",
  "location": { "lat": 40.7128, "lng": -74.0060 },
  "modalities": {
    "text": "Text content...",
    "images": [{ "url": "...", "description": "..." }],
    "videos": [],
    "audio": []
  },
  "aiAnalysis": {
    "isAnomaly": true,
    "severity": "high",
    "confidence": 0.87,
    "description": "AI analysis result...",
    "recommendedActions": ["Investigate", "Alert authorities"]
  },
  "auditLogs": [
    {
      "action": "created",
      "actor": "system",
      "timestamp": "2025-11-18T07:00:00Z",
      "reasoning": "Autonomous detection"
    }
  ]
}
```

### Create Anomaly
```http
POST /api/anomalies
```

**Request Body:**
```json
{
  "title": "New Anomaly",
  "description": "Description of the anomaly",
  "severity": "medium",
  "location": { "lat": 40.7128, "lng": -74.0060 },
  "modalities": {
    "text": "Text content...",
    "images": [],
    "videos": [],
    "audio": []
  },
  "tags": ["manual", "reported"]
}
```

### Update Anomaly
```http
PUT /api/anomalies/:id
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "severity": "high"
}
```

### Approve Anomaly
```http
POST /api/anomalies/:id/approve
```

**Request Body:**
```json
{
  "reasoning": "Manual review confirms threat level"
}
```

### Reject Anomaly
```http
POST /api/anomalies/:id/reject
```

**Request Body:**
```json
{
  "reasoning": "False positive after investigation"
}
```

### Escalate Anomaly
```http
POST /api/anomalies/:id/escalate
```

**Request Body:**
```json
{
  "reasoning": "Requires immediate attention",
  "priority": "critical"
}
```

### Generate Anomaly Report
```http
GET /api/anomalies/:id/report/:format
```

**Parameters:**
- `format`: `json` or `pdf`

**Response:** JSON object or PDF file download

### Get Anomaly Statistics
```http
GET /api/anomalies/stats/overview
```

**Response:**
```json
{
  "total": 150,
  "recent": 12,
  "byStatus": [
    { "status": "approved", "count": 89 },
    { "status": "detected", "count": 45 }
  ],
  "bySeverity": [
    { "severity": "critical", "count": 15 },
    { "severity": "high", "count": 32 }
  ],
  "timestamp": "2025-11-18T07:30:00Z"
}
```

---

## Workflows API

### Get Workflows
```http
GET /api/workflows
```

**Query Parameters:**
- `status` (string): active, inactive, draft
- `isTemplate` (boolean): Filter templates

### Get Workflow by ID
```http
GET /api/workflows/:id
```

### Create Workflow
```http
POST /api/workflows
```

**Request Body:**
```json
{
  "name": "Custom Workflow",
  "description": "Description",
  "template": { "version": "1.0" },
  "nodes": [...],
  "edges": [...],
  "variables": {},
  "tags": ["custom"]
}
```

### Update Workflow
```http
PUT /api/workflows/:id
```

### Execute Workflow
```http
POST /api/workflows/:id/execute
```

**Request Body:**
```json
{
  "anomalyId": "uuid",
  "parameters": { "custom": "values" }
}
```

### Get Workflow Templates
```http
GET /api/workflows/templates/list
```

### Create Default Templates
```http
POST /api/workflows/templates/create-defaults
```

---

## APIs Management

### Manual Data Collection
```http
POST /api/apis/collect
```

**Request Body:**
```json
{
  "location": { "lat": 40.7128, "lng": -74.0060 },
  "dataTypes": ["weather", "news"]
}
```

### Get API Configuration
```http
GET /api/apis/config
```

**Response:**
```json
{
  "configurations": {
    "weather": ["OpenWeatherMap", "Weatherbit"],
    "satellite": ["NASA EarthData"]
  },
  "status": {
    "lastCollectionTime": "2025-11-18T07:00:00Z",
    "activeApis": 8,
    "totalApis": 8
  }
}
```

### Test API Connection
```http
GET /api/apis/test/:apiName
```

### Update API Key
```http
PUT /api/apis/keys/:apiName
```

**Request Body:**
```json
{
  "apiKey": "new-api-key"
}
```

---

## System API

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-18T07:30:00Z",
  "services": {
    "database": "connected",
    "gemini": "initialized"
  }
}
```

---

## WebSocket API

### Connection
```
ws://localhost:3001
```

### Messages

#### Subscribe to Channels
```json
{
  "type": "subscribe",
  "channels": ["anomalies", "alerts"]
}
```

#### New Anomaly Notification
```json
{
  "type": "new_anomaly",
  "data": {
    "id": "uuid",
    "title": "Anomaly Title",
    "severity": "critical",
    "confidence": 0.95
  },
  "channel": "anomalies",
  "timestamp": "2025-11-18T07:30:00Z"
}
```

#### Anomaly Update
```json
{
  "type": "anomaly_update",
  "data": {
    "anomalyId": "uuid",
    "updates": { "status": "approved" }
  },
  "channel": "anomalies"
}
```

#### High Severity Alert
```json
{
  "type": "high_severity_alert",
  "data": {
    "id": "uuid",
    "title": "Critical Anomaly",
    "severity": "critical",
    "recommendedActions": ["immediate_response"]
  },
  "channel": "alerts"
}
```

---

## Rate Limits

- **General API**: 1000 requests per hour per IP
- **Data Collection**: 100 requests per hour
- **Report Generation**: 50 requests per hour

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Invalid request data |
| `NOT_FOUND` | Resource not found |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `RATE_LIMITED` | Too many requests |
| `EXTERNAL_API_ERROR` | External API failure |
| `INTERNAL_ERROR` | Server error |

## SDK Examples

### JavaScript (Fetch API)
```javascript
// Get anomalies
const response = await fetch('/api/anomalies?page=1&limit=10');
const data = await response.json();

// Create anomaly
const newAnomaly = await fetch('/api/anomalies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'New Anomaly',
    description: 'Description',
    severity: 'medium',
    location: { lat: 40.7128, lng: -74.0060 }
  })
});
```

### WebSocket Client
```javascript
const ws = new WebSocket('ws://localhost:3001');

// Subscribe to updates
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['anomalies', 'alerts']
  }));
};

// Handle messages
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};