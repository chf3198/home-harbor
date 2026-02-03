#!/bin/bash

# HomeHarbor AWS Infrastructure Setup Script
# This script creates all necessary AWS resources for the HomeHarbor application
# Prerequisites: AWS CLI configured with appropriate credentials

set -e  # Exit on error

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== HomeHarbor AWS Infrastructure Setup ===${NC}\n"

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
PROJECT_NAME="home-harbor"
STAGE="${STAGE:-dev}"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Region: $AWS_REGION"
echo "  Project: $PROJECT_NAME"
echo "  Stage: $STAGE"
echo ""

# Function to check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}Error: AWS CLI is not installed${NC}"
        echo "Please install AWS CLI: https://aws.amazon.com/cli/"
        exit 1
    fi
    echo -e "${GREEN}✓ AWS CLI found${NC}"
}

# Function to verify AWS credentials
check_aws_credentials() {
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}Error: AWS credentials not configured${NC}"
        echo "Please run: aws configure"
        exit 1
    fi
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    echo -e "${GREEN}✓ AWS credentials verified (Account: $ACCOUNT_ID)${NC}"
}

# Create S3 bucket for data sources
create_s3_buckets() {
    echo -e "\n${YELLOW}Creating S3 buckets...${NC}"
    
    BUCKET_NAME="${PROJECT_NAME}-data-sources-${STAGE}"
    
    # Create bucket
    if aws s3 ls "s3://${BUCKET_NAME}" 2>&1 | grep -q 'NoSuchBucket'; then
        if [ "$AWS_REGION" = "us-east-1" ]; then
            aws s3api create-bucket \
                --bucket "$BUCKET_NAME" \
                --region "$AWS_REGION"
        else
            aws s3api create-bucket \
                --bucket "$BUCKET_NAME" \
                --region "$AWS_REGION" \
                --create-bucket-configuration LocationConstraint="$AWS_REGION"
        fi
        echo -e "${GREEN}✓ Created S3 bucket: $BUCKET_NAME${NC}"
    else
        echo -e "${GREEN}✓ S3 bucket already exists: $BUCKET_NAME${NC}"
    fi
    
    # Enable versioning
    aws s3api put-bucket-versioning \
        --bucket "$BUCKET_NAME" \
        --versioning-configuration Status=Enabled
    
    # Add lifecycle policy for old data
    cat > /tmp/lifecycle-policy.json <<EOF
{
    "Rules": [
        {
            "Id": "DeleteOldData",
            "Status": "Enabled",
            "Prefix": "redfin/",
            "NoncurrentVersionExpiration": {
                "NoncurrentDays": 90
            }
        }
    ]
}
EOF
    
    aws s3api put-bucket-lifecycle-configuration \
        --bucket "$BUCKET_NAME" \
        --lifecycle-configuration file:///tmp/lifecycle-policy.json
    
    echo -e "${GREEN}✓ Configured S3 bucket lifecycle policy${NC}"
    
    # Create bucket for images
    IMAGE_BUCKET_NAME="${PROJECT_NAME}-images-${STAGE}"
    
    if aws s3 ls "s3://${IMAGE_BUCKET_NAME}" 2>&1 | grep -q 'NoSuchBucket'; then
        if [ "$AWS_REGION" = "us-east-1" ]; then
            aws s3api create-bucket \
                --bucket "$IMAGE_BUCKET_NAME" \
                --region "$AWS_REGION"
        else
            aws s3api create-bucket \
                --bucket "$IMAGE_BUCKET_NAME" \
                --region "$AWS_REGION" \
                --create-bucket-configuration LocationConstraint="$AWS_REGION"
        fi
        echo -e "${GREEN}✓ Created S3 bucket: $IMAGE_BUCKET_NAME${NC}"
    else
        echo -e "${GREEN}✓ S3 bucket already exists: $IMAGE_BUCKET_NAME${NC}"
    fi
}

# Create DynamoDB tables
create_dynamodb_tables() {
    echo -e "\n${YELLOW}Creating DynamoDB tables...${NC}"
    
    # Properties table
    PROPERTIES_TABLE="${PROJECT_NAME}-properties-${STAGE}"
    if ! aws dynamodb describe-table --table-name "$PROPERTIES_TABLE" &> /dev/null; then
        aws dynamodb create-table \
            --table-name "$PROPERTIES_TABLE" \
            --attribute-definitions \
                AttributeName=property_id,AttributeType=S \
                AttributeName=city,AttributeType=S \
                AttributeName=price,AttributeType=N \
            --key-schema \
                AttributeName=property_id,KeyType=HASH \
            --global-secondary-indexes \
                "IndexName=CityIndex,KeySchema=[{AttributeName=city,KeyType=HASH},{AttributeName=price,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
            --provisioned-throughput \
                ReadCapacityUnits=5,WriteCapacityUnits=5 \
            --tags Key=Project,Value=$PROJECT_NAME Key=Stage,Value=$STAGE
        
        echo -e "${GREEN}✓ Created DynamoDB table: $PROPERTIES_TABLE${NC}"
        echo "  Waiting for table to be active..."
        aws dynamodb wait table-exists --table-name "$PROPERTIES_TABLE"
    else
        echo -e "${GREEN}✓ DynamoDB table already exists: $PROPERTIES_TABLE${NC}"
    fi
    
    # Market metrics table
    METRICS_TABLE="${PROJECT_NAME}-market-metrics-${STAGE}"
    if ! aws dynamodb describe-table --table-name "$METRICS_TABLE" &> /dev/null; then
        aws dynamodb create-table \
            --table-name "$METRICS_TABLE" \
            --attribute-definitions \
                AttributeName=market_id,AttributeType=S \
                AttributeName=period,AttributeType=S \
            --key-schema \
                AttributeName=market_id,KeyType=HASH \
                AttributeName=period,KeyType=RANGE \
            --provisioned-throughput \
                ReadCapacityUnits=5,WriteCapacityUnits=5 \
            --tags Key=Project,Value=$PROJECT_NAME Key=Stage,Value=$STAGE
        
        echo -e "${GREEN}✓ Created DynamoDB table: $METRICS_TABLE${NC}"
        echo "  Waiting for table to be active..."
        aws dynamodb wait table-exists --table-name "$METRICS_TABLE"
    else
        echo -e "${GREEN}✓ DynamoDB table already exists: $METRICS_TABLE${NC}"
    fi
    
    # AI insights cache table
    AI_CACHE_TABLE="${PROJECT_NAME}-ai-insights-${STAGE}"
    if ! aws dynamodb describe-table --table-name "$AI_CACHE_TABLE" &> /dev/null; then
        aws dynamodb create-table \
            --table-name "$AI_CACHE_TABLE" \
            --attribute-definitions \
                AttributeName=property_id,AttributeType=S \
                AttributeName=analysis_type,AttributeType=S \
            --key-schema \
                AttributeName=property_id,KeyType=HASH \
                AttributeName=analysis_type,KeyType=RANGE \
            --provisioned-throughput \
                ReadCapacityUnits=5,WriteCapacityUnits=5 \
            --tags Key=Project,Value=$PROJECT_NAME Key=Stage,Value=$STAGE
        
        echo -e "${GREEN}✓ Created DynamoDB table: $AI_CACHE_TABLE${NC}"
        echo "  Waiting for table to be active..."
        aws dynamodb wait table-exists --table-name "$AI_CACHE_TABLE"
    else
        echo -e "${GREEN}✓ DynamoDB table already exists: $AI_CACHE_TABLE${NC}"
    fi
}

# Create IAM role for Lambda functions
create_lambda_role() {
    echo -e "\n${YELLOW}Creating IAM role for Lambda functions...${NC}"
    
    ROLE_NAME="${PROJECT_NAME}-lambda-role-${STAGE}"
    
    # Trust policy for Lambda
    cat > /tmp/trust-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "lambda.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF
    
    # Check if role exists
    if ! aws iam get-role --role-name "$ROLE_NAME" &> /dev/null; then
        aws iam create-role \
            --role-name "$ROLE_NAME" \
            --assume-role-policy-document file:///tmp/trust-policy.json \
            --tags Key=Project,Value=$PROJECT_NAME Key=Stage,Value=$STAGE
        
        echo -e "${GREEN}✓ Created IAM role: $ROLE_NAME${NC}"
        
        # Attach basic Lambda execution policy
        aws iam attach-role-policy \
            --role-name "$ROLE_NAME" \
            --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
        
        # Create and attach custom policy for S3 and DynamoDB access
        cat > /tmp/lambda-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::${PROJECT_NAME}-*",
                "arn:aws:s3:::${PROJECT_NAME}-*/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:UpdateItem",
                "dynamodb:Query",
                "dynamodb:Scan",
                "dynamodb:BatchWriteItem"
            ],
            "Resource": [
                "arn:aws:dynamodb:${AWS_REGION}:${ACCOUNT_ID}:table/${PROJECT_NAME}-*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue"
            ],
            "Resource": [
                "arn:aws:secretsmanager:${AWS_REGION}:${ACCOUNT_ID}:secret:${PROJECT_NAME}/*"
            ]
        }
    ]
}
EOF
        
        POLICY_NAME="${PROJECT_NAME}-lambda-policy-${STAGE}"
        POLICY_ARN=$(aws iam create-policy \
            --policy-name "$POLICY_NAME" \
            --policy-document file:///tmp/lambda-policy.json \
            --query 'Policy.Arn' \
            --output text)
        
        aws iam attach-role-policy \
            --role-name "$ROLE_NAME" \
            --policy-arn "$POLICY_ARN"
        
        echo -e "${GREEN}✓ Attached custom policies to Lambda role${NC}"
        
        # Wait for role to propagate
        echo "  Waiting for IAM role to propagate..."
        sleep 10
    else
        echo -e "${GREEN}✓ IAM role already exists: $ROLE_NAME${NC}"
    fi
}

# Create Secrets Manager secret for API keys
create_secrets() {
    echo -e "\n${YELLOW}Creating Secrets Manager secrets...${NC}"
    
    SECRET_NAME="${PROJECT_NAME}/api-keys-${STAGE}"
    
    # Check if secret exists
    if ! aws secretsmanager describe-secret --secret-id "$SECRET_NAME" &> /dev/null; then
        # Create secret with placeholder values
        cat > /tmp/secret-value.json <<EOF
{
    "OPENROUTER_API_KEY": "PLACEHOLDER_UPDATE_THIS",
    "GOOGLE_MAPS_API_KEY": "PLACEHOLDER_UPDATE_THIS"
}
EOF
        
        aws secretsmanager create-secret \
            --name "$SECRET_NAME" \
            --description "API keys for HomeHarbor application" \
            --secret-string file:///tmp/secret-value.json \
            --tags Key=Project,Value=$PROJECT_NAME Key=Stage,Value=$STAGE
        
        echo -e "${GREEN}✓ Created secret: $SECRET_NAME${NC}"
        echo -e "${YELLOW}  ⚠ Remember to update secret values with actual API keys!${NC}"
    else
        echo -e "${GREEN}✓ Secret already exists: $SECRET_NAME${NC}"
    fi
}

# Setup CloudWatch Log Groups
create_log_groups() {
    echo -e "\n${YELLOW}Creating CloudWatch Log Groups...${NC}"
    
    LOG_GROUPS=(
        "/aws/lambda/${PROJECT_NAME}-redfin-ingestion-${STAGE}"
        "/aws/lambda/${PROJECT_NAME}-ct-etl-${STAGE}"
        "/aws/lambda/${PROJECT_NAME}-street-view-${STAGE}"
        "/aws/lambda/${PROJECT_NAME}-ai-vision-${STAGE}"
        "/aws/lambda/${PROJECT_NAME}-ai-description-${STAGE}"
    )
    
    for LOG_GROUP in "${LOG_GROUPS[@]}"; do
        if ! aws logs describe-log-groups --log-group-name-prefix "$LOG_GROUP" | grep -q "$LOG_GROUP"; then
            aws logs create-log-group --log-group-name "$LOG_GROUP"
            aws logs put-retention-policy \
                --log-group-name "$LOG_GROUP" \
                --retention-in-days 7
            echo -e "${GREEN}✓ Created log group: $LOG_GROUP${NC}"
        else
            echo -e "${GREEN}✓ Log group already exists: $LOG_GROUP${NC}"
        fi
    done
}

# Print summary
print_summary() {
    echo -e "\n${GREEN}=== Infrastructure Setup Complete ===${NC}\n"
    
    echo "Created Resources:"
    echo "  S3 Buckets:"
    echo "    - ${PROJECT_NAME}-data-sources-${STAGE}"
    echo "    - ${PROJECT_NAME}-images-${STAGE}"
    echo ""
    echo "  DynamoDB Tables:"
    echo "    - ${PROJECT_NAME}-properties-${STAGE}"
    echo "    - ${PROJECT_NAME}-market-metrics-${STAGE}"
    echo "    - ${PROJECT_NAME}-ai-insights-${STAGE}"
    echo ""
    echo "  IAM Role:"
    echo "    - ${PROJECT_NAME}-lambda-role-${STAGE}"
    echo ""
    echo "  Secrets:"
    echo "    - ${PROJECT_NAME}/api-keys-${STAGE}"
    echo ""
    
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "  1. Update API keys in Secrets Manager:"
    echo "     aws secretsmanager update-secret --secret-id ${PROJECT_NAME}/api-keys-${STAGE} --secret-string '{\"OPENROUTER_API_KEY\":\"your-key\",\"GOOGLE_MAPS_API_KEY\":\"your-key\"}'"
    echo ""
    echo "  2. Deploy Lambda functions:"
    echo "     cd lambda && npm run deploy"
    echo ""
    echo "  3. Test the ingestion pipeline:"
    echo "     npm run test:integration"
    echo ""
}

# Main execution
main() {
    check_aws_cli
    check_aws_credentials
    create_s3_buckets
    create_dynamodb_tables
    create_lambda_role
    create_secrets
    create_log_groups
    print_summary
}

# Run main function
main
