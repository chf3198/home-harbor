
/**
 * Configuration for OpenRouter AI assistant
 */

const { ConfigurationError } = require('./errors');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_BACKOFF_MS = 1000; // Start with 1 second, double each retry

// Validate required configuration
function validateConfig() {
  if (!OPENROUTER_API_KEY) {
    throw new ConfigurationError(
      'OPENROUTER_API_KEY environment variable is required. ' +
      'Get your key at https://openrouter.ai/keys'
    );
  }
}

// Application identification headers (optional, for rankings)
const APP_HEADERS = {
  'HTTP-Referer': process.env.APP_URL || 'https://github.com/chf3198/home-harbor',
  'X-Title': process.env.APP_NAME || 'HomeHarbor Real Estate Search'
};

module.exports = {
  OPENROUTER_API_KEY,
  OPENROUTER_BASE_URL,
  DEFAULT_TIMEOUT,
  MAX_RETRIES,
  RETRY_BACKOFF_MS,
  APP_HEADERS,
  validateConfig,
};
