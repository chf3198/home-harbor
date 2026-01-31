# Property Search Module

Feature-focused module for searching and filtering real estate properties.

## Architecture

Following **Screaming Architecture** principles - this folder communicates "I search properties!"

```
src/property-search/
├── index.js              # Public API (barrel export)
├── Property.js           # Domain entity with validation
├── searchService.js      # City search logic
├── priceFilter.js        # Price range filtering
└── *.test.js             # Co-located unit tests
```

## Usage

```javascript
const { Property, searchByCity, filterByPriceRange } = require('./property-search');

// Create properties
const property = Property.create({
  address: '123 Main St',
  city: 'Columbus',
  state: 'OH',
  price: 250000,
  bedrooms: 3,
  bathrooms: 2
});

if (property.isSuccess) {
  const prop = property.getValue();
}

// Search by city
const columbusProps = searchByCity(properties, 'Columbus');

// Filter by price
const affordable = filterByPriceRange(properties, 100000, 300000);

// Combine filters
const result = filterByPriceRange(
  searchByCity(properties, 'Columbus'),
  200000,
  300000
);
```

## Design Patterns

### 1. Result Pattern
No exceptions thrown - use `Result.isSuccess` to check validity:
```javascript
const result = Property.create(data);
if (!result.isSuccess) {
  console.error(result.error);
}
```

### 2. Pure Functions
All search/filter functions are pure (no side effects):
- Same inputs = same outputs
- Easy to test
- Easy to compose

### 3. Factory Pattern
`Property.create()` instead of `new Property()` for controlled instantiation.

## Test Coverage

✓ 100% code coverage (all files)
✓ Unit tests co-located with implementation
✓ Integration tests in `tests/` directory

## File Organization

Following FILE_ORGANIZATION.md guidelines:
- ✓ All files ≤100 lines
- ✓ One responsibility per file
- ✓ Barrel export for clean imports
- ✓ Co-located tests

## Next Features

- [ ] Bedroom/bathroom filtering
- [ ] Sort by price/size
- [ ] Pagination
- [ ] Full-text search
- [ ] Database integration (Repository pattern)
