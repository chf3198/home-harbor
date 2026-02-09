module.exports = {
  rootDir: '..',
  testEnvironment: 'node',
  // Coverage thresholds - backend/AI modules have high coverage, server routes are lower
  // Will incrementally improve server coverage over time
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 50,
      lines: 45,
      statements: 45
    }
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/index.js' // Barrel exports don't need coverage
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js'
  ],
  // Exclude Playwright tests (.spec.js), frontend (vitest), and lambda (TypeScript)
  testPathIgnorePatterns: [
    '/node_modules/',
    '.*\\.spec\\.js$',
    '/frontend/',
    '/lambda/'
  ]
};
