# Security Guidelines - HomeHarbor

**CRITICAL:** This document outlines security practices to protect sensitive data in cloud-based applications.

---

## 🔒 Protected Information

### AWS Account Information
**Your AWS Account (NEVER COMMIT):**
- Account ID, Account Name, Region
- Free Tier status and credits
- Access keys and credentials

### What NEVER to Commit
- ❌ AWS Access Keys / Secret Keys
- ❌ Database passwords
- ❌ API keys
- ❌ Session secrets / JWT secrets
- ❌ Private SSH keys
- ❌ TLS/SSL certificates
- ❌ Service account credentials
- ❌ Personal account information
- ❌ Production connection strings
- ❌ Any `.env` files with real values

---

## ✅ Security Best Practices

### 1. Environment Variables
**Always use environment variables for sensitive data.**

```bash
# Good: Use .env files (which are gitignored)
DATABASE_URL=postgresql://user:pass@host/db
AWS_REGION=us-east-2

# Bad: Hardcoding in source code
const dbUrl = "postgresql://user:pass@host/db";  // ❌ NEVER DO THIS
```

**Setup:**
```bash
# Copy the example file
cp .env.example .env

# Edit with your actual values
nano .env  # or your preferred editor

# Verify .env is gitignored
git status  # .env should NOT appear
```

### 2. AWS Credentials Management

**Recommended Approaches (in order of preference):**

#### A. IAM Roles (Production - BEST)
Use IAM roles attached to EC2, ECS, Lambda, etc. No credentials needed!

```javascript
// AWS SDK automatically uses IAM role
const s3 = new AWS.S3();
```

#### B. AWS CLI Configuration (Development)
```bash
aws configure
# Enter your credentials once
# Stored in ~/.aws/credentials (gitignored globally)
```

#### C. Environment Variables (Last Resort)
```bash
# .env file (gitignored)
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here
AWS_REGION=us-east-2
```

**NEVER in Code:**
```javascript
// ❌ NEVER DO THIS
const credentials = {
  accessKeyId: 'hardcoded-key-here',
  secretAccessKey: 'hardcoded-secret-here'
};
```

### 3. Git Safety Checks

**Before every commit:**
```bash
# Check what you're about to commit
git status
git diff --staged

# Look for patterns that might be secrets
git diff --staged | grep -i "key\|secret\|password\|token\|credential"
```

**Use git-secrets (recommended):**
```bash
# Install
brew install git-secrets  # macOS
# or
sudo apt install git-secrets  # Linux

# Setup for repo
git secrets --install
git secrets --register-aws

# Scan existing commits
git secrets --scan-history
```

### 4. File Verification Before Committing

```bash
# Check for sensitive files
find . -type f \( -name "*.env" -o -name "*credentials*" -o -name "*.pem" -o -name "*.key" \)

# Verify .gitignore is working
git check-ignore .env .env.local .aws/credentials

# Should output the filenames (meaning they're ignored)
```

### 5. Database Connection Strings

**Development:**
```bash
# .env
DATABASE_URL=postgresql://localhost:5432/homeharbor_dev
```

**Production:**
Use AWS Secrets Manager or Parameter Store:

```javascript
// Load from AWS Secrets Manager
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager({ region: 'us-east-2' });

const secret = await secretsManager.getSecretValue({ 
  SecretId: 'homeharbor/database/url' 
}).promise();

const dbUrl = secret.SecretString;
```

### 6. API Keys Management

**For third-party services:**

```bash
# .env
OPENAI_API_KEY=sk-...
MAPBOX_API_KEY=pk....
STRIPE_SECRET_KEY=sk_test_...
```

**In code:**
```javascript
// ✅ Good
const apiKey = process.env.OPENAI_API_KEY;

// ❌ Bad
const apiKey = "sk-...";
```

### 7. Frontend Environment Variables

**Next.js requires `NEXT_PUBLIC_` prefix for client-side variables:**

```bash
# .env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...  # Public token (safe)

# Never expose secrets on client
API_SECRET=secret123  # Only accessible server-side
```

### 8. Terraform State Protection

**Terraform state files can contain secrets!**

```bash
# .gitignore already includes:
*.tfstate
*.tfstate.*
*.tfstate.backup
terraform.tfvars
```

**Use remote state with encryption:**
```hcl
# terraform/backend.tf
terraform {
  backend "s3" {
    bucket         = "homeharbor-terraform-state"
    key            = "state/terraform.tfstate"
    region         = "us-east-2"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

---

## 🚨 If You Accidentally Commit Secrets

**Act immediately:**

### 1. Rotate the Compromised Credentials
```bash
# AWS: Deactivate the access key immediately
aws iam delete-access-key --access-key-id YOUR_KEY_ID --user-name your-user

# Generate new credentials
aws iam create-access-key --user-name your-user
```

### 2. Remove from Git History
```bash
# Remove sensitive file from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/sensitive-file" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (if already pushed)
git push origin --force --all

# Notify GitHub to clear cache
# Contact GitHub support or use: gh api -X DELETE repos/{owner}/{repo}/git/refs/heads/main
```

### 3. Alternative: Use BFG Repo-Cleaner
```bash
# Install BFG
brew install bfg  # macOS

# Remove secrets
bfg --delete-files credentials.json
bfg --replace-text passwords.txt  # List of secrets to remove

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push --force
```

### 4. Report the Incident
- Document what was exposed
- Update security practices
- Review access logs
- Consider security audit

---

## 🛡️ AWS Security Configuration

### Account-Level Security
- ✅ Enable MFA on root account
- ✅ Create IAM users (don't use root)
- ✅ Use IAM roles for services
- ✅ Enable CloudTrail logging
- ✅ Set up billing alerts
- ✅ Enable GuardDuty (threat detection)
- ✅ Use AWS Organizations for account management

### Service-Level Security
- Use Security Groups (restrictive by default)
- Enable VPC for network isolation
- Use AWS Secrets Manager for credentials
- Enable encryption at rest (S3, RDS, EBS)
- Enable encryption in transit (HTTPS, TLS)
- Regular security audits with AWS Security Hub

### IAM Best Practices
```bash
# Create deployment user (for CI/CD)
aws iam create-user --user-name homeharbor-deploy

# Attach minimal required policies
aws iam attach-user-policy \
  --user-name homeharbor-deploy \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Create access key
aws iam create-access-key --user-name homeharbor-deploy

# Store in GitHub Secrets (for GitHub Actions)
gh secret set AWS_ACCESS_KEY_ID
gh secret set AWS_SECRET_ACCESS_KEY
```

---

## 📋 Security Checklist

**Before Every Commit:**
- [ ] Run `git status` and review files
- [ ] Run `git diff --staged` and check for secrets
- [ ] Verify .env files are NOT staged
- [ ] Check for hardcoded credentials in code
- [ ] Ensure API keys use environment variables
- [ ] Review terraform.tfvars is not committed

**Before Deployment:**
- [ ] All secrets in AWS Secrets Manager
- [ ] IAM roles configured for services
- [ ] Security groups properly configured
- [ ] Encryption enabled for data at rest
- [ ] HTTPS/TLS for data in transit
- [ ] Logging and monitoring enabled
- [ ] Backup strategy in place

**Regular Reviews:**
- [ ] Rotate credentials quarterly
- [ ] Review IAM permissions (principle of least privilege)
- [ ] Check CloudTrail logs for suspicious activity
- [ ] Update dependencies (security patches)
- [ ] Review AWS Trusted Advisor recommendations
- [ ] Scan for vulnerabilities (npm audit, snyk)

---

## 🔧 Tools for Security

### Git-Secrets
```bash
git secrets --install
git secrets --register-aws
git secrets --scan
```

### Truffleहog (Find secrets in history)
```bash
docker run --rm -v "$PWD:/pwd" trufflesecurity/trufflehog:latest filesystem /pwd
```

### AWS CLI Configuration Check
```bash
# Check current credentials (obscured)
aws sts get-caller-identity

# Verify region
aws configure get region
```

### Environment Variable Validation
```bash
# Check if required vars are set
node -e "
const required = ['DATABASE_URL', 'AWS_REGION', 'SESSION_SECRET'];
const missing = required.filter(v => !process.env[v]);
if (missing.length) {
  console.error('Missing:', missing.join(', '));
  process.exit(1);
}
console.log('✓ All required variables set');
"
```

---

## 📚 Additional Resources

- [AWS Security Best Practices](https://aws.amazon.com/architecture/security-identity-compliance/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Git-Secrets Documentation](https://github.com/awslabs/git-secrets)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

---

**Last Updated:** January 30, 2026

