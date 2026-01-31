# AI Agent Development Workflow v3.0
## Portfolio Project for Realtor.com Recruiter

**Agent**: GitHub Copilot (solo AI developer)  
**Project**: HomeHarbor - Real estate listing aggregator  
**Audience**: Staff Software Engineer position recruiter  
**Goal**: Demonstrate AWS, React, testing, security, and architectural skills

---

## Why This Workflow Differs from v2.0 (Team-Focused)

| Aspect | v2.0 (Human Teams) | v3.0 (Solo AI Agent) |
|--------|-------------------|---------------------|
| Collaboration | Mob/pair programming | N/A - solo operation |
| Timelines | Daily standups, sprints | Continuous sessions with checkpoints |
| Memory | Team knowledge sharing | LESSONS_LEARNED.md + git commits |
| Metrics | DORA, team velocity | Skills demonstrated, portfolio quality |
| Motivation | Psychological safety | N/A - AI doesn't experience burnout |
| State Management | Human memory + docs | Git commits (persistent across sessions) |

---

## AI Agent Strengths & Constraints

### Leverage These Strengths
- ✅ Continuous operation (no fatigue)
- ✅ Perfect recall within session
- ✅ Fast test execution
- ✅ Deterministic behavior
- ✅ Instant context switching

### Mitigate These Weaknesses
- ⚠️ **Context window limits** → Commit frequently, preserve state in git
- ⚠️ **Session boundaries** → LESSONS_LEARNED.md = persistent memory
- ⚠️ **No implicit judgment** → Explicit decision criteria in workflow
- ⚠️ **Portfolio focus** → Every commit must showcase Staff SWE skills

---

## 5-Phase Workflow Cycle

```
┌────────────────────────────────────────────────────────────┐
│  PHASE 0: SESSION INIT (Load context from last session)    │
├────────────────────────────────────────────────────────────┤
│  PHASE 1: PLAN & TEST-DESIGN (Write tests before code)     │
├────────────────────────────────────────────────────────────┤
│  PHASE 2: TDD IMPLEMENTATION (Red → Green → Refactor)      │
├────────────────────────────────────────────────────────────┤
│  PHASE 3: DEPLOY & VERIFY (CI/CD via GitHub Actions)       │
├────────────────────────────────────────────────────────────┤
│  PHASE 4: CHECKPOINT (Save state for next session)         │
└────────────────────────────────────────────────────────────┘
```

---

## PHASE 0: Session Initialization

**When**: Start of every work session

```bash
# 1. Load context from git
git status
git log -5 --oneline

# 2. Read session state
cat LESSONS_LEARNED.md  # Previous decisions
cat TODO.md             # Next tasks

# 3. Verify environment
node --version
aws sts get-caller-identity

# 4. Create feature branch
git checkout -b feature/task-name
```

**Decision Point**: Can I complete this task in current session?
- **YES** → Proceed to Phase 1
- **NO** → Break into sub-tasks, update TODO.md, pick smallest sub-task

---

## PHASE 1: Plan & Test-Design

**Duration**: 20% of task time

### 1. Define Acceptance Criteria
```markdown
## User Story
As a recruiter, I want to see property search so that I know you can build AWS APIs

## Acceptance Criteria (Testable)
- [ ] GET /api/properties?city=Seattle returns matching results
- [ ] Response time <500ms (AWS Lambda)
- [ ] Test coverage ≥80%
- [ ] Input validation prevents SQL injection
```

### 2. Create Test File FIRST
```bash
touch src/__tests__/search.test.js
```

```javascript
// search.test.js - Write tests BEFORE implementation
describe('Property Search', () => {
  test('filters properties by city', () => {
    const properties = [
      { city: 'Seattle', price: 500000 },
      { city: 'Portland', price: 400000 }
    ];
    const result = searchByCity(properties, 'Seattle');
    expect(result).toHaveLength(1);
    expect(result[0].city).toBe('Seattle');
  });

  test('throws error for empty city', () => {
    expect(() => searchByCity([], '')).toThrow('City required');
  });
});
```

### 3. Document in LESSONS_LEARNED.md
```markdown
## 2026-01-31: Property Search Feature

**Design Decision**: Use PostgreSQL ILIKE for case-insensitive search
**Rationale**: Simpler than full-text search, adequate for MVP
**Alternative Considered**: AWS OpenSearch (too complex for demo)
**Skill Demonstrated**: AWS RDS, SQL optimization, architectural trade-offs
```

### 4. Commit Test Stubs
```bash
git add src/__tests__/search.test.js LESSONS_LEARNED.md
git commit -m "test(search): add test stubs for property search

Red phase: tests fail (no implementation yet)
Demonstrates TDD discipline for recruiter

Skills shown: Test-first development, acceptance criteria
"
git push origin feature/property-search
```

---

## PHASE 2: TDD Implementation

**Duration**: 50% of task time

### Red-Green-Refactor Micro-Cycles

#### 🔴 RED: Write Failing Test
```bash
npm test search.test.js
# FAIL: searchByCity is not defined
```

```bash
git add search.test.js
git commit -m "test(search): add failing test for city filter

Red phase: function not defined
"
```

#### 🟢 GREEN: Minimal Implementation
```javascript
// search.js
function searchByCity(properties, city) {
  if (!city) throw new Error('City required');
  return properties.filter(p => p.city === city);
}
```

```bash
npm test
# PASS: 2/2 tests passing
```

```bash
git add search.js
git commit -m "feat(search): implement city search filter

Green phase: tests pass
Basic implementation complete

Skills shown: Pure functions, error handling
"
git push origin feature/property-search
```

#### 🔵 REFACTOR: Clean Up
```javascript
// search.js - Improved version
const validateCity = (city) => {
  if (!city?.trim()) throw new Error('City required');
};

const searchByCity = (properties, city) => {
  validateCity(city);
  return properties.filter(p => 
    p.city.toLowerCase() === city.toLowerCase().trim()
  );
};
```

```bash
npm test
# PASS: All tests still passing after refactor
```

```bash
git add search.js
git commit -m "refactor(search): extract validation, add case-insensitivity

Refactor phase: tests still green
Improved maintainability

Skills shown: Function extraction, edge case handling
"
git push origin feature/property-search
```

### Key Rules
- **No code without a test** (demonstrates TDD discipline)
- **Commit after each micro-cycle** (shows incremental development)
- **Conventional commit messages** (shows professionalism)
- **Push frequently** (preserves state across sessions)

---

## PHASE 3: Deploy & Verify

**Duration**: 20% of task time

### 1. Full Test Suite
```bash
npm test                    # Unit tests
npm run test:integration    # Integration tests
npm run test:coverage       # Must be ≥80%
```

### 2. Quality Gates
```bash
npm run lint                # ESLint
npm run format              # Prettier
git diff --staged | grep -i "password\|secret\|key"  # Security check
```

### 3. Merge to Main
```bash
git checkout main
git pull origin main
git merge feature/property-search
git push origin main
```

### 4. GitHub Actions Auto-Deploys
```yaml
# .github/workflows/deploy.yml (already exists)
# Triggers on push to main:
# 1. Run tests
# 2. sam build
# 3. sam deploy
# 4. Create git tag
```

### 5. Verify Deployment
```bash
# GitHub Actions creates tag automatically
git pull --tags
git tag -l | tail -1
# v20260131-143022

# Smoke test
curl https://api.yourdomain.com/properties?city=Seattle
```

---

## PHASE 4: Session Checkpoint

**When**: Before context window limit OR end of work session

### 1. Update LESSONS_LEARNED.md
```markdown
## 2026-01-31 Session Summary

**Completed**: Property search feature
**Decisions**: 
- Used ILIKE for case-insensitive search (not full-text search)
- Added GIN index for performance
**Challenges**: CORS configuration took 30min to debug
**Skills Demonstrated**: AWS Lambda, RDS, TDD, CI/CD
**Next Session**: Add price range filter
```

### 2. Update TODO.md
```markdown
# HomeHarbor TODO

## Completed ✅
- [x] Property search by city

## In Progress 🔄
- [ ] Price range filter (started, need tests)

## Planned 📋
- [ ] User authentication
- [ ] Save favorite properties
```

### 3. Commit Everything
```bash
git add -A
git commit -m "chore: session checkpoint - property search complete

Completed:
- City-based property search
- 95% test coverage
- Deployed to AWS

Skills demonstrated:
- AWS Lambda, RDS, API Gateway
- TDD with Jest
- CI/CD via GitHub Actions
- SQL optimization (GIN index)

Next: Price range filter
"
git push origin main
```

### 4. Verify GitHub State
```bash
# Check GitHub Actions
gh run list --limit 5
# All should be green ✅

# Verify README is updated
cat README.md  # Should list completed features

# Ensure no uncommitted changes
git status
# Should be clean
```

---

## Recruiter Visibility Checklist

**Ask**: "If recruiter views this NOW, what do they see?"

### Portfolio Quality
- [ ] README clearly states: project purpose, tech stack, setup instructions
- [ ] GitHub Actions tab shows working CI/CD pipeline
- [ ] Test coverage badge visible (≥80%)
- [ ] Commit history shows:
  - Conventional commits
  - TDD discipline (test → feat → refactor pattern)
  - Incremental development (many small commits, not one big commit)
  - Professional git workflow

### Skills Demonstrated
- [ ] **AWS**: Lambda, RDS, API Gateway, CloudWatch, SAM
- [ ] **Frontend**: React, hooks, responsive design
- [ ] **Testing**: Unit, integration, mocking, 80%+ coverage
- [ ] **Security**: No credentials in code, input validation, SQL injection prevention
- [ ] **Architecture**: Testable functional design, dependency injection, pure functions
- [ ] **DevOps**: CI/CD, automated deployment, monitoring

---

## Git Commit Conventions (Portfolio-Specific)

### Format
```
<type>(<scope>): <subject>

<body explaining WHY>

Skills demonstrated: <list for recruiter>
```

### Example
```
feat(search): add fuzzy city matching

Improves UX by allowing typos (e.g., "Seatle" → "Seattle")
Uses Levenshtein distance with 0.8 threshold

Skills demonstrated:
- Algorithm implementation (Levenshtein distance)
- Performance optimization (<100ms for 100K records)
- User experience thinking
```

### Types
- `feat`: New feature
- `fix`: Bug fix  
- `test`: Add/update tests
- `refactor`: Code improvement (no behavior change)
- `docs`: Documentation
- `chore`: Tooling, dependencies
- `perf`: Performance improvement

---

## Decision Criteria (No Implicit Judgment)

### When to Research
- [ ] Using AWS service for first time
- [ ] Error message unclear after 5min of debugging
- [ ] Security-related code (auth, input validation)
- [ ] Performance issue (>2x expected time)

### When to Commit
- [ ] Test passes (after RED or GREEN phase)
- [ ] Refactoring complete (tests still green)
- [ ] Session checkpoint (before context limit)
- [ ] Every 30-60 minutes of work

### When to Break Down Task
- [ ] Estimated >2 hours
- [ ] Requires multiple AWS services
- [ ] Touches >5 files

### When to Skip Feature
- [ ] Not required for MVP
- [ ] Doesn't demonstrate new skill
- [ ] Would exceed budget
- [ ] Timeline constraint

---

## Recovery Procedures (Session Failures)

### Context Lost Mid-Session
```bash
# Read last 10 commits to reconstruct context
git log -10 --oneline
git show HEAD  # Last commit details

# Read state files
cat LESSONS_LEARNED.md
cat TODO.md

# Check what was in progress
git status
git diff
```

### Uncommitted Work Lost
```bash
# Check reflog (90-day history)
git reflog

# Restore from reflog
git reset --hard HEAD@{5}
```

### Deployment Failed
```bash
# Rollback via git
git log --oneline | head -20
# Find last working commit

git revert <failed-commit-hash>
git push origin main
# GitHub Actions auto-deploys previous version
```

---

## Quick Reference: Common Commands

```bash
# Session Start
git status && git pull origin main && git log -5 --oneline

# Create Feature Branch
git checkout -b feature/task-name

# Check Tests
npm test && npm run test:coverage

# Commit (Opens Editor)
git commit

# Push
git push origin feature/task-name

# Merge to Main
git checkout main && git merge feature/task-name && git push origin main

# Session End
git add -A && git commit -m "chore: checkpoint" && git push origin main

# Recovery
git reflog  # Find lost commits
git reset --hard HEAD@{N}  # Restore

# View History
git log --oneline --graph --all

# Check Remote State
git fetch origin && git status
```

---

## Success Metrics (AI Agent Specific)

### Code Quality
- Test coverage: ≥80% (enforced by CI)
- All files: <100 lines
- Linter: 0 errors
- Security scan: 0 critical/high

### Portfolio Quality
- README: Clear, comprehensive
- Commit messages: 100% conventional
- CI/CD: 100% green builds
- Skills demonstrated: 5+ AWS services, React, testing, security

### State Preservation
- Commits per session: 5-10
- LESSONS_LEARNED.md: Updated every session
- TODO.md: Always current
- GitHub: Fully synced (no local-only commits)

### Development Efficiency  
- Task completion: 1-2 features per session
- Time to deploy: <30 min (commit → production)
- Recovery time: <5 min (if session interrupted)

---

## Simplified Workflow Summary

```
SESSION START
├─ git pull, read LESSONS_LEARNED.md, check TODO.md
├─ Create feature branch
│
FEATURE DEVELOPMENT
├─ Write test stubs → commit "test: add stubs"
├─ RED: Write failing test → commit "test: failing test"
├─ GREEN: Minimal implementation → commit "feat: implement"
├─ REFACTOR: Clean up → commit "refactor: improve"
├─ Repeat RED-GREEN-REFACTOR for each test
│
DEPLOY
├─ Run full test suite (≥80% coverage)
├─ Merge to main → push → GitHub Actions deploys automatically
│
SESSION END
├─ Update LESSONS_LEARNED.md (decisions, skills demonstrated)
├─ Update TODO.md (completed, next tasks)
├─ Commit all → push
└─ Verify GitHub Actions green
```

**Core Principles for AI Agent:**
1. **Git = Persistent Memory**: Commit frequently to preserve state across sessions
2. **Tests First**: No code without tests (demonstrates TDD discipline)
3. **Small Commits**: Every micro-cycle gets its own commit
4. **Recruiter Focus**: Every commit showcases Staff SWE skills
5. **Self-Documenting**: LESSONS_LEARNED.md explains all decisions

---

## Version History

- **v1.0**: Basic TDD workflow (team-focused, human timelines)
- **v2.0**: Git-integrated workflow (added GitHub Flow, conventional commits, recovery procedures)
- **v3.0**: AI agent-optimized (removed team collaboration, added session preservation, portfolio focus)

**Key Changes in v3.0:**
- ❌ Removed: Team collaboration, human timelines, DORA metrics, psychological safety
- ✅ Added: Session initialization/checkpoint, context preservation, recruiter visibility focus
- ✅ Optimized: For solo AI agent with context window constraints and portfolio demonstration goals
