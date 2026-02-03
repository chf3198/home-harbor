#!/bin/bash

# Deploy Lambda functions to AWS
# Prerequisites: Packages must be created (run package-lambdas.sh first)

set -e

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
PROJECT_NAME="home-harbor"
STAGE="${STAGE:-dev}"

echo "=== Deploying Lambda Functions ==="
echo "Region: $AWS_REGION"
echo "Stage: $STAGE"
echo ""

# Get IAM role ARN
ROLE_NAME="${PROJECT_NAME}-lambda-role-${STAGE}"
ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)
echo "Using IAM Role: $ROLE_ARN"
echo ""

# Get resource names
DATA_BUCKET="${PROJECT_NAME}-data-sources-${STAGE}"
IMAGE_BUCKET="${PROJECT_NAME}-images-${STAGE}"
PROPERTIES_TABLE="${PROJECT_NAME}-properties-${STAGE}"
METRICS_TABLE="${PROJECT_NAME}-market-metrics-${STAGE}"
AI_CACHE_TABLE="${PROJECT_NAME}-ai-insights-${STAGE}"
SECRET_NAME="${PROJECT_NAME}/api-keys-${STAGE}"

# Function to deploy or update Lambda
deploy_lambda() {
    local func_name=$1
    local handler=$2
    local timeout=$3
    local memory=$4
    local env_vars=$5
    
    local full_name="${PROJECT_NAME}-${func_name}-${STAGE}"
    local package_file="packages/${func_name}.zip"
    
    if [ ! -f "$package_file" ]; then
        echo "Error: Package not found: $package_file"
        echo "Run: npm run package"
        exit 1
    fi
    
    echo "Deploying $full_name..."
    
    # Check if function exists
    if aws lambda get-function --function-name "$full_name" &>/dev/null; then
        # Update existing function
        aws lambda update-function-code \
            --function-name "$full_name" \
            --zip-file "fileb://${package_file}" \
            --region "$AWS_REGION" \
            --output text >/dev/null
        
        # Wait for update to complete
        aws lambda wait function-updated \
            --function-name "$full_name" \
            --region "$AWS_REGION"
        
        # Update configuration
        aws lambda update-function-configuration \
            --function-name "$full_name" \
            --handler "$handler" \
            --timeout "$timeout" \
            --memory-size "$memory" \
            --environment "Variables={${env_vars}}" \
            --region "$AWS_REGION" \
            --output text >/dev/null
        
        echo "✓ Updated $full_name"
    else
        # Create new function
        aws lambda create-function \
            --function-name "$full_name" \
            --runtime "nodejs20.x" \
            --role "$ROLE_ARN" \
            --handler "$handler" \
            --timeout "$timeout" \
            --memory-size "$memory" \
            --zip-file "fileb://${package_file}" \
            --environment "Variables={${env_vars}}" \
            --region "$AWS_REGION" \
            --tags "Project=${PROJECT_NAME},Stage=${STAGE}" \
            --output text >/dev/null
        
        echo "✓ Created $full_name"
    fi
}

# Deploy each Lambda function
deploy_lambda \
    "redfin-ingestion" \
    "index.handler" \
    300 \
    512 \
    "DATA_BUCKET=${DATA_BUCKET},METRICS_TABLE=${METRICS_TABLE}"

deploy_lambda \
    "ct-socrata-etl" \
    "index.handler" \
    900 \
    1024 \
    "PROPERTIES_TABLE=${PROPERTIES_TABLE},MAX_RECORDS=5000"

deploy_lambda \
    "street-view-fetch" \
    "index.handler" \
    30 \
    256 \
    "IMAGE_BUCKET=${IMAGE_BUCKET},SECRET_NAME=${SECRET_NAME}"

deploy_lambda \
    "ai-vision-analysis" \
    "index.handler" \
    120 \
    512 \
    "AI_CACHE_TABLE=${AI_CACHE_TABLE},SECRET_NAME=${SECRET_NAME}"

deploy_lambda \
    "ai-description-generator" \
    "index.handler" \
    120 \
    512 \
    "AI_CACHE_TABLE=${AI_CACHE_TABLE},SECRET_NAME=${SECRET_NAME}"

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Lambda Functions:"
echo "  - ${PROJECT_NAME}-redfin-ingestion-${STAGE}"
echo "  - ${PROJECT_NAME}-ct-socrata-etl-${STAGE}"
echo "  - ${PROJECT_NAME}-street-view-fetch-${STAGE}"
echo "  - ${PROJECT_NAME}-ai-vision-analysis-${STAGE}"
echo "  - ${PROJECT_NAME}-ai-description-generator-${STAGE}"
echo ""
echo "Next Steps:"
echo "  1. Test ingestion functions:"
echo "     aws lambda invoke --function-name ${PROJECT_NAME}-redfin-ingestion-${STAGE} /tmp/output.json"
echo ""
echo "  2. Setup EventBridge schedules for automated runs"
echo "  3. Create API Gateway endpoints for HTTP access"
