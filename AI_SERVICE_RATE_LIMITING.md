# GAIA 3.1 - AI Service with Smart Rate Limiting & Fallback

## Overview
The AI Service implements intelligent rate limiting for Gemini API and automatic fallback to OpenRouter (DeepSeek R1 Chimera) when limits are exceeded. This ensures uninterrupted service while staying within free tier limits.

**Primary Model**: Gemini 2.5 Flash Lite (5/min, 20/day)  
**Fallback Model**: DeepSeek R1 Chimera via OpenRouter (unlimited, free)

See [DEEPSEEK_MODEL_INFO.md](./DEEPSEEK_MODEL_INFO.md) for detailed model information.

---

## Features

### 1. Smart Rate Limiting
- **Per-Minute Limit**: 5 requests/minute for Gemini
- **Daily Limit**: 20 requests/day for Gemini
- **Automatic Tracking**: Tracks usage in real-time
- **Auto-Reset**: Counters reset automatically

### 2. Automatic Fallback
- **Primary**: Gemini API (free tier)
- **Fallback**: OpenRouter with DeepSeek R1 Chimera (when Gemini limits exceeded)
- **Seamless**: Transparent to application code
- **No Downtime**: Instant failover
- **Advanced Reasoning**: DeepSeek R1 Chimera provides excellent analytical capabilities

### 3. Multi-Provider Support
- **Gemini**: Google's Gemini 2.5 Flash Lite
- **OpenRouter**: Multiple models available
  - `tngtech/deepseek-r1t2-chimera:free` (default)
  - DeepSeek R1 Chimera - Advanced reasoning model
  - Other models can be configured

---

## Configuration

### Environment Variables

Add to `backend/.env`:

```bash
# Primary AI Provider
GEMINI_API_KEY=your_gemini_api_key_here

# Fallback AI Provider
OPENROUTER_API_KEY=your_openrouter_api_key_here
APP_URL=http://localhost:3001
```

### Getting API Keys

#### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key
4. Add to `.env` as `GEMINI_API_KEY`

**Free Tier Limits**:
- 5 requests per minute
- 20 requests per day
- No credit card required

#### OpenRouter API Key
1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up for free account
3. Go to [Keys](https://openrouter.ai/keys)
4. Create new key
5. Add to `.env` as `OPENROUTER_API_KEY`

**Free Tier**:
- Access to free models (DeepSeek R1 Chimera)
- No rate limits on free models
- Optional: Add credits for premium models

**Why DeepSeek R1 Chimera?**
- Advanced reasoning capabilities
- Excellent for anomaly detection
- Free tier with no rate limits
- High-quality analysis

---

## How It Works

### Rate Limiting Logic

```javascript
// Check if Gemini is available
if (geminiAvailable && withinRateLimits) {
  // Use Gemini
  result = await callGemini(prompt);
} else {
  // Fallback to OpenRouter
  result = await callOpenRouter(prompt);
}
```

### Rate Limit Tracking

```javascript
{
  perMinute: {
    used: 3,
    limit: 5,
    remaining: 2
  },
  perDay: {
    used: 15,
    limit: 20,
    remaining: 5
  },
  nextMinuteReset: "2024-11-18T10:35:00Z",
  nextDayReset: "2024-11-19T10:00:00Z"
}
```

### Automatic Reset
- **Minute Counter**: Resets every 60 seconds
- **Day Counter**: Resets every 24 hours
- **Automatic**: No manual intervention needed

---

## API Endpoints

### Check AI Service Status

```bash
GET /api/ai/status
```

**Response**:
```json
{
  "success": true,
  "gemini": {
    "perMinute": {
      "used": 3,
      "limit": 5,
      "remaining": 2
    },
    "perDay": {
      "used": 15,
      "limit": 20,
      "remaining": 5
    },
    "nextMinuteReset": "2024-11-18T10:35:00Z",
    "nextDayReset": "2024-11-19T10:00:00Z"
  },
  "currentProvider": "gemini",
  "geminiAvailable": true,
  "openRouterAvailable": true,
  "timestamp": "2024-11-18T10:34:30Z"
}
```

### Get Rate Limit Details

```bash
GET /api/ai/rate-limits
```

**Response**:
```json
{
  "success": true,
  "rateLimits": {
    "perMinute": { "used": 3, "limit": 5, "remaining": 2 },
    "perDay": { "used": 15, "limit": 20, "remaining": 5 }
  },
  "providers": {
    "gemini": {
      "available": true,
      "configured": true
    },
    "openrouter": {
      "available": true,
      "configured": true
    }
  },
  "currentProvider": "gemini",
  "timestamp": "2024-11-18T10:34:30Z"
}
```

---

## Usage in Code

### Automatic (Recommended)

The AI service automatically handles provider selection:

```javascript
const { analyzeAnomalyData } = require('./services/geminiAI');

// Automatically uses Gemini or OpenRouter based on availability
const analysis = await analyzeAnomalyData(data);
console.log('Provider used:', analysis.provider); // 'gemini' or 'openrouter'
```

### Force Specific Provider

```javascript
const { generateContent } = require('./services/aiService');

// Force Gemini
const result = await generateContent(prompt, { forceProvider: 'gemini' });

// Force OpenRouter
const result = await generateContent(prompt, { forceProvider: 'openrouter' });
```

### Check Status Before Call

```javascript
const { getRateLimitStatus } = require('./services/aiService');

const status = getRateLimitStatus();

if (status.geminiAvailable) {
  console.log('Gemini available, remaining:', status.gemini.perMinute.remaining);
} else {
  console.log('Using OpenRouter fallback');
}
```

---

## Supported Operations

All AI operations support automatic fallback:

### 1. Anomaly Analysis
```javascript
const analysis = await analyzeAnomalyData({
  modalities: { text: 'data...' },
  location: { lat: 40.7, lng: -74.0 },
  timestamp: new Date(),
  sourceApis: ['reddit', 'gdelt']
});
```

### 2. Image Analysis
```javascript
const result = await analyzeImage(imageBuffer, 'photo.jpg');
```

### 3. Text Analysis
```javascript
const result = await analyzeText('Text to analyze...');
```

### 4. Report Generation
```javascript
const report = await generateReport(anomalyData, 'json');
```

### 5. Cross-Verification
```javascript
const verification = await crossVerifyData(dataSources);
```

---

## Rate Limit Scenarios

### Scenario 1: Normal Operation
```
Request 1-5: ✅ Gemini (within per-minute limit)
Request 6: ⚠️ OpenRouter (per-minute limit exceeded)
After 60 seconds: ✅ Gemini (counter reset)
```

### Scenario 2: Daily Limit Reached
```
Requests 1-20: ✅ Gemini (within daily limit)
Request 21+: ⚠️ OpenRouter (daily limit exceeded)
After 24 hours: ✅ Gemini (counter reset)
```

### Scenario 3: OpenRouter Only
```
No GEMINI_API_KEY configured
All requests: ⚠️ OpenRouter
```

### Scenario 4: Gemini Only
```
No OPENROUTER_API_KEY configured
Requests 1-5/min: ✅ Gemini
Request 6+/min: ❌ Error (no fallback)
```

---

## Monitoring

### Real-time Monitoring

```bash
# Check current status
curl http://localhost:3001/api/ai/status

# Watch rate limits
watch -n 5 'curl -s http://localhost:3001/api/ai/rate-limits | jq'
```

### Logs

Check `backend/logs/ai-service.log`:

```
info: Gemini usage: 3/min, 15/day
info: OpenRouter API call successful
warn: Gemini per-minute rate limit exceeded, switching to OpenRouter
```

### Dashboard Integration

Add to your frontend dashboard:

```typescript
const [aiStatus, setAiStatus] = useState(null);

useEffect(() => {
  const fetchStatus = async () => {
    const response = await fetch('http://localhost:3001/api/ai/status');
    const data = await response.json();
    setAiStatus(data);
  };
  
  fetchStatus();
  const interval = setInterval(fetchStatus, 30000); // Update every 30s
  return () => clearInterval(interval);
}, []);

// Display
<div>
  <h3>AI Service Status</h3>
  <p>Provider: {aiStatus?.currentProvider}</p>
  <p>Gemini Remaining: {aiStatus?.gemini?.perMinute?.remaining}/min</p>
  <p>Daily Remaining: {aiStatus?.gemini?.perDay?.remaining}/day</p>
</div>
```

---

## Cost Optimization

### Free Tier Strategy

1. **Gemini First**: Use free Gemini tier (20/day)
2. **OpenRouter Free**: Fallback to free OpenRouter models
3. **Zero Cost**: Both tiers are completely free

### Scaling Strategy

When you need more capacity:

1. **Add OpenRouter Credits**: $5-10 for thousands of requests
2. **Upgrade Gemini**: Pay-as-you-go pricing
3. **Load Balancing**: Distribute across multiple keys

### Cost Comparison

| Provider | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| Gemini | 20/day | $0.001/request | Development |
| OpenRouter (DeepSeek) | Unlimited* | - | Production |
| OpenRouter (Paid) | - | $0.0001-0.01/request | High-volume |

*Free models only (DeepSeek R1 Chimera)

---

## Troubleshooting

### Issue: "Rate limit exceeded" errors

**Solution**:
1. Check if OpenRouter is configured
2. Verify `OPENROUTER_API_KEY` in `.env`
3. Check logs: `backend/logs/ai-service.log`

### Issue: "All AI providers failed"

**Solution**:
1. Verify both API keys are valid
2. Check internet connectivity
3. Test APIs individually:
```bash
# Test Gemini
curl -X POST "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}'

# Test OpenRouter
curl -X POST "https://openrouter.ai/api/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"google/gemini-2.0-flash-exp:free","messages":[{"role":"user","content":"test"}]}'
```

### Issue: Slow responses

**Solution**:
1. OpenRouter may be slower than Gemini
2. Consider upgrading to paid tier for faster models
3. Implement caching for repeated queries

### Issue: Rate limits reset not working

**Solution**:
1. Check system time is correct
2. Restart backend server
3. Manually reset: Delete `backend/logs/ai-service.log` and restart

---

## Best Practices

### 1. Monitor Usage
- Check rate limits regularly
- Set up alerts for high usage
- Track which operations use most AI calls

### 2. Optimize Requests
- Cache results when possible
- Batch similar requests
- Use simpler prompts when appropriate

### 3. Graceful Degradation
- Handle AI failures gracefully
- Provide fallback responses
- Don't block critical operations

### 4. Cost Management
- Start with free tiers
- Monitor usage patterns
- Scale up only when needed

### 5. Testing
- Test both providers
- Simulate rate limit scenarios
- Verify fallback behavior

---

## Advanced Configuration

### Custom Rate Limits

Edit `backend/services/aiService.js`:

```javascript
const RATE_LIMITS = {
  gemini: {
    perMinute: 10,  // Increase if you have paid tier
    perDay: 100,    // Increase if you have paid tier
    // ...
  }
};
```

### Custom OpenRouter Model

```javascript
// In aiService.js
async function callOpenRouter(prompt, model = 'tngtech/deepseek-r1t2-chimera:free') {
  // Current default: DeepSeek R1 Chimera (free)
  // Other free options:
  // - 'google/gemini-2.0-flash-exp:free'
  // - 'anthropic/claude-3-haiku:free'
  // - 'meta-llama/llama-3.2-3b-instruct:free'
}
```

### Multiple API Keys

For high-volume applications, rotate between multiple keys:

```javascript
const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3
];

// Rotate keys to multiply rate limits
```

---

## Performance Metrics

### Expected Performance

| Operation | Gemini | DeepSeek (OpenRouter) | Fallback Time |
|-----------|--------|----------------------|---------------|
| Text Analysis | 1-2s | 2-5s | <100ms |
| Image Analysis | 2-4s | N/A* | <100ms |
| Report Generation | 3-5s | 4-8s | <100ms |
| Anomaly Detection | 2-3s | 3-6s | <100ms |

*DeepSeek R1 Chimera is text-only; image analysis falls back to Gemini or uses text descriptions

### Throughput

- **Gemini Only**: 5 requests/min = 300/hour (with resets)
- **With OpenRouter**: Unlimited (free models)
- **Combined**: Optimal cost/performance

---

## Migration Guide

### From Old Gemini-Only Setup

1. **Install Dependencies** (already done):
```bash
npm install axios
```

2. **Add OpenRouter Key**:
```bash
# In backend/.env
OPENROUTER_API_KEY=your_key_here
```

3. **No Code Changes Needed**:
   - Existing code works automatically
   - Fallback happens transparently

4. **Test**:
```bash
# Trigger multiple requests to test fallback
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/upload/analyze-text \
    -H "Content-Type: application/json" \
    -d '{"text":"test anomaly detection"}'
done
```

---

## Status

✅ **Implemented**: Smart rate limiting with automatic fallback
✅ **Tested**: Both providers verified
✅ **Documented**: Complete documentation provided
✅ **Production Ready**: Zero-downtime AI service

**Last Updated**: November 18, 2024
**Version**: 3.1.0
**Status**: Production Ready
