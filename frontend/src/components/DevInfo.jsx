/**
 * @fileoverview Enhanced Developer Information Component
 * @description Comprehensive developer guide with architecture, tech stack,
 * testing, costs, and coding paradigms. Mirrors UserGuide formatting.
 */

import React from 'react';

/**
 * Inline SVG icon components for visual consistency
 */
const Icons = {
  Architecture: () => (
    <svg className="w-5 h-5 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
    </svg>
  ),
  Stack: () => (
    <svg className="w-5 h-5 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  Testing: () => (
    <svg className="w-5 h-5 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Dollar: () => (
    <svg className="w-5 h-5 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  Code: () => (
    <svg className="w-5 h-5 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  ),
  Palette: () => (
    <svg className="w-5 h-5 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4c3 0 5.6-2.5 5.6-5.6C22 6.2 17.5 2 12 2z" />
      <circle cx="6.5" cy="11.5" r="1.5" fill="currentColor" />
      <circle cx="9.5" cy="7.5" r="1.5" fill="currentColor" />
      <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor" />
      <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor" />
    </svg>
  ),
  Folder: () => (
    <svg className="w-5 h-5 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" />
    </svg>
  ),
  Github: () => (
    <svg className="w-5 h-5 inline-block mr-1" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  LinkedIn: () => (
    <svg className="w-5 h-5 inline-block mr-1" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
};

/**
 * Tech badge component for visual tech stack display
 */
function TechBadge({ name, color = 'slate' }) {
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${colors[color]} mr-1 mb-1`}>
      {name}
    </span>
  );
}

/**
 * Cost badge showing $0.00 for free services
 */
function FreeBadge() {
  return (
    <span className="inline-block px-2 py-0.5 text-xs font-bold rounded bg-green-100 text-green-700 border border-green-200">
      $0.00
    </span>
  );
}

function DevInfo() {
  return (
    <div className="max-h-[60vh] overflow-y-auto">
      <h3 className="text-lg font-semibold text-slate-800">Developer Guide</h3>
      <p className="text-slate-600 mb-4">
        HomeHarbor is a production-ready, serverless real estate platform built with modern best practices.
        <span className="block mt-1 text-emerald-600 font-medium">Total Monthly Cost: $0.00 (100% Free Tier)</span>
      </p>

      {/* Architecture Overview */}
      <details className="mb-4" open>
        <summary className="font-medium text-slate-700 cursor-pointer hover:text-emerald-600">
          <Icons.Architecture /> Architecture Overview
        </summary>
        <div className="mt-2 ml-4 text-slate-600">
          <p className="mb-2">AI-First Split View with serverless backend:</p>
          <div className="bg-slate-50 rounded-lg p-3 font-mono text-xs mb-2 overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────┐
│        GitHub Pages (Frontend)          │
│  React + Vite + Tailwind CSS            │
├─────────────────────────────────────────┤
│         AWS API Gateway                 │
├─────────────────────────────────────────┤
│  Lambda Functions (TypeScript)          │
│  ├─ properties-socrata (Socrata API)    │
│  ├─ ai-chat (OpenRouter)                │
│  ├─ redfin-ingestion (S3 ETL)           │
│  ├─ street-view-fetch (Google)          │
│  └─ ai-vision-analysis (Molmo 72B)      │
├─────────────────────────────────────────┤
│  CT Open Data Portal (211K+ records)    │
│  OpenRouter AI (Free LLMs)              │
│  Google Street View (Free Tier)         │
└─────────────────────────────────────────┘`}</pre>
          </div>
          <ul className="list-disc ml-4">
            <li><strong>Frontend:</strong> Static SPA on GitHub Pages</li>
            <li><strong>API:</strong> AWS Lambda + API Gateway (serverless)</li>
            <li><strong>Data:</strong> Real-time Socrata API queries</li>
            <li><strong>AI:</strong> OpenRouter with cascading model fallbacks</li>
          </ul>
        </div>
      </details>

      {/* Full Tech Stack */}
      <details className="mb-4" open>
        <summary className="font-medium text-slate-700 cursor-pointer hover:text-emerald-600">
          <Icons.Stack /> Full Tech Stack
        </summary>
        <div className="mt-2 ml-4 text-slate-600">
          <div className="mb-3">
            <p className="font-medium text-sm mb-1">Frontend</p>
            <TechBadge name="React 18" color="cyan" />
            <TechBadge name="Vite 5" color="purple" />
            <TechBadge name="Tailwind CSS 3" color="cyan" />
            <TechBadge name="JavaScript ES6+" color="amber" />
          </div>
          <div className="mb-3">
            <p className="font-medium text-sm mb-1">Backend (Serverless)</p>
            <TechBadge name="AWS Lambda" color="orange" />
            <TechBadge name="TypeScript 5" color="blue" />
            <TechBadge name="API Gateway" color="orange" />
            <TechBadge name="Node.js 20" color="emerald" />
          </div>
          <div className="mb-3">
            <p className="font-medium text-sm mb-1">Data & Storage</p>
            <TechBadge name="Socrata API" color="blue" />
            <TechBadge name="DynamoDB" color="orange" />
            <TechBadge name="S3" color="orange" />
            <TechBadge name="CloudFront CDN" color="orange" />
          </div>
          <div className="mb-3">
            <p className="font-medium text-sm mb-1">AI & ML</p>
            <TechBadge name="OpenRouter API" color="purple" />
            <TechBadge name="Llama 3.3 70B" color="purple" />
            <TechBadge name="Molmo 72B Vision" color="purple" />
          </div>
          <div className="mb-3">
            <p className="font-medium text-sm mb-1">DevOps & CI/CD</p>
            <TechBadge name="GitHub Actions" color="slate" />
            <TechBadge name="GitHub Pages" color="slate" />
            <TechBadge name="AWS SAM" color="orange" />
          </div>
        </div>
      </details>

      {/* Testing Technologies */}
      <details className="mb-4">
        <summary className="font-medium text-slate-700 cursor-pointer hover:text-emerald-600">
          <Icons.Testing /> Testing Stack (54 Tests)
        </summary>
        <div className="mt-2 ml-4 text-slate-600">
          <div className="mb-3">
            <p className="font-medium text-sm mb-1">Unit & Integration</p>
            <TechBadge name="Jest" color="emerald" />
            <TechBadge name="Vitest" color="emerald" />
            <TechBadge name="React Testing Library" color="cyan" />
          </div>
          <div className="mb-3">
            <p className="font-medium text-sm mb-1">End-to-End</p>
            <TechBadge name="Playwright" color="emerald" />
            <TechBadge name="Production UAT" color="blue" />
          </div>
          <ul className="list-disc ml-4 mt-2">
            <li><code className="text-xs bg-slate-100 px-1 rounded">npm test</code> — Jest unit tests with coverage</li>
            <li><code className="text-xs bg-slate-100 px-1 rounded">npm run test:e2e</code> — Playwright E2E (local)</li>
            <li><code className="text-xs bg-slate-100 px-1 rounded">npm run test:uat</code> — Production UAT (GitHub Pages)</li>
            <li><code className="text-xs bg-slate-100 px-1 rounded">npm run test:uat:headed</code> — UAT with visible browser</li>
          </ul>
        </div>
      </details>

      {/* Cost Breakdown */}
      <details className="mb-4">
        <summary className="font-medium text-slate-700 cursor-pointer hover:text-emerald-600">
          <Icons.Dollar /> Cost Breakdown (All Free)
        </summary>
        <div className="mt-2 ml-4 text-slate-600">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1">Service</th>
                <th className="text-left py-1">Usage</th>
                <th className="text-right py-1">Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-1">AWS Lambda</td>
                <td className="py-1">1M requests/mo free</td>
                <td className="text-right"><FreeBadge /></td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1">DynamoDB</td>
                <td className="py-1">25GB free tier</td>
                <td className="text-right"><FreeBadge /></td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1">S3 + CloudFront</td>
                <td className="py-1">5GB + 1TB transfer</td>
                <td className="text-right"><FreeBadge /></td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1">GitHub Pages</td>
                <td className="py-1">Unlimited</td>
                <td className="text-right"><FreeBadge /></td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1">OpenRouter AI</td>
                <td className="py-1">Free models</td>
                <td className="text-right"><FreeBadge /></td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1">CT Open Data</td>
                <td className="py-1">Public API</td>
                <td className="text-right"><FreeBadge /></td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1">Google Street View</td>
                <td className="py-1">$200/mo credit</td>
                <td className="text-right"><FreeBadge /></td>
              </tr>
              <tr className="font-bold">
                <td className="py-2" colSpan="2">Total Monthly Cost</td>
                <td className="text-right text-emerald-600">$0.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>

      {/* Coding Paradigms */}
      <details className="mb-4">
        <summary className="font-medium text-slate-700 cursor-pointer hover:text-emerald-600">
          <Icons.Code /> Coding Paradigms
        </summary>
        <div className="mt-2 ml-4 text-slate-600">
          <ul className="list-disc ml-4">
            <li><strong>Clean Architecture:</strong> Separation of concerns (entities, services, handlers)</li>
            <li><strong>Functional Components:</strong> React hooks for state management</li>
            <li><strong>Result Pattern:</strong> Custom <code className="text-xs bg-slate-100 px-1 rounded">Result</code> class for validation (ok/fail)</li>
            <li><strong>Cascading Fallbacks:</strong> AI models try primary → fallback on failure</li>
            <li><strong>TDD:</strong> Tests written before/alongside implementation</li>
            <li><strong>DRY:</strong> Shared utilities, no duplicate code</li>
            <li><strong>KISS:</strong> Prefer libraries over custom implementations</li>
          </ul>
          <div className="mt-2 bg-slate-50 rounded p-2 text-xs">
            <strong>File Size Rule:</strong> Max 100 lines per file. Enforced by ESLint.
          </div>
        </div>
      </details>

      {/* UI/UX Styling */}
      <details className="mb-4">
        <summary className="font-medium text-slate-700 cursor-pointer hover:text-emerald-600">
          <Icons.Palette /> UI/UX Design Choices
        </summary>
        <div className="mt-2 ml-4 text-slate-600">
          <ul className="list-disc ml-4">
            <li><strong>AI-First Layout:</strong> Chat prominently positioned for discovery</li>
            <li><strong>Split View:</strong> Chat + Results side-by-side on desktop</li>
            <li><strong>Tailwind CSS:</strong> Utility-first, no custom CSS files</li>
            <li><strong>Color System:</strong> Emerald primary, Slate neutrals</li>
            <li><strong>Typography:</strong> Inter font family (Google Fonts)</li>
            <li><strong>Responsive:</strong> Mobile-first, stacks vertically on small screens</li>
            <li><strong>Collapsible Sections:</strong> Progressive disclosure with <code className="text-xs bg-slate-100 px-1 rounded">&lt;details&gt;</code></li>
            <li><strong>Accessibility:</strong> ARIA labels, keyboard navigation, focus states</li>
          </ul>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="inline-block w-6 h-6 rounded bg-emerald-500" title="Primary" />
            <span className="inline-block w-6 h-6 rounded bg-emerald-600" title="Primary Dark" />
            <span className="inline-block w-6 h-6 rounded bg-slate-100" title="Background" />
            <span className="inline-block w-6 h-6 rounded bg-slate-500" title="Text Muted" />
            <span className="inline-block w-6 h-6 rounded bg-slate-800" title="Text Primary" />
            <span className="inline-block w-6 h-6 rounded bg-blue-500" title="Accent" />
          </div>
        </div>
      </details>

      {/* Project Structure */}
      <details className="mb-4">
        <summary className="font-medium text-slate-700 cursor-pointer hover:text-emerald-600">
          <Icons.Folder /> Project Structure
        </summary>
        <div className="mt-2 ml-4 text-slate-600">
          <div className="bg-slate-50 rounded-lg p-3 font-mono text-xs overflow-x-auto">
            <pre>{`home-harbor/
├── frontend/           # React SPA (Vite)
│   ├── src/
│   │   ├── components/ # 31 React components
│   │   ├── hooks/      # Custom React hooks
│   │   └── services/   # API & AI services
│   └── public/         # Static assets
├── lambda/             # AWS Lambda functions
│   └── src/            # TypeScript handlers
├── src/                # Express API (optional)
│   ├── ai-assistant/   # OpenRouter integration
│   └── property-search/# Domain entities
├── tests/              # Test suites
│   └── e2e/            # Playwright tests
├── docs/               # Documentation
└── infrastructure/     # AWS setup scripts`}</pre>
          </div>
        </div>
      </details>

      {/* Source Code */}
      <details className="mb-4">
        <summary className="font-medium text-slate-700 cursor-pointer hover:text-emerald-600">
          <Icons.Github /> Source Code & Links
        </summary>
        <div className="mt-2 ml-4 text-slate-600">
          <ul className="list-disc ml-4">
            <li>
              <strong>GitHub Repository:</strong>{' '}
              <a href="https://github.com/chf3198/home-harbor" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                github.com/chf3198/home-harbor
              </a>
            </li>
            <li>
              <strong>Live Demo:</strong>{' '}
              <a href="https://chf3198.github.io/home-harbor/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                chf3198.github.io/home-harbor
              </a>
            </li>
            <li>
              <strong>LinkedIn:</strong>{' '}
              <a href="https://www.linkedin.com/in/colonelcu/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                linkedin.com/in/colonelcu
              </a>
            </li>
            <li><strong>License:</strong> MIT</li>
            <li><strong>Author:</strong> Curtis Franks</li>
          </ul>
        </div>
      </details>
    </div>
  );
}

export default DevInfo;