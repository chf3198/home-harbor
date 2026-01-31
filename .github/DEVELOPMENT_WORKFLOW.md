# Development Workflow: Industry-Standard Iterative Process

**Mission**: Establish a rigorous, self-improving development workflow that ensures quality, testability, and continuous learning.

**Philosophy**: Git is the source of truth. Commit early, commit often, commit with meaning. Every commit is a checkpoint, every branch is a hypothesis, every merge is a validated improvement.

**Core Principle**: Git is not just version control—it's your primary backup system, your time machine, your collaboration protocol, your deployment trigger, and your safety net. Master git, master the workflow.

---

## Git-First Mindset

**Before any work:**
1. Git status - know your state
2. Git pull - sync with truth
3. Git checkout -b - isolate your work
4. Git commit - save your progress (every 30 minutes minimum)
5. Git push - backup to remote (at least daily)

**Git protects you from:**
- Data loss (reflog keeps 90 days of history)
- Bad changes (easy revert)
- Merge conflicts (small commits = small conflicts)
- Lost work (everything is recoverable)
- Deployment errors (tagged releases)

---

## Workflow Overview: The Double Diamond Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                    ITERATION CYCLE (n)                          │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: DISCOVER (Research & Requirements)                    │
│  ─────────────────────────────────────────────────────────────  │
│  □ Understand requirement deeply                                │
│  □ Research current best practices (web search if needed)       │
│  □ Identify potential pitfalls from past failures               │
│  □ Define success criteria                                      │
│  □ Document assumptions                                         │
│  □ Create acceptance test scenarios                             │
│                                                                  │
│  Output: Research findings + Test scenarios                     │
└──────────────────────────────┬──────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: DEFINE (Architecture & Design)                        │
│  ─────────────────────────────────────────────────────────────  │
│  □ Break down into smallest testable units                      │
│  □ Design pure functions with clear interfaces                  │
│  □ Plan dependency injection points                             │
│  □ Create file structure (all files <100 lines)                 │
│  □ Write test stubs BEFORE implementation                       │
│  □ Document design decisions in code comments                   │
│                                                                  │
│  Output: Architecture doc + Test stubs                          │
└──────────────────────────────┬──────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: DEVELOP (TDD Implementation)                          │
│  ─────────────────────────────────────────────────────────────  │
│  For each component:                                            │
│  1. RED: Write failing test                                     │
│  2. GREEN: Write minimal code to pass                           │
│  3. REFACTOR: Clean up while keeping tests green                │
│  4. INTEGRATE: Run all tests                                    │
│  5. COMMIT: Small, atomic commits with clear messages           │
│                                                                  │
│  Rules:                                                          │
│  • No code without a test                                       │
│  • Test edge cases and error conditions                         │
│  • Mock external dependencies                                   │
│  • Run linter before commit                                     │
│                                                                  │
│  Output: Working, tested code + Git commits                     │
└──────────────────────────────┬──────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: DELIVER (Integration & Deployment)                    │
│  ─────────────────────────────────────────────────────────────  │
│  □ Run full test suite (unit + integration + e2e)               │
│  □ Check code coverage (must be ≥80%)                           │
│  □ Manual testing in staging environment                        │
│  □ Deploy to production via CI/CD                               │
│  □ Smoke test production                                        │
│  □ Monitor for errors (CloudWatch, logs)                        │
│                                                                  │
│  Output: Deployed feature + Metrics                             │
└──────────────────────────────┬──────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 5: REFLECT (Self-Evaluation & Learning) ★ CRITICAL       │
│  ─────────────────────────────────────────────────────────────  │
│  Self-Assessment Questions:                                     │
│  ❓ What went well? (Capture successes)                         │
│  ❓ What failed or was difficult? (Identify pain points)        │
│  ❓ What errors occurred? (Root cause analysis)                 │
│  ❓ Were assumptions correct? (Validate learnings)              │
│  ❓ What would I do differently? (Improvement actions)          │
│  ❓ What new knowledge was gained? (Document for future)        │
│                                                                  │
│  Actions:                                                        │
│  • Log failures in LESSONS_LEARNED.md                           │
│  • Update workflow if pattern emerges                           │
│  • Research solutions to recurring problems                     │
│  • Add guardrails (linting rules, pre-commit checks)            │
│  • Share knowledge in code comments/docs                        │
│                                                                  │
│  Output: Updated knowledge base + Process improvements          │
└──────────────────────────────┬──────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 6: ITERATE (Apply Learnings to Next Cycle)               │
│  ─────────────────────────────────────────────────────────────  │
│  □ Incorporate reflection insights into next iteration          │
│  □ Update checklist with new best practices                     │
│  □ Adjust time estimates based on actuals                       │
│  □ Begin next feature/task with improved process                │
│                                                                  │
│  Output: Enhanced workflow for iteration (n+1)                  │
└──────────────────────────────┬──────────────────────────────────┘
          │
          └──────────────┐
                         │
                    LOOP BACK TO PHASE 1
```

---

## Detailed Phase Breakdown

---

## PHASE 0: GIT SETUP & PROTECTION (Before All Work)

**Goal**: Ensure git is configured for safety, clarity, and automation.

**Initial Setup (One-Time):**

```bash
# Configure identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Configure default branch name
git config --global init.defaultBranch main

# Configure commit template for better messages
git config --global commit.template ~/.gitmessage

# Enable auto-correct for typos
git config --global help.autocorrect 20

# Configure merge strategy (prefer rebase for cleaner history)
git config --global pull.rebase true

# Enable automatic stash before rebase
git config --global rebase.autoStash true

# Configure diff and merge tools
git config --global diff.tool vimdiff
git config --global merge.tool vimdiff

# Show original state in merge conflicts
git config --global merge.conflictStyle diff3

# Enable color output
git config --global color.ui auto

# Configure aliases for common commands
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm "commit -m"
git config --global alias.unstage "reset HEAD --"
git config --global alias.last "log -1 HEAD"
git config --global alias.visual "log --graph --oneline --all"
git config --global alias.amend "commit --amend --no-edit"
git config --global alias.undo "reset HEAD~1 --soft"
git config --global alias.wip "commit -am 'WIP: work in progress'"
```

**Create Commit Message Template (~/.gitmessage):**

```
# <type>(<scope>): <subject> (max 50 chars)
# |<----  Using a Maximum Of 50 Characters  ---->|

# Explain why this change is being made
# |<----   Try To Limit Each Line to a Maximum Of 72 Characters   ---->|

# Provide links or keys to any relevant tickets, articles or other resources
# Example: Fixes #23

# --- COMMIT END ---
# Type can be:
#    feat     (new feature)
#    fix      (bug fix)
#    refactor (refactoring code)
#    style    (formatting, missing semi colons, etc; no code change)
#    docs     (changes to documentation)
#    test     (adding or refactoring tests; no production code change)
#    chore    (updating build tasks, package.json, etc; no production code change)
#    perf     (performance improvement)
#    ci       (changes to CI configuration)
#    build    (changes to build system)
#    revert   (reverting a previous commit)
# --------------------
# Remember to:
#   * Capitalize the subject line
#   * Use the imperative mood in the subject line
#   * Do not end the subject line with a period
#   * Separate subject from body with a blank line
#   * Use the body to explain what and why vs. how
#   * Can use multiple lines with "-" or "*" for bullet points in body
# --------------------
```

**Daily Git Workflow Start:**

```bash
# 1. Check current state
git status
# Verify: clean working directory, on correct branch

# 2. Sync with remote
git fetch origin
git status
# Review: check if behind origin

# 3. Update local main
git checkout main
git pull --rebase origin main
# Result: local main matches remote

# 4. Create feature branch
git checkout -b feature/task-name
# Naming: feature/, fix/, docs/, test/, refactor/, chore/
# Example: feature/add-search, fix/cors-headers, docs/api-readme

# 5. Verify branch
git branch --show-current
git log --oneline -5
# Confirm: on new branch, starting from latest main
```

**Git Safety Checklist (Before Each Commit):**

```bash
# 1. Review what changed
git status
git diff

# 2. Stage intentionally
git add path/to/file1.js path/to/file2.js
# NEVER use `git add .` without reviewing first

# 3. Verify staged changes
git diff --staged

# 4. Check for secrets/credentials
git diff --staged | grep -i "password\|secret\|key\|token\|api"
# If match found: STOP, remove secrets, add to .gitignore

# 5. Run tests before commit
npm test
# All tests must pass

# 6. Lint before commit
npm run lint
# Fix all errors

# 7. Commit with meaningful message
git commit
# Editor opens with template, fill it out properly
```

---

### PHASE 1: DISCOVER (Research & Requirements) (30% of time)

**Goal**: Fully understand the problem before writing any code.

**Git Actions at Start:**
```bash
# Create discovery branch if needed for experimentation
git checkout -b spike/research-topic-name
# Spike branches are for learning, will be deleted after findings documented
```

**Checklist:**

1. **□ Read Requirement Carefully**
   - What is the user asking for?
   - What is the implicit need behind the ask?
   - What are the acceptance criteria?

2. **□ Research Current Best Practices**
   - **TRIGGER**: When my knowledge is >6 months old OR when uncertain
   - **ACTION**: Web search for:
     - Latest framework versions and APIs
     - Industry patterns and anti-patterns
     - Common pitfalls and solutions
     - Performance benchmarks
   - **DOCUMENT**: Findings in code comments or design doc

3. **□ Review Past Failures**
   - Check LESSONS_LEARNED.md for similar tasks
   - Identify what went wrong before
   - Plan preventive measures

4. **□ Define Success Criteria**
   - Functional requirements (what it does)
   - Non-functional requirements (performance, security)
   - Test scenarios that prove success

5. **□ Validate Assumptions**
   - List all assumptions
   - Verify with user if unclear
   - Document in design doc

**Example Output:**
```markdown
## Feature: Property Search

### Requirements
- User can search properties by city name
- Results display in <500ms
- Partial matches allowed (e.g., "Sea" matches "Seattle")

### Research Findings
- PostgreSQL ILIKE is case-insensitive
- Add index on city column for performance
- AWS Lambda cold start avg 200ms (warm 50ms)

### Past Failures
- Previously forgot to sanitize user input → SQL injection risk
- Preventive: Use parameterized queries (pg library)

### Success Criteria
- Test: "Seattle" returns Seattle properties
- Test: "sea" (lowercase) still works
- Test: Empty query returns error
- Test: SQL injection attempt fails safely
```

**Git Actions at End:**
```bash
# Document findings
git add docs/research/property-search.md
git commit -m "docs(research): document property search findings

- PostgreSQL ILIKE for case-insensitive search
- GIN index required for performance
- Parameterized queries prevent SQL injection
- Lambda cold start considerations

Refs #42"

# Delete spike branch if used
git checkout main
git branch -D spike/research-topic-name

# Create actual feature branch
git checkout -b feature/property-search
```

---

### PHASE 2: DEFINE - Architecture & Design (20% of time)

**Goal**: Design before coding. Make it testable from the start.

**Checklist:**

1. **□ Decompose into Pure Functions**
   - Each function has single responsibility
   - No side effects in business logic
   - Dependencies passed as parameters

2. **□ Create Test Stubs First**
   ```javascript
   // Write the test BEFORE the function
   test('searchByCity filters correctly', () => {
     // Arrange
     const properties = [/* mock data */];
     // Act
     const result = searchByCity(properties, 'Seattle');
     // Assert
     expect(result).toHaveLength(2);
   });
   ```

3. **□ Plan File Structure**
   - Keep files <100 lines
   - One component/function per file
   - Clear naming convention

4. **□ Design Dependency Injection**
   ```javascript
   // Bad: Hard-coded dependency
   async function getData() {
     const db = new Database(); // Can't test!
   }
   
   // Good: Injected dependency
   async function getData(dbClient) {
     // Can pass mock in tests!
   }
   ```

5. **□ Document Interfaces**
   ```javascript
   /**
    * Search properties by city name
    * @param {Array<Property>} properties - List of all properties
    * @param {string} city - City name to search (case-insensitive)
    * @returns {Array<Property>} Filtered properties
    * @throws {Error} If city is empty or invalid
    */
   function searchByCity(properties, city) { /*...*/ }
   ```

**Example Output:**
```
backend/functions/search-properties/
├── index.js                    # Lambda handler (30 lines)
├── searchService.js            # Business logic (45 lines)
├── searchService.test.js       # Unit tests (60 lines)
└── package.json
```

**Git Actions at End:**
```bash
# Commit design document
git add docs/design/property-search-architecture.md
git commit -m "docs(design): property search architecture

- Repository pattern for database isolation
- Pure business logic in searchService
- Dependency injection for testability
- File structure keeps all files <100 lines

Refs #42"

# Commit test stubs (scaffold)
git add backend/functions/search-properties/*.test.js
git commit -m "test(search): add test stubs for property search

- Test cases for validation
- Test cases for filtering logic
- Test cases for edge cases
- All tests fail (no implementation yet)

Refs #42"
```

---

### PHASE 3: DEVELOP - TDD Implementation (40% of time)

**Goal**: Write tests first, then code. Keep cycles tight. **Commit after every passing test.**

**Git Strategy: Atomic Commits**

Each commit should be:
- **Small**: One logical change
- **Complete**: Doesn't break the build
- **Testable**: Has passing tests
- **Revertable**: Can be undone cleanly
- **Meaningful**: Clear commit message

**Red-Green-Refactor Cycle (repeat for each function):**

**1. RED: Write Failing Test**
```javascript
test('searchByCity throws error for empty city', () => {
  expect(() => searchByCity([], '')).toThrow('City cannot be empty');
});
```
Run test → Fails (function doesn't exist yet) ✅

**GIT: Commit Failing Test**
```bash
git add searchService.test.js
git commit -m "test(search): add validation test for empty city

Red phase: test fails as expected (no implementation)

Refs #42"

# Push to backup work
git push origin feature/property-search
```

**2. GREEN: Write Minimal Code**
```javascript
function searchByCity(properties, city) {
  if (!city) throw new Error('City cannot be empty');
  return properties.filter(p => 
    p.city.toLowerCase().includes(city.toLowerCase())
  );
}
```
Run test → Passes ✅

**GIT: Commit Passing Implementation**
```bash
git add searchService.js
git commit -m "feat(search): implement city validation

Green phase: test now passes

- Throws error for empty city input
- Basic filter implementation

Refs #42"

git push origin feature/property-search
```

**3. REFACTOR: Clean Up**
```javascript
function searchByCity(properties, city) {
  validateCity(city); // Extract validation
  return filterByCity(properties, city); // Extract filtering
}

function validateCity(city) {
  if (!city?.trim()) throw new Error('City cannot be empty');
}

function filterByCity(properties, city) {
  const normalizedCity = city.toLowerCase().trim();
  return properties.filter(p => 
    p.city.toLowerCase().includes(normalizedCity)
  );
}
```
Run tests → All pass ✅

**GIT: Commit Refactoring**
```bash
git add searchService.js
git commit -m "refactor(search): extract validation and filtering

Refactor phase: tests still pass

- Separate validation logic into validateCity
- Extract filtering logic into filterByCity
- Improve readability without changing behavior

Refs #42"

git push origin feature/property-search
```

**4. INTEGRATE: Run All Tests**
```bash
npm test
# All tests must pass before proceeding
```

**5. SAVE PROGRESS: Push Regularly**
```bash
# Push at least every hour or every 3-5 commits
git push origin feature/property-search

# This backs up your work to remote
# Allows others to see your progress
# Enables CI to run tests
```

**Git Commit Message Standards (Conventional Commits):**

Format: `<type>(<scope>): <subject>`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting (no code change)
- `refactor`: Code change (no feature/fix)
- `test`: Adding/updating tests
- `chore`: Tooling, configs
- `perf`: Performance improvement
- `ci`: CI configuration
- `build`: Build system changes
- `revert`: Revert previous commit

**Subject Line Rules:**
1. Max 50 characters
2. Capitalize first letter
3. No period at end
4. Imperative mood ("Add feature" not "Added feature")
5. Complete this: "If applied, this commit will ___"

**Body (optional):**
- Wrap at 72 characters
- Explain WHY, not HOW
- Reference issues: `Refs #42`, `Closes #42`, `Fixes #42`

**Example Perfect Commit:**
```bash
git commit -m "feat(search): add fuzzy matching for city names

Improves user experience by allowing typos and partial matches.
Uses Levenshtein distance algorithm with threshold of 0.8.

Previous behavior: exact match required ('Seattle' !== 'Seatle')
New behavior: fuzzy match tolerates small typos

Performance impact: +10ms average query time
Acceptable trade-off for better UX

Closes #42
See also: #38 (UX improvements epic)"
```

**Error Handling Protocol:**

When encountering an error:

1. **STOP**: Don't guess or try random fixes
2. **SAVE**: Commit or stash current work
   ```bash
   git stash save "WIP: before debugging error XYZ"
   ```
3. **READ**: Read the full error message carefully
4. **RESEARCH**: Web search if error is unfamiliar
5. **UNDERSTAND**: Identify root cause
6. **FIX**: Apply targeted solution in new commit
7. **TEST**: Verify fix works
8. **DOCUMENT**: Add to LESSONS_LEARNED.md
9. **RECOVER**: If fix failed, use git to reset
   ```bash
   git reflog  # Find state before failed fix
   git reset --hard HEAD@{N}  # Go back
   ```

**Git Recovery Techniques (When Things Go Wrong):**

```bash
# Oh shit, I committed to wrong branch!
git log  # Find the commit hash
git reset HEAD~1 --soft  # Undo commit, keep changes
git stash  # Save changes
git checkout correct-branch
git stash pop  # Apply changes
git add .
git commit -m "feat: correct commit message"

# Alternative: cherry-pick the commit
git checkout correct-branch
git cherry-pick <commit-hash>
git checkout wrong-branch
git reset HEAD~1 --hard  # Delete the wrong commit

# Oh shit, I need to undo last commit but keep changes!
git reset HEAD~1 --soft
# Changes now staged, ready to recommit differently

# Oh shit, I want to completely undo last commit!
git reset HEAD~1 --hard
# WARNING: This deletes changes permanently
# Unless you pushed, then they're in reflog

# Oh shit, I committed sensitive data!
# 1. Remove file from history (nuclear option)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/sensitive/file" \
  --prune-empty --tag-name-filter cat -- --all
# 2. Force push to rewrite remote history
git push origin --force --all
# 3. Immediately rotate credentials

# Oh shit, I made a typo in last commit message!
git commit --amend -m "Correct message here"
# WARNING: Only if not pushed, or use --force-with-lease

# Oh shit, I forgot to add a file to last commit!
git add forgotten-file.js
git commit --amend --no-edit

# Oh shit, I want to see what I deleted!
git reflog  # Shows all HEAD movements
# Find commit before deletion
git show HEAD@{5}:path/to/deleted/file.js

# Oh shit, I want to undo a merge!
git merge --abort  # If merge in progress
git reset --hard HEAD~1  # If merge completed

# Oh shit, I rebased and broke everything!
git reflog
git reset --hard HEAD@{before-rebase}

# Oh shit, I need to find which commit broke tests!
git bisect start
git bisect bad  # Current state is broken
git bisect good <commit-hash>  # Known good state
# Git checks out middle commit
npm test
git bisect good  # if tests pass
# OR
git bisect bad  # if tests fail
# Repeat until git finds the breaking commit
git bisect reset  # Return to original state

# Oh shit, I want to work on two features simultaneously!
git worktree add ../feature-2 feature/feature-2
# Now you have two working directories from same repo
# Can work on feature-1 in main directory
# Work on feature-2 in ../feature-2 directory
cd ../feature-2  # Switch context
# When done:
git worktree remove ../feature-2

# Oh shit, I have uncommitted changes but need to switch branches!
git stash save "WIP: description of work"
git checkout other-branch
# Do work on other branch
git checkout original-branch
git stash pop  # Restore changes

# Oh shit, I want to apply just one file from a stash!
git checkout stash@{0} -- path/to/file.js

# Oh shit, I want to see all my stashes!
git stash list
git stash show stash@{0}  # Show changes
git stash show -p stash@{0}  # Show diff

# Oh shit, I want to find when a line was changed!
git blame path/to/file.js
git blame -L 10,20 path/to/file.js  # Specific lines

# Oh shit, I want to see all changes to a file!
git log -p path/to/file.js

# Oh shit, I want to find a commit by message!
git log --all --grep="search term"

# Oh shit, I want to see what changed between branches!
git log main..feature/my-branch  # Commits in feature not in main
git diff main...feature/my-branch  # Changes since branch point

# Oh shit, I want to tag a release!
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Oh shit, I want to delete a tag!
git tag -d v1.0.0  # Local
git push origin --delete v1.0.0  # Remote
```

**Git Safety Commands (Use These Regularly):**

```bash
# Check what will be pushed before pushing
git log origin/main..HEAD
git diff origin/main..HEAD

# Dry-run a merge before doing it
git merge --no-commit --no-ff feature-branch
# Review changes, then:
git merge --abort  # Cancel
# OR
git commit  # Accept

# Safe force push (only if remote hasn't changed)
git push --force-with-lease origin feature-branch
# Better than --force because it fails if remote was updated

# Clean up merged branches
git branch --merged main | grep -v "main" | xargs git branch -d

# See who changed what
git shortlog -sn  # Commit counts by author
git shortlog -sn --since="1 week ago"

# Find large files in history
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  sed -n 's/^blob //p' | \
  sort --numeric-sort --key=2 | \
  tail -n 10

# Prune old remote branches
git fetch --prune
git remote prune origin
```

Example:
```markdown
## Error: "Cannot find module '@aws-sdk/client-dynamodb'"

### Root Cause
Lambda function missing dependency in package.json

### Solution
Add to functions/get-properties/package.json:
{
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.450.0"
  }
}

### Git Recovery Used
- Committed partial work before debugging
- Used `git stash` to save WIP
- Created fix in new commit
- When first fix failed, used `git reset --hard HEAD~1`
- Applied correct fix in second attempt

### Prevention
Add to pre-deploy checklist:
- Verify all functions have package.json
- Run `npm install` in each function directory
- Add `npm ci` to CI pipeline

### Commit Made
```
git commit -m "fix(deps): add missing dynamodb client dependency

Lambda function was failing with module not found error.
Added @aws-sdk/client-dynamodb to package.json.

Tested locally with sam local invoke.

Fixes #87"
```
```

---

### PHASE 4: DELIVER - Integration & Deployment (5% of time)

**Goal**: Safely deploy working code to production.

**Goal**: Safely deploy working code to production **using git as the deployment trigger**.

**Git Workflow: Feature Branch → Main → Deploy**

```
feature/my-work  →  Pull Request  →  main  →  Auto-Deploy via GitHub Actions
                     (Code Review)          (Tagged Release)
```

**Step 1: Prepare Feature Branch for Merge**

```bash
# 1. Ensure all changes committed
git status
# Should show: "nothing to commit, working tree clean"

# 2. Update main locally
git fetch origin
git checkout main
git pull origin main

# 3. Rebase feature branch on latest main
git checkout feature/property-search
git rebase main
# Resolve any conflicts, then:
git rebase --continue

# 4. Run full test suite
npm test
npm run test:integration
npm run test:e2e
# All must pass

# 5. Check code coverage
npm run test:coverage
# Must be ≥80%

# 6. Lint code
npm run lint --fix
git add .
git commit -m "style: fix linting issues"

# 7. Squash commits if needed (optional)
git rebase -i main
# In editor, change "pick" to "squash" for commits to combine
# Save and exit
# Edit combined commit message
# Result: Clean, logical commit history

# 8. Force push rebased branch
git push --force-with-lease origin feature/property-search
```

**Step 2: Create Pull Request**

```bash
# Option 1: GitHub CLI
gh pr create --title "feat: add property search" \
  --body "Implements city-based property search with fuzzy matching.

## Changes
- New search endpoint at /api/search
- PostgreSQL ILIKE with GIN index
- Input validation and sanitization
- 95% test coverage

## Testing
- Unit tests: 45 passing
- Integration tests: 8 passing
- E2E tests: 3 passing
- Load tested: <100ms p95 for 10K records

## Security
- SQL injection: protected via parameterized queries
- Input validation: city name max 100 chars
- Rate limiting: 100 req/min per IP

Closes #42"

# Option 2: Via GitHub web interface
git push origin feature/property-search
# Then create PR on GitHub.com
```

**Step 3: Code Review Process**

```bash
# Reviewer leaves comments on GitHub

# Address feedback in new commits
git checkout feature/property-search
# Make changes
git add .
git commit -m "fix(search): address code review feedback

- Extract magic numbers to constants
- Add JSDoc comments
- Improve error messages

Co-authored-by: Reviewer Name <reviewer@example.com>"

git push origin feature/property-search
# PR updates automatically

# After approval, merge via GitHub
# Choose "Squash and merge" for clean history
```

**Step 4: Automated Deployment (GitHub Actions)**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-2
      
      - name: SAM Build
        run: sam build
      
      - name: SAM Deploy
        run: sam deploy --no-confirm-changeset --no-fail-on-empty-changeset
      
      - name: Get Stack Outputs
        id: stack-outputs
        run: |
          echo "api_url=$(aws cloudformation describe-stacks --stack-name home-harbor --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text)" >> $GITHUB_OUTPUT
      
      - name: Smoke Test
        run: |
          curl -f ${{ steps.stack-outputs.outputs.api_url }}/properties || exit 1
      
      - name: Create Git Tag
        if: success()
        run: |
          VERSION=$(date +%Y%m%d-%H%M%S)
          git tag -a "v$VERSION" -m "Automated deployment $VERSION"
          git push origin "v$VERSION"
```

**Step 5: Post-Deployment Verification**

```bash
# 1. Verify deployment succeeded (check GitHub Actions)

# 2. Pull latest main with tags
git checkout main
git pull origin main --tags

# 3. Verify tag was created
git tag -l | tail -5
# Should see new v20260131-HHMMSS tag

# 4. Smoke test production
COMMIT=$(git rev-parse HEAD)
echo "Deployed commit: $COMMIT"
curl https://api.yourdomain.com/health
# Should return 200 OK

# 5. Monitor CloudWatch logs
sam logs -n GetPropertiesFunction --tail

# 6. Check CloudWatch metrics
# - Invocation count (should increase)
# - Error rate (should be 0%)
# - Duration p95 (should be <500ms)

# 7. If errors, rollback immediately
# Find previous working tag
git tag -l
# Example: v20260130-143022 was last good

# Rollback via git
git checkout v20260130-143022
git tag -a rollback-$(date +%Y%m%d-%H%M%S) -m "Rollback to v20260130-143022"
git push origin rollback-$(date +%Y%m%d-%H%M%S)
# Trigger redeploy via GitHub Actions

# Alternative: Rollback via AWS
sam deploy --parameter-overrides Version=v20260130-143022
```

**Git Release Strategy:**

**Semantic Versioning (SemVer):**
- MAJOR.MINOR.PATCH (e.g., 1.2.3)
- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes

**Tagging Releases:**

```bash
# After successful deployment to production

# 1. Determine version bump
# Read commit messages since last tag:
git log $(git describe --tags --abbrev=0)..HEAD --oneline
# Look for:
#   - "BREAKING CHANGE:" → MAJOR bump
#   - "feat:" → MINOR bump
#   - "fix:" → PATCH bump

# 2. Create annotated tag
git tag -a v1.2.3 -m "Release v1.2.3

## Features
- Property search with fuzzy matching (#42)
- Advanced filters for price range (#45)

## Bug Fixes
- Fixed CORS headers (#48)
- Improved error messages (#50)

## Performance
- Reduced Lambda cold start by 30%
- Optimized database queries

## Security
- Updated dependencies (CVE-2024-12345)
"

# 3. Push tag to remote
git push origin v1.2.3

# 4. Create GitHub Release
gh release create v1.2.3 \
  --title "Version 1.2.3" \
  --notes-file release-notes.md

# 5. Optional: Automated semantic release
# Use semantic-release package to automate this
npm install --save-dev semantic-release
# Configured via .releaserc.json
```

**Pre-Deployment Checklist:**

```bash
# Git checks
□ All changes committed (git status clean)
□ Feature branch rebased on main
□ No merge conflicts
□ Commits follow conventional commit format
□ Sensitive data not in history (git log -p --all | grep -i "password\|secret")

# Test checks
□ All unit tests pass (npm test)
□ All integration tests pass (npm run test:integration)
□ All E2E tests pass (npm run test:e2e)
□ Code coverage ≥80% (npm run test:coverage)

# Code quality checks
□ Linter passes (npm run lint)
□ No TypeScript errors (npm run type-check)
□ All files <100 lines (wc -l **/*.js)
□ No console.log statements (git grep console.log)

# Security checks
□ Dependencies updated (npm audit fix)
□ No high/critical vulnerabilities (npm audit)
□ Secrets in GitHub Secrets, not code
□ .gitignore updated

# Documentation checks
□ README updated
□ API docs updated
□ Commit messages descriptive
□ CHANGELOG updated (if using)

# Deployment checks
□ SAM template valid (sam validate)
□ SAM builds successfully (sam build)
□ Smoke tests pass (curl -f https://api/health)
□ Rollback plan documented
□ Monitoring configured (CloudWatch alarms)
```

**Git Branching Strategy:**

We follow **GitHub Flow** (simplified trunk-based development):

```
main (production)
  ├── feature/add-search
  ├── feature/user-auth
  ├── fix/cors-bug
  ├── docs/api-readme
  └── hotfix/critical-security-patch
```

**Branch Types:**

1. **main**: Always deployable, production code
   - Protected: requires PR + reviews
   - Auto-deploys on push
   - Never commit directly

2. **feature/*** New features
   - Branch from: main
   - Merge to: main (via PR)
   - Lifetime: hours to days
   - Delete after merge

3. **fix/*** Bug fixes
   - Branch from: main
   - Merge to: main (via PR)
   - Delete after merge

4. **docs/*** Documentation
   - Branch from: main
   - Merge to: main (via PR)
   - Delete after merge

5. **hotfix/*** Critical production fixes
   - Branch from: main
   - Fast-track PR review
   - Merge to: main immediately
   - Deploy ASAP

6. **spike/*** Research/experimentation
   - Branch from: main
   - Never merged (findings documented)
   - Deleted after research complete

**Branch Naming Rules:**
- Lowercase only
- Use hyphens, not underscores
- Include issue number: `feature/42-add-search`
- Be descriptive: `fix/cors-headers` not `fix/bug`
- Max 50 characters

**Branch Protection Rules (GitHub Settings):**

```yaml
# .github/branch-protection.yml
main:
  required_pull_request_reviews:
    required_approving_review_count: 1
  required_status_checks:
    strict: true
    contexts:
      - test
      - lint
  enforce_admins: false
  required_linear_history: true
  allow_force_pushes: false
  allow_deletions: false
```

---

## Git Daily Workflow Pattern

**Morning Routine:**

```bash
# 1. Check system status
git status
# Clean working directory

# 2. Update local main
git fetch --all --prune
git checkout main
git pull --rebase origin main

# 3. Review what happened since yesterday
git log --oneline --since="yesterday" --all
# See what team committed

# 4. Clean up merged branches
git branch --merged main | grep -v "main" | xargs git branch -d
# Remove local branches that were merged

# 5. Start day's work
git checkout -b feature/todays-task

# 6. Verify starting point
git log --oneline -5
git remote -v
# Confirm on correct branch, correct remote
```

**During Development (Every 30-60 minutes):**

```bash
# 1. Check what changed
git status
git diff

# 2. Review changes file by file
git diff path/to/file.js

# 3. Stage intentionally
git add path/to/file1.js path/to/file2.js

# 4. Verify staged changes
git diff --staged

# 5. Commit with meaningful message
git commit  # Opens editor with template

# 6. Push to backup
git push origin feature/todays-task
# Or if first push:
git push -u origin feature/todays-task
```

**Before Lunch/End of Day:**

```bash
# 1. Commit all work in progress
git add .
git commit -m "wip: save progress before [lunch/end of day]"

# 2. Push to remote (backup)
git push origin feature/todays-task

# 3. Verify push succeeded
git log origin/feature/todays-task..HEAD
# Should be empty (everything pushed)

# 4. Optional: Clean up uncommitted files
git stash save "Random experiments"
git clean -fd  # Remove untracked files
```

**End of Day Review:**

```bash
# 1. Review what you accomplished
git log --oneline --since="9am" --author="$(git config user.email)"

# 2. Check branch status
git status

# 3. See what's pending merge
git log origin/main..HEAD --oneline

# 4. Plan tomorrow
# Create draft PR if feature near complete
gh pr create --draft --title "WIP: feature name"

# 5. Ensure everything backed up
git push origin feature/todays-task
```

---

## Advanced Git Workflows

**Interactive Rebase for Clean History:**

```bash
# Before creating PR, clean up commit history

# 1. Start interactive rebase
git rebase -i main
# OR last N commits:
git rebase -i HEAD~5

# 2. In editor, you'll see:
pick abc1234 feat: add validation
pick def5678 fix: typo
pick ghi9012 feat: add tests
pick jkl3456 wip: debugging
pick mno7890 feat: final implementation

# 3. Rewrite as:
pick abc1234 feat: add validation
squash def5678 fix: typo
pick ghi9012 feat: add tests
fixup jkl3456 wip: debugging
pick mno7890 feat: final implementation

# Commands:
# pick = keep commit as-is
# squash = merge into previous commit, edit message
# fixup = merge into previous commit, discard message
# reword = keep commit, edit message
# drop = delete commit
# edit = stop to amend commit

# 4. Save and close editor
# 5. Edit combined commit messages as needed
# 6. If conflicts, resolve and continue:
git rebase --continue

# 7. Force push cleaned history
git push --force-with-lease origin feature/branch-name
```

**Cherry-Pick Commits Between Branches:**

```bash
# Apply specific commit from another branch

# 1. Find commit hash
git log feature/other-branch --oneline

# 2. Cherry-pick it
git checkout feature/current-branch
git cherry-pick abc1234

# 3. If conflicts, resolve and continue
git cherry-pick --continue

# 4. Commit
git push origin feature/current-branch

# Cherry-pick multiple commits
git cherry-pick abc1234 def5678 ghi9012

# Cherry-pick range
git cherry-pick abc1234^..ghi9012
```

**Git Bisect for Finding Bugs:**

```bash
# Find which commit introduced a bug

# 1. Start bisect
git bisect start

# 2. Mark current state as bad
git bisect bad

# 3. Mark known good commit
git bisect good abc1234
# Or: git bisect good v1.0.0

# 4. Git checks out middle commit
# Run tests:
npm test

# 5. Tell git if tests pass/fail
git bisect good  # Tests passed
# OR
git bisect bad   # Tests failed

# 6. Repeat until git finds the bad commit
# Git will say: "xyz789 is the first bad commit"

# 7. Examine the bad commit
git show xyz789

# 8. Reset to original state
git bisect reset

# 9. Fix the bug in new commit
git checkout -b fix/bug-found-by-bisect
# Make fix
git commit -m "fix: bug introduced in xyz789"

# Automated bisect
git bisect start HEAD v1.0.0
git bisect run npm test
# Git automatically finds bad commit
```

**Git Worktrees for Parallel Work:**

```bash
# Work on multiple branches simultaneously

# 1. Create worktree for hotfix
git worktree add ../home-harbor-hotfix hotfix/security-patch
# Creates new directory with checkout of hotfix branch

# 2. Work in hotfix directory
cd ../home-harbor-hotfix
# Make changes, commit, push

# 3. Back to main work
cd ../home-harbor
# Continue feature work

# 4. List all worktrees
git worktree list

# 5. Remove worktree when done
git worktree remove ../home-harbor-hotfix

# 6. Prune stale worktrees
git worktree prune
```

**Git Hooks for Automation:**

We already have `.git/hooks/pre-commit` for security. Add more:

**pre-push hook** (`.git/hooks/pre-push`):
```bash
#!/bin/bash
# Run tests before allowing push

echo "Running tests before push..."
npm test

if [ $? -ne 0 ]; then
  echo "Tests failed. Push aborted."
  exit 1
fi

echo "Tests passed. Pushing..."
exit 0
```

**commit-msg hook** (`.git/hooks/commit-msg`):
```bash
#!/bin/bash
# Validate commit message format

commit_msg=$(cat "$1")

# Check conventional commit format
if ! echo "$commit_msg" | grep -qE "^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}"; then
  echo "Error: Commit message must follow conventional commits format"
  echo "Format: <type>(<scope>): <subject>"
  echo "Example: feat(search): add fuzzy matching"
  exit 1
fi

exit 0
```

**Make hooks executable:**
```bash
chmod +x .git/hooks/pre-push
chmod +x .git/hooks/commit-msg
```

---

### PHASE 5: REFLECT - Self-Evaluation (5% of time)

**Goal**: Learn from every iteration. Never repeat mistakes.

**Self-Evaluation Template:**

After each feature/task, answer these questions:

```markdown
## Reflection: [Feature Name] - [Date]

### 1. What Went Well? ✅
- Tests caught a bug before production
- Code stayed under 100 lines per file
- Deployment was smooth

### 2. What Went Poorly? ❌
- Forgot to add index on city column → slow queries
- Lambda cold start exceeded 500ms target
- Spent 2 hours debugging CORS issue

### 3. Root Cause Analysis
**Problem**: CORS errors blocking frontend
**Why?**: Lambda Function URL not configured with correct origins
**Why?**: Didn't check SAM template CORS configuration
**Why?**: Rushed through template without testing
**Root**: Skipped research phase, didn't validate template

### 4. What I Learned 📚
- Always test CORS locally before deploying
- Use `sam local start-api` for integration testing
- CORS requires both Allow-Origin AND Allow-Methods

### 5. Preventive Actions 🛡️
- [ ] Add CORS testing to pre-deployment checklist
- [ ] Create template validation script
- [ ] Document CORS configuration in template comments
- [ ] Add integration test for CORS headers

### 6. Knowledge Gained 🧠
- Lambda Function URLs support CORS natively
- Must match exact origin (no wildcards in production)
- OPTIONS preflight requests need explicit handling

### 7. Time Spent vs Estimated
- Estimated: 2 hours
- Actual: 4 hours
- Variance: +100%
- Reason: CORS debugging (2 hrs unexpected)
- Adjustment: Add 1hr buffer for first-time AWS service configs

### 8. Would Do Differently Next Time
- Research Lambda Function URLs CORS before implementation
- Test CORS in isolation first
- Ask user to clarify frontend domain upfront
```

**Failure Log (LESSONS_LEARNED.md):**

```markdown
# Lessons Learned

## 2026-01-31: Lambda Function URL CORS Configuration

**Mistake**: Deployed Lambda without testing CORS, caused frontend errors

**Root Cause**: Skipped research phase, didn't understand Function URL CORS

**Solution**: 
```yaml
FunctionUrlConfig:
  Cors:
    AllowOrigins: ['https://chf3198.github.io']
    AllowMethods: [GET, POST, OPTIONS]
    AllowHeaders: ['*']
    MaxAge: 300
```

**Prevention**: Always test CORS locally, research new AWS features thoroughly

**References**: 
- https://docs.aws.amazon.com/lambda/latest/dg/urls-configuration.html
- SAM template.yaml line 45-52

---

## 2026-01-30: SQL Injection Vulnerability

**Mistake**: Used string concatenation in SQL query

**Root Cause**: Forgot security best practice from past project

**Solution**: Always use parameterized queries
```javascript
// Bad
const query = `SELECT * FROM properties WHERE city = '${city}'`;

// Good
const query = 'SELECT * FROM properties WHERE city = $1';
const result = await db.query(query, [city]);
```

**Prevention**: Added SQL injection test to all query functions
```

---

### PHASE 6: ITERATE - Continuous Improvement

**Goal**: Apply learnings to next iteration.

**Before Starting Next Feature:**

1. **□ Review LESSONS_LEARNED.md**
   - Check for relevant past failures
   - Apply preventive measures proactively

2. **□ Update Workflow Checklist**
   - Add new items from reflections
   - Remove steps that don't add value

3. **□ Adjust Time Estimates**
   - Use historical actuals
   - Add buffers for unknowns

4. **□ Improve Tooling**
   - Add linting rules for common mistakes
   - Create scripts for repetitive tasks
   - Update pre-commit hooks

**Continuous Improvement Metrics:**

Track over time:
- Code coverage % (goal: increase to 90%+)
- Time variance (goal: <20% deviation)
- Bugs in production (goal: zero)
- Build time (goal: <2 minutes)
- Test execution time (goal: <30 seconds)

---

## Research Protocol: When to Search

**Always Research When:**

1. **Using New Technology**
   - First time with AWS service
   - New framework or library
   - Unfamiliar API

2. **Encountering Errors**
   - Error message not immediately clear
   - Multiple attempts to fix failed
   - Error impacts critical functionality

3. **Performance Issues**
   - Response time >2x expected
   - Memory usage abnormally high
   - Database queries slow

4. **Security Concerns**
   - Handling user input
   - Authentication/authorization
   - Data encryption

5. **Best Practices Uncertainty**
   - Multiple ways to solve problem
   - Unsure of trade-offs
   - Industry standard not clear

**Research Checklist:**

```markdown
## Research: [Topic] - [Date]

### Question
What is the best way to implement city search in PostgreSQL?

### Sources Consulted
1. PostgreSQL docs - ILIKE operator
2. Stack Overflow - indexing for ILIKE queries
3. AWS RDS best practices - query optimization

### Findings
- ILIKE is case-insensitive pattern matching
- Use GIN index with pg_trgm for fast ILIKE
- Alternative: Full-text search with tsvector

### Decision
Use ILIKE with GIN index for simplicity
- Performance: <100ms for 100K records
- Trade-off: Higher storage for index
- Justification: Simplicity > complex full-text search for MVP

### Implementation Notes
```sql
CREATE EXTENSION pg_trgm;
CREATE INDEX idx_city_trgm ON properties USING GIN (city gin_trgm_ops);
```

### References
- https://www.postgresql.org/docs/current/pgtrgm.html
- https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/PostgreSQL.Concepts.General.html
```

---

## Daily Workflow Pattern

**Morning:**
1. Review LESSONS_LEARNED.md
2. Plan 2-3 small features for the day
3. Estimate time for each
4. Write test stubs before coding

**During Development:**
1. Follow TDD cycle strictly
2. Commit after each passing test
3. Take 5-min break every hour
4. Research immediately when stuck

**End of Day:**
1. Run full test suite
2. Write reflection notes
3. Update LESSONS_LEARNED.md
4. Plan tomorrow's tasks

---

## Quality Gates (Cannot Proceed Without)

**Before Commit:**
- [ ] All tests pass
- [ ] Code coverage ≥80%
- [ ] Linter passes
- [ ] Files <100 lines
- [ ] Clear commit message

**Before PR/Merge:**
- [ ] All commits squashed if needed
- [ ] CI/CD passes
- [ ] Manual testing complete
- [ ] Documentation updated

**Before Deploy:**
- [ ] Staging tested
- [ ] Rollback plan ready
- [ ] Monitoring configured
- [ ] Team notified

---

## Failure Recovery Process

**When Something Breaks:**

1. **STOP**: Don't make it worse
2. **ASSESS**: What's broken? How bad?
3. **MITIGATE**: Rollback or hotfix?
4. **INVESTIGATE**: Root cause analysis
5. **FIX**: Proper solution
6. **TEST**: Verify fix thoroughly
7. **DEPLOY**: Carefully
8. **REFLECT**: Document learnings
9. **PREVENT**: Add safeguards

**Example:**

```markdown
## Incident: Production Database Connection Timeout

### Timeline
- 14:30: Deploy v1.2.0
- 14:35: Users report slow loading
- 14:37: CloudWatch shows 100% Lambda errors
- 14:38: Rollback to v1.1.0
- 14:40: Service restored

### Root Cause
Lambda function configured with wrong DB_HOST environment variable

### Fix
Update template.yaml:
```yaml
Environment:
  Variables:
    DB_HOST: !GetAtt DatabaseCluster.Endpoint.Address
```

### Prevention
- Add integration test that validates DB connection
- Add pre-deploy checklist item: verify env vars
- Create staging environment with separate DB

### Lessons
- Always test with real DB in staging
- Environment variables are critical - validate them
- Have rollback plan ready BEFORE deploying
```

---

## Success Metrics

**Git Health Metrics:**
- Commit frequency: 5-10 commits per day (small, atomic)
- Commit message quality: 100% follow conventional commits
- Branch lifetime: <3 days for features
- PR review time: <24 hours
- Main branch stability: 100% green CI
- Merge conflicts: <1 per week
- Force pushes to shared branches: 0
- Lost commits: 0 (reflog saves everything)

**Code Quality:**
- Test coverage: ≥80%
- Files: 100% under 100 lines
- Linter errors: 0
- Type errors: 0
- Security scan: 0 critical/high vulnerabilities

**Development Velocity:**
- Time variance: <20%
- Commits per day: 5-10 small commits
- Features per week: 2-3 complete
- Code review turnaround: <4 hours
- Time from PR to deploy: <1 hour

**Production Quality:**
- Bugs in production: 0
- Rollbacks: 0
- Uptime: ≥99.9%
- P95 latency: <500ms
- Deployment frequency: Daily
- Mean time to recovery: <10 minutes

**Learning & Growth:**
- Lessons documented: 1+ per week
- Improvements applied: 100% of learnings
- Research notes: Created when needed
- Workflow updates: Monthly
- Git skills expanding: New command learned weekly

---

## Summary: The Workflow Loop

```
0. GIT SETUP  → Configure git for safety and automation
1. DISCOVER   → Research & understand deeply (commit findings)
2. DEFINE     → Design testable architecture (commit design + test stubs)
3. DEVELOP    → TDD with small commits (commit after each passing test)
4. DELIVER    → Deploy safely via git (tag releases, monitor)
5. REFLECT    → Self-evaluate and document learnings (commit to LESSONS_LEARNED.md)
6. ITERATE    → Apply improvements to next cycle (update workflow)

GIT IS YOUR SAFETY NET - COMMIT EARLY, COMMIT OFTEN, COMMIT WITH MEANING
EVERY COMMIT IS A CHECKPOINT - YOU CAN ALWAYS GO BACK
PUSH DAILY - YOUR MACHINE COULD FAIL, REMOTE STORAGE DOESN'T
```

**Core Principles:**

✅ **Git First**: Commit before trying risky changes  
✅ **Test First**: No code without tests  
✅ **Research When Uncertain**: Better to know than guess  
✅ **Reflect Always**: Every iteration is a learning opportunity  
✅ **Fail Forward**: Mistakes are data for improvement  
✅ **Small Steps**: Commit early, commit often  
✅ **Quality Gates**: Don't skip checks to go faster  
✅ **Continuous Improvement**: Update process based on experience  
✅ **Git Protects You**: Use reflog, stash, bisect, worktrees  
✅ **Automation**: Hooks, CI/CD, semantic release  

---

## Git Command Reference (Quick Access)

**Daily Commands:**
```bash
git status                              # Check current state
git fetch --all --prune                 # Update remote info
git pull --rebase origin main          # Update current branch
git checkout -b feature/name           # Create feature branch
git add path/to/file                   # Stage specific files
git commit                             # Commit (opens editor)
git push origin branch-name            # Push to remote
git log --oneline --graph --all        # Visual history
```

**Before Committing:**
```bash
git diff                               # See unstaged changes
git diff --staged                      # See staged changes
git diff main..HEAD                    # Compare to main
git status                             # Review files
```

**Fixing Mistakes:**
```bash
git reflog                             # See all HEAD movements
git reset HEAD~1 --soft                # Undo commit, keep changes
git reset HEAD~1 --hard                # Undo commit, delete changes
git checkout -- file                   # Discard changes to file
git clean -fd                          # Remove untracked files
git stash                              # Save changes temporarily
git stash pop                          # Restore stashed changes
```

**Branching:**
```bash
git branch                             # List local branches
git branch -a                          # List all branches
git branch -d branch-name              # Delete merged branch
git branch -D branch-name              # Force delete branch
git checkout -b new-branch             # Create and switch
git merge --no-ff branch-name          # Merge with merge commit
git rebase main                        # Rebase on main
```

**Collaboration:**
```bash
git fetch origin                       # Download remote changes
git pull --rebase origin main          # Fetch and rebase
git push origin branch-name            # Push branch
git push --force-with-lease origin branch  # Safe force push
gh pr create                           # Create pull request
gh pr list                             # List pull requests
git log origin/main..HEAD              # What will be pushed
```

**Advanced:**
```bash
git bisect start                       # Find bug-introducing commit
git worktree add ../dir branch         # Work on multiple branches
git cherry-pick abc123                 # Apply specific commit
git rebase -i HEAD~5                   # Interactive rebase
git blame file                         # See who changed each line
git log -p file                        # See all changes to file
git tag -a v1.0.0 -m "message"        # Create annotated tag
```

**Recovery:**
```bash
git reflog                             # Find lost commits
git reset --hard HEAD@{5}              # Go back to state
git fsck --lost-found                  # Find dangling commits
git show abc123                        # View specific commit
git revert abc123                      # Undo specific commit
```

---

**Last Updated**: January 31, 2026  
**Version**: 2.0 (Git-Integrated Edition)  
**Owner**: Engineering Team  
**Review Cycle**: After each major feature  

**Notable Changes:**
- v2.0: Complete git workflow integration, branching strategy, hooks, recovery procedures
- v1.0: Initial TDD workflow with basic git usage

