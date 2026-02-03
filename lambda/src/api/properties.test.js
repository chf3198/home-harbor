/**
 * @fileoverview Properties API Handler Tests
 * @description Unit tests for /properties endpoint
 */

const { handler } = require('../api/properties');

describe('Properties API Handler', () => {
  it('should return properties with CORS headers', async () => {
    const event = {
      httpMethod: 'GET',
      headers: {},
      queryStringParameters: null,
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(result.headers['Content-Type']).toBe('application/json');
    expect(() => JSON.parse(result.body)).not.toThrow();
  });

  it('should handle errors gracefully', async () => {
    // Mock an error scenario
    const event = {
      httpMethod: 'GET',
      headers: {},
      queryStringParameters: null,
    };

    // Force an error by mocking
    const originalEnv = process.env;
    process.env.PROPERTIES_TABLE = 'non-existent-table';

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(result.body).toContain('error');

    process.env = originalEnv;
  });
});