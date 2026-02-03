/**
 * @fileoverview Global setup for Playwright E2E tests
 * Starts mock API server before tests run
 */

const { spawn } = require('child_process');

module.exports = async () => {
  // Start the mock server
  const server = spawn('node', ['tests/e2e/mock-server.js'], {
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