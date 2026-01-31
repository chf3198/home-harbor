module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'max-lines': ['error', { max: 100, skipBlankLines: true, skipComments: true }],
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
};
