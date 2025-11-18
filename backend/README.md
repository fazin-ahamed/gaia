# GAIA Backend API

## Deployment on Render

### 1. Create on Render
1. Connect your GitHub repository
2. Choose "Web Service" 
3. Select the backend folder
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Set environment variables (see `.env.example`)

### Environment Variables
```
PORT=10000
NODE_ENV=production
DB_HOST=your_database_host
DB_NAME=gaia_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
GEMINI_API_KEY=your_gemini_key
AUTONOMOUS_MODE=true
```

### Database Setup
- Create PostgreSQL database on Render
- Run migrations: `node scripts/migrate.js`
- Import sample data: `node scripts/generate-sample-data.js`