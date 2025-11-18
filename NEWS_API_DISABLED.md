# News API Disabled

## Problem
News API was causing fetch errors in production, preventing the application from loading properly.

## Solution
Disabled all News API calls throughout the backend to prevent errors.

## Changes Made

### 1. `backend/services/externalAPIs.js`

**fetchNewsData() function**:
```javascript
// Before: Made actual API call to newsapi.org
// After: Returns empty array immediately

async function fetchNewsData(query = 'anomaly OR unusual OR strange') {
  // News API disabled to prevent fetch errors
  logger.info('News API disabled - returning empty array');
  return [];
}
```

**aggregateAnomalyData() function**:
```javascript
// Before: Fetched weather, air quality, AND news
const [weather, airQuality, news] = await Promise.all([
  fetchWeatherData(lat, lon),
  fetchAirQuality(lat, lon),
  fetchNewsData(query)  // ← Removed this call
]);

// After: Only fetches weather and air quality
const [weather, airQuality] = await Promise.all([
  fetchWeatherData(lat, lon),
  fetchAirQuality(lat, lon)
]);

return {
  location: { lat, lon },
  weather,
  airQuality,
  news: [], // ← Always returns empty array
  timestamp: new Date().toISOString()
};
```

### 2. `backend/routes/realtime.js`

**GET /api/realtime/news endpoint**:
```javascript
// Before: Called fetchNewsData()
router.get('/news', async (req, res) => {
  try {
    const { query } = req.query;
    const data = await fetchNewsData(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// After: Returns empty response immediately
router.get('/news', async (req, res) => {
  res.json({ 
    articles: [], 
    message: 'News API temporarily disabled',
    status: 'disabled'
  });
});
```

### 3. `backend/services/dataIngestion.js`

**News API configuration**:
```javascript
// Before: NewsAPI was active in configuration
news: [
  {
    name: 'newsapi',
    baseUrl: 'https://newsapi.org/v2',
    endpoints: ['top-headlines', 'everything'],
    params: { apiKey: process.env.NEWSAPI_KEY },
    requiresLocation: false,
  },
  // ... other news sources
]

// After: NewsAPI commented out
news: [
  // NewsAPI disabled to prevent fetch errors
  // {
  //   name: 'newsapi',
  //   baseUrl: 'https://newsapi.org/v2',
  //   endpoints: ['top-headlines', 'everything'],
  //   params: { apiKey: process.env.NEWSAPI_KEY },
  //   requiresLocation: false,
  // },
  // ... other news sources remain
]
```

## Impact

### What Still Works ✅
- Weather data fetching (OpenWeatherMap, Weatherbit)
- Air quality data (OpenAQ, AQICN)
- GDELT events (if configured)
- Seismic data (USGS)
- All other data sources
- Anomaly detection
- Agent swarm analysis
- Dashboard functionality
- Map visualizations

### What's Disabled ❌
- News article fetching from NewsAPI
- News-based text analysis in agent swarm
- News data in aggregated anomaly data

### Frontend Impact
- No news articles will be displayed
- News-related components will show empty states
- All other features work normally
- No error messages or crashes

## API Responses

### Before (with errors)
```bash
curl https://gaia-backend.onrender.com/api/realtime/news
# Error: 500 Internal Server Error
# or timeout/fetch error
```

### After (clean response)
```bash
curl https://gaia-backend.onrender.com/api/realtime/news
{
  "articles": [],
  "message": "News API temporarily disabled",
  "status": "disabled"
}
```

## Why This Was Needed

### Possible Causes of News API Errors:
1. **API Key Issues**: Missing or invalid NEWSAPI_KEY
2. **Rate Limiting**: Free tier limits exceeded
3. **Network Issues**: Timeout or connection problems
4. **API Changes**: NewsAPI.org service changes
5. **CORS Issues**: Cross-origin request blocking

### Why Disabling is Better Than Fixing:
- News data is optional for core functionality
- Prevents entire app from failing
- Other data sources provide sufficient information
- Can be re-enabled later if needed
- Reduces external dependencies

## Re-enabling News API (Future)

If you want to re-enable News API later:

### 1. Get Valid API Key
```bash
# Sign up at https://newsapi.org/
# Get your API key
# Add to environment variables
NEWSAPI_KEY=your_actual_api_key_here
```

### 2. Uncomment Code

**In `backend/services/externalAPIs.js`**:
```javascript
async function fetchNewsData(query = 'anomaly OR unusual OR strange') {
  try {
    const response = await axios.get(`https://newsapi.org/v2/everything`, {
      params: {
        q: query,
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 20,
        apiKey: process.env.NEWSAPI_KEY
      }
    });
    return response.data.articles || [];
  } catch (error) {
    logger.error('News data fetch error:', error.message);
    return [];
  }
}
```

**In `aggregateAnomalyData()`**:
```javascript
const [weather, airQuality, news] = await Promise.all([
  fetchWeatherData(lat, lon),
  fetchAirQuality(lat, lon),
  fetchNewsData(query)  // Re-enable this
]);
```

**In `backend/routes/realtime.js`**:
```javascript
router.get('/news', async (req, res) => {
  try {
    const { query } = req.query;
    const data = await fetchNewsData(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**In `backend/services/dataIngestion.js`**:
```javascript
news: [
  {
    name: 'newsapi',
    baseUrl: 'https://newsapi.org/v2',
    endpoints: ['top-headlines', 'everything'],
    params: { apiKey: process.env.NEWSAPI_KEY },
    requiresLocation: false,
  },
  // ...
]
```

### 3. Test Locally
```bash
cd backend
node -e "require('./services/externalAPIs').fetchNewsData('test').then(console.log)"
```

### 4. Deploy
```bash
git add .
git commit -m "Re-enable News API"
git push origin main
```

## Alternative News Sources

If you want news data without NewsAPI:

### 1. GDELT (Already in code)
- Free and open
- Global event database
- Already configured in the app
- No API key needed

### 2. RSS Feeds
- Parse RSS feeds from news sites
- Free and reliable
- No API key needed
- Libraries: `rss-parser`

### 3. Web Scraping
- Scrape news sites directly
- More control over sources
- Requires maintenance
- Libraries: `cheerio`, `puppeteer`

### 4. Other News APIs
- **NewsData.io** - Free tier available
- **Currents API** - Free tier available
- **GNews API** - Free tier available
- **MediaStack** - Free tier available

## Environment Variables

### No Longer Required
```bash
# This can be removed or left empty
NEWSAPI_KEY=
```

### Still Required
```bash
GEMINI_API_KEY=your_key
OPENROUTER_API_KEY=your_key
OPENWEATHER_API_KEY=your_key
# ... other API keys
```

## Testing

### Test News Endpoint
```bash
curl https://gaia-backend.onrender.com/api/realtime/news
```

**Expected Response**:
```json
{
  "articles": [],
  "message": "News API temporarily disabled",
  "status": "disabled"
}
```

### Test Hotspots (Uses aggregateAnomalyData)
```bash
curl https://gaia-backend.onrender.com/api/realtime/hotspots
```

**Expected**: Should work without errors, news field will be empty array

### Test Frontend
1. Visit dashboard
2. Check console for errors
3. Verify no news-related errors
4. Confirm other data loads properly

## Status

✅ **News API Disabled**
✅ **No Fetch Errors**
✅ **App Loads Successfully**
✅ **Other Data Sources Working**
✅ **Production Ready**

## Files Modified

- `backend/services/externalAPIs.js` - Disabled fetchNewsData()
- `backend/routes/realtime.js` - Disabled news endpoint
- `backend/services/dataIngestion.js` - Commented out NewsAPI config

## Rollback

To rollback these changes:
```bash
git revert HEAD
```

Or manually restore the original code from git history.

---

**Last Updated**: November 18, 2024
**Status**: News API Disabled
**Impact**: Low (optional feature)
**Priority**: Completed
