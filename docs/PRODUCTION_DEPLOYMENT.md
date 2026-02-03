# Production Deployment Guide

## Pre-Deployment Checklist

### ✅ Code Quality
- [x] All tests passing (Jest + Vitest + Playwright)
- [x] ESLint clean (no errors or warnings)
- [x] Bundle size < 100KB (current: ~65KB)
- [x] Accessibility audit passed (WCAG AA compliant)
- [x] Error boundaries implemented
- [x] Performance monitoring active

### ✅ Security
- [x] No console.logs in production build
- [x] Environment variables configured
- [x] API keys secured (OpenRouter, AWS)
- [x] HTTPS enabled
- [x] Content Security Policy headers

### ✅ Performance
- [x] Core Web Vitals monitored (LCP, FID, CLS)
- [x] Bundle splitting implemented
- [x] Code splitting for routes
- [x] Image optimization ready
- [x] CDN configuration for static assets

### ✅ Monitoring & Error Handling
- [x] Error boundaries with retry logic
- [x] Performance monitoring (Core Web Vitals)
- [x] Client-side error logging
- [x] API error handling
- [x] Loading states and user feedback

## Deployment Steps

### 1. Environment Setup
```bash
# Set production environment variables
export NODE_ENV=production
export OPENROUTER_API_KEY=your_key_here
export AWS_REGION=us-east-2
export S3_BUCKET=your_bucket_name
```

### 2. Build Application
```bash
cd frontend
npm run build
```

### 3. Deploy to AWS
```bash
# Lambda deployment
cd ../lambda
npm run build
npm run package
npm run deploy

# Frontend deployment (if using S3/CloudFront)
aws s3 sync ../dist s3://your-bucket-name --delete
```

### 4. Verify Deployment
- [ ] Frontend loads correctly
- [ ] API endpoints responding
- [ ] Search functionality works
- [ ] AI chat functional
- [ ] No console errors
- [ ] Performance metrics logging

## Monitoring & Maintenance

### Key Metrics to Monitor
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **API Response Times**: < 500ms average
- **Error Rates**: < 1% of requests
- **Bundle Size**: Track over time to prevent bloat

### Regular Maintenance
- Weekly: Check error logs and performance metrics
- Monthly: Update dependencies and security patches
- Quarterly: Full accessibility and performance audit

## Rollback Plan
If issues arise post-deployment:

1. **Immediate Rollback**: Switch CloudFront to previous version
2. **Lambda Rollback**: Use AWS Lambda version management
3. **Database**: No schema changes in this release
4. **Communication**: Notify users of temporary issues

## Success Criteria
- [ ] All E2E tests pass in production
- [ ] Core Web Vitals within acceptable ranges
- [ ] Zero critical errors in first 24 hours
- [ ] User feedback positive
- [ ] Performance meets or exceeds development benchmarks