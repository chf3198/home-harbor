# HomeHarbor Instruction Document

## Purpose
High-level vision, goals, and architectural overview.

**Design Philosophy: Keep it Simple** - Leverage existing free/open tools, libraries, frameworks.

---

# 1. App Design

## 1.1 Goals
- Professional real estate search using real-world data
- Demonstrate TDD, clean architecture, strong docs, automation
- AI-powered assistance and vision insights at $0 cost

## 1.2 Keep it Simple Philosophy
- **Don't reinvent the wheel**: Use existing free/open tools
- **Regular codebase audits**: Replace custom code with libraries
- **CDN-first approach**: Leverage Content Delivery Networks

**See [KEEP_IT_SIMPLE_FRONTEND.md](KEEP_IT_SIMPLE_FRONTEND.md), [KEEP_IT_SIMPLE_BACKEND.md](KEEP_IT_SIMPLE_BACKEND.md), [KEEP_IT_SIMPLE_LIBRARIES.md](KEEP_IT_SIMPLE_LIBRARIES.md)**

## 1.3 Core Capabilities
- Property search/filtering (city, price, type)
- Sorting/pagination (price, date, value)
- Real dataset integration (CT + Redfin)
- AI descriptions (OpenRouter LLM)
- Photo analysis (Street View + vision)
- Serverless pipeline (Lambda → DynamoDB → S3)
- Realtor.com search links (via Google site search)
- Low-code UI (Tailwind CDN, single-file HTML)
- React frontend (31 components, Vite)

## 1.4 Architecture

### Backend (Serverless)
- AWS Lambda ETL + API
- Data ingestion (Redfin + CT)
- Street View + AI endpoints
- DynamoDB + S3 caching

### Frontend (Simple + Modern)
- Single-file HTML (`public/index.html`) - works via file://
- Modular JS files (`public/*.js`) - 18 modules
- React frontend (`frontend/`) - 31 components
- Vanilla JS + Tailwind CSS
- Professional offline state

### AI Integration
- OpenRouter free-tier models
- Molmo 72B (vision), Llama 3.3 (text)
- Cascading fallbacks

## 1.5 Cost: $1.50/month (free tiers)

---

# 2. Development Workflow

## 2.1 Process
1. **Research**: Web search, document findings
2. **Planning**: TDD design, upfront tests
3. **Implementation**: Incremental coding, validation
4. **Validation**: Testing, security, performance
5. **Evaluation**: Assess optimality, improvements
6. **Evolution**: Update patterns

## 2.2 Project Patterns
- **Validation**: Result class with static create()
- **AI Fallbacks**: CascadingService (primary → fallback)
- **Environment**: `process.env.TABLE_NAME || 'default-dev'`
- **Testing**: Nested describe blocks, business logic focus
- **Imports**: Relative within modules, absolute cross-module
- **Error Handling**: Validate config on init
- **Modularization**: ES modules, ≤100 lines per file

## 2.3 File Size Limits
- **≤100 lines per file** (enforced)
- Hierarchical cross-referencing
- Regular audits for consolidation

---

# 3. Key References

- [docs/LESSONS_LEARNED.md](docs/LESSONS_LEARNED.md) - Development insights
- [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) - File organization
- [docs/TESTING_PATTERNS.md](docs/TESTING_PATTERNS.md) - Testing approaches
- [SECURITY.md](SECURITY.md) - Security practices
