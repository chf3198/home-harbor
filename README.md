# HomeHarbor

HomeHarbor is a simple, staff-level demo app for a real-estate marketplace.

## Quick start

- Install dependencies:
  - `npm install`
- Run the web app:
  - `npm run dev`
- Run the API:
  - `npm run dev:api`
- Run tests:
  - `npm test`

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
