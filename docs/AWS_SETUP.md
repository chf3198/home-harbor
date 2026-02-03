# AWS Setup Guide - HomeHarbor

This guide walks through setting up AWS CLI and configuring your environment for the HomeHarbor project.

---

## Prerequisites

- AWS Free Tier account (or standard AWS account)
- Account ID and region information
- Terminal access

---

## Step 1: Install AWS CLI

AWS CLI v2 is already installed. Verify:

```bash
aws --version
# Expected: aws-cli/2.x.x Python/3.x.x Linux/...
```

If not installed, run:
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip"
cd /tmp && unzip awscliv2.zip
sudo ./aws/install
```

---

## Step 2: Create IAM User for Development

**Via AWS Console:**

1. Sign in to AWS Console: https://console.aws.amazon.com
2. Navigate to **IAM** → **Users** → **Create user**
3. User name: `homeharbor-dev`
4. Select: **Access key - Programmatic access**
5. Attach policies (for development):
  - `AmazonS3FullAccess`
  - `AmazonDynamoDBFullAccess`
  - `AWSLambdaFullAccess`
  - `AmazonEventBridgeFullAccess`
  - `CloudWatchLogsFullAccess`
  - `SecretsManagerReadWrite`
  - Or create a custom policy with least-privilege access

6. **Download credentials CSV** (access key ID and secret)
7. **Store securely** - you won't see the secret again!

---

## Step 3: Configure AWS CLI

**Interactive Configuration:**
```bash
aws configure
```

You'll be prompted for:
```
AWS Access Key ID: [Your access key from CSV]
AWS Secret Access Key: [Your secret key from CSV]
Default region name: us-east-2  # Or your preferred region
Default output format: json
```

**Alternative: Manual Configuration**
```bash
# Create/edit credentials file
mkdir -p ~/.aws
nano ~/.aws/credentials
```

Add:
```ini
[default]
aws_access_key_id = YOUR_ACCESS_KEY_HERE
aws_secret_access_key = YOUR_SECRET_KEY_HERE
```

Create/edit config:
```bash
nano ~/.aws/config
```

Add:
```ini
[default]
region = us-east-2
output = json
```

---

## Step 4: Verify Configuration

```bash
# Check configuration
aws configure list

# Verify identity
aws sts get-caller-identity

# Expected output:
# {
#     "UserId": "AIDAXXXXXXXXXXXXXXXXX",
#     "Account": "840797358426",
#     "Arn": "arn:aws:iam::840797358426:user/homeharbor-dev"
# }

# Test access to S3
aws s3 ls

# Test access to EC2 (list regions)
aws ec2 describe-regions --output table
```

---

## Step 5: Set Up Named Profiles (Optional)

For multiple AWS accounts or environments:

```bash
aws configure --profile homeharbor-prod
```

Use with:
```bash
aws s3 ls --profile homeharbor-prod
# Or set as default:
export AWS_PROFILE=homeharbor-prod
```

---

## Step 6: Configure Project Environment

Create local `.env` file:
```bash
cd /path/to/home-harbor
cp .env.example .env
nano .env
```

Update with your AWS settings:
```bash
AWS_REGION=us-east-2
AWS_ACCOUNT_ID=your-account-id-here

# For local development (CLI will use ~/.aws/credentials)
# Leave these commented out if using AWS CLI profiles
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
```

## Step 7: Provision HomeHarbor Resources

Run the infrastructure script to create all required resources:

```bash
cd infrastructure
./aws-setup.sh
```

This creates:
- S3 buckets for data + images
- DynamoDB tables for properties, market metrics, and AI insights
- IAM role for Lambda functions
- Secrets Manager placeholder for API keys
- CloudWatch log groups

---

## Required AWS Permissions for HomeHarbor

### S3 (Static Assets)
- `s3:CreateBucket`
- `s3:PutObject`
- `s3:GetObject`
- `s3:DeleteObject`
- `s3:ListBucket`

### CloudFront (CDN)
- `cloudfront:CreateDistribution`
- `cloudfront:GetDistribution`
- `cloudfront:UpdateDistribution`
- `cloudfront:DeleteDistribution`

### Lambda (Compute)
- `lambda:CreateFunction`
- `lambda:UpdateFunctionCode`
- `lambda:UpdateFunctionConfiguration`
- `lambda:InvokeFunction`

### DynamoDB (Database)
- `dynamodb:CreateTable`
- `dynamodb:DescribeTable`
- `dynamodb:UpdateTable`
- `dynamodb:PutItem`
- `dynamodb:BatchWriteItem`
- `dynamodb:Query`
- `dynamodb:Scan`

### EventBridge (Scheduling)
- `events:PutRule`
- `events:PutTargets`
- `events:DescribeRule`

### IAM (Service Roles)
- `iam:CreateRole`
- `iam:AttachRolePolicy`
- `iam:PassRole`

### Secrets Manager (API Keys)
- `secretsmanager:CreateSecret`
- `secretsmanager:GetSecretValue`
- `secretsmanager:UpdateSecret`

### CloudWatch (Logging/Monitoring)
- `logs:CreateLogGroup`
- `logs:CreateLogStream`
- `logs:PutLogEvents`
- `cloudwatch:PutMetricData`

### Lambda (Serverless Functions)
- `lambda:CreateFunction`
- `lambda:InvokeFunction`
- `lambda:UpdateFunctionCode`

---

## Minimal IAM Policy for HomeHarbor

Create a custom policy with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "cloudfront:*",
        "ecs:*",
        "rds:*",
        "elasticache:*",
        "lambda:*",
        "logs:*",
        "cloudwatch:*",
        "ec2:Describe*",
        "ec2:CreateSecurityGroup",
        "ec2:AuthorizeSecurityGroupIngress",
        "iam:CreateRole",
        "iam:AttachRolePolicy",
        "iam:PassRole",
        "iam:GetRole"
      ],
      "Resource": "*"
    }
  ]
}
```

**Note:** This is permissive for development. For production, use least-privilege principles.

---

## Security Best Practices

### 1. Never Commit Credentials
```bash
# ✅ Good: Use AWS CLI configuration
aws configure

# ✅ Good: Use IAM roles (production)
# EC2/ECS instances automatically get credentials

# ❌ Bad: Hardcode in .env (then commit)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
```

### 2. Use MFA for Console Access
Enable Multi-Factor Authentication on your AWS account root and IAM users.

### 3. Rotate Access Keys Regularly
```bash
# Create new key
aws iam create-access-key --user-name homeharbor-dev

# Update your configuration
aws configure

# Delete old key
aws iam delete-access-key --access-key-id OLD_KEY_ID --user-name homeharbor-dev
```

### 4. Use AWS Secrets Manager for Production
```bash
# Store database password
aws secretsmanager create-secret \
  --name homeharbor/database/password \
  --secret-string "your-secure-password"

# Retrieve in code (never hardcode)
```

### 5. Enable CloudTrail
Monitor all AWS API calls for security auditing.

---

## Troubleshooting

### "Unable to locate credentials"
```bash
# Check configuration
aws configure list

# Verify credentials file exists
cat ~/.aws/credentials

# Test with explicit profile
aws s3 ls --profile default
```

### "Access Denied" Errors
```bash
# Check your user's policies
aws iam list-attached-user-policies --user-name homeharbor-dev

# Verify your identity
aws sts get-caller-identity
```

### Region Mismatch
```bash
# Check current region
aws configure get region

# Override for single command
aws s3 ls --region us-east-2

# Set default region
aws configure set region us-east-2
```

### Credential Conflicts
```bash
# Clear environment variables
unset AWS_ACCESS_KEY_ID
unset AWS_SECRET_ACCESS_KEY
unset AWS_SESSION_TOKEN

# Use only CLI config
aws s3 ls
```

---

## Next Steps

Once AWS CLI is configured:

1. **Test Infrastructure Setup**
   ```bash
   # Create S3 bucket for testing
   aws s3 mb s3://homeharbor-test-$(date +%s) --region us-east-2
   
   # List buckets
   aws s3 ls
   ```

2. **Set Up Terraform/CDK**
   - Initialize infrastructure as code
   - Plan resource creation
   - Apply configuration

3. **Deploy Application**
   - Build Docker images
   - Push to ECR
   - Deploy to ECS/Fargate

4. **Configure CI/CD**
   - Add AWS credentials to GitHub Secrets
   - Set up GitHub Actions workflows
   - Automate deployments

---

## Useful AWS CLI Commands

### S3
```bash
# List buckets
aws s3 ls

# Create bucket
aws s3 mb s3://bucket-name --region us-east-2

# Upload file
aws s3 cp file.txt s3://bucket-name/

# Sync directory
aws s3 sync ./dist s3://bucket-name/
```

### RDS
```bash
# List databases
aws rds describe-db-instances

# Get connection endpoint
aws rds describe-db-instances \
  --db-instance-identifier homeharbor-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

### ECS
```bash
# List clusters
aws ecs list-clusters

# List services
aws ecs list-services --cluster homeharbor

# Get task definition
aws ecs describe-task-definition --task-definition homeharbor-api
```

### CloudWatch Logs
```bash
# List log groups
aws logs describe-log-groups

# Tail logs
aws logs tail /aws/ecs/homeharbor-api --follow
```

---

**Setup Complete!** Your AWS CLI is ready for HomeHarbor development.
