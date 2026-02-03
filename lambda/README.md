# HomeHarbor - AWS Data Pipeline Implementation

This directory contains AWS Lambda functions for ingesting, processing, and enriching real estate data from legal, free public sources.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Data Sources (Free & Legal)                   │
├─────────────────────────────────────────────────────────────────┤
│  • Redfin Data Center (Market Analytics)                        │
│  • CT Open Data Portal (Transaction Records via Socrata API)    │
│  • Google Street View API (Property Photos)                     │
│  • OpenRouter AI (Vision Analysis & Descriptions)               │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Lambda Functions                            │
├─────────────────────────────────────────────────────────────────┤
│  1. redfin-ingestion        → Download & parse market data      │
│  2. ct-socrata-etl          → Fetch property transactions       │
│  3. street-view-fetch       → Get property photos               │
│  4. ai-vision-analysis      → Analyze photos with Molmo2        │
│  5. ai-description-generator → Generate listings with Llama 3.3 │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Storage Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  • S3: Raw data & images                                        │
│  • DynamoDB: properties, market_metrics, ai_insights            │
│  • CloudFront: CDN for image delivery                           │
└─────────────────────────────────────────────────────────────────┘
```

## Lambda Functions

### 1. Redfin Ingestion (`redfin-ingestion.ts`)

**Purpose:** Downloads monthly market data from Redfin Data Center  
**Trigger:** EventBridge (monthly schedule)  
**Runtime:** 3-5 minutes  
**Memory:** 512 MB

**Features:**
- Downloads TSV files from Redfin S3 bucket
- Decompresses gzip data
- Parses 100K+ market records
- Filters for recent 12 months
- Batch writes to DynamoDB
- Stores raw data in S3

**Output:** Market metrics for 1000+ cities

---

### 2. CT Socrata ETL (`ct-socrata-etl.ts`)

**Purpose:** Fetches Connecticut property transaction records  
**Trigger:** EventBridge (weekly schedule) or API Gateway  
**Runtime:** 10-15 minutes  
**Memory:** 1024 MB

**Features:**
- Socrata API integration with pagination
- Filters for arms-length residential sales
- Incremental ETL pipeline
- Geocoding support (lat/lng)
- Data quality validation
- Batch processing (1000 records/batch)

**Output:** 5000+ property transaction records

---

### 3. Street View Fetch (`street-view-fetch.ts`)

**Purpose:** Retrieves property exterior photos  
**Trigger:** API Gateway (on-demand)  
**Runtime:** 10-30 seconds  
**Memory:** 256 MB

**Features:**
- Google Street View Static API integration
- S3 image caching
- CloudFront CDN URLs
- Duplicate detection
- Free tier optimization (25K requests/month)

**Input:**
```json
{
  "property_id": "CT-12345678",
  "address": "123 Main St, Hartford, CT",
  "heading": 0,
  "pitch": 0,
  "fov": 90
}
```

**Output:**
```json
{
  "property_id": "CT-12345678",
  "image_url": "https://d123.cloudfront.net/properties/CT-12345678.jpg",
  "cached": false,
  "source": "street_view"
}
```

---

### 4. AI Vision Analysis (`ai-vision-analysis.ts`)

**Purpose:** Analyzes property photos using Molmo2-8B vision model  
**Trigger:** API Gateway (on-demand)  
**Runtime:** 30-60 seconds  
**Memory:** 512 MB

**Features:**
- OpenRouter API integration (Molmo 72B)
- Architectural style detection
- Condition assessment (1-10 scale)
- Feature extraction
- Curb appeal scoring
- DynamoDB caching (90-day TTL)

**Input:**
```json
{
  "property_id": "CT-12345678",
  "image_url": "https://example.com/image.jpg",
  "force_refresh": false
}
```

**Output:**
```json
{
  "property_id": "CT-12345678",
  "insights": {
    "architectural_style": "Colonial",
    "exterior_condition": 8,
    "visible_features": ["garage", "porch", "landscaping"],
    "curb_appeal_score": 9,
    "maintenance_level": "Low",
    "notable_highlights": ["Well-maintained exterior", "Professional landscaping"],
    "potential_concerns": []
  },
  "cached": false,
  "model": "molmo-72b"
}
```

---

### 5. AI Description Generator (`ai-description-generator.ts`)

**Purpose:** Generates compelling property descriptions  
**Trigger:** API Gateway (on-demand)  
**Runtime:** 30-60 seconds  
**Memory:** 512 MB

**Features:**
- OpenRouter API integration (Llama 3.3 70B)
- Multi-source data synthesis
- SEO-optimized copy
- Market positioning analysis
- Emotional storytelling
- DynamoDB caching (30-day TTL)

**Input:**
```json
{
  "property_id": "CT-12345678",
  "property_data": {
    "address": "123 Main St",
    "city": "Hartford",
    "state": "CT",
    "price": 325000,
    "bedrooms": 3,
    "bathrooms": 2,
    "sqft": 1800
  },
  "market_data": {
    "median_market_price": 342500,
    "median_days_on_market": 28
  },
  "vision_insights": { ... }
}
```

**Output:**
```json
{
  "property_id": "CT-12345678",
  "description": {
    "headline": "Charming Colonial in Prime Hartford Location",
    "summary": "This beautifully maintained 3-bedroom colonial offers modern comfort...",
    "highlights": [
      "Spacious 1,800 sq ft layout",
      "Professional landscaping",
      "2-car garage",
      "Prime location near schools"
    ],
    "market_position": "Priced competitively at $17,500 below market median...",
    "full_description": "Welcome to your dream home..."
  }
}
```

---

## Setup & Deployment

### Prerequisites

1. **AWS Account** with CLI configured
2. **Node.js 20+** installed
3. **API Keys:**
   - Google Maps API key (Street View Static API enabled)
   - OpenRouter API key (free tier)

### Installation

```bash
# Navigate to lambda directory
cd lambda

# Install dependencies
npm install

# Compile TypeScript
npm run build
```

### Infrastructure Setup

```bash
# Run infrastructure script to create all AWS resources
cd ../infrastructure
chmod +x aws-setup.sh
./aws-setup.sh

# Update API keys in Secrets Manager
aws secretsmanager update-secret \
  --secret-id home-harbor/api-keys-dev \
  --secret-string '{
    "OPENROUTER_API_KEY": "your-openrouter-key",
    "GOOGLE_MAPS_API_KEY": "your-google-maps-key"
  }'
```

### Lambda Deployment

```bash
# Package functions
cd ../lambda
chmod +x scripts/*.sh
npm run package

# Deploy to AWS
npm run deploy
```

### Testing

```bash
# Test Redfin ingestion
aws lambda invoke \
  --function-name home-harbor-redfin-ingestion-dev \
  --region us-east-1 \
  /tmp/redfin-output.json

# Check output
cat /tmp/redfin-output.json | jq

# Test CT ETL
aws lambda invoke \
  --function-name home-harbor-ct-socrata-etl-dev \
  --region us-east-1 \
  /tmp/ct-output.json

# Test Street View (API Gateway required)
curl -X POST https://your-api.execute-api.us-east-1.amazonaws.com/dev/street-view \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": "CT-12345678",
    "address": "123 Main St, Hartford, CT"
  }'
```

---

## EventBridge Schedules

Set up automated ingestion:

```bash
# Redfin monthly ingestion (1st day of month at 2 AM UTC)
aws events put-rule \
  --name home-harbor-redfin-monthly \
  --schedule-expression "cron(0 2 1 * ? *)" \
  --state ENABLED

aws events put-targets \
  --rule home-harbor-redfin-monthly \
  --targets "Id=1,Arn=arn:aws:lambda:us-east-1:ACCOUNT_ID:function:home-harbor-redfin-ingestion-dev"

# CT weekly ETL (Sundays at 3 AM UTC)
aws events put-rule \
  --name home-harbor-ct-weekly \
  --schedule-expression "cron(0 3 ? * SUN *)" \
  --state ENABLED

aws events put-targets \
  --rule home-harbor-ct-weekly \
  --targets "Id=1,Arn=arn:aws:lambda:us-east-1:ACCOUNT_ID:function:home-harbor-ct-socrata-etl-dev"
```

---

## Cost Estimates

### AWS Services (Monthly)

| Service | Usage | Cost |
|---------|-------|------|
| Lambda | 10 executions/month, 5 min avg | FREE (within free tier) |
| DynamoDB | 5K items, 5 RCU/WCU | FREE (within free tier) |
| S3 | 500 MB storage, 1K requests | $0.01 |
| CloudFront | 1 GB transfer | FREE (within free tier) |
| Secrets Manager | 3 secrets | $1.20 |
| CloudWatch Logs | 1 GB logs | FREE (within free tier) |
| **Total** | | **~$1.50/month** |

### External APIs (Monthly)

| Service | Usage | Cost |
|---------|-------|------|
| Google Street View | 500 requests | FREE (within 25K/month) |
| OpenRouter (Molmo 72B) | 200 requests | FREE |
| OpenRouter (Llama 3.3 70B) | 1000 requests | FREE |
| **Total** | | **$0.00** |

**Grand Total: ~$1.50/month**

---

## Data Attribution

All UI components must include proper attribution:

### Redfin
```html
<p>Market data provided by <a href="https://www.redfin.com">Redfin</a></p>
```

### CT Open Data
```html
<p>Source: State of Connecticut <a href="https://data.ct.gov">Open Data Portal</a></p>
```

### Google Street View
```html
<p>© 2026 Google</p>
```

---

## Monitoring & Logs

View Lambda logs:

```bash
# Redfin ingestion logs
aws logs tail /aws/lambda/home-harbor-redfin-ingestion-dev --follow

# CT ETL logs
aws logs tail /aws/lambda/home-harbor-ct-socrata-etl-dev --follow

# AI analysis logs
aws logs tail /aws/lambda/home-harbor-ai-vision-analysis-dev --follow
```

CloudWatch Metrics:
- Lambda invocations
- Error rates
- Duration
- Throttles
- DynamoDB read/write capacity

---

## Troubleshooting

### Issue: "API key not configured"
**Solution:** Update Secrets Manager with valid API keys

### Issue: Lambda timeout
**Solution:** Increase timeout in `deploy-lambdas.sh` and redeploy

### Issue: DynamoDB throttling
**Solution:** Enable auto-scaling or increase provisioned capacity

### Issue: Street View returns blank image
**Solution:** Location has no Street View coverage; try different coordinates

### Issue: OpenRouter rate limit
**Solution:** Reduce concurrent requests or upgrade to paid tier

---

## Development

### Adding a New Lambda Function

1. Create TypeScript file in `src/`:
```typescript
// src/my-new-function.ts
export async function handler(event: any) {
  // Your code here
}
```

2. Add to `package-lambdas.sh`:
```bash
package_function "my-new-function" "my-new-function"
```

3. Add to `deploy-lambdas.sh`:
```bash
deploy_lambda \
    "my-new-function" \
    "index.handler" \
    60 \
    256 \
    "ENV_VAR1=value1"
```

4. Deploy:
```bash
npm run package && npm run deploy
```

---

## Security Best Practices

✅ API keys stored in Secrets Manager (encrypted)  
✅ Least-privilege IAM roles  
✅ VPC integration available (optional)  
✅ CloudWatch logging enabled  
✅ Input validation on all endpoints  
✅ Rate limiting via API Gateway  
✅ No hardcoded credentials  

---

## License & Compliance

- All data sources: Public domain or permitted non-commercial use
- No Terms of Service violations
- No web scraping of prohibited sites
- Proper attribution displayed
- Educational/portfolio project

---

## Next Steps

1. ✅ Deploy infrastructure
2. ✅ Deploy Lambda functions
3. ⏳ Create API Gateway endpoints
4. ⏳ Build frontend UI
5. ⏳ Add property search functionality
6. ⏳ Integrate AI features into UI

---

**Project:** HomeHarbor  
**Purpose:** AWS portfolio demonstration for Realtor.com Staff SWE role  
**Stack:** Node.js, TypeScript, AWS Lambda, DynamoDB, S3, OpenRouter AI  
**Status:** Data pipeline implementation complete ✓
