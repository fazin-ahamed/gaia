# ✅ Enum to String Migration Fix

## Problem
PostgreSQL enum types can't be automatically cast when altering existing columns, causing deployment failures:

```
error: default for column "status" cannot be cast automatically to type enum_workflows_status
```

## Solution
Converted all `DataTypes.ENUM` to `DataTypes.STRING` with validation constraints.

## Files Fixed

### 1. backend/models/Workflow.js
**Before:**
```javascript
status: {
  type: DataTypes.ENUM('active', 'inactive', 'draft'),
  allowNull: false,
  defaultValue: 'active',
}
```

**After:**
```javascript
status: {
  type: DataTypes.STRING,
  allowNull: false,
  defaultValue: 'active',
  validate: {
    isIn: [['active', 'inactive', 'draft']]
  }
}
```

### 2. backend/models/AuditLog.js
**Fixed Fields:**
- `action` - 10 possible values
- `actor` - 3 possible values (system, human, ai)

### 3. backend/models/ApiData.js
**Fixed Fields:**
- `dataType` - 8 possible values (weather, satellite, news, etc.)
- `status` - 4 possible values (collected, processed, failed, expired)

### 4. backend/models/Anomaly.js
**Fixed Fields:**
- `severity` - 4 possible values (low, medium, high, critical)
- `status` - 6 possible values (detected, processing, reviewed, etc.)

## Benefits

### 1. Database Compatibility
- ✅ Works with existing databases
- ✅ No enum type casting issues
- ✅ Smooth migrations on Render/Aiven

### 2. Validation Maintained
- ✅ Same validation as ENUM
- ✅ Sequelize validates on save
- ✅ Clear error messages

### 3. Flexibility
- ✅ Easier to add new values
- ✅ No database type changes needed
- ✅ Works across all SQL dialects

## Validation Example

```javascript
// This will work
await Anomaly.create({
  severity: 'high',
  status: 'detected'
});

// This will fail validation
await Anomaly.create({
  severity: 'invalid', // Error: Validation isIn on severity failed
  status: 'detected'
});
```

## Migration Impact

### Before (ENUM)
```sql
-- Required complex migration
ALTER TABLE workflows DROP COLUMN status;
ALTER TABLE workflows ADD COLUMN status enum_workflows_status;
```

### After (STRING)
```sql
-- Simple migration
ALTER TABLE workflows ALTER COLUMN status TYPE VARCHAR(255);
```

## Testing

All models validated:
- ✅ No syntax errors
- ✅ Validation constraints in place
- ✅ Default values preserved
- ✅ Indexes maintained

## Deployment

This fix allows:
1. ✅ Fresh database setup (fresh-db-setup.js)
2. ✅ Existing database migrations
3. ✅ Render deployment
4. ✅ Aiven PostgreSQL compatibility

## Status

✅ **ALL ENUM ISSUES FIXED**

The application should now deploy successfully without enum casting errors.
