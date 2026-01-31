
const { ConfigurationError } = require('./errors');

describe('AI Assistant Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to get fresh config
    jest.resetModules();
    // Restore original env
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('validateConfig', () => {
    it('should throw if OPENROUTER_API_KEY is missing', () => {
      delete process.env.OPENROUTER_API_KEY;
      const { validateConfig } = require('./config');

      expect(() => validateConfig()).toThrow(ConfigurationError);
      expect(() => validateConfig()).toThrow(/OPENROUTER_API_KEY.*required/);
    });

    it('should not throw if OPENROUTER_API_KEY is present', () => {
      process.env.OPENROUTER_API_KEY = 'sk-or-v1-test-key';
      const { validateConfig } = require('./config');

      expect(() => validateConfig()).not.toThrow();
    });
  });

  describe('default values', () => {
    beforeEach(() => {
      process.env.OPENROUTER_API_KEY = 'test-key';
    });

    it('should export correct base URL', () => {
      const { OPENROUTER_BASE_URL } = require('./config');
      expect(OPENROUTER_BASE_URL).toBe('https://openrouter.ai/api/v1');
    });

    it('should export default timeout', () => {
      const { DEFAULT_TIMEOUT } = require('./config');
      expect(DEFAULT_TIMEOUT).toBe(30000);
    });

    it('should export max retries', () => {
      const { MAX_RETRIES } = require('./config');
      expect(MAX_RETRIES).toBe(3);
    });

    it('should export default app headers', () => {
      const { APP_HEADERS } = require('./config');
      expect(APP_HEADERS).toEqual({
        'HTTP-Referer': 'https://github.com/chf3198/home-harbor',
        'X-Title': 'HomeHarbor Real Estate Search'
      });
    });
  });

  describe('environment overrides', () => {
    it('should use APP_URL from environment', () => {
      process.env.OPENROUTER_API_KEY = 'test-key';
      process.env.APP_URL = 'https://example.com';
      
      const { APP_HEADERS } = require('./config');
      expect(APP_HEADERS['HTTP-Referer']).toBe('https://example.com');
    });

    it('should use APP_NAME from environment', () => {
      process.env.OPENROUTER_API_KEY = 'test-key';
      process.env.APP_NAME = 'Custom App Name';
      
      const { APP_HEADERS } = require('./config');
      expect(APP_HEADERS['X-Title']).toBe('Custom App Name');
    });
  });
});
