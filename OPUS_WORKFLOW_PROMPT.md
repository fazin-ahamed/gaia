# Opus Workflow Creation Prompt for GAIA 3.1

## System Overview
You are creating an AI-powered workflow for **GAIA (Global Autonomous Intelligence for Anomaly Detection)**, a sophisticated multi-modal anomaly detection and verification system that processes real-time data from 11+ global APIs, analyzes uploaded evidence (images, PDFs, text), and coordinates autonomous agent swarms for cross-verification.

---

## Workflow Purpose
Create an intelligent workflow that:
1. **Receives anomaly data** from GAIA's detection system
2. **Processes multi-modal evidence** (text, images, sensor data, geospatial info)
3. **Performs deep analysis** using AI agents
4. **Cross-verifies** information across multiple sources
5. **Generates actionable intelligence** and recommendations
6. **Triggers alerts** and mitigation actions when necessary

---

## Input Schema

### Required Fields
```json
{
  "input_data": {
    "anomaly_id": "string (unique identifier, e.g., 'anom-001')",
    "title": "string (brief anomaly description)",
    "description": "string (detailed description of the anomaly)",
    "severity": "enum: Low | Medium | High | Critical",
    "confidence": "number (0.0 to 1.0, AI confidence score)",
    "location": "string (geographic location or 'Unknown')",
    "timestamp": "string (ISO 8601 format, e.g., '2024-11-18T10:00:00Z')",
    "modalities": "array of strings (e.g., ['image', 'text', 'sensor', 'seismic'])",
    "source_data": {
      "apis": "array of strings (data sources: reddit, gdelt, usgs, eonet, etc.)",
      "raw_data": "object (original data from sources)",
      "metadata": "object (additional context)"
    },
    "ai_analysis": {
      "gemini_analysis": "string (Gemini AI's analysis)",
      "anomaly_score": "object (detailed scoring)",
      "cross_verification": "string (verification results)",
      "recommended_actions": "array of strings"
    },
    "metadata": {
      "description": "string (user-provided context)",
      "uploaded_at": "string (ISO 8601)",
      "file_count": "number (if multiple files)",
      "upload_type": "string (manual | automatic | real-time)"
    }
  }
}
```

### Optional File Fields
```json
{
  "input_data": {
    "files": [
      {
        "type": "file",
        "name": "string (filename)",
        "mimeType": "string (image/jpeg, application/pdf, text/plain)",
        "value": "string (base64 encoded data or URL)"
      }
    ]
  }
}
```

---

## Workflow Steps

### Step 1: Initial Validation & Triage
**Purpose**: Validate input data and determine processing priority

**Actions**:
- Verify all required fields are present
- Check data integrity and format
- Assess severity and confidence levels
- Determine if immediate escalation is needed
- Flag fake/fabricated content (if `ai_analysis.anomaly_score.isFake === true`)

**Decision Points**:
- If `severity === 'Critical'` AND `confidence > 0.8`: Fast-track to immediate response
- If `isFake === true`: Route to fake content verification workflow
- If `confidence < 0.5`: Route to manual review queue
- Otherwise: Continue to deep analysis

### Step 2: Multi-Modal Evidence Processing
**Purpose**: Extract and analyze all available evidence

**Actions**:
- **Image Analysis**: 
  - Extract visual features
  - Detect objects, scenes, anomalies
  - Check for manipulation/editing
  - Perform reverse image search
  - Analyze metadata (EXIF, location, timestamp)

- **Text Analysis**:
  - Sentiment analysis
  - Entity extraction (locations, organizations, people)
  - Keyword and pattern detection
  - Language and tone analysis
  - Fact-checking against known databases

- **Sensor/Geospatial Data**:
  - Parse coordinates and location data
  - Cross-reference with geographic databases
  - Analyze temporal patterns
  - Check for data anomalies

- **Document Analysis** (PDFs):
  - Extract text content
  - Analyze document structure
  - Verify authenticity
  - Extract metadata

### Step 3: Cross-Source Verification
**Purpose**: Verify anomaly across multiple independent sources

**Actions**:
- Query external databases and APIs:
  - News APIs (verify if event is reported)
  - Social media (check for corroborating posts)
  - Government databases (USGS for earthquakes, NOAA for weather)
  - Satellite imagery (if location-based)
  - Historical data (check for similar past events)

- Compare findings:
  - Calculate consensus score
  - Identify conflicting information
  - Assess source reliability
  - Generate verification report

**Output**:
- `verification_score`: 0.0 to 1.0
- `corroborating_sources`: array of sources that confirm
- `conflicting_sources`: array of sources that contradict
- `confidence_adjustment`: updated confidence based on verification

### Step 4: Risk Assessment & Impact Analysis
**Purpose**: Evaluate potential impact and risk level

**Actions**:
- **Geographic Impact**:
  - Identify affected areas
  - Estimate population at risk
  - Assess infrastructure vulnerability
  - Calculate potential damage radius

- **Temporal Analysis**:
  - Predict event progression
  - Estimate time to impact
  - Identify critical time windows

- **Cascading Effects**:
  - Identify secondary risks
  - Assess domino effects
  - Evaluate systemic vulnerabilities

- **Historical Context**:
  - Compare to similar past events
  - Learn from historical responses
  - Apply lessons learned

**Output**:
- `risk_level`: Low | Medium | High | Critical
- `impact_assessment`: detailed impact analysis
- `affected_population`: estimated number
- `time_to_impact`: estimated time window
- `cascading_risks`: array of secondary risks

### Step 5: AI Agent Swarm Analysis
**Purpose**: Deploy specialized AI agents for deep analysis

**Agent Types**:
1. **Verification Agent**: Fact-checks and validates information
2. **Pattern Recognition Agent**: Identifies patterns and anomalies
3. **Geospatial Agent**: Analyzes location-based data
4. **Temporal Agent**: Analyzes time-series patterns
5. **Social Media Agent**: Monitors social media for corroboration
6. **Expert System Agent**: Applies domain-specific knowledge

**Process**:
- Deploy agents in parallel
- Each agent provides independent analysis
- Aggregate results using consensus mechanism
- Resolve conflicts through weighted voting
- Generate unified assessment

**Output**:
- `agent_consensus`: 0.0 to 1.0
- `agent_reports`: array of individual agent analyses
- `unified_assessment`: combined analysis
- `confidence_level`: final confidence score

### Step 6: Recommendation Generation
**Purpose**: Generate actionable recommendations

**Actions**:
- **Immediate Actions**:
  - Alert relevant authorities
  - Notify emergency services
  - Activate response protocols
  - Issue public warnings (if necessary)

- **Short-term Actions** (0-24 hours):
  - Deploy monitoring resources
  - Prepare response teams
  - Secure critical infrastructure
  - Establish communication channels

- **Medium-term Actions** (1-7 days):
  - Conduct detailed investigation
  - Implement mitigation measures
  - Monitor situation evolution
  - Coordinate with stakeholders

- **Long-term Actions** (7+ days):
  - Post-event analysis
  - Update detection algorithms
  - Improve response protocols
  - Document lessons learned

**Output**:
- `immediate_actions`: array of urgent actions
- `short_term_actions`: array of near-term actions
- `medium_term_actions`: array of medium-term actions
- `long_term_actions`: array of long-term actions
- `priority_ranking`: ordered list by priority

### Step 7: Alert & Notification Dispatch
**Purpose**: Notify relevant stakeholders

**Actions**:
- **Determine Recipients**:
  - Based on severity level
  - Based on geographic location
  - Based on domain expertise
  - Based on organizational role

- **Select Channels**:
  - Email (for detailed reports)
  - SMS (for urgent alerts)
  - Push notifications (for mobile apps)
  - API webhooks (for system integration)
  - Dashboard updates (for monitoring)

- **Customize Messages**:
  - Executive summary for leadership
  - Technical details for analysts
  - Action items for responders
  - Public information (if applicable)

**Output**:
- `notifications_sent`: array of sent notifications
- `recipients`: array of recipient details
- `delivery_status`: success/failure for each channel

### Step 8: Report Generation
**Purpose**: Create comprehensive anomaly report

**Report Sections**:
1. **Executive Summary**
   - Anomaly overview
   - Key findings
   - Risk assessment
   - Recommended actions

2. **Detailed Analysis**
   - Multi-modal evidence review
   - Cross-verification results
   - AI agent assessments
   - Risk and impact analysis

3. **Evidence Documentation**
   - All source data
   - Analysis artifacts
   - Verification records
   - Agent reports

4. **Recommendations**
   - Prioritized action items
   - Resource requirements
   - Timeline and milestones
   - Success metrics

5. **Appendices**
   - Raw data
   - Technical details
   - Methodology
   - References

**Output Formats**:
- JSON (for API consumption)
- PDF (for human review)
- HTML (for web display)
- Markdown (for documentation)

### Step 9: Continuous Monitoring Setup
**Purpose**: Establish ongoing monitoring for the anomaly

**Actions**:
- Create monitoring dashboard
- Set up automated data collection
- Configure alert thresholds
- Schedule periodic reassessments
- Enable real-time updates

**Output**:
- `monitoring_id`: unique monitoring session ID
- `update_frequency`: how often to check
- `alert_thresholds`: when to trigger new alerts
- `dashboard_url`: link to monitoring dashboard

### Step 10: Feedback Loop & Learning
**Purpose**: Improve system through continuous learning

**Actions**:
- Record workflow execution metrics
- Capture decision points and outcomes
- Identify areas for improvement
- Update detection algorithms
- Refine verification processes
- Enhance agent capabilities

**Output**:
- `execution_metrics`: performance data
- `improvement_suggestions`: array of suggestions
- `model_updates`: recommended model updates
- `process_refinements`: workflow improvements

---

## Output Schema

### Success Response
```json
{
  "success": true,
  "workflow_id": "string",
  "job_id": "string",
  "anomaly_id": "string",
  "status": "completed",
  "execution_time": "number (seconds)",
  "results": {
    "validation": {
      "is_valid": "boolean",
      "priority": "string",
      "triage_decision": "string"
    },
    "evidence_analysis": {
      "image_analysis": "object",
      "text_analysis": "object",
      "sensor_analysis": "object",
      "document_analysis": "object"
    },
    "verification": {
      "verification_score": "number (0-1)",
      "corroborating_sources": "array",
      "conflicting_sources": "array",
      "confidence_adjustment": "number"
    },
    "risk_assessment": {
      "risk_level": "string",
      "impact_assessment": "object",
      "affected_population": "number",
      "time_to_impact": "string",
      "cascading_risks": "array"
    },
    "agent_swarm": {
      "agent_consensus": "number (0-1)",
      "agent_reports": "array",
      "unified_assessment": "object",
      "confidence_level": "number"
    },
    "recommendations": {
      "immediate_actions": "array",
      "short_term_actions": "array",
      "medium_term_actions": "array",
      "long_term_actions": "array",
      "priority_ranking": "array"
    },
    "notifications": {
      "notifications_sent": "array",
      "recipients": "array",
      "delivery_status": "object"
    },
    "report": {
      "report_id": "string",
      "formats": "object (json, pdf, html, markdown)",
      "download_urls": "object"
    },
    "monitoring": {
      "monitoring_id": "string",
      "update_frequency": "string",
      "alert_thresholds": "object",
      "dashboard_url": "string"
    },
    "learning": {
      "execution_metrics": "object",
      "improvement_suggestions": "array",
      "model_updates": "array"
    }
  },
  "metadata": {
    "processed_at": "string (ISO 8601)",
    "processing_duration": "number (seconds)",
    "workflow_version": "string",
    "agent_versions": "object"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object",
    "step_failed": "string",
    "retry_possible": "boolean"
  },
  "partial_results": "object (if any steps completed)"
}
```

---

## Special Handling Cases

### Case 1: Critical Emergency (severity === 'Critical' && confidence > 0.8)
- **Fast-track processing**: Skip non-essential steps
- **Immediate alerts**: Notify all critical stakeholders
- **Auto-escalation**: Trigger emergency response protocols
- **Real-time monitoring**: Continuous updates every 30 seconds
- **Resource mobilization**: Activate response teams

### Case 2: Fake/Fabricated Content (isFake === true)
- **Flag as fake**: Mark in all reports
- **Reduced priority**: Lower processing priority
- **Verification focus**: Deep dive into authenticity
- **Source tracking**: Identify origin of fake content
- **Counter-measures**: Prepare debunking information

### Case 3: Low Confidence (confidence < 0.5)
- **Manual review**: Route to human analysts
- **Extended verification**: More thorough cross-checking
- **Additional evidence**: Request more data if possible
- **Conservative recommendations**: Err on side of caution
- **Monitoring**: Set up passive monitoring

### Case 4: Multi-File Upload (files.length > 1)
- **Parallel processing**: Analyze all files simultaneously
- **Cross-file correlation**: Look for connections between files
- **Consensus building**: Aggregate findings across files
- **Comprehensive report**: Include all file analyses

### Case 5: Real-Time Hotspot (source === 'real-time')
- **Rapid processing**: Optimize for speed
- **Geographic focus**: Emphasize location-based analysis
- **Trend analysis**: Compare to historical patterns
- **Predictive modeling**: Forecast event progression

---

## Integration Points

### GAIA Backend APIs
- **Anomaly Creation**: POST `/api/anomalies` - Create anomaly record
- **Status Updates**: PUT `/api/anomalies/:id` - Update anomaly status
- **Audit Logging**: POST `/api/anomalies/:id/audit` - Log workflow actions
- **Notifications**: POST `/api/alerts/send` - Send alerts to users

### External Services
- **Gemini AI**: For additional AI analysis
- **News APIs**: For verification (NewsAPI, GDELT)
- **Social Media**: For corroboration (Reddit, Twitter)
- **Government APIs**: For official data (USGS, NOAA, NASA EONET)
- **Geospatial Services**: For location analysis

### Monitoring & Logging
- **Workflow Metrics**: Track execution time, success rate
- **Agent Performance**: Monitor individual agent accuracy
- **Error Tracking**: Log all errors and failures
- **Audit Trail**: Complete record of all decisions

---

## Performance Requirements

- **Execution Time**: 
  - Critical: < 30 seconds
  - High: < 60 seconds
  - Medium: < 120 seconds
  - Low: < 300 seconds

- **Accuracy**: 
  - Verification accuracy: > 90%
  - False positive rate: < 5%
  - False negative rate: < 2%

- **Reliability**:
  - Uptime: 99.9%
  - Error recovery: Automatic retry with exponential backoff
  - Fallback mechanisms: Graceful degradation

---

## Security & Privacy

- **Data Encryption**: All data encrypted in transit and at rest
- **Access Control**: Role-based access to workflow results
- **PII Protection**: Anonymize personal information
- **Audit Logging**: Complete audit trail of all actions
- **Compliance**: GDPR, CCPA, SOC 2 compliant

---

## Testing Scenarios

### Test Case 1: Natural Disaster
```json
{
  "title": "Major Earthquake Detected",
  "severity": "Critical",
  "confidence": 0.92,
  "location": "San Francisco Bay Area",
  "modalities": ["seismic", "sensor", "social_media"]
}
```

### Test Case 2: Fake News
```json
{
  "title": "Fabricated Event Report",
  "severity": "Medium",
  "confidence": 0.65,
  "ai_analysis": {
    "anomaly_score": {
      "isFake": true
    }
  }
}
```

### Test Case 3: Image Upload
```json
{
  "title": "Suspicious Activity Photo",
  "severity": "High",
  "confidence": 0.78,
  "modalities": ["image"],
  "files": [
    {
      "type": "file",
      "name": "evidence.jpg",
      "mimeType": "image/jpeg"
    }
  ]
}
```

---

## Success Metrics

- **Detection Accuracy**: % of true anomalies correctly identified
- **Response Time**: Average time from detection to action
- **False Positive Rate**: % of false alarms
- **User Satisfaction**: Feedback from analysts and responders
- **System Uptime**: % of time system is operational
- **Cost Efficiency**: Cost per anomaly processed

---

## Workflow Metadata

- **Name**: GAIA Anomaly Processing Workflow
- **Version**: 3.1.0
- **Created**: 2024-11-18
- **Owner**: GAIA System
- **Category**: Anomaly Detection & Response
- **Tags**: AI, Multi-Modal, Real-Time, Verification, Emergency Response

---

## Additional Notes

This workflow is designed to be:
- **Autonomous**: Minimal human intervention required
- **Scalable**: Handle thousands of anomalies simultaneously
- **Adaptive**: Learn and improve over time
- **Transparent**: Full audit trail and explainability
- **Reliable**: Robust error handling and recovery
- **Fast**: Optimized for real-time processing

The workflow integrates seamlessly with GAIA's existing infrastructure and can be triggered automatically or manually through the API endpoints described in the OPUS_INTEGRATION_GUIDE.md.
