# Changelog

All notable changes to HomeHarbor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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