# Database Migration Guide

## Overview
This guide explains how to set up and migrate the GAIA database for both local development and production (Render).

## Migration Scripts

### 1. `migrate-and-seed.js` (Full Migration)
**Purpose**: Complete database setup with test data
**Use**: Local development and initial production setup
**Features**:
- Creates all tables
- Seeds 8 diverse test anomalies
- Creates 2 sample workflows
- Generates audit logs
- Provides detailed output

### 2. `setup-database.js` (Minimal Setup)
**Purpose**: Quick production setup
**Use**: Render build process
**Features**:
- Creates tables only
- Minimal seeding (1 record)
- Fast execution
- Production-safe

## Local Development

### Prerequisites
```bash
# Install PostgreSQL locally
# Or use Docker:
docker run --name gaia-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

### Setup
1. **Configure environment**:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env`**:
   ```env
   DB_NAME=gaia
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_DIALECT=postgres
   ```

3. **Run migration**:
   ```bash
   node migrate-and-seed.js
   ```

### Expected Output
```
============================================================
GAIA DATABASE MIGRATION & SEED
============================================================
Environment: development
Database: gaia
============================================================

[1/5] Testing database connection...
✓ Database connection established

[2/5] Creating tables...
✓ All tables created successfully

Created tables: anomalies, api_data, audit_logs, workflows

[3/5] Seeding workflows...
✓ Created 2 workflows

[4/5] Seeding anomalies...
✓ Created 8 anomalies

[5/5] Creating audit logs...
✓ Created 8 audit log entries

============================================================
MIGRATION COMPLETE
============================================================

Database Statistics:
  Anomalies: 8
  Workflows: 2
  Audit Logs: 8
  API Data: 0

Sample Anomalies:
  1. [CRITICAL] Unusual Seismic Activity Pattern
  2. [HIGH] Atmospheric Pressure Anomaly
  3. [HIGH] Unexplained Electromagnetic Interference

✓ Database is ready for use!

You can now start the server with: npm start
```

## Production (Render)

### Method 1: Automatic Setup (Recommended)

**Update `render.yaml`**:
```yaml
services:
  - type: web
    name: gaia-backend
    env: node
    buildCommand: cd backend && npm install && node setup-database.js
    startCommand: cd backend && node server.js
```

This runs `setup-database.js` during every deployment.

### Method 2: Manual Migration

#### Option A: Using Render Shell (if available)

1. **Go to Render Dashboard**
2. **Click on your service** → **Shell**
3. **Run migration**:
   ```bash
   cd backend
   node migrate-and-seed.js
   ```

#### Option B: Using Database Client

1. **Get DATABASE_URL**:
   - Render Dashboard → Your Database → Connection String
   - Copy "External Database URL"

2. **Connect with psql**:
   ```bash
   psql "postgresql://user:pass@host/database"
   ```

3. **Run migration locally against production**:
   ```bash
   # Set DATABASE_URL temporarily
   export DATABASE_URL="postgresql://user:pass@host/database"
   
   # Run migration
   cd backend
   node migrate-and-seed.js
   ```

#### Option C: One-Time Script Execution

1. **Add to `package.json`**:
   ```json
   {
     "scripts": {
       "migrate": "node migrate-and-seed.js",
       "setup": "node setup-database.js"
     }
   }
   ```

2. **Temporarily update Render build command**:
   ```
   cd backend && npm install && npm run migrate
   ```

3. **Deploy** → Wait for migration to complete

4. **Revert build command** to:
   ```
   cd backend && npm install
   ```

### Method 3: API Endpoint (Advanced)

Create a protected migration endpoint:

**File**: `backend/routes/admin.js`
```javascript
router.post('/migrate', async (req, res) => {
  const { secret } = req.body;
  
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    // Run migration logic here
    res.json({ success: true, message: 'Migration complete' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Then trigger via:
```bash
curl -X POST https://gaia-backend.onrender.com/api/admin/migrate \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-secret-key"}'
```

## Verification

### Check Tables Exist
```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# Expected output:
#  anomalies
#  api_data
#  audit_logs
#  workflows
```

### Check Data
```bash
# Count records
SELECT COUNT(*) FROM anomalies;

# View sample data
SELECT id, title, severity, status FROM anomalies LIMIT 5;
```

### Test API Endpoints
```bash
# Health check
curl https://gaia-backend.onrender.com/health

# Anomalies endpoint
curl https://gaia-backend.onrender.com/api/anomalies

# Should return JSON with anomalies array
```

## Troubleshooting

### Error: "relation does not exist"
**Cause**: Tables not created
**Solution**: Run migration script

### Error: "cannot connect to database"
**Cause**: Wrong DATABASE_URL or database not running
**Solution**: 
- Check DATABASE_URL in environment variables
- Verify database is running (Render Dashboard)
- Check SSL settings

### Error: "permission denied"
**Cause**: Database user lacks permissions
**Solution**: 
- Use database owner credentials
- Grant permissions: `GRANT ALL ON DATABASE gaia TO user;`

### Error: "duplicate key value"
**Cause**: Trying to seed data that already exists
**Solution**: 
- Drop tables first: `DROP TABLE IF EXISTS anomalies CASCADE;`
- Or use `{ force: true }` in sync options

### Migration Hangs
**Cause**: Database connection timeout
**Solution**:
- Check network connectivity
- Verify SSL settings
- Increase timeout in Sequelize config

## Database Schema

### Tables Created

#### `anomalies`
- Primary table for anomaly records
- Fields: id, title, description, severity, confidence, status, location, etc.
- Indexes on: severity, confidence, status, timestamp, location, tags

#### `api_data`
- Stores raw and processed API data
- Fields: id, anomalyId, apiName, rawData, processedData, dataType, etc.
- Foreign key to anomalies

#### `audit_logs`
- Tracks all changes to anomalies
- Fields: id, anomalyId, action, actor, changes, reasoning, etc.
- Foreign key to anomalies

#### `workflows`
- Stores workflow definitions
- Fields: id, name, description, template, nodes, edges, etc.
- Referenced by anomalies

### Relationships
```
Anomaly (1) ──< (N) ApiData
Anomaly (1) ──< (N) AuditLog
Workflow (1) ──< (N) Anomaly
```

## Seed Data

### Anomalies (8 records)
1. **Unusual Seismic Activity Pattern** - Critical
2. **Atmospheric Pressure Anomaly** - High
3. **Unexplained Electromagnetic Interference** - High
4. **Unusual Marine Life Behavior** - Medium
5. **Air Quality Spike** - Medium
6. **Anomalous Traffic Pattern** - High
7. **Unexplained Temperature Gradient** - Medium
8. **Unusual Radiation Readings** - Critical

### Workflows (2 records)
1. **Standard Anomaly Investigation** - Default workflow
2. **Critical Alert Response** - For critical anomalies

## Maintenance

### Re-seed Database
```bash
# WARNING: This will delete all data
cd backend
node migrate-and-seed.js
```

### Add More Test Data
```bash
# Run seed script multiple times (creates new records)
cd backend
node seed-data.js
```

### Backup Database
```bash
# Export data
pg_dump $DATABASE_URL > backup.sql

# Import data
psql $DATABASE_URL < backup.sql
```

### Reset Database
```bash
# Drop all tables
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run migration
node migrate-and-seed.js
```

## Production Checklist

- [ ] DATABASE_URL environment variable set
- [ ] Database is running and accessible
- [ ] Migration script executed successfully
- [ ] Tables created (verify with `\dt`)
- [ ] Data seeded (verify with `SELECT COUNT(*)`)
- [ ] API endpoints returning data
- [ ] Health check passes
- [ ] Frontend can fetch data
- [ ] No 500 errors in logs

## Quick Commands Reference

```bash
# Local development
cd backend
node migrate-and-seed.js

# Production setup (minimal)
cd backend
node setup-database.js

# Check database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM anomalies;"

# Test API
curl https://gaia-backend.onrender.com/api/anomalies

# View logs
# Render Dashboard → Your Service → Logs
```

## Support

If migration fails:
1. Check Render logs for specific error
2. Verify DATABASE_URL is correct
3. Ensure database is running
4. Try minimal setup first (`setup-database.js`)
5. Check this guide's troubleshooting section

---

**Last Updated**: November 18, 2024
**Version**: 1.0.0
