#!/usr/bin/env node

/**
 * @fileoverview E2E Test Runner Script
 * Starts mock server and React app, then runs Playwright tests
 */

const { spawn } = require('child_process');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');

console.log('🚀 Starting HomeHarbor E2E Test Suite...\n');

// Start mock API server
console.log('📡 Starting mock API server...');
const mockServer = spawn('node', ['tests/e2e/mock-server.js'], {
  cwd: ROOT_DIR,
  stdio: 'inherit',
  detached: false
});

// Wait for mock server to start
setTimeout(() => {
  console.log('⚛️  Starting React development server...');

  // Start React app
  const reactApp = spawn('npm', ['run', 'dev'], {
    cwd: FRONTEND_DIR,
    stdio: 'inherit',
    detached: false
  });

  // Wait for React app to start
  setTimeout(() => {
    console.log('🧪 Running Playwright E2E tests...\n');

    // Run Playwright tests
    const playwright = spawn('npx', ['playwright', 'test'], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      detached: false
    });

    playwright.on('close', (code) => {
      console.log(`\n✅ Playwright tests completed with exit code: ${code}`);

      // Cleanup: kill servers
      console.log('🧹 Cleaning up servers...');
      mockServer.kill('SIGTERM');
      reactApp.kill('SIGTERM');

      process.exit(code);
    });

    playwright.on('error', (error) => {
      console.error('❌ Failed to run Playwright tests:', error);
      mockServer.kill('SIGTERM');
      reactApp.kill('SIGTERM');
      process.exit(1);
    });

  }, 3000); // Wait 3 seconds for React app

}, 2000); // Wait 2 seconds for mock server

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️  Received SIGINT, cleaning up...');
  mockServer.kill('SIGTERM');
  reactApp.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Received SIGTERM, cleaning up...');
  mockServer.kill('SIGTERM');
  reactApp.kill('SIGTERM');
  process.exit(0);
});