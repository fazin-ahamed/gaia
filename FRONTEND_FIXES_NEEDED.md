# Frontend Fixes Implementation Plan

## Issues Identified

### 1. Upload Evidence Page ✅ NEEDS FIX
**Problems:**
- Submit button doesn't work
- No list view of uploaded evidence
- Can't see uploaded items later

**Solution:**
- Fix form submission to actually call API
- Add table/list view of all uploads
- Store uploads in database and display them

### 2. Operations Console ✅ NEEDS FIX
**Problems:**
- All metrics are fake/static
- Total agents, active now, avg response, throughput are hardcoded

**Solution:**
- Fetch real data from `/api/stats/overview`
- Calculate real metrics from database
- Show actual agent swarm activity
- Display real API usage stats

### 3. Incident Details Page ✅ NEEDS FIX
**Problems:**
- Goes blank when selecting an incident
- Doesn't load actual incident data

**Solution:**
- Fix data fetching from `/api/anomalies/:id`
- Handle loading states properly
- Show error messages if data fails to load

### 4. Settings Page ✅ CREATED
**Status:** NEW PAGE CREATED
- User roles management
- API sources health status
- Notifications settings
- Security settings
- API key management

### 5. Audit Viewer ✅ NEEDS FIX
**Problems:**
- Only shows audit log for one anomaly
- No way to choose between different anomalies

**Solution:**
- Create table/list view of all audit logs
- Add filters by anomaly, user, action, date
- Make it searchable

### 6. Sidebar Navigation ✅ NEEDS UPDATE
**Problems:**
- "Incident Details" should be "Incidents"
- Should show list/table view, not single incident

**Solution:**
- Rename to "Incidents"
- Link to new IncidentsListPage
- Separate from detailed incident view

### 7. Incidents List Page ✅ CREATED
**Status:** NEW PAGE CREATED (CRM-style)
- Table view of all anomalies
- Filters by severity, status
- Search functionality
- Sort by date, severity, confidence
- Click to view details

## Files Created

1. ✅ `frontend/pages/IncidentsListPage.tsx` - CRM-style incidents list
2. ✅ `frontend/pages/SettingsPage.tsx` - Functional settings page
3. 🔄 Need to create: `frontend/pages/AuditLogsPage.tsx`
4. 🔄 Need to fix: `frontend/pages/AnomalyUploadReal.tsx`
5. 🔄 Need to fix: `frontend/pages/OperationsConsole.tsx`
6. 🔄 Need to fix: `frontend/pages/IncidentDetailsEnhanced.tsx`
7. 🔄 Need to update: `frontend/components/Sidebar.tsx`
8. 🔄 Need to update: `frontend/App.tsx` - Add new routes

## Implementation Priority

### High Priority (Do First)
1. Update Sidebar navigation
2. Add routes in App.tsx
3. Fix IncidentDetailsEnhanced to load real data
4. Fix Operations Console with real metrics

### Medium Priority
5. Fix Upload Evidence submission
6. Create AuditLogsPage with table view
7. Add upload history list

### Low Priority
8. Polish UI/UX
9. Add more filters
10. Improve error handling

## Next Steps

1. Update `Sidebar.tsx` to rename "Incident Details" → "Incidents"
2. Update `App.tsx` to add new routes
3. Fix `IncidentDetailsEnhanced.tsx` to fetch real data
4. Fix `OperationsConsole.tsx` to show real metrics
5. Create `AuditLogsPage.tsx` with table view
6. Fix `AnomalyUploadReal.tsx` submission

## API Endpoints Needed

- ✅ `GET /api/anomalies` - List all anomalies
- ✅ `GET /api/anomalies/:id` - Get single anomaly
- ✅ `POST /api/upload/analyze` - Upload evidence
- ✅ `GET /api/stats/overview` - System statistics
- 🔄 `GET /api/audit-logs` - All audit logs (needs to be created)
- 🔄 `GET /api/uploads` - List all uploads (needs to be created)

