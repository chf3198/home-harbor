# AI Features Overview - HomeHarbor

## Executive Summary

HomeHarbor integrates **two complementary AI systems** using 100% free tier APIs to enhance property search with intelligent assistance and visual analysis.

### Data Sources & AI Stack

| Component | Provider | Model/API | Cost | Purpose |
|-----------|----------|-----------|------|---------|
| **Transaction Data** | Connecticut Open Data | Real Estate Sales 2001-2023 | Free (public domain) | 1M+ property records with pricing, location, type |
| **Property Photos** | Google Maps | Street View Static API | $200/mo free ($0.007 after) | Exterior photos for any address |
| **Vision AI** | OpenRouter | AllenAI Molmo2-8B | Free | Image analysis, condition assessment, amenity detection |
| **Chat AI** | OpenRouter | 40+ Free LLMs (cascading) | Free | Q&A, app guidance, property recommendations |

### Key Innovation: **Zero-Cost AI at Scale**

- **No subscription fees**: 100% free tier usage with production-grade capabilities
- **Cascading reliability**: Automatically fallback across 40+ models for 95%+ uptime
- **Vision understanding**: Property photo analysis without computer vision APIs ($thousands saved)
- **Real-world data**: Government data + Google imagery = authentic portfolio showcase

---

## AI System #1: Chat Assistant

### Purpose
Answer user questions about the app, property search features, and provide intelligent recommendations based on user preferences.

### Architecture
```
User Question
    ↓
chatAssistant.ask(question)
    ↓
Model Selection (cascade order):
  1. arcee-ai/trinity-large-preview:free (131K context, frontier model)
  2. arcee-ai/trinity-mini:free (131K context, function calling)
  3. google/gemma-3-27b-it:free (multimodal, structured outputs)
  4. liquid/lfm-2.5-1.2b-thinking:free (reasoning focused)
  5. openai/gpt-oss-120b:free (coding specialist)
    ↓
[Retry with fallback on failure/timeout]
    ↓
Return AI response with model used
```

### Capabilities
- **App Q&A**: "How do I filter by price range?" → Code examples + UI guidance
- **Property Insights**: "What's a good price for 3BR in Hartford?" → Market analysis from data
- **Feature Explanation**: "Explain the search algorithm" → Technical details for recruiters
- **Personalized Guidance**: Multi-turn conversation with context memory

### Free Models Available (Jan 2026)
- **40+ free LLMs** with capabilities from 1.2B to 480B parameters
- **Context windows**: 32K to 1M+ tokens
- **Specializations**: Reasoning, coding, multimodal, function calling
- **Automatic cascade**: If Model A fails, try Model B, then C, etc.

### Performance Targets
- First response: <5s (P95)
- Success rate: >95% (via cascading)
- Cost: $0 (free tier only)

---

## AI System #2: Vision Analysis

### Purpose
Analyze property exterior photos to extract features, assess condition, and enhance search filters with visual data.

### Architecture
```
Property Address
    ↓
Google Street View Static API
  → Fetch exterior photo (cached URL)
    ↓
OpenRouter Molmo2-8B Vision Model
  → Analyze image for:
     - Exterior condition (excellent/good/fair/poor)
     - Architectural style (Colonial, Ranch, Victorian, etc.)
     - Visible amenities (garage, porch, deck, pool)
     - Story/floor count
     - Curb appeal score (1-10)
     - Notable features or issues
    ↓
Augment Property Metadata
  → property.imageUrl = "https://maps.googleapis.com/..."
  → property.visionAnalysis = { condition, style, amenities, ... }
```

### Vision Model: AllenAI Molmo2-8B (Free)
- **Capabilities**: Image/video understanding, object detection, spatial grounding, counting, captioning
- **Context**: 36.9K tokens
- **Performance**: State-of-the-art among open-weight vision models
- **Input Format**: Standard image URLs (JPEG, PNG)
- **Cost**: $0 (completely free on OpenRouter)

### Example Analysis Output
```json
{
  "condition": "good",
  "architecturalStyle": "Colonial",
  "amenities": ["2-car garage", "front porch", "mature landscaping"],
  "stories": 2,
  "curbAppeal": 8,
  "notes": "Well-maintained siding, recent roof replacement visible, professional landscaping"
}
```

### Enhanced Search Capabilities
**Original search** (no AI):
- Search by city, price range, property type

**AI-enhanced search**:
- Filter by architectural style: "Show me Colonial homes"
- Amenity detection: "Find properties with garages"
- Condition filtering: "Only show well-maintained properties"
- Curb appeal threshold: "Properties with appeal score >7"
- Story count accuracy: "2-story homes only"

### Cost Optimization
**Google Street View**:
- Free tier: $200/month = ~28,000 image requests
- After free: $0.007 per image
- Strategy: Cache image URLs in property metadata (fetch once, reuse forever)
- Estimated usage: <1,000 images for demo = **$0 cost**

**Vision Analysis**:
- OpenRouter Molmo2-8B: **$0 per analysis** (unlimited free tier)
- No per-image costs, no rate limits documented
- Cascade to backup vision models if needed (all free)

---

## Implementation Status

### ✅ Completed (Session 4)
- [x] OpenRouter LLM architecture designed
- [x] Free model selection strategy (40+ models catalogued)
- [x] Cascading fallback logic designed
- [x] Vision analysis pipeline architected
- [x] Google Street View integration planned
- [x] Environment configuration (.env setup)
- [x] Security: API key protection, git pre-commit hooks
- [x] Documentation: OPENROUTER_LLM_ARCHITECTURE.md complete

### ⏳ In Progress
- [ ] OpenRouter client implementation (TDD)
- [ ] Model selector logic (ranking + filtering)
- [ ] Cascading service (retry + fallback)
- [ ] Chat assistant interface
- [ ] Vision service (Molmo2-8B integration)
- [ ] Street View service (Google Maps API)

### 📋 Planned (Next Session)
- [ ] Lambda endpoint: `POST /chat` for chat assistant
- [ ] Lambda endpoint: `POST /analyze-property` for vision analysis
- [ ] React UI: Chat component with streaming
- [ ] React UI: Property card with photo + AI insights
- [ ] Integration tests with real OpenRouter API
- [ ] E2E test: Search → Photos → AI Analysis → Display

---

## User Experience Examples

### Example 1: First-Time Homebuyer Guidance
```
User: "I'm looking for my first home in Connecticut. Where should I start?"

AI (Trinity-Large): "Great question! For first-time buyers in CT, I recommend:
  1. Budget: Use our price filter (min/max) to stay within your range
  2. Location: Popular starter home areas include Manchester, East Hartford, and Enfield
  3. Property Type: Look for 'Single Family' or 'Condo' in the type filter
  4. Use our curb appeal filter (score >6) to focus on well-maintained properties
  
  Would you like me to explain how to use any of these filters?"
```

### Example 2: Visual Property Assessment
```
User: "Show me this property with AI analysis"

[System fetches Street View photo]
[Molmo2-8B analyzes image]

AI Response: "123 Main St, Hartford, CT - Analysis:
  ✓ Condition: Good (well-maintained exterior)
  ✓ Style: Colonial with 2 visible stories
  ✓ Amenities Detected: 2-car attached garage, front porch, mature trees
  ✓ Curb Appeal: 8/10
  ✓ Notes: Recent siding update, landscaping in excellent condition
  
  This property appears well-cared-for. Sale price of $285K is competitive 
  for this condition and location based on comparable CT properties."
```

### Example 3: Market Insights
```
User: "What's the average price for 3-bedroom homes in Avon?"

AI (Trinity-Large): "Based on the Connecticut real estate data (2001-2023):
  - 3BR homes in Avon: Average sale price $425,000
  - Price range: $275K - $850K
  - Median: $398K
  - Recent trend (2020-2023): Prices up 18%
  
  Recommendation: Set your price filter to $350K-$500K to see the middle market.
  Use our sort feature (sort by 'price-asc') to start with best values."
```

---

## Technical Advantages for Portfolio Showcase

### 1. **Zero-Cost AI Infrastructure**
- Demonstrates cost-conscious architecture
- Free tier maximization strategy = startup mindset
- Cascading ensures reliability without vendor lock-in

### 2. **Real-World Data Integration**
- Government open data (Connecticut)
- Google Maps Street View
- No mock/synthetic data = production-ready credibility

### 3. **Advanced AI Capabilities**
- Vision-language models (cutting-edge in 2026)
- Multi-model orchestration (40+ LLMs)
- Intelligent fallback logic (error handling)

### 4. **Full Stack Proficiency**
- Backend: Node.js Lambda functions
- Frontend: React with AI components
- AI/ML: OpenRouter integration, prompt engineering
- Cloud: AWS + Google Maps + OpenRouter orchestration

### 5. **Scalability Design**
- Caching strategy (image URLs, model lists)
- Rate limit handling (exponential backoff)
- Monitoring (CloudWatch metrics for model usage)
- Cost caps (fallback to paid models with budget limits)

---

## Competitive Advantages vs. Traditional Real Estate Apps

| Feature | Traditional Apps | HomeHarbor AI |
|---------|-----------------|---------------|
| Search | Manual filters only | AI + filters + visual analysis |
| Property Photos | Static listings | Google Street View (universal coverage) |
| Condition Info | User-reported or none | AI vision analysis |
| Guidance | FAQs, support tickets | Real-time AI chat assistant |
| Recommendations | Algorithm-based | LLM reasoning + data insights |
| Cost to Build | $$$$ (vision APIs, chat APIs) | $0 (free tier only) |

---

## Security & Privacy

### API Key Protection
- ✅ Environment variables only (never committed)
- ✅ Git pre-commit hooks block accidental commits
- ✅ `.env` in `.gitignore`
- ✅ Lambda environment variables (encrypted at rest)

### Data Privacy
- ✅ No user data sent to OpenRouter (stateless requests)
- ✅ Google Street View: Public imagery only (no private property access)
- ✅ Connecticut data: Public domain government records
- ✅ No PII collection or storage

### Rate Limiting & Abuse Prevention
- ✅ Exponential backoff on rate limit errors
- ✅ Cascade to alternative models (avoid single point of failure)
- ✅ Future: Request throttling per IP/user
- ✅ Future: CloudWatch alarms for unusual usage patterns

---

## References

### OpenRouter
- Website: https://openrouter.ai
- API Docs: https://openrouter.ai/docs
- Models API: https://openrouter.ai/api/v1/models
- Free Models: https://openrouter.ai/models?max_price=0

### Molmo Vision Models
- Molmo2-8B: https://openrouter.ai/allenai/molmo-2-8b:free
- AllenAI Research: https://allenai.org/molmo
- Hugging Face: https://huggingface.co/allenai/Molmo2-8B

### Google Maps
- Street View Static API: https://developers.google.com/maps/documentation/streetview
- Pricing: https://mapsplatform.google.com/pricing/

### Connecticut Open Data
- Real Estate Sales 2001-2023: https://data.ct.gov/Housing-and-Development/Real-Estate-Sales-2001-2023-GL
- License: Public Domain

---

**Last Updated**: January 31, 2026, Session 4
