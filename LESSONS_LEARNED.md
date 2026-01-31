# Lessons Learned - HomeHarbor Project

**Purpose**: AI agent persistent memory across sessions. Document decisions, patterns, failures, and insights.

---

## Session 1 - January 31, 2026

### Context Recovery & Repository Setup
- **Decision**: Recovered from VS Code crash by finding chat history JSON
- **Why**: Context preservation critical for AI agent continuity
- **Outcome**: Successfully restored work, created GitHub repo
- **Skill Demonstrated**: Problem-solving, git expertise

### AWS Configuration
- **Decision**: Configured AWS CLI with us-east-2 region, root credentials
- **Why**: Need AWS for Lambda, RDS deployment (core project requirement)
- **Outcome**: Credentials secured, $100 credits verified (4+ year runway)
- **Skill Demonstrated**: Cloud infrastructure setup, security awareness
- **Warning**: Root credentials used temporarily - should create IAM user for production

### Architecture Selection: Testable Functional Design
- **Decision**: Chose testable functional over 6 other architectures
- **Alternatives Considered**:
  - Single-file architecture (too simple)
  - Minimal free architecture (good but less testable)
  - AWS Lambda architecture (too AWS-specific)
  - GitHub Lambda hybrid (unnecessary complexity)
  - Simplified architecture (good but less separation)
  - Engineering standards only (not architecture)
- **Why Chosen**: 
  - 80%+ pure functions = highly testable
  - Repository pattern = database independence
  - Clear layer separation = maintainable
  - $0 cost for 12 months (AWS free tier)
  - Demonstrates Staff SWE architectural thinking
- **Skill Demonstrated**: Architectural evaluation, trade-off analysis

### Workflow Evolution: v1.0 → v2.0 → v3.0
- **v1.0**: Basic TDD workflow (6 phases)
- **v2.0**: Git-integrated, team-focused (1,974 lines) - WRONG CONTEXT
- **Problem**: Agent researched team collaboration (Fowler, DORA, Atlassian) thinking this was enterprise team project
- **User Correction**: "You will be a one man show... You are a Copilot AI Agent"
- **v3.0**: AI agent-optimized (400 lines, 80% reduction)
  - Session initialization protocol
  - Session checkpoint protocol  
  - Git as persistent memory
  - Recruiter visibility focus
  - Removed: team collaboration, DORA metrics, psychological safety
- **Lesson**: Always verify project context before researching
- **Skill Demonstrated**: Self-awareness of AI constraints, workflow optimization, adaptability

### File Organization Standards
- **Decision**: Created comprehensive FILE_ORGANIZATION.md guide
- **Why**: Workflow mentioned "<100 lines" rule but never explained HOW
- **Patterns Documented**:
  1. Barrel exports (index.js)
  2. Feature folders (screaming architecture)
  3. Extract pure functions
  4. Dependency injection
  5. Separate interface/implementation
  6. Co-locate related code
- **Research Sources**: Martin Fowler, Uncle Bob, Kent C. Dodds, Khalil Stemmler
- **Skill Demonstrated**: Clean architecture knowledge, separation of concerns

### Git Workflow Mastery
- **Pattern**: Conventional commits (feat/fix/docs/test/refactor/chore)
- **Pattern**: Atomic commits (one logical change per commit)
- **Pattern**: Detailed commit bodies explaining "why"
- **Tool**: Pre-commit security hooks active and tested
- **Evidence**: 8 commits on main, all professional quality

---

## Key Patterns Emerging

### 1. Context Preservation Strategy
- Git commits = primary state storage
- LESSONS_LEARNED.md = decision rationale
- TODO.md = task tracking
- README.md = project overview
- Session checkpoint before context expiry

### 2. Portfolio Optimization
- Every commit demonstrates skills to recruiter
- Architecture documented for visibility
- Workflow shows professional practices
- Quality gates enforced (tests, coverage, file size)

### 3. AI Agent Adaptations
- Explicit decision criteria (no implicit judgment)
- Session-based workflow (not daily/weekly)
- Git as persistent memory mechanism
- Removed human-centric elements (morale, burnout, etc.)

---

## Next Session Priorities

1. ✅ Create TODO.md with planned features
2. ✅ Commit architecture documents (especially TESTABLE_FUNCTIONAL_ARCHITECTURE.md)
3. ✅ Initialize project structure (package.json, src/, tests/)
4. ⏳ Configure testing framework (Jest)
5. ⏳ Implement first feature using TDD (property search?)
6. ⏳ Set up GitHub Actions CI/CD
7. ⏳ Deploy to AWS Lambda

---

## Warnings & Gotchas

- **AWS Credentials**: Currently using root account - create IAM user before production
- **File Size Rule**: Enforce <100 lines per file (pre-commit hook needed)
- **Context Window**: This file must stay manageable - archive old sessions if grows too large
- **Workflow Adherence**: Don't skip quality gates to go faster

---

**Last Updated**: January 31, 2026, Session 1

---

## Session 2 - January 31, 2026 (Continued)

### Iterative TDD Implementation - Property Search Module

**Context**: User requested continuous iteration through workflow until complete feature delivery.

### TDD Cycles Completed

#### Cycle 1: Property Entity
- **RED**: Created Property.test.js with validation tests (commit 1bf1515)
- **GREEN**: Implemented Property.js with Result pattern (commit 9553e6e)
- **Result**: 4 passing tests, 92% coverage, 69 lines

#### Cycle 2: Search by City
- **RED**: searchService.test.js with case-insensitive tests (commit a7b6629)
- **GREEN**: Implemented searchByCity pure function (commit 423ca6a)
- **Coverage Issue**: Dropped to 75% branch coverage
- **Fix**: Added more Property tests → 100% coverage restored
- **Result**: 11 passing tests, 100% coverage

#### Cycle 3: Price Range Filter
- **RED**: priceFilter.test.js with boundary tests (commit 7759dff)
- **GREEN**: Implemented filterByPriceRange (commit 4e3b547)
- **Result**: 17 passing tests, 100% coverage maintained

#### Cycle 4: Refactor & Integration
- **REFACTOR**: Added index.js barrel export (commit 5be1e71)
- **INTEGRATION**: Combined filters, tested composition
- **DOCUMENTATION**: Module README + project README (commit f486490)
- **Result**: 20 passing tests, professional API

### Key Decisions & Patterns Used

**1. Result Pattern Over Exceptions**
- **Why**: Functional approach, explicit error handling
- **How**: `Result.ok()` / `Result.fail()` with `isSuccess` flag
- **Benefit**: No try/catch needed, composable

**2. Pure Functions for Business Logic**
- **Why**: Testable, predictable, no side effects
- **Examples**: searchByCity, filterByPriceRange
- **Benefit**: 100% coverage achievable, easy composition

**3. Factory Pattern for Entities**
- **Why**: Validation at creation, no invalid state possible
- **Implementation**: `Property.create()` static method
- **Benefit**: Fail-fast, type safety

**4. Barrel Export (index.js)**
- **Why**: Clean public API, encapsulation
- **Pattern**: Re-export selected modules
- **Benefit**: Consumers import from one place

**5. Co-located Tests**
- **Why**: Related code stays together
- **Structure**: `*.test.js` next to `*.js`
- **Benefit**: Easy to find, modify together

### File Organization Success

All files stayed under 100-line limit:
- Property.js: 69 lines
- searchService.js: 27 lines
- priceFilter.js: 26 lines
- index.js: 15 lines
- Property.test.js: 96 lines (split if needed later)

**No refactoring needed** - planning paid off.

### Git Workflow Excellence

**Conventional Commits Used**:
- `test(...)`: RED phase commits
- `feat(...)`: GREEN phase commits
- `refactor(...)`: REFACTOR phase commits
- `docs(...)`: Documentation commits

**Atomic Commits**: Each commit is:
- ✅ One logical change
- ✅ Doesn't break build
- ✅ Has descriptive message
- ✅ Shows skills in commit body

**Example Perfect Commit**:
```
feat(search): implement searchByCity with 100% coverage (GREEN)

Implementation:
✓ searchByCity() pure function
✓ Case-insensitive city matching

Test results:
✓ 11/11 tests passing
✓ 100% coverage maintained

Skills: TDD green phase, pure functions, 100% test coverage
```

### Integration Testing Win

Discovered **commutativity** of filters:
```javascript
// Order doesn't matter for independent filters
searchByCity(filterByPriceRange(props, min, max), city)
===
filterByPriceRange(searchByCity(props, city), min, max)
```

This proves filters are truly independent (good design).

### Challenges & Solutions

**Challenge 1**: USB Drive Permission Issues
- **Problem**: npm install failed with EACCES on symlink
- **Root Cause**: ChromeOS USB filesystem limitations
- **Solution**: Copied project to ~/home-harbor
- **Lesson**: Work in proper Linux filesystem for Node projects

**Challenge 2**: Coverage Dropped Below 80%
- **Problem**: Adding new module lowered overall coverage
- **Solution**: Added missing test cases for Property.js
- **Lesson**: Monitor coverage after each GREEN phase

**Challenge 3**: README was Auto-generated Boilerplate
- **Problem**: npm init created generic README
- **Solution**: Overwrote with portfolio-focused content
- **Lesson**: Verify all generated files before committing

### Workflow Adherence

✅ **Phase 0**: Foundation complete (LESSONS_LEARNED, TODO, configs)
✅ **Phase 1**: TDD cycles (RED → GREEN → REFACTOR)
✅ **Phase 2**: Multiple features implemented
✅ **Phase 3**: Integration tests added
✅ **Phase 4**: Documentation complete

**Quality Gates Passed**:
- ✅ All tests pass (20/20)
- ✅ Coverage ≥80% (100% actual)
- ✅ All files ≤100 lines
- ✅ Linter passes
- ✅ Conventional commits
- ✅ Security hooks active

### Metrics

**Time Invested**: ~2 hours (including research, setup, iteration)
**Commits**: 12 commits (all professional quality)
**Tests Written**: 20 tests
**Code Coverage**: 100%
**Files Created**: 10 files (all documented)
**Lines of Code**: ~250 production + ~300 test

### Next Session Priorities

1. ⏳ Database integration (Repository pattern)
2. ⏳ Lambda handler (API Gateway integration)
3. ⏳ React frontend (first component)
4. ⏳ GitHub Actions CI/CD
5. ⏳ AWS deployment

**Immediate Next**: Repository pattern for database abstraction (keeping pure functions pure).

---

**Last Updated**: January 31, 2026, Session 2

---

## Session 3 - January 31, 2026

### Real-World Data Discovery

**Decision**: Use Connecticut Real Estate Sales 2001-2023 dataset
- **Source**: https://data.ct.gov (open data portal)
- **License**: Public Domain
- **Size**: 1M+ property sales records
- **Fields**: Address, town, sale price, assessed value, property type, residential type, sale date, location coordinates
- **Format**: CSV with API access
- **Quality**: Government-maintained, annually updated, comprehensive

**Why This Dataset**:
- ✅ Real-world data (not mock/synthetic)
- ✅ Public domain (no licensing issues)
- ✅ Rich attributes (14 columns)
- ✅ Large enough to demonstrate performance
- ✅ Geographic diversity (all CT towns)
- ✅ Historical data (2001-2023)
- ✅ Professional provenance (CT Office of Policy & Management)

**Alternatives Considered**:
- Zillow API: Requires API key, rate limits
- Kaggle datasets: Various licenses, unknown quality
- HUD data: Focused on housing affordability, not property search
- Philadelphia/Allegheny datasets: Smaller, regional

**Architecture Implications**:
- Need CSV data loader (new component)
- Property entity must map to CT schema
- Add filtering: property type, residential type, town
- Add sorting: sale date, price, assessed value
- Consider caching strategy for 1M+ records

**Next Steps**:
1. Download sample CT data for testing
2. Design data mapper (CT schema → Property entity)
3. Implement CSV loader with TDD
4. Extend search/filter features
5. Add performance optimization (indexing)

---

**Last Updated**: January 31, 2026, Session 3
