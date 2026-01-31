# HomeHarbor

HomeHarbor is a full-stack real estate marketplace demo showcasing modern web application architecture, AI-powered search, and cloud infrastructure best practices.

## Quick start

### First Time Setup
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env with your configuration (see SECURITY.md)
nano .env

# 3. Install dependencies
npm install

# 4. Setup git hooks (security checks)
./setup-hooks.sh
```

### Running the Application
```bash
# Run the web app
npm run dev

# Run the API
npm run dev:api

# Run tests
npm test
```

## 🔒 Security

**IMPORTANT:** Never commit sensitive data! See [SECURITY.md](SECURITY.md) for:
- AWS credentials protection
- Environment variable setup
- Secret management best practices
- Git security hooks

Quick security check:
```bash
# Verify .env files are ignored
git status
# (.env should NOT appear)
```

## What this demo showcases

- **Frontend**: SEO-optimized React app with Next.js (SSR/ISR, PWA, Core Web Vitals)
- **Backend**: Node.js API with REST + GraphQL endpoints
- **AI/ML**: Python-based recommendation engine and natural language search
- **Testing**: Comprehensive E2E tests with Playwright
- **Infrastructure**: AWS deployment with IaC (Terraform/CDK)
- **DevOps**: CI/CD pipeline, monitoring, and observability

## Project layout

- `apps/web` — Next.js app
- `apps/api` — Node.js API (REST + GraphQL)
- `apps/ml` — Python ML stub
- `infra` — AWS/IaC placeholders
- `Technology Stack

- **Frontend**: React, Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, NestJS, GraphQL (Apollo), REST
- **Database**: PostgreSQL (RDS), Redis (ElastiCache)
- **ML/AI**: Python, scikit-learn, natural language processing
- **Cloud**: AWS (S3, CloudFront, ECS/Fargate, Lambda, RDS)
- **IaC**: Terraform / AWS CDK
- **Testing**: Playwright, Jest, Supertest
- **CI/CD**: GitHub Actions

## Architecture Principles

This project demonstrates:
- **12-Factor App** methodology
- **Event-driven architecture** with message queues
- **Microservices** (minimal, focused services)
- **Security-first** design (encryption, IAM, secrets management)
- **Observability** (logging, metrics, tracing)
- **Performance optimization** (caching, CDN, lazy loading)

## Notes

This is a training and educational project showcasing production-ready patterns and best practices for modern web applications

This repo is intentionally small and focused. Replace the stubbed data and infrastructure with real services as needed.
