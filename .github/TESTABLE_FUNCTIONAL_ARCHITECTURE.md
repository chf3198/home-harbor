# HomeHarbor: Testable Functional Architecture

**Mission**: Build a 100% testable, purely functional real estate app using only AWS (no external accounts) with clear hierarchical structure.

**Philosophy**: Pure functions everywhere, dependency injection, isolated testable units.

---

## Database: AWS-Native (No Extra Accounts)

### YES - Everything is AWS-Only! ✅

```
Your AWS Account (840797358426)
├── Lambda Functions (your code)
├── RDS PostgreSQL (your database) 
│   └── Aurora Serverless v2 (can pause to $0)
├── DynamoDB (alternative, also yours)
├── S3 (your image storage)
└── Secrets Manager (your credentials)

NO EXTERNAL SERVICES NEEDED!
```

**You already have:**
- ✅ AWS account configured
- ✅ AWS CLI installed
- ✅ Credentials in ~/.aws/
- ✅ $100 free credits

**Everything runs in your AWS account - no Supabase, no third-party services!**

---

## Complete Tech Stack Map

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                         │
│  ─────────────────────────────────────────────────────────────  │
│  Single HTML File (index.html)                                  │
│  ├─ React 18 (CDN - unpkg.com)                                  │
│  ├─ Pure Functional Components                                  │
│  ├─ State Management (useState, useReducer)                     │
│  └─ No side effects in components (hooks only)                  │
│                                                                  │
│  Hosted: GitHub Pages (FREE forever)                            │
│  URL: https://chf3198.github.io/home-harbor/                    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               │ HTTPS Requests
                               │ (Pure fetch calls)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                          │
│  ─────────────────────────────────────────────────────────────  │
│  AWS Lambda Function URLs                                       │
│  ├─ No authentication for MVP (CORS enabled)                    │
│  ├─ Each function = single responsibility                       │
│  └─ Pure handlers (no global state)                             │
│                                                                  │
│  Functions:                                                      │
│  ├─ GET  /properties      → getProperties()                     │
│  ├─ POST /search          → searchProperties()                  │
│  ├─ POST /properties      → createProperty()                    │
│  ├─ GET  /properties/:id  → getPropertyById()                   │
│  └─ POST /favorites       → toggleFavorite()                    │
│                                                                  │
│  Deployed: AWS Lambda (us-east-2)                               │
│  Cost: FREE (1M requests/month)                                 │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               │ Pure function calls
                               │ (dependency injection)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                       │
│  ─────────────────────────────────────────────────────────────  │
│  Pure Functions (100% testable)                                 │
│  ├─ Property validation                                         │
│  ├─ Search filtering logic                                      │
│  ├─ Price calculations                                          │
│  ├─ Data transformations                                        │
│  └─ Business rules                                              │
│                                                                  │
│  No database calls here! (injected as dependencies)             │
│  All logic = pure input → output                                │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               │ Repository pattern
                               │ (injected DB client)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                          │
│  ─────────────────────────────────────────────────────────────  │
│  Repository Pattern (testable with mocks)                       │
│  ├─ PropertyRepository                                          │
│  ├─ UserRepository                                              │
│  └─ FavoriteRepository                                          │
│                                                                  │
│  Each repository = isolated, mockable                           │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               │ SQL/NoSQL queries
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PERSISTENCE LAYER                          │
│  ─────────────────────────────────────────────────────────────  │
│  AWS RDS PostgreSQL (Free Tier - 12 months)                     │
│  ├─ Tables: properties, users, favorites                        │
│  ├─ Indexes: city, price, status                                │
│  └─ Constraints: foreign keys, unique                           │
│                                                                  │
│  OR                                                              │
│                                                                  │
│  AWS DynamoDB (Pay-per-request)                                 │
│  ├─ Table: properties (id as PK)                                │
│  ├─ GSI: city-price-index                                       │
│  └─ TTL: automatic cleanup                                      │
│                                                                  │
│  Cost: FREE for 12 months, then $2/month                        │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               │ Image URLs
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STORAGE LAYER                              │
│  ─────────────────────────────────────────────────────────────  │
│  AWS S3 Bucket                                                   │
│  ├─ Bucket: homeharbor-images-840797358426                      │
│  ├─ Public read access                                          │
│  ├─ Lifecycle: delete after 90 days (cost optimization)         │
│  └─ CloudFront: optional CDN                                    │
│                                                                  │
│  Cost: FREE for 12 months (5GB), then ~$1/month                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE LAYER                       │
│  ─────────────────────────────────────────────────────────────  │
│  AWS SAM (Serverless Application Model)                         │
│  ├─ template.yaml (Infrastructure as Code)                      │
│  ├─ CloudFormation stack                                        │
│  └─ Automated deployment                                        │
│                                                                  │
│  GitHub Actions (CI/CD)                                          │
│  ├─ Automated tests on PR                                       │
│  ├─ Deploy on merge to main                                     │
│  └─ Environment variables from secrets                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Hierarchical Application Structure

```
home-harbor/
├── frontend/
│   ├── index.html                    # Entry point (52 lines)
│   ├── src/
│   │   ├── components/              # Pure functional components
│   │   │   ├── PropertyCard.js      # (30 lines)
│   │   │   ├── SearchBar.js         # (25 lines)
│   │   │   └── PropertyGrid.js      # (20 lines)
│   │   ├── hooks/                   # Custom hooks (side effects isolated)
│   │   │   ├── useProperties.js     # (35 lines)
│   │   │   └── useSearch.js         # (28 lines)
│   │   ├── utils/                   # Pure helper functions
│   │   │   ├── formatters.js        # (40 lines)
│   │   │   └── validators.js        # (35 lines)
│   │   └── api/                     # API client (side effects)
│   │       └── client.js            # (45 lines)
│   └── tests/                       # Jest tests
│       ├── components/
│       ├── hooks/
│       └── utils/
│
├── backend/
│   ├── template.yaml                # SAM/CloudFormation (92 lines)
│   ├── shared/                      # Shared code across Lambdas
│   │   ├── db/                      # Database layer
│   │   │   ├── client.js            # DB connection factory (40 lines)
│   │   │   └── repositories/        # Repository pattern
│   │   │       ├── PropertyRepository.js    # (65 lines)
│   │   │       ├── UserRepository.js        # (50 lines)
│   │   │       └── FavoriteRepository.js    # (45 lines)
│   │   ├── services/                # Business logic (pure functions)
│   │   │   ├── PropertyService.js   # (70 lines)
│   │   │   ├── SearchService.js     # (55 lines)
│   │   │   └── ValidationService.js # (60 lines)
│   │   └── utils/                   # Helper functions (pure)
│   │       ├── errors.js            # (30 lines)
│   │       ├── response.js          # (25 lines)
│   │       └── sanitize.js          # (35 lines)
│   │
│   ├── functions/                   # Lambda handlers (thin wrappers)
│   │   ├── get-properties/
│   │   │   ├── index.js             # Handler (45 lines)
│   │   │   ├── handler.test.js      # Unit tests
│   │   │   └── package.json
│   │   ├── search-properties/
│   │   │   ├── index.js             # Handler (40 lines)
│   │   │   └── handler.test.js
│   │   ├── create-property/
│   │   │   ├── index.js             # Handler (50 lines)
│   │   │   └── handler.test.js
│   │   ├── get-property-by-id/
│   │   │   ├── index.js             # Handler (35 lines)
│   │   │   └── handler.test.js
│   │   └── toggle-favorite/
│   │       ├── index.js             # Handler (38 lines)
│   │       └── handler.test.js
│   │
│   └── tests/                       # Integration tests
│       ├── integration/
│       │   ├── properties.test.js
│       │   └── search.test.js
│       └── e2e/
│           └── api.test.js
│
├── infrastructure/
│   ├── database/
│   │   ├── schema.sql               # PostgreSQL schema
│   │   └── seed.sql                 # Sample data
│   └── scripts/
│       ├── deploy.sh                # Deployment script (38 lines)
│       └── test.sh                  # Run all tests
│
├── .github/
│   └── workflows/
│       ├── test.yml                 # Run tests on PR
│       └── deploy.yml               # Deploy on merge
│
├── package.json                     # Root package (for testing)
├── jest.config.js                   # Test configuration
└── README.md
```

**Summary:**
- ✅ No external accounts (100% AWS)
- ✅ Functional paradigm throughout
- ✅ 100% testable with dependency injection
- ✅ Clear 6-layer hierarchy
- ✅ All files <100 lines
- ✅ Test coverage goal: 80%+

Ready to start building this testable architecture?

