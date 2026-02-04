module.exports = {
  rootDir: '..',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
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
  // Exclude Playwright tests (use .spec.js naming convention)
  testPathIgnorePatterns: [
    '/node_modules/',
    '.*\\.spec\\.js$'
  ]
};
