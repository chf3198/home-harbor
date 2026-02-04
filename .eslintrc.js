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
    'max-lines': ['error', { max: 100 }],
  },
  overrides: [
    {
      // Test files can be longer and use Jest globals
      files: ['**/*.test.js', '**/*.spec.js', '**/*.integration.test.js'],
      env: {
        jest: true,
      },
      rules: {
        'max-lines': 'off',
      },
    },
  ],
  ignorePatterns: ['node_modules/', 'lambda/', 'tests/', 'frontend/'],
};