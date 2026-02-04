# Lambda Configuration Patterns

**Purpose**: Environment variables, secrets management, and configuration validation patterns.

---

## Environment Variables
```typescript
// Centralized configuration
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
  if (config.maxRetries < 0 || config.maxRetries > 10) {
    throw new Error('MAX_RETRIES must be between 0 and 10');
  }
};

validateConfig();
```

## Secrets Management
```typescript
// Secure API key handling
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

## Configuration Classes
```typescript
// Type-safe configuration
export class LambdaConfig {
  readonly tableName: string;
  readonly apiKey: string;
  readonly timeout: number;

  constructor() {
    this.tableName = this.getRequiredEnv('PROPERTIES_TABLE');
    this.apiKey = this.getRequiredEnv('API_KEY');
    this.timeout = parseInt(process.env.TIMEOUT_MS || '30000');
  }

  private getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }
}

// Singleton pattern for config
export const config = new LambdaConfig();
```

## Feature Flags
```typescript
// Runtime feature toggles
const features = {
  enableCaching: process.env.ENABLE_CACHING === 'true',
  useBatchProcessing: process.env.USE_BATCH_PROCESSING !== 'false',
  enableMetrics: process.env.ENABLE_METRICS === 'true'
};

export const isFeatureEnabled = (feature: keyof typeof features): boolean => {
  return features[feature];
};
```

---

**Cross-References**:
- [LAMBDA_HANDLER_PATTERNS.md](LAMBDA_HANDLER_PATTERNS.md) - Handler patterns
- [LAMBDA_TESTING_PATTERNS.md](LAMBDA_TESTING_PATTERNS.md) - Testing patterns
- [TECH_STACK.md](TECH_STACK.md) - Infrastructure details