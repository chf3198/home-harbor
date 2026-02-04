# Performance Patterns

**Purpose**: Memory efficiency, caching, and AWS SDK optimization patterns.

---

## Memory Efficiency
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

## Caching Strategy
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

**Cross-References**:
- [CODE_STRUCTURE_PATTERNS.md](CODE_STRUCTURE_PATTERNS.md) - Code structure
- [LAMBDA_DATA_PATTERNS.md](LAMBDA_DATA_PATTERNS.md) - Data processing
- [LAMBDA_DEPLOYMENT_PATTERNS.md](LAMBDA_DEPLOYMENT_PATTERNS.md) - Deployment