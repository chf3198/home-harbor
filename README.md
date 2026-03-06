# HomeHarbor

[![Live Demo](https://img.shields.io/badge/%F0%9F%9A%80_Live_Demo-Try_It!-10b981?style=for-the-badge)](https://chf3198.github.io/home-harbor/)
[![Release](https://img.shields.io/github/v/release/chf3198/home-harbor?style=for-the-badge&color=6366f1)](https://github.com/chf3198/home-harbor/releases)
[![License: PolyForm NC](https://img.shields.io/badge/License-PolyForm%20NC%201.0-blue?style=for-the-badge)](LICENSE)
[![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-FF9900?style=flat-square&logo=awslambda&logoColor=white)](https://aws.amazon.com/lambda/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**HomeHarbor** is an AI-powered real estate search application built on a serverless AWS architecture that costs $0/month. Users search with natural language — "3 bedroom homes under $400k near Hartford" — and the AI extracts structured filters and queries 211K+ Connecticut property records from the CT Open Data Socrata API in real time. Built with AWS Lambda (6 functions), DynamoDB, S3, CloudFront, React 18 + Vite, TypeScript, Tailwind CSS, OpenRouter (routing to Llama 3.3 70B and Molmo 72B vision), and tested with 54 tests across Jest, Vitest, and Playwright.

**Status:** ✅ Fully deployed · **Cost:** $0.00/month · **Tests:** 54 · **Components:** 31 · **Properties:** 211K+

[Live Demo](https://chf3198.github.io/home-harbor/) · [Quick Start](#quick-start) · [Architecture](#architecture) · [Lambda Functions](#lambda-functions) · [Lessons Learned](docs/LESSONS_LEARNED.md)

---

## Project Overview

HomeHarbor demonstrates production-grade software engineering through a working real estate search application:

| Category | What Was Built |
|----------|---------------|
| **Cloud Architecture** | 6 Lambda functions, DynamoDB, S3, CloudFront, EventBridge, Secrets Manager |
| **AI/NLP Integration** | Natural language → structured query filters via LLM (OpenRouter) |
| **Cost Engineering** | $0.00/month — 100% AWS free tier |
| **Resilience** | Cascading model fallbacks, graceful degradation |
| **Frontend** | React 18 SPA (31 components) + single-file HTML option |
| **Testing** | 54 tests: Jest, Vitest, Playwright E2E, production UAT |
| **Data** | 211K+ CT property records via Socrata API |

---

## Architecture

```
Frontend (React SPA on GitHub Pages)
         │ HTTPS
         ▼
   API Gateway
         │
         ▼
Lambda Functions (Node.js 20)
 ├── properties-socrata.ts  → CT Open Data Socrata API (211K+ records)
 ├── chat.ts                → OpenRouter: Llama 3.3 70B (filter extraction)
 ├── analyze.ts             → OpenRouter: Molmo 72B (vision analysis)
 ├── describe.ts            → OpenRouter: Llama 3.3 70B (property descriptions)
 ├── redfin-ingestion.ts    [code complete, not deployed]
 └── street-view-fetch.ts   [code complete, not deployed]
         │
         ▼
Infrastructure
 ├── DynamoDB  (cache)
 ├── S3        (images)
 └── Secrets Manager (API keys)
```

### AI Filter Extraction

The core technical challenge: converting natural language to structured database filters.

```
User: "Show me 3 bedroom homes under $400k near Hartford"
         │
         ▼
Lambda chat.ts — prompt engineering:
  - CT town knowledge embedded
  - Handles ambiguous queries
  - Extracts multiple filter types
         │
         ▼
OpenRouter API (cascading model fallbacks):
  1. Try:  meta-llama/llama-3.3-70b
  2. Fall: google/gemini-flash
  3. Fall: anthropic/claude-haiku
         │
         ▼
Extracted: { beds: 3, maxPrice: 400000, city: "Hartford" }
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Serverless Lambda** | Zero idle cost, auto-scaling, no server management |
| **OpenRouter for LLM** | Single API for multiple models with built-in fallbacks |
| **Socrata API (not scraping)** | Legal, reliable, structured government data |
| **React + single-file HTML** | SPA for rich UX; file:// option for demos without a server |
| **GitHub Pages hosting** | Free, reliable, CI/CD via Actions |

---

## What Was Built

### Deployed and Working

- 6 Lambda functions — Properties, Cities, Metadata, Chat, Analyze, Describe
- CT Open Data Socrata API — real-time queries to 211K+ property records
- AI-powered natural language search — queries automatically extract structured filters
- React SPA — deployed to GitHub Pages with CI/CD
- Production UAT tests — automated Playwright suite running against GitHub Pages

### Code Written, Not Yet Deployed

| Feature | Lambda File | Notes |
|---------|-------------|-------|
| Redfin Market Data | `redfin-ingestion.ts` | Code complete, not in SAM template |
| Street View Photos | `street-view-fetch.ts` | Code complete, not in SAM template |

---

## Quick Start

### 1. Deploy AWS Infrastructure

```bash
cd infrastructure
./aws-setup.sh
```

Creates S3 buckets, DynamoDB tables, IAM roles, CloudWatch logs, and Secrets Manager entries.

### 2. Configure API Keys

```bash
aws secretsmanager update-secret \
  --secret-id home-harbor/api-keys-dev \
  --secret-string '{
    "OPENROUTER_API_KEY": "sk-or-v1-YOUR-KEY",
    "GOOGLE_MAPS_API_KEY": "AIzaSy-YOUR-KEY"
  }'
```

- **OpenRouter:** [openrouter.ai/keys](https://openrouter.ai/keys) (free tier available)
- **Google Maps:** [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

### 3. Deploy Lambda Functions

```bash
cd lambda
npm install
npm run build
npm run package
npm run deploy
```

### 4. Run the UI

Open [public/index.html](public/index.html) directly in your browser. No local server required. To connect to live data, update the `HOME_HARBOR_CONFIG` block inside the HTML with your API Gateway base URL.

---

## Lambda Functions

### Deployed

| Function | File | Description |
|----------|------|-------------|
| **Properties** | `properties-socrata.ts` | Real-time property search via CT Open Data. Endpoints: GET /properties, /cities, /metadata. Filters by city, price range, property type. 211K+ records. |
| **Chat** | `chat.ts` | Natural language → structured filters via OpenRouter. POST /chat. Model: Llama 3.3 70B with cascading fallbacks. |
| **Analyze** | `analyze.ts` | AI vision analysis of property photos. POST /analyze. Style detection and condition scoring. Model: Molmo 72B. |
| **Describe** | `describe.ts` | AI-generated property descriptions. POST /describe. SEO copy and market positioning. Model: Llama 3.3 70B. |

### Code Written, Not Deployed

| Function | File | Purpose |
|----------|------|---------|
| **Redfin Ingestion** | `redfin-ingestion.ts` (291 lines) | Downloads monthly market data from Redfin Data Center |
| **Street View** | `street-view-fetch.ts` (294 lines) | Google Street View property exterior photos |

---

## Tech Stack

### AWS Services

| Service | Purpose |
|---------|---------|
| Lambda | Serverless compute (Node.js 20) |
| DynamoDB | NoSQL cache with on-demand scaling |
| S3 | Object storage for data and images |
| CloudFront | Global CDN |
| EventBridge | Scheduled automation |
| Secrets Manager | Encrypted API key storage |
| CloudWatch | Logging and monitoring |
| IAM | Least-privilege access control |

### AI and External APIs

| Service | Purpose |
|---------|---------|
| OpenRouter | LLM API gateway (free tier) |
| Llama 3.3 70B | Text generation and filter extraction |
| Molmo 72B | Vision model for image analysis |
| CT Open Data (Socrata) | 211K+ Connecticut property records |
| Google Street View | Property photo API |

### Development

| Tool | Purpose |
|------|---------|
| TypeScript 5 | Type-safe Lambda code |
| React 18 + Vite | Frontend SPA |
| Tailwind CSS 3 | Styling |
| Jest + Vitest | Unit testing |
| Playwright | E2E and production UAT |
| ESLint + Prettier | Code quality |

---

## Cost Breakdown

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

## Testing

### Unit and Integration

```bash
npm test              # Jest with coverage
npm run test:watch    # Watch mode
```

### E2E (Local)

```bash
npm run test:e2e      # Against local mock server
npm run test:e2e:ui   # Playwright UI mode
```

### Production UAT

```bash
npm run test:uat         # Against GitHub Pages
npm run test:uat:headed  # With visible browser
npm run test:uat:ui      # Playwright UI for debugging
```

The UAT suite verifies: page load, AI chat responses, filter extraction, real CT property data returned, and correct Lambda endpoint routing.

---

## Project Structure

```
home-harbor/
├── public/                   # Single-file UI (no server required)
│   └── index.html            # 1477 lines — complete UI with embedded data
├── frontend/                 # React frontend (Vite)
│   └── src/
│       ├── App.jsx
│       ├── components/       # 31 React components
│       └── hooks/
├── lambda/                   # Serverless functions (TypeScript)
│   └── src/
│       ├── properties-socrata.ts
│       ├── chat.ts
│       ├── analyze.ts
│       ├── describe.ts
│       ├── redfin-ingestion.ts
│       └── street-view-fetch.ts
├── infrastructure/
│   └── aws-setup.sh          # One-command AWS provisioning
├── tests/                    # Playwright E2E and UAT
├── data/
│   └── ct-sample.csv
└── docs/
    ├── DATA_SOURCES.md
    ├── LESSONS_LEARNED.md
    └── CHANGELOG.md
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](QUICKSTART.md) | Step-by-step deployment guide |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | What was built and why |
| [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) | Data sourcing strategy |
| [docs/LESSONS_LEARNED.md](docs/LESSONS_LEARNED.md) | Development insights and hard-won lessons |
| [lambda/README.md](lambda/README.md) | Lambda function documentation |

---

## About

**Curtis Franks** — Full-stack software engineer specializing in serverless AWS architecture and AI integration.

- Portfolio: [curtisfranks.com](https://curtisfranks.com)
- LinkedIn: [linkedin.com/in/curtisfranks](https://linkedin.com/in/curtisfranks)

---

## License

**[PolyForm Noncommercial 1.0.0](LICENSE)** — free for personal, educational, and non-commercial use. Commercial use requires a paid license. See [COMMERCIAL-LICENSE.md](COMMERCIAL-LICENSE.md) or contact [curtisfranks@gmail.com](mailto:curtisfranks@gmail.com).

© 2026 Curtis Franks
