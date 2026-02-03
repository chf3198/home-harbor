# HomeHarbor Quick Start Guide

## 🎯 Project Overview

**HomeHarbor** is an AI-powered real estate search application built to demonstrate AWS cloud architecture skills for a Realtor.com Staff Software Engineer position. The project showcases:

- ✅ **Legal data sourcing** (no web scraping violations)
- ✅ **AWS serverless architecture** (Lambda, DynamoDB, S3, CloudFront)
- ✅ **AI integration** (OpenRouter with Molmo 72B vision + Llama 3.3 LLM)
- ✅ **Cost optimization** (~$1.50/month, mostly free tier)
- ✅ **Production-ready patterns** (caching, error handling, monitoring)

**Single-file UI requirement:** The UI must run directly from one HTML file via file://. Do not require or instruct users to run any local server to use the app.

---

## 📊 Data Sources (All Free & Legal)

| Source | Purpose | Update Frequency | Records |
|--------|---------|------------------|---------|
| **Redfin Data Center** | Market analytics (1000+ cities) | Monthly | 50K+ metrics |
| **CT Open Data** | Property transactions (Connecticut) | Weekly | 5K+ properties |
| **Google Street View** | Property exterior photos | On-demand | 500+ images |
| **OpenRouter AI** | Vision analysis + descriptions | On-demand | Unlimited |

**Key Point:** Zero ToS violations, zero legal risk, perfect for Realtor.com interview!

---

## 🚀 Deployment Steps

### Step 1: Install Dependencies

```bash
cd lambda
npm install
```

### Step 2: Setup AWS Infrastructure

```bash
cd ../infrastructure
./aws-setup.sh
```

This creates:
- ✅ S3 buckets (data + images)
- ✅ DynamoDB tables (properties, market-metrics, ai-insights)
- ✅ IAM roles with least-privilege policies
- ✅ CloudWatch log groups
- ✅ Secrets Manager secrets (placeholders)

### Step 3: Configure API Keys

```bash
# Get OpenRouter API key (FREE): https://openrouter.ai/keys
# Get Google Maps API key: https://console.cloud.google.com/apis/credentials

# Update secrets
aws secretsmanager update-secret \
  --secret-id home-harbor/api-keys-dev \
  --secret-string '{
    "OPENROUTER_API_KEY": "sk-or-v1-YOUR-KEY-HERE",
    "GOOGLE_MAPS_API_KEY": "AIzaSy-YOUR-KEY-HERE"
  }'
```

### Step 4: Deploy Lambda Functions

```bash
cd ../lambda
npm run build      # Compile TypeScript
npm run package    # Create deployment ZIPs
npm run deploy     # Upload to AWS
```

### Step 5: Test Data Ingestion

```bash
# Ingest Redfin market data (3-5 minutes)
aws lambda invoke \
  --function-name home-harbor-redfin-ingestion-dev \
  --region us-east-1 \
  /tmp/redfin-output.json

cat /tmp/redfin-output.json | jq

# Ingest CT property data (10-15 minutes)
aws lambda invoke \
  --function-name home-harbor-ct-socrata-etl-dev \
  --region us-east-1 \
  /tmp/ct-output.json

cat /tmp/ct-output.json | jq
```

### Step 6: Verify Data in DynamoDB

```bash
# Check market metrics count
aws dynamodb scan \
  --table-name home-harbor-market-metrics-dev \
  --select COUNT

# Check properties count
aws dynamodb scan \
  --table-name home-harbor-properties-dev \
  --select COUNT

# Sample property record
aws dynamodb scan \
  --table-name home-harbor-properties-dev \
  --limit 1 | jq
```

---

## ✅ Single-File UI (No Server Required)

The UI is a single HTML file and must run directly via file:// with no local server.

1. Open [public/index.html](public/index.html) in your browser.
2. Optional: update the inline `apiBaseUrl` inside the HTML (search for `HOME_HARBOR_CONFIG`) if you want to connect to API Gateway.

## 🧩 Optional API Integration (Not Required)

The single-file UI runs without any server. If you choose to connect to API Gateway for live data and AI, set `HOME_HARBOR_CONFIG.apiBaseUrl` in the HTML.

---

## 🧪 Testing AI Features

### Test Street View Image Fetch

Create test payload:
```bash
cat > /tmp/street-view-test.json <<EOF
{
  "body": "{\"property_id\":\"CT-TEST-001\",\"address\":\"1 Main St, Hartford, CT\"}"
}
EOF

# Invoke Lambda
aws lambda invoke \
  --function-name home-harbor-street-view-fetch-dev \
  --payload file:///tmp/street-view-test.json \
  /tmp/street-view-output.json

cat /tmp/street-view-output.json | jq
```

### Test Vision Analysis

```bash
cat > /tmp/vision-test.json <<EOF
{
  "body": "{\"property_id\":\"CT-TEST-001\",\"image_url\":\"https://YOUR-CLOUDFRONT-URL/properties/CT-TEST-001.jpg\"}"
}
EOF

aws lambda invoke \
  --function-name home-harbor-ai-vision-analysis-dev \
  --payload file:///tmp/vision-test.json \
  /tmp/vision-output.json

cat /tmp/vision-output.json | jq
```

### Test Description Generation

```bash
cat > /tmp/description-test.json <<EOF
{
  "body": "{\"property_id\":\"CT-TEST-001\",\"property_data\":{\"address\":\"1 Main St\",\"city\":\"Hartford\",\"state\":\"CT\",\"price\":325000,\"bedrooms\":3,\"bathrooms\":2,\"sqft\":1800}}"
}
EOF

aws lambda invoke \
  --function-name home-harbor-ai-description-generator-dev \
  --payload file:///tmp/description-test.json \
  /tmp/description-output.json

cat /tmp/description-output.json | jq
```

---

## 📅 Setup Automated Ingestion

```bash
# Get Lambda function ARN
REDFIN_ARN=$(aws lambda get-function \
  --function-name home-harbor-redfin-ingestion-dev \
  --query 'Configuration.FunctionArn' \
  --output text)

CT_ARN=$(aws lambda get-function \
  --function-name home-harbor-ct-socrata-etl-dev \
  --query 'Configuration.FunctionArn' \
  --output text)

# Create monthly Redfin ingestion schedule
aws events put-rule \
  --name home-harbor-redfin-monthly \
  --schedule-expression "cron(0 2 1 * ? *)" \
  --state ENABLED \
  --description "Ingest Redfin market data on 1st of each month"

aws events put-targets \
  --rule home-harbor-redfin-monthly \
  --targets "Id=1,Arn=${REDFIN_ARN}"

# Add Lambda permission for EventBridge
aws lambda add-permission \
  --function-name home-harbor-redfin-ingestion-dev \
  --statement-id EventBridgeInvoke \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn arn:aws:events:us-east-1:YOUR-ACCOUNT-ID:rule/home-harbor-redfin-monthly

# Create weekly CT ETL schedule
aws events put-rule \
  --name home-harbor-ct-weekly \
  --schedule-expression "cron(0 3 ? * SUN *)" \
  --state ENABLED \
  --description "Ingest CT property data every Sunday"

aws events put-targets \
  --rule home-harbor-ct-weekly \
  --targets "Id=1,Arn=${CT_ARN}"

aws lambda add-permission \
  --function-name home-harbor-ct-socrata-etl-dev \
  --statement-id EventBridgeInvoke \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn arn:aws:events:us-east-1:YOUR-ACCOUNT-ID:rule/home-harbor-ct-weekly
```

---

## 📈 Monitoring

### View Logs

```bash
# Redfin ingestion logs
aws logs tail /aws/lambda/home-harbor-redfin-ingestion-dev --follow

# CT ETL logs
aws logs tail /aws/lambda/home-harbor-ct-socrata-etl-dev --follow

# AI vision logs
aws logs tail /aws/lambda/home-harbor-ai-vision-analysis-dev --follow
```

### CloudWatch Metrics

```bash
# Lambda invocations (last hour)
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=home-harbor-redfin-ingestion-dev \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum

# DynamoDB item count
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ItemCount \
  --dimensions Name=TableName,Value=home-harbor-properties-dev \
  --start-time $(date -u -d '1 day ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Average
```

---

## 💰 Cost Breakdown

### AWS (Monthly)

| Service | Usage | Free Tier | Billable | Cost |
|---------|-------|-----------|----------|------|
| Lambda | 10 invocations | 1M requests | 0 | $0.00 |
| DynamoDB | 5K items | 25 GB storage | 0 | $0.00 |
| S3 | 500 MB | 5 GB storage | 0 | $0.00 |
| CloudFront | 1 GB transfer | 1 TB transfer | 0 | $0.00 |
| Secrets Manager | 3 secrets | 0 | 3 × $0.40 | $1.20 |
| CloudWatch | 1 GB logs | 5 GB logs | 0 | $0.00 |
| **Total** | | | | **$1.20** |

### External APIs (Monthly)

| Service | Usage | Free Tier | Cost |
|---------|-------|-----------|------|
| Google Street View | 500 requests | 25K/month | $0.00 |
| OpenRouter (Molmo) | 200 requests | Unlimited | $0.00 |
| OpenRouter (Llama) | 1000 requests | Unlimited | $0.00 |
| **Total** | | | **$0.00** |

**Grand Total: ~$1.20/month** 🎉

---

## 🎤 Interview Talking Points

### 1. Architecture Decisions

**Q: Why serverless Lambda instead of EC2?**  
**A:** "Lambda provides automatic scaling, pay-per-use pricing, and eliminates server management overhead. For this workload with infrequent batch jobs and on-demand API calls, Lambda is 95% cheaper than running 24/7 EC2 instances."

**Q: Why DynamoDB over RDS?**  
**A:** "The access patterns are simple key-value lookups and scans. DynamoDB's millisecond latency, automatic scaling, and generous free tier made it the optimal choice. For properties, I use a city-price GSI for efficient search queries."

**Q: How did you handle the lack of MLS data?**  
**A:** "Rather than violating ToS with illegal scraping, I architected a solution using 100% legal public data sources. This demonstrates both technical creativity and professional ethics—critical when working for a company like Realtor.com that relies on data partnerships."

### 2. AI Integration

**Q: Why OpenRouter instead of direct OpenAI?**  
**A:** "OpenRouter provides access to multiple models through a single API, including free options like Llama 3.3 70B. This demonstrates cost optimization while maintaining production-quality AI features."

**Q: How do you prevent expensive AI calls?**  
**A:** "Two-layer caching: DynamoDB stores AI results with TTLs (90 days for vision, 30 days for descriptions). S3 caches Street View images indefinitely. API calls only happen on cache misses."

### 3. Production Readiness

**Q: How would you handle 10,000 concurrent users?**  
**A:** "Current architecture already supports this: Lambda scales to 1000 concurrent executions per region, DynamoDB auto-scales read/write capacity, CloudFront CDN handles global traffic. I'd add API Gateway throttling and rate limiting to prevent abuse."

**Q: What about data freshness?**  
**A:** "EventBridge schedules trigger monthly Redfin updates and weekly CT data refreshes. For real-time MLS integration, I'd add a webhook endpoint that invalidates cache and triggers incremental ETL on new listing events."

### 4. Next Steps (If Given More Time)

1. **Frontend:** React SPA with property search, filters, map view
2. **API Gateway:** REST API for property search, AI analysis endpoints
3. **Elasticsearch:** Full-text search across properties and descriptions
4. **CloudFormation/CDK:** Infrastructure as Code for reproducible deployments
5. **CI/CD:** GitHub Actions pipeline with automated testing and deployment

---

## 📝 Project Status

- [x] AWS infrastructure setup automation
- [x] Data ingestion Lambda functions
  - [x] Redfin market data
  - [x] CT property transactions
- [x] AI integration Lambda functions
  - [x] Google Street View photos
  - [x] Molmo2 vision analysis
  - [x] Llama 3.3 description generation
- [x] DynamoDB schema design
- [x] S3 + CloudFront image pipeline
- [x] Secrets Manager integration
- [x] CloudWatch logging and monitoring
- [ ] API Gateway REST endpoints
- [ ] Frontend UI (React)
- [ ] Property search functionality
- [ ] Map integration (Mapbox/Google Maps)
- [ ] CI/CD pipeline

**Current Phase:** Data pipeline complete, ready for frontend development

---

## 🔗 Resources

- **Redfin Data Center:** https://www.redfin.com/news/data-center/
- **CT Open Data:** https://data.ct.gov/Housing-and-Development/Real-Estate-Sales-2001-2020-GL/5mzw-sjtu
- **Google Street View API:** https://developers.google.com/maps/documentation/streetview
- **OpenRouter:** https://openrouter.ai/docs
- **AWS Lambda:** https://docs.aws.amazon.com/lambda/
- **DynamoDB:** https://docs.aws.amazon.com/dynamodb/

---

## 🆘 Troubleshooting

### "Secret not found" error
```bash
# Verify secret exists
aws secretsmanager describe-secret --secret-id home-harbor/api-keys-dev

# If not found, run infrastructure setup again
cd infrastructure && ./aws-setup.sh
```

### Lambda timeout errors
```bash
# Increase timeout (edit deploy-lambdas.sh, then redeploy)
# Default: 300s for Redfin, 900s for CT ETL
```

### DynamoDB provisioned throughput exceeded
```bash
# Enable auto-scaling
aws application-autoscaling register-scalable-target \
  --service-namespace dynamodb \
  --resource-id "table/home-harbor-properties-dev" \
  --scalable-dimension "dynamodb:table:ReadCapacityUnits" \
  --min-capacity 5 \
  --max-capacity 100
```

### OpenRouter API rate limits
```bash
# Check usage
curl https://openrouter.ai/api/v1/auth/key \
  -H "Authorization: Bearer YOUR-API-KEY"

# Free tier: Unlimited for Llama 3.3 and Molmo
# If hitting limits, implement exponential backoff in Lambda code
```

---

**Last Updated:** January 31, 2026  
**Status:** ✅ Production-ready data pipeline  
**Next Milestone:** Frontend UI development
