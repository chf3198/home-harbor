# HomeHarbor Knowledge Graph

This document provides a visual and textual representation of the HomeHarbor codebase dependencies, components, and relationships for lossless AI consumption.

## Overview
HomeHarbor is a real estate search platform with the following high-level architecture:
- **Frontend**: Single-file HTML UI (public/index.html)
- **Backend**: Express API (src/server/) with property search (src/property-search/) and AI assistant (src/ai-assistant/)
- **Data Ingestion**: AWS Lambda functions (lambda/src/)
- **Testing**: Jest (src/**/*.test.js) and Playwright (tests/)
- **Documentation**: Comprehensive docs in docs/

## Component Map
```
Frontend (public/)
├── index.html (UI, fetches API or uses embedded data)
└── Dependencies: None (runs via file://)

Backend (src/server/)
├── app.js (Express setup, static serving, API routes)
├── routes/ (API endpoints)
│   ├── propertiesRoutes.js (search/filter endpoints)
│   ├── aiRoutes.js (AI chat/description endpoints)
│   └── healthRoutes.js (status checks)
├── dataService.js (data loading)
├── configService.js (configuration)
└── Dependencies: express, property-search, ai-assistant

Property Search (src/property-search/)
├── Property.js (entity with validation)
├── searchService.js (core search logic)
├── csvLoader.js (data loading)
├── paginator.js (pagination)
├── priceFilter.js (filtering)
├── typeFilter.js (filtering)
├── propertySorter.js (sorting)
└── Dependencies: Custom Result class, csv-parse

AI Assistant (src/ai-assistant/)
├── chatAssistant.js (orchestrator)
├── openRouterClient.js (API client)
├── modelSelector.js (model choice)
├── cascadingService.js (fallback logic)
├── config.js (AI settings)
└── Dependencies: OpenRouter API, custom Result class

Lambda Functions (lambda/src/)
├── redfin-ingestion.ts (market data ETL)
├── ct-socrata-etl.ts (property ETL)
├── street-view-fetch.ts (image fetch)
├── ai-vision-analysis.ts (vision AI)
├── ai-description-generator.ts (LLM AI)
└── Dependencies: AWS SDK v3, axios, csv-parse

Testing (tests/, src/**/*.test.js)
├── Jest suites for all modules
├── Playwright E2E tests
└── Dependencies: Jest, Playwright

Documentation (docs/)
├── INSTRUCTION_DOCUMENT.md (design overview)
├── DATA_SOURCES.md (data strategy)
├── AI_FEATURES_OVERVIEW.md (AI details)
├── OPENROUTER_LLM_ARCHITECTURE.md (LLM setup)
└── Dependencies: None (static docs)
```

## Dependency Edges
- Frontend → Backend (API calls)
- Backend → Property Search (search logic)
- Backend → AI Assistant (AI features)
- Property Search → AI Assistant (optional AI enhancements)
- Lambda → DynamoDB/S3 (data storage)
- Backend → Lambda (via API Gateway, not direct)
- Testing → All components (validation)

## Semantic Tags
- **Validation**: Property.js, config.js (use custom Result class)
- **API Integration**: openRouterClient.js, lambda functions (external services)
- **Data Processing**: csvLoader.js, lambda ETLs (parsing/storage)
- **UI Rendering**: public/index.html (single-file app)
- **Error Handling**: All modules (throw descriptive errors)
- **Testing**: Jest suites (80% coverage, nested describes)

## Key Relationships
- Property.js is central to property-search; all filters/sorters depend on it.
- chatAssistant.js orchestrates AI; depends on client, selector, cascade.
- Lambda functions are independent but feed data to backend via DynamoDB.
- Docs provide context; link to code examples.

This graph ensures AI can navigate dependencies without loss, enabling optimal code generation and understanding.