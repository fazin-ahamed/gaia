# GAIA Deployment Guide

## Deploy to Render and Netlify

This guide shows how to deploy GAIA to Render (backend) and Netlify (frontend) for easy cloud deployment.

### Backend Deployment (Render)

1. **Create Backend Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New Web Service"
   - Connect your GitHub repository
   - Select the `backend` folder

2. **Configure Backend**
   ```
   Name: gaia-backend
   Runtime: Node.js
   Branch: main
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Environment Variables**
   Add these environment variables in Render dashboard:
   ```
   PORT=10000
   NODE_ENV=production
   DB_HOST=your_render_postgres_host
   DB_NAME=gaia_db
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   GEMINI_API_KEY=your_gemini_api_key
   AUTONOMOUS_MODE=true
   ```

4. **Create PostgreSQL Database**
   - In Render, create a new PostgreSQL database
   - Copy connection string and add to environment variables
   - Run migrations after deployment

### Frontend Deployment (Netlify)

1. **Create Frontend Site on Netlify**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Select the `frontend` folder

2. **Configure Build Settings**
   ```
   Build Command: npm run build
   Publish Directory: dist
   Node Version: 18
   ```

3. **Environment Variables**
   Add these in Netlify site settings:
   ```
   REACT_APP_API_URL=https://your-gaia-backend.onrender.com/api
   REACT_APP_WS_URL=wss://your-gaia-backend.onrender.com
   ```

### Manual Deployment Commands

**Backend (Render):**
```bash
cd backend
npm install
npm run build
npm start
```

**Frontend (Netlify):**
```bash
cd frontend
npm install
npm run build
# Deploy to Netlify using CLI: netlify deploy
```

### Docker Deployment (Alternative)

For Docker deployment, use the individual Dockerfiles:

**Backend:**
```bash
cd backend
docker build -f ../Dockerfile.backend -t gaia-backend .
docker run -p 3001:3001 gaia-backend
```

**Frontend:**
```bash
cd frontend
docker build -t gaia-frontend .
docker run -p 80:80 gaia-frontend
```

### Environment Configuration

Copy `.env.example` files and update with your production values:

**Backend Environment:**
```bash
cp backend/.env.example backend/.env
# Edit with your production values
```

**Frontend Environment:**
```bash
cp frontend/.env.local frontend/.env.production
# Edit API URLs for production
```

### Post-Deployment Steps

1. **Run Database Migrations**
   ```bash
   cd backend
   node scripts/migrate.js
   ```

2. **Import Sample Data (Optional)**
   ```bash
   node scripts/generate-sample-data.js
   ```

3. **Verify Deployment**
   - Backend: `https://your-gaia-backend.onrender.com/health`
   - Frontend: `https://your-gaia-frontend.netlify.app`

### Troubleshooting

**Common Issues:**

1. **CORS Errors**: Ensure frontend URL is in backend's `ALLOWED_ORIGINS`
2. **Database Connection**: Verify database credentials and connection string
3. **API Keys**: Check all external API keys are properly configured
4. **Build Errors**: Verify Node.js version compatibility

**Health Checks:**
- Backend: `GET /health`
- Frontend: `GET /health`

**Logs:**
- Render: View logs in dashboard
- Netlify: View deploy logs in site settings

### Scaling

**Backend Scaling:**
- Render allows easy scaling of web services
- Consider Redis for caching at scale
- Use connection pooling for database

**Frontend Scaling:**
- Netlify automatically scales static sites
- Use CDN for global performance
- Enable asset optimization

### Security

**Best Practices:**
- Use strong API keys and secrets
- Enable HTTPS (automatic on Render/Netlify)
- Set up proper CORS policies
- Regular security updates
- Monitor for suspicious activity