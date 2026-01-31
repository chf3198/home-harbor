# HomeHarbor

HomeHarbor is a simple, staff-level demo app for a real-estate marketplace.

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

## What this demo shows

- SEO-first React app (Next.js with SSR/ISR, metadata, sitemap, robots)
- Node.js API with REST + GraphQL
- A minimal ML stub for recommendations
- Simple E2E tests (Playwright)

## Project layout

- `apps/web` — Next.js app
- `apps/api` — Node.js API (REST + GraphQL)
- `apps/ml` — Python ML stub
- `infra` — AWS/IaC placeholders
- `tests` — E2E tests

## Notes

This repo is intentionally small and focused. Replace the stubbed data and infrastructure with real services as needed.
