# GAIA - Global Anomaly Intelligence & Analysis System

## Complete Project Documentation

### What This Project Is

GAIA is a **production-ready, full-stack autonomous anomaly detection and response system** that uses AI agents, real-time environmental monitoring, and intelligent workflow orchestration to detect, analyze, and respond to global anomalies.

### Current Status: ✅ FULLY FUNCTIONAL & DEPLOYMENT READY

---

## System Architecture

### Technology Stack

**Backend**
- Node.js 18+ with Express.js
- PostgreSQL (production) / SQLite (development)
- Sequelize ORM
- Google Gemini AI (multimodal analysis)
- Claude Opus (workflow orchestration)
- WebSocket (real-time updates)
- Winston (logging)
- node-cron (autonomous scheduling)

**Frontend**
- React 18+ with TypeScript
- Vite (build tool)
- React Router v7
- Tailwind CSS
- Lucide React (icons)

**Infrastructure**
- Docker & Docker Compose
- Nginx (reverse proxy)
- GitHub Actions (CI/CD ready)

---

## Core Features

### 1. Real-Time Environmental Monitoring

**8 External API Integrations:**

1. **USGS Earthquake API** - Seismic activity monitoring
   - Custom region support (e.g., UAE/Iran: lat 22-26, lon 51-57)
   - Magnitude filtering
   - Real-time earthquake detection

2. **OpenWeatherMap One Call API 3.0** - Comprehensive weather data
   - Current, hourly, daily forecasts
   - Weather alerts
   - Extreme condition detection

3. **Open-Meteo API** - Free weather forecasting
   - No API key required
   - Backup weather source

4. **OpenAQ API v3** - Air quality monitoring
   - Global monitoring stations
   - Real-time AQI data
   - Country-specific data

5. **AQICN API** - Secondary air quality source
   - Geo-location based queries
   - AQI threshold alerts

6. **NewsAPI.org** - Real-time news articles
   - Topic-based search
   - 10,000+ sources
   - Automatic fallback to GNews

7. **GNews API** - News fallback source
   - Country-specific news
   - Multi-language support

8. **GDELT Project** - Global events monitoring
   - Real-time event tracking
   - News aggregation


### 2. AI-Powered Analysis

**Gemini AI Integration**
- Text analysis for news and reports
- Image analysis for uploaded media
- Multimodal analysis (text + images)
- Confidence scoring (0-1)
- Rate limiting with exponential backoff

**Claude Opus Integration**
- Workflow orchestration
- Complex decision making
- Mitigation plan generation
- Multi-step reasoning

**Agent Swarm System**
- Text Agent: News/report analysis
- Sensor Agent: Weather anomaly detection
- Seismic Agent: Earthquake pattern analysis
- Air Quality Agent: Pollution spike detection
- Consensus calculation across agents

### 3. Autonomous Operation

**Scheduled Data Ingestion**
- Runs every 15 minutes (configurable)
- Monitors 6+ global locations
- Automatic anomaly detection
- Threshold-based alerting (consensus > 0.75)

**Anomaly Detection Logic**
- Weather: Pressure < 980 or > 1040, wind > 20 m/s, temp extremes
- Earthquakes: Magnitude > 4.0, earthquake swarms
- Air Quality: AQI > 100 (unhealthy levels)
- Cross-verification across multiple sources

### 4. Workflow Engine

**Opus-Powered Workflows**
- Default Anomaly Workflow
- Emergency Response Workflow
- Verification Workflow
- Custom workflow support

**Workflow Steps**
- AI Analysis
- Cross-Verification
- Decision Points
- Human Review
- Approval/Rejection
- Alert Delivery

### 5. Real-Time System

**WebSocket Integration**
- Live anomaly updates
- System status broadcasts
- Alert notifications
- Auto-reconnect on disconnect

**Real-Time Features**
- Live dashboard feed
- Instant notifications
- Status indicators
- Activity timeline


---

## Frontend Application

### Pages (7 Main Views)

**1. User Dashboard** (`UserDashboardEnhanced.tsx`)
- Real-time anomaly feed
- Severity filters (critical/high/medium/low)
- Status filters (pending/verified/rejected/resolved)
- Quick stats cards
- Recent activity timeline
- Map preview

**2. Global Analytics** (`GlobalAnalyticsEnhanced.tsx`)
- Interactive world map
- Anomaly markers with clustering
- Heatmap overlay
- Severity-based color coding
- Date range filtering
- Statistics dashboard
- Trend analysis

**3. Incident Details** (`IncidentDetailsEnhanced.tsx`)
- Full anomaly information
- AI analysis results
- Agent swarm breakdown
- Environmental data display
- Related news articles
- Event timeline
- Edit/Update capabilities
- Approve/Reject actions
- Report generation (JSON/PDF)

**4. Operations Console** (`OperationsConsole.tsx`)
- System health monitoring
- Active workflows display
- AI service status
- API usage statistics
- Real-time logs viewer
- Autonomous mode toggle
- Manual ingestion trigger

**5. Verification Page** (`VerificationPage.tsx`)
- Pending anomalies queue
- Side-by-side comparison
- Quick approve/reject
- Bulk actions
- Confidence scores
- Source verification

**6. Anomaly Upload** (`AnomalyUploadEnhanced.tsx`)
- Manual anomaly creation
- File upload (images, videos, documents)
- Location picker
- Severity selection
- AI-powered suggestions
- Real-time analysis preview
- Batch upload support

**7. Alerts Delivery** (`AlertsDeliveryPage.tsx`)
- Alert configuration
- Recipient management
- Alert templates
- Delivery status tracking
- Alert history
- Test functionality


### Components (7 Reusable)

**1. InteractiveMapEnhanced**
- Leaflet/Mapbox integration
- Anomaly markers with clustering
- Heatmap layer
- Click handlers
- Filter controls
- Legend display

**2. SwarmVisualization**
- Agent swarm display
- Confidence meters
- Consensus calculation
- Visual network graph
- Agent type indicators

**3. FederatedIntelligence**
- Multi-source data aggregation
- Source reliability indicators
- Cross-verification status
- Data freshness timestamps

**4. GlobalRiskScoring**
- Risk score calculation
- Contributing factors
- Historical trends
- Predictive forecast
- Color-coded severity

**5. MitigationPlanner**
- AI-generated mitigation steps
- Resource allocation
- Timeline planning
- Stakeholder notifications
- Action tracking

**6. PredictiveForecasting**
- Trend prediction charts
- Confidence intervals
- Pattern matching
- Future likelihood
- Early warnings

**7. Sidebar**
- Navigation menu
- Active page indicator
- User profile
- System status
- Quick actions
- Notification badge

---

## Backend API

### Routes (40+ Endpoints)

**Anomalies** (`/api/anomalies`)
- GET / - List with pagination
- GET /:id - Get single
- POST / - Create
- PUT /:id - Update
- DELETE /:id - Delete
- POST /:id/approve - Approve
- POST /:id/reject - Reject
- GET /:id/report/:format - Generate report
- GET /stats/overview - Statistics

**Environmental** (`/api/environmental`)
- GET /weather - Weather by location
- GET /air-quality - Air quality by location
- GET /air-quality/location/:id - Specific station
- GET /air-quality/countries - All countries
- GET /earthquakes - Custom region
- GET /earthquakes/uae-iran - UAE/Iran region
- GET /earthquakes/nearby - Nearby earthquakes
- GET /news - News articles
- GET /news/newsapi - NewsAPI specific
- GET /comprehensive - All data for location

**Workflows** (`/api/workflows`)
- GET / - List workflows
- POST /:id/execute - Execute workflow
- GET /templates/list - Templates

**Upload** (`/api/upload`)
- POST /analyze - Upload & analyze
- POST /batch - Batch upload

**Alerts** (`/api/alerts`)
- GET / - List alerts
- POST / - Create alert
- PUT /:id - Update alert
- POST /:id/send - Send alert

**Stats** (`/api/stats`)
- GET /overview - System statistics
- GET /hotspots - Global hotspots
- GET /trends - Trend analysis

**Realtime** (`/api/realtime`)
- GET /feed - Real-time feed
- GET /status - System status

**AI Status** (`/api/ai`)
- GET /status - AI service status
- GET /usage - Usage statistics

**Opus** (`/api/opus`)
- POST /execute - Execute workflow
- GET /status/:id - Workflow status

**Health** (`/health`)
- GET / - System health check

