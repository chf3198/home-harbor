/**
 * @fileoverview Global setup for Playwright E2E tests
 * Builds React frontend and starts mock API server before tests run
 */

const { spawn, execSync } = require('child_process');
const path = require('path');

module.exports = async () => {
  const projectRoot = path.join(__dirname, '..', '..');
  const frontendPath = path.join(projectRoot, 'frontend');

  // Build React frontend for E2E tests
  console.log('Building React frontend for E2E tests...');
  try {
    execSync('node ./node_modules/vite/bin/vite.js build', {
      cwd: frontendPath,
      stdio: 'inherit'
    });
    console.log('React frontend built successfully');
  } catch (error) {
    console.error('Failed to build frontend:', error.message);
    // Continue anyway - tests might work with existing build
  }

  // Start the mock server
  const server = spawn('node', ['tests/e2e/mock-server.js'], {
    cwd: projectRoot,
    stdio: 'inherit',
    detached: false
  });

  // Wait for server to start
  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });

  // Store server process for cleanup
  global.__MOCK_SERVER__ = server;

  console.log('Mock API server started for E2E tests');
};