# OpenRouter LLM Service Architecture

## Overview

Implement an AI chat assistant using OpenRouter API with intelligent model selection, cascading fallback, and cost optimization through free tier models.

## Requirements

1. **Dynamic Model Selection**: Query OpenRouter API for available free models
2. **Quality Ranking**: Order models by online review ratings/performance
3. **Cascade Logic**: Fallback to next best model on failure/timeout
4. **Cost Optimization**: Prioritize free models (`pricing.prompt = "0"`)
5. **Security**: Environment variable for API key (never commit)
6. **Purpose**: Answer questions about app + enhance functions with LLM access

## Research Findings

### OpenRouter Free Models (Jan 2026)

From API response at `/api/v1/models`, free models (`pricing.prompt: "0"`) include:

**Top Tier (Reasoning/Large)**:
- `arcee-ai/trinity-large-preview:free` - 131K context, efficient frontier model
- `upstage/solar-pro-3:free` - 128K context, MoE (12B active), expires 2026-03-02
- `google/gemma-3n-e4b-it:free` - Multimodal (text/image/audio), mobile-optimized

**Mid Tier (General Purpose)**:
- `liquid/lfm-2.5-1.2b-thinking:free` - 32K context, reasoning-focused, edge-capable
- `liquid/lfm-2.5-1.2b-instruct:free` - 32K context, fast on-device inference
- `arcee-ai/trinity-mini:free` - 131K context, MoE (3B active), function calling

**Specialized**:
- `nvidia/nemotron-3-nano-30b-a3b:free` - Trial only, logged prompts (privacy warning)
- `allenai/molmo-2-8b:free` - **VISION-LANGUAGE MODEL** (image/video understanding)
  - **Capabilities**: Image analysis, object detection, counting, captioning, spatial grounding
  - **Context**: 36.9K tokens
  - **Performance**: State-of-the-art among open-weight vision models
  - **Use Cases**: Property photo analysis, condition assessment, amenity detection, curb appeal scoring
  - **Input**: Accepts image URLs in message content
  - **Cost**: $0 (completely free)
- `google/gemma-3-4b-it:free` - 128K context, multimodal, 140+ languages
- `google/gemma-3-27b-it:free` - Larger Gemma, structured outputs, function calling

**Coding Specialists**:
- `openai/gpt-oss-120b:free` - 117B MoE, tool use, function calling
- `openai/gpt-oss-20b:free` - 21B MoE, lower latency
- `qwen/qwen3-coder-480b-a35b-07-25:free` - MoE coding model, 262K context

**Limitations**:
- No rating/benchmark data in API response
- Free models may have rate limits (not exposed in API)
- Some have `expiration_date` (e.g., Solar Pro expires 2026-03-02)
- Trial models may log prompts (privacy risk)

### Model Selection Strategy

**Ranking Criteria** (in order of priority):
1. **Context Window**: Prefer 100K+ for complex questions
2. **Capabilities**: Function calling, structured outputs for app integration
3. **Expiration**: Skip expired/expiring models
4. **Privacy**: Avoid trial-only models with logging warnings
5. **Specialization**: Match model to task (coding, reasoning, chat)

**Proposed Cascade Order** (Free Models):
1. `arcee-ai/trinity-large-preview:free` - Best general purpose, 131K context
2. `arcee-ai/trinity-mini:free` - Fallback, function calling, 131K context
3. `google/gemma-3-27b-it:free` - Multimodal, structured outputs
4. `liquid/lfm-2.5-1.2b-thinking:free` - Reasoning fallback
5. `openai/gpt-oss-120b:free` - Coding tasks

**Vision Model (Separate Pipeline)**:
- `allenai/molmo-2-8b:free` - Used exclusively for image analysis tasks
- Input format: `{type: "image_url", image_url: {url: "..."}}`
- Automatically selected when user asks about property photos or amenity detection

## Property Image Strategy

### Image Source: Google Street View Static API

**Decision Rationale**: (text)
├── visionService.js           # Vision-specific service (Molmo2-8B)
├── streetViewService.js       # Google Street View API client
├── config.js                  # Environment config (API keys** (only transaction metadata)
- Google Street View provides free exterior photos for any address
- Free tier: $200/month credit (~28,000 requests, more than sufficient for demo)
- Static API = no JavaScript required, simple HTTPS GET requests
- Covers most US addresses with street-level photography

**API Details**:
```javascript
// Google Street View Static API
const url = `https://maps.googleapis.com/maps/api/streetview` +
  `?size=600x400` +
  `&location=${encodeURIComponent(address)}` +
  `&key=${GOOGLE_MAPS_API_KEY}` +
  `&fov=90` +
  `&heading=0` +
  `&pitch=0`;
```

**Cost Structure**:
- Free tier: $200/month = ~28,000 requests
- After free: $0.007 per request
- Strategy: Cache image URLs in property metadata, fetch on-demand only

**Alternatives Considered & Rejected**:
- ❌ Real estate listing APIs (Zillow, Realtor.com): Require paid API keys, complex rate limits, legal restrictions
- ❌ Manual photo uploads: Not scalable, defeats "real-world data" demo value
- ❌ Mock/placeholder images: Unprofessional for portfolio showcase

### Vision AI Analysis Pipeline

**Use Cases**:
1. **Exterior Condition Assessment**: "Well-maintained" vs "Needs work"
2. **Amenity Detection**: Garage, porch, deck, pool, landscaping features
3. **Architectural Style**: Colonial, Ranch, Victorian, Contemporary, Cape Cod
4. **Story/Floor Count**: Verify listing data accuracy
5. **Curb Appeal Score**: AI-generated 1-10 rating based on appearance
6. **Neighborhood Context**: Street quality, nearby structures, tree coverage

**Implementation**:
```javascript
// 1. Fetch Street View image URL
const imageUrl = await getStreetViewUrl(property.address);

// 2. Send to Molmo2-8B vision model for analysis
const visionAnalysis = await visionService.analyzeProperty(imageUrl, {
  prompt: `Analyze this property photo and provide:
    1. Exterior condition (excellent/good/fair/poor)
    2. Architectural style
    3. Visible amenities (garage, porch, deck, etc.)
    4. Number of visible stories/floors
    5. Curb appeal score (1-10)
    6. Notable features or issues`
});

// 3. Augment property metadata
property.metadata.imageUrl = imageUrl;
property.metadata.visionAnalysis = visionAnalysis;
```

**Example Vision Response**:
```json
{
  "condition": "good",
  "architecturalStyle": "Colonial",
  "amenities": ["2-car garage", "front porch", "mature trees"],
  "stories": 2,
  "curbAppeal": 7,
  "notes": "Well-maintained siding, recent roof, landscaping needs attention"
}
```

**Benefits for User Experience**:
- **Enhanced Search**: Filter by "homes with garages" or "2-story properties"
- **Visual Confidence**: See property before scheduling viewing
- **AI Insights**: Automated condition reports supplement listing data
- **Comparative Analysis**: "Show me properties with curb appeal >7"

## Architecture Design

### Components

```
src/ai-assistant/
├── openRouterClient.js       # Low-level API client (model list, chat)
├── modelSelector.js           # Model ranking/filtering logic
├── cascadingService.js        # Retry/fallback orchestration
├── chatAssistant.js           # High-level chat interface
├── config.js                  # Environment config (API key)
├── errors.js                  # Custom error types
└── index.js                   # Barrel export
```

### Data Flow

```
User Question
    ↓
chatAssistant.ask(question)
    ↓
cascadingService.sendWithRetry(message)
    ↓
modelSelector.getBestAvailableModel()
    ↓
openRouterClient.getModels() → Filter free → Rank by criteria
    ↓
openRouterClient.sendChatMessage(model, message)
    ↓
[Success] → Return response
[Failure] → Retry with next model in cascade
    ↓
[All Failed] → Return error with attempted models
```

### Key Interfaces

```typescript
// Model interface
interface Model {
  id: string;
  name: string;
  contextLength: number;
  pricing: { prompt: string; completion: string };
  expirationDate: string | null;
  capabilities: string[];
}

// Chat message interface
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Response interface
interface ChatResponse {
  success: boolean;
  model: string;
  content: string;
  usage?: { promptTokens: number; completionTokens: number };
  error?: string;
}

// Service interface
chatAssistant.ask(question: string): Promise<ChatResponse>
```

### Error Handling

**Error Types**:
1. `NoAvailableModelsError` - No free models found
2. `RateLimitError` - Hit rate limit, retry with backoff
3. `ModelTimeoutError` - Model took too long, cascade
4. `InvalidResponseError` - Malformed response from API
5. `NetworkError` - Connection issues, retry

**Cascading Logic**:
```javascript
async function cascadeSend(message, models) {
  const attempts = [];
  
  for (const model of models) {
    try {
      const response = await sendWithTimeout(model, message, 30000);
      return { success: true, model: model.id, content: response };
    } catch (error) {
      attempts.push({ model: model.id, error: error.message });
      
      if (isRateLimitError(error)) {
        await backoff(attempts.length);
      }
      
      // Try next model
      continue;
    }
  }
  
  throw new AllModelsFailed({ attempts });
}
```

## Implementation Plan

### Phase 1: Core Infrastructure
1. Environment config (API key from `.env`)
2. OpenRouter HTTP client (fetch API)
3. Model listing with filtering (free only)
4. Basic error types

### Phase 2: Model Selection
1. Ranking algorithm (context > capabilities > expiration)
2. Caching (avoid refetching model list every request)
3. Expiration date filtering
4. Privacy warning detection

### Phase 3: Cascade Logic
1. Timeout wrapper (30s per model)
2. Retry with exponential backoff
3. Model fallback iteration
4. Attempt logging

### Phase 4: Chat Assistant
1. Conversation history management
2. System prompts for app context
3. Function calling integration (future)
4. Streaming support (future)

### Phase 5: Integration
1. Lambda handler endpoint (`POST /chat`)
2. React UI component
3. Real-time streaming UI updates
4. Usage tracking/cost monitoring

## Security Considerations

### API Key Protection
```javascript
// config.js
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY environment variable is required');
}
```

### .env File (NEVER COMMIT)
```bash
# .env

GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_KEY_HERE
# Get your key at https://console.cloud.google.com/google/maps-apis
# Enable: Street View Static API
OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_HERE
# Get your key at https://openrouter.ai/keys
```

### .gitignore (Already configured)
```
.env
.env.local
*.env
```

### Lambda Environment Variables
```yaml
# template.yaml or serverless.yml
environment:
  OPENROUTER_API_KEY: ${env:OPENROUTER_API_KEY}
```

## Testing Strategy

### Unit Tests
- Model filtering logic (free only, not expired)
- Ranking algorithm (context length sorting)
- Error handling (timeout, rate limit, network)
- Config validation (missing API key)

### Integration Tests
- Real API call to `/api/v1/models` (cached)
- Chat completion with mock responses
- Cascade retry logic
- Timeout behavior

### E2E Tests
- Full conversation flow
- Model fallback scenario
- Rate limit handling
- Usage tracking

## Cost Analysis

**Free Tier Benefits**:
- $0 per prompt token
- $0 per completion token
- Unlimited requests (subject to rate limits)

**Rate Limit Considerations**:
- OpenRouter doesn't expose rate limits in API
- Monitor 429 responses, implement exponential backoff
- Cascade to next model on sustained rate limiting

**Fallback to Paid Models** (Future):
- If all free models fail, optionally try cheap paid models
- Set cost ceiling (e., visionService, streetViewService } from './src/ai-assistant';

// === TEXT CHAT EXAMPLES ===

// Simple question
const response = await chatAssistant.ask('How do I search for properties in Avon?');
console.log(response.content);
// "To search for properties in Avon, use the searchByCity function..."

// Technical question
const techResponse = await chatAssistant.ask('Explain the repository pattern used in this app');
console.log(techResponse.model); // 'arcee-ai/trinity-large-preview:free'
console.log(techResponse.content);

// === VISION AI EXAMPLES ===

// Get Street View image for property
const property = { address: '123 Main St, Hartford, CT 06103' };
const imageUrl = await streetViewService.getImageUrl(property.address);
console.log(imageUrl);
// "https://maps.googleapis.com/maps/api/streetview?size=600x400&location=..."

// Analyze property image with AI
const analysis = await visionService.analyzeProperty(imageUrl);
console.log(analysis);
// {
//   condition: 'good',
//   architecturalStyle: 'Colonial',
//   amenities: ['garage', 'front porch'],
//   stories: 2,
//   curbAppeal: 8,
//   notes: 'Well-maintained, recent updates visible'
// }

// Bulk enhance properties with vision data
const enhancedProperties = await Promise.all(
  properties.map(async (prop) => {
    const imgUrl = await streetViewService.getImageUrl(prop.address);
    const vision = await visionService.analyzeProperty(imgUrl);
    return { ...prop, imageUrl: imgUrl, visionAnalysis: vision };
  })
);

// === ERROR HANDLING ===
// "To search for properties in Avon, use the searchByCity function..."

// Technical question
const techResponse = await chatAssistant.ask('Explain the repository pattern used in this app');
console.log(techResponse.model); // 'arcee-ai/trinity-large-preview:free'
console.log(techResponse.content);

// Error handling
try {
  const response = await chatAssistant.ask(veryLongQuestion);
8. **Video Analysis**: Use Molmo2-8B for property walkthrough videos
9. **Multi-Image Analysis**: Compare multiple property photos simultaneously
10. **Satellite View**: Integrate Google Maps satellite imagery for lot size analysis
11. **Interior Photos**: If listing APIs become available, analyze interior condition
12. **Comparative Analysis**: "Which of these 3 properties has the best curb appeal?"

## Data Sources Summary

| Data Type | Source | Cost | Coverage | Notes |
|-----------|--------|------|----------|-------|
| Transaction Data | Connecticut Open Data Portal | Free | 1M+ properties (2001-2023) | Address, price, sale date, type |
| Exterior Photos | Google Street View Static API | $200/mo free tier | Most US addresses | Street-level photography |
| Vision Analysis | OpenRouter Molmo2-8B (free) | $0 | Unlimited | Condition, style, amenities |
| Text Chat | OpenRouter Free LLMs | $0 | Unlimited (rate limited) | Q&A, app guidance |
} catch (error) {
  if (error instanceof NoAvailableModelsError) {
    console.error('All free models failed');
  }
}
```

## Performance Targets

- **First Response**: <5s (P95)
- **Cascade Attempts**: ≤3 models per request
- **Cache Hit Rate**: >80% (model list cached 1 hour)
- **Success Rate**: >95% (at least one model responds)

## Monitoring

**CloudWatch Metrics**:
- Model usage distribution
- Average response time per model
- Cascade depth (how many fallbacks)
- Error rates by error type
- Token usage tracking

**Alerts**:
- All models failing >5% of requests
- Average response time >10s
- Rate limit errors >10/minute

## Future Enhancements

1. **Streaming Responses**: Server-Sent Events for real-time chat
2. **Function Calling**: Let LLM invoke app functions (search, filter)
3. **Conversation Memory**: Persistent chat history in DynamoDB
4. **User Preferences**: Let users pick preferred models
5. **A/B Testing**: Compare model quality with user ratings
6. **Caching**: Cache common questions to reduce API calls
7. **Fallback to Paid**: Smart cost management with budget caps

## References

- OpenRouter API Docs: https://openrouter.ai/docs
- OpenRouter Models API: https://openrouter.ai/api/v1/models
- OpenRouter SDK (Beta): https://www.npmjs.com/package/@openrouter/sdk
- Cascade Pattern: Circuit Breaker + Retry (Resilience4j inspiration)
- Cost Optimization: Free Tier Maximization Strategy
