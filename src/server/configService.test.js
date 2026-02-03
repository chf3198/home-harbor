const { getConfig } = require('./configService');

describe('configService', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test('returns missing keys when unset', () => {
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.GOOGLE_MAPS_API_KEY;

    const config = getConfig();

    expect(config.aiReady).toBe(false);
    expect(config.missingKeys).toEqual(
      expect.arrayContaining(['OPENROUTER_API_KEY', 'GOOGLE_MAPS_API_KEY'])
    );
  });

  test('aiReady is true when required keys set', () => {
    process.env.OPENROUTER_API_KEY = 'test-key';
    process.env.GOOGLE_MAPS_API_KEY = 'test-key';

    const config = getConfig();

    expect(config.aiReady).toBe(true);
    expect(config.missingKeys).toEqual([]);
  });
});
