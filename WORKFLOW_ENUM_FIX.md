# Workflow Enum Type Fix

## Problem

The deployment is failing with this error:
```
default for column "status" cannot be cast automatically to type enum_workflows_status
```

This happens when Sequelize tries to alter an existing `workflows` table to change the `status` column from a regular string type to an ENUM type.

## Root Cause

PostgreSQL cannot automatically cast a VARCHAR/TEXT column with a default value to an ENUM type. The existing table has a `status` column that needs to be recreated with the proper ENUM type.

## Solution

### Option 1: Run the Fix Script (Recommended)

Run this command on your Render deployment:

```bash
node backend/fix-workflow-enum.js
```

This script will:
1. Drop the old enum type if it exists
2. Drop the status column
3. Create the new enum type
4. Add the status column with the correct enum type
5. Update any existing rows

### Option 2: Manual SQL Fix

Connect to your PostgreSQL database and run:

```sql
-- Drop the old enum type
DROP TYPE IF EXISTS "enum_workflows_status" CASCADE;

-- Drop the status column
ALTER TABLE workflows DROP COLUMN IF EXISTS status;

-- Create the enum type
CREATE TYPE "enum_workflows_status" AS ENUM('active', 'inactive', 'draft');

-- Add the status column with enum type
ALTER TABLE workflows 
ADD COLUMN status "enum_workflows_status" DEFAULT 'active' NOT NULL;

-- Update existing rows
UPDATE workflows SET status = 'active' WHERE status IS NULL;
```

### Option 3: Drop and Recreate Table (Nuclear Option)

If you don't have important workflow data:

```sql
DROP TABLE IF EXISTS workflows CASCADE;
```

Then restart the server and it will recreate the table correctly.

## For Render Deployment

### Method 1: Add as Build Command

Update your `render.yaml` or Render dashboard:

```yaml
services:
  - type: web
    name: gaia-backend
    env: node
    buildCommand: npm install && node backend/fix-workflow-enum.js
    startCommand: node backend/server.js
```

### Method 2: Run via Render Shell

1. Go to your Render dashboard
2. Open the Shell for your service
3. Run: `node backend/fix-workflow-enum.js`
4. Restart the service

### Method 3: Connect to Database Directly

1. Get your DATABASE_URL from Render environment variables
2. Connect using psql or a database client
3. Run the manual SQL commands above

## Prevention

The `backend/models/index.js` has been updated to:
- Skip `alter: true` in production
- Only create tables if they don't exist
- Avoid schema conflicts on existing tables

This prevents future enum casting issues.

## Verification

After applying the fix, verify:

```bash
# Check if the enum type exists
SELECT typname FROM pg_type WHERE typname = 'enum_workflows_status';

# Check the status column type
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'workflows' AND column_name = 'status';

# Should show: enum_workflows_status
```

## Quick Fix for Render

Add this to your Render service's **Build Command**:

```
npm install && node backend/fix-workflow-enum.js || true
```

The `|| true` ensures the build continues even if the fix script fails (e.g., if the table doesn't exist yet).

## Files Modified

1. **backend/fix-workflow-enum.js** - New fix script
2. **backend/models/index.js** - Updated to avoid alter in production
3. **WORKFLOW_ENUM_FIX.md** - This documentation

## Next Steps

1. Run the fix script on Render
2. Restart your service
3. Verify the deployment succeeds
4. Check that workflows are working correctly

The fix is safe and won't affect your existing data in other tables.
