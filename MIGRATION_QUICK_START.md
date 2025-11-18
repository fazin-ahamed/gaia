# 🚀 Database Migration - Quick Start

## TL;DR

### Local Development
```bash
cd backend
node migrate-and-seed.js
```

### Production (Render)
**Option 1 - Automatic** (Recommended):
Update `render.yaml` build command:
```yaml
buildCommand: cd backend && npm install && npm run migrate:prod
```

**Option 2 - Manual**:
```bash
# In Render Shell or locally with DATABASE_URL set
cd backend
node migrate-and-seed.js
```

---

## What Gets Created

### Tables
- ✅ `anomalies` - Main anomaly records
- ✅ `api_data` - API data storage
- ✅ `audit_logs` - Change tracking
- ✅ `workflows` - Workflow definitions

### Test Data
- ✅ 8 diverse anomalies (seismic, weather, marine, etc.)
- ✅ 2 sample workflows
- ✅ 8 audit log entries

---

## Scripts Available

### `migrate-and-seed.js` (Full)
- Creates all tables
- Seeds 8 test anomalies
- Creates workflows
- Detailed output
- **Use for**: Local dev, initial production setup

### `setup-database.js` (Minimal)
- Creates tables only
- Minimal seeding (1 record)
- Fast execution
- **Use for**: Production builds, CI/CD

### `seed-data.js` (Data Only)
- Adds more test data
- Doesn't modify schema
- **Use for**: Adding more test records

---

## Quick Commands

```bash
# Full migration with test data
npm run migrate

# Minimal production setup
npm run migrate:prod

# Add more test data
npm run seed

# Check database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM anomalies;"
```

---

## For Render Deployment

### Step 1: Update Build Command
Render Dashboard → Your Service → Settings → Build Command:
```
cd backend && npm install && npm run migrate:prod
```

### Step 2: Deploy
Click "Manual Deploy" → "Deploy latest commit"

### Step 3: Verify
```bash
curl https://gaia-backend.onrender.com/api/anomalies
```

Should return JSON with anomalies!

---

## Troubleshooting

### ❌ "relation does not exist"
**Fix**: Run migration script
```bash
node migrate-and-seed.js
```

### ❌ "cannot connect to database"
**Fix**: Check DATABASE_URL
```bash
echo $DATABASE_URL
```

### ❌ API returns 500 errors
**Fix**: Check if tables exist
```bash
psql $DATABASE_URL -c "\dt"
```

---

## Verification Checklist

- [ ] Migration script runs without errors
- [ ] Tables created (check with `\dt`)
- [ ] Data exists (`SELECT COUNT(*) FROM anomalies;`)
- [ ] API endpoint works (`/api/anomalies`)
- [ ] Health check passes (`/health`)
- [ ] Frontend loads data

---

## Need Help?

See **DATABASE_MIGRATION_GUIDE.md** for complete documentation.

---

**Quick Test**:
```bash
# Test locally
cd backend
node migrate-and-seed.js

# Should see:
# ✓ Database connection established
# ✓ All tables created successfully
# ✓ Created 8 anomalies
# ✓ Database is ready for use!
```

**Status**: Ready to run! 🎉
