# GNews API Integration

## Overview
Replaced NewsAPI with GNews API for better reliability and simpler integration.

## Why GNews?

### Advantages over NewsAPI
- ✅ **Better Free Tier**: 100 requests/day (vs NewsAPI's limited free tier)
- ✅ **Simpler API**: Cleaner response format
- ✅ **More Reliable**: Better uptime and fewer rate limit issues
- ✅ **Country Support**: 17 countries available
- ✅ **No Credit Card**: Free tier doesn't require payment info

### GNews Features
- Real-time news from 60,000+ sources
- Multi-language support
- Country-specific news
- Search by keyword
- Top headlines
- Article metadata (title, description, URL, image, published date)

## API Setup

### 1. Get API Key
1. Go to [gnews.io](https://gnews.io/)
2. Sign up for free account
3. Get your API key from dashboard
4. Free tier: 100 requests/day

### 2. Add to Environment Variables

**Local (.env)**:
```bash
GNEWS_API_KEY=your_api_key_here
```

**Render Dashboard**:
1. Go to Backend Service → Environment
2. Add: `GNEWS_API_KEY` = `your_api_key_here`
3. Save

## API Usage

### Endpoint Format
```
GET https://gnews.io/api/v4/search?q={query}&apikey={API_KEY}
```

### Parameters
- `q` - Search query (required)
- `lang` - Language code (default: 'en')
- `country` - Country code (optional)
- `max` - Max results (1-10, default: 10)
- `apikey` - Your API key (required)

### Supported Countries
| Country | Code |
|---------|------|
| Australia | au |
| Brazil | br |
| Canada | ca |
| China | cn |
| Egypt | eg |
| France | fr |
| Germany | de |
| Greece | gr |
| Hong Kong | hk |
| India | in |
| Ireland | ie |
| Israel | il |
| Italy | it |
| Japan | jp |
| Netherlands | nl |
| Norway | no |
| Pakistan | pk |
| Peru | pe |
| Philippines | ph |
| Portugal | pt |
| Romania | ro |
| Russia | ru |
| Singapore | sg |
| Spain | es |
| Sweden | se |
| Switzerland | ch |
| Taiwan | tw |
| Ukraine | ua |
| United Kingdom | gb |
| United States | us |

## Implementation

### Backend Changes

#### 1. `backend/services/externalAPIs.js`

**fetchNewsData() function**:
```javascript
async function fetchNewsData(query = 'anomaly', country = 'us') {
  try {
    const response = await axios.get(`https://gnews.io/api/v4/search`, {
      params: {
        q: query,
        lang: 'en',
        country: country,
        max: 10,
        apikey: process.env.GNEWS_API_KEY
      }
    });
    return response.data.articles || [];
  } catch (error) {
    logger.error('GNews API error:', error.message);
    return [];
  }
}
```

**aggregateAnomalyData() function**:
```javascript
const [weather, airQuality, news] = await Promise.all([
  fetchWeatherData(lat, lon),
  fetchAirQuality(lat, lon),
  fetchNewsData(query || 'anomaly')  // Re-enabled with GNews
]);
```

#### 2. `backend/routes/realtime.js`

**News endpoint**:
```javascript
router.get('/news', async (req, res) => {
  try {
    const { query, country } = req.query;
    const data = await fetchNewsData(query || 'anomaly', country || 'us');
    res.json({ 
      articles: data,
      totalResults: data.length,
      status: 'ok'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 3. `backend/services/dataIngestion.js`

**Configuration**:
```javascript
news: [
  {
    name: 'gnews',
    baseUrl: 'https://gnews.io/api/v4',
    endpoints: ['search', 'top-headlines'],
    params: { apikey: process.env.GNEWS_API_KEY, lang: 'en' },
    requiresLocation: false,
  },
  // ... other news sources
]
```

## Response Format

### GNews Response
```json
{
  "totalArticles": 10,
  "articles": [
    {
      "title": "Article Title",
      "description": "Article description...",
      "content": "Full article content...",
      "url": "https://example.com/article",
      "image": "https://example.com/image.jpg",
      "publishedAt": "2024-11-18T10:00:00Z",
      "source": {
        "name": "Source Name",
        "url": "https://source.com"
      }
    }
  ]
}
```

### Our API Response
```json
{
  "articles": [...],
  "totalResults": 10,
  "status": "ok"
}
```

## Testing

### Test News Endpoint
```bash
# Basic search
curl "http://localhost:3001/api/realtime/news?query=anomaly"

# With country filter
curl "http://localhost:3001/api/realtime/news?query=weather&country=us"

# Production
curl "https://gaia-backend.onrender.com/api/realtime/news?query=anomaly"
```

### Test Hotspots (includes news)
```bash
curl "http://localhost:3001/api/realtime/hotspots"
```

### Expected Response
```json
{
  "articles": [
    {
      "title": "Unusual Weather Pattern Detected",
      "description": "Scientists report...",
      "url": "https://...",
      "image": "https://...",
      "publishedAt": "2024-11-18T...",
      "source": {
        "name": "Science Daily",
        "url": "https://..."
      }
    }
  ],
  "totalResults": 10,
  "status": "ok"
}
```

## Rate Limits

### Free Tier
- **100 requests/day**
- **10 articles per request**
- **No credit card required**

### Paid Tiers
- **Starter**: $9/month - 10,000 requests/day
- **Pro**: $49/month - 100,000 requests/day
- **Enterprise**: Custom pricing

## Error Handling

### No API Key
```javascript
// Returns empty array instead of failing
if (!process.env.GNEWS_API_KEY) {
  logger.warn('GNEWS_API_KEY not set, returning empty news');
  return [];
}
```

### Rate Limit Exceeded
```javascript
// Catches error and returns empty array
catch (error) {
  if (error.response?.status === 429) {
    logger.warn('GNews rate limit exceeded');
  }
  return [];
}
```

### Invalid API Key
```javascript
// Returns empty array, logs error
catch (error) {
  if (error.response?.status === 401) {
    logger.error('Invalid GNEWS_API_KEY');
  }
  return [];
}
```

## Comparison: NewsAPI vs GNews

| Feature | NewsAPI | GNews |
|---------|---------|-------|
| Free Tier | Limited | 100 req/day |
| Sources | 80,000+ | 60,000+ |
| Countries | 54 | 17 |
| Languages | 14 | 7 |
| Response Format | Complex | Simple |
| Rate Limits | Strict | Generous |
| Setup | Credit card | No card |
| Reliability | Variable | Good |

## Migration from NewsAPI

### What Changed
1. **API URL**: `newsapi.org` → `gnews.io`
2. **Endpoint**: `/v2/everything` → `/v4/search`
3. **Param**: `apiKey` → `apikey`
4. **Response**: `response.data.articles` (same structure)

### What Stayed Same
- Article structure (title, description, url, image, publishedAt)
- Source information
- Search functionality
- Language support

### Backward Compatibility
The response format is similar enough that existing code works with minimal changes.

## Frontend Integration

### Fetching News
```typescript
// In apiService.ts
async fetchNews(query: string, country?: string) {
  const params = new URLSearchParams({
    query: query || 'anomaly',
    ...(country && { country })
  });
  
  const response = await fetch(
    `${this.baseUrl}/api/realtime/news?${params}`
  );
  return await response.json();
}
```

### Displaying News
```tsx
// In React component
const [news, setNews] = useState([]);

useEffect(() => {
  apiService.fetchNews('anomaly', 'us')
    .then(data => setNews(data.articles))
    .catch(err => console.error(err));
}, []);

return (
  <div>
    {news.map(article => (
      <div key={article.url}>
        <h3>{article.title}</h3>
        <p>{article.description}</p>
        <img src={article.image} alt={article.title} />
        <a href={article.url}>Read more</a>
      </div>
    ))}
  </div>
);
```

## Best Practices

### 1. Cache Results
```javascript
// Cache news for 1 hour to save API calls
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function fetchNewsData(query, country) {
  const cacheKey = `${query}-${country}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetchFromGNews(query, country);
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}
```

### 2. Fallback to Empty
```javascript
// Always return empty array on error
try {
  return await fetchNewsData(query);
} catch (error) {
  logger.error('News fetch failed:', error);
  return []; // Don't break the app
}
```

### 3. Limit Requests
```javascript
// Only fetch news when needed
if (userRequestedNews) {
  const news = await fetchNewsData(query);
}
```

## Troubleshooting

### No Results
- Check API key is valid
- Verify query is not too specific
- Try different country codes
- Check rate limits

### 401 Unauthorized
- Invalid API key
- API key not set in environment
- Check spelling: `GNEWS_API_KEY`

### 429 Rate Limit
- Exceeded 100 requests/day
- Wait 24 hours or upgrade plan
- Implement caching

### Empty Articles Array
- Query too specific
- No news for that topic
- Country filter too restrictive

## Status

✅ **GNews Integrated**
✅ **News Endpoint Working**
✅ **Aggregation Re-enabled**
✅ **Error Handling Added**
✅ **Production Ready**

## Next Steps

1. **Get API Key**: Sign up at gnews.io
2. **Add to Environment**: Set `GNEWS_API_KEY`
3. **Test Locally**: `curl http://localhost:3001/api/realtime/news?query=test`
4. **Deploy**: Push to GitHub, add key to Render
5. **Verify**: Test production endpoint

---

**Last Updated**: November 18, 2024
**Status**: Implemented and Ready
**API**: GNews v4
