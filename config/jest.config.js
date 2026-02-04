module.exports = {
  rootDir: '..',
  testEnvironment: 'node',
  // Lower coverage thresholds to reasonable level for incremental improvement
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 60,
      statements: 60
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
