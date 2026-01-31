# Property Search Module

Complete property search system with real-world data integration from Connecticut's open data portal.

## Features

### ✅ Real Data Integration
- **Dataset**: Connecticut Real Estate Sales 2001-2023
- **Source**: [data.ct.gov](https://data.ct.gov/Housing-and-Development/Real-Estate-Sales-2001-2023-GL/5mzw-sjtu)
- **License**: Public Domain
- **Records**: 1M+ property sales
- **Fields**: 14 attributes including address, town, sale price, assessed value, property type, sale date, coordinates

### ✅ Search & Filtering
- **City Search**: Case-insensitive matching
- **Price Range**: Min/max filtering with validation
- **Property Type**: Residential, Commercial, Industrial, Vacant
- **Residential Subtype**: Single Family, Condo, Two Family, Three Family, etc.

### ✅ Sorting
- **Price**: Ascending or descending
- **Assessed Value**: Tax assessment sorting
- **Sale Date**: Oldest or newest first
- **City**: Alphabetical

### ✅ Pagination
- Default: 10 items per page
- Maximum: 100 items per page
- Metadata: totalItems, totalPages, hasNext/PrevPage

## Usage Example

```javascript
const {
  loadCsvFile,
  filterByPropertyType,
  filterByPriceRange,
  sortProperties,
  paginate
} = require('./src/property-search');

// Load real Connecticut data
const result = await loadCsvFile('data/ct-sample-50.csv');
const properties = result.value;

// Filter: Residential properties $200k-$400k
let results = filterByPropertyType(properties, 'Residential');
results = filterByPriceRange(results, 200000, 400000);

// Sort by price ascending
results = sortProperties(results, 'price', 'asc');

// Paginate (5 per page)
const page1 = paginate(results, { page: 1, pageSize: 5 });

console.log(`Found ${page1.totalItems} properties`);
console.log(`Showing page ${page1.page} of ${page1.totalPages}`);
page1.data.forEach(p => {
  console.log(`${p.address} - $${p.price.toLocaleString()}`);
});
```

## Architecture

```
property-search/
├── Property.js              # Domain entity with validation
├── csvLoader.js             # Streaming CSV parser
├── ctDataMapper.js          # CT schema → Property mapping
├── searchService.js         # City search
├── priceFilter.js           # Price range filtering
├── typeFilter.js            # Property/residential type filtering
├── propertySorter.js        # Multi-field sorting
├── paginator.js             # Pagination logic
└── index.js                 # Public API (barrel export)
```

## Design Patterns

- **Result Pattern**: Explicit error handling, no exceptions
- **Pure Functions**: 80%+ functions have no side effects
- **Streaming**: Memory-efficient CSV processing
- **Immutability**: Filters/sort return new arrays
- **Composition**: Functions compose naturally

## Test Coverage

| File               | Statements | Branches | Functions | Lines |
|--------------------|------------|----------|-----------|-------|
| Property.js        | 100%       | 100%     | 100%      | 100%  |
| csvLoader.js       | 85.71%     | 66.66%   | 80%       | 85.71% |
| ctDataMapper.js    | 94.73%     | 88.88%   | 100%      | 94.44% |
| priceFilter.js     | 100%       | 100%     | 100%      | 100%  |
| searchService.js   | 100%       | 100%     | 100%      | 100%  |
| typeFilter.js      | 94.11%     | 87.5%    | 100%      | 94.11% |
| propertySorter.js  | 93.54%     | 78.57%   | 100%      | 96.42% |
| paginator.js       | 100%       | 100%     | 100%      | 100%  |
| **Overall**        | **95.2%**  | **88.78%**| **96.15%**| **95.77%** |

**Tests**: 77 passing  
**Coverage Threshold**: 80% (exceeded)

## File Organization

All files ≤100 lines (enforced by ESLint):
- Property.js: 71 lines
- csvLoader.js: 64 lines
- ctDataMapper.js: 70 lines
- priceFilter.js: 26 lines
- searchService.js: 25 lines
- typeFilter.js: 54 lines
- propertySorter.js: 70 lines
- paginator.js: 58 lines
- index.js: 34 lines

## Data Schema Mapping

**Connecticut Dataset** → **Property Entity**:
- `Address` + `Town` → `address` (combined)
- `Town` → `city`
- `'CT'` → `state` (hardcoded)
- `Sale Amount` → `price` (parsed from currency)
- `Property Type` → `metadata.propertyType`
- `Residential Type` → `metadata.residentialType`
- `Assessed Value` → `metadata.assessedValue`
- `Date Recorded` → `metadata.saleDate`
- `List Year` → `metadata.listYear`

## Next Features

- [ ] Full-text search on address
- [ ] Geographic filtering (lat/lon radius)
- [ ] Date range filtering
- [ ] Multi-sort (e.g., city ASC, price DESC)
- [ ] Faceted search (aggregations)
- [ ] PostgreSQL integration (Repository pattern)
- [ ] GraphQL API
- [ ] Real-time data updates
