/**
 * @fileoverview Global teardown for Playwright E2E tests
 * Stops mock API server after tests complete
 */

module.exports = async () => {
  if (global.__MOCK_SERVER__) {
    global.__MOCK_SERVER__.kill();
    console.log('Mock API server stopped');
  }
};