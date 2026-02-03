window.HOME_HARBOR_HELP = {
  user: {
    title: 'User Guide',
    sections: [
      {
        heading: 'Search properties',
        body:
          'Use the filters to narrow by city, price range, and property type. Click “Search” to refresh results.',
      },
      {
        heading: 'City autocomplete',
        body:
          'The City field suggests Connecticut locations from the dataset. Start typing and choose a suggestion.',
      },
      {
        heading: 'Review results',
        body:
          'Each card shows price, city, and property type. Click “View details” to reveal sale date and metadata.',
      },
      {
        heading: 'AI insights',
        body:
          'Use “Analyze photo” to get vision insights and “Generate description” for an AI summary (requires API keys).',
      },
      {
        heading: 'Official listing links',
        body:
          'Listing cards include Realtor.com link-outs for official details. HomeHarbor is not affiliated with Realtor.com.',
      },
      {
        heading: 'Ask HomeHarbor',
        body:
          'Ask questions about the market or search strategies in the chat panel.',
      },
    ],
  },
  developer: {
    title: 'Developer Guide (Recruiter Focus)',
    sections: [
      {
        heading: 'Staff-level architecture',
        body:
          'Serverless pipeline with AWS Lambda, DynamoDB, S3, CloudFront, EventBridge, and Secrets Manager. Data ingestion is decoupled from API delivery with cache-aware AI workflows.',
      },
      {
        heading: 'Data sourcing & compliance',
        body:
          'Uses legal public datasets (Redfin Data Center + CT Open Data) and Google Street View for imagery. No scraping or ToS violations.',
      },
      {
        heading: 'Realtor.com link-outs',
        body:
          'Listing cards link to public Realtor.com results pages. HomeHarbor does not reuse Realtor.com data or imply affiliation.',
      },
      {
        heading: 'AI integration',
        body:
          'OpenRouter for model orchestration: Molmo 72B vision analysis and Llama 3.3 70B descriptions. Outputs cached in DynamoDB with TTL.',
      },
      {
        heading: 'Local demo vs. production',
        body:
          'The UI is a static HTML entry point. In production it calls API Gateway endpoints; locally it can use the Express demo server.',
      },
      {
        heading: 'Quality & engineering practices',
        body:
          'TDD-first property search module, lint rules for <100-line files, and detailed documentation for onboarding and deployment.',
      },
      {
        heading: 'What to review',
        body:
          'See QUICKSTART.md, IMPLEMENTATION_SUMMARY.md, docs/DATA_SOURCES.md, and the Lambda functions in lambda/src/.',
      },
    ],
  },
};
