# Lambda Testing Patterns

**Purpose**: Unit testing, integration testing, and mocking strategies for Lambda functions.

---

## Unit Test Structure
```typescript
// handler.test.ts
import { handler } from '../src/handler';

describe('Lambda Handler', () => {
  describe('successful execution', () => {
    it('should process valid input', async () => {
      const event = { /* valid test data */ };
      const result = await handler(event, {});

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should return error for invalid input', async () => {
      const event = { /* invalid test data */ };
      const result = await handler(event, {});

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('validation failed');
    });
  });
});
```

## Mock Strategy
```typescript
// Minimal mocking - mock AWS services only
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const dynamoMock = mockClient(DynamoDBClient);

beforeEach(() => {
  dynamoMock.reset();
});

it('should handle DynamoDB errors', async () => {
  dynamoMock.onAnyCommand().rejects(new Error('DynamoDB failure'));

  const result = await handler(event, {});
  expect(result.isFailure).toBe(true);
});
```

## Environment Mocking
```typescript
// Mock environment variables for testing
const mockEnv = {
  PROPERTIES_TABLE: 'test-table',
  AWS_REGION: 'us-east-1'
};

beforeEach(() => {
  process.env = { ...process.env, ...mockEnv };
});

afterEach(() => {
  // Clean up environment variables
  Object.keys(mockEnv).forEach(key => delete process.env[key]);
});
```

## Integration Test Pattern
```typescript
// Test with real AWS services (in isolated environment)
describe('Integration Tests', () => {
  it('should write to DynamoDB', async () => {
    const testItem = { id: 'test-123', name: 'Test Property' };

    const result = await saveProperty(testItem);

    expect(result.isSuccess).toBe(true);

    // Verify data was actually written
    const retrieved = await getProperty('test-123');
    expect(retrieved.value).toEqual(testItem);
  });
});
```

## Test Data Factories
```typescript
// Consistent test data creation
export const createTestProperty = (overrides = {}) => ({
  id: 'prop-123',
  address: '123 Main St',
  price: 300000,
  bedrooms: 3,
  ...overrides
});

export const createTestEvent = (body = {}) => ({
  body: JSON.stringify(body),
  headers: { 'content-type': 'application/json' }
});

it('should validate property data', () => {
  const validProperty = createTestProperty();
  const result = validateProperty(validProperty);

  expect(result.isSuccess).toBe(true);
});
```

---

**Cross-References**:
- [LAMBDA_HANDLER_PATTERNS.md](LAMBDA_HANDLER_PATTERNS.md) - Handler patterns
- [LAMBDA_CONFIG_PATTERNS.md](LAMBDA_CONFIG_PATTERNS.md) - Configuration patterns
- [CODING_STANDARDS.md](CODING_STANDARDS.md) - Testing patterns