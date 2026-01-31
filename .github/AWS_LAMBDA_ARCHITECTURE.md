# AWS Lambda Architecture for HomeHarbor

**Mission**: Demonstrate mastery of AWS Lambda and serverless architecture while building a production-ready real estate marketplace.

**Critical Insight**: The single-file + Supabase approach **does NOT use AWS Lambda at all** - it completely bypasses AWS. If your goal is to showcase AWS expertise, you need a different architecture.

---

## Executive Summary: Why AWS Lambda Matters

**The single-file approach won't demonstrate:**
- ❌ AWS Lambda serverless functions
- ❌ API Gateway integration
- ❌ AWS service orchestration
- ❌ Infrastructure as Code (CloudFormation/SAM)
- ❌ Event-driven architecture
- ❌ AWS best practices

**Portfolio/Resume Impact:**
- Supabase approach: "I can use third-party services"
- AWS Lambda approach: "I can architect scalable serverless systems"

**For senior engineering roles, AWS Lambda mastery shows:**
- ✅ Serverless architecture design
- ✅ Cost optimization (pay-per-request)
- ✅ Scalability understanding (auto-scaling to millions)
- ✅ AWS ecosystem integration
- ✅ Modern cloud-native development

---

## Recommended: Hybrid AWS Lambda Architecture

### Philosophy: Simple Frontend + AWS Lambda Backend

```
┌─────────────────────────────────────┐
│   Frontend: S3 + CloudFront         │
│   - Static HTML/JS/CSS              │
│   - Global CDN distribution         │
│   - ~$1/month                       │
└──────────────┬──────────────────────┘
               │
               │ HTTPS Requests
               ▼
┌─────────────────────────────────────┐
│   AWS Lambda Function URLs          │
│   - Direct HTTP endpoints           │
│   - No API Gateway needed           │
│   - ~$0.20/million requests         │
├─────────────────────────────────────┤
│   Lambda Functions:                 │
│   ├─ getProperties()                │
│   ├─ searchProperties()             │
│   ├─ createProperty()               │
│   ├─ uploadImage()                  │
│   └─ getUserFavorites()             │
└──────────────┬──────────────────────┘
               │
               │ Data Access
               ▼
┌─────────────────────────────────────┐
│   Amazon RDS PostgreSQL             │
│   - Managed database                │
│   - Automated backups               │
│   - ~$15/month (db.t3.micro)        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   Amazon S3 (Images)                │
│   - Property photos                 │
│   - ~$1/month                       │
└─────────────────────────────────────┘
```

**Total Monthly Cost**: ~$17/month  
**AWS Services Used**: 4 core services  
**Demonstrates**: Serverless, databases, storage, CDN  
**Free Tier**: First 12 months mostly free with your credits

---

## Architecture Options: Simple to Advanced

### Option 1: Lambda + Function URLs (SIMPLEST)

**Best for**: Demonstrating Lambda fundamentals without API Gateway complexity

**Stack:**
- Frontend: S3 static website
- Backend: Lambda with Function URLs (direct HTTP)
- Database: RDS PostgreSQL (or Aurora Serverless)
- Storage: S3 for images
- Deployment: AWS SAM CLI

**Key Advantages:**
- ✅ No API Gateway needed (saves money & complexity)
- ✅ Simple HTTPS endpoints per function
- ✅ Easy CORS configuration
- ✅ Direct invocation via URL

**Setup:**

```yaml
# template.yaml (AWS SAM)
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: HomeHarbor Serverless API

Globals:
  Function:
    Runtime: nodejs20.x
    Timeout: 10
    Environment:
      Variables:
        DB_HOST: !GetAtt HomeHarborDB.Endpoint.Address
        DB_NAME: homeharbor
        DB_USER: admin

Resources:
  # Lambda Function: Get Properties
  GetPropertiesFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: functions/get-properties/
      Handler: index.handler
      FunctionUrlConfig:
        AuthType: NONE
        Cors:
          AllowOrigins:
            - "https://yourdomain.com"
          AllowMethods:
            - GET
          AllowHeaders:
            - "*"
      Policies:
        - AWSLambdaVPCAccessExecutionRole

  # Lambda Function: Search Properties
  SearchPropertiesFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: functions/search-properties/
      Handler: index.handler
      FunctionUrlConfig:
        AuthType: NONE
        Cors:
          AllowOrigins:
            - "https://yourdomain.com"
          AllowMethods:
            - GET
            - POST

  # Lambda Function: Create Property
  CreatePropertyFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: functions/create-property/
      Handler: index.handler
      FunctionUrlConfig:
        AuthType: AWS_IAM  # Requires authentication
      Policies:
        - AWSLambdaVPCAccessExecutionRole
        - S3WritePolicy:
            BucketName: !Ref PropertyImagesBucket

  # S3 Bucket for Images
  PropertyImagesBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: homeharbor-images
      CorsConfiguration:
        CorsRules:
          - AllowedOrigins:
              - "*"
            AllowedMethods:
              - GET
              - PUT
            AllowedHeaders:
              - "*"

  # RDS PostgreSQL Database
  HomeHarborDB:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: homeharbor-db
      Engine: postgres
      EngineVersion: "15.3"
      DBInstanceClass: db.t3.micro
      AllocatedStorage: 20
      MasterUsername: admin
      MasterUserPassword: !Ref DBPassword
      PubliclyAccessible: false
      VPCSecurityGroups:
        - !Ref DBSecurityGroup

Outputs:
  GetPropertiesFunctionUrl:
    Description: "Function URL for GetProperties"
    Value: !GetAtt GetPropertiesFunctionUrl.FunctionUrl
  
  SearchPropertiesFunctionUrl:
    Description: "Function URL for SearchProperties"
    Value: !GetAtt SearchPropertiesFunctionUrl.FunctionUrl
```

**Lambda Function Example:**

```javascript
// functions/get-properties/index.js
const { Client } = require('pg');

exports.handler = async (event) => {
    const client = new Client({
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: 5432,
    });

    try {
        await client.connect();
        
        // Parse query parameters
        const params = event.queryStringParameters || {};
        const limit = parseInt(params.limit) || 20;
        const offset = parseInt(params.offset) || 0;
        const city = params.city;
        
        // Build query
        let query = 'SELECT * FROM properties WHERE status = $1';
        const values = ['active'];
        
        if (city) {
            query += ' AND city ILIKE $2';
            values.push(`%${city}%`);
        }
        
        query += ' ORDER BY created_at DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
        values.push(limit, offset);
        
        const result = await client.query(query, values);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                properties: result.rows,
                total: result.rowCount,
            }),
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message,
            }),
        };
    } finally {
        await client.end();
    }
};
```

**Deployment:**

```bash
# 1. Install AWS SAM CLI
brew install aws-sam-cli

# 2. Build
sam build

# 3. Deploy
sam deploy --guided

# 4. Get function URLs
aws lambda get-function-url-config --function-name GetPropertiesFunction
```

**Cost Breakdown:**
```
Lambda requests: 100K/month × $0.20/million = $0.02
Lambda compute: 100K × 200ms × $0.0000166667 = $0.33
RDS db.t3.micro: $14.60/month
S3 storage: 10GB × $0.023 = $0.23
Data transfer: Usually free (first GB)
Total: ~$15.18/month
```

---

### Option 2: Lambda + API Gateway (PROFESSIONAL)

**Best for**: Demonstrating enterprise patterns, rate limiting, API keys

**Additional Benefits:**
- ✅ Unified API domain
- ✅ Request validation
- ✅ Rate limiting & throttling
- ✅ API keys for partners
- ✅ Custom authorizers
- ✅ Request/response transformations

**SAM Template:**

```yaml
Resources:
  HomeHarborApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: prod
      Cors:
        AllowOrigin: "'*'"
        AllowMethods: "'GET,POST,PUT,DELETE'"
      Auth:
        ApiKeyRequired: false
        UsagePlan:
          CreateUsagePlan: PER_API
          UsagePlanName: HomeHarborUsagePlan
          Quota:
            Limit: 10000
            Period: MONTH
          Throttle:
            RateLimit: 100
            BurstLimit: 200

  GetPropertiesFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: functions/get-properties/
      Handler: index.handler
      Events:
        GetProperties:
          Type: Api
          Properties:
            RestApiId: !Ref HomeHarborApi
            Path: /properties
            Method: GET
```

**Now your API is:**
```
https://abc123.execute-api.us-east-2.amazonaws.com/prod/properties
https://abc123.execute-api.us-east-2.amazonaws.com/prod/properties/search
https://abc123.execute-api.us-east-2.amazonaws.com/prod/properties/{id}
```

**Additional Cost**: ~$3.50/month for API Gateway

---

### Option 3: Lambda + DynamoDB (FULLY SERVERLESS)

**Best for**: Maximum AWS serverless knowledge demonstration

**Replace RDS with DynamoDB:**
- ✅ Pay-per-request pricing
- ✅ Auto-scaling to any size
- ✅ Sub-10ms latency
- ✅ No database to manage
- ✅ True serverless

**Cost Advantage:**
```
DynamoDB on-demand:
  - First 25 GB storage: FREE
  - First 2.5 million reads/month: FREE
  - 100K requests: ~$0.25
  
vs. RDS: $15/month minimum
```

**SAM Template:**

```yaml
Resources:
  PropertiesTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: properties
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
        - AttributeName: city
          AttributeType: S
        - AttributeName: price
          AttributeType: N
      KeySchema:
        - AttributeName: id
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: city-price-index
          KeySchema:
            - AttributeName: city
              KeyType: HASH
            - AttributeName: price
              KeyType: RANGE
          Projection:
            ProjectionType: ALL

  GetPropertiesFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: functions/get-properties/
      Handler: index.handler
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref PropertiesTable
      Environment:
        Variables:
          TABLE_NAME: !Ref PropertiesTable
```

**Lambda Function with DynamoDB:**

```javascript
// functions/get-properties/index.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    const params = event.queryStringParameters || {};
    
    try {
        let command;
        
        if (params.city) {
            // Query by city using GSI
            command = new QueryCommand({
                TableName: process.env.TABLE_NAME,
                IndexName: 'city-price-index',
                KeyConditionExpression: 'city = :city',
                ExpressionAttributeValues: {
                    ':city': params.city,
                    ':active': 'active',
                },
                FilterExpression: 'status = :active',
                Limit: parseInt(params.limit) || 20,
            });
        } else {
            // Scan all (use carefully!)
            command = new ScanCommand({
                TableName: process.env.TABLE_NAME,
                FilterExpression: 'status = :status',
                ExpressionAttributeValues: {
                    ':status': 'active',
                },
                Limit: parseInt(params.limit) || 20,
            });
        }
        
        const result = await docClient.send(command);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                properties: result.Items,
                count: result.Count,
            }),
        };
    } catch (error) {
        console.error('DynamoDB error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
```

**Monthly Cost (DynamoDB approach):**
```
Lambda: ~$0.35
DynamoDB: ~$0.25
S3: ~$1.00
CloudFront: ~$1.00
Total: ~$2.60/month (vs $15+ with RDS)
```

---

## Advanced Patterns: Demonstrating Mastery

### Pattern 1: Lambda Layers for Shared Code

**Problem**: Multiple functions need same dependencies  
**Solution**: Lambda Layers

```yaml
Resources:
  SharedDependenciesLayer:
    Type: AWS::Serverless::LayerVersion
    Properties:
      LayerName: shared-dependencies
      Description: Shared Node.js dependencies
      ContentUri: layers/dependencies/
      CompatibleRuntimes:
        - nodejs20.x

  GetPropertiesFunction:
    Type: AWS::Serverless::Function
    Properties:
      # ... other properties
      Layers:
        - !Ref SharedDependenciesLayer
```

**Benefit**: Deploy common code once, use in all functions (faster deployments)

---

### Pattern 2: Event-Driven Architecture

**Demonstrate**: Asynchronous processing

```yaml
Resources:
  # SNS Topic for property events
  PropertyEventsTopic:
    Type: AWS::SNS::Topic
    Properties:
      TopicName: property-events

  # Lambda triggered by new property creation
  ProcessNewPropertyFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: functions/process-new-property/
      Handler: index.handler
      Events:
        PropertyCreated:
          Type: SNS
          Properties:
            Topic: !Ref PropertyEventsTopic

  # Lambda that sends notification emails
  SendNotificationFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: functions/send-notification/
      Handler: index.handler
      Events:
        PropertyCreated:
          Type: SNS
          Properties:
            Topic: !Ref PropertyEventsTopic
```

**Flow:**
```
User creates property → Lambda publishes to SNS → Multiple Lambdas process:
  ├─ Generate thumbnails
  ├─ Send email notifications
  ├─ Update search index
  └─ Log analytics
```

---

### Pattern 3: Step Functions for Workflows

**Demonstrate**: Complex orchestration

```yaml
Resources:
  PropertyProcessingStateMachine:
    Type: AWS::Serverless::StateMachine
    Properties:
      DefinitionUri: statemachine/property-processing.asl.json
      Policies:
        - LambdaInvokePolicy:
            FunctionName: !Ref ValidatePropertyFunction
        - LambdaInvokePolicy:
            FunctionName: !Ref ProcessImagesFunction
        - LambdaInvokePolicy:
            FunctionName: !Ref SavePropertyFunction
```

**Workflow:**
```
Start → Validate Property → Process Images → Generate Thumbnails → Save to DB → Send Notifications → End
```

---

### Pattern 4: Lambda@Edge for Performance

**Demonstrate**: Global edge computing

```yaml
Resources:
  EdgeFunction:
    Type: AWS::Serverless::Function
    Properties:
      Runtime: nodejs20.x
      CodeUri: edge-functions/
      Handler: index.handler
      AutoPublishAlias: live
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              Service:
                - lambda.amazonaws.com
                - edgelambda.amazonaws.com
            Action: sts:AssumeRole
```

**Use Case**: Serve personalized content at CloudFront edge locations

---

## Project Structure for AWS Lambda

```
home-harbor/
├── template.yaml                    # SAM/CloudFormation
├── samconfig.toml                   # SAM deployment config
├── package.json                     # Dependencies
│
├── layers/                          # Lambda Layers
│   └── dependencies/
│       └── nodejs/
│           └── node_modules/
│               ├── pg/              # PostgreSQL client
│               ├── @aws-sdk/
│               └── uuid/
│
├── functions/                       # Lambda functions
│   ├── get-properties/
│   │   ├── index.js
│   │   ├── package.json
│   │   └── tests/
│   ├── search-properties/
│   │   ├── index.js
│   │   └── package.json
│   ├── create-property/
│   │   ├── index.js
│   │   └── package.json
│   ├── upload-image/
│   │   ├── index.js
│   │   └── package.json
│   └── process-new-property/        # Event-driven
│       ├── index.js
│       └── package.json
│
├── frontend/                        # Static frontend
│   ├── index.html
│   ├── app.js
│   └── styles.css
│
├── infrastructure/                  # IaC
│   ├── database/
│   │   └── schema.sql
│   └── scripts/
│       ├── deploy.sh
│       └── seed-data.sh
│
└── tests/                           # Integration tests
    ├── integration/
    └── e2e/
```

---

## Deployment Workflow

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Install AWS SAM CLI
brew install aws-sam-cli

# 3. Start local API
sam local start-api

# 4. Test function locally
sam local invoke GetPropertiesFunction -e events/get-properties.json

# 5. Run tests
npm test
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: aws-actions/setup-sam@v2
      
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-2
      
      - name: Build
        run: sam build
      
      - name: Deploy
        run: sam deploy --no-confirm-changeset --no-fail-on-empty-changeset
```

---

## Cost Optimization Strategies

### 1. Use ARM64 (Graviton2)

```yaml
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      Architectures:
        - arm64  # 20% cheaper than x86_64
```

### 2. Right-Size Memory

```javascript
// Test different memory sizes
// 128MB: $0.0000000021 per 100ms
// 256MB: $0.0000000042 per 100ms (but 2x faster)
// 512MB: $0.0000000083 per 100ms (but 4x faster)

// Often 512MB is cheaper due to faster execution!
```

### 3. Use Provisioned Concurrency Wisely

```yaml
# Only for high-traffic endpoints
AutoPublishAlias: live
ProvisionedConcurrencyConfig:
  ProvisionedConcurrentExecutions: 5  # Keep 5 warm
```

### 4. Set Appropriate Timeouts

```yaml
Timeout: 10  # Don't use default 3 seconds
            # But don't set to 900 unless needed!
```

---

## Monitoring & Observability

### CloudWatch Dashboards

```yaml
Resources:
  HomeHarborDashboard:
    Type: AWS::CloudWatch::Dashboard
    Properties:
      DashboardName: HomeHarbor-Metrics
      DashboardBody: !Sub |
        {
          "widgets": [
            {
              "type": "metric",
              "properties": {
                "metrics": [
                  ["AWS/Lambda", "Invocations", {"stat": "Sum"}],
                  [".", "Errors", {"stat": "Sum"}],
                  [".", "Duration", {"stat": "Average"}]
                ],
                "period": 300,
                "stat": "Average",
                "region": "us-east-2",
                "title": "Lambda Metrics"
              }
            }
          ]
        }
```

### X-Ray Tracing

```yaml
Globals:
  Function:
    Tracing: Active  # Enable AWS X-Ray

Resources:
  GetPropertiesFunction:
    Type: AWS::Serverless::Function
    Properties:
      # X-Ray automatically traces:
      # - Lambda execution
      # - DynamoDB calls
      # - S3 operations
      # - HTTP requests
```

---

## Comparison: Lambda vs Supabase

| Aspect | AWS Lambda | Supabase |
|--------|-----------|----------|
| **AWS Skills** | ✅ Demonstrates deep AWS knowledge | ❌ Third-party service |
| **Cost (MVP)** | ~$2-15/month | $0 |
| **Cost (Scale)** | Pay per request (efficient) | $25+ /month |
| **Setup Time** | 2-3 hours | 30 minutes |
| **Scalability** | Millions of requests/sec | 50K users (free tier) |
| **Control** | Full infrastructure control | Limited to Supabase features |
| **Resume Impact** | "Built serverless architecture on AWS" | "Used managed service" |
| **Learning Value** | High - transferable skills | Medium - vendor-specific |
| **Maintenance** | Medium - own your infrastructure | Low - managed service |

---

## Recommended Approach for Portfolio

### Hybrid: Best of Both Worlds

**Phase 1: MVP with Supabase (Week 1)**
- Quick start, $0 cost
- Validate idea
- Get user feedback

**Phase 2: Migrate to AWS Lambda (Week 2-3)**
- Rebuild backend with Lambda
- Keep same frontend
- Document migration process
- **This is your portfolio piece**

**Portfolio Value:**
```
"Built HomeHarbor MVP using Supabase for rapid prototyping, then 
migrated to AWS Lambda + API Gateway + DynamoDB for production-grade 
serverless architecture, reducing costs by 40% and achieving 
sub-100ms p95 latency. Implemented CI/CD with GitHub Actions and 
infrastructure as code with AWS SAM."
```

---

## Quick Start: Lambda Architecture

```bash
# 1. Install SAM CLI
brew install aws-sam-cli

# 2. Create project from template
sam init --runtime nodejs20.x --architecture arm64 --name home-harbor

# 3. Deploy
cd home-harbor
sam build
sam deploy --guided

# 4. Get your API URL
sam list endpoints --output json

# 5. Test
curl https://your-function-url.lambda-url.us-east-2.on.aws/
```

---

## Final Recommendation

**For demonstrating AWS Lambda mastery:**

✅ **Use**: Lambda + Function URLs + DynamoDB + S3  
✅ **Cost**: ~$2-5/month  
✅ **AWS Services**: 5+ (Lambda, DynamoDB, S3, CloudFront, IAM)  
✅ **Resume Impact**: High - shows serverless architecture skills  
✅ **Learning**: Deep AWS knowledge, transferable to any company  

**Architecture proves you understand:**
- Serverless design patterns
- Event-driven architecture  
- Cost optimization
- Infrastructure as Code
- AWS best practices
- Scalability principles

**VS. Supabase approach which shows:**
- Basic API integration
- Frontend development
- Third-party service usage

---

## Decision Matrix

| Goal | Recommended Approach |
|------|---------------------|
| **AWS Mastery** | ✅ Lambda + DynamoDB |
| **Fastest MVP** | ✅ Supabase |
| **Lowest Cost** | ✅ Supabase ($0 vs $2-5) |
| **Best Resume** | ✅ Lambda architecture |
| **Most Learning** | ✅ Lambda + AWS services |
| **Production Ready** | ✅ Lambda (enterprise-grade) |
| **Side Project** | ✅ Supabase (less maintenance) |

**Your situation:**
- Have AWS credits ($100 expires July 2026) ✅
- Want portfolio piece ✅
- Likely targeting senior roles ✅

**Verdict**: **Use AWS Lambda architecture** to maximize AWS credits and demonstrate cloud expertise.

---

**Next Steps:**
1. Choose: Lambda + Function URLs (simple) or Lambda + API Gateway (advanced)
2. Decide: RDS ($15/mo) or DynamoDB ($2/mo)
3. Run: `sam init` to start
4. Deploy to AWS and document your architecture

This will prove AWS mastery. Supabase won't.

