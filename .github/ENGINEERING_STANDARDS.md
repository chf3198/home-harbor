# Engineering Standards & Guidelines

This document establishes the engineering standards for the HomeHarbor project, aligning with industry best practices from leading tech organizations.

## Framework Overview

Our development approach combines:
- **AWS Well-Architected Framework** - Cloud architecture excellence (6 pillars)
- **Google SRE Practices** - Operational excellence and reliability
- **Node.js Best Practices** - Modern JavaScript/TypeScript development standards

---

## 1. AWS Well-Architected Framework: Six Pillars

### 1.1 Operational Excellence
**Focus**: Running and monitoring systems, continually improving processes

**Key Practices**:
- Automate changes through CI/CD pipelines
- Document all operational procedures
- Implement comprehensive logging with structured formats
- Define and track operational metrics (error rates, latency, throughput)
- Conduct regular operational readiness reviews (ORR)
- Practice failure injection and chaos engineering

**HomeHarbor Application**:
- Use GitHub Actions for automated deployments
- Implement distributed tracing with correlation IDs
- Define SLIs/SLOs for all critical user journeys
- Maintain runbooks for common operational scenarios

### 1.2 Security
**Focus**: Protecting information and systems

**Key Practices**:
- Implement defense in depth
- Enable traceability through comprehensive logging
- Apply security at all layers (network, application, data)
- Automate security best practices
- Protect data in transit and at rest
- Prepare for security events

**HomeHarbor Application**:
- Implement WAF rules for common attack patterns
- Use AWS Secrets Manager for credential management
- Enable encryption for RDS, S3, and ElastiCache
- Implement rate limiting and request validation
- Use IAM roles with least privilege
- Regular security scanning with Snyk/npm audit

### 1.3 Reliability
**Focus**: Recovering from failures and meeting demands

**Key Practices**:
- Automatically recover from failure
- Test recovery procedures regularly
- Scale horizontally for resilience
- Stop guessing capacity needs
- Manage change through automation
- Implement circuit breakers and retries

**HomeHarbor Application**:
- Deploy across multiple AZs
- Implement health checks for all services
- Use ECS/Fargate auto-scaling
- Design for graceful degradation
- Implement database replication
- Test disaster recovery procedures quarterly

### 1.4 Performance Efficiency
**Focus**: Using resources efficiently

**Key Practices**:
- Democratize advanced technologies
- Go global in minutes
- Use serverless architectures where appropriate
- Experiment more often
- Consider mechanical sympathy

**HomeHarbor Application**:
- Use CloudFront CDN for static assets
- Implement Redis caching strategy
- Optimize database queries with indexes
- Use Lambda for sporadic workloads
- Monitor and optimize cold start times
- Profile application regularly

### 1.5 Cost Optimization
**Focus**: Avoiding unnecessary costs

**Key Practices**:
- Implement cloud financial management
- Adopt consumption model
- Measure overall efficiency
- Analyze and attribute expenditure
- Use managed services to reduce TCO

**HomeHarbor Application**:
- Use S3 lifecycle policies for data archiving
- Implement auto-scaling to match demand
- Use Spot instances for non-critical workloads
- Monitor costs with AWS Cost Explorer
- Right-size RDS instances based on metrics
- Use reserved instances for predictable workloads

### 1.6 Sustainability
**Focus**: Minimizing environmental impact

**Key Practices**:
- Understand your impact
- Establish sustainability goals
- Maximize utilization
- Use managed services
- Reduce downstream impact

**HomeHarbor Application**:
- Use ARM-based Graviton processors where possible
- Implement efficient data storage strategies
- Optimize container images for size
- Use serverless for sporadic workloads
- Monitor carbon footprint metrics

---

## 2. Google SRE Practices

### 2.1 Service Level Objectives (SLOs)

**Principles**:
- Define SLIs that matter to users
- Set realistic SLOs with error budgets
- Use SLOs to drive decision-making
- Balance reliability with feature velocity

**HomeHarbor SLOs**:
```yaml
API Availability: 99.9% (43.8 minutes downtime/month)
Search Latency (p95): < 500ms
Property Details Load (p99): < 1000ms
Image Upload Success Rate: 99.5%
Database Query Latency (p95): < 100ms
```

**Error Budget Policy**:
- When error budget is exhausted: freeze non-critical releases
- Focus on reliability improvements
- Conduct blameless postmortems

### 2.2 Monitoring Distributed Systems

**The Four Golden Signals**:
1. **Latency**: Time to service requests
2. **Traffic**: Demand on the system
3. **Errors**: Rate of failed requests
4. **Saturation**: Resource utilization

**Implementation**:
```typescript
// Prometheus metrics example
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});
```

### 2.3 Eliminating Toil

**Definition**: Manual, repetitive, automatable work

**Target**: < 50% of SRE time on toil

**Strategies**:
- Automate common operational tasks
- Create self-service tools for developers
- Eliminate manual data entry
- Build platforms, not just solutions

### 2.4 Incident Response

**Phases**:
1. **Detection**: Automated alerting
2. **Triage**: Assess severity and impact
3. **Mitigation**: Restore service
4. **Resolution**: Find root cause
5. **Prevention**: Implement fixes

**Required Elements**:
- Clear incident severity levels (P0-P4)
- On-call rotation with escalation path
- Incident command structure
- Communication protocols
- Blameless postmortem culture

### 2.5 Release Engineering

**Principles**:
- Self-service model
- High velocity with reliability
- Hermetic builds
- Enforcement of policies

**Implementation**:
```yaml
# .github/workflows/deploy.yml
- Run automated tests (unit, integration, e2e)
- Perform security scans
- Build container images
- Deploy to staging
- Run smoke tests
- Gradual rollout to production
- Monitor golden signals
- Automatic rollback on errors
```

---

## 3. Node.js Best Practices

### 3.1 Project Architecture

#### Structure by Business Components
```
home-harbor/
├── apps/
│   ├── web/                 # Next.js frontend
│   ├── api/                 # NestJS backend
│   └── ml/                  # Python ML service
├── packages/
│   ├── shared-types/        # TypeScript definitions
│   ├── logger/              # Logging utility
│   └── config/              # Configuration management
└── infrastructure/
    ├── terraform/           # IaC definitions
    └── docker/              # Container configurations
```

#### Layer Components with 3-Tier Pattern
```typescript
// apps/api/src/components/property/
├── entry-points/
│   ├── property.controller.ts    // HTTP endpoints
│   └── property.consumer.ts      // Message queue handlers
├── domain/
│   ├── property.service.ts       // Business logic
│   └── property.dto.ts           // Data transfer objects
└── data-access/
    └── property.repository.ts    // Database operations
```

### 3.2 Error Handling

#### Use Async/Await Consistently
```typescript
// ✅ Good
async function getProperty(id: string): Promise<Property> {
  try {
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new PropertyNotFoundError(id);
    }
    return property;
  } catch (error) {
    logger.error('Failed to get property', { id, error });
    throw error;
  }
}

// ❌ Bad - callback hell
function getProperty(id, callback) {
  propertyRepository.findById(id, (err, property) => {
    if (err) return callback(err);
    if (!property) return callback(new Error('Not found'));
    callback(null, property);
  });
}
```

#### Extend Built-in Error Object
```typescript
export class AppError extends Error {
  constructor(
    public readonly name: string,
    public readonly httpCode: HttpStatus,
    public readonly isCatastrophic: boolean,
    public readonly message: string,
    public readonly metadata?: Record<string, unknown>
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class PropertyNotFoundError extends AppError {
  constructor(propertyId: string) {
    super(
      'PROPERTY_NOT_FOUND',
      HttpStatus.NOT_FOUND,
      false,
      `Property ${propertyId} not found`,
      { propertyId }
    );
  }
}
```

#### Centralized Error Handler
```typescript
// middleware/error-handler.ts
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof AppError) {
    logger.error(error.name, {
      message: error.message,
      metadata: error.metadata,
      stack: error.stack
    });

    return res.status(error.httpCode).json({
      error: {
        name: error.name,
        message: error.message,
        // Never expose metadata in production
        ...(process.env.NODE_ENV !== 'production' && { metadata: error.metadata })
      }
    });
  }

  // Catastrophic error - log and crash
  logger.fatal('Unhandled error', { error });
  process.exit(1);
}
```

### 3.3 Code Style & Patterns

#### Use Environment-Aware Configuration
```typescript
// packages/config/src/index.ts
import convict from 'convict';

const config = convict({
  env: {
    doc: 'Application environment',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  server: {
    port: {
      doc: 'Server port',
      format: 'port',
      default: 3000,
      env: 'PORT'
    }
  },
  database: {
    host: {
      doc: 'Database host',
      format: String,
      default: 'localhost',
      env: 'DB_HOST'
    },
    password: {
      doc: 'Database password',
      format: String,
      default: '',
      env: 'DB_PASSWORD',
      sensitive: true
    }
  }
});

// Validate configuration
config.validate({ allowed: 'strict' });

export default config;
```

#### TypeScript Usage - Sparingly and Thoughtfully
```typescript
// ✅ Good - Simple, clear types
interface Property {
  id: string;
  title: string;
  price: number;
  location: {
    lat: number;
    lng: number;
  };
}

function findProperties(filters: PropertyFilters): Promise<Property[]> {
  // Implementation
}

// ❌ Avoid - Over-engineered types
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type ConditionalPick<T, K extends keyof T> = Pick<
  T,
  { [P in K]: T[P] extends undefined ? never : P }[K]
>;
```

### 3.4 Testing Best Practices

#### Structure Tests with AAA Pattern
```typescript
describe('PropertyService', () => {
  describe('getProperty', () => {
    it('should return property when ID exists in database', async () => {
      // Arrange
      const propertyId = 'prop-123';
      const mockProperty = { id: propertyId, title: 'Test Property' };
      jest.spyOn(propertyRepository, 'findById').mockResolvedValue(mockProperty);

      // Act
      const result = await propertyService.getProperty(propertyId);

      // Assert
      expect(result).toEqual(mockProperty);
      expect(propertyRepository.findById).toHaveBeenCalledWith(propertyId);
    });
  });
});
```

#### Test the Five Possible Outcomes
For every feature test:
1. **Response**: Verify correct HTTP response
2. **State Change**: Verify database changes
3. **External Calls**: Verify third-party API calls
4. **Message Queue**: Verify events published
5. **Observability**: Verify logs/metrics emitted

#### Include 3 Parts in Test Names
```typescript
// Pattern: [unit under test]_[scenario]_[expected result]

it('getProperty_whenPropertyNotFound_throwsPropertyNotFoundError', async () => {
  // Test implementation
});

it('createProperty_withValidData_savesToDatabaseAndPublishesEvent', async () => {
  // Test implementation
});
```

### 3.5 Production Best Practices

#### Use Mature Logging
```typescript
// packages/logger/src/index.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  },
  serializers: {
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res
  },
  redact: {
    paths: ['password', 'token', 'apiKey'],
    remove: true
  }
});

export default logger;
```

#### Assign Transaction ID to Each Log
```typescript
// Using AsyncLocalStorage for request context
import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 } from 'uuid';

const asyncLocalStorage = new AsyncLocalStorage<{ requestId: string }>();

export function requestContextMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || uuidv4();
  asyncLocalStorage.run({ requestId }, () => {
    res.setHeader('x-request-id', requestId);
    next();
  });
}

// Logger automatically includes requestId
logger.info = (message, ...args) => {
  const context = asyncLocalStorage.getStore();
  baseLogger.info({ ...context, message }, ...args);
};
```

#### Set NODE_ENV=production
```dockerfile
# Dockerfile
FROM node:20-alpine
ENV NODE_ENV=production
# ... rest of Dockerfile
```

---

## 4. Security Best Practices

### 4.1 OWASP Top 10 Alignment

#### A01:2021 - Broken Access Control
```typescript
// Implement role-based access control
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'owner')
@Put(':id')
async updateProperty(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
  // Verify ownership before update
  const property = await this.propertyService.getProperty(id);
  if (property.ownerId !== request.user.id && !request.user.roles.includes('admin')) {
    throw new ForbiddenException();
  }
  return this.propertyService.update(id, dto);
}
```

#### A02:2021 - Cryptographic Failures
```typescript
// Encrypt sensitive data at rest
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

  encrypt(text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  decrypt(encryptedData: string): string {
    const buffer = Buffer.from(encryptedData, 'base64');
    const iv = buffer.slice(0, 16);
    const authTag = buffer.slice(16, 32);
    const encrypted = buffer.slice(32);
    
    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    
    return decipher.update(encrypted) + decipher.final('utf8');
  }
}
```

#### A03:2021 - Injection
```typescript
// Use ORM/ODM with parameterized queries
// ✅ Good - Using TypeORM
const properties = await propertyRepository.find({
  where: { city: filters.city, price: LessThan(filters.maxPrice) }
});

// ❌ Bad - SQL injection vulnerability
const properties = await db.query(
  `SELECT * FROM properties WHERE city = '${filters.city}'`
);
```

#### A05:2021 - Security Misconfiguration
```typescript
// Use helmet for security headers
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 4.2 Secrets Management
```typescript
// Use AWS Secrets Manager
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

class SecretsService {
  private client = new SecretsManager({ region: 'us-east-2' });
  private cache = new Map<string, { value: string; expiry: number }>();

  async getSecret(secretName: string): Promise<string> {
    // Check cache first
    const cached = this.cache.get(secretName);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    // Fetch from AWS
    const response = await this.client.getSecretValue({ SecretId: secretName });
    const value = response.SecretString;

    // Cache for 5 minutes
    this.cache.set(secretName, {
      value,
      expiry: Date.now() + 5 * 60 * 1000
    });

    return value;
  }
}
```

---

## 5. Docker Best Practices

### 5.1 Multi-Stage Builds
```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Run as non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Copy only production dependencies
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./
RUN npm ci --omit=dev

# Copy built application
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist

# Set environment
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### 5.2 .dockerignore
```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.*
!.env.example
.aws
*.pem
*.key
coverage
.vscode
.idea
*.md
!README.md
.DS_Store
```

### 5.3 Graceful Shutdown
```typescript
// Handle SIGTERM for graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, starting graceful shutdown');

  // Stop accepting new requests
  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      // Close database connections
      await dataSource.destroy();
      logger.info('Database connections closed');

      // Close Redis connections
      await redis.quit();
      logger.info('Redis connection closed');

      // Finish processing existing requests (with timeout)
      await Promise.race([
        waitForPendingRequests(),
        timeout(30000) // 30 second timeout
      ]);

      logger.info('Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error });
      process.exit(1);
    }
  });
});
```

---

## 6. Implementation Checklist

### Development Phase
- [ ] Code follows 3-tier architecture pattern
- [ ] All functions have descriptive names
- [ ] TypeScript types are simple and clear
- [ ] Configuration uses environment variables
- [ ] Error handling extends AppError base class
- [ ] Logging includes correlation IDs
- [ ] Input validation uses Joi/Zod schemas
- [ ] Secrets are never committed to git

### Testing Phase
- [ ] Tests follow AAA pattern
- [ ] Test names include 3 parts (unit_scenario_result)
- [ ] All 5 outcomes are tested (response, state, external, queue, observability)
- [ ] Code coverage > 80%
- [ ] Integration tests use Docker Compose
- [ ] E2E tests run in production-like environment
- [ ] Performance tests establish baselines

### Deployment Phase
- [ ] Multi-stage Docker builds
- [ ] Images scanned for vulnerabilities
- [ ] No secrets in container images
- [ ] Health checks implemented
- [ ] Graceful shutdown handlers
- [ ] Memory limits set (Docker + v8)
- [ ] Auto-scaling configured
- [ ] Monitoring dashboards created

### Production Readiness
- [ ] SLOs defined and tracked
- [ ] Alerts configured for SLO violations
- [ ] On-call rotation established
- [ ] Runbooks documented
- [ ] Disaster recovery tested
- [ ] Incident response procedures defined
- [ ] Postmortem template ready
- [ ] Security scanning automated

---

## 7. Metrics & KPIs

### Reliability Metrics
- **Availability**: 99.9% uptime
- **MTTR** (Mean Time To Recovery): < 30 minutes
- **MTBF** (Mean Time Between Failures): > 720 hours
- **Error Rate**: < 0.1% of requests

### Performance Metrics
- **API Latency (p95)**: < 500ms
- **Database Query Time (p95)**: < 100ms
- **Page Load Time (p75)**: < 2 seconds
- **Time to First Byte (p95)**: < 200ms

### Development Velocity
- **Deployment Frequency**: Multiple times per day
- **Lead Time for Changes**: < 1 day
- **Change Failure Rate**: < 5%
- **Test Coverage**: > 80%

### Cost Efficiency
- **Cost per User**: Track monthly
- **Resource Utilization**: > 70% average
- **Cost per Transaction**: Optimize over time

---

## 8. Review Process

All code changes must pass:

1. **Automated Checks**
   - Linting (ESLint + Prettier)
   - Type checking (TypeScript)
   - Unit tests (Jest)
   - Integration tests
   - Security scans (Snyk)
   - Container scans (Trivy)

2. **Peer Review**
   - At least 1 approval required
   - Architecture review for major changes
   - Security review for auth/payment features

3. **Performance Review**
   - Load testing for backend changes
   - Lighthouse scores for frontend changes
   - Database query analysis

4. **Documentation Review**
   - README updated
   - API docs updated (OpenAPI)
   - Runbooks updated if needed

---

## References

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Google SRE Book](https://sre.google/sre-book/table-of-contents/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [12-Factor App](https://12factor.net/)

---

**Last Updated**: January 30, 2026
**Owner**: Engineering Team
**Review Frequency**: Quarterly
