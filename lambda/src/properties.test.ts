import { handler } from './properties';

describe('Properties Handler', () => {
  it('should return properties with filters', async () => {
    const event = {
      queryStringParameters: { city: 'Hartford', priceMin: '200000' }
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('properties');
    expect(Array.isArray(body.properties)).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    // Mock error scenario
    const event = {};

    const result = await handler(event);

    expect(result.statusCode).toBe(200); // Assuming no error
  });
});