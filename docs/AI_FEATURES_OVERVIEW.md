# AI Features Overview - HomeHarbor

## Executive Summary

HomeHarbor integrates **AI vision analysis and AI-generated descriptions** using 100% free tier APIs. A chat assistant remains planned for a later phase.

### Data Sources & AI Stack

| Component | Provider | Model/API | Cost | Purpose |
|-----------|----------|-----------|------|---------|
| **Market Data** | Redfin Data Center | Monthly CSV exports | Free (non-commercial) | City-level market metrics |
| **Transaction Data** | Connecticut Open Data | Socrata API (2001-2023) | Free (public domain) | Property records with pricing, location, type |
| **Property Photos** | Google Maps | Street View Static API | $200/mo free ($0.007 after) | Exterior photos for any address |
| **Vision AI** | OpenRouter | AllenAI Molmo 72B | Free | Image analysis, condition assessment, amenity detection |
| **Description AI** | OpenRouter | Llama 3.3 70B | Free | Listing descriptions and market positioning |

### Key Innovation: **Zero-Cost AI at Scale**



## AI System #1: Chat Assistant (Planned)

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

### Free Models Available (Jan 2026)

### Performance Targets


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

### Vision Model: AllenAI Molmo 72B (Free)

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

**AI-enhanced search**:

### Cost Optimization
**Google Street View**:

**Vision Analysis**:


## Implementation Status

### ✅ Completed (Session 5)

### ⏳ In Progress

### 📋 Planned (Next Session)


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


## Technical Advantages for Portfolio Showcase

### 1. **Zero-Cost AI Infrastructure**

### 2. **Real-World Data Integration**

### 3. **Advanced AI Capabilities**

### 4. **Full Stack Proficiency**

### 5. **Scalability Design**


## Competitive Advantages vs. Traditional Real Estate Apps

| Feature | Traditional Apps | HomeHarbor AI |
|---------|-----------------|---------------|
| Search | Manual filters only | AI + filters + visual analysis |
| Property Photos | Static listings | Google Street View (universal coverage) |
| Condition Info | User-reported or none | AI vision analysis |
| Guidance | FAQs, support tickets | Real-time AI chat assistant |
| Recommendations | Algorithm-based | LLM reasoning + data insights |
| Cost to Build | $$$$ (vision APIs, chat APIs) | $0 (free tier only) |


## Security & Privacy

### API Key Protection

### Data Privacy

### Rate Limiting & Abuse Prevention


## References

### OpenRouter

### Molmo Vision Models

### Google Maps

### Connecticut Open Data


**Last Updated**: January 31, 2026, Session 5
