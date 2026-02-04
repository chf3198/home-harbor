# Coding Standards & Patterns

**Purpose**: Specific coding conventions and patterns for VS Code Copilot implementation. Focus on actionable guidelines for consistent, maintainable code.

---

## Code Structure Patterns

### File Organization
- **≤100 lines per file** - Systematic refactoring required if exceeded
- **Single responsibility** - One concept per file
- **ES modules** - Use `import`/`export` syntax
- **Barrel exports** - `index.js` files for clean imports

### Directory Structure
```
module/
├── index.js          # Public API (barrel export)
├── core.js           # Main logic
├── utils.js          # Helper functions
├── types.js          # Type definitions
└── *.test.js         # Unit tests
```

---

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

---

## Function Design Patterns

### Pure Functions (80%+ of codebase)
```javascript
// ✅ Pure function - predictable, testable
const calculateTax = (price, rate) => price * rate;

// ❌ Side effect - unpredictable
const calculateTax = (price, rate) => {
  console.log(`Calculating tax for $${price}`);
  return price * rate;
};
```

### Result Pattern for Error Handling
```javascript
// ✅ Explicit error handling
const createProperty = (data) => {
  if (!data.price || data.price <= 0) {
    return Result.fail('Price must be positive');
  }
  return Result.ok(new Property(data));
};

// ❌ Throwing exceptions
const createProperty = (data) => {
  if (!data.price || data.price <= 0) {
    throw new Error('Price must be positive');
  }
  return new Property(data);
};
```

### Parameter Validation
```javascript
const filterByPriceRange = (properties, minPrice, maxPrice) => {
  if (!Array.isArray(properties)) {
    return Result.fail('Properties must be an array');
  }
  if (typeof minPrice !== 'number' || minPrice < 0) {
    return Result.fail('Min price must be a non-negative number');
  }
  // ... validation logic
};
```

---

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

## Testing Patterns

### Test File Structure
```javascript
// propertySorter.test.js
describe('Property Sorter', () => {
  describe('sortByPrice', () => {
    it('should sort properties ascending by price', () => {
      // Test implementation
    });

    it('should sort properties descending by price', () => {
      // Test implementation
    });
  });
});
```

### Test Organization
- **Nested describe blocks** mirroring code structure
- **Business logic focus** - Test behavior, not implementation
- **80%+ coverage target** - Functions, branches, lines
- **Arrange-Act-Assert** pattern in each test

### Mock Strategy
- **Minimal mocking** - Prefer real dependencies
- **Interface abstraction** - Mock external services only
- **Test doubles** for AWS SDK calls

---

## Error Handling Patterns

### Validation on Entry
```javascript
const processPropertyData = (data) => {
  // Validate input immediately
  const validation = validatePropertyData(data);
  if (validation.isFailure) {
    return validation; // Return Result.fail
  }

  // Process valid data
  return processValidData(data);
};
```

### Descriptive Error Messages
```javascript
// ✅ Specific, actionable errors
return Result.fail('Property price must be a positive number, received: -100');

// ❌ Generic errors
return Result.fail('Invalid input');
```

### Error Context Preservation
```javascript
const processWithContext = async (data) => {
  try {
    const result = await externalApiCall(data);
    return Result.ok(result);
  } catch (error) {
    // Include context for debugging
    return Result.fail(`External API call failed for property ${data.id}: ${error.message}`);
  }
};
```

---

## Documentation Standards

### JSDoc for Public APIs
```javascript
/**
 * Filters properties by price range
 * @param {Property[]} properties - Array of properties to filter
 * @param {number} minPrice - Minimum price (inclusive)
 * @param {number} maxPrice - Maximum price (inclusive)
 * @returns {Result<Property[]>} Filtered properties or error
 */
const filterByPriceRange = (properties, minPrice, maxPrice) => {
  // Implementation
};
```

### Semantic Comment Tags
```javascript
/**
 * @fileoverview Property search functionality
 * @intent Provide efficient property filtering and sorting
 * @example
 * const results = filterByPriceRange(properties, 200000, 400000);
 */
```

### Implementation Comments
```javascript
// Use streaming to handle large CSV files without memory issues
const processLargeFile = async (filePath) => {
  // Implementation with streaming
};
```

---

## Performance Patterns

### Memory Efficiency
```javascript
// ✅ Streaming for large files
const processCsvFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};
```

### Caching Strategy
```javascript
// ✅ Intelligent caching with TTL
const getCachedResult = async (key) => {
  const cached = await cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const fresh = await fetchFreshData(key);
  await cache.set(key, { data: fresh, expires: Date.now() + TTL });
  return fresh;
};
```

---

## AWS SDK Patterns

### Client Initialization
```javascript
// ✅ Initialize once at module level
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1'
});

// ❌ Initialize in functions (inefficient)
const uploadToS3 = async (data) => {
  const s3Client = new S3Client({ region: 'us-east-1' });
  // ...
};
```

### Error Handling
```javascript
// ✅ AWS-specific error handling
try {
  await s3Client.send(command);
} catch (error) {
  if (error.name === 'NoSuchKey') {
    return Result.fail('File not found in S3');
  }
  if (error.name === 'AccessDenied') {
    return Result.fail('Insufficient S3 permissions');
  }
  return Result.fail(`S3 operation failed: ${error.message}`);
}
```

---

## Code Review Checklist

### Automated Checks
- [ ] ESLint passes with no errors
- [ ] Tests pass with 80%+ coverage
- [ ] File size ≤100 lines
- [ ] No console.log statements in production code

### Manual Review
- [ ] Function names are descriptive and follow conventions
- [ ] Error messages are specific and actionable
- [ ] Complex logic has explanatory comments
- [ ] Public APIs have JSDoc documentation
- [ ] Result pattern used for error handling

---

**Cross-References**:
- [TECH_STACK.md](TECH_STACK.md) - Infrastructure and tools
- [WORKFLOW.md](WORKFLOW.md) - Development process
- [LAMBDA_HANDLER_PATTERNS.md](LAMBDA_HANDLER_PATTERNS.md) - Lambda implementation
- [LAMBDA_DATA_PATTERNS.md](LAMBDA_DATA_PATTERNS.md) - Data processing
- [LAMBDA_CONFIG_PATTERNS.md](LAMBDA_CONFIG_PATTERNS.md) - Configuration
- [LAMBDA_TESTING_PATTERNS.md](LAMBDA_TESTING_PATTERNS.md) - Testing
- [LAMBDA_DEPLOYMENT_PATTERNS.md](LAMBDA_DEPLOYMENT_PATTERNS.md) - Deployment
- [LESSONS_LEARNED.md](LESSONS_LEARNED.md) - Current patterns</content>
<parameter name="filePath">/mnt/chromeos/removable/SSD Drive/usb_backup_2026-02-02/repos/home-harbor/docs/CODING_STANDARDS.md