# Function Design Patterns

**Purpose**: Function design, error handling, and validation patterns for reliable code.

---

## Function Design

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

**Cross-References**:
- [CODE_STRUCTURE_PATTERNS.md](CODE_STRUCTURE_PATTERNS.md) - Code structure
- [TESTING_PATTERNS.md](TESTING_PATTERNS.md) - Testing approaches
- [LAMBDA_HANDLER_PATTERNS.md](LAMBDA_HANDLER_PATTERNS.md) - Lambda handlers