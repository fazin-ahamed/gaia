# GAIA - Global Autonomous Intelligence for Anomaly Response

![GAIA Logo](https://img.shields.io/badge/GAIA-Anomaly--Detection-blue?style=for-the-badge&logo=ai)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square)
![React](https://img.shields.io/badge/React-18+-blue?style=flat-square)

GAIA is a fully autonomous, enterprise-grade system powered by Gemini multimodal AI and Opus workflow orchestration for real-time global anomaly detection and response.

## 🌟 Features

### Backend Features
- **Autonomous Data Ingestion**: Scheduled collection from 8+ external APIs (Weather, Satellite, News, Disasters, etc.)
- **Multimodal AI Processing**: Gemini AI analysis of text, images, videos, and audio
- **Anomaly Detection**: Confidence scoring and cross-modality verification
- **Opus Workflow Engine**: Rule-based + AI-decision workflows
- **PostgreSQL Database**: Robust data storage with full audit trails
- **Real-time WebSocket**: Live anomaly updates and notifications
- **RESTful API**: Complete API suite for integrations

### Frontend Features
- **Live Dashboard**: Real-time anomaly feed with severity indicators
- **Interactive Map**: Global heatmap with clickable anomaly markers
- **Editable Anomaly Panels**: Human-in-the-loop review interface
- **Autonomous Mode Toggle**: Switch between manual and fully autonomous operation
- **Workflow Status**: Real-time workflow execution monitoring
- **Notification System**: High-severity alerts and system status
- **Audit Reports**: Downloadable JSON/PDF provenance reports

### Production Ready
- **Docker Containerization**: Multi-service deployment with Docker Compose
- **CI/CD Pipeline**: GitHub Actions with security scanning
- **Scalable Architecture**: Microservices design with Redis caching
- **Comprehensive Logging**: Winston logging with structured output
- **Health Monitoring**: Built-in health checks and metrics
- **Security**: Helmet security headers, CORS, input validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- API Keys for external services (optional for demo)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/gaia-anomaly-detection.git
   cd gaia-anomaly-detection
   ```

2. **Environment Setup**
   ```bash
   # Copy environment template
   cp backend/.env.example backend/.env

   # Edit with your API keys (optional for demo)
   nano backend/.env
   ```

3. **Docker Deployment (Recommended)**
   ```bash
   # Start all services
   docker-compose up -d

   # View logs
   docker-compose logs -f

   # Access the application
   open http://localhost
   ```

4. **Manual Development Setup**
   ```bash
   # Backend setup
   cd backend
   npm install
   npm run dev

   # Frontend setup (new terminal)
   cd ../frontend
   npm install
   npm run dev

   # Access at http://localhost:5173
   ```

## 📁 Project Structure

```
gaia-anomaly-detection/
├── backend/                    # Node.js/Express API server
│   ├── models/                # Sequelize database models
│   ├── routes/                # API route handlers
│   ├── services/              # Business logic services
│   ├── middleware/            # Express middleware
│   └── utils/                 # Utility functions
├── frontend/                  # React/TypeScript frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   └── services/        # API service layer
│   ├── public/               # Static assets
│   └── data/                 # Mock data for development
├── workflows/                # Opus workflow definitions
├── scripts/                  # Utility scripts
├── docs/                     # Documentation
├── docker-compose.yml        # Multi-service deployment
├── Dockerfile.backend        # Backend container config
├── Dockerfile.frontend       # Frontend container config
└── nginx.conf               # Reverse proxy config
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_NAME` | Database name | `gaia_db` |
| `AUTONOMOUS_MODE` | Enable autonomous operation | `false` |
| `GEMINI_API_KEY` | Google Gemini AI key | Required |

See `backend/.env.example` for complete configuration options.

### External API Keys

GAIA integrates with these free-tier APIs:
- **Weather**: OpenWeatherMap, Weatherbit
- **Satellite**: NASA EarthData
- **News**: NewsAPI, GDELT
- **Disasters**: USGS, EONET
- **Traffic**: TomTom
- **Air Quality**: AirVisual

## 🔄 Workflows

GAIA uses Opus workflow orchestration for anomaly processing:

### Default Anomaly Workflow
```
Intake → AI Analysis → Cross-Verification → Decision → Human Review → Approval → Delivery
```

### Emergency Response Workflow
```
Emergency Intake → AI Triage → Parallel Verification → Impact Assessment → Emergency Decision → Response Activation
```

## 📊 API Reference

### Anomalies

```bash
# Get anomalies with filtering
GET /api/anomalies?page=1&limit=20&severity=critical

# Get specific anomaly
GET /api/anomalies/:id

# Create anomaly
POST /api/anomalies

# Update anomaly
PUT /api/anomalies/:id

# Approve/Reject anomaly
POST /api/anomalies/:id/approve
POST /api/anomalies/:id/reject

# Generate report
GET /api/anomalies/:id/report/:format
```

### Workflows

```bash
# Get workflows
GET /api/workflows

# Execute workflow
POST /api/workflows/:id/execute

# Get workflow templates
GET /api/workflows/templates/list
```

## 🔐 Security

- **API Key Management**: Secure storage and rotation
- **Input Validation**: Comprehensive validation with Joi
- **Rate Limiting**: Configurable API rate limits
- **CORS**: Configured for allowed origins
- **Helmet**: Security headers enabled
- **Audit Logging**: Complete action tracking

## 📈 Monitoring

### Health Endpoints
- `GET /health` - System health status
- `GET /api/anomalies/stats/overview` - Anomaly statistics

### Logging
- **Winston Logger**: Structured logging to files and console
- **Log Levels**: error, warn, info, debug
- **Log Rotation**: Automatic log file rotation

### Metrics
- Request/response times
- API success rates
- Anomaly detection accuracy
- Workflow execution times

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd ../frontend
npm test

# Sample data generation
cd ../scripts
node generate-sample-data.js
```

## 🚢 Deployment

### Docker Compose (Recommended)
```bash
# Production deployment
docker-compose -f docker-compose.yml up -d

# Development with hot reload
docker-compose -f docker-compose.dev.yml up
```

### Manual Deployment
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd ../frontend
npm run build
# Serve dist/ with nginx or similar
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for type safety
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for multimodal analysis capabilities
- **Opus Framework** for workflow orchestration
- **Open Source Community** for the amazing tools and libraries

## 📞 Support

- **Documentation**: See `/docs` directory
- **Issues**: [GitHub Issues](https://github.com/your-org/gaia-anomaly-detection/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/gaia-anomaly-detection/discussions)

---

**GAIA** - Making the world safer through autonomous intelligence. 🌍🤖