/**
 * @fileoverview Help guide content for HomeHarbor
 * @description Defines structured content for User and Developer help guides.
 * Uses icon/heading/summary/details pattern for progressive disclosure rendering.
 */

window.HOME_HARBOR_HELP = {
  user: {
    title: 'User Guide',
    sections: [
      {
        icon: '🚀',
        heading: 'Getting Started',
        summary: 'Learn the basics of searching for Connecticut properties.',
        details: [
          '<strong>Search properties</strong> — Use filters to narrow by city, price range, and property type. Click "Search" to refresh results.',
          '<strong>City autocomplete</strong> — The City field suggests Connecticut locations from the dataset. Start typing and choose a suggestion.',
        ],
      },
      {
        icon: '🏠',
        heading: 'Viewing Results',
        summary: 'Browse property listings with detailed information.',
        details: [
          '<strong>Review results</strong> — Each card shows price, city, and property type. Click "View details" to reveal sale date and metadata.',
          '<strong>Official listing links</strong> — Listing cards include Realtor.com link-outs for official details. HomeHarbor is not affiliated with Realtor.com.',
        ],
      },
      {
        icon: '🤖',
        heading: 'AI Features',
        summary: 'Leverage AI for property insights and market analysis.',
        details: [
          '<strong>AI insights</strong> — Use "Analyze photo" to get vision insights and "Generate description" for an AI summary (requires API keys).',
          '<strong>Ask HomeHarbor</strong> — Ask questions about the market or search strategies in the chat panel.',
        ],
      },
    ],
  },
  developer: {
    title: 'Developer Guide (Recruiter Focus)',
    sections: [
      {
        icon: '🏗️',
        heading: 'Architecture Overview',
        summary:
          'Staff-level serverless architecture demonstrating AWS expertise.',
        details: [
          '<strong>Serverless pipeline</strong> — AWS Lambda, DynamoDB, S3, CloudFront, EventBridge, and Secrets Manager. Data ingestion is decoupled from API delivery with cache-aware AI workflows.',
          '<strong>Local demo vs. production</strong> — The UI is a static HTML entry point. In production it calls API Gateway endpoints; locally it can use the Express demo server.',
        ],
      },
      {
        icon: '📊',
        heading: 'Data & Compliance',
        summary: 'Legal public data sources with ethical practices.',
        details: [
          '<strong>Data sourcing</strong> — Uses legal public datasets (Redfin Data Center + CT Open Data) and Google Street View for imagery. No scraping or ToS violations.',
          '<strong>Realtor.com link-outs</strong> — Listing cards link to public Realtor.com results pages. HomeHarbor does not reuse Realtor.com data or imply affiliation.',
        ],
      },
      {
        icon: '🧠',
        heading: 'AI Integration',
        summary: 'OpenRouter-powered AI with cascading model fallbacks.',
        details: [
          '<strong>Model orchestration</strong> — OpenRouter routes to Molmo 72B for vision analysis and Llama 3.3 70B for descriptions. Outputs cached in DynamoDB with TTL for cost optimization.',
        ],
      },
      {
        icon: '🧪',
        heading: 'Full-Stack E2E Testing',
        summary: 'Comprehensive Playwright testing with cross-browser coverage.',
        details: [
          '<strong>Testing architecture</strong> — Playwright-based E2E tests run against a mock server (port 3001) to validate complete user workflows without external dependencies. Tests execute across Chromium, Firefox, and WebKit browsers.',
          '<strong>Mock server design</strong> — Express-based mock API server provides realistic test data, property search endpoints, and AI chat responses—enabling isolated, deterministic testing.',
          '<strong>CI/CD integration</strong> — GitHub Actions workflow installs Playwright with dependencies, builds the frontend, and runs 75+ E2E tests. Artifacts (traces, screenshots, videos) are captured on failure for debugging.',
          '<strong>Test categories</strong> — Three suites: Accessibility (WCAG compliance, keyboard navigation), AI Assistant (chat workflows), and Property Search (search filters, results display, responsive design).',
        ],
      },
      {
        icon: '✅',
        heading: 'Quality Practices',
        summary: 'TDD-first development with comprehensive documentation.',
        details: [
          '<strong>Engineering standards</strong> — TDD-first property search module, lint rules for &lt;100-line files, and detailed documentation for onboarding and deployment.',
          '<strong>What to review</strong> — See QUICKSTART.md, IMPLEMENTATION_SUMMARY.md, docs/DATA_SOURCES.md, and the Lambda functions in lambda/src/.',
        ],
      },
    ],
  },
};
