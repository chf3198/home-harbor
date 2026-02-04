# Lambda Functions

AWS Lambda functions for HomeHarbor data pipeline.

## Overview

- **redfin-ingestion.ts**: Scrapes Redfin property data
- **ct-socrata-etl.ts**: Processes Connecticut property data from Socrata API
- **street-view-fetch.ts**: Downloads Google Street View images
- **ai-description-generator.ts**: Generates property descriptions using AI
- **ai-vision-analysis.ts**: Analyzes property images with vision AI

## Development

See [LAMBDA_PATTERNS.md](../docs/LAMBDA_PATTERNS.md) for implementation guidelines.

## Deployment

```bash
npm run build
npm run package
npm run deploy
```

## Testing

```bash
npm test
```

## Architecture

Serverless functions triggered by EventBridge schedules, storing data in DynamoDB and S3.
