# Documentation Patterns

**Purpose**: JSDoc, comments, and documentation standards for maintainable code.

---

## JSDoc for Public APIs
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

## Semantic Comment Tags
```javascript
/**
 * @fileoverview Property search functionality
 * @intent Provide efficient property filtering and sorting
 * @example
 * const results = filterByPriceRange(properties, 200000, 400000);
 */
```

## Implementation Comments
```javascript
// Use streaming to handle large CSV files without memory issues
const processLargeFile = async (filePath) => {
  // Implementation with streaming
};
```

## Development Standards
- **Versioning**: Semantic versioning; update CHANGELOG.md unreleased section
- **Code Comments**: JSDoc for public functions; semantic tags (@fileoverview, @intent, @example)
- **File Size**: Maintain ≤100 lines; refactor if exceeded
- **Organization**: Clean architecture; relative imports within modules; no circular dependencies
- **Git**: Frequent commits with conventional messages (feat:, fix:, docs:); feature branches
- **Simplicity**: Free tiers (AWS, OpenRouter); CDN for styling; avoid unnecessary dependencies

---

**Cross-References**:
- [CODE_STRUCTURE_PATTERNS.md](CODE_STRUCTURE_PATTERNS.md) - Code structure
- [WORKFLOW.md](WORKFLOW.md) - Development process
- [LESSONS_LEARNED.md](LESSONS_LEARNED.md) - Current patterns