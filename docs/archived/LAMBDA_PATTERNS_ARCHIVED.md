# Lambda Function Patterns

**Purpose**: Specific patterns and conventions for implementing AWS Lambda functions in HomeHarbor. Focus on code structure, error handling, and best practices.

---

## Function Structure

### Handler Pattern
```typescript
// ✅ Standard Lambda handler structure
export const handler = async (event: any, context: any): Promise<Result<any>> => {
  try {
    // 1. Validate input
    const validation = validateInput(event);
    if (validation.isFailure) {
      return validation;
    }

    // 2. Process data
    const result = await processData(event);

    // 3. Return success
    return Result.ok(result);
  } catch (error) {
    // 4. Handle errors
    return Result.fail(`Lambda execution failed: ${error.message}`);
  }
};
```

### Separation of Concerns
```typescript
// handler.ts - Entry point
export const handler = async (event, context) => {
  const input = parseEvent(event);
  return await processBusinessLogic(input);
};

// businessLogic.ts - Core processing
export const processBusinessLogic = async (input) => {
  const data = await fetchData(input);
  const processed = transformData(data);
  await storeResults(processed);
  return processed;
};

// utils.ts - Helpers
export const parseEvent = (event) => { /* ... */ };
export const validateInput = (input) => { /* ... */ };
```

---

## Error Handling Patterns

### AWS-Specific Errors
```typescript
try {
  await s3Client.send(command);
} catch (error) {
  switch (error.name) {
    case 'NoSuchKey':
      return Result.fail('Requested S3 object does not exist');
    case 'AccessDenied':
      return Result.fail('Insufficient S3 permissions');
    case 'ThrottlingException':
      return Result.fail('S3 request rate exceeded, retry later');
    default:
      return Result.fail(`S3 operation failed: ${error.message}`);
  }
}
```

### DynamoDB Error Handling
```typescript
try {
  await dynamoClient.send(batchWriteCommand);
} catch (error) {
  if (error.name === 'ValidationException') {
    return Result.fail('Invalid data format for DynamoDB');
  }
  if (error.name === 'ProvisionedThroughputExceededException') {
    return Result.fail('DynamoDB capacity exceeded, retry with backoff');
  }
  return Result.fail(`DynamoDB operation failed: ${error.message}`);
}
```

### Timeout Handling
```typescript
export const handler = async (event, context) => {
  // Set up timeout warning
  const timeoutWarning = setTimeout(() => {
    console.warn('Lambda approaching timeout');
  }, context.getRemainingTimeInMillis() - 5000);

  try {
    const result = await processWithTimeout(event);
    clearTimeout(timeoutWarning);
    return result;
  } catch (error) {
    clearTimeout(timeoutWarning);
    return Result.fail(`Processing failed: ${error.message}`);
  }
};
```

---

## Data Processing Patterns

### Streaming for Large Files
```typescript
// ✅ Memory-efficient CSV processing
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';

export const processLargeCsv = async (filePath: string) => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];

    createReadStream(filePath)
      .pipe(parse({ skip_empty_lines: true }))
      .on('data', (row) => {
        // Process row immediately to avoid memory buildup
        const processed = processRow(row);
        if (processed) results.push(processed);
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};
```

### Batch Processing
```typescript
// ✅ Efficient DynamoDB batch writes
const BATCH_SIZE = 25; // DynamoDB limit

export const batchWriteItems = async (items: any[]) => {
  const batches = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    batches.push(items.slice(i, i + BATCH_SIZE));
  }

  for (const batch of batches) {
    const command = new BatchWriteItemCommand({
      RequestItems: {
        [TABLE_NAME]: batch.map(item => ({
          PutRequest: { Item: item }
        }))
      }
    });

    await dynamoClient.send(command);
    // Add small delay between batches to avoid throttling
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};
```

---

## Configuration Patterns

### Environment Variables
```typescript
// ✅ Centralized configuration
const config = {
  tableName: process.env.PROPERTIES_TABLE || 'home-harbor-properties-dev',
  bucketName: process.env.DATA_BUCKET || 'home-harbor-data-sources-dev',
  region: process.env.AWS_REGION || 'us-east-1',
  maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  timeout: parseInt(process.env.TIMEOUT_MS || '30000')
};

// Validate configuration on cold start
const validateConfig = () => {
  if (!config.tableName) {
    throw new Error('PROPERTIES_TABLE environment variable is required');
  }
  // ... other validations
};

validateConfig();
```

### Secrets Management
```typescript
// ✅ Secure API key handling
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

let cachedSecrets: any = null;

export const getSecrets = async () => {
  if (cachedSecrets) return cachedSecrets;

  const client = new SecretsManagerClient({});
  const command = new GetSecretValueCommand({
    SecretId: process.env.SECRETS_ARN || 'home-harbor/api-keys-dev'
  });

  const response = await client.send(command);
  cachedSecrets = JSON.parse(response.SecretString || '{}');
  return cachedSecrets;
};
```

---

## Testing Patterns

### Unit Test Structure
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

### Mock Strategy
```typescript
// ✅ Minimal mocking - mock AWS services only
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

---

## Logging Patterns

### Structured Logging
```typescript
// ✅ Consistent log format
const logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      data
    }));
  },

  error: (message: string, error?: any) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error?.message || error
    }));
  }
};

// Usage
logger.info('Processing started', { recordCount: 1000 });
logger.error('DynamoDB write failed', error);
```

### Performance Monitoring
```typescript
// ✅ Execution time tracking
export const withTiming = async (operation: () => Promise<any>, label: string) => {
  const start = Date.now();
  try {
    const result = await operation();
    const duration = Date.now() - start;
    console.log(`Operation "${label}" completed in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`Operation "${label}" failed after ${duration}ms: ${error.message}`);
    throw error;
  }
};
```

---

## Deployment Patterns

### Build Process
```bash
# TypeScript compilation
npm run build

# Create deployment ZIP
npm run package

# Deploy to AWS
npm run deploy
```

### Environment Variables
```typescript
// ✅ Environment-specific configuration
const isProduction = process.env.NODE_ENV === 'production';
const tableSuffix = isProduction ? 'prod' : 'dev';

export const config = {
  propertiesTable: `home-harbor-properties-${tableSuffix}`,
  marketMetricsTable: `home-harbor-market-metrics-${tableSuffix}`,
  aiInsightsTable: `home-harbor-ai-insights-${tableSuffix}`
};
```

---

## Common Patterns Summary

| Pattern | Purpose | Example |
|---------|---------|---------|
| **Result Pattern** | Explicit error handling | `return Result.ok(data)` or `Result.fail(message)` |
| **Early Validation** | Input validation | Check parameters at function entry |
| **Streaming** | Memory efficiency | Process large files without loading entirely |
| **Batching** | Performance | Group operations to reduce API calls |
| **Caching** | Secrets/API keys | Avoid repeated expensive operations |
| **Structured Logging** | Debugging | Consistent JSON log format |
| **Timeout Handling** | Reliability | Monitor Lambda execution time |

---

**Cross-References**:
- [CODING_STANDARDS.md](CODING_STANDARDS.md) - General coding patterns
- [TECH_STACK.md](TECH_STACK.md) - AWS infrastructure details
- [WORKFLOW.md](WORKFLOW.md) - Development process</content>
<parameter name="filePath">/mnt/chromeos/removable/SSD Drive/usb_backup_2026-02-02/repos/home-harbor/docs/LAMBDA_PATTERNS.md