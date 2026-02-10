# Technology Stack & Tools

This document outlines the complete technology stack, tools, and engineering practices used in HomeHarbor development.

## Core Runtime & Languages

### Node.js Ecosystem
- **Runtime**: Node.js 18+ (LTS)
- **Package Manager**: npm
- **Module System**: ES modules (import/export)
- **Type Safety**: TypeScript for Lambda functions, JSDoc for documentation

## Development Tools

### Testing Framework
- **Unit Testing**: Jest with 80%+ coverage requirement
- **E2E Testing**: Playwright for UI automation
- **Test Structure**: Nested describe blocks mirroring code organization
- **Coverage**: Excludes barrel export files (index.js)

### Code Quality
- **Linting**: ESLint with Airbnb configuration
- **Formatting**: Prettier with consistent rules
- **File Size**: ≤100 lines per file (enforced through refactoring)
- **Imports**: Relative within modules, absolute for cross-module

### Version Control
- **Git**: Conventional commits (feat:, fix:, docs:, test:, refactor:)
- **Branching**: Feature branches with descriptive PRs
- **Hooks**: Pre-commit security validation

## AWS Serverless Stack

### Compute
- **AWS Lambda**: Serverless functions for ETL and AI processing
- **Runtime**: Node.js 18.x
- **Memory**: 256MB-1024MB based on workload
- **Timeout**: 5-15 minutes for data processing

### API Layer
- **API Gateway**: HTTP API (67% cheaper than REST API)
- **Authentication**: API keys for POST endpoints
- **CORS**: Configured for file:// UI access
- **Throttling**: 10 req/s burst, 100 req/min sustained

### Data Storage
- **DynamoDB**: NoSQL database for properties, metrics, AI caches
- **Tables**:
  - `home-harbor-properties-dev`: Property transaction records
  - `home-harbor-market-metrics-dev`: City-level market analytics
  - `home-harbor-ai-insights-dev`: Cached AI analyses (TTL 30-90 days)
- **GSI**: Optimized for property search and filtering

### Object Storage
- **S3 Buckets**:
  - `home-harbor-data-sources-dev`: Raw CSV datasets
  - `home-harbor-images-dev`: Property images (infrastructure ready)
- **Lifecycle**: Automatic deletion of temporary files

### Content Delivery
- **CloudFront**: Global CDN for property images (infrastructure ready)
- **Origins**: S3 buckets with optimized caching
- **Price Class**: Use Only (US, Canada, Europe) for cost control

### Event Scheduling (Planned)
> Note: EventBridge schedules are defined but not actively used. Currently, data is queried real-time via Socrata API.

- **EventBridge**: Cron-based triggers for data ingestion (planned)
- **Planned Schedules**:
  - Redfin ingestion: Monthly (code written, not deployed)
  - CT property ETL: Weekly (code written, uses real-time Socrata instead)

### Monitoring & Observability
- **CloudWatch**: Logs, metrics, and alarms
- **Log Groups**: One per Lambda function
- **Metrics**: Errors, duration, invocations, throttles
- **Alarms**: Error rate >5%, duration >5min

### Security & Access Control
- **IAM**: Least-privilege roles for Lambda functions
- **Policies**: S3 read/write, DynamoDB CRUD, CloudWatch logs
- **Secrets Manager**: Encrypted storage for API keys
- **Keys**: OpenRouter API key, Google Maps API key

## AI & Machine Learning

### LLM Provider
- **OpenRouter**: Free-tier AI model orchestration ✅ Deployed
- **Models**:
  - Vision: AllenAI Molmo 72B (property photo analysis)
  - Text: Meta Llama 3.3 70B (property descriptions, chat)
- **Fallback**: Intelligent cascading to next-best free model
- **Caching**: DynamoDB TTL to reduce API costs

### External APIs (Planned)
> Note: Google Street View integration code is written but not yet deployed.

- **Google Street View**: Static API for property exterior photos
- **Free Tier**: 25,000 requests/month
- **Caching**: S3 storage with CloudFront delivery
- **Status**: Code in `street-view-fetch.ts`, not in SAM template

## Data Sources

### Active Data Source ✅
- **CT Open Data Portal**: Real estate transactions (Socrata API)
  - 211K+ property records
  - Real-time queries
  - License: Public domain

### Planned Data Sources 📝
- **Redfin Data Center**: Monthly market analytics CSV
  - Code in `redfin-ingestion.ts`, not yet deployed
  - License: Public domain

### Data Processing
- **CSV Parsing**: Streaming processing for large files
- **ETL Pipeline**: Transform, validate, enrich data
- **Batch Processing**: 1000 records per DynamoDB batch write
- **Error Handling**: Dead letter queues for failed records

## Engineering Practices

### Development Methodology
- **TDD**: RED → GREEN → REFACTOR cycle
- **Pair Programming**: AI agent collaboration
- **Code Reviews**: Automated linting + manual review
- **Documentation**: JSDoc for public APIs, semantic tags

### Architecture Patterns
- **Result Pattern**: Explicit error handling with custom Result class
- **Repository Pattern**: Data access abstraction
- **Observer Pattern**: Event-driven processing
- **Strategy Pattern**: Pluggable AI model selection

### Performance Optimization
- **Caching Strategy**: Multi-layer (DynamoDB TTL, S3, memory)
- **Connection Pooling**: AWS SDK v3 optimized clients
- **Streaming**: Memory-efficient processing of large datasets
- **Profiling**: Regular performance analysis and optimization

## Cost Optimization

### Free Tier Utilization
- **Lambda**: 1M requests/month free
- **DynamoDB**: 25GB storage + 200M requests/month free
- **S3**: 5GB storage + 20,000 GET requests/month free
- **CloudFront**: 1TB transfer/month free

### Total Cost Target
- **Monthly Budget**: $1.50 (Secrets Manager only)
- **Breakdown**: 99% free tier, 1% paid services
- **Monitoring**: CloudWatch cost allocation tags

## Deployment Pipeline

### Build Process
- **TypeScript**: Compilation to JavaScript
- **Bundling**: ZIP creation for Lambda deployment
- **Validation**: Lint, test, and security checks

### Infrastructure as Code
- **AWS SAM**: Serverless Application Model
- **Templates**: Infrastructure definition as code
- **Parameters**: Environment-specific configuration

### CI/CD
- **GitHub Actions**: Automated testing and deployment
- **Triggers**: Push to main, pull request validation
- **Environments**: dev, staging, prod

---

**Related Documents**:
- [INSTRUCTION_DOCUMENT.md](INSTRUCTION_DOCUMENT.md) - Project goals and architecture
- [QUICKSTART.md](QUICKSTART.md) - Setup and deployment instructions
- [DATA_SOURCES.md](DATA_SOURCES.md) - Data sourcing strategy</content>
<parameter name="filePath">/mnt/chromeos/removable/SSD Drive/usb_backup_2026-02-02/repos/home-harbor/docs/TECH_STACK.md