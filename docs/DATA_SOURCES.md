# HomeHarbor Data Sources Strategy

## Overview
This document outlines our data sourcing strategy using **100% legal, free, and publicly accessible** data sources. This approach ensures compliance with all Terms of Service while demonstrating robust AWS data engineering skills.

## Primary Data Sources

### 1. Redfin Data Center
**Purpose:** Market-level analytics and historical trends  
**URL:** https://www.redfin.com/news/data-center/  
**License:** Free for non-commercial use  
**Data Format:** CSV downloads, monthly updates  
**Coverage:** 1000+ markets across US

**Available Datasets:**
- Median sale prices by city/zip/neighborhood
- Inventory levels and months of supply
- Homes sold above/below list price percentages
- Days on market trends
- Price drops and competition metrics

**Update Frequency:** Monthly  
**Implementation Plan:**
- S3 bucket for raw CSV storage
- Lambda function for automated downloads
- DynamoDB tables for parsed market metrics
- EventBridge scheduler for monthly updates

---

### 2. Connecticut Open Data Portal
**Purpose:** Actual property transaction records  
**URL:** https://data.ct.gov/Housing-and-Development/Real-Estate-Sales-2001-2020-GL/5mzw-sjtu  
**License:** Public domain  
**Data Format:** Socrata API (JSON) + CSV export  
**Coverage:** All Connecticut real estate sales 2001-2020+

**Available Fields:**
- Serial Number (property ID)
- List Year, Date Recorded, Town, Address
- Assessed Value, Sale Amount, Sales Ratio
- Property Type, Residential Type
- Non Use Code (foreclosures, family transfers, etc.)

**Update Frequency:** Quarterly  
**Implementation Plan:**
- Socrata API integration via Lambda
- Incremental ETL pipeline to DynamoDB
- Geolocation enrichment via AWS Location Service
- Filter for recent arms-length transactions

---

### 3. USDA Rural Development Properties
**Purpose:** Limited active listings (government resales)  
**URL:** https://resales.sc.egov.usda.gov/RHSSingleFamilyHousing  
**License:** Public government data  
**Data Format:** Web interface (requires scraping OR manual data collection)  
**Coverage:** ~500-2000 active foreclosure/resale properties nationwide

**Available Fields:**
- Property address and location
- Asking price, bedrooms, bathrooms, square footage
- Property description and features
- Contact information for inquiries

**Update Frequency:** Daily (as properties are listed/sold)  
**Implementation Plan:**
- **Option A:** Manual CSV compilation of active listings (100-200 properties)
- **Option B:** Headless browser automation (Playwright) - USDA site has no robots.txt restrictions
- Store in DynamoDB with "active_listing" flag
- Weekly refresh via EventBridge

---

### 4. Google Street View Static API
**Purpose:** Property exterior photos  
**URL:** https://developers.google.com/maps/documentation/streetview/overview  
**License:** Free tier (25,000 requests/month)  
**Data Format:** JPEG images via API  
**Coverage:** Global street-level imagery

**Pricing:**
- First 25,000 requests/month: FREE
- Additional requests: $7 per 1,000

**Implementation Plan:**
- Lambda function to fetch images by lat/lng or address
- Cache images in S3 with property_id naming
- CloudFront distribution for fast delivery
- Lazy loading: fetch on-demand when user views property

---

### 5. Data.gov Real Estate Datasets
**Purpose:** Supplemental public data  
**URL:** https://catalog.data.gov/dataset?q=real+estate  
**License:** Public domain (varies by dataset)  
**Examples:**
- HUD housing data
- FHFA house price indexes
- Census Bureau housing statistics
- FHA loan data

**Implementation Plan:**
- One-time bulk import of relevant datasets
- Join with primary data sources via geocoding
- Enrich property records with neighborhood demographics

---

## Data Architecture

### Ingestion Pipeline
```
┌─────────────────┐
│ Redfin CSV      │──┐
│ CT Socrata API  │──┤
│ USDA Listings   │──┼──> Lambda ETL ──> DynamoDB Tables
│ Data.gov Files  │──┤                   ├─ properties
└─────────────────┘  │                   ├─ market_metrics
                     │                   ├─ transactions
┌─────────────────┐  │                   └─ neighborhoods
│ Google Street   │──┘
│ View API        │──> S3 Images ──> CloudFront CDN
└─────────────────┘
```

### DynamoDB Schema

#### `properties` Table
```json
{
  "property_id": "CT-12345678",
  "address": "123 Main St",
  "city": "Hartford",
  "state": "CT",
  "zip": "06103",
  "latitude": 41.7658,
  "longitude": -72.6734,
  "price": 325000,
  "bedrooms": 3,
  "bathrooms": 2,
  "sqft": 1800,
  "property_type": "Single Family",
  "year_built": 1995,
  "last_sale_date": "2023-08-15",
  "data_source": "ct_open_data",
  "image_url": "https://d123.cloudfront.net/CT-12345678.jpg",
  "updated_at": "2026-01-31T12:00:00Z"
}
```

#### `market_metrics` Table
```json
{
  "market_id": "Hartford-CT",
  "period": "2026-01",
  "median_sale_price": 342500,
  "inventory_count": 450,
  "median_days_on_market": 28,
  "pct_sold_above_list": 0.12,
  "data_source": "redfin",
  "updated_at": "2026-01-15T00:00:00Z"
}
```

---

## AI Enhancement Strategy

### Molmo2-8B Vision Analysis
**Input:** Property exterior photo from Google Street View  
**Output:** Structured JSON insights

**Prompt Template:**
```
Analyze this residential property photo and provide insights:
1. Architectural style (Colonial, Ranch, Victorian, etc.)
2. Exterior condition rating (1-10)
3. Visible features (garage, porch, landscaping quality)
4. Curb appeal score (1-10)
5. Estimated maintenance level required
6. Neighborhood quality indicators

Format response as JSON.
```

### OpenRouter LLM for Property Descriptions
**Model:** Llama 3.3 70B (free tier)  
**Input:** Property attributes + market metrics + vision analysis  
**Output:** Human-readable property summary

**Prompt Template:**
```
Generate a compelling property description for:
- Address: {address}
- Price: {price}
- Beds/Baths: {beds}/{baths}
- Sqft: {sqft}
- Market: {market_name}
- Median market price: {market_median}
- Vision analysis: {vision_insights}

Write 2-3 paragraphs highlighting value proposition and market positioning.
```

---

## Data Volume Estimates

### Storage Requirements
- **Redfin market data:** ~50MB/month (1000 markets × 50KB)
- **CT transactions:** ~200MB (500K records × 400 bytes)
- **USDA listings:** ~5MB (500 properties × 10KB)
- **Street View images:** ~50MB (500 images × 100KB cached)
- **Total:** ~300MB initial + 50MB/month growth

### API Call Estimates (Monthly)
- **Socrata API (CT):** ~1,000 calls (incremental updates)
- **Google Street View:** ~500 calls (new properties only)
- **OpenRouter Vision:** ~200 calls (user-triggered analysis)
- **OpenRouter LLM:** ~1,000 calls (property descriptions)
- **Total:** All within free tiers

---

## Implementation Phases

### Phase 1: Redfin Market Data (Week 1)
- [ ] Create S3 bucket `home-harbor-data-sources`
- [ ] Lambda function `redfin-csv-ingestion`
- [ ] DynamoDB table `market_metrics`
- [ ] EventBridge rule for monthly updates
- [ ] Test with 10 sample markets

### Phase 2: CT Transaction Data (Week 1-2)
- [ ] Lambda function `ct-socrata-etl`
- [ ] DynamoDB table `properties`
- [ ] Geocoding enrichment pipeline
- [ ] Dedupe and data quality checks
- [ ] Load initial 50K recent transactions

### Phase 3: USDA Listings (Week 2)
- [ ] Manual CSV compilation of 100 active listings
- [ ] Lambda function `usda-listings-sync`
- [ ] Weekly update automation
- [ ] Flag properties as `active_listing: true`

### Phase 4: Google Street View (Week 2-3)
- [ ] Lambda function `fetch-street-view-image`
- [ ] S3 image storage with lifecycle policies
- [ ] CloudFront CDN setup
- [ ] On-demand fetching via API Gateway

### Phase 5: AI Integration (Week 3)
- [ ] Lambda function `analyze-property-vision`
- [ ] Lambda function `generate-property-description`
- [ ] OpenRouter API integration
- [ ] Cache AI outputs in DynamoDB

---

## Compliance & Attribution

### Data Attribution Requirements
- **Redfin:** "Data provided by Redfin (www.redfin.com)"
- **CT Open Data:** "Source: State of Connecticut Open Data Portal"
- **USDA:** "Listings courtesy of USDA Rural Development"
- **Google:** "© [Year] Google" on all Street View images

### Terms of Service Compliance
✅ All sources permit non-commercial/educational use  
✅ No scraping of prohibited websites  
✅ All API usage within free tier limits  
✅ Proper attribution displayed in UI  
✅ No redistribution of bulk datasets  
✅ Linking to public Realtor.com listing pages only (no scraping or data reuse)
✅ Clear UI disclaimer: “HomeHarbor is not affiliated with Realtor.com”

---

## Future Enhancements (Post-Demo)

### Paid MLS Integration (Pluggable)
When project transitions to production or if budget allows:
- Bridge Interactive MLS API ($500-2000/month)
- ATTOM Data Solutions ($299-999/month)
- Integrate as separate data source module
- Primary focus remains on AWS architecture demonstration

### Additional Free Sources
- Zillow ZTRAX dataset (research access)
- CoreLogic public records (limited availability)
- County assessor websites (manual compilation)

---

## Success Metrics

### Demonstrable to Realtor.com Interviewers
1. **Data Engineering:** Multi-source ETL pipeline with S3, Lambda, DynamoDB
2. **API Design:** RESTful endpoints with proper error handling
3. **AI Innovation:** Vision + LLM analysis for property insights
4. **Scalability:** EventBridge automation, CloudFront CDN
5. **Cost Optimization:** 100% free tier usage (<$5/month)
6. **Code Quality:** Jest tests, TypeScript, ESLint

### Portfolio Impact
- Live demo with real data (not mocked)
- 500+ searchable properties with photos
- Market analytics for 1000+ cities
- AI-generated insights and descriptions
- Full AWS deployment showcase

---

**Last Updated:** January 31, 2026  
**Status:** Ready for Implementation
