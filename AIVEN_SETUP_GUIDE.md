# Aiven PostgreSQL Setup Guide

## Step-by-Step Setup

### 1. Create Aiven PostgreSQL Database

1. Go to https://aiven.io
2. Create a new PostgreSQL service
3. Choose your plan (free tier available)
4. Wait for service to start (2-3 minutes)

### 2. Get Connection String

Aiven provides a **Session Pooler URI** which is recommended for web applications.

**Format:**
```
postgres://username:password@host:port/database?sslmode=require
```

**Example:**
```
postgres://avnadmin:password@pg-abc123.aivencloud.com:12345/defaultdb?sslmode=require
```

### 3. Update Render Environment Variables

Go to your Render dashboard → gaia-backend → Environment:

**Add/Update:**
```
DATABASE_URL=postgres://avnadmin:password@pg-abc123.aivencloud.com:12345/defaultdb?sslmode=require
```

**Keep these:**
```
NODE_ENV=production
NODE_TLS_REJECT_UNAUTHORIZED=0
PORT=10000
DB_DIALECT=postgres
```

### 4. Deploy

The `fresh-db-setup.js` script will:
1. Connect to your new Aiven database
2. Create all tables from scratch
3. Set up indexes and relationships
4. Your app will start successfully!

## Aiven Advantages

### vs Render PostgreSQL
- ✅ More reliable SSL certificates
- ✅ Better connection pooling
- ✅ More configuration options
- ✅ Better performance
- ✅ Dedicated database service

### Session Pooler
- ✅ Handles connection pooling automatically
- ✅ Better for serverless/web apps
- ✅ Prevents connection exhaustion
- ✅ Recommended by Aiven

## Connection Configuration

### For Aiven Session Pooler

Your `server.js` already handles this correctly:

```javascript
if (process.env.DATABASE_URL) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  dbConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}
```

### SSL Mode

Aiven connection strings include `?sslmode=require` which is perfect.

## Build Process

When you deploy with Aiven:

1. **Build starts**
2. **npm install** - Installs packages
3. **fresh-db-setup.js** - Creates fresh tables on Aiven
4. **Server starts** - Connects to Aiven
5. **App runs** - Everything works!

## Verification

After deployment:

```bash
# Check health
curl https://gaia-4jxk.onrender.com/health

# Should return
{"status":"OK","timestamp":"..."}

# Check database
curl https://gaia-4jxk.onrender.com/api/anomalies

# Should return
{"anomalies":[],"total":0,"page":1,"totalPages":0}
```

## Aiven Dashboard

Monitor your database:
- Connection count
- Query performance
- Storage usage
- Backup status

## Backup & Restore

### Automatic Backups
Aiven automatically backs up your database.

### Manual Backup
```bash
pg_dump "postgres://avnadmin:password@host:port/db" > backup.sql
```

### Restore
```bash
psql "postgres://avnadmin:password@host:port/db" < backup.sql
```

## Connection Pooling

Aiven's session pooler handles this automatically. Your app can make many connections without issues.

## Performance

Aiven provides:
- Fast SSD storage
- Optimized PostgreSQL configuration
- Connection pooling
- Query optimization
- Monitoring and alerts

## Cost

- **Free tier**: 1 GB storage, 1 CPU
- **Startup**: $20/month, 5 GB storage
- **Business**: $60/month, 25 GB storage

Free tier is perfect for development and testing!

## Migration from Render

1. Create Aiven database
2. Get connection string
3. Update DATABASE_URL in Render
4. Deploy (fresh-db-setup.js creates tables)
5. Done!

No data migration needed since we're starting fresh.

## Troubleshooting

### Connection Issues
- Verify connection string is correct
- Check SSL mode is included
- Verify NODE_TLS_REJECT_UNAUTHORIZED=0 is set

### Permission Issues
- Aiven admin user has all permissions
- No additional setup needed

### SSL Issues
- Aiven uses proper SSL certificates
- Should work better than Render's self-signed certs
- Keep rejectUnauthorized: false for compatibility

## Configuration Checklist

- [ ] Aiven PostgreSQL service created
- [ ] Service is running (green status)
- [ ] Session pooler URI copied
- [ ] DATABASE_URL updated in Render
- [ ] NODE_TLS_REJECT_UNAUTHORIZED=0 set
- [ ] Deployed to Render
- [ ] Health check passes
- [ ] Can create anomalies

## Support

- Aiven Docs: https://docs.aiven.io/docs/products/postgresql
- Aiven Support: Available in dashboard
- Connection issues: Check Aiven service logs

---

**With Aiven, your deployment will be much more reliable!**

The fresh database + proper SSL certificates = no more issues.
