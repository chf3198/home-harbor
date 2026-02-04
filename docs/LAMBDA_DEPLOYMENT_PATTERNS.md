# Lambda Deployment Patterns

**Purpose**: Build, deployment, logging, and monitoring patterns for Lambda functions.

---

## Build Process
```bash
# TypeScript compilation
npm run build

# Create deployment ZIP
npm run package

# Deploy to AWS
npm run deploy
```

## Environment Configuration
```typescript
const isProduction = process.env.NODE_ENV === 'production';
const tableSuffix = isProduction ? 'prod' : 'dev';

export const config = {
  propertiesTable: `home-harbor-properties-${tableSuffix}`,
  marketMetricsTable: `home-harbor-market-metrics-${tableSuffix}`
};
```

## Logging Patterns
```typescript
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
```

## Performance Monitoring
```typescript
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

**Cross-References**:
- [LAMBDA_HANDLER_PATTERNS.md](LAMBDA_HANDLER_PATTERNS.md) - Handler patterns
- [LAMBDA_CONFIG_PATTERNS.md](LAMBDA_CONFIG_PATTERNS.md) - Configuration patterns
- [TECH_STACK.md](TECH_STACK.md) - Infrastructure details