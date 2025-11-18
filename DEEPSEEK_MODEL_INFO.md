# DeepSeek R1 Chimera - AI Model Information

## Overview
DeepSeek R1 Chimera is the fallback AI model used by GAIA when Gemini rate limits are exceeded. It's available for free through OpenRouter.

---

## Model Details

### Basic Information
- **Model ID**: `tngtech/deepseek-r1t2-chimera:free`
- **Provider**: TNG Technology Consulting via OpenRouter
- **Type**: Text-only reasoning model
- **Cost**: Free (no rate limits)
- **Context Window**: 64K tokens
- **Max Output**: 8K tokens

### Capabilities
- ✅ **Advanced Reasoning**: Excellent for complex analysis
- ✅ **Anomaly Detection**: Strong pattern recognition
- ✅ **Text Analysis**: High-quality text understanding
- ✅ **Report Generation**: Detailed, structured outputs
- ✅ **Cross-Verification**: Good at comparing multiple sources
- ❌ **Image Analysis**: Text-only (no vision capabilities)

---

## Why DeepSeek R1 Chimera?

### Advantages
1. **Free & Unlimited**: No rate limits on free tier
2. **Advanced Reasoning**: Based on DeepSeek R1 architecture
3. **High Quality**: Competitive with paid models
4. **Fast Response**: Typically 2-5 seconds
5. **Reliable**: Stable and consistent performance

### Use Cases in GAIA
- Anomaly detection from text data
- Cross-verification of multiple sources
- Report generation
- Text-based threat analysis
- Pattern recognition in data
- Recommendation generation

---

## Performance Comparison

| Feature | Gemini 2.5 Flash | DeepSeek R1 Chimera |
|---------|------------------|---------------------|
| **Speed** | ⚡⚡⚡ Fast (1-2s) | ⚡⚡ Good (2-5s) |
| **Quality** | ⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Excellent |
| **Reasoning** | ⭐⭐⭐ Good | ⭐⭐⭐⭐ Advanced |
| **Vision** | ✅ Yes | ❌ No |
| **Cost** | Free (limited) | Free (unlimited) |
| **Rate Limits** | 5/min, 20/day | None |

---

## Integration in GAIA

### Automatic Fallback
```javascript
// GAIA automatically uses DeepSeek when Gemini limits exceeded
const analysis = await analyzeAnomalyData(data);

// Response includes provider info
console.log(analysis.provider); // 'gemini' or 'openrouter'
console.log(analysis.model); // 'deepseek-r1t2-chimera' when using OpenRouter
```

### When DeepSeek is Used
1. **Gemini Rate Limit**: When 5 requests/minute exceeded
2. **Daily Limit**: When 20 requests/day exceeded
3. **Gemini Error**: If Gemini API fails
4. **No Gemini Key**: If GEMINI_API_KEY not configured

### Response Format
```json
{
  "isAnomaly": true,
  "severity": "High",
  "confidence": 0.87,
  "description": "Detailed analysis...",
  "crossVerification": "Multiple sources confirm...",
  "recommendedActions": ["Action 1", "Action 2"],
  "provider": "openrouter",
  "model": "tngtech/deepseek-r1t2-chimera:free"
}
```

---

## Optimization Tips

### 1. Prompt Engineering
DeepSeek R1 Chimera responds well to structured prompts:

```javascript
// Good prompt structure
const prompt = `
Analyze the following data for anomalies:

Data: ${data}

Provide:
1. Is this an anomaly? (Yes/No)
2. Severity level (Low/Medium/High/Critical)
3. Confidence score (0-1)
4. Detailed reasoning
5. Recommended actions

Format: JSON
`;
```

### 2. Context Management
- Keep prompts focused and clear
- Provide relevant context upfront
- Use structured output formats
- Avoid unnecessary verbosity

### 3. Error Handling
```javascript
try {
  const result = await generateContent(prompt);
  if (result.provider === 'openrouter') {
    console.log('Using DeepSeek fallback');
  }
} catch (error) {
  console.error('All AI providers failed:', error);
  // Implement fallback logic
}
```

---

## Limitations

### 1. No Vision Capabilities
- Cannot analyze images directly
- For image analysis, GAIA will:
  - Try Gemini first (has vision)
  - If Gemini unavailable, use text descriptions
  - Or return error for image-only requests

### 2. Response Time
- Slightly slower than Gemini (2-5s vs 1-2s)
- Still acceptable for most use cases
- Consider caching for repeated queries

### 3. Output Format
- May require additional parsing
- JSON extraction sometimes needed
- GAIA handles this automatically

---

## Monitoring

### Check Which Model is Being Used

```bash
# Check AI service status
curl http://localhost:3001/api/ai/status

# Response shows current provider
{
  "currentProvider": "openrouter",
  "geminiAvailable": false,
  "openRouterAvailable": true
}
```

### Logs
```bash
# Check logs for model usage
tail -f backend/logs/ai-service.log

# Example log entries
info: Gemini usage: 5/min, 20/day
warn: Gemini per-minute rate limit exceeded, switching to OpenRouter
info: OpenRouter API call successful
```

---

## Alternative Models

If you want to use a different OpenRouter model, edit `backend/services/aiService.js`:

### Free Alternatives
```javascript
// Google Gemini (free)
model = 'google/gemini-2.0-flash-exp:free'

// Anthropic Claude (free)
model = 'anthropic/claude-3-haiku:free'

// Meta Llama (free)
model = 'meta-llama/llama-3.2-3b-instruct:free'

// DeepSeek R1 Chimera (current default)
model = 'tngtech/deepseek-r1t2-chimera:free'
```

### Paid Alternatives (Better Performance)
```javascript
// GPT-4 Turbo
model = 'openai/gpt-4-turbo'

// Claude 3 Opus
model = 'anthropic/claude-3-opus'

// Gemini Pro
model = 'google/gemini-pro'
```

---

## Testing

### Test DeepSeek Directly

```bash
# Force OpenRouter usage
curl -X POST http://localhost:3001/api/upload/analyze-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Unusual seismic activity detected in non-seismic zone. Multiple tremors recorded.",
    "forceProvider": "openrouter"
  }'
```

### Compare Providers

```bash
# Test with Gemini
curl -X POST http://localhost:3001/api/upload/analyze-text \
  -H "Content-Type: application/json" \
  -d '{"text": "test data", "forceProvider": "gemini"}'

# Test with DeepSeek
curl -X POST http://localhost:3001/api/upload/analyze-text \
  -H "Content-Type: application/json" \
  -d '{"text": "test data", "forceProvider": "openrouter"}'
```

---

## Best Practices

### 1. Let GAIA Choose
- Don't force a specific provider unless testing
- Automatic selection optimizes for cost and availability
- Fallback ensures no downtime

### 2. Monitor Usage
- Check rate limits regularly
- Watch for patterns in provider usage
- Adjust limits if needed

### 3. Cache Results
- Cache frequently requested analyses
- Reduce API calls
- Improve response time

### 4. Structured Prompts
- Use clear, structured prompts
- Request JSON output format
- Provide sufficient context

---

## Troubleshooting

### Issue: DeepSeek responses are slow

**Solution**:
- Normal for free tier (2-5s)
- Consider paid tier for faster models
- Implement caching for repeated queries

### Issue: JSON parsing errors

**Solution**:
- DeepSeek may include reasoning before JSON
- GAIA automatically extracts JSON
- Check logs if parsing fails consistently

### Issue: Different results from Gemini

**Solution**:
- Different models may give slightly different results
- Both are valid interpretations
- Use consensus if critical

---

## Resources

- **OpenRouter**: https://openrouter.ai/
- **DeepSeek**: https://www.deepseek.com/
- **Model Docs**: https://openrouter.ai/models/tngtech/deepseek-r1t2-chimera:free
- **API Docs**: https://openrouter.ai/docs

---

## Status

✅ **Active**: Currently used as fallback model
✅ **Tested**: Verified for all GAIA operations
✅ **Free**: No cost, no rate limits
✅ **Reliable**: Stable performance

**Last Updated**: November 18, 2024
**Model Version**: DeepSeek R1 Chimera (T2)
**Status**: Production Ready
