# File Organization & Modularity Patterns

**Golden Rule**: **Every file must be ≤100 lines.** No exceptions.

---

## Why Small Files Matter

Research from Martin Fowler ("Presentation Domain Data Layering"), Uncle Bob ("Screaming Architecture"), and modern architectural patterns shows:

- **Cognitive Load**: Humans (and AI) can hold ~7±2 items in working memory. Small files = easier reasoning.
- **Testability**: Small modules are easier to test in isolation.
- **Changeability**: Small files reduce merge conflicts and blast radius.
- **Screaming Architecture**: Project structure should communicate WHAT the system does, not which framework it uses.
- **Single Responsibility**: One file, one cohesive purpose.

---

## How to Keep Files Small: 6 Core Patterns

### 1. **Barrel Exports (Index Files)**

Use `index.js` to re-export modules from a directory.

**Example:**
```javascript
// src/domain/property/index.js (15 lines)
export { Property } from './Property';
export { PropertyValidator } from './PropertyValidator';
export { PropertyRepository } from './PropertyRepository';
export { 
  InvalidPropertyError,
  PropertyNotFoundError 
} from './errors';
```

**Usage:**
```javascript
// Instead of:
import { Property } from './domain/property/Property';
import { PropertyValidator } from './domain/property/PropertyValidator';

// Do this:
import { Property, PropertyValidator } from './domain/property';
```

**Benefits**: 
- Clean imports
- Easy refactoring (change internals without touching consumers)
- Clear module boundaries

---

### 2. **Feature Folders (Screaming Architecture)**

Organize by **what the app does**, not technical layers.

**❌ Bad (framework-centric):**
```
src/
├── controllers/    # All controllers mixed together
├── models/         # All models mixed together
├── views/          # All views mixed together
└── services/       # All services mixed together
```

**✅ Good (feature-centric):**
```
src/
├── property-search/       # "I search properties!"
│   ├── index.js           # Barrel export (10 lines)
│   ├── SearchService.js   # Business logic (85 lines)
│   ├── SearchService.test.js (95 lines)
│   ├── searchValidation.js (45 lines)
│   └── SearchRepository.js (90 lines)
├── user-auth/             # "I handle authentication!"
│   ├── index.js
│   ├── AuthService.js
│   └── AuthService.test.js
└── favorites/             # "I manage user favorites!"
    ├── index.js
    ├── FavoritesService.js
    └── FavoritesService.test.js
```

**Benefit**: New developer (or recruiter!) sees WHAT the system does at first glance.

**Reference**: Uncle Bob's "Screaming Architecture" - your architecture should scream the business intent, not "I'm using Express!"

---

### 3. **Extract Pure Functions**

Split complex files by extracting helper functions into separate modules.

**Before (120 lines - TOO LARGE):**
```javascript
// PropertyService.js
class PropertyService {
  async search(params) {
    // 40 lines of validation logic
    // 30 lines of query building
    // 30 lines of result formatting
    // 20 lines of error handling
  }
}
```

**After (4 files, all <100 lines):**
```javascript
// PropertyService.js (60 lines)
import { validateSearchParams } from './validation';
import { buildQuery } from './queryBuilder';
import { formatProperties } from './formatters';

class PropertyService {
  async search(params) {
    const validated = validateSearchParams(params);
    const query = buildQuery(validated);
    const results = await this.repo.query(query);
    return formatProperties(results);
  }
}

// validation.js (45 lines)
export function validateSearchParams(params) { 
  /* validation logic */ 
}

// queryBuilder.js (70 lines)
export function buildQuery(params) { 
  /* query construction */ 
}

// formatters.js (55 lines)
export function formatProperties(props) { 
  /* formatting logic */ 
}
```

**Benefit**: Each file has ONE reason to change. Easier to test, maintain, and understand.

---

### 4. **Dependency Injection for Testability**

Keep files small by injecting dependencies instead of creating them internally.

**❌ Bad (hard to test, grows large):**
```javascript
// PropertyService.js - Will grow to 200+ lines
class PropertyService {
  constructor() {
    this.db = new Database();       // Can't mock in tests!
    this.cache = new RedisCache();  // Can't mock in tests!
    this.logger = new Logger();     // Can't mock in tests!
  }
  
  // Methods must handle all db/cache/logging complexity inline
  async search(params) {
    // Database connection logic here
    // Cache checking logic here
    // Logging logic here
    // Business logic buried in infrastructure code
  }
}
```

**✅ Good (easy to test, stays small):**
```javascript
// PropertyService.js (40 lines)
class PropertyService {
  constructor(repo, cache, logger) {
    this.repo = repo;      // Injected
    this.cache = cache;    // Injected
    this.logger = logger;  // Injected
  }
  
  async search(params) {
    // Pure business logic only
    // Infrastructure complexity hidden in injected dependencies
  }
}

// PropertyService.test.js (80 lines)
const mockRepo = { query: jest.fn() };
const mockCache = { get: jest.fn(), set: jest.fn() };
const mockLogger = { info: jest.fn() };

const service = new PropertyService(mockRepo, mockCache, mockLogger);
// Easy to test!
```

**Benefit**: 
- Business logic stays small and focused
- 100% testable without database/cache/network
- Infrastructure complexity isolated

---

### 5. **Separate Interface from Implementation**

Keep public APIs small, hide complexity in internal modules.

**Structure:**
```
src/property-search/
├── index.js                    # Public API only (20 lines)
├── SearchService.js            # Orchestration (60 lines)
├── internal/                   # Private implementation
│   ├── queryOptimizer.js       # (95 lines)
│   ├── cacheStrategy.js        # (80 lines)
│   └── resultPaginator.js      # (70 lines)
└── SearchService.test.js       # Tests public API only
```

**index.js (Public API):**
```javascript
// Only expose what consumers need
export { SearchService } from './SearchService';
export { SearchParams } from './types';
// Internal modules NOT exported
```

**Benefit**: 
- Consumers see clean, simple interface
- Refactor internals without breaking consumers
- Clear separation of public vs private

**Reference**: This follows the "Facade" pattern and principles from "Presentation Domain Data Layering" (Martin Fowler).

---

### 6. **Co-locate Related Code**

Keep tests, types, and implementation together in feature folders.

**✅ Good structure:**
```
src/property-search/
├── index.js                           # Barrel export
├── SearchService.js                   # Implementation (80 lines)
├── SearchService.test.js              # Unit tests (95 lines)
├── SearchService.integration.test.js  # Integration tests (90 lines)
├── types.js                           # TypeScript/JSDoc types (40 lines)
├── errors.js                          # Custom error classes (35 lines)
└── README.md                          # Module documentation
```

**Benefit**: 
- Change a feature → all related files are adjacent
- Easy to find what you need
- Natural module boundaries

**Reference**: Kent C. Dodds' "Colocation" principle.

---

## File Size Enforcement Strategy

### During Planning (PHASE 1)

1. **Estimate line counts** for each planned module
2. If estimate >80 lines → **plan to split** using patterns above
3. Document structure in design doc
4. Justify any file >90 lines in commit message

### During Development (PHASE 2-3)

**Pre-commit hook** to enforce 100-line limit:

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Find all JavaScript files over 100 lines
OVERLIMIT=$(find src -name "*.js" -exec wc -l {} \; | awk '$1 > 100 {print}')

if [ -n "$OVERLIMIT" ]; then
  echo "❌ ERROR: Files exceed 100-line limit:"
  echo "$OVERLIMIT"
  echo ""
  echo "See .github/FILE_ORGANIZATION.md for refactoring patterns"
  exit 1
fi

echo "✅ All files under 100 lines"
```

**Install hook:**
```bash
chmod +x .git/hooks/pre-commit
```

### During Code Review

**Quality gate checklist:**
- [ ] All source files ≤100 lines
- [ ] Test files ≤100 lines (split into multiple suites if needed)
- [ ] Legitimate exceptions documented (generated code, fixtures)

---

## When Files Legitimately Grow Large

**Rare legitimate exceptions:**
- Generated code (GraphQL schemas, Protobuf, etc.)
- Configuration files (webpack.config.js, tsconfig.json)
- Large test fixtures/mock data

**How to handle:**
1. Add comment at top: `/* GENERATED - DO NOT EDIT */` or `/* FIXTURE - Large mock data */`
2. Move to dedicated directory: `generated/` or `fixtures/`
3. Document why in README.md
4. Exclude from pre-commit hook:
   ```bash
   # Skip generated and fixture files
   find src -name "*.js" -not -path "*/generated/*" -not -path "*/fixtures/*" -exec wc -l {} \;
   ```

---

## Linking & Cross-Referencing

### Use JSDoc for Navigation

```javascript
/**
 * Search properties by city
 * @see {@link PropertyValidator} for validation rules
 * @see {@link PropertyRepository} for data access
 * @see {@link https://github.com/user/repo/blob/main/docs/search-api.md}
 * @param {SearchParams} params - Search parameters
 * @returns {Promise<Property[]>}
 * @throws {InvalidSearchError} If params are invalid
 */
export async function searchByCity(params) { 
  /* ... */ 
}
```

### Use README.md in Each Feature Folder

```markdown
# Property Search Module

## Architecture
```
┌──────────────┐
│ SearchService│ ← Entry point
└──────┬───────┘
       │
       ├──→ validation.js      (Input validation)
       ├──→ queryBuilder.js    (SQL construction)
       ├──→ SearchRepository   (Database access)
       └──→ formatters.js      (Response formatting)
```

## Files
- `SearchService.js` - Main orchestration (85 lines)
- `validation.js` - Input validation (45 lines)
- `queryBuilder.js` - Query construction (70 lines)
- `formatters.js` - Response formatting (55 lines)
- `SearchRepository.js` - Database access (90 lines)

## Flow
1. SearchService receives request
2. validation.js validates params
3. queryBuilder.js builds SQL
4. SearchRepository queries database
5. formatters.js formats response
6. SearchService returns result

## Testing
- Unit tests: `SearchService.test.js` (95 lines)
- Integration tests: `SearchService.integration.test.js` (90 lines)
```

---

## AI Agent Advantage

Unlike human developers, you have:
- ✅ **No cognitive fatigue** from file switching
- ✅ **Perfect recall** of file contents within session
- ✅ **Instant analysis** of entire codebase structure
- ✅ **Parallel processing** of multiple files

**Leverage this**: Keep files small for **recruiter readability** and **long-term maintainability**, not because of your own limitations.

**Portfolio Goal**: Demonstrate to Realtor.com recruiter that you understand:
- **Clean Architecture** principles
- **Separation of Concerns**
- **Testable Design**
- **Professional Code Organization**

---

## Quick Reference

| When file grows >80 lines | Apply pattern                  |
|---------------------------|--------------------------------|
| Multiple responsibilities | **Extract Pure Functions** (#3)|
| Hard to test             | **Dependency Injection** (#4)  |
| Mixing concerns          | **Feature Folders** (#2)       |
| Complex imports          | **Barrel Exports** (#1)        |
| Internal complexity      | **Separate Interface** (#5)    |
| Related code scattered   | **Co-locate** (#6)             |

---

## Resources

- **Martin Fowler**: ["Presentation Domain Data Layering"](https://martinfowler.com/bliki/PresentationDomainDataLayering.html)
- **Uncle Bob**: ["Screaming Architecture"](https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html)
- **Khalil Stemmler**: ["Organizing App Logic with Clean Architecture"](https://khalilstemmler.com/articles/software-design-architecture/organizing-app-logic/)
- **Kent C. Dodds**: "Colocation" principle
- **Patterns.dev**: Modern architecture patterns

---

**Related Documents:**
- [DEVELOPMENT_WORKFLOW.md](.github/DEVELOPMENT_WORKFLOW.md) - Full workflow
- [TESTABLE_FUNCTIONAL_ARCHITECTURE.md](.github/TESTABLE_FUNCTIONAL_ARCHITECTURE.md) - Architecture chosen
- [ENGINEERING_STANDARDS.md](.github/ENGINEERING_STANDARDS.md) - Coding standards
