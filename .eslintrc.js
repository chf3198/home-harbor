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
    // max-lines disabled - aspirational guideline in docs, not enforced
    'max-lines': 'off',
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