# HomeHarbor TODO List

**Project Goal**: Production-quality real estate aggregator demo for Realtor.com recruiter

---

## Phase 0: Project Foundation ✅ COMPLETE

- [x] Repository setup & security
- [x] AWS CLI configuration
- [x] Architecture selection (testable functional)
- [x] Workflow design (v3.0 AI-optimized)
- [x] File organization standards
- [x] Create LESSONS_LEARNED.md
- [x] Create TODO.md
- [x] Commit architecture documents
- [x] Initialize Node.js project (package.json)
- [x] Configure testing framework (Jest)
- [x] Set up project structure (src/, tests/)
- [x] Configure linter (ESLint)
- [x] Configure formatter (Prettier)
- [ ] Install pre-commit hooks (file size, security)

---

## Phase 1: Core Backend - Property Search ✅ COMPLETE

### Feature: Property Search API
- [x] Design: Property entity schema
- [x] Design: Search API contract (inputs/outputs)
- [x] Design: Repository interface
- [x] Test: Property validation tests (RED)
- [x] Code: Property validation (GREEN)
- [x] Test: Search service tests (RED)
- [x] Code: Search service (GREEN)
- [x] Test: Repository tests (RED)
- [x] Code: Repository implementation (GREEN)
- [x] Refactor: Extract pure functions if files >80 lines
- [ ] Integration test: End-to-end search flow (API + UI)

### Infrastructure
- [x] Environment variable management
- [x] Local demo server (Express)
- [x] AI demo endpoints (vision + description)
- [x] Lambda handler for API Gateway

---

## Phase 2: Frontend - Property Viewer ✅ COMPLETE

### Feature: Property List View
- [x] Local HTML/CSS/JS demo UI
- [x] Search filters + pagination (API-driven)
- [x] Property detail panel
- [x] AI analysis + description buttons
- [x] React UI rewrite (Vite)
- [x] Component tests (React Testing Library)
- [x] Accessibility: ARIA labels, keyboard nav
- [x] E2E testing (Playwright)
- [x] Error boundaries & production error handling
- [x] Performance monitoring & Core Web Vitals
- [x] Bundle optimization (<100KB)

### Infrastructure
- [x] Initialize React app (Vite)
- [x] Configure test framework (React Testing Library)
- [x] API client for backend
- [x] Error handling & loading states
- [x] E2E test infrastructure (Playwright + mock server)
- [x] Performance monitoring setup
- [x] Production build optimization

---

## Phase 2.5: Backend Simplification ✅ COMPLETE

### Library Replacements (Keep it Simple Initiative)
- [x] Phase 1: Replace Result class with neverthrow (functional error handling)
- [x] Phase 2: Replace custom date parsing with date-fns
- [x] Phase 3: Replace manual validation with joi schemas
- [x] Phase 3: Replace axios with native fetch in Lambda functions
- [x] Update all dependent files and tests
- [x] Validate library integrations work correctly
- [x] Document library simplification achievements

### Impact Achieved
- [x] Reduced custom code by 200+ lines
- [x] Removed 50KB axios dependency (-8KB bundle size)
- [x] Improved error handling consistency
- [x] Enhanced date parsing reliability
- [x] Added schema-based validation

---

## Phase 3: Deployment & CI/CD ⏳ READY FOR IMPLEMENTATION

- [ ] Create GitHub Actions workflow
- [ ] Configure AWS SAM template
- [ ] Set up staging environment
- [ ] Set up production environment
- [ ] Configure CloudWatch logging
- [ ] Configure CloudWatch alarms
- [ ] Database migration strategy
- [ ] Rollback procedures documented

---

## Phase 3.5: AI Search Integration ✅ COMPLETE

### Feature: Natural Language → Search Filters
- [x] Design: Two-LLM architecture (filter extraction + conversation)
- [x] Lambda: Update chat.ts with structured JSON output (LLM #1)
- [x] Lambda: Conversational response with search results context (LLM #2)
- [x] React: useAISearch hook for coordinating LLMs + search
- [x] React: Update AIChatSection with progress indicator
- [x] React: Sync AI-generated filters → SearchSection form
- [x] State: localStorage persistence (chat history, filters, results)
- [x] Test: Integration tests for AI search flow (20 E2E tests passing)
- [x] UAT: Manual verification of full flow (February 6, 2026)

### Design Decisions (February 6, 2026)
- **Single endpoint** `/chat` returns `{ filters, response, model }`
- **Structured outputs** via OpenRouter `response_format: json_schema`
- **Model**: arcee-ai/trinity-large-preview:free (supports both JSON + conversation)
- **Chat precedence**: LLM filter values override form values (null = keep form value)
- **Progress indicator**: "thinking..." placeholder during LLM calls
- **Persistence**: All state (chat, filters, results) in localStorage

### Implementation Status (February 6, 2026)
**Lambda Modules (≤100 lines each):**
- `chat.ts` (88 lines): Main handler orchestrating two-LLM flow
- `chat-types.ts` (43 lines): TypeScript interfaces
- `chat-filters.ts` (89 lines): JSON extraction and filter normalization
- `chat-llm.ts` (58 lines): OpenRouter client with cascading fallback
- `chat-prompts.ts` (50 lines): System prompts for both LLMs

**React Modules (≤100 lines each):**
- `useAISearch.js` (85 lines): Main hook integrating AI chat with search
- `aiSearchTypes.js` (32 lines): Action types and initial state
- `aiSearchReducer.js` (45 lines): State reducer for chat messages
- `aiSearchStorage.js` (62 lines): localStorage persistence utilities
- `AIChatSection.jsx` (49 lines): Updated to wire filters to PropertySearch
- `AIChatMessages.jsx` (72 lines): Chat history display with thinking indicator

---

## Phase 4: Advanced Features (Time Permitting)

- [ ] User authentication (AWS Cognito?)
- [ ] Save favorite properties
- [ ] Property comparison view
- [ ] Map integration (Google Maps API?)
- [ ] Price alerts
- [ ] Image optimization (CloudFront?)
- [ ] Clear chat/state feature

---

## Documentation & Polish

- [ ] README: Setup instructions
- [ ] README: Architecture diagram
- [ ] README: Technology stack badges
- [ ] README: Test coverage badge
- [ ] README: Live demo link
- [ ] API documentation (Swagger/OpenAPI?)
- [ ] Architecture decision records (ADRs)
- [ ] Performance benchmarks
- [x] In-app Developer Guide: E2E testing documentation
- [x] Progressive disclosure UX for help guides (collapsible sections)

---

## Quality Gates (Every Feature)

**Before ANY commit:**
- [ ] All tests pass (npm test)
- [ ] Coverage ≥80% (npm run coverage)
- [ ] Linter passes (npm run lint)
- [ ] All files ≤100 lines
- [ ] Conventional commit message

**Before ANY deploy:**
- [ ] Staging tested manually
- [ ] CI/CD pipeline green
- [ ] Rollback plan ready
- [ ] Monitoring configured

---

## Known Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AWS free tier exceeded | Cost overrun | Monitor usage, set billing alerts |
| Context window expiry mid-feature | Lost work | Commit frequently, session checkpoints |
| Over-engineering for portfolio | Time waste | Focus on core features first, YAGNI |
| Database schema changes | Migration complexity | Version migrations, test thoroughly |

---

**Next Action**: Begin Phase 3 CI/CD deployment setup

**Last Updated**: February 6, 2026 (Phase 3.5 AI Search Integration COMPLETE)
