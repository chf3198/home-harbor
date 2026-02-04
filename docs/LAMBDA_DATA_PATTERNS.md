# Lambda Data Processing Patterns

**Purpose**: Patterns for efficient data processing, batching, and memory management in Lambda functions.

---

## Streaming for Large Files
```typescript
// Memory-efficient CSV processing
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

## Batch Processing
```typescript
// Efficient DynamoDB batch writes
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

## Memory Management
```typescript
// Process data in chunks to stay within Lambda memory limits
export const processInChunks = async (data: any[], chunkSize: number = 100) => {
  const results = [];

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const processedChunk = await processChunk(chunk);
    results.push(...processedChunk);

    // Allow event loop to process other operations
    await new Promise(resolve => setImmediate(resolve));
  }

  return results;
};
```

## Data Validation Pipeline
```typescript
// Chain validation and transformation
export const processPropertyData = async (rawData: any[]) => {
  return rawData
    .filter(validateRawData)        // Remove invalid records
    .map(transformToProperty)      // Convert to domain objects
    .filter(validateProperty)      // Ensure domain rules
    .map(enrichWithMetadata);      // Add computed fields
};
```

---

**Cross-References**:
- [LAMBDA_HANDLER_PATTERNS.md](LAMBDA_HANDLER_PATTERNS.md) - Handler structure
- [LAMBDA_CONFIG_PATTERNS.md](LAMBDA_CONFIG_PATTERNS.md) - Configuration patterns
- [CODING_STANDARDS.md](CODING_STANDARDS.md) - General patterns