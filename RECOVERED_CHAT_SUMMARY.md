# HomeHarbor Project - Recovered Chat Summary

**Date Recovered:** January 30, 2026
**Original Chat Date:** January 30, 2026 (earlier session)
**Project Name:** HomeHarbor (alternate names considered: NestQuest, PropPulse, Haven, KeyFinder)

---

## Project Purpose
This project is designed to demonstrate skills and capabilities for the **Realtor.com Staff Software Engineer** position. It's a production-grade, AI-powered real estate marketplace demo aligned to Realtor.com's tech stack.

---

## Core Project Features (Based on Original Chat)
1. **AI natural-language search** - users can search properties using conversational queries
2. **Recommendation engine** - personalized property recommendations
3. **GraphQL API** - built with NestJS
4. **Data pipeline** - ETL and validation framework
5. **Next.js frontend** - modern React-based UI
6. **Optional React Native app** - mobile experience (future consideration)

---

## Staff-Level Engineering Practices to Implement
- **Microservices + Event-driven architecture**
- **Observability** (monitoring, logging, metrics)
- **CI/CD** (continuous integration/deployment)
- **IaC** (Infrastructure as Code)
- **Testing:**
  - Unit tests
  - Integration tests
  - E2E (end-to-end) tests
  - Load/performance tests
- **ADRs** (Architecture Decision Records)
- **Runbooks** (operational documentation)
- **Scalability analysis**

---

## Technology Stack (Aligned to Realtor.com Role Requirements)

### Frontend
- **React + Next.js** (TypeScript)
- Single Page Application (SPA) with SSR/ISR for SEO
- Progressive Web Application (PWA) capabilities
- Service Workers
- Client-side JavaScript, CSS/SASS, HTML
- SEO-friendly React implementation
- Core Web Vitals optimization
- Image optimization, caching, CDN, lazy loading

### Backend
- **Node.js** (TypeScript)
- **REST + GraphQL** services
- GraphQL with Apollo/NestJS
- Express or NestJS framework
- Lambda functions for specialized tasks

### Machine Learning / Analytics
- **Python** (isolated services + batch jobs)
- Advanced ML and predictive analytics models
- Data pipelines

### Database & Caching
- **PostgreSQL** (primary database)
- **DynamoDB** (optional for specific use cases)
- **Redis** (caching layer)
- **RDS Postgres** for production

### AWS Implementation Strategy

#### Phase 1: Local-First Development
- Docker Compose for Postgres + Redis
- Feature flags for cloud integration
- Mock AWS services via environment toggles

#### Phase 2: Minimal AWS Deployment
- **Frontend:** S3 + CloudFront (SEO + speed)
- **API:** ECS Fargate (or Lambda for serverless)
- **Database:** RDS Postgres
- **Cache:** ElastiCache Redis
- **Observability:** CloudWatch (logs + metrics)
- **Storage:** S3 (data lake)
- **ETL:** Batch jobs on AWS (S3 + scheduled jobs)

#### Infrastructure as Code
- Terraform or AWS CDK
- Single deploy script for instant provisioning

---

## Architecture Principles (from Realtor.com Tech Blog Research)

### Key Insights from Realtor.com's Engineering
1. **AI-powered search** - "Search how you'd say it"
   - Source: https://techblog.realtor.com/search-how-youd-say-it-building-ai-powered-search-at-realtor-com/
   
2. **End-to-end validation** powers personalized recommendations
   - Source: https://techblog.realtor.com/how-realtor-coms-end-to-end-validation-powers-personalized-recommendations/
   
3. **Event-driven, real-time integrations** with AWS
   - Source: https://techblog.realtor.com/real-time-account-updates-with-salesforce-platform-events-and-aws/
   
4. **12-Factor App principles**
   - Low-ops, environment-driven config
   - Deploy-friendly structure
   - Source: https://12factor.net/
   
5. **AWS Well-Architected Framework** pillars:
   - Operational excellence
   - Security
   - Reliability
   - Performance efficiency
   - Cost optimization
   - Sustainability

---

## Project Structure Goals

### Keep It Simple Yet Staff-Level
- **One UI app + One API service + One ML service** (no microservices sprawl in MVP)
- Minimal features: 
  - Search → Listing → Save → Recommendations
- Single monorepo structure

### Make It Reviewable for Non-Engineers
- **One-page README** with:
  - Project purpose
  - Demo screenshots
  - "What to click" instructions
  - 3-minute video walkthrough
- **docs/overview.md** with:
  - C4 diagrams (Level 1)
  - Feature list
  - Glossary of terms
- Product-language labels in UI and docs (no jargon)

### Minimize Codebase Complexity
- Single monorepo
- One frontend + one API (no microservices in MVP)
- Avoid custom frameworks
- Use established libraries (Next.js, NestJS, Apollo)
- Clear separation of concerns
- Comprehensive documentation

---

## SEO + Performance Requirements
- Next.js SSR/ISR (Server-Side Rendering / Incremental Static Regeneration)
- Sitemap generation
- robots.txt
- Structured data (JSON-LD)
- Core Web Vitals metrics tracking
- Image optimization
- Caching strategies
- CDN integration
- Lazy loading
- Performance monitoring

---

## Full-Stack & E2E Testability
- Unit tests for all components
- Integration tests for API endpoints
- E2E tests using Playwright (already configured in workspace)
- Load/performance testing
- AI Agent testability considerations
- AB testing implementation
- Metrics and impact measurement

---

## Realtor.com Staff Software Engineer Role Requirements

### Key Responsibilities
- Work collaboratively in teams (Product Managers, Designers, Engineers)
- Take ownership of overall architecture
- Develop highly scalable ReactJS frontend applications
- Build Node.js API services and Lambda functions
- Implement dynamic/interactive pages using ReactJS
- Consume REST and GraphQL services
- Handle high traffic, high velocity applications
- Focus on SEO and page load performance
- Build backend services around ML/predictive analytics
- Design and operationalize data pipelines on AWS
- Optimize developer toolchain for instant provisioning
- Fully automate deployment
- Minimize development friction
- Work in Agile/Scrum process

### Required Skills
- Build simple yet impactful solutions
- Minimalistic yet beautiful design
- Extensible yet maintainable code
- Independent project management
- Stakeholder expectation management
- Strong communication skills
- Growth and learning mindset
- Lead other engineers on large-scale projects
- Develop complex software systems
- Full technical stack experience (front-end and back-end)
- Strong analytical thinking
- Data-driven decision making
- Attention to detail
- Great sense of design
- Commitment to beautiful UX

### Technical Experience Required
- 8+ years software development
- 5+ years front-end development
- Modern languages: ReactJS/NextJS, Python, Ruby, Go, Node.js, Dart
- Single Page Applications (SPA)
- Progressive Web Applications (PWA)
- Service Workers
- Expert: JavaScript, CSS/SASS, HTML
- Application performance monitoring and tuning
- SEO-friendly React applications
- Large-scale internet applications
- Cloud-based architectures (development & deployment)
- AWS: EC2, ECS, S3, RDS
- AB testing implementation
- Computer science fundamentals
- Schema design
- Best practices

---

## Implementation Strategy

### Languages (Staff-Level Rationale)
- **TypeScript everywhere** (Next.js + NestJS)
  - Demonstrates full-stack ownership
  - Strong typing for reliability
  - Single language across stack (except ML)
- **SQL (PostgreSQL)**
  - Core data modeling
  - Query performance optimization
- **Python** (optional, isolated)
  - Only for ML/ETL modules
  - Kept separate to maintain lean core

### Project Phases
1. **Setup & Scaffolding**
   - Monorepo structure
   - Development environment
   - Docker Compose for local services
   
2. **Core Features**
   - Basic property listings
   - Search functionality
   - User favorites/save
   - AI-powered recommendations
   
3. **Advanced Features**
   - Natural language search
   - ML integration
   - Performance optimization
   - SEO enhancements
   
4. **Production Readiness**
   - AWS deployment
   - CI/CD pipeline
   - Monitoring and observability
   - Documentation completion
   - Video walkthrough

---

## Original Design Decisions

### Project Name: HomeHarbor
**Rationale:** Conveys safety, shelter, and a welcoming destination for finding a home. The maritime metaphor suggests navigation and discovery.

**Alternatives Considered:**
- NestQuest
- PropPulse
- Haven
- KeyFinder

### Architecture Decisions
- Monorepo over separate repositories (easier development, clearer dependencies)
- TypeScript over JavaScript (type safety, better IDE support)
- GraphQL + REST (flexibility for different use cases)
- Next.js over Create React App (built-in SSR, better performance)
- NestJS over Express (better structure for larger applications)
- PostgreSQL over NoSQL (relational data fits real estate domain)

---

## Next Steps (From Original Chat)
The original chat ended with the decision to begin project scaffolding while keeping it simple. The focus was on creating a minimal but complete implementation that demonstrates Staff-level engineering skills without unnecessary complexity.

---

## Files to Check/Create
Based on the original chat, the following were being worked on:
- `.github/copilot-instructions.md` (project guidelines)
- `README.md` (project documentation)
- `package.json` (workspace root)
- `playwright.config.ts` (E2E testing)
- Monorepo structure with apps for web, api, and ml
