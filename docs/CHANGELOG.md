# Changelog

All notable changes to HomeHarbor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Knowledge graph and documentation index for AI optimization.
- Semantic JSDoc tags to key files for better AI understanding.
- Comprehensive linking between docs and code.
- E2E testing infrastructure with Playwright.
- Modular frontend components (AIChatForm, PropertyCard, etc.).
- Git workflow documentation (Conventional Commits, Trunk-Based Development).

### Changed
- Updated .github/copilot-instructions.md for workflow integration.
- **BREAKING**: Replaced axios with native fetch in all Lambda functions.
- Modularized public/index.html inline scripts into separate JS files.
- app.js now only initializes when served via HTTP (not file://).

### Fixed
- HOME_HARBOR_DATA variable reference (was undefined HOME_HARBOR_SAMPLE).
- Realtor.com URL format now uses city_state/address pattern.
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