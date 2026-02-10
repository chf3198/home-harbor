# Changelog

All notable changes to HomeHarbor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-02-09

### Fixed
- **Page Refresh Persistence**: Search results and filters now persist across page refresh.
  - **Synchronous initialization**: Uses `useReducer` lazy initializer to load state BEFORE first render.
  - Handles both API response formats: `{ data }` (Socrata) and `{ properties }` (Lambda).
  - View toggle (Chat/Results) visible immediately on page load when results exist.
  - Chat history also persists across sessions via localStorage.
  - **UAT Validated**: February 9, 2026 - toggle appears correctly after browser refresh.
- **Lambda Socrata Integration**: Fixed Lambda handler to use Socrata API.
  - Changed Lambda handler from `properties.handler` to `properties-socrata.handler`.
  - Lambda now queries CT Open Data Portal (211K+ real estate records).
  - Updated `usePropertySearch.jsx` to handle new `{data, meta}` response format.
  - Added debug logging throughout search flow for troubleshooting.
  - Verified API returns real property data via curl testing.
- **Frontend API URL Configuration**: Fixed production API URLs for GitHub Pages deployment.
  - `useAIChat.jsx`: Uses AWS Lambda URL in production.
  - `CityInput.jsx`: Fixed cities.json path using `import.meta.env.BASE_URL`.
  - `vite.config.js`: Fixed environment detection using Vite's `mode` parameter.
- **Favicon and Tailwind warnings**: Added custom favicon.svg, removed CDN script (bundled by Vite).

### Added
- **Production UAT Test Suite**: Automated E2E tests against live GitHub Pages deployment.
  - `production-uat.spec.js`: 10 Playwright tests matching manual UAT workflow.
  - `playwright.production.config.ts`: Separate config for production testing.
  - npm scripts: `test:uat`, `test:uat:headed`, `test:uat:ui`.
  - Tests verify: page load, AI chat, filter extraction, Socrata API, AWS Lambda integration.
- **Custom Favicon**: HomeHarbor house+harbor icon in `frontend/public/favicon.svg`.
- **GitHub Pages React Deployment**: Updated CI/CD to build and deploy React frontend.
  - `deploy-pages.yml` now builds frontend with Vite and deploys `dist/` folder.
  - Vite `base` path configured for `/home-harbor/` subdirectory.
  - Automatic deployment triggered on `frontend/**` changes.
- **AI Search Integration** (Phase 3.5): Natural language chat triggers property search.
  - Two-LLM architecture: Filter extraction (structured JSON) + conversational response.
  - `useAISearch.js`: React hook coordinating LLMs with search form state.
  - localStorage persistence for chat history, filters, and search results.
  - Progress indicator (typing animation) during LLM processing.
  - Chat-to-form sync: AI-extracted filters update SearchSection form.
  - Default filter values (price range) when user doesn't specify.
- **Messenger-style Chat UI**: Beautiful chat interface inspired by social messaging apps.
  - Gradient header with "Online" status indicator.
  - Chat bubbles with avatars and timestamps.
  - Animated typing indicator during AI processing.
  - Auto-scroll to latest messages.
  - Compact input bar with send/clear buttons.
- **Five-star AI Customer Service**: Conversational AI system prompt ensures friendly, direct responses.
  - AI responds directly to user (no third-person narration).
  - No exposed reasoning/thinking process.
  - Proactive guidance on filters and search features.
- **Comprehensive E2E Test Suite**: 20 Playwright tests covering full interaction workflow.
  - Page load and navigation tests.
  - Property search with filters.
  - AI chat messaging and filter extraction.
  - Responsive design (mobile/tablet).
  - Error handling scenarios.
- **Client-side RAG (Retrieval-Augmented Generation)** powered by Orama + Transformers.js.
  - `embeddingService.js`: Browser-based embeddings using Xenova/all-MiniLM-L6-v2 model.
  - `ragSearchService.js`: Hybrid vector + full-text search with Orama.
  - `ragChatService.js`: RAG prompt building and response processing.
  - `useSemanticSearch.js`: React hook for semantic property search.
  - `useRAGChat.js`: Hook combining search with OpenRouter LLM responses.
  - `RAGChatSection.jsx`: UI component with indexing progress and source attribution.
- Knowledge graph and documentation index for AI optimization.
- Semantic JSDoc tags to key files for better AI understanding.
- Comprehensive linking between docs and code.
- E2E testing infrastructure with Playwright.
- Modular frontend components (AIChatForm, PropertyCard, etc.).
- Git workflow documentation (Conventional Commits, Trunk-Based Development).
- React frontend with 31 components and comprehensive test coverage.
- **In-app E2E testing documentation** in Developer Guide with Playwright architecture, mock server design, CI/CD integration, and test categories.
- **Collapsible help sections** using native HTML `<details>/<summary>` elements for progressive disclosure UX.
- **Scrollable help modal** with `max-h-[60vh] overflow-y-auto` for long content accessibility.
- **Automated file size enforcement** via ESLint `max-lines` rule (warn) and GitHub Actions workflow.
- **File size check workflow** (.github/workflows/file-size-check.yml) to audit all JS/TS/HTML files on PRs.

### Changed
- Updated .github/copilot-instructions.md for workflow integration.
- **BREAKING**: Replaced axios with native fetch in all Lambda functions.
- **BREAKING**: Deprecated `public/` folder - React frontend (`frontend/`) is now primary UI.
- Modularized public/index.html inline scripts into separate JS files.
- app.js now only initializes when served via HTTP (not file://).
- Realtor.com links now use Google site search for reliable property lookup.
- Link text updated to "🔍 Find on Google → Realtor.com" for UX clarity.

### Fixed
- HOME_HARBOR_DATA variable reference (was undefined HOME_HARBOR_SAMPLE).
- Realtor.com URL format now uses Google site search (direct URLs unreliable without MLS IDs).
- Duplicate initialization conflict between inline and modular scripts.

## [0.1.0] - 2026-02-03

### Added
- Initial implementation of HomeHarbor real estate platform.
- AWS Lambda functions for data ingestion.
- Express API with property search and AI features.
- Single-file HTML UI.
- Jest and Playwright testing suites.

### Changed
- Migrated from initial scaffolding to production-ready code.

### Fixed
- Validation and error handling in Property entity.