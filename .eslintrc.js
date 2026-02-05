module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Enforce ≤100 lines per file (project best practice)
    // Warns on violations; skip blank lines and comments for practical counting
    'max-lines': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],
    // Allow unused vars in destructuring and rest siblings
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      // Test files use Jest globals
      files: ['**/*.test.js', '**/*.spec.js', '**/*.integration.test.js'],
      env: {
        jest: true,
      },
    },
  ],
  ignorePatterns: ['node_modules/', 'lambda/', 'tests/', 'frontend/'],
};