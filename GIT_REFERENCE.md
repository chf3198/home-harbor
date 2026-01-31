# Git & GitHub Repository Setup - HomeHarbor

**Repository URL:** https://github.com/chf3198/home-harbor
**Owner:** chf3198
**Visibility:** Public

---

## Repository Information

**Description:** HomeHarbor: AI-powered real estate marketplace demo - Staff-level engineering showcase for Realtor.com

**Topics:**
- real-estate
- ai
- machine-learning
- nextjs
- nodejs
- graphql
- aws
- typescript
- portfolio
- staff-engineer

**Features Enabled:**
- ✅ Issues
- ✅ Projects
- ❌ Wiki (disabled for simplicity)

---

## Git Configuration

**Branch:** main (default)
**Remote:** origin → https://github.com/chf3198/home-harbor.git
**Protocol:** HTTPS
**User:** TSV Dev Environment (dev@tsvcomms.local)
**GitHub Account:** chf3198

---

## Common Git Commands Reference

### Daily Workflow
```bash
# Check status
git status

# Add all changes
git add .

# Add specific file
git add <file>

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# View commit history
git log --oneline --graph --decorate --all
```

### Branch Management
```bash
# Create new branch
git checkout -b feature/branch-name

# Switch branches
git checkout main

# List all branches
git branch -a

# Delete local branch
git branch -d feature/branch-name

# Delete remote branch
git push origin --delete feature/branch-name

# Push new branch to remote
git push -u origin feature/branch-name
```

### Viewing Changes
```bash
# View changes (unstaged)
git diff

# View changes (staged)
git diff --staged

# View changes in specific file
git diff <file>

# View commit changes
git show <commit-hash>
```

### Undoing Changes
```bash
# Discard changes in working directory
git checkout -- <file>

# Unstage file (keep changes)
git reset HEAD <file>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Amend last commit
git commit --amend -m "New message"
```

### Remote Operations
```bash
# View remotes
git remote -v

# Add remote
git remote add <name> <url>

# Remove remote
git remote remove <name>

# Fetch from remote
git fetch origin

# View remote branches
git branch -r
```

---

## GitHub CLI Commands Reference

### Repository Management
```bash
# View repository
gh repo view

# Open repository in browser
gh repo view --web

# Clone repository
gh repo clone chf3198/home-harbor

# Edit repository settings
gh repo edit --description "New description"
gh repo edit --add-topic "new-topic"
gh repo edit --enable-issues
gh repo edit --enable-projects

# Archive repository
gh repo archive

# Delete repository (careful!)
gh repo delete
```

### Issues Management
```bash
# List issues
gh issue list

# Create issue
gh issue create --title "Issue title" --body "Issue description"

# View issue
gh issue view <number>

# Close issue
gh issue close <number>

# Reopen issue
gh issue reopen <number>
```

### Pull Requests
```bash
# List PRs
gh pr list

# Create PR
gh pr create --title "PR title" --body "PR description"

# View PR
gh pr view <number>

# Checkout PR locally
gh pr checkout <number>

# Merge PR
gh pr merge <number>

# Close PR
gh pr close <number>
```

### Releases
```bash
# List releases
gh release list

# Create release
gh release create v1.0.0 --title "Version 1.0.0" --notes "Release notes"

# View release
gh release view v1.0.0

# Download release assets
gh release download v1.0.0
```

### GitHub Actions / Workflows
```bash
# List workflows
gh workflow list

# View workflow runs
gh run list

# View specific run
gh run view <run-id>

# Re-run workflow
gh run rerun <run-id>

# Watch a workflow run
gh run watch
```

---

## Project-Specific Git Workflow

### Feature Development Workflow
```bash
# 1. Create feature branch
git checkout -b feature/ai-search

# 2. Make changes and commit regularly
git add .
git commit -m "feat: implement natural language search"

# 3. Push to remote
git push -u origin feature/ai-search

# 4. Create PR via GitHub CLI
gh pr create --title "Add AI-powered search" --body "Implements natural language search using GPT-4"

# 5. After review, merge via GitHub CLI
gh pr merge --squash

# 6. Switch back to main and pull
git checkout main
git pull origin main

# 7. Delete feature branch
git branch -d feature/ai-search
```

### Commit Message Conventions
```bash
# Types
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation changes
style:    # Code style changes (formatting, etc.)
refactor: # Code refactoring
test:     # Adding or updating tests
chore:    # Maintenance tasks
perf:     # Performance improvements
ci:       # CI/CD changes

# Examples
git commit -m "feat: add GraphQL API endpoint for property search"
git commit -m "fix: resolve pagination issue in listings"
git commit -m "docs: update README with AWS deployment instructions"
git commit -m "test: add E2E tests for user authentication"
git commit -m "chore: upgrade Next.js to v14"
```

### Syncing Fork (if applicable)
```bash
# Add upstream remote
git remote add upstream https://github.com/original-owner/home-harbor.git

# Fetch upstream changes
git fetch upstream

# Merge upstream changes
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

---

## Repository Protection Rules (Future Setup)

When the project matures, consider adding branch protection:

```bash
# Via GitHub CLI (requires admin permissions)
gh api repos/chf3198/home-harbor/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["ci/test"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}'
```

**Recommended Protection Rules:**
- Require pull request reviews before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Include administrators in restrictions
- Restrict who can push to matching branches

---

## GitHub Secrets for CI/CD

To add secrets for GitHub Actions:

```bash
# Via GitHub CLI
gh secret set AWS_ACCESS_KEY_ID < aws_key.txt
gh secret set AWS_SECRET_ACCESS_KEY < aws_secret.txt
gh secret set DATABASE_URL < db_url.txt

# Or interactively
gh secret set AWS_ACCESS_KEY_ID
# (paste value when prompted)
```

---

## Useful Git Aliases

Add these to `~/.gitconfig` for productivity:

```bash
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = log --oneline --graph --decorate --all
    amend = commit --amend --no-edit
    pushf = push --force-with-lease
    sync = !git fetch origin && git rebase origin/main
```

---

## Initial Repository Structure

```
home-harbor/
├── .editorconfig
├── .github/
│   └── copilot-instructions.md
├── .gitignore
├── README.md
├── RECOVERED_CHAT_SUMMARY.md
├── package.json
└── playwright.config.ts
```

**Initial Commit:** d606fa0
**Branch:** main
**Files:** 7 files, 487 insertions

---

## Next Steps

1. **Set up CI/CD pipeline** - GitHub Actions workflow
2. **Add branch protection** - Require reviews and passing tests
3. **Configure GitHub Projects** - Track feature development
4. **Add issue templates** - Standardize bug reports and feature requests
5. **Create PR template** - Ensure consistent pull request descriptions
6. **Add CONTRIBUTING.md** - Guide for contributors
7. **Add CODE_OF_CONDUCT.md** - Community guidelines
8. **Add LICENSE** - Choose appropriate license (MIT recommended)
9. **Set up GitHub Pages** - Host documentation or demo
10. **Configure Dependabot** - Automated dependency updates

---

## Troubleshooting

### Authentication Issues
```bash
# Re-authenticate with GitHub CLI
gh auth login

# Check authentication status
gh auth status

# Refresh token
gh auth refresh
```

### Permission Issues
```bash
# If push fails due to permissions
# Check remote URL
git remote -v

# Switch to HTTPS if using SSH (or vice versa)
git remote set-url origin https://github.com/chf3198/home-harbor.git
```

### Large File Issues
```bash
# If you accidentally committed large files
# Use Git LFS for large files
git lfs install
git lfs track "*.psd"
git add .gitattributes
git commit -m "chore: configure Git LFS"
```

---

**Setup Completed:** January 30, 2026
**Repository:** https://github.com/chf3198/home-harbor
