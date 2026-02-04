# Code Structure Patterns

**Purpose**: File organization, naming conventions, and import/export patterns for consistent code structure.

---

## File Organization
- **≤100 lines per file** - Systematic refactoring required if exceeded
- **Single responsibility** - One concept per file
- **ES modules** - Use `import`/`export` syntax
- **Barrel exports** - `index.js` files for clean imports

## Directory Structure
```
module/
├── index.js          # Public API (barrel export)
├── core.js           # Main logic
├── utils.js          # Helper functions
├── types.js          # Type definitions
└── *.test.js         # Unit tests
```

## Naming Conventions

### Files & Directories
- **camelCase** for files: `propertySearch.js`, `csvLoader.js`
- **kebab-case** for directories: `property-search/`, `ai-assistant/`
- **PascalCase** for classes: `Property`, `ChatAssistant`
- **UPPER_SNAKE_CASE** for constants: `MAX_RETRIES`, `DEFAULT_TIMEOUT`

### Variables & Functions
- **camelCase** for variables/functions: `processData()`, `userInput`
- **descriptive names** - `filterByPriceRange()` not `filter()`
- **boolean prefixes** - `isValid`, `hasData`, `canProcess`

## Import/Export Patterns

### Relative Imports Within Modules
```javascript
// ✅ Within property-search module
import { validatePrice } from './validation.js';
import { Property } from './Property.js';

// ❌ Absolute imports for internal module references
import { validatePrice } from '../../../shared/validation.js';
```

### Absolute Imports for Cross-Module
```javascript
// ✅ Cross-module references
import { Result } from '../../../shared/Result.js';
import { logger } from '../../../utils/logger.js';
```

### Barrel Exports
```javascript
// index.js - Clean public API
export { Property } from './Property.js';
export { filterByPriceRange } from './priceFilter.js';
export { sortProperties } from './propertySorter.js';

// Usage
import { Property, filterByPriceRange } from './property-search/index.js';
```

---

**Cross-References**:
- [FUNCTION_DESIGN_PATTERNS.md](FUNCTION_DESIGN_PATTERNS.md) - Function patterns
- [TESTING_PATTERNS.md](TESTING_PATTERNS.md) - Testing approaches
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Overall organization