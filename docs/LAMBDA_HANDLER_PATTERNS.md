# Lambda Handler Patterns

**Purpose**: Core patterns for AWS Lambda function handlers, error handling, and structure.

---

## Handler Structure

### Standard Lambda Handler
```typescript
export const handler = async (event: any, context: any): Promise<Result<any>> => {
  try {
    // 1. Validate input
    const validation = validateInput(event);
    if (validation.isFailure) return validation;

    // 2. Process data
    const result = await processData(event);
    return Result.ok(result);
  } catch (error) {
    // 3. Handle errors
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

**Cross-References**:
- [LAMBDA_DATA_PATTERNS.md](LAMBDA_DATA_PATTERNS.md) - Data processing patterns
- [LAMBDA_CONFIG_PATTERNS.md](LAMBDA_CONFIG_PATTERNS.md) - Configuration patterns
- [CODING_STANDARDS.md](CODING_STANDARDS.md) - General coding patterns