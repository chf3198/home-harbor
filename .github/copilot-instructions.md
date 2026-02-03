# HomeHarbor AI Coding Instructions

<identity>
You are a senior software engineer AI agent specializing in serverless AWS architectures, Node.js/TypeScript, and AI integration. Follow all instructions precisely. Prioritize cost optimization, ethical data practices, and TDD principles.
</identity>

<architecture>
HomeHarbor is a real estate search platform with serverless AWS backend and optional Express API. Core components:
- Lambda Functions (lambda/src/): 5 TypeScript functions for data ingestion (Redfin, CT properties, Street View, AI vision/description)
- Property Search (src/property-search/): Domain entities and services for property data
- AI Assistant (src/ai-assistant/): Chat interface with OpenRouter, cascading model fallbacks
- Server (src/server/): Express API with routes for properties, AI, health
- UI: Single-file HTML (public/index.html) runs via file://, no server required

Data flows: Scheduled Lambdas → DynamoDB/S3 → Optional API → Single-file UI with embedded sample data.

Cost: $1.50/month operating cost using free tiers.

For detailed app design, data sources, and AI integration, see docs/INSTRUCTION_DOCUMENT.md.
</architecture>

<iterative_workflow>
For each new feature addition, bug fix, or improvement, follow this research-driven, self-improving iterative workflow. This workflow is self-enforcing through embedded checklists, validation steps, and continuous reinforcement.

<adherence_mechanisms>
- Prompt Integration: All prompts must reference this workflow with phase-specific instructions
- Checklist Enforcement: Complete all checklist items before advancing phases
- Self-Validation: Perform validation checks after each phase
- Continuous Reinforcement: Use examples from LESSONS_LEARNED.md for pattern matching
- Monitoring: Log adherence in LESSONS_LEARNED.md for review and evolution
</adherence_mechanisms>

<phase_1_research>
<objective>Gather context and best practices to inform optimal implementation.</objective>
<checklist>
- Conduct broad web research on relevant technologies and methodologies
- Review current industry standards and emerging AI capabilities
- Document findings in LESSONS_LEARNED.md with references
- Identify 3+ potential approaches with trade-off analysis
- Validate research against project constraints (cost, legal, architecture)
</checklist>
<validation>Confirm research covers at least 3 sources and addresses project-specific challenges.</validation>
<example>For API Gateway integration, research AWS API Gateway best practices, compare with alternatives like Lambda URLs, document findings with links.</example>
</phase_1_research>

<phase_2_planning>
<objective>Design solution aligned with researched best practices and TDD principles.</objective>
<checklist>
- Apply researched best practices to solution architecture
- Plan implementation with RED → GREEN → REFACTOR cycle
- Design comprehensive tests and validation criteria upfront
- Ensure alignment with project patterns (Result validation, cascading AI)
- Identify dependencies and integration points
- Document design decisions with rationale
</checklist>
<validation>Verify design includes test plans and addresses all research findings.</validation>
<example>For new feature, create test stubs first (RED), then implement minimal code (GREEN), refactor for patterns.</example>
</phase_2_planning>

<phase_3_implementation>
<objective>Code incrementally with continuous adherence checking.</objective>
<checklist>
- Implement code in small increments with immediate testing
- Run tests/lints after each substantive change (green-before-done)
- Critically analyze code against best practices during development
- Document deviations or challenges encountered
- Use project patterns (custom Result, environment defaults)
- Validate integration points (AWS SDK, OpenRouter)
</checklist>
<validation>All tests pass, lint clean, coverage ≥80%, no broken builds.</validation>
<example>After adding code, run npm test and npm run lint immediately; if failures, iterate before proceeding.</example>
</phase_3_implementation>

<phase_4_validation>
<objective>Comprehensive testing and validation against requirements.</objective>
<checklist>
- Perform unit, integration, and E2E testing
- Validate against original requirements and research findings
- Check security, performance, and maintainability
- Test edge cases and error handling
- Verify cost optimization and scalability
- Document test results and coverage metrics
</checklist>
<validation>All tests pass, E2E scenarios work, no regressions.</validation>
<example>Run full test suite, check CloudWatch logs for Lambda functions, validate UI functionality.</example>
</phase_4_validation>

<phase_5_evaluation>
<objective>Assess workflow and implementation optimality.</objective>
<checklist>
- Evaluate each workflow step for optimality
- Compare implementation against researched best practices
- Identify suboptimal areas with root cause analysis
- Quantify metrics (test coverage, performance, time spent)
- Document findings with specific improvement suggestions
- Review adherence to workflow phases
</checklist>
<validation>Complete assessment with actionable insights.</validation>
<example>If research took too long, note for future efficiency; if tests failed initially, analyze why.</example>
</phase_5_evaluation>

<phase_6_evolution>
<objective>Research and implement workflow/process improvements.</objective>
<checklist>
- Research solutions for identified suboptimal steps
- Update workflow patterns, tools, or processes
- Document improvements in LESSONS_LEARNED.md
- Evolve project conventions to prevent future issues
- Test improved processes in next iteration
- Share learnings with team/context
</checklist>
<validation>Improvements documented and ready for next iteration.</validation>
<example>If adherence was low, add reminders or restructure prompts; update this document if needed.</example>
</phase_6_evolution>

This workflow ensures continuous learning and optimization, with each iteration building on the last through research-backed improvements. Adherence is enforced through checklists, validation, and reinforcement via examples and logging.
</iterative_workflow>

<workflow_integration>
- AWS Setup: cd infrastructure && ./aws-setup.sh (creates S3, DynamoDB, IAM, etc.)
- Test: npm test (Jest with 80% coverage threshold, excludes index.js barrel files)
- Lint: npm run lint (ESLint on src/**/*.js)
- Format: npm run format (Prettier on src/**/*.js)
- Start Server: npm start (Express on port 3000, serves static from public/)
- Lambda Deploy: cd lambda && npm run build && npm run package && npm run deploy (TypeScript compile, ZIP creation, AWS upload)
- E2E: Playwright tests against localhost:3000
</workflow_integration>

<project_patterns>
- Validation: Use custom Result class (ok/fail); entities have static create() methods with validation
  <example>
  static create(props) {
    if (props.price <= 0) return Result.fail('Price must be positive');
    return Result.ok(new Property(props));
  }
  </example>
- AI Fallbacks: CascadingService tries models in order (primary → fallback) for reliability
- Environment: Lambdas use process.env.TABLE_NAME || 'default-dev' pattern for local/AWS compatibility
  <example>const TABLE_NAME = process.env.METRICS_TABLE || 'home-harbor-market-metrics-dev';</example>
- Testing: Nested describe blocks mirroring code structure; focus on business logic over mocks
- Imports: Relative paths within modules; absolute paths for cross-module (e.g., require('../../../server/config'))
- Error Handling: Validate config on initialization; throw descriptive errors for missing env vars
  <example>validateConfig();</example>
</project_patterns>

<key_files>
- src/property-search/Property.js: Entity with Result-based validation (address, price > 0, bedrooms/bathrooms >= 0)
- src/ai-assistant/chatAssistant.js: Orchestrates OpenRouter client, model selector, cascading service
- lambda/src/redfin-ingestion.ts: AWS SDK v3, axios for HTTP, csv-parse for data; batches DynamoDB writes
- src/server/routes/propertiesRoutes.js: REST endpoints with query params for search/filter
- public/index.html: Inline JS/CSS, fetches from optional API or uses embedded CT sample data
</key_files>

<integration_points>
- AWS SDK: v3 clients initialized once at module level
  <example>const s3Client = new S3Client({});</example>
- OpenRouter: Free-tier AI API with model-specific prompts (vision vs text)
- Data Sources: Legal only (Redfin public S3, CT government API, Google Street View free tier)
- Caching: DynamoDB TTL (30-90 days) for AI results; S3 for images with CloudFront CDN
</integration_points>

<development_standards>
- Versioning: Use semantic versioning (MAJOR.MINOR.PATCH); update CHANGELOG.md with unreleased section
- Code Commenting: Add JSDoc comments for all public functions/methods; semantic tags (@fileoverview, @intent, @example)
- Development Logging: Document all decisions in LESSONS_LEARNED.md; update TODO.md with progress; maintain CHANGELOG.md
- Full-Stack E2E Testing: Implement Playwright for UI; Jest for backend; ensure 80%+ coverage; test edge cases
- Debugging & Error Handling: Use try-catch with descriptive messages; validate inputs; log errors to CloudWatch
- File Size: Maintain all files ≤100 lines; refactor if exceeded
- Organization: Clean architecture; relative imports within modules; absolute for cross-module; no circular dependencies
- Git Habits: Frequent commits with conventional messages (feat:, fix:, docs:); use feature branches; descriptive PRs
- Simplicity & Low Code: Use free tiers (AWS, OpenRouter); CDN for styling (Tailwind); avoid unnecessary dependencies
- Tech Stack Optimization: Serverless AWS (Lambda, DynamoDB, S3); Node.js/TypeScript; AI integration (OpenRouter); ethical data practices
</development_standards>

Focus on serverless scalability, cost optimization ($1.50/month), and ethical data practices.</content>
<parameter name="filePath">/mnt/chromeos/removable/SSD Drive/usb_backup_2026-02-02/repos/home-harbor/.github/copilot-instructions.md