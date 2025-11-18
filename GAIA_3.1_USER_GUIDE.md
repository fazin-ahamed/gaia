# GAIA 3.1 User Guide

## Quick Start

### Starting the System

1. **Start Backend Server**
```bash
cd backend
npm install
npm run dev
```
Backend will run on `http://localhost:3001`

2. **Start Frontend Application**
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:5173`

3. **Access the Application**
Open your browser to `http://localhost:5173`

## Navigation Guide

### Main Pages

#### 1. Landing Page (`/`)
- **Purpose**: Introduction to GAIA 3.1 system
- **Features**:
  - Real-time swarm activity statistics
  - Recent anomaly feed
  - Technology overview
  - Live demo preview
- **Actions**: 
  - Click "Enter Dashboard" to access command center
  - Click "Report Anomaly" to upload evidence

#### 2. Command Dashboard (`/dashboard-enhanced`)
- **Purpose**: Central command and control interface
- **Features**:
  - Real-time anomaly feed with swarm consensus
  - Active agent visualization (156 agents)
  - Global risk scoring
  - Critical alerts section
  - Severity filtering
- **Actions**:
  - Filter anomalies by severity
  - Click anomaly to view details
  - Refresh feed
  - Export data

#### 3. Upload Evidence (`/upload`)
- **Purpose**: Submit new anomaly evidence for analysis
- **Features**:
  - Multi-format upload (PDF, images, video, audio, text)
  - Real-time swarm processing
  - Per-agent analysis results
  - Auto-filled metadata
  - Edit capabilities
- **Workflow**:
  1. Upload file(s)
  2. Wait for swarm processing (2-3 seconds)
  3. Review agent outputs
  4. Edit metadata if needed
  5. Submit for full analysis

#### 4. Operations Console (`/operations`)
- **Purpose**: Monitor and control agent swarm operations
- **Features**:
  - Swarm node status (all 156 agents)
  - Load balancing visualization
  - Active decision paths
  - Real-time job logs
  - Manual override controls
- **Actions**:
  - Monitor agent health
  - Pause/resume workflows
  - Override decisions
  - Export logs

#### 5. Alerts & Delivery (`/alerts`)
- **Purpose**: Manage real-time threat notifications
- **Features**:
  - Alert feed with swarm recommendations
  - Status tracking (new/acknowledged/resolved)
  - Recommended actions
  - Export capabilities
- **Workflow**:
  1. Review new alerts
  2. Read swarm recommendations
  3. Acknowledge or resolve
  4. Execute recommended actions
  5. Add notes if needed

#### 6. Verification Page (`/verification/:id`)
- **Purpose**: Cross-modality verification analysis
- **Features**:
  - Per-agent outputs (text, image, audio, sensor)
  - Cross-modal consensus scores
  - Credibility assessment
  - Severity classification
  - Risk factors
- **Actions**:
  - Review all agent outputs
  - Check consensus scores
  - Approve or request review
  - Export verification report

#### 7. Incident Details (`/incident-enhanced/:id`)
- **Purpose**: Comprehensive incident analysis
- **Features**:
  - Complete event timeline
  - Agent contribution breakdown
  - Swarm consensus reasoning
  - Predictive forecasting
  - Mitigation planning
- **Actions**:
  - Review timeline
  - Analyze agent contributions
  - View forecasts
  - Approve mitigation strategies
  - Export incident report
  - Share with agencies

#### 8. Global Analytics (`/analytics-enhanced`)
- **Purpose**: Planetary-scale monitoring and intelligence
- **Features**:
  - Interactive global map
  - Heatmap/cluster/forecast views
  - Regional risk breakdown
  - Top anomaly regions
  - Predictive forecasting
  - Federated intelligence sharing
- **Actions**:
  - Switch map views
  - Filter by time range
  - Review regional statistics
  - Accept/reject shared intelligence
  - Export analytics data

## Key Features Explained

### Agent Swarm System

**What it is**: 156+ specialized AI agents working in parallel to analyze anomalies

**Agent Types**:
- **Text Analysis** (47 agents): Document and communication analysis
- **Image/Video** (38 agents): Visual anomaly detection
- **Audio** (23 agents): Sound spectrum analysis
- **Sensor/IoT** (31 agents): Sensor data processing
- **Verification** (12 agents): Cross-modal validation
- **Forecasting** (5 agents): Predictive analysis

**How it works**:
1. Anomaly data is distributed to relevant agents
2. Each agent analyzes independently
3. Agents share outputs and vote
4. Consensus algorithm determines final result
5. Conflicts are automatically resolved

### Swarm Consensus

**Consensus Score**: Percentage of agents in agreement
- **90-100%**: Very high confidence, auto-approve
- **70-89%**: High confidence, may require review
- **50-69%**: Medium confidence, human review required
- **<50%**: Low confidence, escalate

### Predictive Forecasting

**Timeframes**:
- 24 hours: High accuracy (76-87%)
- 72 hours: Medium accuracy (65-82%)
- 7 days: Lower accuracy (52-68%)

**Uses**:
- Anticipate future anomalies
- Resource allocation planning
- Preventive action deployment

### Autonomous Mitigation

**Strategy Generation**:
1. AI analyzes anomaly characteristics
2. Generates 3-5 mitigation strategies
3. Simulates effectiveness (87-95%)
4. Calculates resource requirements
5. Assesses risks

**Deployment**:
1. Review strategies
2. Run simulation
3. Approve strategy
4. Deploy automatically or manually

### Global Risk Scoring

**Risk Index**: 0-100 scale
- **0-39**: Low risk (green)
- **40-59**: Medium risk (yellow)
- **60-79**: High risk (orange)
- **80-100**: Critical risk (red)

**Calculated from**:
- Active threat count
- Severity distribution
- Trend analysis
- Regional factors

### Federated Intelligence

**Purpose**: Secure knowledge sharing between agencies

**Features**:
- End-to-end encryption
- Data sovereignty maintained
- Full audit trail
- Accept/reject controls

**Workflow**:
1. Agency shares intelligence
2. Notification received
3. Review classification and content
4. Accept or reject
5. Intelligence integrated into system

## Best Practices

### For Analysts

1. **Monitor Dashboard Regularly**: Check every 15-30 minutes
2. **Review High-Confidence Alerts First**: Focus on 90%+ consensus
3. **Trust the Swarm**: 94.7% accuracy rate
4. **Document Overrides**: Always explain manual decisions
5. **Use Forecasting**: Plan ahead with predictive data

### For Operators

1. **Monitor Agent Health**: Keep all agents operational
2. **Balance Load**: Distribute work evenly
3. **Review Logs**: Check for errors regularly
4. **Test Overrides**: Ensure manual controls work
5. **Maintain Uptime**: Target 99.9%

### For Administrators

1. **Configure Thresholds**: Adjust for your needs
2. **Manage Access**: Role-based permissions
3. **Review Audits**: Regular compliance checks
4. **Update Models**: Keep AI current
5. **Backup Data**: Regular exports

## Troubleshooting

### Backend Not Starting
```bash
# Check if port 3001 is available
netstat -an | grep 3001

# Check environment variables
cat backend/.env

# Restart with logs
cd backend
npm run dev
```

### Frontend Not Loading
```bash
# Clear cache
rm -rf frontend/node_modules
npm install

# Check Vite config
cat frontend/vite.config.ts

# Restart
npm run dev
```

### Agents Not Responding
1. Check Operations Console
2. Review system logs
3. Restart affected agents
4. Check network connectivity

### Low Consensus Scores
1. Review agent outputs
2. Check data quality
3. Verify all modalities present
4. Consider human review

## Keyboard Shortcuts

- `Ctrl/Cmd + K`: Quick search
- `Ctrl/Cmd + R`: Refresh current view
- `Ctrl/Cmd + E`: Export current data
- `Ctrl/Cmd + N`: New anomaly report
- `Esc`: Close modals/dialogs

## Support

### Documentation
- Technical Docs: `/docs/ARCHITECTURE.md`
- API Reference: `/docs/API_REFERENCE.md`
- Features: `/frontend/GAIA_3.1_FEATURES.md`

### Contact
- System Status: Check dashboard footer
- Error Reports: Use built-in feedback
- Feature Requests: Submit via settings

---

**GAIA 3.1** - Autonomous Planetary Defense System
Version 3.1.0 | Last Updated: November 2024
