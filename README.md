<div align="center">
  <img src=".github/banner.svg" alt="HomeHarbor Banner" width="100%">
  
  <p>
    <a href="https://chf3198.github.io/home-harbor/"><img src="https://img.shields.io/badge/🚀%20Live%20Demo-Try%20It!-10b981?style=for-the-badge" alt="Live Demo"></a>
    <a href="#-quick-start"><img src="https://img.shields.io/badge/Quick%20Start-Guide-6366f1?style=for-the-badge" alt="Quick Start"></a>
    <a href="https://github.com/chf3198/home-harbor/releases"><img src="https://img.shields.io/github/v/release/chf3198/home-harbor?style=for-the-badge&color=6366f1" alt="Release"></a>
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
  
  <p><strong>Cost: $0.00/month</strong> • <strong>54 Tests</strong> • <strong>31 Components</strong> • <strong>5 Lambda Functions</strong> • <strong>211K+ Properties</strong></p>
</div>

---

# HomeHarbor

🏡 **AI-Powered Real Estate Search Platform** — A full-stack serverless application demonstrating modern cloud architecture, AI/LLM integration, and cost-optimized design.

## 🎯 Project Overview

HomeHarbor showcases production-grade software engineering through a working real estate search application. Users can search using **natural language** (e.g., "3 bedroom homes under $400k near Hartford") and the AI automatically extracts structured filters.

### Technical Highlights

| Category | What I Built |
|----------|-------------|
| **Cloud Architecture** | 5 Lambda functions, DynamoDB, S3, CloudFront, EventBridge |
| **AI/NLP Integration** | Natural language → structured query via LLM (OpenRouter) |
| **Cost Engineering** | $0.00/month — 100% AWS free tier |
| **Resilience** | Cascading model fallbacks, graceful degradation |
| **Frontend** | React 18 SPA + vanilla HTML option |
| **Testing** | 54 tests (Jest, Vitest, Playwright E2E) |
| **Data** | 211K+ CT property records via Socrata API |

**Status:** ✅ Fully deployed and functional

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HOMEHARBOR ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐         ┌──────────────────────────────────────────┐    │
│   │   Frontend   │         │              AWS Cloud                   │    │
│   │              │         │                                          │    │
│   │ React SPA    │◄───────►│  ┌─────────────────────────────────┐    │    │
│   │ (GitHub      │  HTTPS  │  │         API Gateway             │    │    │
│   │  Pages)      │         │  └──────────────┬──────────────────┘    │    │
│   │              │         │                 │                        │    │
│   └──────────────┘         │                 ▼                        │    │
│                            │  ┌─────────────────────────────────┐    │    │
│   User: "Show me           │  │     Lambda Functions (6)        │    │    │
│   3BR homes under          │  │  ┌─────────┐ ┌─────────────┐   │    │    │
│   $400k in Hartford"       │  │  │  Chat   │ │ Properties  │   │    │    │
│         │                  │  │  │Function │ │  (Socrata)  │   │    │    │
│         ▼                  │  │  └────┬────┘ └──────┬──────┘   │    │    │
│   ┌──────────────┐         │  │       │             │          │    │    │
│   │ AI extracts: │         │  │  ┌────▼────┐ ┌──────▼──────┐   │    │    │
│   │ beds: 3      │         │  │  │OpenRouter│ │  CT Open    │   │    │    │
│   │ maxPrice:    │         │  │  │  (LLM)  │ │  Data API   │   │    │    │
│   │   400000     │         │  │  └─────────┘ └─────────────┘   │    │    │
│   │ city:        │         │  │                                │    │    │
│   │   Hartford   │         │  │  ┌─────────┐ ┌─────────────┐   │    │    │
│   └──────────────┘         │  │  │ Analyze │ │  Describe   │   │    │    │
│                            │  │  │(Vision) │ │   (Text)    │   │    │    │
│                            │  │  └─────────┘ └─────────────┘   │    │    │
│                            │  └─────────────────────────────────┘    │    │
│                            │                                          │    │
│                            │  ┌─────────────────────────────────┐    │    │
│                            │  │         Infrastructure          │    │    │
│                            │  │  DynamoDB (cache) + S3 (images) │    │    │
│                            │  │  Secrets Manager (API keys)     │    │    │
│                            │  └─────────────────────────────────┘    │    │
│                            └──────────────────────────────────────────┘    │
│                                                                             │
│   External Data Source (Free & Legal)                                       │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │ CT Open Data Portal (Socrata API) — 211K+ property sales        │      │
│   │ Real Connecticut property transaction records from data.ct.gov  │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|----------|
| **Serverless Lambda** | Zero idle cost, auto-scaling, no server management |
| **OpenRouter for LLM** | Single API for multiple models, built-in fallbacks |
| **Socrata API (not scraping)** | Legal, reliable, structured government data |
| **React + Vanilla HTML** | SPA for rich UX, plus file:// option for demos |
| **GitHub Pages hosting** | Free, reliable, CI/CD via Actions |

---

## 📊 What We Built

### Deployed & Working ✅
- **6 Lambda Functions** — Properties, Cities, Metadata, Chat, Analyze, Describe
- **CT Open Data Socrata API** — real-time queries to 211K+ property records
- **AI-powered search** — natural language queries extract filters automatically
- **React SPA** — deployed to GitHub Pages with CI/CD
- **Production UAT testing** — automated Playwright tests against GitHub Pages

### Core Data Source
| Source | Purpose | Status |
|--------|---------|--------|
| CT Open Data (Socrata) | Property transactions | ✅ **Live** — 211K+ records |
| OpenRouter AI | Chat + Filter extraction | ✅ **Live** — Free tier |

### Code Written, Not Yet Deployed 📝
| Feature | Lambda File | Status |
|---------|-------------|--------|
| Redfin Market Data | `redfin-ingestion.ts` | Code exists, not in SAM template |
| Street View Photos | `street-view-fetch.ts` | Code exists, not in SAM template |

### Cost: $0.00/month (100% Free Tier)
- AWS Services: $0.00 (Lambda, DynamoDB, S3 — all free tier)
- External APIs: $0.00 (OpenRouter free tier)

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
├── 📂 lambda/                        # Serverless functions
│   ├── src/
│   │   ├── properties-socrata.ts   # ✅ Property search API
│   │   ├── chat.ts                 # ✅ AI chat/filter extraction
│   │   ├── analyze.ts              # ✅ AI vision analysis
│   │   ├── describe.ts             # ✅ AI descriptions
│   │   ├── redfin-ingestion.ts     # 📝 (Not deployed)
│   │   └── street-view-fetch.ts    # 📝 (Not deployed)
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

### Deployed & Working ✅

#### 1. Properties (Socrata) — `properties-socrata.ts`
Real-time property search via CT Open Data Portal
- **Endpoints:** GET /properties, GET /cities, GET /metadata
- **Features:** Filter by city, price range, property type
- **Data:** 211K+ Connecticut property transactions

#### 2. Chat — `chat.ts`
AI-powered natural language search
- **Endpoint:** POST /chat
- **Features:** Extracts search filters from conversational queries
- **Model:** OpenRouter → Llama 3.3 70B with fallbacks

#### 3. Analyze — `analyze.ts`
AI vision analysis of property photos
- **Endpoint:** POST /analyze
- **Features:** Style detection, condition scoring
- **Model:** OpenRouter → Molmo 72B vision

#### 4. Describe — `describe.ts`
AI-generated property descriptions
- **Endpoint:** POST /describe
- **Features:** SEO copy, market positioning
- **Model:** OpenRouter → Llama 3.3 70B

### Code Written, Not Yet Deployed 📝

#### Redfin Ingestion — `redfin-ingestion.ts` (291 lines)
Downloads monthly market data from Redfin Data Center
- **Status:** Code complete, not in SAM template
- **Purpose:** Market analytics for 1000+ cities

#### Street View Fetch — `street-view-fetch.ts` (294 lines)
Google Street View property exterior photos
- **Status:** Code complete, not in SAM template
- **Purpose:** Property image enrichment

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

## 🧠 Technical Deep Dive

### AI-Powered Search (The Interesting Part)

The most interesting technical challenge was converting natural language queries into structured database filters:

```
User: "Show me 3 bedroom homes under $400k near Hartford"
         │
         ▼
┌─────────────────────────────────────────┐
│  Lambda Chat Function                   │
│  ┌───────────────────────────────────┐  │
│  │ Prompt Engineering:               │  │
│  │ - CT town knowledge embedded      │  │
│  │ - Handle ambiguous queries        │  │
│  │ - Extract multiple filter types   │  │
│  └───────────────────────────────────┘  │
│                  │                      │
│                  ▼                      │
│  ┌───────────────────────────────────┐  │
│  │ OpenRouter API (with fallbacks):  │  │
│  │ 1. Try: meta-llama/llama-3.3-70b │  │
│  │ 2. Fall: google/gemini-flash     │  │
│  │ 3. Fall: anthropic/claude-haiku  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
         │
         ▼
Extracted: { beds: 3, maxPrice: 400000, city: "Hartford" }
```

### Cost Optimization Strategy

Achieving $0.00/month required careful architecture:

- **Lambda**: Only pay for execution time (free tier: 1M requests/month)
- **DynamoDB**: On-demand capacity (free tier: 25 GB storage)
- **S3**: Intelligent tiering (free tier: 5 GB)
- **OpenRouter**: Free tier models with cascading fallbacks
- **No always-on servers**: Everything is event-driven

---

## 💰 Cost Breakdown

| Service | Monthly Usage | Cost |
|---------|--------------|------|
| Lambda | 10 executions | $0.00 (free tier) |
| DynamoDB | 5K items | $0.00 (free tier) |
| S3 | 500 MB | $0.00 (free tier) |
| CloudFront | 1 GB transfer | $0.00 (free tier) |
| Google Street View | 500 requests | $0.00 (free tier) |
| OpenRouter AI | 1200 requests | $0.00 (free tier) |
| **Total** | | **$0.00/month** |

---

## 🔐 Security & Compliance

✅ API keys stored securely (Lambda environment variables)  
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
- [x] 54 test files (Jest + Vitest + Playwright)
- [x] Socrata API integration (211K+ CT properties)
- [x] AI chat filter extraction
- [x] Production UAT test suite
- [x] GitHub Pages deployment
- [ ] API Gateway REST endpoints
- [ ] Map visualization (Mapbox)

---

## 🧪 Testing

### Unit & Integration Tests
```bash
npm test              # Run Jest tests with coverage
npm run test:watch    # Watch mode for development
```

### E2E Tests (Local)
```bash
npm run test:e2e      # Run against local mock server
npm run test:e2e:ui   # Playwright UI mode
```

### Production UAT Tests
```bash
npm run test:uat      # Run against GitHub Pages
npm run test:uat:headed  # With visible browser
npm run test:uat:ui   # Playwright UI for debugging
```

The UAT suite verifies the same workflow you'd test manually:
- Page loads without errors
- AI chat responds to natural language
- Filters are extracted and applied
- Search returns real CT property data
- Network requests go to AWS Lambda

---

## 🤝 Contributing

This is a personal portfolio project. While not accepting external contributions, feel free to fork and adapt for your own learning!

---

## 👤 About the Author

**Curtis Franks** — Full-stack software engineer specializing in serverless AWS architecture and AI integration.

- 🌐 Portfolio: [curtisfranks.com](https://curtisfranks.com)
- 💼 LinkedIn: [linkedin.com/in/curtisfranks](https://linkedin.com/in/curtisfranks)
- 📧 Contact: Available on portfolio site

---

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ☕ and curiosity** | **February 2026**
