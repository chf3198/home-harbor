# AI Features Overview - HomeHarbor

## Executive Summary

HomeHarbor integrates **AI chat assistant, vision analysis, and AI-generated descriptions** using 100% free tier APIs. The chat assistant provides natural language property search with filter extraction.

### Data Sources & AI Stack

| Component | Provider | Model/API | Cost | Purpose |
|-----------|----------|-----------|------|---------|
| **Market Data** | Redfin Data Center | Monthly CSV exports | Free (non-commercial) | City-level market metrics |
| **Transaction Data** | Connecticut Open Data | Socrata API (2001-2023) | Free (public domain) | Property records with pricing, location, type |
| **Property Photos** | Google Maps | Street View Static API | $200/mo free ($0.007 after) | Exterior photos for any address |
| **Chat AI** | OpenRouter | Cascading free models | Free | Natural language search, customer service |
| **Vision AI** | OpenRouter | AllenAI Molmo 72B | Free | Image analysis, condition assessment, amenity detection |
| **Description AI** | OpenRouter | Llama 3.3 70B | Free | Listing descriptions and market positioning |

### Key Innovation: **Zero-Cost AI at Scale**



## AI System #1: Chat Assistant (Complete ✅)

### Purpose
Provide five-star customer service for property search. Users can describe what they're looking for in natural language, and the AI extracts search filters and provides helpful guidance.

### Architecture
```
User Message (e.g., "Show me 3 bedroom houses in Hartford under $400k")
    ↓
POST /api/chat
    ↓
Filter Extraction (server-side regex):
  - Bedrooms: /(\d+)\s*(?:bed|bedroom|br)/
  - Bathrooms: /(\d+)\s*(?:bath|bathroom|ba)/
  - Max Price: /(?:under|below|less than)\s*\$?(\d+)k?/
  - City: Match against CT cities list
    ↓
Default Values Applied:
  - minPrice: $100,000 (if not specified)
  - maxPrice: $500,000 (if not specified)
    ↓
OpenRouter LLM (cascading free models):
  → Generate conversational response
  → Five-star customer service tone
  → Direct, friendly, no exposed reasoning
    ↓
Response: { response, filters, model, extractedFields, defaultFields }
```

### System Prompt (Five-Star Customer Service)
```
You are HomeHarbor's friendly AI assistant. You provide five-star customer 
service for our real estate search platform.

CRITICAL INSTRUCTIONS:
1. You are talking DIRECTLY to the user. Use "you" and "your".
2. NEVER write "the user", "their request", or narrate in third person.
3. NEVER show your thinking process. Only output your final response.
4. Start with a direct, friendly greeting or acknowledgment.

Example Good Response:
"Great choice! A 2-bedroom home is perfect for many buyers. Do you have a 
specific Connecticut city in mind?"

Example BAD Response (NEVER do this):
"The user wants a 2-bedroom house. I should ask about their budget..."
```

### Messenger-Style UI Features
- Gradient header with "Online" status indicator
- Chat bubbles with avatars (user = blue, AI = green)
- Animated typing indicator during AI processing
- Timestamps on messages
- Auto-scroll to latest message
- Compact input bar with send/clear buttons
- Enter to send, Shift+Enter for new line
- localStorage persistence for chat history

### Test Coverage
- **Unit Tests**: chatAssistant.test.js (Jest)
- **Integration Tests**: chatAssistant.integration.test.js
- **E2E Tests**: 7 AI Chat tests in react-app.spec.js (Playwright)
- **Conversational Tests**: 3/3 prompts pass validation


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
