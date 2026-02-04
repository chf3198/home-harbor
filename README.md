<div align="center">
  <img src=".github/banner.svg" alt="HomeHarbor Banner" width="100%">
  
  <p>
    <a href="#-quick-start"><img src="https://img.shields.io/badge/Quick%20Start-Guide-10b981?style=for-the-badge" alt="Quick Start"></a>
    <a href="https://github.com/chf3198/home-harbor/releases"><img src="https://img.shields.io/github/v/release/chf3198/home-harbor?style=for-the-badge&color=10b981" alt="Release"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License"></a>
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/AWS-Lambda-FF9900?style=flat-square&logo=awslambda&logoColor=white" alt="AWS Lambda">
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React">
    <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite">
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind">
    <img src="https://img.shields.io/badge/DynamoDB-4053D6?style=flat-square&logo=amazondynamodb&logoColor=white" alt="DynamoDB">
    <img src="https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest&logoColor=white" alt="Jest">
    <img src="https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white" alt="Playwright">
  </p>
  
  <p><strong>Cost: $1.50/month</strong> • <strong>44 Tests</strong> • <strong>31 Components</strong> • <strong>5 Lambda Functions</strong></p>
</div>

---

# HomeHarbor

🏡 **AI-Powered Real Estate Search Platform** built with AWS serverless architecture and legal, free data sources.

## 🎯 Project Overview

HomeHarbor is a production-ready real estate application designed to showcase AWS cloud architecture skills for a **Realtor.com Staff Software Engineer** position. The platform demonstrates:

- ✅ **Serverless AWS architecture** (Lambda, DynamoDB, S3, CloudFront)
- ✅ **Legal data sourcing** (Redfin, CT Open Data, Google Street View)
- ✅ **AI integration** (OpenRouter with Molmo 72B vision + Llama 3.3 LLM)
- ✅ **Cost optimization** (~$1.50/month operating cost)
- ✅ **Production patterns** (caching, monitoring, auto-scaling)

**Status:** ✅ Data pipeline complete | ✅ Single-file UI complete | ✅ React frontend complete

---

## 📊 What We Built

### Data Pipeline (Complete ✅)
- **5 Lambda Functions** for data ingestion, processing, and AI enhancement
- **3 DynamoDB Tables** for properties, market metrics, and AI insights
- **S3 + CloudFront** pipeline for image storage and delivery
- **EventBridge Schedules** for automated data updates
- **Realtor.com search links** via Google site search for reliable property lookup
- **City autocomplete helper** from the CT dataset

### Data Sources (100% Legal & Free)
| Source | Purpose | Records |
|--------|---------|---------|
| Redfin Data Center | Market analytics | 50K+ metrics |
| CT Open Data | Property transactions | 5K+ properties |
| Google Street View | Property photos | 500+ images |
| OpenRouter AI | Vision + descriptions | Unlimited |

### Cost: $1.50/month
- AWS Services: $1.20 (Secrets Manager only)
- External APIs: $0.00 (all within free tiers)

---

## 🚀 Quick Start

### 1. Deploy AWS Infrastructure

```bash
cd infrastructure
./aws-setup.sh
```

Creates S3 buckets, DynamoDB tables, IAM roles, CloudWatch logs, and Secrets Manager.

### 2. Configure API Keys

```bash
aws secretsmanager update-secret \
  --secret-id home-harbor/api-keys-dev \
  --secret-string '{
    "OPENROUTER_API_KEY": "sk-or-v1-YOUR-KEY",
    "GOOGLE_MAPS_API_KEY": "AIzaSy-YOUR-KEY"
  }'
```

Get keys:
- **OpenRouter:** https://openrouter.ai/keys (free)
- **Google Maps:** https://console.cloud.google.com/apis/credentials

### 3. Deploy Lambda Functions

```bash
cd lambda
npm install
npm run build
npm run package
npm run deploy
```

### 4. Test Data Ingestion

```bash
# Ingest Redfin market data
aws lambda invoke \
  --function-name home-harbor-redfin-ingestion-dev \
  /tmp/redfin-output.json

# Ingest CT property data
aws lambda invoke \
  --function-name home-harbor-ct-socrata-etl-dev \
  /tmp/ct-output.json

# View results
cat /tmp/redfin-output.json | jq
```

---

## ✅ Single-File UI (No Server Required)

The UI is delivered as a single HTML file and must run directly via file://. No local server is required or assumed.

1. Open [public/index.html](public/index.html) directly in your browser.
2. Optional: update the inline `apiBaseUrl` inside the HTML (search for `HOME_HARBOR_CONFIG`) if you want to connect to API Gateway.

## 🧩 Optional API Integration (Not Required)

The single-file UI works without any server. If you want live data + AI, provide an API base URL in the inline `HOME_HARBOR_CONFIG` block. The UI will then call API Gateway endpoints.

---

## 📁 Project Structure

```
home-harbor/
├── 📄 QUICKSTART.md                  # Deployment guide
├── 📄 IMPLEMENTATION_SUMMARY.md      # What we built
├── 📄 PROJECT_STRUCTURE.md           # File organization
│
├── 📂 public/                        # Single-file UI (no server required)
│   └── index.html                   # 1477 lines - complete UI with embedded data
│
├── 📂 frontend/                      # React frontend (Vite)
│   └── src/
│       ├── App.jsx                  # Root component
│       ├── components/              # 31 React components
│       │   ├── PropertyCard.jsx     # Property display with AI
│       │   ├── SearchSection.jsx    # Search filters
│       │   ├── ResultsSection.jsx   # Results grid
│       │   └── AIChatSection.jsx    # AI assistant
│       └── hooks/                   # Custom React hooks
│
├── 📂 data/                          # Sample dataset
│   └── ct-sample.csv                # Sample CT records
│
├── 📂 src/                           # Backend services
│   ├── server.js                    # Express API entry
│   ├── property-search/             # Property domain logic
│   └── ai-assistant/                # OpenRouter AI integration
│
├── 📂 infrastructure/                # AWS provisioning
│   └── aws-setup.sh                 # One-command setup
│
├── 📂 lambda/                        # Serverless functions (10 TypeScript files)
│   ├── src/
│   │   ├── redfin-ingestion.ts     # Market data ETL
│   │   ├── ct-socrata-etl.ts       # Property data ETL
│   │   ├── street-view-fetch.ts    # Google photos
│   │   ├── ai-vision-analysis.ts   # Molmo 72B vision
│   │   └── ai-description-generator.ts  # Llama 3.3 LLM
│   └── scripts/
│       ├── package-lambdas.sh      # Build packages
│       └── deploy-lambdas.sh       # Deploy to AWS
│
├── 📂 tests/                         # E2E tests (Playwright)
│
└── 📂 docs/                          # Documentation
    ├── DATA_SOURCES.md              # Data strategy
    ├── LESSONS_LEARNED.md           # Development insights
    └── CHANGELOG.md                 # Version history

## 🎨 Beautification (Low-Code)

The UI uses Tailwind CSS via CDN for a polished look while keeping the single-file HTML entry point intact.

## 🔗 Realtor.com Link-Outs

Each listing includes a "🔍 Find on Google → Realtor.com" link that uses Google site search to locate the property on Realtor.com. This approach is more reliable than direct URLs since CT government data lacks MLS IDs. HomeHarbor does not scrape or reuse Realtor.com data.
```

---

## 🧪 Lambda Functions

### 1. Redfin Ingestion (`redfin-ingestion.ts`)
Downloads monthly market data from Redfin Data Center
- **Trigger:** EventBridge (monthly)
- **Output:** 50K+ market metrics for 1000+ cities
- **Runtime:** 3-5 minutes

### 2. CT Socrata ETL (`ct-socrata-etl.ts`)
Fetches Connecticut property transactions via Socrata API
- **Trigger:** EventBridge (weekly)
- **Output:** 5K+ property records
- **Runtime:** 10-15 minutes

### 3. Street View Fetch (`street-view-fetch.ts`)
Retrieves Google Street View property photos
- **Trigger:** API Gateway (on-demand)
- **Caching:** S3 with CloudFront CDN
- **Cost:** Free (25K requests/month)

### 4. AI Vision Analysis (`ai-vision-analysis.ts`)
Analyzes property photos using Molmo 72B vision model
- **Trigger:** API Gateway (on-demand)
- **Features:** Style detection, condition scoring, feature extraction
- **Caching:** DynamoDB (90-day TTL)

### 5. AI Description Generator (`ai-description-generator.ts`)
Generates compelling property descriptions with Llama 3.3 70B
- **Trigger:** API Gateway (on-demand)
- **Features:** SEO-optimized copy, market positioning, storytelling
- **Caching:** DynamoDB (30-day TTL)

---

## 📈 Tech Stack

### AWS Services
- **Lambda:** Serverless compute (Node.js 20)
- **DynamoDB:** NoSQL database with auto-scaling
- **S3:** Object storage for data and images
- **CloudFront:** Global CDN for content delivery
- **EventBridge:** Scheduled automation
- **Secrets Manager:** Encrypted API key storage
- **CloudWatch:** Logging and monitoring
- **IAM:** Least-privilege access control

### AI & APIs
- **OpenRouter:** LLM API gateway (free tier)
- **Molmo2-8B:** Vision model for image analysis
- **Llama 3.3 70B:** LLM for text generation
- **Google Street View:** Property photo API

### Development Tools
- **TypeScript:** Type-safe Lambda code
- **Jest:** Unit testing
- **Playwright:** E2E testing
- **ESLint + Prettier:** Code quality

---

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Step-by-step deployment guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What we built and why
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - File organization
- **[docs/DATA_SOURCES.md](docs/DATA_SOURCES.md)** - Data sourcing strategy
- **[lambda/README.md](lambda/README.md)** - Lambda function docs

---

## 🎤 Interview Demo

**5-Minute Technical Showcase**

1. **Architecture Overview** (1 min)
   - Serverless pipeline with 5 Lambda functions
   - Multi-source data ingestion (Redfin, CT, Google)
   - AI enhancement with vision + LLM

2. **Live Data Ingestion** (1 min)
   - Invoke Redfin Lambda → Show CloudWatch logs
   - Query DynamoDB → Display market metrics

3. **AI Features** (2 min)
   - Fetch Street View photo
   - Generate vision analysis (architectural style, condition)
   - Show AI-generated property description

4. **Cost & Scalability** (1 min)
   - $1.50/month total cost (99% free tier)
   - Auto-scaling to 10K+ concurrent users
   - Production-ready monitoring

---

## 💰 Cost Breakdown

| Service | Monthly Usage | Cost |
|---------|--------------|------|
| Lambda | 10 executions | $0.00 (free tier) |
| DynamoDB | 5K items | $0.00 (free tier) |
| S3 | 500 MB | $0.00 (free tier) |
| CloudFront | 1 GB transfer | $0.00 (free tier) |
| Secrets Manager | 3 secrets | $1.20 |
| Google Street View | 500 requests | $0.00 (free tier) |
| OpenRouter AI | 1200 requests | $0.00 (free tier) |
| **Total** | | **$1.20/month** |

---

## 🔐 Security & Compliance

✅ API keys encrypted in Secrets Manager  
✅ Least-privilege IAM policies  
✅ CloudWatch logging enabled  
✅ Input validation on all endpoints  
✅ No hardcoded credentials  
✅ Legal data sources only (zero ToS violations)

---

## 🚧 Roadmap

- [x] AWS infrastructure automation
- [x] Data ingestion Lambda functions
- [x] AI integration (vision + LLM)
- [x] Comprehensive documentation
- [x] Single-file HTML UI (works via file://)
- [x] React frontend with 31 components
- [x] Property search functionality
- [x] 44 test files (Jest + Vitest + Playwright)
- [ ] API Gateway REST endpoints
- [ ] Map visualization (Mapbox)
- [ ] CI/CD pipeline (GitHub Actions)

---

## 🤝 Contributing

This is a portfolio project for a Realtor.com job application. Not accepting external contributions at this time.

---

## 📄 License

MIT License - See LICENSE file for details

---

**Built by Curtis Franks** | **For Realtor.com Staff SWE Position** | **February 2026**
