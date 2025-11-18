# NewsAPI.org Integration Complete

## Overview

Successfully integrated NewsAPI.org (v2/everything endpoint) into the GAIA system with automatic fallback to GNews API.

## What Was Added

### 1. Updated News Fetching Function
- **Primary**: NewsAPI.org v2/everything endpoint
- **Fallback**: GNews API (if NewsAPI fails or is not configured)
- **Smart routing**: Automatically tries NewsAPI first, falls back to GNews

### 2. New API Functions

#### `fetchNewsAPIData(query, options)`
Dedicated function for NewsAPI.org with full parameter control:
```javascript
const news = await fetchNewsAPIData('bitcoin', {
  language: 'en',
  sortBy: 'publishedAt',
  pageSize: 10
});
```

#### `fetchNewsData(query, country)`
Unified function that tries NewsAPI.org first, then GNews:
```javascript
const news = await fetchNewsData('earthquake', 'us');
```

### 3. New API Endpoints

#### General News Endpoint
```
GET /api/environmental/news?query={topic}&country={code}
```
Uses NewsAPI.org with GNews fallback.

**Example**:
```bash
curl "http://localhost:3001/api/environmental/news?query=bitcoin"
```

#### NewsAPI.org Specific Endpoint
```
GET /api/environmental/news/newsapi?query={topic}&language={lang}&sortBy={sort}&pageSize={size}
```
Direct access to NewsAPI.org with full parameter control.

**Example**:
```bash
curl "http://localhost:3001/api/environmental/news/newsapi?query=earthquake&sortBy=publishedAt&pageSize=20"
```

## Response Format

NewsAPI.org returns data in this format:

```json
{
  "status": "ok",
  "totalResults": 10103,
  "articles": [
    {
      "source": {
        "id": "wired",
        "name": "Wired"
      },
      "author": "Joel Khalili",
      "title": "Inside a Wild Bitcoin Heist...",
      "description": "Sophisticated crypto scams are on the rise...",
      "url": "https://www.wired.com/story/...",
      "urlToImage": "https://media.wired.com/photos/...",
      "publishedAt": "2025-11-17T10:00:00Z",
      "content": "As Kent Halliburton stood in a bathroom..."
    }
  ]
}
```

## Configuration

### Environment Variables

Add to `backend/.env`:
```env
# NewsAPI.org (primary news source)
NEWSAPI_KEY=1d68c651803f430ca16d89967d8da37c

# GNews API (fallback)
GNEWS_API_KEY=your_gnews_key_here
```

### API Key Already Configured
The NewsAPI key is already in your `.env.example` file:
```
NEWSAPI_KEY=a59d7755ae6247de8b10ded3c32af685
```

## Testing

### Run the Test Script
```bash
cd backend
node test-newsapi.js
```

This will test:
1. Fetching Bitcoin news from NewsAPI.org
2. Using the unified news function
3. Fetching with different sort parameters

### Manual Testing with curl

```bash
# Test general news endpoint
curl "http://localhost:3001/api/environmental/news?query=bitcoin"

# Test NewsAPI.org specific endpoint
curl "http://localhost:3001/api/environmental/news/newsapi?query=earthquake&pageSize=5"

# Test with sorting
curl "http://localhost:3001/api/environmental/news/newsapi?query=climate&sortBy=relevancy"
```

## Frontend Integration

### Basic Usage
```typescript
// Fetch news articles
const response = await fetch('/api/environmental/news?query=bitcoin');
const data = await response.json();

console.log(`Found ${data.totalResults} articles`);
data.articles.forEach(article => {
  console.log(`${article.title} - ${article.source.name}`);
});
```

### Advanced Usage
```typescript
// Use NewsAPI.org with custom parameters
const response = await fetch(
  '/api/environmental/news/newsapi?' + 
  new URLSearchParams({
    query: 'earthquake',
    sortBy: 'publishedAt',
    pageSize: '20',
    language: 'en'
  })
);

const data = await response.json();

if (data.status === 'ok') {
  // Process articles
  data.articles.forEach(article => {
    console.log({
      title: article.title,
      source: article.source.name,
      published: new Date(article.publishedAt),
      url: article.url,
      image: article.urlToImage
    });
  });
}
```

## Features

### Automatic Fallback
If NewsAPI.org fails or is not configured, the system automatically falls back to GNews API, ensuring news data is always available.

### Comprehensive Data Integration
News data is automatically included in the comprehensive environmental data endpoint:
```
GET /api/environmental/comprehensive?lat=25.2048&lon=55.2708&query=dubai
```

This returns weather, air quality, earthquakes, AND news in a single request.

### Smart Caching
News data is cached appropriately to avoid hitting rate limits while keeping data fresh.

## API Limits

### NewsAPI.org
- **Free tier**: 100 requests/day
- **Developer tier**: 500 requests/day
- **Business tier**: Unlimited

### Rate Limit Handling
The system automatically:
- Falls back to GNews if NewsAPI limit is reached
- Logs warnings when APIs fail
- Returns empty arrays instead of errors

## Next Steps

1. ✅ NewsAPI.org integrated with v2/everything endpoint
2. ✅ Automatic fallback to GNews
3. ✅ New API endpoints created
4. ✅ Test script provided
5. ✅ Documentation updated

### Recommended Actions
1. Test the endpoints using the test script
2. Integrate news display into frontend components
3. Set up alerts for specific news topics
4. Monitor API usage to stay within limits

## Files Modified

- `backend/services/externalAPIs.js` - Added NewsAPI.org integration
- `backend/routes/environmental.js` - Added news endpoints
- `ENVIRONMENTAL_API_GUIDE.md` - Updated documentation

## Files Created

- `backend/test-newsapi.js` - Test script for NewsAPI
- `NEWSAPI_INTEGRATION.md` - This file

## Support

For NewsAPI.org documentation, visit: https://newsapi.org/docs/endpoints/everything

For issues or questions, check the logs in `backend/logs/api.log`
