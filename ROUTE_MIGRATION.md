# GAIA 3.1 - Route Migration Guide

## Overview
Enhanced versions are now the default routes. Old versions are still accessible with `-old` suffix.

---

## Route Changes

### Dashboard
- **New (Enhanced):** `/dashboard` → `UserDashboardEnhanced`
- **Old:** `/dashboard-old` → `Dashboard`

### Upload
- **New (Enhanced):** `/upload` → `AnomalyUploadEnhanced`
- **Old:** `/upload-real` → `AnomalyUploadReal`

### Incident Details
- **New (Enhanced):** `/incident/:id` → `IncidentDetailsEnhanced`
- **Old:** `/incident-old/:id` → `IncidentDetailsPage`

### Analytics
- **New (Enhanced):** `/analytics` → `GlobalAnalyticsEnhanced`
- **Old:** `/analytics-old` → `GlobalAnalyticsPage`

### Unchanged Routes
- `/` → LandingPage
- `/report` → ReportAnomalyPage
- `/operations` → OperationsConsole
- `/alerts` → AlertsDeliveryPage
- `/verification/:id` → VerificationPage
- `/settings` → SettingsPage
- `/about` → AboutPage

---

## What Changed

### Before
```typescript
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/dashboard-enhanced" element={<UserDashboardEnhanced />} />
```

### After
```typescript
<Route path="/dashboard" element={<UserDashboardEnhanced />} />
<Route path="/dashboard-old" element={<Dashboard />} />
```

---

## Navigation Updates

### Sidebar Links Updated
All sidebar navigation now points to enhanced versions:
- Dashboard → `/dashboard`
- Upload → `/upload`
- Analytics → `/analytics`
- Incident → `/incident/:id`

### Old Routes Still Work
If you have bookmarks or links to old routes, they still work:
- `/dashboard-old` - Old dashboard
- `/upload-real` - Old upload page
- `/analytics-old` - Old analytics
- `/incident-old/:id` - Old incident details

---

## Features in Enhanced Versions

### UserDashboardEnhanced
- ✅ Real-time data from API
- ✅ Interactive maps
- ✅ Swarm visualization
- ✅ Global risk scoring
- ✅ Predictive forecasting
- ✅ Mitigation planner

### AnomalyUploadEnhanced
- ✅ Multi-file upload
- ✅ Drag & drop
- ✅ Real-time analysis
- ✅ AI-powered detection
- ✅ Opus workflow integration
- ✅ Cross-verification

### IncidentDetailsEnhanced
- ✅ Complete timeline
- ✅ Agent contributions
- ✅ Swarm consensus
- ✅ Predictive forecasting
- ✅ Mitigation planning
- ✅ Real-time updates

### GlobalAnalyticsEnhanced
- ✅ Interactive world map
- ✅ Real-time hotspots
- ✅ Federated intelligence
- ✅ Global risk scoring
- ✅ Trend analysis
- ✅ Export capabilities

---

## Migration Checklist

### For Developers
- [ ] Update any hardcoded routes in code
- [ ] Update documentation with new routes
- [ ] Test all navigation flows
- [ ] Update API calls if needed
- [ ] Clear browser cache

### For Users
- [ ] Update bookmarks to new routes
- [ ] Clear browser cache
- [ ] Test all features
- [ ] Report any issues

---

## Breaking Changes

### None!
All old routes still work with `-old` suffix. This is a non-breaking change.

### If You Want to Remove Old Versions

Edit `frontend/App.tsx` and remove these lines:
```typescript
<Route path="/dashboard-old" element={<Dashboard />} />
<Route path="/upload-real" element={<AnomalyUploadReal />} />
<Route path="/incident-old/:id" element={<IncidentDetailsPage />} />
<Route path="/analytics-old" element={<GlobalAnalyticsPage />} />
```

---

## Testing

### Test Enhanced Routes
```bash
# Dashboard
http://localhost:3000/#/dashboard

# Upload
http://localhost:3000/#/upload

# Analytics
http://localhost:3000/#/analytics

# Incident (replace :id with actual ID)
http://localhost:3000/#/incident/anom-001
```

### Test Old Routes (Still Work)
```bash
# Old Dashboard
http://localhost:3000/#/dashboard-old

# Old Upload
http://localhost:3000/#/upload-real

# Old Analytics
http://localhost:3000/#/analytics-old

# Old Incident
http://localhost:3000/#/incident-old/anom-001
```

---

## Rollback Plan

If you need to revert to old versions as default:

1. Edit `frontend/App.tsx`
2. Swap the routes back:
```typescript
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/dashboard-enhanced" element={<UserDashboardEnhanced />} />
```

3. Update `frontend/components/Sidebar.tsx`
4. Redeploy

---

## Benefits of Enhanced Versions

### Better Performance
- Optimized rendering
- Efficient data fetching
- Reduced API calls

### More Features
- Real-time updates
- Advanced visualizations
- Better UX/UI
- Mobile responsive

### Better Integration
- Works with real backend data
- Opus workflow integration
- AI service integration
- WebSocket support

---

## Support

### Issues with Enhanced Versions?
1. Check browser console for errors
2. Verify API is running
3. Check network tab for failed requests
4. Try old version to compare

### Prefer Old Versions?
You can still use them:
- Add `-old` to the route
- Or update Sidebar.tsx to point to old routes

---

## Status

✅ **Complete:** All routes migrated
✅ **Tested:** Enhanced versions verified
✅ **Backward Compatible:** Old routes still work
✅ **Production Ready:** Safe to deploy

**Last Updated:** November 18, 2024
**Version:** 3.1.0
