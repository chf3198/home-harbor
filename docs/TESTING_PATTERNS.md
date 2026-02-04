# Testing Patterns

**Purpose**: Unit testing, integration testing, and test organization patterns.

---

## Test File Structure
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

## Test Organization
- **Nested describe blocks** mirroring code structure
- **Business logic focus** - Test behavior, not implementation
- **80%+ coverage target** - Functions, branches, lines
- **Arrange-Act-Assert** pattern in each test

## Mock Strategy
- **Minimal mocking** - Prefer real dependencies
- **Interface abstraction** - Mock external services only
- **Test doubles** for AWS SDK calls

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
- [CODE_STRUCTURE_PATTERNS.md](CODE_STRUCTURE_PATTERNS.md) - Code structure
- [FUNCTION_DESIGN_PATTERNS.md](FUNCTION_DESIGN_PATTERNS.md) - Function patterns
- [LAMBDA_TESTING_PATTERNS.md](LAMBDA_TESTING_PATTERNS.md) - Lambda testing